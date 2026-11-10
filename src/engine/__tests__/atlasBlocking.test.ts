// runAtlas runs cities over blocks of 256 paths; each city's rate must still equal one unblocked
// runPaths over every path of the plan's scenarios. 700 paths: two full blocks and a partial one.

import { describe, expect, it } from 'vitest'
import marketJson from '../../data/market.json'
import { CITIES } from '../../data/cities'
import { runAtlas } from '../atlas'
import { DEFAULT_INPUTS } from '../defaults'
import { runPaths } from '../kernel'
import { prepare } from '../prepare'
import { findCity, kernelConfig, makeScenarios, normalizeInputs, resolveDestination } from '../simulate'
import type { MarketData, PlanInputs } from '../types'

const market = marketJson as unknown as MarketData
const IDS = CITIES.map((c) => c.id)
const plan = (o: Partial<PlanInputs>): PlanInputs => ({ ...structuredClone(DEFAULT_INPUTS), paths: 700, ...o })

const PLANS: [string, PlanInputs][] = [
  ['default plan', plan({})],
  ['existing loan', plan({ existingLoan: 400_000 })],
  ['retire later with savings', plan({ retireInYears: 6, savingsWhileWorking: 40_000 })],
  ['fat-tail', plan({ method: 'fat-tail' })],
]

describe('Atlas path blocking is exact', () => {
  for (const [name, raw] of PLANS) {
    it(`${name}: every city's rate equals one unblocked run over all 700 paths`, () => {
      const inputs = normalizeInputs(raw)
      const sc = makeScenarios(prepare(market, inputs.holdings, inputs.outlook), inputs, inputs.paths)
      expect(sc.paths % 256).not.toBe(0)
      const home = findCity(CITIES, inputs.homeCityId)
      const atlas = runAtlas(market, CITIES, raw, IDS)
      expect(atlas.length).toBe(IDS.length)
      for (const e of atlas) {
        const dest = resolveDestination(inputs, home, findCity(CITIES, e.cityId))
        expect(e.successRate, e.cityId).toBe(runPaths(sc, kernelConfig(inputs, dest), null) / sc.paths)
      }
    })
  }
})
