import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { inheritanceTax, wealthTax } from '../../engine/localTax'
import { CITIES, CITY_BY_ID, FX_FALLBACK } from '../cities'
import { EXPAT_PICKS } from '../expatPicks'
import fxJson from '../fx.json'
import { FX, LOCAL_TAX_BY_CITY, LOCAL_TAX_BY_COUNTRY, localTaxFor, stateDeathTaxCredit } from '../localTaxes'

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
          // New York's cliff is one band of ~200% (the credit phasing out over 5%): see its test.
          expect(bands[i].rate, k).toBeLessThanOrEqual(k === 'new-york' && bands === t.inheritance?.bands && i === 0 ? 2 : 0.6)
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

  it('attaches entries to cities: a city override, else the country entry (none for the US)', () => {
    expect(LOCAL_TAX_BY_COUNTRY.US).toBeUndefined()
    for (const c of CITIES) {
      if (LOCAL_TAX_BY_CITY[c.id]) expect(c.localTax, c.id).toBe(LOCAL_TAX_BY_CITY[c.id])
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
    // Turkey moved to the zero list in the November 2026 fact check: Law 7338 art. 1 reaches only
    // Turkish nationals' property and property in Turkey.
    for (const cc of ['TH', 'VN', 'TW', 'CL', 'PT', 'MX', 'PA', 'MY', 'CY', 'MT', 'GT', 'BG', 'AL', 'TR', 'AE'])
      expect(LOCAL_TAX_BY_COUNTRY[cc].inheritance, cc).toBeUndefined()
    for (const cc of ['FR', 'GR', 'IT', 'IE', 'EC', 'CO', 'DO', 'PH', 'JP', 'ZA', 'GB', 'NL', 'DE', 'KR'])
      expect(LOCAL_TAX_BY_COUNTRY[cc].inheritance, cc).toBeDefined()
    expect(LOCAL_TAX_BY_COUNTRY.IT.wealth!.base).toBe('gross') // IVAFE on market value
    expect(LOCAL_TAX_BY_COUNTRY.CO.wealth!.bands.at(-1)!.rate).toBe(0.01) // steady state from 2027
    expect(LOCAL_TAX_BY_COUNTRY.AR.wealth!.bands.at(-1)!.rate).toBe(0.0025) // 0.25% by 2027
  })
})

// ---------------------------------------------------------------- November 2026 fact check (stage 8)
// Each regime is worked by hand from its statute or official table, independently of the bands.

const inh = (id: string) => CITY_BY_ID[id].localTax!.inheritance!
const near = (got: number, want: number, tol = 3) => expect(Math.abs(got - want), `${got} vs ${want}`).toBeLessThan(tol)
/** A marginal schedule written as [from, rate] on the whole amount. */
const marginal = (x: number, rows: [number, number][]) => {
  let tax = 0
  for (let i = 0; i < rows.length; i++) {
    const lo = rows[i][0]
    const hi = i + 1 < rows.length ? rows[i + 1][0] : Infinity
    if (x > lo) tax += (Math.min(x, hi) - lo) * rows[i][1]
  }
  return tax
}

