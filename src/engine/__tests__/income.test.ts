import { createHash } from 'node:crypto'
import { afterAll, describe, expect, it, vi } from 'vitest'
import marketJson from '../../data/market.json'
import { CITIES } from '../../data/cities'
import { DEFAULT_INPUTS } from '../defaults'
import {
  INCOME_DEFAULTS,
  INCOME_FUNDS,
  INCOME_LIMITS,
  YIELD_FLOOR,
  incomeSeries,
  median50,
  normalizeIncomeInputs,
  runIncomeOnMonths,
  runIncomePaths,
  yieldCap,
} from '../income'
import { incomeTax } from '../incomeTax'
import type { IncomeInputs, IncomeWorkerRequest } from '../incomeTypes'
import { prepare } from '../prepare'
import { createRng } from '../rng'
import { drawBlockIndices, generateScenarios } from '../scenarios'
import { quantile, simulate } from '../simulate'
import type { MarketData } from '../types'
import { CITIES_FIX, syntheticMarket } from './fixtures'

const market = marketJson as unknown as MarketData
const withIncome = (o: Partial<IncomeInputs>): IncomeInputs => ({ ...INCOME_DEFAULTS, ...o })
const cent = (actual: number, expected: number) => expect(Math.abs(actual - expected)).toBeLessThan(0.005)

type Series = number | ((m: number) => number)
const at = (s: Series, m: number) => (typeof s === 'number' ? s : s(m))
/** A market with just the four income funds: per-fund total return and yield series, and CPI. */
function incomeMarket(
  months: number,
  r: Record<(typeof INCOME_FUNDS)[number], Series>,
  y: Record<(typeof INCOME_FUNDS)[number], Series>,
  cpi: Series = 0,
): MarketData {
  const assets: MarketData['assets'] = {}
  for (const s of INCOME_FUNDS)
    assets[s] = {
      symbol: s,
      name: s,
      cls: s === 'SPY' ? 'etf-equity' : 'etf-bond',
      first: 0,
      r: Array.from({ length: months }, (_, m) => at(r[s], m)),
      y: Array.from({ length: months }, (_, m) => at(y[s], m)),
    }
  return { asOf: '2026-11-01', start: '1993-02', months, cpi: Array.from({ length: months }, (_, m) => at(cpi, m)), assets }
}

