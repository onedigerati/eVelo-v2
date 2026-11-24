// Swap the mixes, stage 1: the mix mapping, the swapped eVelo plan (and its months), and Same
// storm's picks under the swap, with real engine calls on the bundled market.

import { describe, expect, it } from 'vitest'
import marketJson from '../../../data/market.json'
import { CITIES } from '../../../data/cities'
import { DEFAULT_INPUTS } from '../../../engine/defaults'
import { INCOME_DEFAULTS, INCOME_FUNDS, runIncomePaths } from '../../../engine/income'
import type { IncomeInputs } from '../../../engine/incomeTypes'
import { prepare } from '../../../engine/prepare'
import { pickSampleFutures, realStockMonthly } from '../../../engine/sampleFutures'
import { makeScenarios, normalizeInputs, simulate } from '../../../engine/simulate'
import type { AssetClass, MarketData, PlanInputs } from '../../../engine/types'
import { sanitizeHoldings } from '../../../state/share'
import { incomeHoldings } from '../compare'
import { stormFutures, stormGate } from '../sameStorm'
import { assetClassOf, mixShares, swapInputs, swappedEveloPlan, swappedIncomeInputs } from '../swap'

const market = marketJson as unknown as MarketData

describe('mixShares: eVelo holdings onto the mode’s shares', () => {
  it('reads asset classes from the ticker index (and knows the mode’s own funds)', () => {
    const want: Record<string, AssetClass> = {
      VTI: 'etf-equity', XLRE: 'etf-real-estate', GLD: 'commodity', 'BTC-USD': 'crypto', BND: 'etf-bond', MUB: 'etf-bond',
      SPY: 'etf-equity', VWITX: 'etf-bond', VFITX: 'etf-bond', VBMFX: 'etf-bond',
    }
    for (const [s, cls] of Object.entries(want)) expect(assetClassOf(s), s).toBe(cls)
    expect(assetClassOf('NOPE')).toBeUndefined()
  })

  it('equity, real estate, commodity and crypto count as stocks; bonds as bonds; MUB and VWITX as munis within the bonds', () => {
    const s = mixShares([
      { symbol: 'VTI', weight: 0.3 },
      { symbol: 'AAPL', weight: 0.05 },
      { symbol: 'VNQ', weight: 0.1 },
      { symbol: 'GLD', weight: 0.05 },
      { symbol: 'BTC-USD', weight: 0.1 },
      { symbol: 'BND', weight: 0.2 },
      { symbol: 'MUB', weight: 0.15 },
      { symbol: 'VWITX', weight: 0.05 },
    ])!
    expect(s.stockShare).toBeCloseTo(0.6, 12)
    expect(s.muniShare).toBeCloseTo(0.2 / 0.4, 12)
  })

  it('a plan with no bonds gives muni share 0 (and stock share 1)', () => {
    expect(mixShares([{ symbol: 'VTI', weight: 0.7 }, { symbol: 'GLD', weight: 0.3 }])).toEqual({ stockShare: 1, muniShare: 0 })
  })

  it('weights are renormalised; zero, non-finite and unknown holdings are left out; nothing left gives null', () => {
    const s = mixShares([
      { symbol: 'VTI', weight: 3 },
      { symbol: 'BND', weight: 1 },
      { symbol: 'NOPE', weight: 5 },
      { symbol: 'MUB', weight: 0 },
      { symbol: 'GLD', weight: NaN },
    ])!
    expect(s).toEqual({ stockShare: 0.75, muniShare: 0 })
    expect(mixShares([])).toBeNull()
    expect(mixShares([{ symbol: 'NOPE', weight: 1 }])).toBeNull()
  })

  it('the default eVelo plan maps to 90% stocks, no munis; the mode’s own mix maps back onto its own shares', () => {
    expect(mixShares(DEFAULT_INPUTS.holdings)!.stockShare).toBeCloseTo(0.9, 12)
    expect(mixShares(DEFAULT_INPUTS.holdings)!.muniShare).toBe(0)
    const back = mixShares(incomeHoldings({ stockShare: 0.55, muniShare: 0.3 }))!
    expect(back.stockShare).toBeCloseTo(0.55, 12)
    expect(back.muniShare).toBeCloseTo(0.3, 12)
  })

  it('the swapped income inputs are the mode’s own with the two shares from eVelo’s mix (null for an empty mix)', () => {
    const plan: PlanInputs = { ...DEFAULT_INPUTS, holdings: [{ symbol: 'SPY', weight: 0.5 }, { symbol: 'MUB', weight: 0.25 }, { symbol: 'AGG', weight: 0.25 }] }
    const sw = swappedIncomeInputs(INCOME_DEFAULTS, plan)!
    expect(sw).toEqual({ ...INCOME_DEFAULTS, stockShare: 0.5, muniShare: 0.5 })
    expect(swappedIncomeInputs(INCOME_DEFAULTS, { holdings: [] })).toBeNull()
    expect(swapInputs('evelo', plan, INCOME_DEFAULTS)).toEqual({ mode: 'evelo', evelo: plan, income: sw, swapped: 'income' })
    expect(swapInputs('own', plan, INCOME_DEFAULTS)).toEqual({ mode: 'own', evelo: plan, income: INCOME_DEFAULTS, swapped: null })
  })
})

