import { describe, expect, it } from 'vitest'
import { CITIES, CITY_BY_ID, COL_AS_OF, COL_SOURCES, EXPAT_CAVEATS, FX_FALLBACK } from '../cities'

const REGIONS = ['North America', 'Latin America', 'Europe', 'Asia', 'Oceania', 'Middle East', 'Africa']

describe('CITIES dataset', () => {
  it('has unique kebab-case ascii ids', () => {
    const ids = CITIES.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const id of ids) expect(id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/)
  })

  it('includes the anchor cities', () => {
    const ids = new Set(CITIES.map((c) => c.id))
    expect(ids.has('st-louis')).toBe(true)
    expect(ids.has('bangkok')).toBe(true)
    expect(ids.has('new-york')).toBe(true)
  })

  it('has an FX fallback for every currency', () => {
    for (const c of CITIES) {
      expect(FX_FALLBACK[c.currency], `${c.id} ${c.currency}`).toBeGreaterThan(0)
    }
    expect(FX_FALLBACK.USD).toBe(1)
  })

  it('has positive, plausible indices and factors', () => {
    for (const c of CITIES) {
      for (const [k, v] of Object.entries(c.idx)) {
        expect(Number.isInteger(v), `${c.id}.${k}`).toBe(true)
        // Rent in the cheapest cities (e.g. Cuenca, Cebu) sits below 10 vs NYC; everything else 10–200.
        expect(v, `${c.id}.${k}`).toBeGreaterThanOrEqual(k === 'rent' ? 5 : 10)
        expect(v, `${c.id}.${k}`).toBeLessThanOrEqual(200)
      }
      expect(c.healthcare).toBeGreaterThan(0)
      expect(c.healthcare).toBeLessThanOrEqual(1.5)
      expect(c.fxVol).toBeGreaterThanOrEqual(0)
      expect(c.fxVol).toBeLessThan(0.5)
      if (c.currency === 'USD') expect(c.fxVol).toBe(0)
    }
  })

  it('has valid metadata', () => {
    for (const c of CITIES) {
      expect(REGIONS).toContain(c.region)
      expect(c.countryCode).toMatch(/^[A-Z]{2}$/)
      expect(c.currency).toMatch(/^[A-Z]{3}$/)
      expect(Math.abs(c.lat)).toBeLessThanOrEqual(90)
      expect(Math.abs(c.lon)).toBeLessThanOrEqual(180)
      if (c.countryCode === 'US') expect(c.healthcare).toBe(1)
    }
  })

  it('gives every non-US city 1-3 notes', () => {
    for (const c of CITIES.filter((c) => c.countryCode !== 'US')) {
      expect(c.notes?.length ?? 0, c.id).toBeGreaterThanOrEqual(1)
      expect(c.notes!.length, c.id).toBeLessThanOrEqual(3)
    }
  })

  it('exports provenance and caveats', () => {
    expect(COL_AS_OF).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(COL_SOURCES.length).toBeGreaterThan(0)
    expect(EXPAT_CAVEATS.length).toBeGreaterThan(0)
  })

  it('marks the 25 expat picks verified with source, ISO date and url', () => {
    const picks = [
      'algarve', 'boquete', 'panama-city', 'lisbon', 'valencia', 'malaga', 'san-jose-cr', 'puerto-vallarta', 'athens',
      'kuala-lumpur', 'penang', 'chiang-mai', 'merida', 'san-miguel-de-allende', 'porto', 'medellin', 'cuenca',
      'madeira', 'da-nang', 'montevideo', 'nice', 'florence', 'bangkok', 'split', 'bali',
    ]
    expect(new Set(picks).size).toBe(25)
    for (const id of picks) {
      const v = CITY_BY_ID[id]?.verified
      expect(v, id).toBeDefined()
      expect(v!.source.length, id).toBeGreaterThan(0)
      expect(v!.url, id).toMatch(/^https?:\/\//)
      expect(v!.asOf, id).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(Number.isNaN(Date.parse(v!.asOf)), id).toBe(false)
    }
  })

  it('gives every verified record a valid shape', () => {
    for (const c of CITIES.filter((c) => c.verified)) {
      const v = c.verified!
      expect(v.source.length, c.id).toBeGreaterThan(0)
      expect(v.asOf, c.id).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(['high', 'low'], c.id).toContain(v.confidence)
      if (v.url) expect(v.url, c.id).toMatch(/^https?:\/\//)
    }
  })

  it('verifies US cities only with all four indices, and leaves partial ones as estimates', () => {
    const us = CITIES.filter((c) => c.countryCode === 'US' && c.verified)
    // Every US city except the three without a full Numbeo row.
    expect(us.length).toBe(CITIES.filter((c) => c.countryCode === 'US').length - 3)
    for (const c of us) {
      for (const k of ['col', 'rent', 'groceries', 'restaurants'] as const) {
        expect(Number.isInteger(c.idx[k]) && c.idx[k] > 0, `${c.id}.${k}`).toBe(true)
      }
    }
    for (const id of ['scottsdale', 'asheville', 'sarasota']) expect(CITY_BY_ID[id].verified, id).toBeUndefined()
  })

  it('flags Boquete as low confidence and notes the blends', () => {
    expect(CITY_BY_ID.boquete.verified?.confidence).toBe('low')
    expect(CITY_BY_ID.boquete.verified?.note).toBeTruthy()
    for (const id of ['medellin', 'bali', 'algarve', 'madeira', 'penang']) expect(CITY_BY_ID[id].verified?.note, id).toBeTruthy()
  })

  it('verifies New York as the base at 100', () => {
    const ny = CITY_BY_ID['new-york']
    expect(ny.verified).toBeDefined()
    expect(ny.idx).toEqual({ col: 100, rent: 100, groceries: 100, restaurants: 100 })
  })
})
