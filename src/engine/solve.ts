// Safe-spending solver: bisection on a uniform budget multiplier (common random numbers) for the
// largest lifestyle whose success rate is still >= target.

import { budgetTotal } from './cost'
import { runPaths } from './kernel'
import { prepare } from './prepare'
import { findCity, kernelConfig, makeScenarios, normalizeInputs, resolveDestination } from './simulate'
import type { City, MarketData, PlanInputs, SolveResult } from './types'

export const SOLVE_MAX_PATHS = 1500
const ITERATIONS = 14

export function solveSpending(market: MarketData, cities: City[], rawInputs: PlanInputs, target: number): SolveResult {
  const inputs = normalizeInputs(rawInputs)
  const prep = prepare(market, inputs.holdings, inputs.outlook)
  const sc = makeScenarios(prep, inputs, Math.min(inputs.paths, SOLVE_MAX_PATHS))
  const home = findCity(cities, inputs.homeCityId)
  const dest = resolveDestination(inputs, home, findCity(cities, inputs.destCityId))
  const success = (mult: number) => runPaths(sc, kernelConfig(inputs, dest, mult), null) / sc.paths

  let lo = 0
  let hi = 1
  // Grow the bracket until the target fails (cap avoids looping on degenerate inputs).
  while (success(hi) >= target && hi < 1024) {
    lo = hi
    hi *= 2
  }
  if (success(lo) < target) lo = 0
  for (let i = 0; i < ITERATIONS; i++) {
    const mid = (lo + hi) / 2
    if (success(mid) >= target) lo = mid
    else hi = mid
  }
  return {
    maxSpendHome: budgetTotal(inputs.budget) * lo,
    maxSpendDest: dest.annual != null ? dest.annual * lo : null,
    target,
  }
}
