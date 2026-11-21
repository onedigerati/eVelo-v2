// Stage 3 (matched sample futures), check 3: with equal seed, paths, block length and horizon under
// the historical method, simulate (eVelo) and runIncomePaths (living on income) pick the same path
// indices with the real picker, and those paths replay the same calendar months. Each engine's
// months are drawn the way that engine draws them: simulate via makeScenarios({ indices }), the
// income engine via its generateScenarios(..., { indicesOnly }) call on its own funds. The engines'
// outputs are tied to those draws too: simulate's picks are the picker's on eVelo's months, and the
// whole income result (samples included) is the income engine run on eVelo's months.
import { describe, expect, it } from 'vitest'
import marketJson from '../../data/market.json'
import { CITIES } from '../../data/cities'
import { DEFAULT_INPUTS } from '../defaults'
import { INCOME_DEFAULTS, INCOME_FUNDS, incomeSeries, normalizeIncomeInputs, runIncomeOnMonths, runIncomePaths } from '../income'
import type { IncomeInputs } from '../incomeTypes'
import { prepare } from '../prepare'
import { SAMPLE_KEYS, pickSampleFutures, realStockMonthly } from '../sampleFutures'
import { generateScenarios } from '../scenarios'
import { makeScenarios, normalizeInputs, simulate } from '../simulate'
import type { City, MarketData, PlanInputs } from '../types'
import { CITIES_FIX, syntheticMarket } from './fixtures'

const realMarket = marketJson as unknown as MarketData

/** A synthetic market with SPY and the income funds (with yields), 30 years of months. */
function synthMarket(): MarketData {
  const M = 360
  const m = syntheticMarket(M, [
    { symbol: 'VWITX', alpha: 0.002, beta: 0.05, noise: 0.01 },
    { symbol: 'VFITX', alpha: 0.002, beta: 0.03, noise: 0.008 },
    { symbol: 'VBMFX', alpha: 0.0025, beta: 0.08, noise: 0.01 },
  ])
  const base: Record<(typeof INCOME_FUNDS)[number], number> = { SPY: 0.018, VWITX: 0.028, VFITX: 0.035, VBMFX: 0.038 }
  for (const s of INCOME_FUNDS) {
    const a = m.assets[s]
    if (s !== 'SPY') a.cls = 'etf-bond' as typeof a.cls
    a.y = Array.from({ length: M }, (_, t) => base[s] + 0.004 * Math.sin(t / 11 + base[s] * 100))
  }
  return m
}

/** eVelo's drawn months, exactly as simulate draws them. */
function eveloMonths(market: MarketData, inputs: PlanInputs): { idx: Int32Array; T: number } {
  const n = normalizeInputs(inputs)
  const sc = makeScenarios(prepare(market, n.holdings, n.outlook), n, n.paths, { indices: true })
  return { idx: sc.idx!, T: sc.T }
}

/** The income engine's drawn months, exactly as runIncomePaths draws them. */
function incomeMonths(market: MarketData, inputs: IncomeInputs): { idx: Int32Array; T: number } {
  const n = normalizeIncomeInputs(inputs)
  const T = n.horizonYears * 12
  const sc = generateScenarios(incomeSeries(market, n.outlook).prep, n.method, n.blockMonths, n.paths, T, n.seed, { indicesOnly: true })
  return { idx: sc.idx!, T }
}

const slice = (d: { idx: Int32Array; T: number }, p: number) => Array.from(d.idx.subarray(p * d.T, (p + 1) * d.T))

interface Case {
  name: string
  market: MarketData
  cities: City[]
  evelo: PlanInputs
  income: IncomeInputs
}

/** Income inputs sharing eVelo's seed, paths, block length, horizon and method. */
const sharing = (e: PlanInputs, o: Partial<IncomeInputs> = {}): IncomeInputs => ({
  ...INCOME_DEFAULTS,
  ...o,
  method: e.method,
  seed: e.seed,
  paths: e.paths,
  blockMonths: e.blockMonths,
  horizonYears: e.horizonYears,
})

const synthEvelo: PlanInputs = {
  ...DEFAULT_INPUTS,
  holdings: [{ symbol: 'SPY', weight: 0.6 }, { symbol: 'VBMFX', weight: 0.4 }],
  method: 'bootstrap',
  paths: 400,
  horizonYears: 25,
  seed: 17,
  blockMonths: 18,
}
const realEvelo: PlanInputs = { ...DEFAULT_INPUTS, method: 'bootstrap', paths: 1000, horizonYears: 30 }

const CASES: Case[] = [
  { name: 'synthetic market', market: synthMarket(), cities: CITIES_FIX, evelo: synthEvelo, income: sharing(synthEvelo, { homeCityId: 'st-louis' }) },
  {
    name: 'bundled market, default plan, 1000 paths × 30 years',
    market: realMarket,
    cities: CITIES,
    evelo: realEvelo,
    income: sharing(realEvelo, { portfolio: 2_500_000, spending: 100_000 }),
  },
]

describe('matched sample futures across the two engines', () => {
  for (const c of CASES) {
    it(`${c.name}: same keys, same paths, same calendar months`, () => {
      const sim = simulate(c.market, c.cities, c.evelo)
      const inc = runIncomePaths(c.market, c.income)
      expect(sim.samples).not.toBeNull()
      expect(inc.samples).not.toBeNull()
      const picks = sim.samples!.map((s) => [s.key, s.path])
      expect(inc.samples!.map((s) => [s.key, s.path])).toEqual(picks)
      // Both markets have crashes, so every sample is found (a null-for-null match would prove less).
      expect(picks.map(([k]) => k)).toEqual([...SAMPLE_KEYS])
      console.log(`${c.name}: picks ${JSON.stringify(Object.fromEntries(picks))}`)

      const e = eveloMonths(c.market, c.evelo)
      // simulate's picks are the picker's on its own drawn months.
      const want = pickSampleFutures(e.idx, e.T, realStockMonthly(c.market))
      expect(picks).toEqual(SAMPLE_KEYS.filter((k) => want[k] != null).map((k) => [k, want[k]]))
      // runIncomePaths is the income engine run on eVelo's months, every figure and sample included.
      expect(inc).toEqual(runIncomeOnMonths(c.market, c.income, e.idx))

      const i = incomeMonths(c.market, c.income)
      expect(i.T).toBe(e.T)
      for (const s of sim.samples!) {
        expect(slice(e, s.path).length).toBe(e.T)
        expect(slice(i, s.path)).toEqual(slice(e, s.path))
      }
      // The whole draw matches, not just the picked paths.
      expect(i.idx).toEqual(e.idx)
    })

    for (const [what, change] of [
      ['seed', { seed: c.income.seed + 1 }],
      ['block length', { blockMonths: c.income.blockMonths === 24 ? 12 : 24 }],
    ] as const) {
      it(`${c.name}: a different ${what} draws different months for the picked paths`, () => {
        const sim = simulate(c.market, c.cities, c.evelo)
        const other = { ...c.income, ...change }
        const inc = runIncomePaths(c.market, other)
        const e = eveloMonths(c.market, c.evelo)
        const i = incomeMonths(c.market, other)
        for (const s of sim.samples!) {
          // The same path index replays other months...
          expect(slice(i, s.path)).not.toEqual(slice(e, s.path))
          // ...and so does the income engine's own pick for that key, if it has one.
          const mine = inc.samples!.find((x) => x.key === s.key)
          if (mine) expect(slice(i, mine.path)).not.toEqual(slice(e, s.path))
        }
      })
    }
  }
})
