// The currency walk is centred on the typical future: the log FX walk has no drift, so the median
// spending factor exp(X) stays 1 at every horizon (the mean rises), and currency volatility costs
// odds rather than raising them.

import { describe, expect, it } from 'vitest'
import marketJson from '../../data/market.json'
import { CITIES } from '../../data/cities'
import { DEFAULT_INPUTS } from '../defaults'
import { fxWalkStep } from '../kernel'
import { prepare } from '../prepare'
import { generateScenarios } from '../scenarios'
import { simulate } from '../simulate'
import type { MarketData, PlanInputs } from '../types'

const market = marketJson as unknown as MarketData

describe('FX walk', () => {
  it('keeps the median factor at 1 at every horizon while the mean rises', () => {
    const inputs = structuredClone(DEFAULT_INPUTS)
    const paths = 4000
    const T = 30 * 12
    const sc = generateScenarios(prepare(market, inputs.holdings, inputs.outlook), inputs.method, inputs.blockMonths, paths, T, 11)
    const sigma = 0.25 // Buenos Aires-sized volatility, a year
    const sigmaM = sigma / Math.sqrt(12)
    const X = new Float64Array(paths)
    for (let t = 0; t < T; t++) {
      for (let p = 0; p < paths; p++) X[p] = fxWalkStep(X[p], sigmaM, sc.fxz[p * T + t])
      const years = (t + 1) / 12
      if (![1, 5, 10, 20, 30].includes(years)) continue
      const f = Array.from(X, Math.exp).sort((a, b) => a - b)
      const med = (f[paths / 2 - 1] + f[paths / 2]) / 2
      const mean = f.reduce((s, x) => s + x, 0) / paths
      // The log-median's standard error is ≈ 1.25·σ√t/√n (0.034 at 30 years); allow 3 of them.
      // The old drift (−σ²/2 a month) put it at −σ²t/2 = −0.94 at 30 years.
      expect(Math.abs(Math.log(med)), `${years}y`).toBeLessThan((3 * 1.25 * sigma * Math.sqrt(years)) / Math.sqrt(paths))
      expect(mean, `${years}y`).toBeGreaterThan(med)
    }
  })

  it('raising a destination’s FX volatility never raises the odds', () => {
    for (const id of ['buenos-aires', 'lisbon', 'bangkok']) {
      const inputs: PlanInputs = { ...structuredClone(DEFAULT_INPUTS), destCityId: id, paths: 4000 }
      const zero = CITIES.map((c) => (c.id === id ? { ...c, fxVol: 0 } : c))
      expect(CITIES.find((c) => c.id === id)!.fxVol).toBeGreaterThan(0)
      const withVol = simulate(market, CITIES, inputs).successRate
      const without = simulate(market, zero, inputs).successRate
      expect(withVol, id).toBeLessThanOrEqual(without)
    }
  }, 60_000)
})
