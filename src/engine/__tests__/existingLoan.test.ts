import { describe, expect, it } from 'vitest'
import marketJson from '../../data/market.json'
import { runAtlas } from '../atlas'
import { DEFAULT_INPUTS } from '../defaults'
import { createRecorder, runPaths, type KernelConfig } from '../kernel'
import { prepare } from '../prepare'
import { findCity, kernelConfig, makeScenarios, normalizeInputs, resolveDestination, simulate } from '../simulate'
import { solveSpending } from '../solve'
import type { MarketData, PlanInputs, SimulationResult } from '../types'
import { CITIES_FIX } from './fixtures'

const market = marketJson as unknown as MarketData
const withInputs = (o: Partial<PlanInputs>): PlanInputs => ({ ...DEFAULT_INPUTS, ...o })

/** One path of `T` months with flat returns and no inflation. */
const flat = (T: number) => ({ paths: 1, T, ret: new Float32Array(T), infl: new Float32Array(T), fxz: new Float32Array(T) })

/** A closed-form one-path config: no spending, no income, no tax drag. */
const base: KernelConfig = {
  T: 12, portfolio: 100, basisFraction: 0.4, dragM: 0, loanRateM: 0, maxLtv: 0.6, targetLtv: 0.45,
  tax: 0.238, homeMonthly: 0, destMonthly: 0, moveMonth: 12, fxSigmaM: 0, incomeMonthly: 0, incomeStartMonth: 0,
}

const withoutEcho = (r: SimulationResult) => {
  const { inputs: _i, elapsedMs: _e, ...rest } = r
  return rest
}

describe('existing loan: starting state', () => {
  it('a $500k balance on a $3M plan records year 0 as loan $500k, LTV 16.7%, net worth $2.5M on every path', () => {
    const inputs = normalizeInputs(withInputs({ existingLoan: 500_000, paths: 800 }))
    const prep = prepare(market, inputs.holdings, inputs.outlook)
    const home = findCity(CITIES_FIX, inputs.homeCityId)
    const dest = resolveDestination(inputs, home, findCity(CITIES_FIX, inputs.destCityId))
    const cfg = kernelConfig(inputs, dest)
    expect(cfg.initialLoan).toBe(500_000)
    const sc = makeScenarios(prep, inputs, inputs.paths)
    const rec = createRecorder(sc.paths, Math.floor(cfg.T / 12))
    runPaths(sc, cfg, rec)
    for (let p = 0; p < sc.paths; p++) {
      expect(rec.loan[p]).toBe(500_000)
      expect(rec.port[p]).toBe(3_000_000)
      expect(rec.nw[p]).toBe(2_500_000)
      expect(rec.ltv[p]).toBeCloseTo(1 / 6, 12)
    }
    // and the simulate bands say the same at year 0
    const r = simulate(market, CITIES_FIX, inputs)
    for (const q of ['p5', 'p50', 'p95'] as const) {
      expect(r.loan[q][0]).toBe(500_000)
      expect(r.netWorth[q][0]).toBe(2_500_000)
      expect(r.ltv[q][0]).toBeCloseTo(0.1667, 4)
    }
  })

  it('the balance accrues at loanRate: after 12 months it is balance × (1 + rate/12)^12', () => {
    const rate = 0.06
    const rec = createRecorder(1, 1)
    const clean = runPaths(flat(12), { ...base, loanRateM: rate / 12, initialLoan: 20 }, rec)
    expect(clean).toBe(1)
    expect(rec.loan[1]).toBeCloseTo(20 * (1 + rate / 12) ** 12, 10)
    expect(rec.port[1]).toBe(100)
    expect(rec.nw[1]).toBeCloseTo(100 - 20 * (1 + rate / 12) ** 12, 10)
  })
})

describe('existing loan: sell strategy', () => {
  it('starts at portfolio − balance with no debt; with zero rate, no spending and flat returns the estates match', () => {
    const rec = createRecorder(1, 1)
    runPaths(flat(12), { ...base, initialLoan: 30 }, rec)
    expect(rec.bbdEstateBeforeTax[0]).toBeCloseTo(70, 10)
    expect(rec.sellEstate[0]).toBeCloseTo(70, 10)
    expect(rec.bbdEstate[0]).toBeCloseTo(rec.sellEstate[0], 10)
    expect(rec.sellTax[0]).toBe(0)
  })

  it('scales the sell side basis pro rata, keeping the embedded-gain fraction', () => {
    // One month: V = 100, basis 40, balance 50 -> sell side Vs = 50, Bs = 20 (gain fraction 0.6).
    // Spending 10 is funded by a gross sale S = 10 / (1 - 0.6 · tax).
    const rec = createRecorder(1, 0)
    runPaths(flat(1), { ...base, T: 1, homeMonthly: 10, destMonthly: 10, moveMonth: 1, initialLoan: 50 }, rec)
    const g = 0.6
    const S = 10 / (1 - g * 0.238)
    expect(rec.sellTax[0]).toBeCloseTo(S * g * 0.238, 10)
    expect(rec.sellEstate[0]).toBeCloseTo(50 - S, 10)
  })
})

