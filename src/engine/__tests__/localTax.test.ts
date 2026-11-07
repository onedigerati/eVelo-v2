import { describe, expect, it } from 'vitest'
import marketJson from '../../data/market.json'
import { runAtlas } from '../atlas'
import { DEFAULT_INPUTS } from '../defaults'
import { createRecorder, runPaths, type KernelConfig } from '../kernel'
import { bandTax, HEIRS, inheritanceTax, packBands, wealthTax } from '../localTax'
import { kernelConfig, resolveDestination, simulate } from '../simulate'
import type { City, LocalTax, MarketData, PlanInputs, TaxBand } from '../types'
import { BKK, STL } from './fixtures'

const market = marketJson as unknown as MarketData
const withInputs = (o: Partial<PlanInputs>): PlanInputs => ({ ...DEFAULT_INPUTS, ...o })

describe('band math', () => {
  it('applies marginal bands (hand-worked)', () => {
    const b: TaxBand[] = [
      { from: 0, rate: 0.01 },
      { from: 500_000, rate: 0.02 },
    ]
    // 500k × 1% + 500k × 2%
    expect(bandTax(1_000_000, b)).toBeCloseTo(15_000, 9)
    expect(bandTax(500_000, b)).toBeCloseTo(5_000, 9)
    expect(bandTax(0, b)).toBe(0)
    expect(bandTax(-5, b)).toBe(0)
  })

  it('charges nothing below the first threshold and sorts bands', () => {
    const b: TaxBand[] = [
      { from: 3_000_000, rate: 0.035 },
      { from: 1_000_000, rate: 0.01 },
    ]
    expect(bandTax(999_999, b)).toBe(0)
    // 2M × 1% + 1M × 3.5%
    expect(bandTax(4_000_000, b)).toBeCloseTo(20_000 + 35_000, 9)
    expect(wealthTax(4_000_000, { base: 'net', bands: b })).toBeCloseTo(55_000, 9)
    expect(wealthTax(-1, { base: 'net', bands: b })).toBe(0)
  })

  it('inheritance: equal shares, per-heir allowance, then the bands (hand-worked)', () => {
    expect(HEIRS).toBe(2)
    const inh = { perHeirAllowance: 100_000, bands: [{ from: 0, rate: 0.1 }, { from: 1_000_000, rate: 0.2 }] }
    // share 1.5M − 100k = 1.4M → 1M × 10% + 400k × 20% = 180k per heir, × 2
    expect(inheritanceTax(3_000_000, inh)).toBeCloseTo(360_000, 6)
    // share 50k is below the allowance
    expect(inheritanceTax(100_000, inh)).toBe(0)
    expect(inheritanceTax(0, inh)).toBe(0)
    // three heirs: share 1M − 100k = 900k × 10% = 90k, × 3
    expect(inheritanceTax(3_000_000, inh, 3)).toBeCloseTo(270_000, 6)
  })
})

// A one-path deterministic scenario: flat returns and prices, no spending.
function flat(T: number, ret = 0, infl = 0) {
  return {
    paths: 1,
    T,
    ret: new Float32Array(T).fill(ret),
    infl: new Float32Array(T).fill(infl),
    fxz: new Float32Array(T),
  }
}
const base: KernelConfig = {
  T: 36, portfolio: 1000, basisFraction: 1, dragM: 0, loanRateM: 0, maxLtv: 0.9, targetLtv: 0.8, tax: 0.2,
  homeMonthly: 0, destMonthly: 0, moveMonth: 12, fxSigmaM: 0, incomeMonthly: 0, incomeStartMonth: 0,
}
const wt = (gross: boolean, bands: TaxBand[]) => ({ gross, bands: packBands(bands) })
const run = (cfg: KernelConfig, sc = flat(cfg.T)) => {
  const rec = createRecorder(sc.paths, Math.floor(cfg.T / 12))
  const clean = runPaths(sc, cfg, rec)
  return { rec, clean }
}