describe('same months as eVelo', () => {
  // Captured from HEAD (281cf30) before generateScenarios learned to return its month indices.
  // The bootstrap simulate hash differs in the last bits between arm64 and x64 (their libm
  // rounds differently); the x64 value was captured in CI from 192a960, before stage 3, and
  // matches 0a6a176 there too. The scenario hashes are the same on both.
  const SIM_BOOTSTRAP: Record<string, string> = {
    arm64: '276c6b093ec7d995f8cf7da182f737077f0a15b206233f93630a7f2d78b3db2d',
    x64: '2518efdee8d7deec6194b7e0b5aabe72195fb9d198fbf8e8d6d089603eef7b65',
  }
  const GOLDEN: Record<string, string> = {
    'sim-bootstrap': SIM_BOOTSTRAP[process.arch] ?? SIM_BOOTSTRAP.x64,
    'sc-bootstrap': '79eea6f38d3f35932095a7e043a7773347607a685b3e93d1e49dd092a94053a0',
    'sim-fat-tail': '1aab50bff23151da149a919e5f9226b0e44b792a2fd1b5c8c76ab09ad8dfe799',
    'sc-fat-tail': '64e274d8d0e1b1a43eb337eaba541f76a36f66569219cec5676a940ea3526cd8',
  }
  // The eVelo yearly tallies (result.yearly) on their own, captured when they were added. They divide
  // by the path's price level and include the FX walk's exp, so they may differ by arch like the
  // bootstrap hash; an arch without an entry logs its hash instead (add it from a run there).
  const YEARLY: Record<string, Record<'bootstrap' | 'fat-tail', string>> = {
    arm64: {
      bootstrap: '15daa81b69f958cf70a327c881edfe914ab951c115fe9e36c9fcbe52642d18fd',
      'fat-tail': 'ad18b92214f30504d446a54013274f5bc42a7b0ce30e3112c036c967231bdb6d',
    },
  }
  const mkt = syntheticMarket(240, [
    { symbol: 'QQQ', alpha: 0.002, beta: 1.2, noise: 0.02, cls: 'etf-equity' },
    { symbol: 'BND', alpha: 0.003, beta: 0.1, noise: 0.01, first: 120 },
  ])
  const holdings = [{ symbol: 'SPY', weight: 0.5 }, { symbol: 'QQQ', weight: 0.3 }, { symbol: 'BND', weight: 0.2 }]
  const hashScenarios = (sc: ReturnType<typeof generateScenarios>) => {
    const h = createHash('sha256')
    for (const a of [sc.ret, sc.infl, sc.fxz]) h.update(new Uint8Array(a.buffer))
    return h.digest('hex')
  }

  for (const method of ['bootstrap', 'fat-tail'] as const) {
    it(`${method}: simulate and the scenarios are bit-identical to the golden from before`, () => {
      // The golden predates the eVelo yearly tallies: hash without them (proving every older figure
      // unchanged), and pin the tallies on their own.
      const { elapsedMs: _, yearly, ...rest } = simulate(mkt, CITIES_FIX, { ...DEFAULT_INPUTS, holdings, method, paths: 300, horizonYears: 25 })
      expect(createHash('sha256').update(JSON.stringify(rest)).digest('hex')).toBe(GOLDEN[`sim-${method}`])
      const yearlyHash = createHash('sha256').update(JSON.stringify(yearly)).digest('hex')
      if (YEARLY[process.arch]) expect(yearlyHash).toBe(YEARLY[process.arch][method])
      else console.log(`no yearly golden for ${process.arch}; ${method}: ${yearlyHash}`)
      const prep = prepare(mkt, holdings, 'balanced')
      expect(hashScenarios(generateScenarios(prep, method, 24, 200, 300, 11))).toBe(GOLDEN[`sc-${method}`])
      // Asking for the indices changes nothing else.
      const withIdx = generateScenarios(prep, method, 24, 200, 300, 11, { indices: true })
      expect(hashScenarios(withIdx)).toBe(GOLDEN[`sc-${method}`])
      expect(withIdx.idx!.length).toBe(200 * 300)
    })

    it(`${method}: the indices are the months eVelo drew`, () => {
      const prep = prepare(market, DEFAULT_INPUTS.holdings, 'balanced')
      const paths = 50, T = 360
      const sc = generateScenarios(prep, method, 24, paths, T, 7, { indices: true })
      for (let p = 0; p < paths; p++)
        for (let t = 0; t < T; t++) {
          const m = sc.idx![p * T + t]
          // CPI comes from the drawn month under both methods; returns too under bootstrap.
          expect(sc.infl[p * T + t]).toBe(Math.fround(prep.cpi[m]))
          if (method === 'bootstrap') expect(sc.ret[p * T + t]).toBe(Math.fround(prep.port[m]))
        }
      if (method === 'bootstrap') {
        // The first path replays drawBlockIndices on a fresh rng with the seed.
        const first = new Int32Array(T)
        drawBlockIndices(createRng(7), prep.months, 24, first)
        expect(Array.from(sc.idx!.subarray(0, T))).toEqual(Array.from(first))
      }
    })

    it(`${method}: indicesOnly draws the same months, skipping the values`, () => {
      const prep = prepare(market, DEFAULT_INPUTS.holdings, 'balanced')
      const full = generateScenarios(prep, method, 24, 40, 120, 3, { indices: true })
      const only = generateScenarios(prep, method, 24, 40, 120, 3, { indicesOnly: true })
      expect(Array.from(only.idx!)).toEqual(Array.from(full.idx!))
      expect(only.ret.length + only.infl.length + only.fxz.length).toBe(0)
      // skipNormal advances the rng exactly as normal() does, odd counts included.
      const a = createRng(9), b = createRng(9)
      for (let i = 0; i < 7; i++) a.normal()
      for (let i = 0; i < 7; i++) b.skipNormal()
      expect([b.normal(), b.next(), b.normal()]).toEqual([a.normal(), a.next(), a.normal()])
    })

    it(`${method}: runIncomePaths runs on eVelo's months for the same seed, paths, horizon and blocks`, () => {
      const inputs = withIncome({ method, paths: 120, horizonYears: 12, seed: 5, blockMonths: 18 })
      // The months simulate draws for these shared values, from eVelo's own holdings.
      const sc = generateScenarios(prepare(market, DEFAULT_INPUTS.holdings, inputs.outlook), method, 18, 120, 144, 5, { indices: true })
      expect(runIncomePaths(market, inputs)).toEqual(runIncomeOnMonths(market, inputs, sc.idx!))
      // And a different seed draws different months.
      expect(runIncomePaths(market, { ...inputs, seed: 6 })).not.toEqual(runIncomeOnMonths(market, inputs, sc.idx!))
    })
  }
})

