import { describe, expect, it } from 'vitest'
import marketJson from '../../data/market.json'
import { runAtlas } from '../atlas'
import { categoryRatios } from '../cost'
import { DEFAULT_INPUTS } from '../defaults'
import { createRecorder, runPaths, type KernelConfig } from '../kernel'
import { backfillSeries, prepare } from '../prepare'
import { createRng } from '../rng'
import { drawBlockIndices, generateScenarios } from '../scenarios'
import { outcomeDots, simulate } from '../simulate'
import { solveSpending } from '../solve'
import type { MarketData, PlanInputs } from '../types'
import { BKK, CITIES_FIX, STL, syntheticMarket } from './fixtures'

const market = marketJson as unknown as MarketData

function corr(a: ArrayLike<number>, b: ArrayLike<number>): number {
  const n = a.length
  let ma = 0, mb = 0
  for (let i = 0; i < n; i++) (ma += a[i]), (mb += b[i])
  ma /= n
  mb /= n
  let sab = 0, saa = 0, sbb = 0
  for (let i = 0; i < n; i++) {
    sab += (a[i] - ma) * (b[i] - mb)
    saa += (a[i] - ma) ** 2
    sbb += (b[i] - mb) ** 2
  }
  return sab / Math.sqrt(saa * sbb)
}
function variance(a: ArrayLike<number>): number {
  let m = 0
  for (let i = 0; i < a.length; i++) m += a[i]
  m /= a.length
  let v = 0
  for (let i = 0; i < a.length; i++) v += (a[i] - m) ** 2
  return v / (a.length - 1)
}
function olsBeta(y: ArrayLike<number>, x: ArrayLike<number>): number {
  return (corr(y, x) * Math.sqrt(variance(y))) / Math.sqrt(variance(x))
}

const withInputs = (o: Partial<PlanInputs>): PlanInputs => ({ ...DEFAULT_INPUTS, ...o })
const scaleBudget = (b: PlanInputs['budget'], m: number): PlanInputs['budget'] =>
  Object.fromEntries(Object.entries(b).map(([k, v]) => [k, v * m])) as unknown as PlanInputs['budget']

describe('block bootstrap', () => {
  const mkt = syntheticMarket(360, [{ symbol: 'B', alpha: 0, beta: 0.7, noise: 0.03 }])
  const spy = mkt.assets.SPY.r as number[]
  const b = mkt.assets.B.r as number[]
  const target = corr(spy, b)

  it('preserves cross-asset correlation (same month index for all assets)', () => {
    const rng = createRng(3)
    const idx = new Int32Array(360)
    const xs: number[] = []
    const ys: number[] = []
    for (let p = 0; p < 200; p++) {
      drawBlockIndices(rng, 360, 24, idx)
      for (const i of idx) (xs.push(spy[i]), ys.push(b[i]))
    }
    expect(target).toBeGreaterThan(0.5)
    expect(Math.abs(corr(xs, ys) - target)).toBeLessThan(0.03)
  })

  it('portfolio variance from scenarios matches the correlated historical variance', () => {
    const prep = prepare(mkt, [{ symbol: 'SPY', weight: 0.5 }, { symbol: 'B', weight: 0.5 }], 'historical')
    const sc = generateScenarios(prep, 'bootstrap', 24, 400, 360, 9)
    const hist = variance(prep.port)
    expect(variance(sc.ret) / hist).toBeGreaterThan(0.9)
    expect(variance(sc.ret) / hist).toBeLessThan(1.1)
    expect(prep.correlation[0][1]).toBeCloseTo(target, 6)
  })

  it('fat-tail draws match variance and have heavy tails', () => {
    const prep = prepare(mkt, [{ symbol: 'SPY', weight: 1 }], 'historical')
    const sc = generateScenarios(prep, 'fat-tail', 24, 300, 360, 9)
    const v = variance(sc.ret)
    expect(v / variance(prep.port)).toBeGreaterThan(0.9)
    expect(v / variance(prep.port)).toBeLessThan(1.1)
    let m = 0
    for (const x of sc.ret) m += x
    m /= sc.ret.length
    let k = 0
    for (const x of sc.ret) k += (x - m) ** 4
    const kurt = k / sc.ret.length / (v * v)
    expect(kurt).toBeGreaterThan(4) // normal = 3, t(5) = 9
  })
})

