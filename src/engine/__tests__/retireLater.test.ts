import { describe, expect, it } from 'vitest'
import marketJson from '../../data/market.json'
import { runAtlas } from '../atlas'
import { DEFAULT_INPUTS } from '../defaults'
import { createRecorder, runPaths, type KernelConfig } from '../kernel'
import { packBands } from '../localTax'
import { kernelConfig, normalizeInputs, resolveDestination, simulate } from '../simulate'
import { solveSpending } from '../solve'
import type { City, LocalTax, MarketData, PlanInputs, SimulationResult } from '../types'
import { BKK, CITIES_FIX, STL } from './fixtures'

const market = marketJson as unknown as MarketData
const withInputs = (o: Partial<PlanInputs>): PlanInputs => ({ ...DEFAULT_INPUTS, ...o })

/** One path of `T` months with flat returns and a constant monthly inflation. */
const flat = (T: number, infl = 0) => ({
  paths: 1,
  T,
  ret: new Float32Array(T),
  infl: new Float32Array(T).fill(infl),
  fxz: new Float32Array(T),
})

/** A closed-form one-path config: no spending, no income, no tax drag, retired today. */
const base: KernelConfig = {
  T: 24, portfolio: 100, basisFraction: 0.4, dragM: 0, loanRateM: 0, maxLtv: 0.6, targetLtv: 0.45,
  tax: 0.238, homeMonthly: 0, destMonthly: 0, moveMonth: 24, fxSigmaM: 0, incomeMonthly: 0, incomeStartMonth: 0,
}

const run = (cfg: KernelConfig, sc = flat(cfg.T)) => {
  const rec = createRecorder(sc.paths, Math.floor(cfg.T / 12))
  const clean = runPaths(sc, cfg, rec)
  return { rec, clean }
}

const withoutEcho = (r: SimulationResult) => {
  const { inputs: _i, elapsedMs: _e, ...rest } = r
  return rest
}