describe('yields anchored to today', () => {
  const flat = { SPY: 0, VWITX: 0, VFITX: 0, VBMFX: 0 }

  it('a history that is all 1990s-like high yields still starts at the latest yield', () => {
    const M = 120
    // Yields around 6-7% for the whole stretch, then today's 2%.
    const high = (base: number) => (m: number) => (m === M - 1 ? 0.02 : base + 0.004 * Math.sin(m / 7))
    const mkt = incomeMarket(M, flat, { SPY: high(0.03), VWITX: high(0.055), VFITX: high(0.06), VBMFX: high(0.065) })
    const s = incomeSeries(mkt, 'historical')
    expect(Array.from(s.y0)).toEqual([0.02, 0.02, 0.02, 0.02])
    const inputs = withIncome({ outlook: 'historical', portfolio: 1e6, stockShare: 0, muniShare: 1, horizonYears: 1, paths: 1, spending: 0, otherIncome: 0, homeCityId: 'lisbon' })
    // A future drawn only from the 1990s stretch (never the last month).
    const idx = Int32Array.from({ length: 12 }, (_, t) => 10 + t)
    const r = runIncomeOnMonths(mkt, inputs, idx)
    expect(r.startYield).toEqual({ stocks: 0.02, munis: 0.02, taxable: 0.02 })
    // Each month moves at most one capped step, so year one pays about 2%, nowhere near 5.5%.
    const cap = s.cap[1]
    expect(cap).toBeLessThan(0.002)
    expect(r.median[0].muniInterest / 1e6).toBeGreaterThan(0.02 - 12 * cap)
    expect(r.median[0].muniInterest / 1e6).toBeLessThan(0.02 + 12 * cap)
  })

  it('caps a month’s change at the 99th percentile |Δy| and floors the yield at 0.25%', () => {
    const M = 200, J = 100
    // Flat at 0.30% except one month 2 points higher: two 0.02 moves among 199. The series starts
    // and ends at 0.30%, so the mean change is 0 and demeaning leaves the changes as they are.
    const y = (m: number) => (m === J ? 0.023 : 0.003)
    const mkt = incomeMarket(M, flat, { SPY: y, VWITX: y, VFITX: y, VBMFX: y })
    const cap = yieldCap(mkt.assets.VWITX.y!)
    // Sorted |Δy|: 197 zeros then 0.02, 0.02; position 198 × 0.99 = 196.02 → 0.02 × 0.02.
    expect(cap).toBeCloseTo(0.0004, 15)
    const s = incomeSeries(mkt, 'historical')
    expect(Array.from(s.cap)).toEqual([cap, cap, cap, cap])

    const inputs = withIncome({ outlook: 'historical', portfolio: 1e6, stockShare: 0, muniShare: 1, horizonYears: 1, paths: 1, spending: 0, otherIncome: 0, homeCityId: 'lisbon' })
    // r = 0 and no CPI: each month pays V·y/12 and V ← V(1 − y/12) on the yield at the start of the
    // month, and the yield moves at the month's end. Month 1 pays the latest yield, 0.30%.
    const year1 = (step: (y: number) => number) => {
      let v = 1e6, yy = 0.003, inc = 0
      for (let t = 0; t < 12; t++) {
        inc += (v * yy) / 12
        v *= 1 - yy / 12
        yy = step(yy)
      }
      return inc
    }
    // Replaying the jump month every month: +cap a month, not +2 points.
    const up = runIncomeOnMonths(mkt, inputs, new Int32Array(12).fill(J))
    cent(up.median[0].muniInterest, year1((yy) => yy + cap))
    // Replaying the fall month: −cap a month. Month 1 pays 0.30%, month 2 0.26%, then the floor.
    const down = runIncomeOnMonths(mkt, inputs, new Int32Array(12).fill(J + 1))
    cent(down.median[0].muniInterest, year1((yy) => Math.max(YIELD_FLOOR, yy - cap)))
    expect(year1((yy) => Math.max(YIELD_FLOOR, yy - cap))).toBeCloseTo(1e6 * (0.003 + 0.0026 + 10 * 0.0025) / 12, -1)
  })

  it('month 1 pays the starting yield, month 2 the moved one, and a rise in y raises income', () => {
    // 200 months at 2%, except a ramp: +0.1 point a month over months 100..109, then −0.1 a month
    // over 110..119, back to 2%. The series starts and ends at 2%, so the mean change is 0 and the
    // demeaned Δy is the raw change: +a at 100..109, −a at 110..119, 0 elsewhere (and 0 at month 0).
    // 20 of the 199 |Δy| are a, so the 99th percentile (position 196.02) is a: the cap doesn't bite.
    const M = 200, a = 0.001
    const y = (m: number) => (m >= 100 && m <= 109 ? 0.02 + a * (m - 99) : m >= 110 && m <= 119 ? 0.02 + a * (119 - m) : 0.02)
    // Returns chosen so each month's total return is exactly the yield the path pays in it, so the
    // value never moves (V ← V(1 + r − y/12) = V): month 105 and 115 are only drawn first, at 2%;
    // month 0 is drawn after a rise (2.1%), month 150 after a fall (1.9%), month 50 on the flat path.
    const r = (m: number) => (m === 0 ? 0.021 / 12 : m === 150 ? 0.019 / 12 : 0.02 / 12)
    const mkt = incomeMarket(M, { SPY: r, VWITX: r, VFITX: r, VBMFX: r }, { SPY: y, VWITX: y, VFITX: y, VBMFX: y })
    const s = incomeSeries(mkt, 'historical')
    expect(s.y0[1]).toBeCloseTo(0.02, 15)
    expect(s.cap[1]).toBeCloseTo(a, 12)
    expect(s.dy[105 * 4 + 1]).toBeCloseTo(a, 12)
    expect(s.dy[115 * 4 + 1]).toBeCloseTo(-a, 12)
    // All munis (federally exempt, no state): 1,200,000 pays V·y/12 = 100,000·y a month.
    const inputs = withIncome({ outlook: 'historical', portfolio: 1_200_000, stockShare: 0, muniShare: 1, horizonYears: 1, paths: 1, spending: 0, otherIncome: 0, homeCityId: 'lisbon' })
    const muni = (first: number, rest: number) =>
      runIncomeOnMonths(mkt, inputs, Int32Array.from({ length: 12 }, (_, t) => (t === 0 ? first : rest))).median[0]
    // Rise: month 1 (calendar 105) pays 2% = 2,000, then y = 2.1% and calendar 0 (Δy 0) holds it:
    // 11 × 2,100 = 23,100. Year 25,100. (Had month 1 paid the moved yield: 12 × 2,100 = 25,200.)
    const up = muni(105, 0)
    cent(up.muniInterest, 25_100)
    // The funds held at 1,200,000 all year; the untaxed 25,100 (spending 0) is reinvested at year end.
    cent(up.value, 1_225_100)
    // Flat: 12 × 2,000 = 24,000.
    cent(muni(50, 50).muniInterest, 24_000)
    // Fall: 2,000, then 11 × 1,900 = 20,900. Year 22,900 (22,800 had month 1 paid 1.9%).
    const down = muni(115, 150)
    cent(down.muniInterest, 22_900)
    cent(down.value, 1_222_900)
    expect(up.muniInterest).toBeGreaterThan(24_000)
    expect(down.muniInterest).toBeLessThan(24_000)
  })

  it('the real data starts at each fund’s latest yield, with caps near the plan’s', () => {
    const s = incomeSeries(market, 'balanced')
    const M = market.months
    expect(Array.from(s.y0)).toEqual(INCOME_FUNDS.map((f) => market.assets[f].y![M - 1]))
    // Plan: SPY 0.27, VWITX 0.13, VFITX 0.25, VBMFX 0.18 points.
    ;[0.0027, 0.0013, 0.0025, 0.0018].forEach((c, i) => expect(Math.abs(s.cap[i] - c)).toBeLessThan(0.0005))
  })
})

