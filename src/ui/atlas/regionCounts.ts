/**
 * Region chips, shared by the map and the city list, and the list's per-region
 * counts. Pure (no store or DOM), so tests can import it; atlasData re-exports
 * the region definitions.
 */
import type { City } from '../../engine/types'

export type RegionChip = 'All' | 'North America' | 'Latin America' | 'Europe' | 'Asia' | 'Oceania' | 'Other'
export const REGION_CHIPS: RegionChip[] = ['All', 'North America', 'Latin America', 'Europe', 'Asia', 'Oceania', 'Other']

/** "Other" gathers the Middle East and Africa. */
export function regionOf(c: Pick<City, 'region'>): Exclude<RegionChip, 'All'> {
  return c.region === 'Middle East' || c.region === 'Africa' ? 'Other' : c.region
}
export const inRegion = (c: Pick<City, 'region'>, r: RegionChip) => r === 'All' || regionOf(c) === r

type Searchable = Pick<City, 'name' | 'country' | 'currency' | 'countryCode' | 'region'>

/**
 * The city list's search. `query` is already trimmed and lower-cased; it matches
 * a city or country name substring, or an exact currency or country code. An
 * empty query matches everything.
 */
export function matchesQuery(c: Searchable, query: string): boolean {
  return (
    !query ||
    c.name.toLowerCase().includes(query) ||
    c.country.toLowerCase().includes(query) ||
    c.currency.toLowerCase() === query ||
    c.countryCode.toLowerCase() === query
  )
}

/** How many cities match the search in each region chip; "All" is the total, so the others sum to it. */
export function regionCounts(cities: readonly Searchable[], query: string): Record<RegionChip, number> {
  const out = Object.fromEntries(REGION_CHIPS.map((r) => [r, 0])) as Record<RegionChip, number>
  for (const c of cities) {
    if (!matchesQuery(c, query)) continue
    out.All++
    out[regionOf(c)]++
  }
  return out
}