describe('wealth tax in the kernel', () => {
  it('is charged only at year-ends after the move, on net worth, and borrowed (BBD)', () => {
    const { rec } = run({ ...base, wealthTax: wt(false, [{ from: 500, rate: 0.1 }]) })
    // year 1 (before the move): nothing. Year 2: (1000 − 500) × 10% = 50. Year 3: (950 − 500) × 10% = 45.
    expect(Array.from(rec.loan)).toEqual([0, 0, 50, 95])
    expect(rec.nw[3]).toBeCloseTo(905, 9)
    expect(rec.wealthTax[0]).toBeCloseTo(95, 9)
    expect(rec.bbdEstate[0]).toBeCloseTo(905, 9)
    expect(rec.outcome[0]).toBe(0)
  })

  it('on a gross base ignores the loan', () => {
    const { rec } = run({ ...base, wealthTax: wt(true, [{ from: 500, rate: 0.1 }]) })
    // 50 in each of years 2 and 3: the 50 borrowed in year 2 does not reduce the base.
    expect(Array.from(rec.loan)).toEqual([0, 0, 50, 100])
    expect(rec.wealthTax[0]).toBeCloseTo(100, 9)
    expect(rec.bbdEstate[0]).toBeCloseTo(900, 9)
  })

  it('charges nothing below the threshold', () => {
    const none = run(base).rec
    const below = run({ ...base, wealthTax: wt(false, [{ from: 2000, rate: 0.1 }]) }).rec
    expect(below.wealthTax[0]).toBe(0)
    expect(Array.from(below.loan)).toEqual(Array.from(none.loan))
    expect(below.bbdEstate[0]).toBe(none.bbdEstate[0])
  })

  it('charges every year-end from month 0 when moving now', () => {
    const { rec } = run({ ...base, moveMonth: 0, wealthTax: wt(false, [{ from: 500, rate: 0.1 }]) })
    // 50, then (950 − 500) × 10% = 45, then (905 − 500) × 10% = 40.5
    expect(rec.loan[1]).toBeCloseTo(50, 9)
    expect(rec.loan[2]).toBeCloseTo(95, 9)
    expect(rec.loan[3]).toBeCloseTo(135.5, 9)
  })

  it('a move month off the year boundary is first taxed at the next year-end (move 13 → month 23)', () => {
    const { rec } = run({ ...base, moveMonth: 13, wealthTax: wt(false, [{ from: 500, rate: 0.1 }]) })
    expect(Array.from(rec.loan)).toEqual([0, 0, 50, 95])
    const at11 = run({ ...base, moveMonth: 11, wealthTax: wt(false, [{ from: 500, rate: 0.1 }]) }).rec
    expect(at11.loan[1]).toBeCloseTo(50, 9) // move at 11 is resident at the first year-end
  })

  it('can tip a path into insolvency, and charges nothing once it is broken', () => {
    // Year 2: 100% of 1000 net → L = 1000 = V → broken that month; year 3 is not taxed.
    const { rec, clean } = run({ ...base, wealthTax: wt(false, [{ from: 0, rate: 1 }]) })
    expect(clean).toBe(0)
    expect(rec.outcome[0]).toBe(2)
    expect(rec.firstCall[0]).toBe(23)
    expect(rec.wealthTax[0]).toBe(1000)
    expect(rec.nw[3]).toBe(0)
    expect(rec.bbdEstate[0]).toBe(0)
  })

  it('never applies when there is no move (moveMonth >= T)', () => {
    const { rec } = run({ ...base, moveMonth: 36, wealthTax: wt(false, [{ from: 0, rate: 0.1 }]) })
    expect(rec.wealthTax[0]).toBe(0)
  })

  it('holds thresholds constant in real terms', () => {
    // Nominal return = inflation, so real wealth stays 1000; gross base → 50 real a year after the move.
    const sc = flat(36, 0.01, 0.01)
    const { rec } = run({ ...base, wealthTax: wt(true, [{ from: 500, rate: 0.1 }]) }, sc)
    expect(rec.wealthTax[0]).toBeCloseTo(100, 4)
    expect(rec.port[3]).toBeCloseTo(1000, 3)
  })

  it('is borrowed before the margin check: a large tax can trigger a call that month', () => {
    // 1000 net, 85% above 0: tax 850 → LTV 0.85 < 0.9; second year (150 net) → +127.5 → LTV 0.9775 > 0.9.
    const { rec } = run({ ...base, wealthTax: wt(false, [{ from: 0, rate: 0.85 }]) })
    expect(rec.loan[2]).toBeCloseTo(850, 9)
    expect(rec.firstCall[0]).toBe(35)
    expect(rec.ltv[3]).toBeCloseTo(0.8, 6)
  })

  it('sell strategy sells shares to pay it, grossed up for capital-gains tax', () => {
    // basis 50%: gain fraction g = 0.5, tax 20% → each $1 of wealth tax needs 1 / (1 − 0.1) of sales.
    const { rec } = run({ ...base, basisFraction: 0.5, wealthTax: wt(false, [{ from: 500, rate: 0.1 }]) })
    const S1 = 50 / 0.9
    const V1 = 1000 - S1
    const B1 = 500 * (1 - S1 / 1000)
    const g2 = 1 - B1 / V1
    const S2 = ((V1 - 500) * 0.1) / (1 - g2 * 0.2)
    expect(rec.sellEstate[0]).toBeCloseTo(V1 - S2, 9)
    expect(rec.sellTax[0]).toBeCloseTo(S1 * 0.1 + S2 * g2 * 0.2, 9)
  })
})