describe('a hand-worked path', () => {
  // Constant history: each fund's total return equals its yield / 12, so prices never move and a
  // fund pays exactly value × yield a year; no inflation, so P = 1 and nominal = real. Each yield is
  // constant, so its raw changes are 0, their mean is 0 and the demeaned Δy is 0 too: every month,
  // starting with month 1, pays the latest yield, and the order of paying and moving the yield
  // within a month (spec point 3) doesn't change any number below.
  // 2,000,000 at basis 25%: 50% stocks, bonds half munis, the rest split VFITX / VBMFX.
  //   SPY   1,000,000 × 2.0% = 20,000 qualified dividends
  //   VWITX   500,000 × 3.0% = 15,000 muni interest
  //   VFITX   250,000 × 4.0% = 10,000 Treasury interest
  //   VBMFX   250,000 × 4.8% = 12,000 taxable interest         income 57,000
  // Single, 60, federal only (a non-US home); spending 100,000; Social Security 120,000 from 62.
  const Y = { SPY: 0.02, VWITX: 0.03, VFITX: 0.04, VBMFX: 0.048 }
  const mkt = incomeMarket(24, { SPY: 0.02 / 12, VWITX: 0.03 / 12, VFITX: 0.04 / 12, VBMFX: 0.048 / 12 }, Y)
  const inputs: IncomeInputs = {
    portfolio: 2_000_000, basisFraction: 0.25, age: 60, horizonYears: 3, spending: 100_000, otherIncome: 120_000,
    incomeStartAge: 62, stockShare: 0.5, muniShare: 0.5, filingStatus: 'single', homeCityId: 'lisbon',
    method: 'bootstrap', outlook: 'historical', blockMonths: 24, paths: 1, seed: 1,
  }
  const r = runIncomeOnMonths(mkt, inputs, new Int32Array(36))

  /** The gap rule: start from the tax with no gain, then up to 6 rounds until a round moves the sale < $1. */
  const gapSale = (need: number, cashIn: number, tax: (gain: number) => number, g: number) => {
    let t = tax(0), S = need - cashIn + t
    for (let i = 0; i < 6; i++) {
      t = tax(S * g)
      const next = need - cashIn + t
      const done = Math.abs(next - S) < 1
      S = next
      if (done) break
    }
    return { S, t }
  }

  it('year 1: income by type, tax by incomeTax, a gap sale with gains tax', () => {
    const y1 = r.median[0]
    cent(y1.dividends, 20_000)
    cent(y1.muniInterest, 15_000)
    cent(y1.treasuryInterest, 10_000)
    cent(y1.taxableInterest, 12_000)
    expect(y1.otherIncome).toBe(0)
    // Tax with no sale: ordinary 22,000 + dividends 20,000 − deduction 16,100 = 25,900 taxable;
    // the dividends sit on top (5,900 ordinary at 10% = 590, dividends in the 0% band). 590.
    // Gap 100,000 − 57,000 + 590 = 43,590; gain share 1 − 0.25 = 0.75. Each round adds 15% of the
    // gain above the 49,450 0% band: taxable = 42,000 + 0.75 S − 16,100.
    //   S1 = 43,000 + 590 + 0.15 × (25,900 + 0.75 × 43,590 − 49,450)   = 44,961.375
    //   S2 = 43,000 + 590 + 0.15 × (0.75 × 44,961.375 − 23,550)        = 45,115.6546875
    //   S3 = 45,133.01115234375; S4 = 45,134.963754638672 (moved 1.95)
    //   S5 = 45,135.183422396...  (moved 0.22 < 1: stop). Tax = S5 − 43,000.
    cent(y1.gapSold, 45_135.18)
    cent(y1.tax, 2_135.18)
    expect(y1.reinvested).toBe(0)
    // And the same through incomeTax itself.
    const fed = (gain: number) =>
      incomeTax({ qualifiedDividends: 20_000, muniInterest: 15_000, treasuryInterest: 10_000, taxableInterest: 12_000, longTermGains: gain },
        { status: 'single', over65: 0, priceLevel: 1, year: 2026 }).total
    const { S, t } = gapSale(100_000, 57_000, fed, 0.75)
    cent(y1.gapSold, S)
    cent(y1.tax, t)
    cent(y1.value, 2_000_000 - S)
    cent(r.afterTaxIncome.p50[0], 57_000 - t)
  })

  it('years 2 and 3: a smaller gap sale, then Social Security and a surplus reinvested', () => {
    // Year 1's sale was pro rata, so every fund (and its basis) shrank by f1, the gain share stays 0.75.
    const S1 = r.median[0].gapSold
    const f1 = 1 - S1 / 2_000_000
    const y2 = r.median[1]
    cent(y2.dividends, 20_000 * f1)
    cent(y2.muniInterest, 15_000 * f1)
    const fed2 = (gain: number) =>
      incomeTax({ qualifiedDividends: 20_000 * f1, muniInterest: 15_000 * f1, treasuryInterest: 10_000 * f1, taxableInterest: 12_000 * f1, longTermGains: gain },
        { status: 'single', over65: 0, priceLevel: 1, year: 2027 }).total
    const g2 = gapSale(100_000, 57_000 * f1, fed2, 0.75)
    cent(y2.gapSold, g2.S)
    cent(y2.tax, g2.t)
    const V2 = 2_000_000 * f1 - g2.S
    cent(y2.value, V2)

    // Year 3 at 62: Social Security 120,000 arrives; income 57,000 × f1 × f2 more; no sale.
    const f2 = V2 / (2_000_000 * f1)
    const k = f1 * f2
    const y3 = r.median[2]
    cent(y3.otherIncome, 120_000)
    const t3 = incomeTax({ qualifiedDividends: 20_000 * k, muniInterest: 15_000 * k, treasuryInterest: 10_000 * k, taxableInterest: 12_000 * k, socialSecurity: 120_000 },
      { status: 'single', over65: 0, priceLevel: 1, year: 2028 }).total
    cent(y3.tax, t3)
    expect(y3.gapSold).toBe(0)
    const surplus = 57_000 * k + 120_000 - t3 - 100_000
    expect(surplus).toBeGreaterThan(50_000)
    cent(y3.reinvested, surplus)
    cent(y3.value, V2 + surplus)
    cent(r.value.p50[3], V2 + surplus)
    expect(y3.age).toBe(62)
    // Sold in years 1 and 2, so principal wasn't kept; spending was met; income fell then rose.
    expect(r.lastsRate).toBe(1)
    expect(r.principalKeptRate).toBe(0)
    expect(r.keepsPaceRate).toBe(1)
  })

  it('a surplus is reinvested at the target weights with basis at cost', () => {
    // Year 4 reveals year 3's reinvestment: each fund's income is (its value after year 2 + surplus × weight) × yield.
    const r4 = runIncomeOnMonths(mkt, { ...inputs, horizonYears: 4 }, new Int32Array(48))
    const V2 = r.median[1].value
    const surplus = r.median[2].reinvested
    const w = { SPY: 0.5, VWITX: 0.25, VFITX: 0.125, VBMFX: 0.125 }
    const y4 = r4.median[3]
    cent(y4.dividends, (V2 * w.SPY + surplus * w.SPY) * Y.SPY)
    cent(y4.muniInterest, (V2 * w.VWITX + surplus * w.VWITX) * Y.VWITX)
    cent(y4.treasuryInterest, (V2 * w.VFITX + surplus * w.VFITX) * Y.VFITX)
    cent(y4.taxableInterest, (V2 * w.VBMFX + surplus * w.VBMFX) * Y.VBMFX)
  })

  it('a portfolio that can’t cover the gap fails that year: value 0, not met, not keeping pace', () => {
    // Year 1 sells about 1.1M of the 2M (with gains tax); year 2 can't cover another 1M.
    const f = runIncomeOnMonths(mkt, { ...inputs, spending: 1_000_000 }, new Int32Array(36))
    cent(f.median[0].value, 2_000_000 - f.median[0].gapSold)
    expect(f.median[0].value).toBeGreaterThan(0)
    expect(f.median[1].value).toBe(0)
    expect(f.median[1].gapSold).toBeGreaterThan(0)
    expect(f.median[2].value).toBe(0)
    expect(f.median[2].gapSold).toBe(0)
    expect(f.lastsRate).toBe(0)
    expect(f.keepsPaceRate).toBe(0)
    expect(f.principalKeptRate).toBe(0)
  })

  it('inflation: amounts are nominal inside a year and real in the result, brackets lag a year', () => {
    // 0.3% a month: P = 1.003^12 = 1.036600 at the end of year one; spending is 100,000 × P nominal.
    // Bracket lag (spec point 11): year 1's brackets sit at the price level at its start, 1, so in
    // nominal terms year 1 is taxed exactly as the no-inflation year above, under 2026 law on the
    // nominal amounts. Nominal income is 57,000 (prices never move), so with no sale:
    //   ordinary 22,000 − deduction 16,100 = 5,900 at 10% = 590; dividends in the 0% band. tax₀ 590.
    //   S₀ = 103,660.00 − 57,000 + 590 = 47,250.00; gain 0.75 S.
    //   Round 1: dividends + gain = 20,000 + 35,437.50 = 55,437.50 stacked on 5,900 → 61,337.50;
    //     over 49,450 by 11,887.50 at 15% = 1,783.13; tax 2,373.12, S = 49,033.12.
    //   Rounds 2-5: tax 2,573.73, 2,596.29, 2,598.83, 2,599.12 (the last move is 0.29 < $1).
    //   S = 49,259.12 nominal, tax 2,599.12 nominal; real: S 47,519.89, tax 2,507.35,
    //   value (2,000,000 − 49,259.12) / P = 1,881,864.67, dividends 20,000 / P = 19,293.85.
    const mi = incomeMarket(24, { SPY: 0.02 / 12, VWITX: 0.03 / 12, VFITX: 0.04 / 12, VBMFX: 0.048 / 12 }, Y, 0.003)
    const ri = runIncomeOnMonths(mi, { ...inputs, horizonYears: 2 }, new Int32Array(24))
    const P = 1.003 ** 12
    const y1 = ri.median[0]
    cent(y1.dividends, 19_293.845630)
    cent(y1.gapSold, 47_519.889484)
    cent(y1.tax, 2_507.349531)
    cent(y1.value, 1_881_864.673541)
    // The same through incomeTax: real amounts at priceLevel P, brackets indexed to 1.
    const fed = (gain: number, indexLevel: number) =>
      incomeTax({ qualifiedDividends: 20_000 / P, muniInterest: 15_000 / P, treasuryInterest: 10_000 / P, taxableInterest: 12_000 / P, longTermGains: gain / P },
        { status: 'single', over65: 0, priceLevel: P, indexLevel, year: 2026 }).total * P
    cent(fed(0, 1), 590)
    const { S, t } = gapSale(100_000 * P, 57_000, (g) => fed(g, 1), 0.75)
    cent(y1.gapSold, S / P)
    cent(y1.tax, t / P)
    // Without the lag the deduction would be 16,100 × P nominal and the no-sale tax lower:
    // (22,000 − 16,689.26) × 10% = 531.07 nominal.
    cent(fed(0, P), (22_000 - 16_100 * P) * 0.1)

    // Year 2: brackets sit at P (year 2's start), income at P² = 1.074564. Everything is nominal
    // ×P, so the year-2 tax is P × 2026 law on (nominal ÷ P): the year-1 pattern, one year on.
    const f1 = 1 - S / 2_000_000
    const P2 = P * P
    const fed2 = (gain: number) =>
      incomeTax({ qualifiedDividends: (20_000 * f1) / P2, muniInterest: (15_000 * f1) / P2, treasuryInterest: (10_000 * f1) / P2, taxableInterest: (12_000 * f1) / P2, longTermGains: gain / P2 },
        { status: 'single', over65: 0, priceLevel: P2, indexLevel: P, year: 2027 }).total * P2
    // No-sale year-2 tax by hand: nominal ordinary 22,000 f1 = 21,458.16 against a deduction of
    // 16,100 × P = 16,689.26: 4,768.90 at 10% = 476.89 nominal.
    cent(fed2(0), (22_000 * f1 - 16_100 * P) * 0.1)
    const g2 = gapSale(100_000 * P2, 57_000 * f1, fed2, 0.75)
    cent(ri.median[1].gapSold, g2.S / P2)
    cent(ri.median[1].tax, g2.t / P2)
  })
})