describe('retire later: the working phase in the kernel', () => {
  it('withdraws nothing before month 12·N; CPI-inflated savings pay the loan down first, then are invested', () => {
    const infl = 0.01
    // P after month t is (1 + infl)^(t + 1); spending of 2/month would be borrowed if it ran.
    const { rec } = run({ ...base, homeMonthly: 2, destMonthly: 2, retireMonth: 12, savingsMonthly: 1, initialLoan: 3 }, flat(24, infl))
    const f = Math.fround(infl) // the scenario stores inflation as float32
    let P = 1
    let saved = 0
    for (let t = 0; t < 12; t++) {
      P *= 1 + f
      saved += P
    }
    // year 1: the loan of 3 was repaid out of savings, the rest invested
    expect(rec.loan[1]).toBe(0)
    expect(rec.port[1]).toBeCloseTo((100 + saved - 3) / P, 9)
    // year 2: spending of 2·P a month is borrowed from month 12 on, as today
    let L = 0
    for (let t = 12; t < 24; t++) {
      P *= 1 + f
      L += 2 * P
    }
    expect(rec.loan[2]).toBeCloseTo(L / P, 9)
    expect(rec.port[2]).toBeCloseTo((100 + saved - 3) / P, 9)
  })

  it('a loan keeps accruing interest while working (no savings, no withdrawals)', () => {
    const { rec } = run({ ...base, homeMonthly: 1, destMonthly: 1, loanRateM: 0.01, initialLoan: 10, retireMonth: 12 })
    expect(rec.loan[1]).toBeCloseTo(10 * 1.01 ** 12, 9)
    expect(rec.port[1]).toBe(100)
    // retired today, the same plan borrows 1 a month on top
    const now = run({ ...base, homeMonthly: 1, destMonthly: 1, loanRateM: 0.01, initialLoan: 10 }).rec
    expect(now.loan[1]).toBeGreaterThan(rec.loan[1] + 12)
  })

  it('savings raise the cost basis: a forced sale at retirement pays tax on the smaller gain fraction (BBD)', () => {
    // 12 working months of 1 → V = 112, B = 40 + 12 = 52. Month 12 borrows 80 > 0.6 · 112: forced sale.
    const { rec } = run({ ...base, T: 13, moveMonth: 13, homeMonthly: 80, retireMonth: 12, savingsMonthly: 1 })
    const V = 112
    const L = 80
    const g = 1 - 52 / V
    const S = (L - base.targetLtv * V) / (1 - g * base.tax - base.targetLtv)
    expect(rec.bbdEstateBeforeTax[0]).toBeCloseTo(V - L - S * g * base.tax, 9)
  })

  it('the sell strategy gets the same savings, invested with basis', () => {
    // no spending at all: both sides end at 100 + 12 savings
    const both = run({ ...base, T: 12, moveMonth: 12, retireMonth: 12, savingsMonthly: 1 }).rec
    expect(both.sellEstate[0]).toBeCloseTo(112, 9)
    expect(both.bbdEstate[0]).toBeCloseTo(112, 9)
    // then 10 of spending at month 12 is sold with gain fraction 1 − 52/112 (basis 40 + 12)
    const { rec } = run({ ...base, T: 13, moveMonth: 13, homeMonthly: 10, retireMonth: 12, savingsMonthly: 1 })
    const g = 1 - 52 / 112
    const S = 10 / (1 - g * base.tax)
    expect(rec.sellTax[0]).toBeCloseTo(S * g * base.tax, 9)
    expect(rec.sellEstate[0]).toBeCloseTo(112 - S, 9)
  })

  it('a sell side that starts at $0 still gets the savings (portfolio 0, or a loan >= portfolio)', () => {
    // portfolio 0: 12 working months of 10, then 12 retired months of nothing
    const zero = run({ ...base, portfolio: 0, retireMonth: 12, savingsMonthly: 10 }).rec
    expect(zero.bbdEstate[0]).toBeCloseTo(120, 9)
    expect(zero.sellEstate[0]).toBeCloseTo(120, 9)
    // an existing loan equal to the portfolio: the sell side starts at V - L = 0 and saves like BBD
    const owed = run({ ...base, initialLoan: 100, retireMonth: 12, savingsMonthly: 10 }).rec
    expect(owed.sellEstate[0]).toBeCloseTo(120, 9)
    // once retired, a sell side that ran dry stays at 0 (a surplus doesn't revive it)
    const dry = run({ ...base, portfolio: 0, retireMonth: 0, incomeMonthly: 1 }).rec
    expect(dry.sellEstate[0]).toBe(0)
  })

  it('other income counts only from max(income start, retirement)', () => {
    const cfg = { ...base, incomeMonthly: 1, retireMonth: 12 }
    // income "starts" at month 6 but the plan retires at 12: nothing before 12
    const early = run({ ...cfg, incomeStartMonth: 6 }).rec
    expect(early.port[1]).toBe(100)
    expect(early.port[2]).toBeCloseTo(112, 9)
    // income starting after retirement starts on its own date
    const late = run({ ...cfg, incomeStartMonth: 18 }).rec
    expect(late.port[1]).toBe(100)
    expect(late.port[2]).toBeCloseTo(106, 9)
  })

  it('the move and wealth tax start no earlier than retirement, even in a hand-written config', () => {
    const wealthTax = { gross: true, bands: packBands([{ from: 0, rate: 0.01 }]) }
    const cfg = { ...base, T: 48, homeMonthly: 0.5, destMonthly: 1, wealthTax }
    // moving at 0 but retiring at 24 is the same as moving at 24 (savings 0)
    const retired24 = run({ ...cfg, moveMonth: 0, retireMonth: 24 }).rec
    const moved24 = run({ ...cfg, moveMonth: 24, retireMonth: 24 }).rec
    expect(retired24).toEqual(moved24)
    // the tax is first charged at month 35 (two charges by the horizon), not at month 11
    const plain = run({ ...cfg, moveMonth: 24 }).rec
    expect(retired24.wealthTax[0]).toBeGreaterThan(0)
    expect(retired24.wealthTax[0]).toBeCloseTo(2 * 0.01 * 100, 9)
    expect(plain.wealthTax[0]).toBeCloseTo(retired24.wealthTax[0], 9)
  })

  it('retireMonth 0 and savingsMonthly 0 match a config without the fields; savings alone do nothing when retired today', () => {
    const cfg = { ...base, homeMonthly: 1, destMonthly: 1, loanRateM: 0.005, initialLoan: 5 }
    const sc = flat(24, 0.002)
    sc.ret.fill(0.01)
    const a = run(cfg, sc).rec
    expect(run({ ...cfg, retireMonth: 0, savingsMonthly: 0 }, sc).rec).toEqual(a)
    expect(run({ ...cfg, retireMonth: 0, savingsMonthly: 50 }, sc).rec).toEqual(a)
  })
})

