// "Getting there" from the home city (pure: no store, no DOM).
//
// Finds the trip from the home city's airport to the destination's over the
// route graph in src/data/airports.ts: no flight needed (same or nearby airport),
// nonstop, one stop via a shared hub, or two stops. Flying time is an estimate
// from great-circle distance, shown as a range.

import { AIRPORTS, CITY_AIRPORT, type Airport } from '../../data/airports'

export interface RoutePlace {
  /** City name shown in the sentence. */
  name: string
  lat: number
  lon: number
  /** IATA code of the city's main airport, if known. */
  airport?: string
}

export type Route =
  | { kind: 'ground'; km: number }
  | { kind: 'nonstop'; from: string; to: string; hours: [number, number] }
  | { kind: 'one-stop'; from: string; to: string; via: string[]; hours: [number, number] }
  | { kind: 'two-stop'; from: string; to: string; via: [string, string]; hours: [number, number] }
  | { kind: 'unknown'; from?: string }

export interface RouteTable {
  airports: Map<string, Airport>
  /** Symmetric adjacency: a route counts both ways when either end lists it. */
  links: Map<string, Set<string>>
}

/** Places closer than this need no flight. */
export const GROUND_KM = 150
/** Cruise speed for the estimate, km/h. */
const CRUISE_KMH = 800
/** Taxi, climb and descent per flight, hours. */
const PER_LEG_H = 0.5
/** Time on the ground per connection, hours (low, high). */
const CONNECTION_H: [number, number] = [1.5, 3]
/** A second hub is named when its trip is within this share of the best one. */
const ALT_HUB_SLACK = 0.1

export function buildRouteTable(airports: Airport[]): RouteTable {
  const map = new Map(airports.map((a) => [a.code, a]))
  const links = new Map<string, Set<string>>(airports.map((a) => [a.code, new Set<string>()]))
  for (const a of airports) {
    for (const b of a.nonstops) {
      if (b === a.code || !map.has(b)) continue
      links.get(a.code)!.add(b)
      links.get(b)!.add(a.code)
    }
  }
  return { airports: map, links }
}

let defaultTable: RouteTable | undefined
function table(): RouteTable {
  return (defaultTable ??= buildRouteTable(AIRPORTS))
}

/** The main airport of an Atlas city, if it has one in the route data. */
export function cityAirport(cityId: string): string | undefined {
  return CITY_AIRPORT[cityId]
}

export function greatCircleKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }): number {
  const rad = Math.PI / 180
  const dLat = (b.lat - a.lat) * rad
  const dLon = (b.lon - a.lon) * rad
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) ** 2
  return 2 * 6371 * Math.asin(Math.min(1, Math.sqrt(h)))
}

/** Estimated time for a trip over these airports, as a (low, high) range in hours. */
export function estimateHours(path: Airport[]): [number, number] {
  let fly = 0
  for (let i = 1; i < path.length; i++) fly += greatCircleKm(path[i - 1], path[i]) / CRUISE_KMH + PER_LEG_H
  const stops = Math.max(0, path.length - 2)
  if (stops === 0) return [fly, fly + 0.5]
  return [fly + stops * CONNECTION_H[0], fly + stops * CONNECTION_H[1]]
}

function pathKm(path: Airport[]): number {
  let km = 0
  for (let i = 1; i < path.length; i++) km += greatCircleKm(path[i - 1], path[i])
  return km
}

export function routeBetween(home: RoutePlace, dest: RoutePlace, t: RouteTable = table()): Route {
  const sameAirport = home.airport && home.airport === dest.airport
  const km = greatCircleKm(home, dest)
  if (sameAirport || km < GROUND_KM) return { kind: 'ground', km: Math.round(km) }

  const from = home.airport && t.airports.get(home.airport)
  const to = dest.airport && t.airports.get(dest.airport)
  if (!from) return { kind: 'unknown' }
  if (!to) return { kind: 'unknown', from: from.code }
  const out = t.links.get(from.code)!

  if (out.has(to.code)) return { kind: 'nonstop', from: from.code, to: to.code, hours: estimateHours([from, to]) }

  const into = t.links.get(to.code)!
  const one = [...out]
    .filter((x) => into.has(x))
    .map((x) => t.airports.get(x)!)
    .map((x) => ({ x, km: pathKm([from, x, to]) }))
    .sort((a, b) => a.km - b.km || a.x.code.localeCompare(b.x.code))
  if (one.length) {
    const best = one[0]
    const via = one.filter((o) => o.km <= best.km * (1 + ALT_HUB_SLACK)).slice(0, 2)
    return { kind: 'one-stop', from: from.code, to: to.code, via: via.map((o) => o.x.code), hours: estimateHours([from, best.x, to]) }
  }

  let bestTwo: { x: Airport; y: Airport; km: number } | undefined
  for (const xc of out) {
    const x = t.airports.get(xc)!
    for (const yc of t.links.get(xc)!) {
      if (yc === from.code || !into.has(yc)) continue
      const y = t.airports.get(yc)!
      const k = pathKm([from, x, y, to])
      if (!bestTwo || k < bestTwo.km) bestTwo = { x, y, km: k }
    }
  }
  if (bestTwo) {
    const { x, y } = bestTwo
    return { kind: 'two-stop', from: from.code, to: to.code, via: [x.code, y.code], hours: estimateHours([from, x, y, to]) }
  }
  return { kind: 'unknown', from: from.code }
}

function hoursText([lo, hi]: [number, number]): string {
  const a = Math.floor(lo)
  const b = Math.max(a + 1, Math.ceil(hi))
  return `about ${a}–${b} h`
}

function names(codes: string[], t: RouteTable): string {
  const n = codes.map((c) => t.airports.get(c)?.city ?? c)
  return n.length === 2 ? `${n[0]} or ${n[1]}` : n[0]
}

/** Drive time at a typical 70 km/h, to the half hour, at least half an hour. */
function driveText(km: number): string {
  const h = Math.max(0.5, Math.round((km / 70) * 2) / 2)
  return h < 1 ? 'under an hour' : `about ${h % 1 ? h.toFixed(1) : h} h`
}

/** The sentence for the profile: "From San Diego (SAN): no nonstop; one stop via Tokyo, about 19–21 h." */
export function routeSentence(home: RoutePlace, dest: RoutePlace, route: Route, t: RouteTable = table()): string {
  const fromLabel = route.kind !== 'ground' && route.kind !== 'unknown' ? `From ${home.name} (${route.from})` : `From ${home.name}`
  switch (route.kind) {
    case 'ground':
      return route.km < 10
        ? `From ${home.name}: no flight needed, it's the same area.`
        : `${fromLabel}: no flight needed, ${route.km} km, ${driveText(route.km * 1.25)} by road.`
    case 'nonstop':
      return `${fromLabel}: nonstop to ${dest.name} (${route.to}), ${hoursText(route.hours)}.`
    case 'one-stop':
      return `${fromLabel}: no nonstop; one stop via ${names(route.via, t)}, ${hoursText(route.hours)}.`
    case 'two-stop':
      return `${fromLabel}: two stops, for example via ${route.via.map((c) => t.airports.get(c)?.city ?? c).join(' and ')}, ${hoursText(route.hours)}.`
    case 'unknown':
      return route.from
        ? `From ${home.name} (${route.from}): no route to ${dest.name} in our data yet.`
        : `From ${home.name}: no airport in our route data yet.`
  }
}