describe('prepare', () => {
  const mkt = syntheticMarket(360, [
    { symbol: 'YOUNG', alpha: 0.002, beta: 1.5, noise: 0.02, first: 300 },
    { symbol: 'HOT', alpha: 0.02, beta: 1.2, noise: 0.03, first: 240 },
  ])

  it('backfills a 5-year asset to the full calendar with beta ≈ generating beta', () => {
    const { r, beta, first } = backfillSeries(mkt, 'YOUNG')
    expect(first).toBe(300)
    expect(r.length).toBe(360)
    expect(r.every(Number.isFinite)).toBe(true)
    expect(beta).toBeGreaterThan(1.3)
    expect(beta).toBeLessThan(1.7)
    const spy = (mkt.assets.SPY.r as number[]).slice(0, 300)
    const fillBeta = olsBeta(r.slice(0, 300), spy)
    expect(fillBeta).toBeGreaterThan(1.3)
    expect(fillBeta).toBeLessThan(1.7)
    // deterministic
    expect(backfillSeries(mkt, 'YOUNG').r).toEqual(r)
  })

  it("'historical' keeps the real-history mean; 'balanced' moves it toward the prior", () => {
    const full = backfillSeries(mkt, 'HOT').r
    const realMean = full.slice(240).reduce((s, x) => s + x, 0) / 120
    const h = prepare(mkt, [{ symbol: 'HOT', weight: 1 }], 'historical').assets[0]
    expect(h.muFinal).toBeCloseTo(realMean, 12)
    expect(h.muReal).toBeCloseTo(realMean, 12)
    // a full-history asset is left completely untouched
    const spy = prepare(mkt, [{ symbol: 'SPY', weight: 1 }], 'historical')
    expect(spy.port[5]).toBe(mkt.assets.SPY.r[5])
    const b = prepare(mkt, [{ symbol: 'HOT', weight: 1 }], 'balanced').assets[0]
    const prior = (0.035 + b.beta * 0.05) / 12
    expect(b.muFinal).toBeLessThan(h.muReal)
    expect(Math.abs(b.muFinal - prior)).toBeLessThan(Math.abs(b.muReal - prior))
    // stock, n = 10 years: w = min(0.35, 10 / (10 + 20)) = 0.333
    const w = 10 / 30
    expect(b.muFinal).toBeCloseTo(w * b.muReal + (1 - w) * prior, 10)
    const c = prepare(mkt, [{ symbol: 'HOT', weight: 1 }], 'conservative').assets[0]
    expect(c.muFinal).toBeLessThan(b.muFinal)
    // volatility unchanged by the shift
    const pb = prepare(mkt, [{ symbol: 'HOT', weight: 1 }], 'balanced')
    const ph = prepare(mkt, [{ symbol: 'HOT', weight: 1 }], 'historical')
    expect(pb.volatility).toBeCloseTo(ph.volatility, 10)
  })
})

describe('outlook on a long-lived winner', () => {
  it('100% NVDA: balanced median CAGR roughly 8-16%, conservative < balanced < historical', () => {
    const run = (outlook: PlanInputs['outlook']) =>
      simulate(market, CITIES_FIX, withInputs({ holdings: [{ symbol: 'NVDA', weight: 1 }], outlook })).stats.cagrMedian
    const h = run('historical'), b = run('balanced'), c = run('conservative')
    expect(b).toBeGreaterThan(0.07) // ~8.1%; 61% vol makes the median sit low in the 8-16% band
    expect(b).toBeLessThan(0.16)
    expect(c).toBeLessThan(b)
    expect(b).toBeLessThan(h)
  })

  it('clamps beta in the prior', () => {
    const mkt = syntheticMarket(360, [{ symbol: 'WILD', alpha: 0.03, beta: 3.5, noise: 0.03 }])
    const a = prepare(mkt, [{ symbol: 'WILD', weight: 1 }], 'balanced').assets[0]
    expect(a.beta).toBeGreaterThan(3)
    const w = 0.35
    // 30 years of history: n/(n+k) = 0.6, capped at 0.35; prior uses beta clamped to 2
    expect(a.muFinal).toBeCloseTo(w * a.muReal + (1 - w) * ((0.035 + 2 * 0.05) / 12), 12)
  })
})

