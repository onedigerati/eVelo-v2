import { describe, expect, it } from 'vitest'
import type { Airport } from '../../../data/airports'
import { buildRouteTable, estimateHours, greatCircleKm, routeBetween, routeSentence, type RoutePlace, type Route } from '../gettingThere'

// A fixed table, so the expectations don't move when the real route data does.
const ap = (code: string, city: string, lat: number, lon: number, nonstops: string[] = []): Airport => ({ code, city, lat, lon, nonstops })
const FIX = buildRouteTable([
  ap('SAN', 'San Diego', 32.73, -117.19, ['NRT', 'LHR', 'JFK']),
  ap('JFK', 'New York', 40.64, -73.78, ['LHR', 'DOH']),
  ap('LHR', 'London', 51.47, -0.45, ['BKK', 'DOH']),
  ap('BKK', 'Bangkok', 13.69, 100.75, ['NRT', 'HKG']),
  // NRT lists nothing: SAN–NRT and BKK–NRT still count, from the other end.
  ap('NRT', 'Tokyo', 35.77, 140.39),
  ap('HKG', 'Hong Kong', 22.31, 113.91, ['SAN']),
  ap('DOH', 'Doha', 25.27, 51.61, ['FAO']),
  ap('FAO', 'Faro', 37.01, -7.97),
  ap('MLE', 'Malé', 4.19, 73.53),
  ap('ALC', 'Alicante', 38.28, -0.56, ['LHR']),
])
const place = (name: string, lat: number, lon: number, airport?: string): RoutePlace => ({ name, lat, lon, airport })
const SAN = place('San Diego', 32.72, -117.16, 'SAN')
const NYC = place('New York City', 40.71, -74.01, 'JFK')
const LON = place('London', 51.51, -0.13, 'LHR')
const BKK = place('Bangkok', 13.76, 100.5, 'BKK')
const FAO = place('Algarve', 37.02, -7.93, 'FAO')
const MLE = place('Malé', 4.17, 73.51, 'MLE')

describe('routeBetween', () => {
  it('needs no flight for a shared airport or a nearby city', () => {
    const torre = place('Torrevieja', 37.98, -0.68, 'ALC')
    const alic = place('Alicante', 38.35, -0.48, 'ALC')
    expect(routeBetween(torre, alic, FIX).kind).toBe('ground')
    // Different airports, but under 150 km apart.
    expect(routeBetween(place('Murcia', 37.99, -1.13, 'XXX'), alic, FIX)).toMatchObject({ kind: 'ground' })
  })

  it('finds a nonstop listed by either end', () => {
    expect(routeBetween(SAN, LON, FIX)).toMatchObject({ kind: 'nonstop', from: 'SAN', to: 'LHR' })
    expect(routeBetween(LON, SAN, FIX)).toMatchObject({ kind: 'nonstop', from: 'LHR', to: 'SAN' })
  })

  it('picks the one-stop hub with the shortest total distance, and names a close second', () => {
    // SAN → BKK: via HKG (HKG lists SAN), NRT or LHR. HKG is shortest, NRT within 10%, LHR far.
    const r = routeBetween(SAN, BKK, FIX)
    expect(r).toMatchObject({ kind: 'one-stop', via: ['HKG', 'NRT'] })
  })

  it('names one hub when the others are much longer', () => {
    // NYC → BKK: only via LHR.
    expect(routeBetween(NYC, BKK, FIX)).toMatchObject({ kind: 'one-stop', via: ['LHR'] })
  })

  it('falls back to two stops when no one-stop path exists', () => {
    // SAN → FAO: SAN–LHR–DOH–FAO or SAN–JFK–DOH–FAO; LHR is shorter.
    expect(routeBetween(SAN, FAO, FIX)).toMatchObject({ kind: 'two-stop', via: ['LHR', 'DOH'] })
  })

  it('says unknown when there is no airport or no path', () => {
    expect(routeBetween(SAN, MLE, FIX)).toEqual({ kind: 'unknown', from: 'SAN' })
    expect(routeBetween(place('Nowhere', 0, 0), BKK, FIX)).toEqual({ kind: 'unknown' })
    expect(routeBetween(SAN, place('Nowhere', 0, 0), FIX)).toEqual({ kind: 'unknown', from: 'SAN' })
  })
})

describe('estimateHours', () => {
  const real = buildRouteTable([
    ap('JFK', 'New York', 40.64, -73.78),
    ap('LHR', 'London', 51.47, -0.45),
    ap('SAN', 'San Diego', 32.73, -117.19),
    ap('NRT', 'Tokyo', 35.77, 140.39),
    ap('BKK', 'Bangkok', 13.69, 100.75),
  ]).airports
  const a = (c: string) => real.get(c)!

  it('JFK–LHR nonstop is within an hour of the typical 7–8 h', () => {
    const [lo, hi] = estimateHours([a('JFK'), a('LHR')])
    expect(lo).toBeGreaterThanOrEqual(6)
    expect(hi).toBeLessThanOrEqual(9)
  })

  it('SAN–BKK via Tokyo is within an hour of the typical 19–22 h', () => {
    const [lo, hi] = estimateHours([a('SAN'), a('NRT'), a('BKK')])
    expect(lo).toBeGreaterThanOrEqual(18)
    expect(hi).toBeLessThanOrEqual(23)
    expect(hi - lo).toBeCloseTo(1.5)
  })

  it('uses great-circle distance', () => {
    expect(greatCircleKm(a('JFK'), a('LHR'))).toBeGreaterThan(5500)
    expect(greatCircleKm(a('JFK'), a('LHR'))).toBeLessThan(5600)
  })
})

describe('routeSentence', () => {
  const say = (h: RoutePlace, d: RoutePlace) => routeSentence(h, d, routeBetween(h, d, FIX), FIX)

  it('writes every kind from the home city, with hub city names and no "US"', () => {
    const lines = [
      say(SAN, LON),
      say(SAN, BKK),
      say(SAN, FAO),
      say(SAN, MLE),
      say(place('Torrevieja', 37.98, -0.68, 'ALC'), place('Alicante', 38.35, -0.48, 'ALC')),
      say(place('Nowhere', 0, 0), BKK),
    ]
    expect(lines[0]).toMatch(/^From San Diego \(SAN\): nonstop to London \(LHR\), about \d+–\d+ h\.$/)
    expect(lines[1]).toMatch(/^From San Diego \(SAN\): no nonstop; one stop via Hong Kong or Tokyo, about \d+–\d+ h\.$/)
    expect(lines[2]).toMatch(/^From San Diego \(SAN\): two stops, for example via London and Doha, about \d+–\d+ h\.$/)
    expect(lines[3]).toBe('From San Diego (SAN): no route to Malé in our data yet.')
    expect(lines[4]).toMatch(/^From Torrevieja: no flight needed, \d+ km, (under an hour|about [\d.]+ h) by road\.$/)
    expect(lines[5]).toBe('From Nowhere: no airport in our route data yet.')
    for (const l of lines) expect(l).not.toMatch(/\bUS\b/)
  })

  it('shows an hour range at least one hour wide', () => {
    const r: Route = { kind: 'nonstop', from: 'JFK', to: 'LHR', hours: [7.2, 7.4] }
    expect(routeSentence(NYC, LON, r, FIX)).toContain('about 7–8 h')
  })
})