describe('US state estate and inheritance taxes (whole estate, two equal heirs)', () => {
  const STATE_CITIES = ['seattle', 'portland', 'honolulu', 'minneapolis', 'chicago', 'boston', 'new-york', 'washington-dc', 'philadelphia', 'pittsburgh']

  it('only the cities of taxing states carry an entry; none has a wealth tax or a residence wait', () => {
    for (const c of CITIES.filter((x) => x.countryCode === 'US')) {
      if (STATE_CITIES.includes(c.id)) {
        expect(c.localTax?.inheritance, c.id).toBeDefined()
        expect(c.localTax!.wealth, c.id).toBeUndefined()
        expect(c.localTax!.inheritance!.afterYearsResident, c.id).toBeUndefined()
        expect(c.localTax!.note, c.id).toMatch(/federal estate tax/)
      } else expect(c.localTax, c.id).toBeUndefined()
    }
  })

  it('Washington: $3M exclusion, then the DOR table (10% to 20%)', () => {
    // DOR table on the taxable estate (estate − $3M): $100k at $1M, $240k at $2M, $550k at $4M, $1.49M at $9M.
    expect(inheritanceTax(3_000_000, inh('seattle'))).toBe(0)
    near(inheritanceTax(5_000_000, inh('seattle')), 240_000)
    near(inheritanceTax(7_500_000, inh('seattle')), 550_000 + 0.18 * 500_000)
    near(inheritanceTax(20_000_000, inh('seattle')), 1_490_000 + 0.2 * 8_000_000)
  })

  it('Oregon: nothing under $1M, then ORS 118.010 (10% to 16%)', () => {
    expect(inheritanceTax(999_000, inh('portland'))).toBe(0)
    near(inheritanceTax(2_000_000, inh('portland')), 50_000 + 0.1025 * 500_000)
    near(inheritanceTax(4_000_000, inh('portland')), 257_500 + 0.11 * 500_000)
    near(inheritanceTax(20_000_000, inh('portland')), 1_022_500 + 0.16 * 10_500_000)
  })

  it('Hawaii: $5.49M exclusion, then HRS 236E-8 (10% to 20%)', () => {
    expect(inheritanceTax(5_490_000, inh('honolulu'))).toBe(0)
    near(inheritanceTax(7_500_000, inh('honolulu')), 210_000 + 0.12 * 10_000)
    near(inheritanceTax(20_000_000, inh('honolulu')), 1_385_000 + 0.2 * 4_510_000)
  })

  it('Minnesota: $3M subtracted, then 291.03 (13% to 16%)', () => {
    expect(inheritanceTax(3_000_000, inh('minneapolis'))).toBe(0)
    near(inheritanceTax(5_000_000, inh('minneapolis')), 0.13 * 2_000_000)
    near(inheritanceTax(20_000_000, inh('minneapolis')), 1_355_000 + 0.16 * 6_900_000)
  })

  it('the 2011(b) credit table (spot checks)', () => {
    expect(stateDeathTaxCredit(40_000)).toBe(0)
    expect(stateDeathTaxCredit(90_000)).toBeCloseTo(400, 6)
    expect(stateDeathTaxCredit(1_940_000)).toBeCloseTo(70_800 + 0.072 * 400_000, 6) // $99,600
    expect(stateDeathTaxCredit(10_040_000)).toBeCloseTo(1_082_800, 6)
  })

  it("Illinois: the interrelated calculation; the AG's $5M example owes $285,714", () => {
    // t = min(credit(E − t − 60k), 40% × (E − t − 4M)), solved by fixed-point iteration.
    const il = (E: number) => {
      if (E <= 4_000_000) return 0
      let t = 0
      for (let i = 0; i < 200; i++) t = Math.min(stateDeathTaxCredit(E - t - 60_000), 0.4 * (E - t - 4_000_000))
      return t
    }
    expect(inheritanceTax(4_000_000, inh('chicago'))).toBe(0)
    // Attorney General's fact sheet: $285,714 on a $5,000,000 all-Illinois estate.
    near(inheritanceTax(5_000_000, inh('chicago')), 285_714, 1.5)
    near(il(5_000_000), 285_714, 1)
    for (const E of [4_500_000, 5_360_000, 6_000_000, 9_000_000, 20_000_000]) near(inheritanceTax(E, inh('chicago')), il(E), 3)
  })

  it('Massachusetts: the credit table less $99,600, nothing at $2M, no cliff', () => {
    const ma = (E: number) => (E <= 2_000_000 ? 0 : Math.max(0, stateDeathTaxCredit(E - 60_000) - 99_600))
    expect(inheritanceTax(2_000_000, inh('boston'))).toBe(0)
    near(inheritanceTax(2_100_000, inh('boston')), 7_200) // the ledger's figure
    for (const E of [3_000_000, 5_000_000, 20_000_000]) near(inheritanceTax(E, inh('boston')), ma(E))
  })

  it('New York: nothing to $7.35M, the cliff by 105%, then the § 952 table on the whole estate', () => {
    const table = (x: number) =>
      marginal(x, [
        [0, 0.0306], [500_000, 0.05], [1_000_000, 0.055], [1_500_000, 0.065], [2_100_000, 0.08], [2_600_000, 0.088],
        [3_100_000, 0.096], [3_600_000, 0.104], [4_100_000, 0.112], [5_100_000, 0.12], [6_100_000, 0.128],
        [7_100_000, 0.136], [8_100_000, 0.144], [9_100_000, 0.152], [10_100_000, 0.16],
      ])
    const B = 7_350_000
    const ny = (E: number) => {
      if (E <= B) return 0
      if (E > 1.05 * B) return table(E)
      const credit = table(B) * (1 - (E - B) / (0.05 * B))
      return table(E) - credit
    }
    expect(table(10_100_000)).toBeCloseTo(1_082_800, 4) // the table's own base
    expect(inheritanceTax(7_350_000, inh('new-york'))).toBe(0)
    for (const E of [7_500_000, 7_717_500, 8_000_000, 12_000_000, 20_000_000]) near(inheritanceTax(E, inh('new-york')), ny(E))
    near(inheritanceTax(7_717_500, inh('new-york')), 734_780)
    expect(inh('new-york').bands[0].rate).toBeGreaterThan(1.99)
  })

  it('District of Columbia: 0% to $4,988,400, then 11.2% to 16%', () => {
    expect(inheritanceTax(4_988_400, inh('washington-dc'))).toBe(0)
    near(inheritanceTax(5_000_000, inh('washington-dc')), 0.112 * 11_600)
    near(inheritanceTax(20_000_000, inh('washington-dc')), 0.112 * 11_600 + 0.12e6 + 0.128e6 + 0.136e6 + 0.144e6 + 0.152e6 + 0.16 * 10e6)
  })

  it('Pennsylvania: 4.5% to children from the first dollar', () => {
    expect(inh('philadelphia')).toBe(inh('pittsburgh'))
    near(inheritanceTax(100_000, inh('philadelphia')), 4_500)
    near(inheritanceTax(5_000_000, inh('philadelphia')), 225_000)
  })
})

