// City atlas: success rate with each city as the destination, using common random numbers
// (one scenario set, shared by every city) at the plan's full path count, so each city's
// rate equals what simulate() reports with that city as the destination.

import { budgetTotal } from './cost'
import { runPaths } from './kernel'
import { prepare } from './prepare'
import { findCity, kernelConfig, makeScenarios, normalizeInputs, resolveDestination } from './simulate'
import type { AtlasEntry, City, MarketData, PlanInputs } from './types'

export function runAtlas(market: MarketData, cities: City[], rawInputs: PlanInputs, cityIds: string[]): AtlasEntry[] {
  const inputs = normalizeInputs(rawInputs)
  const prep = prepare(market, inputs.holdings, inputs.outlook)
  const sc = makeScenarios(prep, inputs, inputs.paths)
  const home = findCity(cities, inputs.homeCityId)
  const homeSpend = budgetTotal(inputs.budget)
  const out: AtlasEntry[] = []
  for (const id of cityIds) {
    const city = findCity(cities, id)
    if (!city) continue
    const dest = resolveDestination(inputs, home, city)
    const clean = runPaths(sc, kernelConfig(inputs, dest), null)
    const spendUsd = dest.annual ?? homeSpend
    out.push({
      cityId: id,
      successRate: clean / sc.paths,
      spendUsd,
      costRatio: homeSpend > 0 ? spendUsd / homeSpend : 1,
    })
  }
  return out.sort((a, b) => b.successRate - a.successRate || a.spendUsd - b.spendUsd)
}