describe('inheritance tax in the kernel', () => {
  const inh = { heirs: 2, perHeirAllowance: 100, bands: packBands([{ from: 0, rate: 0.1 }, { from: 200, rate: 0.2 }]) }

  it('reduces both estates by the hand-worked amount', () => {
    const { rec } = run({ ...base, inheritance: inh })
    // share 500 − 100 = 400 → 200 × 10% + 200 × 20% = 60 per heir → 120
    expect(rec.bbdEstateBeforeTax[0]).toBeCloseTo(1000, 9)
    expect(rec.inheritanceTax[0]).toBeCloseTo(120, 9)
    expect(rec.bbdEstate[0]).toBeCloseTo(880, 9)
    expect(rec.sellEstate[0]).toBeCloseTo(880, 9)
  })

  it('combines with a wealth tax: the estate is taxed after the borrowed wealth tax', () => {
    const { rec } = run({ ...base, inheritance: inh, wealthTax: wt(false, [{ from: 500, rate: 0.1 }]) })
    // BBD estate 905 → share 452.5 − 100 = 352.5 → 20 + 152.5 × 0.2 = 50.5 per heir → 101
    expect(rec.inheritanceTax[0]).toBeCloseTo(101, 9)
    expect(rec.bbdEstate[0]).toBeCloseTo(804, 9)
    // Sell plan (basis 100%, no gains tax): 1000 − 50 − 45 = 905, the same estate → 804.
    expect(rec.sellEstate[0]).toBeCloseTo(804, 9)
    expect(rec.sellTax[0]).toBe(0)
  })

  it('does not change success (it is charged after the horizon)', () => {
    expect(run({ ...base, inheritance: inh }).clean).toBe(run(base).clean)
  })
})

const tax = (o: Partial<LocalTax>): LocalTax => ({ note: 'test', sources: [], ...o })
const VALENCIA_LIKE: LocalTax = tax({ wealth: { base: 'net', bands: [{ from: 2_300_000, rate: 0.0162 }, { from: 6_000_000, rate: 0.025 }] } })
const FRANCE_LIKE: LocalTax = tax({
  inheritance: { perHeirAllowance: 115_000, bands: [{ from: 0, rate: 0.2 }, { from: 1_800_000, rate: 0.45 }] },
})
const city = (localTax?: LocalTax): City => ({ ...BKK, fxVol: 0.07, ...(localTax ? { localTax } : {}) })
const strip = (r: ReturnType<typeof simulate>) => ({ ...r, elapsedMs: 0, localTax: null })