const tax = (o: Partial<LocalTax>): LocalTax => ({ note: 'test', sources: [], ...o })
const city = (localTax?: LocalTax): City => ({ ...BKK, ...(localTax ? { localTax } : {}) })

describe('retire later: kernelConfig and normalizeInputs', () => {
  const cfgOf = (o: Partial<PlanInputs>, lt?: LocalTax) => {
    const i = withInputs(o)
    return kernelConfig(i, resolveDestination(i, STL, city(lt)))
  }

  it('retireMonth is 12·N; the move month is max(move, retirement); savings are monthly', () => {
    const c = cfgOf({ retireInYears: 3, savingsWhileWorking: 24_000, moveInYears: 0 })
    expect(c.retireMonth).toBe(36)
    expect(c.moveMonth).toBe(36)
    expect(c.savingsMonthly).toBe(2000)
    expect(cfgOf({ retireInYears: 3, moveInYears: 5 }).moveMonth).toBe(60)
    expect(cfgOf({ retireInYears: 0 }).moveMonth).toBe(0)
    // staying home: no move at all
    const i = withInputs({ retireInYears: 3, destCityId: null })
    expect(kernelConfig(i, resolveDestination(i, STL, null)).moveMonth).toBe(i.horizonYears * 12)
  })

  it('the plan still ends at the same age: the horizon counts from today', () => {
    const c = cfgOf({ retireInYears: 5, horizonYears: 30 })
    expect(c.T).toBe(360)
    const r = simulate(market, CITIES_FIX, withInputs({ retireInYears: 5, savingsWhileWorking: 30_000, paths: 200 }))
    expect(r.netWorth.p50.length).toBe(31)
    expect(r.marginCallByYear.length).toBe(30)
  })

  it('the inheritance residence test uses the effective move month', () => {
    const lt = tax({ inheritance: { perHeirAllowance: 0, bands: [{ from: 0, rate: 0.3 }], afterYearsResident: 10 } })
    // horizon 20: moving now gives 20 years resident; retiring in 12 leaves 8
    expect(cfgOf({ horizonYears: 20, moveInYears: 0, retireInYears: 0 }, lt).inheritance).not.toBeNull()
    expect(cfgOf({ horizonYears: 20, moveInYears: 0, retireInYears: 12 }, lt).inheritance).toBeNull()
  })

  it('the wealth tax starts no earlier than retirement in simulate', () => {
    const lt = tax({ wealth: { base: 'net', bands: [{ from: 0, rate: 0.01 }] } })
    const cities = [STL, city(lt)]
    const later = simulate(market, cities, withInputs({ retireInYears: 10, moveInYears: 0, paths: 300 }))
    const movedLater = simulate(market, cities, withInputs({ retireInYears: 10, moveInYears: 10, paths: 300 }))
    expect(withoutEcho(later)).toEqual(withoutEcho(movedLater))
  })

  it('sanitizes retireInYears and savingsWhileWorking', () => {
    const n = (o: Partial<PlanInputs>) => normalizeInputs(withInputs(o))
    expect(n({ retireInYears: 2.4 }).retireInYears).toBe(2)
    expect(n({ retireInYears: 2.6 }).retireInYears).toBe(3)
    expect(n({ retireInYears: -3 }).retireInYears).toBe(0)
    expect(n({ retireInYears: 40 }).retireInYears).toBe(15)
    expect(n({ retireInYears: 12, horizonYears: 10 }).retireInYears).toBe(9)
    expect(n({ retireInYears: 5, horizonYears: 1 }).retireInYears).toBe(0)
    expect(n({ retireInYears: NaN }).retireInYears).toBe(0)
    expect(n({ retireInYears: Infinity }).retireInYears).toBe(0)
    expect(n({ savingsWhileWorking: -1 }).savingsWhileWorking).toBe(0)
    expect(n({ savingsWhileWorking: 5e6 }).savingsWhileWorking).toBe(1_000_000)
    expect(n({ savingsWhileWorking: NaN }).savingsWhileWorking).toBe(0)
    expect(n({ savingsWhileWorking: Infinity }).savingsWhileWorking).toBe(0)
    const missing = withInputs({}) as Partial<PlanInputs>
    delete missing.retireInYears
    delete missing.savingsWhileWorking
    const m = normalizeInputs(missing as PlanInputs)
    expect(m.retireInYears).toBe(0)
    expect(m.savingsWhileWorking).toBe(0)
    // unchanged inputs come back as the same object
    const d = withInputs({ retireInYears: 4, savingsWhileWorking: 20_000 })
    expect(normalizeInputs(d)).toBe(d)
  })

  it('retire-in 0 with savings $0 gives identical results to a plan without the fields', () => {
    const zero = simulate(market, CITIES_FIX, withInputs({ retireInYears: 0, savingsWhileWorking: 0, paths: 600 }))
    const missing = withInputs({ paths: 600 }) as Partial<PlanInputs>
    delete missing.retireInYears
    delete missing.savingsWhileWorking
    expect(withoutEcho(simulate(market, CITIES_FIX, missing as PlanInputs))).toEqual(withoutEcho(zero))
    // savings with retire-in 0 change nothing either (no working months)
    const saved = simulate(market, CITIES_FIX, withInputs({ retireInYears: 0, savingsWhileWorking: 50_000, paths: 600 }))
    expect(withoutEcho(saved)).toEqual(withoutEcho(zero))
  })
})