describe('the three measures and the bands', () => {
  it('an all-bond plan spending below its income keeps principal on every path', () => {
    // Year one pays about 69,300 after tax (median). The demeaned yield changes wander around today's
    // yields rather than replaying history's fall, so by year 30 (each year's surplus reinvested) the
    // median path's real after-tax income is about 77,300 and the 5th percentile's about 32,900. What still sells is the odd path
    // where inflation and bond prices erode a year's income below spending: on these 500 paths every
    // one keeps principal at 12,000 but one sells at 14,000 (before demeaning, 8,000 sold). 10,000
    // leaves a margin.
    const r = runIncomePaths(market, withIncome({ stockShare: 0, muniShare: 0.5, portfolio: 2_000_000, spending: 10_000, otherIncome: 0, paths: 500 }))
    expect(r.afterTaxIncome.p50[0]).toBeGreaterThan(60_000)
    expect(r.afterTaxIncome.p50[29]).toBeGreaterThan(r.afterTaxIncome.p50[0])
    expect(r.principalKeptRate).toBe(1)
    expect(r.lastsRate).toBe(1)
    for (const row of r.median) expect(row.gapSold).toBe(0)
    expect(r.median[0].reinvested).toBeGreaterThan(0)
    expect(r.median[0].dividends).toBe(0)
  })

  it('spending far above income: the money lasts less often as the horizon grows', () => {
    const lasts = [5, 10, 20, 30].map((h) =>
      runIncomePaths(market, withIncome({ spending: 300_000, otherIncome: 0, horizonYears: h, paths: 1000 })).lastsRate,
    )
    for (let i = 1; i < lasts.length; i++) expect(lasts[i]).toBeLessThanOrEqual(lasts[i - 1])
    expect(lasts[0]).toBeGreaterThan(0.95)
    expect(lasts[3]).toBeLessThan(0.1)
    const r = runIncomePaths(market, withIncome({ spending: 300_000, otherIncome: 0, horizonYears: 30, paths: 400 }))
    expect(r.principalKeptRate).toBe(0)
    expect(r.keepsPaceRate).toBeLessThanOrEqual(r.lastsRate + 1e-12)
  })

  it('bands: ordered, the right lengths, and from the same quantile helper as simulate', () => {
    const paths = 300
    const inputs = withIncome({ paths, horizonYears: 20 })
    const r = runIncomePaths(market, inputs)
    expect(r.paths).toBe(paths)
    expect(r.years).toBe(20)
    expect(r.value.p50).toHaveLength(21)
    expect(r.afterTaxIncome.p50).toHaveLength(20)
    expect(r.median).toHaveLength(20)
    expect(r.value.p5[0]).toBe(inputs.portfolio)
    expect(r.value.p95[0]).toBe(inputs.portfolio)
    for (const b of [r.value, r.afterTaxIncome])
      for (let k = 0; k < b.p50.length; k++) {
        expect(b.p5[k]).toBeLessThanOrEqual(b.p25[k])
        expect(b.p25[k]).toBeLessThanOrEqual(b.p50[k])
        expect(b.p50[k]).toBeLessThanOrEqual(b.p75[k])
        expect(b.p75[k]).toBeLessThanOrEqual(b.p95[k])
      }
    for (const x of [r.lastsRate, r.principalKeptRate, r.keepsPaceRate]) expect(x >= 0 && x <= 1).toBe(true)
    // Median rows: value is the value band's median; spending the plan's.
    r.median.forEach((row, i) => {
      expect(row.value).toBe(r.value.p50[i + 1])
      expect(row.spending).toBe(inputs.spending)
      expect(row.year).toBe(i + 1)
      expect(row.age).toBe(inputs.age + i)
    })
    // The yields start at the data's latest.
    const M = market.months
    expect(r.startYield.stocks).toBe(market.assets.SPY.y![M - 1])
    expect(r.startYield.taxable).toBe((market.assets.VFITX.y![M - 1] + market.assets.VBMFX.y![M - 1]) / 2)
  })

  it('median50 equals quantile(sorted, 0.5) exactly', () => {
    const rng = createRng(3)
    for (const n of [1, 2, 3, 10, 11, 400, 4001]) {
      const a = Float64Array.from({ length: n }, () => Math.round(rng.normal() * 50) / 7)
      expect(median50(Float64Array.from(a))).toBe(quantile(Float64Array.from(a).sort(), 0.5))
    }
  })
})