describe('local taxes end to end', () => {
  const inp = withInputs({ paths: 1500, portfolio: 5_000_000 })

  it('no or empty localTax is bit-identical to the feature absent', () => {
    const absent = simulate(market, [STL, city()], inp)
    const empties: LocalTax[] = [
      tax({}),
      tax({ wealth: { base: 'net', bands: [] }, inheritance: { perHeirAllowance: 0, bands: [] } }),
    ]
    expect(absent.localTax).toBeNull()
    for (const lt of empties) {
      const r = simulate(market, [STL, city(lt)], inp)
      expect(strip(r)).toEqual(strip(absent))
      expect(r.localTax).toEqual({
        wealthTaxMedian: 0,
        inheritanceTaxMedian: 0,
        bbdEstateBeforeTaxMedian: absent.estate.bbdMedian,
        inheritanceApplies: false,
      })
      expect(runAtlas(market, [STL, city(lt)], inp, ['bangkok'])).toEqual(runAtlas(market, [STL, city()], inp, ['bangkok']))
    }
  })

  it('a zero-rate band reproduces the untaxed result exactly', () => {
    const zero = tax({ wealth: { base: 'net', bands: [{ from: 0, rate: 0 }] }, inheritance: { perHeirAllowance: 0, bands: [{ from: 0, rate: 0 }] } })
    expect(strip(simulate(market, [STL, city(zero)], inp))).toEqual(strip(simulate(market, [STL, city()], inp)))
  })

  it('staying home ignores the destination tax', () => {
    const r = simulate(market, [STL, city(VALENCIA_LIKE)], { ...inp, destCityId: null })
    expect(r.localTax).toBeNull()
  })

  it('a wealth-tax destination lowers success and the estate vs the same city untaxed', () => {
    const untaxed = simulate(market, [STL, city()], inp)
    const taxed = simulate(market, [STL, city(VALENCIA_LIKE)], inp)
    expect(taxed.successRate).toBeLessThan(untaxed.successRate)
    expect(taxed.estate.bbdMedian).toBeLessThan(untaxed.estate.bbdMedian)
    expect(taxed.estate.sellMedian).toBeLessThan(untaxed.estate.sellMedian)
    expect(taxed.localTax!.wealthTaxMedian).toBeGreaterThan(0)
    expect(taxed.localTax!.inheritanceTaxMedian).toBe(0)
  })

  it('an inheritance-only destination lowers the estate but not success', () => {
    const untaxed = simulate(market, [STL, city()], inp)
    const taxed = simulate(market, [STL, city(FRANCE_LIKE)], inp)
    expect(taxed.successRate).toBe(untaxed.successRate)
    expect(taxed.estate.bbdMedian).toBeLessThan(untaxed.estate.bbdMedian)
    expect(taxed.estate.sellMedian).toBeLessThan(untaxed.estate.sellMedian)
    expect(taxed.localTax!.bbdEstateBeforeTaxMedian).toBe(untaxed.estate.bbdMedian)
    expect(taxed.localTax!.inheritanceTaxMedian).toBeGreaterThan(0)
    expect(taxed.localTax!.wealthTaxMedian).toBe(0)
    expect(taxed.localTax!.inheritanceApplies).toBe(true)
  })

  it('atlas odds equal the Outlook for a taxed city', () => {
    const cities = [STL, city(VALENCIA_LIKE)]
    const [e] = runAtlas(market, cities, inp, ['bangkok'])
    expect(e.successRate).toBe(simulate(market, cities, inp).successRate)
  })

  it('a residence period gates the inheritance tax: strictly more than N years (Ireland 5, Japan 10)', () => {
    const gated = (n: number) => tax({ inheritance: { perHeirAllowance: 0, bands: [{ from: 0, rate: 0.33 }], afterYearsResident: n } })
    const dest = (lt: LocalTax, moveInYears: number) => {
      const i = { ...inp, moveInYears }
      return kernelConfig(i, resolveDestination(i, STL, city(lt)))
    }
    // horizon 30: Ireland (5) applies after more than 5 years resident
    expect(dest(gated(5), 24).inheritance).not.toBeNull() // 6 years
    expect(dest(gated(5), 25).inheritance).toBeNull() // exactly 5
    // Japan (10)
    expect(dest(gated(10), 19).inheritance).not.toBeNull() // 11 years
    expect(dest(gated(10), 20).inheritance).toBeNull() // exactly 10
    expect(dest(gated(10), 20 + 0.5).inheritance).toBeNull()
    expect(dest(gated(5), 0).wealthTax).toBeNull()
    const r = simulate(market, [STL, city(gated(10))], { ...inp, moveInYears: 20 })
    expect(r.localTax!.inheritanceApplies).toBe(false)
    expect(r.localTax!.inheritanceTaxMedian).toBe(0)
  })
})
