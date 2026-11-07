import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { inheritanceTax, wealthTax } from '../../engine/localTax'
import { CITIES, CITY_BY_ID, FX_FALLBACK } from '../cities'
import { EXPAT_PICKS } from '../expatPicks'
import fxJson from '../fx.json'
import { FX, LOCAL_TAX_BY_CITY, LOCAL_TAX_BY_COUNTRY, localTaxFor } from '../localTaxes'

const DOC = readFileSync(fileURLToPath(new URL('../../../docs/research/bbd-ranking-2026-11.md', import.meta.url)), 'utf8')

/** The draft top 75 in docs/research/bbd-ranking-2026-11.md, as city ids. */
const TOP75 = [
  'algarve', 'lisbon', 'paphos', 'panama-city', 'boquete', 'kuala-lumpur', 'porto', 'cascais', 'malaga', 'madrid',
  'athens', 'penang', 'crete', 'tavira', 'valencia', 'madeira', 'montevideo', 'limassol', 'sliema', 'grand-baie',
  'antalya', 'antigua-guatemala', 'tbilisi', 'san-jose-cr', 'lake-chapala', 'chiang-mai', 'bangkok', 'merida', 'hua-hin', 'coronado',
  'atenas', 'alicante', 'torrevieja', 'phuket', 'puerto-vallarta', 'san-miguel-de-allende', 'la-paz', 'kotor', 'cayo', 'hopkins',
  'corozal', 'santiago', 'prague', 'plovdiv', 'istanbul', 'mexico-city', 'budapest', 'chiang-rai', 'taipei', 'asuncion',
  'lima', 'oaxaca', 'las-terrenas', 'medellin', 'florence', 'playa-del-carmen', 'cuenca', 'nice', 'roatan', 'sarande',
  'langkawi', 'volcan', 'panajachel', 'placencia', 'ambergris-caye', 'split', 'batumi', 'gascony', 'rome', 'tarragona',
  'barcelona', 'cartagena', 'mazatlan', 'bali', 'vienna',
]

const ALL = [...Object.entries(LOCAL_TAX_BY_COUNTRY), ...Object.entries(LOCAL_TAX_BY_CITY)]
const RATES = fxJson.rates as Record<string, number>
const EUR = (x: number) => Math.round(x / RATES.EUR)