describe('existing loan: margin calls and insolvency', () => {
  it('a balance above maxLtv × portfolio forces a sale in month 0 that lands at targetLtv', () => {
    const rec = createRecorder(1, 1)
    const clean = runPaths(flat(12), { ...base, initialLoan: 70 }, rec)
    expect(clean).toBe(0)
    expect(rec.outcome[0]).toBe(1)
    expect(rec.firstCall[0]).toBe(0)
    const g = 0.6
    const S = (70 - 0.45 * 100) / (1 - g * 0.238 - 0.45)
    expect(rec.port[1]).toBeCloseTo(100 - S, 8)
    expect(rec.loan[1]).toBeCloseTo(70 - S * (1 - g * 0.238), 8)
    expect(rec.ltv[1]).toBeCloseTo(0.45, 8)
  })

  it('counts that month-0 forced sale in year 0 of marginCallByYear', () => {
    const r = simulate(market, CITIES_FIX, withInputs({ existingLoan: 2_400_000, paths: 600 }))
    expect(r.marginCallByYear[0]).toBeCloseTo(1, 9)
    expect(r.successRate).toBe(0)
  })

  it('a balance the forced sale cannot cover (above V · (1 − g·tax)) breaks in month 0', () => {
    // g = 0.6, tax 0.238: the sale reaches the target only while L < V (1 - g·tax) = 85.72.
    const rec = createRecorder(1, 1)
    runPaths(flat(12), { ...base, initialLoan: 90 }, rec)
    expect(rec.outcome[0]).toBe(2)
    expect(rec.firstCall[0]).toBe(0)
  })

  it('a balance at or above the portfolio breaks the path at once, with no negatives or NaN', () => {
    for (const L0 of [100, 150]) {
      const rec = createRecorder(1, 1)
      const up = flat(12)
      up.ret.fill(0.05) // even strong returns can't rescue it: it is liquidated before month 0
      expect(runPaths(up, { ...base, initialLoan: L0 }, rec)).toBe(0)
      expect(rec.outcome[0]).toBe(2)
      expect(rec.firstCall[0]).toBe(0)
      for (const k of [0, 1]) {
        expect(rec.port[k]).toBe(0)
        expect(rec.loan[k]).toBe(0)
        expect(rec.nw[k]).toBe(0)
        expect(rec.ltv[k]).toBe(1)
      }
      expect(rec.bbdEstate[0]).toBe(0)
      expect(rec.sellEstate[0]).toBe(0)
      expect(rec.sellTax[0]).toBe(0)
      expect(Number.isNaN(rec.cagr[0])).toBe(false)
    }
    const r = simulate(market, CITIES_FIX, withInputs({ existingLoan: 3_000_000, paths: 300 }))
    expect(r.brokenRate).toBe(1)
    expect(r.marginCallByYear[0]).toBeCloseTo(1, 9)
    expect(r.estate.sellMedian).toBe(0)
  })
})

describe('existing loan: no balance', () => {
  it('a balance of 0, or a plan without the field, gives identical results for the same seed', () => {
    const zero = simulate(market, CITIES_FIX, withInputs({ existingLoan: 0, paths: 800 }))
    const missing = withInputs({ paths: 800 }) as Partial<PlanInputs>
    delete missing.existingLoan
    expect('existingLoan' in missing).toBe(false)
    const none = simulate(market, CITIES_FIX, missing as PlanInputs)
    expect(withoutEcho(none)).toEqual(withoutEcho(zero))
    // and the kernel without initialLoan matches initialLoan: 0
    const a = createRecorder(1, 1)
    const b = createRecorder(1, 1)
    const path = flat(12)
    path.ret.fill(0.01)
    runPaths(path, { ...base, homeMonthly: 1, destMonthly: 1, loanRateM: 0.005 }, a)
    runPaths(path, { ...base, homeMonthly: 1, destMonthly: 1, loanRateM: 0.005, initialLoan: 0 }, b)
    expect(b).toEqual(a)
  })
})

describe('existing loan: odds, solver and atlas', () => {
  const inp = withInputs({ paths: 1500 })

  it('a larger balance lowers the success rate', () => {
    const rates = [0, 300_000, 800_000].map((existingLoan) => simulate(market, CITIES_FIX, { ...inp, existingLoan }).successRate)
    expect(rates[1]).toBeLessThan(rates[0])
    expect(rates[2]).toBeLessThan(rates[1])
  })

  it("a larger balance lowers the solver's max sustainable spend", () => {
    const s0 = solveSpending(market, CITIES_FIX, { ...inp, existingLoan: 0 }, 0.85)
    const s1 = solveSpending(market, CITIES_FIX, { ...inp, existingLoan: 500_000 }, 0.85)
    expect(s1.maxSpendHome).toBeLessThan(s0.maxSpendHome)
    expect(s1.maxSpendDest!).toBeLessThan(s0.maxSpendDest!)
  })

  it('reaches every Atlas city: odds are lower or equal per city, and lower for at least one', () => {
    const ids = CITIES_FIX.map((c) => c.id)
    const without = runAtlas(market, CITIES_FIX, { ...inp, existingLoan: 0 }, ids)
    const withLoan = runAtlas(market, CITIES_FIX, { ...inp, existingLoan: 500_000 }, ids)
    expect(withLoan.length).toBe(ids.length)
    let differs = 0
    for (const id of ids) {
      const a = without.find((e) => e.cityId === id)!.successRate
      const b = withLoan.find((e) => e.cityId === id)!.successRate
      expect(b).toBeLessThanOrEqual(a)
      if (b < a) differs++
    }
    expect(differs).toBeGreaterThan(0)
  })
})