describe('worker', () => {
  const sent: unknown[] = []
  const ctx: { onmessage: ((ev: { data: unknown }) => void) | null; postMessage: (m: unknown) => void } = {
    onmessage: null,
    postMessage: (m) => sent.push(m),
  }
  afterAll(() => vi.unstubAllGlobals())

  it('answers an income request with runIncomePaths’ result', async () => {
    vi.stubGlobal('self', ctx)
    await import('../worker')
    const inputs = withIncome({ paths: 60, horizonYears: 10 })
    const req: IncomeWorkerRequest = { id: 9, kind: 'income', inputs }
    ctx.onmessage!({ data: structuredClone(req) })
    expect(sent).toHaveLength(1)
    const res = structuredClone(sent[0]) as { id: number; kind: string; result: unknown }
    expect(res.id).toBe(9)
    expect(res.kind).toBe('income')
    expect(res.result).toEqual(runIncomePaths(market, inputs))
  })
})

describe('speed', () => {
  it('runIncomePaths at eVelo’s default paths and horizon takes at most 2× simulate', () => {
    expect(INCOME_DEFAULTS.paths).toBe(DEFAULT_INPUTS.paths)
    expect(INCOME_DEFAULTS.horizonYears).toBe(DEFAULT_INPUTS.horizonYears)
    // Warm both, then interleave five timed runs of each and compare the medians.
    simulate(market, CITIES, DEFAULT_INPUTS)
    runIncomePaths(market, INCOME_DEFAULTS)
    const sim: number[] = [], inc: number[] = []
    for (let i = 0; i < 5; i++) {
      let t0 = performance.now()
      simulate(market, CITIES, DEFAULT_INPUTS)
      sim.push(performance.now() - t0)
      t0 = performance.now()
      runIncomePaths(market, INCOME_DEFAULTS)
      inc.push(performance.now() - t0)
    }
    const med = (a: number[]) => [...a].sort((x, y) => x - y)[2]
    console.log(`simulate ${med(sim).toFixed(0)} ms, runIncomePaths ${med(inc).toFixed(0)} ms (4000 × 30y), ratio ${(med(inc) / med(sim)).toFixed(2)}`)
    expect(med(inc)).toBeLessThanOrEqual(2 * med(sim))
    // A loose absolute budget too, like the engine's own (1500 ms for simulate).
    expect(med(inc)).toBeLessThan(3000)
  })
})