describe('local taxes data', () => {
  it('covers every country in the draft top 75', () => {
    expect(new Set(TOP75).size).toBe(75)
    expect(EXPAT_PICKS.map((p) => p.cityId)).toEqual(TOP75)
    expect(LOCAL_TAX_BY_COUNTRY.ES).toBeUndefined()
    for (const id of TOP75) {
      const c = CITY_BY_ID[id]
      expect(c, id).toBeDefined()
      // Spain is covered by region overrides only (its wealth tax is regional).
      if (c.countryCode !== 'ES') expect(LOCAL_TAX_BY_COUNTRY[c.countryCode], `${id} ${c.countryCode}`).toBeDefined()
      expect(localTaxFor(c.id, c.countryCode), id).toBeDefined()
      expect(c.localTax, id).toBe(localTaxFor(c.id, c.countryCode))
    }
  })

  it('covers the seven Stage 7 countries', () => {
    for (const cc of ['MU', 'BG', 'AL', 'HN', 'AT', 'SG', 'ZA']) expect(LOCAL_TAX_BY_COUNTRY[cc], cc).toBeDefined()
    for (const cc of ['MU', 'BG', 'AL', 'HN', 'AT', 'SG']) {
      expect(LOCAL_TAX_BY_COUNTRY[cc].wealth, cc).toBeUndefined()
      expect(LOCAL_TAX_BY_COUNTRY[cc].inheritance, cc).toBeUndefined()
    }
    expect(LOCAL_TAX_BY_COUNTRY.AT.note).toMatch(/90% of their growth/)
    expect(LOCAL_TAX_BY_COUNTRY.AT.note).toMatch(/27\.5%/)
    expect(LOCAL_TAX_BY_COUNTRY.ZA.wealth).toBeUndefined()
  })

  it('South Africa: estate duty on the whole estate, not per heir (hand-worked)', () => {
    const za = LOCAL_TAX_BY_COUNTRY.ZA.inheritance!
    const zar = RATES.ZAR
    // Whole-estate rule: 20% of (estate − R3.5M) up to R30M dutiable, 25% above.
    const duty = (estateUsd: number) => {
      const d = Math.max(0, estateUsd * zar - 3_500_000)
      return (0.2 * Math.min(d, 30_000_000) + 0.25 * Math.max(0, d - 30_000_000)) / zar
    }
    for (const estate of [100_000, 1_000_000, 2_000_000, 5_000_000, 20_000_000]) {
      expect(Math.abs(inheritanceTax(estate, za) - duty(estate)), `${estate}`).toBeLessThan(3)
    }
    expect(inheritanceTax(100_000, za)).toBe(0) // below the R3.5M abatement
    expect(za.afterYearsResident).toBeUndefined()
    expect(CITY_BY_ID['cape-town'].localTax).toBe(LOCAL_TAX_BY_COUNTRY.ZA)
  })

  it('cites at least one source per entry, each URL from the research doc', () => {
    for (const [k, t] of ALL) {
      expect(t.sources.length, k).toBeGreaterThan(0)
      expect(t.note.length, k).toBeGreaterThan(20)
      for (const url of t.sources) {
        expect(url, k).toMatch(/^https:\/\//)
        expect(DOC.includes(url), `${k}: ${url}`).toBe(true)
      }
    }
  })

  it('has well-formed bands', () => {
    for (const [k, t] of ALL) {
      for (const bands of [t.wealth?.bands, t.inheritance?.bands]) {
        if (!bands) continue
        expect(bands.length, k).toBeGreaterThan(0)
        for (let i = 0; i < bands.length; i++) {
          expect(bands[i].from, k).toBeGreaterThanOrEqual(i ? bands[i - 1].from : 0)
          expect(bands[i].rate, k).toBeGreaterThanOrEqual(0)
          expect(bands[i].rate, k).toBeLessThanOrEqual(0.6)
        }
      }
      if (t.inheritance) expect(t.inheritance.perHeirAllowance, k).toBeGreaterThanOrEqual(0)
    }
  })

  it('converts with the bundled fx.json rates', () => {
    for (const [ccy, rate] of Object.entries(FX)) expect(rate, ccy).toBe(RATES[ccy])
    // Colombia: 72,000 UVT = COP 3,770,928,000 ≈ the research's ~US$1.17M
    const co = LOCAL_TAX_BY_COUNTRY.CO.wealth!.bands[0].from
    expect(co).toBe(Math.round(3_770_928_000 / RATES.COP))
    expect(co).toBeGreaterThan(1_100_000)
    expect(co).toBeLessThan(1_250_000)
    // the fallback is no longer stale: within 1% of the bundled rate
    for (const [ccy, rate] of Object.entries(RATES)) expect(Math.abs(FX_FALLBACK[ccy] / rate - 1), ccy).toBeLessThan(0.01)
  })

  it('attaches entries to cities: none for the US, the country entry or a city override elsewhere', () => {
    for (const c of CITIES) {
      if (c.countryCode === 'US') expect(c.localTax, c.id).toBeUndefined()
      else if (LOCAL_TAX_BY_CITY[c.id]) expect(c.localTax, c.id).toBe(LOCAL_TAX_BY_CITY[c.id])
      else expect(c.localTax, c.id).toBe(LOCAL_TAX_BY_COUNTRY[c.countryCode])
    }
  })

  it("Spanish cities use their own region's rules", () => {
    const spanish = CITIES.filter((c) => c.countryCode === 'ES')
    for (const c of spanish) {
      expect(LOCAL_TAX_BY_CITY[c.id], c.id).toBeDefined()
      expect(c.localTax!.inheritance, c.id).toBeUndefined() // heir-based: not US-resident heirs
      expect(c.localTax!.wealth!.base, c.id).toBe('net') // margin debt is deductible
    }
    const first = (id: string) => CITY_BY_ID[id].localTax!.wealth!.bands[0]
    // Valencian Community: €2M exemption, 0.25% first band
    for (const id of ['valencia', 'alicante', 'torrevieja']) expect(first(id)).toEqual({ from: EUR(2_000_000), rate: 0.0025 })
    // Catalonia: €500k exemption, 0.21% first band
    for (const id of ['tarragona', 'barcelona']) expect(first(id)).toEqual({ from: EUR(500_000), rate: 0.0021 })
    // Andalusia and Madrid: nothing until about €3.7M, then the solidarity rates
    for (const id of ['malaga', 'madrid']) {
      expect(first(id)).toEqual({ from: EUR(3_700_000), rate: 0.017 })
      expect(CITY_BY_ID[id].localTax!.wealth!.bands.map((b) => b.rate)).toEqual([0.017, 0.021, 0.035])
    }
    expect(CITY_BY_ID.valencia.localTax).toBe(CITY_BY_ID.alicante.localTax)
    expect(CITY_BY_ID.tarragona.localTax).toBe(CITY_BY_ID.barcelona.localTax)
    // At $3M net worth: Málaga owes nothing, Valencia and Tarragona do, Tarragona more.
    const at3M = (id: string) => wealthTax(3_000_000, CITY_BY_ID[id].localTax!.wealth!)
    expect(at3M('malaga')).toBe(0)
    expect(at3M('valencia')).toBeGreaterThan(0)
    expect(at3M('tarragona')).toBeGreaterThan(at3M('valencia'))
  })

  it('France: tax on a $5M estate left to two children (hand-worked)', () => {
    // Per child: $2.5M in euros, less the €100k allowance, through the child scale.
    const x = 2_500_000 * RATES.EUR - 100_000
    expect(x).toBeGreaterThan(1_805_677) // in the 45% band
    const lower = 8_072 * 0.05 + 4_037 * 0.1 + 3_823 * 0.15 + 536_392 * 0.2 + 350_514 * 0.3 + 902_839 * 0.4 // €574,948.95
    expect(lower).toBeCloseTo(574_948.95, 6)
    const expectedUsd = (2 * (lower + (x - 1_805_677) * 0.45)) / RATES.EUR
    const got = inheritanceTax(5_000_000, CITY_BY_ID.nice.localTax!.inheritance!)
    expect(Math.abs(got - expectedUsd)).toBeLessThan(3) // thresholds are rounded to whole dollars
    expect(got).toBeGreaterThan(1_550_000)
    expect(got).toBeLessThan(1_700_000)
  })

  it('Japan: tax on a $5M estate left to two children (hand-worked)', () => {
    // Basic exemption ¥30m + ¥6m × 2 = ¥42m, i.e. ¥21m per statutory share.
    const x = 2_500_000 * RATES.JPY - 21_000_000
    expect(x).toBeGreaterThan(300_000_000)
    expect(x).toBeLessThan(600_000_000) // in the 50% band
    const lower = 10e6 * 0.1 + 20e6 * 0.15 + 20e6 * 0.2 + 50e6 * 0.3 + 100e6 * 0.4 + 100e6 * 0.45 // ¥108m
    expect(lower).toBeCloseTo(108_000_000, 3)
    const expectedUsd = (2 * (lower + (x - 300e6) * 0.5)) / RATES.JPY
    const jp = LOCAL_TAX_BY_COUNTRY.JP.inheritance!
    expect(Math.abs(inheritanceTax(5_000_000, jp) - expectedUsd)).toBeLessThan(3)
    expect(jp.afterYearsResident).toBe(10)
  })

  it('models heir-based and situs-only regimes as zero, decedent-based ones as taxed', () => {
    for (const cc of ['TH', 'VN', 'TW', 'CL', 'PT', 'MX', 'PA', 'MY', 'CY', 'MT', 'GT', 'BG', 'AL'])
      expect(LOCAL_TAX_BY_COUNTRY[cc].inheritance, cc).toBeUndefined()
    for (const cc of ['FR', 'GR', 'IT', 'IE', 'EC', 'CO', 'DO', 'TR', 'PH', 'JP', 'ZA'])
      expect(LOCAL_TAX_BY_COUNTRY[cc].inheritance, cc).toBeDefined()
    expect(LOCAL_TAX_BY_COUNTRY.IT.wealth!.base).toBe('gross') // IVAFE on market value
    expect(LOCAL_TAX_BY_COUNTRY.CO.wealth!.bands.at(-1)!.rate).toBe(0.01) // steady state from 2027
    expect(LOCAL_TAX_BY_COUNTRY.AR.wealth!.bands.at(-1)!.rate).toBe(0.0025) // 0.25% by 2027
  })
})