describe('backfill co-movement and non-equity priors', () => {
  // Two young assets sharing a non-SPY factor: correlated residuals.
  function coMoving(): MarketData {
    const mkt = syntheticMarket(360)
    const rng = createRng(11)
    const spy = mkt.assets.SPY.r as number[]
    const a: (number | null)[] = []
    const b: (number | null)[] = []
    for (let m = 0; m < 360; m++) {
      const f = 0.03 * rng.normal()
      const ra = 0.002 + 0.4 * spy[m] + f + 0.01 * rng.normal()
      const rb = 0.002 + 0.5 * spy[m] + f + 0.01 * rng.normal()
      a.push(m < 250 ? null : ra)
      b.push(m < 280 ? null : rb)
    }
    mkt.assets.YA = { symbol: 'YA', name: 'YA', cls: 'stock', first: 250, r: a }
    mkt.assets.YB = { symbol: 'YB', name: 'YB', cls: 'stock', first: 280, r: b }
    return mkt
  }

  it('co-moving young assets keep their correlation in the backfilled span (shared donor months)', () => {
    const mkt = coMoving()
    const p = prepare(mkt, [{ symbol: 'YA', weight: 0.5 }, { symbol: 'YB', weight: 0.5 }], 'historical')
    const col = (i: number, from: number, to: number) => Array.from({ length: to - from }, (_, k) => p.R[(from + k) * 2 + i])
    const real = corr(col(0, 280, 360), col(1, 280, 360))
    const filled = corr(col(0, 0, 250), col(1, 0, 250))
    expect(real).toBeGreaterThan(0.8)
    expect(Math.abs(filled - real)).toBeLessThan(0.1)
    // deterministic, independent of the simulation seed
    expect(prepare(mkt, [{ symbol: 'YA', weight: 0.5 }, { symbol: 'YB', weight: 0.5 }], 'historical').R).toEqual(p.R)
  })

  it('bonds, real estate and commodities shrink toward explicit priors', () => {
    const mkt = syntheticMarket(360, [
      { symbol: 'BOND', alpha: 0.006, beta: 0.05, noise: 0.01, first: 240 },
      { symbol: 'GOLD', alpha: 0.009, beta: 0.1, noise: 0.04, first: 240 },
      { symbol: 'REIT', alpha: 0.004, beta: 1.0, noise: 0.03, first: 240 },
    ])
    mkt.assets.BOND.cls = 'etf-bond'
    mkt.assets.GOLD.cls = 'commodity'
    mkt.assets.REIT.cls = 'etf-real-estate'
    const hold = ['BOND', 'GOLD', 'REIT'].map((symbol) => ({ symbol, weight: 1 }))
    const bal = prepare(mkt, hold, 'balanced').assets
    const con = prepare(mkt, hold, 'conservative').assets
    const wb = 10 / 30 // min(0.5, 10 / (10 + 20))
    const wc = 0.2 // min(0.25, 10 / (10 + 40))
    expect(bal[0].muFinal).toBeCloseTo(wb * bal[0].muReal + (1 - wb) * (0.04 / 12), 12)
    expect(bal[1].muFinal).toBeCloseTo(wb * bal[1].muReal + (1 - wb) * (0.04 / 12), 12)
    const reitPrior = (0.035 + Math.min(2, Math.max(0.5, bal[2].beta)) * 0.05) / 12
    expect(bal[2].muFinal).toBeCloseTo(wb * bal[2].muReal + (1 - wb) * reitPrior, 12)
    expect(con[1].muFinal).toBeCloseTo(wc * con[1].muReal + (1 - wc) * (0.04 / 12), 12)
    expect(con[1].muFinal).toBeLessThan(bal[1].muFinal)
  })
})

