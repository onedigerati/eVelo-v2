// Independent re-derivation of the stage-3 picker rule on the bundled market (written by the verifier).
// Plain loops: cumulative real SPY return per path, worst <=24-month decline by direct scan.
import { describe, expect, it } from 'vitest'
import marketJson from '../../../src/data/market.json'
import { CITIES } from '../../../src/data/cities'
import { DEFAULT_INPUTS } from '../../../src/engine/defaults'
import { INCOME_DEFAULTS, runIncomePaths, normalizeIncomeInputs, incomeSeries } from '../../../src/engine/income'
import { prepare } from '../../../src/engine/prepare'
import { generateScenarios } from '../../../src/engine/scenarios'
import { simulate, normalizeInputs } from '../../../src/engine/simulate'
import { pickSampleFutures } from '../../../src/engine/sampleFutures'
import type { MarketData } from '../../../src/engine/types'

const market = marketJson as unknown as MarketData

function myPicks(idx: Int32Array, T: number) {
  const spy = market.assets.SPY!.r, cpi = market.cpi
  const real = (m: number) => (1 + (spy[m] ?? 0)) / (1 + (cpi[m] ?? 0)) - 1
  const n = idx.length / T
  const cum: number[] = [], worstS: number[] = [], worstD: number[] = []
  for (let p = 0; p < n; p++) {
    const I = [1]
    for (let t = 0; t < T; t++) I.push(I[t] * (1 + real(idx[p * T + t])))
    cum.push(I[T] - 1)
    let w = 0, ws = -1
    for (let s = 0; s < T; s++) for (let k = 1; k <= 24 && s + k <= T; k++) {
      const d = I[s + k] / I[s] - 1
      if (d < w) { w = d; ws = s }
    }
    worstD.push(w); worstS.push(ws)
  }
  const sorted = (ps: number[]) => [...ps].sort((a, b) => cum[a] - cum[b] || a - b)
  const median = (ps: number[]) => ps.length ? sorted(ps)[Math.floor((ps.length - 1) / 2)] : null
  const all = [...Array(n).keys()]
  const lateStart = Math.max(T - 120, 60) // T >= 120 in all cases here
  const crash = all.filter((p) => worstD[p] <= -0.2)
  const early = crash.filter((p) => worstS[p] < 60)
  const late = crash.filter((p) => worstS[p] >= lateStart)
  return {
    picks: { earlyCrash: median(early), typical: median(all), lateCrash: median(late), lucky: sorted(all)[Math.ceil(0.9 * n) - 1] },
    stats: { n, crashes: crash.length, early: early.length, late: late.length, lateStart },
  }
}

const CASES: [string, number, number, number, number][] = [
  ['DEFAULT_INPUTS', DEFAULT_INPUTS.paths, DEFAULT_INPUTS.horizonYears, DEFAULT_INPUTS.blockMonths, DEFAULT_INPUTS.seed],
  // name, paths, horizonYears, blockMonths, seed
  ['defaults-like 1000x30y', 1000, 30, 12, 1],
  ['500x40y block24 seed 7', 500, 40, 24, 7],
  ['300x15y block6 seed 42', 300, 15, 6, 42],
]

describe('verifier: picker rule re-derived on the bundled market', () => {
  for (const [name, paths, H, block, seed] of CASES) {
    it(name, () => {
      const inputs = normalizeInputs({ ...structuredClone(DEFAULT_INPUTS), method: 'bootstrap', paths, horizonYears: H, blockMonths: block, seed })
      const prep = prepare(market, inputs.holdings, inputs.outlook)
      const T = H * 12
      const sc = generateScenarios(prep, 'bootstrap', block, paths, T, seed, { indices: true })
      const mine = myPicks(sc.idx!, T)
      const theirs = pickSampleFutures(sc.idx!, T, (() => { const a = market.assets.SPY!.r, c = market.cpi; return Float64Array.from(c, (_, m) => (1 + (a[m] ?? 0)) / (1 + (c[m] ?? 0)) - 1) })())
      const sim = simulate(market, CITIES, inputs)
      const simPicks = Object.fromEntries(sim.samples!.map((s) => [s.key, s.path]))
      const inc = runIncomePaths(market, { ...INCOME_DEFAULTS, paths, horizonYears: H, blockMonths: block, seed, method: 'bootstrap' })
      const incPicks = Object.fromEntries(inc.samples!.map((s) => [s.key, s.path]))
      console.log(`${name}: mine ${JSON.stringify(mine.picks)} stats ${JSON.stringify(mine.stats)} | picker ${JSON.stringify(theirs)} | simulate ${JSON.stringify(simPicks)} | income ${JSON.stringify(incPicks)}`)
      expect(theirs).toEqual(mine.picks)
      const nonNull = Object.fromEntries(Object.entries(mine.picks).filter(([, v]) => v !== null))
      expect(simPicks).toEqual(nonNull)
      expect(incPicks).toEqual(nonNull)
      // Same draw: income engine's months for its normalized inputs equal simulate's
      const ni = normalizeIncomeInputs({ ...INCOME_DEFAULTS, paths, horizonYears: H, blockMonths: block, seed, method: 'bootstrap' })
      const sci = generateScenarios(incomeSeries(market, ni.outlook).prep, 'bootstrap', block, paths, T, seed, { indicesOnly: true })
      for (const p of Object.values(nonNull) as number[])
        expect(Array.from(sci.idx!.subarray(p * T, (p + 1) * T))).toEqual(Array.from(sc.idx!.subarray(p * T, (p + 1) * T)))
    })
  }
})