describe('retire later: odds, solver and atlas', () => {
  const inp = withInputs({ paths: 1500 })
  const later = { ...inp, retireInYears: 5, savingsWhileWorking: 50_000 }

  it('retiring later with savings raises the odds at the defaults', () => {
    const now = simulate(market, CITIES_FIX, inp)
    const r = simulate(market, CITIES_FIX, later)
    expect(r.successRate).toBeGreaterThan(now.successRate)
    expect(r.netWorth.p50[5]).toBeGreaterThan(now.netWorth.p50[5])
    // savings alone (same retire-in) also help
    const noSavings = simulate(market, CITIES_FIX, { ...later, savingsWhileWorking: 0 })
    expect(r.estate.bbdMedian).toBeGreaterThan(noSavings.estate.bbdMedian)
  })

  it('retiring later with savings raises safe spending', () => {
    const s0 = solveSpending(market, CITIES_FIX, inp, 0.85)
    const s1 = solveSpending(market, CITIES_FIX, later, 0.85)
    expect(s1.maxSpendHome).toBeGreaterThan(s0.maxSpendHome)
    expect(s1.maxSpendDest!).toBeGreaterThan(s0.maxSpendDest!)
  })

  it('the solver scales retirement spending only, never the savings', () => {
    const i = normalizeInputs(later)
    const dest = resolveDestination(i, STL, BKK)
    const one = kernelConfig(i, dest, 1)
    for (const mult of [0, 0.5, 3]) {
      const c = kernelConfig(i, dest, mult)
      expect(c.savingsMonthly).toBe(50_000 / 12)
      expect(c.homeMonthly).toBeCloseTo(one.homeMonthly * mult, 9)
      expect(c.destMonthly).toBeCloseTo(one.destMonthly * mult, 9)
    }
    // with a huge savings figure and retirement in 15 years, the solver finds a much larger
    // lifestyle than savings 0; it would not if savings were scaled down with the multiplier
    const rich = solveSpending(market, CITIES_FIX, { ...i, retireInYears: 15, savingsWhileWorking: 1_000_000, paths: 400 }, 0.85)
    const poor = solveSpending(market, CITIES_FIX, { ...i, retireInYears: 15, savingsWhileWorking: 0, paths: 400 }, 0.85)
    expect(rich.maxSpendHome).toBeGreaterThan(poor.maxSpendHome * 1.5)
  })

  it('Atlas odds follow retire-in and savings, and match simulate', () => {
    const ids = CITIES_FIX.map((c) => c.id)
    const base0 = runAtlas(market, CITIES_FIX, inp, ids)
    const retireOnly = runAtlas(market, CITIES_FIX, { ...later, savingsWhileWorking: 0 }, ids)
    const both = runAtlas(market, CITIES_FIX, later, ids)
    for (const id of ids) {
      const a = base0.find((e) => e.cityId === id)!.successRate
      const r = retireOnly.find((e) => e.cityId === id)!.successRate
      const b = both.find((e) => e.cityId === id)!.successRate
      expect(r, id).not.toBe(a)
      expect(b, id).toBeGreaterThan(r)
      expect(b, id).toBeGreaterThan(a)
    }
    const bkk = both.find((e) => e.cityId === 'bangkok')!.successRate
    expect(bkk).toBe(simulate(market, CITIES_FIX, later).successRate)
  })
})
