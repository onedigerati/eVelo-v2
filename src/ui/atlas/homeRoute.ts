// The profile's "Getting there" line for the current home city (pure: no store, no DOM).

import { CITY_AIRPORT } from '../../data/airports'
import { CITY_BY_ID } from '../../data/cities'
import { routeBetween, routeSentence, type Route, type RoutePlace } from './gettingThere'

export interface HomeRoute {
  route: Route
  /** "From San Diego (SAN): no nonstop; one stop via Paris or Frankfurt, about 15–17 h." */
  sentence: string
}

/**
 * The trip from home to this city, or null when there's no line to show: no home, the profile is
 * home's own, either city is unknown or has no airport in the route data, or no route is found.
 */
export function homeRoute(
  homeCityId: string | null | undefined,
  cityId: string,
  airportOf: Record<string, string | undefined> = CITY_AIRPORT,
): HomeRoute | null {
  if (!homeCityId || homeCityId === cityId) return null
  const home = place(homeCityId, airportOf)
  const dest = place(cityId, airportOf)
  if (!home || !dest) return null
  const route = routeBetween(home, dest)
  if (route.kind === 'unknown') return null
  return { route, sentence: routeSentence(home, dest, route) }
}

function place(cityId: string, airportOf: Record<string, string | undefined>): RoutePlace | undefined {
  const c = CITY_BY_ID[cityId]
  const airport = airportOf[cityId]
  if (!c || !airport) return undefined
  return { name: c.name, lat: c.lat, lon: c.lon, airport }
}
