import { describe, expect, it } from 'vitest'
import { CITIES, COL_AS_OF, COL_SOURCES, EXPAT_CAVEATS, FX_FALLBACK } from '../cities'

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
    expect(COL_AS_OF).toMatch(/^2026-\d{2}/)
    expect(COL_SOURCES.length).toBeGreaterThan(0)
    expect(EXPAT_CAVEATS.length).toBeGreaterThan(0)
  })
})