describe('margin call', () => {
  const cfg: KernelConfig = {
    T: 12, portfolio: 100, basisFraction: 0.4, dragM: 0, loanRateM: 0, maxLtv: 0.6, targetLtv: 0.45,
    tax: 0.238, homeMonthly: 20, destMonthly: 20, moveMonth: 12, fxSigmaM: 0, incomeMonthly: 20, incomeStartMonth: 2,
  }
  const path = (crash: number) => {
    const ret = new Float32Array(12)
    ret[1] = crash
    return { paths: 1, T: 12, ret, infl: new Float32Array(12), fxz: new Float32Array(12) }
  }

  it('fires when LTV crosses maxLtv and the forced sale lands at targetLtv incl. tax', () => {
    const rec = createRecorder(1, 1)
    const clean = runPaths(path(-0.5), cfg, rec)
    expect(clean).toBe(0)
    expect(rec.outcome[0]).toBe(1)
    expect(rec.firstCall[0]).toBe(1)
    // month 1: V = 50, L = 40, basis 40 -> gain fraction 0.2
    const g = 0.2
    const S = (40 - 0.45 * 50) / (1 - g * 0.238 - 0.45)
    expect(rec.port[1]).toBeCloseTo(50 - S, 4)
    expect(rec.loan[1]).toBeCloseTo(40 - S * (1 - g * 0.238), 4)
    expect(rec.ltv[1]).toBeCloseTo(0.45, 6)
  })

  it('does not fire below maxLtv', () => {
    const rec = createRecorder(1, 1)
    expect(runPaths(path(-0.3), cfg, rec)).toBe(1)
    expect(rec.firstCall[0]).toBe(-1)
    expect(rec.ltv[1]).toBeCloseTo(40 / 70, 5)
  })

  it('is broken when the portfolio falls below the loan', () => {
    const rec = createRecorder(1, 1)
    runPaths(path(-0.85), cfg, rec)
    expect(rec.outcome[0]).toBe(2)
    expect(rec.nw[1]).toBe(0)
    // insolvency without a prior call is recorded as the first forced sale (liquidation)
    expect(rec.firstCall[0]).toBe(1)
  })

  it('failure rate equals cumulative forced-sale probability', () => {
    const r = simulate(market, CITIES_FIX, withInputs({ holdings: [{ symbol: 'MSTR', weight: 1 }], paths: 1000 }))
    expect(r.marginCallCumulative.at(-1)!).toBeCloseTo(r.bruisedRate + r.brokenRate, 9)
  })
})