/** A small but real run: the default plan, fewer paths. */
const plan: PlanInputs = { ...DEFAULT_INPUTS, paths: 300 }
const income: IncomeInputs = { ...INCOME_DEFAULTS, stockShare: 0.6, muniShare: 0.4, paths: 300 }

describe('the swapped eVelo plan', () => {
  it('is the saved plan with holdings = the mode’s four funds at its weights, built without the sanitizer', () => {
    const sw = swappedEveloPlan(plan, income)
    const { holdings, ...rest } = sw
    const { holdings: _own, ...planRest } = plan
    expect(rest).toEqual(planRest)
    expect(holdings).toEqual([
      { symbol: 'SPY', weight: 0.6 },
      { symbol: 'VWITX', weight: 0.4 * 0.4 },
      { symbol: 'VFITX', weight: (0.4 * 0.6) / 2 },
      { symbol: 'VBMFX', weight: (0.4 * 0.6) / 2 },
    ])
    expect(holdings.map((h) => h.symbol)).toEqual([...INCOME_FUNDS])
    expect(swapInputs('income', plan, income)).toEqual({ mode: 'income', evelo: sw, income, swapped: 'evelo' })
    // The sanitizer would have dropped the bond funds: the swap must not go through it.
    expect(sanitizeHoldings(holdings).map((h) => h.symbol)).toEqual(['SPY'])
    // The saved plan is untouched.
    expect(plan.holdings).toBe(DEFAULT_INPUTS.holdings)
  })

  it('simulates over the same months as the unswapped plan (whole calendar, same drawn months)', () => {
    const young: PlanInputs = { ...plan, holdings: [{ symbol: 'IBIT', weight: 0.5 }, { symbol: 'ARM', weight: 0.5 }] }
    for (const p of [plan, young]) {
      const sw = swappedEveloPlan(p, income)
      const a = prepare(market, p.holdings, p.outlook)
      const b = prepare(market, sw.holdings, sw.outlook)
      // Prepared over the whole bundled calendar either way, however young the holdings.
      expect(a.months).toBe(market.months)
      expect(b.months).toBe(market.months)
      expect(Array.from(b.cpi)).toEqual(Array.from(a.cpi))
      // And the bootstrap draws exactly the same calendar months, path by path.
      const sa = makeScenarios(a, normalizeInputs(p), p.paths, { indices: true })
      const sb = makeScenarios(b, normalizeInputs(sw), sw.paths, { indices: true })
      expect(sb.T).toBe(sa.T)
      expect(sb.paths).toBe(sa.paths)
      expect(Array.from(sb.idx!)).toEqual(Array.from(sa.idx!))
    }
  })
})

describe('Same storm under the swap', () => {
  it('picks the same path indices with eVelo on the mode’s mix as on its own (real engine calls)', () => {
    const own = simulate(market, CITIES, plan)
    const sw = swappedEveloPlan(plan, income)
    const swapped = simulate(market, CITIES, sw)
    // The runs really differ (different holdings), but the sample futures are the same paths.
    expect(swapped.portfolioValue.p50).not.toEqual(own.portfolioValue.p50)
    const picks = (r: typeof own) => r.samples!.map((s) => [s.key, s.path])
    expect(own.samples!.length).toBeGreaterThan(0)
    expect(picks(swapped)).toEqual(picks(own))
    // They are the picker's plan-neutral rule over the drawn months.
    const sc = makeScenarios(prepare(market, sw.holdings, sw.outlook), normalizeInputs(sw), sw.paths, { indices: true })
    const rule = pickSampleFutures(sc.idx!, sc.T, realStockMonthly(market))
    for (const s of swapped.samples!) expect(rule[s.key]).toBe(s.path)

    // Same storm itself shows the same futures for both pairs.
    const inc = { ...income, horizonYears: plan.horizonYears, seed: plan.seed, blockMonths: plan.blockMonths, method: plan.method }
    const incomeResult = runIncomePaths(market, inc)
    expect(stormGate(plan, own, inc, incomeResult)).toBe('shown')
    expect(stormGate(sw, swapped, inc, incomeResult)).toBe('shown')
    const paths = (fs: ReturnType<typeof stormFutures>) => fs.map((f) => [f.label, f.path])
    expect(paths(stormFutures(sw, swapped, inc, incomeResult))).toEqual(paths(stormFutures(plan, own, inc, incomeResult)))
  })
})