describe('input limits on the income request', () => {
  it('clamps or defaults every field, as eVelo’s sanitizer does', () => {
    const bad = {
      ...INCOME_DEFAULTS,
      portfolio: Infinity, basisFraction: 7, age: NaN, horizonYears: 1e9, spending: -5, otherIncome: 1e308,
      incomeStartAge: 3, stockShare: -1, muniShare: NaN, filingStatus: 'hoh', homeCityId: 42, method: 'magic',
      outlook: 'rosy', blockMonths: 1e6, paths: 1e12, seed: 0.5 + 2 ** 40,
    } as unknown as IncomeInputs
    const n = normalizeIncomeInputs(bad)
    expect(n).toEqual({
      ...INCOME_DEFAULTS,
      portfolio: 0, basisFraction: 1, age: INCOME_DEFAULTS.age, horizonYears: 40, spending: 0, otherIncome: 1_000_000,
      incomeStartAge: 50, stockShare: 0, muniShare: 0, filingStatus: INCOME_DEFAULTS.filingStatus, homeCityId: INCOME_DEFAULTS.homeCityId,
      method: INCOME_DEFAULTS.method, outlook: INCOME_DEFAULTS.outlook, blockMonths: 60, paths: 10_000, seed: 2 ** 31 - 1,
    })
    expect(normalizeIncomeInputs({ ...INCOME_DEFAULTS, paths: 2.7, blockMonths: 2, seed: 12.4, age: 99, horizonYears: 0 })).toMatchObject({
      paths: 2, blockMonths: 6, seed: 12, age: 85, horizonYears: 1,
    })
    // The defaults themselves are inside the limits and unchanged.
    expect(normalizeIncomeInputs(INCOME_DEFAULTS)).toEqual(INCOME_DEFAULTS)
    for (const [k, [lo, hi]] of Object.entries(INCOME_LIMITS)) {
      const v = INCOME_DEFAULTS[k as keyof IncomeInputs] as number
      expect(v >= lo && v <= hi).toBe(true)
    }
  })

  it('huge paths, 1e308 otherIncome, NaN and bad enums give a finite, sane result', () => {
    const r = runIncomePaths(market, {
      ...INCOME_DEFAULTS, paths: 1e12, horizonYears: 3, otherIncome: 1e308, portfolio: NaN, spending: NaN,
      method: 'nope', outlook: 'nope', filingStatus: 'nope', blockMonths: NaN, seed: NaN,
    } as unknown as IncomeInputs)
    expect(r.paths).toBe(10_000)
    expect(r.years).toBe(3)
    // Portfolio 0 and spending 0 (NaN counts as 0), Social Security capped at 1,000,000: every
    // number is finite and nothing ever falls short.
    const nums = [r.lastsRate, r.principalKeptRate, r.keepsPaceRate, ...r.median.flatMap((row) => Object.values(row)), ...Object.values(r.value).flat(), ...Object.values(r.afterTaxIncome).flat()]
    for (const x of nums) if (typeof x === 'number') expect(Number.isFinite(x)).toBe(true)
    for (const row of r.median) expect(row.otherIncome).toBeLessThanOrEqual(1_000_000)
    expect(r.lastsRate).toBe(1)
  })
})