describe('cities', () => {
  // Rich lifestyle so home success sits mid-range.
  const base = withInputs({ budget: scaleBudget(DEFAULT_INPUTS.budget, 2), paths: 2000 })

  it('categoryRatios maps indices and applies the expat factor', () => {
    const r = categoryRatios(STL, BKK, 0, undefined)
    expect(r.housing).toBeCloseTo(20 / 35)
    expect(r.dining).toBeCloseTo(25 / 65)
    expect(r.healthcare).toBeCloseTo(0.3)
    expect(r.travel).toBe(1)
    const half = categoryRatios(STL, BKK, 0.5, { travel: 1.2 })
    expect(half.housing).toBeCloseTo(20 / 35 + (1 - 20 / 35) * 0.5)
    expect(half.travel).toBe(1.2)
    const one = categoryRatios(STL, BKK, 1)
    expect(Object.values(one).every((x) => x === 1)).toBe(true)
  })

  it('a cheaper destination raises success; a pricier one lowers it', () => {
    const home = simulate(market, CITIES_FIX, { ...base, destCityId: null })
    const bkk = simulate(market, CITIES_FIX, { ...base, destCityId: 'bangkok' })
    const zrh = simulate(market, CITIES_FIX, { ...base, destCityId: 'zurich' })
    expect(home.successRate).toBeGreaterThan(0.05)
    expect(home.successRate).toBeLessThan(0.95)
    expect(bkk.spendDest!).toBeLessThan(home.spendHome)
    expect(bkk.successRate).toBeGreaterThan(home.successRate + 0.05)
    expect(zrh.successRate).toBeLessThan(home.successRate)
  })

  it('expatFactor = 1 removes the savings on local-price categories', () => {
    const noFx = [STL, { ...BKK, fxVol: 0 }]
    const home = simulate(market, noFx, { ...base, destCityId: null })
    const bkk = simulate(market, noFx, { ...base, destCityId: 'bangkok', expatFactor: 1 })
    expect(bkk.spendDest).toBeCloseTo(home.spendHome, 6)
    expect(bkk.successRate).toBe(home.successRate)
  })

  it('later move is between staying and moving now', () => {
    const now = simulate(market, CITIES_FIX, { ...base, destCityId: 'bangkok' })
    const later = simulate(market, CITIES_FIX, { ...base, destCityId: 'bangkok', moveInYears: 10 })
    const home = simulate(market, CITIES_FIX, { ...base, destCityId: null })
    expect(later.successRate).toBeLessThanOrEqual(now.successRate)
    expect(later.successRate).toBeGreaterThanOrEqual(home.successRate)
  })

  it('atlas ranks cities with common random numbers', () => {
    const atlas = runAtlas(market, CITIES_FIX, base, ['st-louis', 'bangkok', 'zurich', 'nowhere'])
    expect(atlas.map((a) => a.cityId)).toEqual(['bangkok', 'st-louis', 'zurich'])
    const stl = atlas.find((a) => a.cityId === 'st-louis')!
    expect(stl.costRatio).toBe(1)
  })

  it('atlas odds equal the Outlook for every city, at the full path count', () => {
    const inp = { ...base, paths: 2500 }
    const atlas = runAtlas(market, CITIES_FIX, inp, ['st-louis', 'bangkok', 'zurich'])
    for (const e of atlas) {
      const outlook = simulate(market, CITIES_FIX, { ...inp, destCityId: e.cityId === inp.homeCityId ? null : e.cityId })
      expect(e.successRate).toBe(outlook.successRate)
    }
    // A destination set in the inputs doesn't change any city's odds.
    const withDest = runAtlas(market, CITIES_FIX, { ...inp, destCityId: 'zurich' }, ['st-louis', 'bangkok', 'zurich'])
    expect(withDest).toEqual(atlas)
  })
})

