// Airports and nonstop routes for "Getting there" (src/ui/atlas/gettingThere.ts).
//
// The route graph is kept small on purpose: each Atlas city's main airport plus
// a set of world hubs. A route lists only nonstops to other airports in this
// file, and counts in both directions when either end lists it. Routes are
// scheduled nonstops as of AIRPORTS_AS_OF; no airline names (they go stale fastest).

export interface Airport {
  /** IATA code. */
  code: string
  /** City name used in sentences ("via Tokyo"). */
  city: string
  lat: number
  lon: number
  /** Nonstop destinations (IATA codes of other airports in this file). */
  nonstops: string[]
  /** Where the route list was checked. */
  source?: { name: string; url: string }
}

export const AIRPORTS_AS_OF = 'Nov 2026'

/** Pilot set for stage 1; stage 2 replaces it with sourced data for every city. */
export const AIRPORTS: Airport[] = [
  { code: 'SAN', city: 'San Diego', lat: 32.73, lon: -117.19, nonstops: ['NRT', 'LHR', 'JFK', 'DFW', 'SFO'] },
  { code: 'LAX', city: 'Los Angeles', lat: 33.94, lon: -118.41, nonstops: ['NRT', 'HKG', 'LHR', 'DOH', 'JFK', 'DFW', 'SFO'] },
  { code: 'SFO', city: 'San Francisco', lat: 37.62, lon: -122.38, nonstops: ['NRT', 'HKG', 'LHR', 'JFK'] },
  { code: 'DFW', city: 'Dallas', lat: 32.9, lon: -97.04, nonstops: ['NRT', 'LHR', 'DOH', 'JFK'] },
  { code: 'JFK', city: 'New York', lat: 40.64, lon: -73.78, nonstops: ['LHR', 'LIS', 'DOH', 'NRT', 'HKG'] },
  { code: 'LHR', city: 'London', lat: 51.47, lon: -0.45, nonstops: ['BKK', 'LIS', 'DOH', 'HKG', 'NRT'] },
  { code: 'LIS', city: 'Lisbon', lat: 38.77, lon: -9.13, nonstops: ['DOH'] },
  { code: 'BKK', city: 'Bangkok', lat: 13.69, lon: 100.75, nonstops: ['NRT', 'HKG', 'DOH'] },
  { code: 'NRT', city: 'Tokyo', lat: 35.77, lon: 140.39, nonstops: ['HKG'] },
  { code: 'HKG', city: 'Hong Kong', lat: 22.31, lon: 113.91, nonstops: [] },
  { code: 'DOH', city: 'Doha', lat: 25.27, lon: 51.61, nonstops: [] },
]

/** Each Atlas city's main airport (city id → IATA code). */
export const CITY_AIRPORT: Record<string, string> = {
  'san-diego': 'SAN',
  'los-angeles': 'LAX',
  'san-francisco': 'SFO',
  dallas: 'DFW',
  'new-york': 'JFK',
  london: 'LHR',
  lisbon: 'LIS',
  bangkok: 'BKK',
  tokyo: 'NRT',
}