describe('countries added or changed in the November 2026 fact check', () => {
  it('United Kingdom: 40% above the £325k nil-rate band, after 10 years', () => {
    const gb = LOCAL_TAX_BY_COUNTRY.GB.inheritance!
    const gbp = RATES.GBP
    expect(gb.afterYearsResident).toBe(10)
    expect(inheritanceTax(300_000 / gbp, gb)).toBe(0)
    for (const E of [1_000_000, 5_000_000]) near(inheritanceTax(E, gb), 0.4 * (E - 325_000 / gbp))
    expect(CITY_BY_ID.london.localTax).toBe(LOCAL_TAX_BY_COUNTRY.GB)
  })

  it('Netherlands: Box 3 at 36% × 6% of the gross portfolio above €59,357; inheritance 10/20%', () => {
    const nl = LOCAL_TAX_BY_COUNTRY.NL
    expect(nl.wealth!.base).toBe('gross')
    const allow = 59_357 / RATES.EUR
    expect(wealthTax(allow - 100, nl.wealth!)).toBe(0)
    near(wealthTax(1_000_000, nl.wealth!), 0.0216 * (1_000_000 - allow))
    near(wealthTax(5_000_000, nl.wealth!), 0.0216 * (5_000_000 - allow))
    // Per child on a $2.5M share: €26,230 exempt, 10% to €158,669, 20% above.
    const child = (shareUsd: number) => {
      const x = Math.max(0, shareUsd * RATES.EUR - 26_230)
      return (0.1 * Math.min(x, 158_669) + 0.2 * Math.max(0, x - 158_669)) / RATES.EUR
    }
    expect(inheritanceTax(50_000, nl.inheritance!)).toBe(0) // $25k shares, under the exemption
    for (const E of [300_000, 5_000_000]) near(inheritanceTax(E, nl.inheritance!), 2 * child(E / 2))
  })

  it('Germany: § 19 whole-amount rates with the § 19(3) step relief, per child above €400k, after 10 years', () => {
    const de = LOCAL_TAX_BY_COUNTRY.DE.inheritance!
    expect(de.afterYearsResident).toBe(10)
    const LIM = [75_000, 300_000, 600_000, 6_000_000, 13_000_000, 26_000_000, Infinity]
    const RATE = [0.07, 0.11, 0.15, 0.19, 0.23, 0.27, 0.3]
    const erbst = (x: number) => {
      if (x <= 0) return 0
      const k = LIM.findIndex((l) => x <= l)
      if (k === 0) return RATE[0] * x
      const L = LIM[k - 1]
      return Math.min(RATE[k] * x, RATE[k - 1] * L + 0.5 * (x - L)) // step relief, half the excess
    }
    const perChild = (shareUsd: number) => erbst(shareUsd * RATES.EUR - 400_000) / RATES.EUR
    expect(inheritanceTax(800_000, de)).toBe(0) // €358k shares, under €400k
    // just above €700k taxable (the 19% step's relief zone), mid-band, and a large estate
    for (const E of [(2 * (400_000 + 700_000)) / RATES.EUR, 2_000_000, 5_000_000, 40_000_000])
      near(inheritanceTax(E, de), 2 * perChild(E / 2), 4)
    // the step relief holds: at €300,001 taxable the tax is ~€33,000.5, not 15% × the whole
    expect(erbst(300_001)).toBeCloseTo(33_000.5, 1)
  })

  it('South Korea: 10–50% on the whole estate after the KRW 500m deduction', () => {
    const kr = LOCAL_TAX_BY_COUNTRY.KR.inheritance!
    const krw = RATES.KRW
    const whole = (E: number) =>
      marginal(Math.max(0, E * krw - 500e6), [[0, 0.1], [100e6, 0.2], [500e6, 0.3], [1e9, 0.4], [3e9, 0.5]]) / krw
    expect(kr.afterYearsResident).toBeUndefined()
    expect(inheritanceTax(300e6 / krw, kr)).toBe(0)
    for (const E of [1_000_000, 2_000_000, 10_000_000]) near(inheritanceTax(E, kr), whole(E))
    // KRW 3bn taxable owes KRW 1.04bn (the statutory cumulative)
    expect(marginal(3e9, [[0, 0.1], [100e6, 0.2], [500e6, 0.3], [1e9, 0.4], [3e9, 0.5]])).toBeCloseTo(1.04e9, 0)
  })

  it('Zurich: net wealth tax, basic tariff × 2.14', () => {
    const zh = CITY_BY_ID.zurich.localTax!.wealth!
    expect(zh.base).toBe('net')
    const chf = RATES.CHF
    const basic = (x: number) =>
      marginal(x, [[81_000, 0.0005], [322_000, 0.001], [726_000, 0.0015], [1_371_000, 0.002], [2_339_000, 0.0025], [3_304_000, 0.003]])
    expect(wealthTax(80_000 / chf, zh)).toBe(0)
    for (const usdNet of [1_000_000, 10_000_000]) near(wealthTax(usdNet, zh), (2.14 * basic(usdNet * chf)) / chf)
    expect(CITY_BY_ID.zurich.localTax!.inheritance).toBeUndefined()
  })

  it('Turkey, UAE: no tax on a US portfolio; Catalonia: fifth step at €1,336,999.75', () => {
    expect(LOCAL_TAX_BY_COUNTRY.TR.wealth).toBeUndefined()
    expect(LOCAL_TAX_BY_COUNTRY.AE.wealth).toBeUndefined()
    expect(CITY_BY_ID.dubai.localTax).toBe(LOCAL_TAX_BY_COUNTRY.AE)
    expect(CITY_BY_ID.barcelona.localTax!.wealth!.bands[4].from).toBe(EUR(500_000 + 1_336_999.75))
  })

  it('notes no longer carry hedges the statutes settle', () => {
    expect(LOCAL_TAX_BY_COUNTRY.IT.note).not.toMatch(/not verified/)
    expect(LOCAL_TAX_BY_COUNTRY.IT.note).toMatch(/even if abroad/)
    expect(LOCAL_TAX_BY_COUNTRY.PH.note).not.toMatch(/not verified/)
    expect(LOCAL_TAX_BY_COUNTRY.AR.note).toMatch(/not deductible/)
    expect(LOCAL_TAX_BY_COUNTRY.AT.note).not.toMatch(/tax office/)
    expect(LOCAL_TAX_BY_COUNTRY.FR.note).not.toMatch(/research gives/)
  })
})