describe('results', () => {
  it('outcomeDots sums to 100 and is sorted', () => {
    for (const rates of [[0.333, 0.333, 0.334], [0.996, 0.002, 0.002], [0, 0, 1], [0.125, 0.5, 0.375]] as [number, number, number][]) {
      const d = outcomeDots(rates)
      expect(d.length).toBe(100)
      for (let i = 1; i < 100; i++) expect(d[i]).toBeGreaterThanOrEqual(d[i - 1])
    }
    const d = outcomeDots([0.125, 0.5, 0.375])
    expect(d.filter((x) => x === 0).length).toBeGreaterThanOrEqual(12)
  })

  it('is deterministic for equal seeds and differs for different seeds', () => {
    const inp = withInputs({ paths: 800 })
    const a = simulate(market, CITIES_FIX, inp)
    const b = simulate(market, CITIES_FIX, inp)
    const c = simulate(market, CITIES_FIX, { ...inp, seed: 8 })
    const strip = (r: typeof a) => ({ ...r, elapsedMs: 0 })
    expect(strip(a)).toEqual(strip(b))
    expect(a.netWorth.p50).not.toEqual(c.netWorth.p50)
    expect(a.outcomeDots.length).toBe(100)
    expect(a.successRate + a.bruisedRate + a.brokenRate).toBeCloseTo(1, 10)
    expect(a.netWorth.p50.length).toBe(31)
    expect(a.marginCallByYear.length).toBe(30)
    expect(a.marginCallCumulative[29]).toBeCloseTo(a.marginCallByYear.reduce((s, x) => s + x, 0), 10)
  })

  it('sell strategy pays capital-gains tax; BBD estate benefits from step-up', () => {
    const r = simulate(market, CITIES_FIX, withInputs({ paths: 1500 }))
    expect(r.estate.sellTaxMedian).toBeGreaterThan(0)
    expect(r.estate.bbdMedian).toBeGreaterThan(0)
    expect(r.estate.bbdWins).toBeGreaterThan(0.5)
  })

  it('reports real stats below nominal and rounds the horizon to whole years', () => {
    const r = simulate(market, CITIES_FIX, withInputs({ paths: 500, horizonYears: 20.4 }))
    expect(r.inputs.horizonYears).toBe(20)
    expect(r.netWorth.p50.length).toBe(21)
    expect(r.marginCallByYear.length).toBe(20)
    expect(r.stats.expReturnReal).toBeLessThan(r.stats.expReturn)
    expect(r.stats.cagrMedianReal).toBeLessThan(r.stats.cagrMedian)
    expect(r.stats.cagrMedianReal).toBeGreaterThan(0)
  })

  it('fat-tail method runs end to end', () => {
    const r = simulate(market, CITIES_FIX, withInputs({ method: 'fat-tail', paths: 800 }))
    expect(r.successRate).toBeGreaterThan(0)
    expect(r.successRate).toBeLessThanOrEqual(1)
  })
})

describe('solver', () => {
  it('solved spend meets the target and +10% does not', () => {
    const inp = withInputs({ paths: 1500, destCityId: null })
    const target = 0.85
    const s = solveSpending(market, CITIES_FIX, inp, target)
    const total = Object.values(inp.budget).reduce((a, b) => a + b, 0)
    const at = (m: number) =>
      simulate(market, CITIES_FIX, {
        ...inp,
        budget: scaleBudget(inp.budget, m),
      }).successRate
    const mult = s.maxSpendHome / total
    expect(s.maxSpendDest).toBeNull()
    expect(at(mult)).toBeGreaterThanOrEqual(target)
    expect(at(mult * 1.1)).toBeLessThan(target)
  })

  it('reports destination spend for a move', () => {
    const s = solveSpending(market, CITIES_FIX, withInputs({ paths: 1500 }), 0.85)
    expect(s.maxSpendDest!).toBeLessThan(s.maxSpendHome)
  })
})

describe('performance', () => {
  it('4000 paths x 30y in < 1500 ms', () => {
    simulate(market, CITIES_FIX, withInputs({ paths: 200 })) // warm-up
    const t0 = performance.now()
    const r = simulate(market, CITIES_FIX, withInputs({ paths: 4000 }))
    const ms = performance.now() - t0
    console.log(`simulate 4000x30y: ${ms.toFixed(0)} ms, success ${(r.successRate * 100).toFixed(1)}%`)
    expect(ms).toBeLessThan(1500)
  })

  it('atlas over 80 cities in < 2500 ms', () => {
    const many = Array.from({ length: 80 }, (_, i) => ({ ...(i % 2 ? BKK : STL), id: `c${i}`, idx: { ...BKK.idx, rent: 15 + i } }))
    // Warm the kernel first, as the app does (the worker runs the Outlook's simulate before the
    // Atlas), so this times the loop's throughput rather than the JIT's first pass.
    runAtlas(market, [STL, ...many.slice(0, 4)], DEFAULT_INPUTS, many.slice(0, 4).map((c) => c.id))
    const t0 = performance.now()
    const a = runAtlas(market, [STL, ...many], DEFAULT_INPUTS, many.map((c) => c.id))
    const ms = performance.now() - t0
    console.log(`atlas 80 cities: ${ms.toFixed(0)} ms`)
    expect(a.length).toBe(80)
    expect(ms).toBeLessThan(2500)
  })
})
