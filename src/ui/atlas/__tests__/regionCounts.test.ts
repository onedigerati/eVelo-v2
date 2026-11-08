import { describe, expect, it } from 'vitest'
import { CITIES } from '../../../data/cities'
import { REGION_CHIPS, inRegion, matchesQuery, regionCounts, type RegionChip } from '../regionCounts'

const sumOfRegions = (c: Record<RegionChip, number>) => REGION_CHIPS.filter((r) => r !== 'All').reduce((s, r) => s + c[r], 0)

describe('regionCounts', () => {
  it('counts every city per region with no search, and has a key for every chip', () => {
    const c = regionCounts(CITIES, '')
    expect(Object.keys(c).sort()).toEqual([...REGION_CHIPS].sort())
    expect(c.All).toBe(CITIES.length)
    for (const r of REGION_CHIPS) expect(c[r]).toBe(CITIES.filter((x) => inRegion(x, r)).length)
  })

  it('folds the Middle East and Africa into Other', () => {
    const c = regionCounts(CITIES, '')
    const other = CITIES.filter((x) => x.region === 'Middle East' || x.region === 'Africa').length
    expect(other).toBeGreaterThan(0)
    expect(c.Other).toBe(other)
  })

  it('regions sum to All, with and without a search', () => {
    for (const q of ['', 'an', 'united states', 'eur', 'mx', 'zzz-no-match']) {
      const c = regionCounts(CITIES, q)
      expect(sumOfRegions(c)).toBe(c.All)
    }
  })

  it('applies the search filter', () => {
    const q = 'united states'
    const c = regionCounts(CITIES, q)
    const us = CITIES.filter((x) => x.countryCode === 'US').length
    expect(us).toBeGreaterThan(0)
    expect(c.All).toBe(us)
    expect(c['North America']).toBe(us)
    expect(c.Europe).toBe(0)
    expect(c.Asia).toBe(0)
  })

  it('matches a currency or country code exactly, not as a substring', () => {
    const eur = regionCounts(CITIES, 'eur')
    expect(eur.All).toBe(CITIES.filter((x) => x.currency === 'EUR' || matchesQuery(x, 'eur')).length)
    expect(eur.Europe).toBeGreaterThan(0)
    const jp = regionCounts(CITIES, 'jp')
    expect(jp.All).toBe(CITIES.filter((x) => x.countryCode === 'JP' || x.name.toLowerCase().includes('jp') || x.country.toLowerCase().includes('jp')).length)
    expect(jp.Asia).toBe(jp.All)
  })

  it('a search with no hits zeroes every chip', () => {
    const c = regionCounts(CITIES, 'zzz-no-match')
    for (const r of REGION_CHIPS) expect(c[r]).toBe(0)
  })
})

describe('matchesQuery', () => {
  const lisbon = { name: 'Lisbon', country: 'Portugal', currency: 'EUR', countryCode: 'PT', region: 'Europe' as const }
  it('matches names, countries and exact codes', () => {
    expect(matchesQuery(lisbon, '')).toBe(true)
    expect(matchesQuery(lisbon, 'lis')).toBe(true)
    expect(matchesQuery(lisbon, 'portu')).toBe(true)
    expect(matchesQuery(lisbon, 'eur')).toBe(true)
    expect(matchesQuery(lisbon, 'pt')).toBe(true)
    expect(matchesQuery(lisbon, 'eu')).toBe(false)
    expect(matchesQuery(lisbon, 'madrid')).toBe(false)
  })
})
