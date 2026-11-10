// City atlas: success rate with each city as the destination, using common random numbers
// (one scenario set, shared by every city) at the plan's full path count, so each city's
// rate equals what simulate() reports with that city as the destination.

import { budgetTotal } from './cost'
import { runPaths } from './kernel'
import { prepare } from './prepare'
import { findCity, kernelConfig, makeScenarios, normalizeInputs, resolveDestination } from './simulate'
import type { Scenarios } from './scenarios'
import type { AtlasEntry, City, MarketData, PlanInputs } from './types'

/**
 * The last plan's scenarios, kept by a worker that ranks one ranking in several chunks so each
 * chunk after the first skips regenerating them. Keyed by the full normalized inputs.
 */
export interface ScenarioMemo {
  current: { key: string; sc: Scenarios } | null
}

/** Paths per block: 256 paths × 30 years × 3 Float32 series ≈ 1.1 MB. */
const PATH_BLOCK = 256

/** Paths [p0, p1) of `sc`, sharing its buffers. */
function blockView(sc: Scenarios, p0: number, p1: number): Scenarios {
  const a = p0 * sc.T
  const b = p1 * sc.T
  return { paths: p1 - p0, T: sc.T, ret: sc.ret.subarray(a, b), infl: sc.infl.subarray(a, b), fxz: sc.fxz.subarray(a, b) }
}

export function runAtlas(market: MarketData, cities: City[], rawInputs: PlanInputs, cityIds: string[], memo?: ScenarioMemo): AtlasEntry[] {
  const inputs = normalizeInputs(rawInputs)
  const key = memo ? JSON.stringify(inputs) : ''
  let sc = memo?.current?.key === key ? memo.current.sc : null
  if (!sc) {
    // Let the previous plan's scenarios go before building these (never two sets alive at once).
    if (memo) memo.current = null
    sc = makeScenarios(prepare(market, inputs.holdings, inputs.outlook), inputs, inputs.paths)
    if (memo) memo.current = { key, sc }
  }
  const home = findCity(cities, inputs.homeCityId)
  const homeSpend = budgetTotal(inputs.budget)
  const runs: { id: string; cfg: ReturnType<typeof kernelConfig>; spendUsd: number; clean: number }[] = []
  for (const id of cityIds) {
    const city = findCity(cities, id)
    if (!city) continue
    const dest = resolveDestination(inputs, home, city)
    runs.push({ id, cfg: kernelConfig(inputs, dest), spendUsd: dest.annual ?? homeSpend, clean: 0 })
  }
  // Paths are independent (no recorder), so run every city over one block of paths at a time:
  // the block's scenarios (~1 MB) stay in cache across cities instead of streaming all ~17 MB
  // from memory once per city — which several workers at once would otherwise contend for.
  // The clean-path counts, and so the rates, are exactly those of one run over all paths.
  for (let p0 = 0; p0 < sc.paths; p0 += PATH_BLOCK) {
    const view = blockView(sc, p0, Math.min(sc.paths, p0 + PATH_BLOCK))
    for (const r of runs) r.clean += runPaths(view, r.cfg, null)
  }
  const out: AtlasEntry[] = runs.map((r) => ({
    cityId: r.id,
    successRate: r.clean / sc.paths,
    spendUsd: r.spendUsd,
    costRatio: homeSpend > 0 ? r.spendUsd / homeSpend : 1,
  }))
  return out.sort(compareAtlas)
}

/** The ranking order: best odds first, then the cheaper city. */
export const compareAtlas = (a: AtlasEntry, b: AtlasEntry) => b.successRate - a.successRate || a.spendUsd - b.spendUsd

/**
 * Cut a ranking's cities into consecutive chunks of `size` (≥ 1). Workers take chunks from a queue
 * as they free up, so a slow worker doesn't hold the whole ranking back. Every chunk run uses the
 * same common random scenarios — generated from the plan's own seed — so each city's rate matches
 * a single run exactly.
 */
export function chunkCities(cityIds: string[], size: number): string[][] {
  const k = Math.max(1, Math.floor(size) || 1)
  const out: string[][] = []
  for (let i = 0; i < cityIds.length; i += k) out.push(cityIds.slice(i, i + k))
  return out
}

/** Chunk size for `n` cities over `workers` workers: about 4 chunks per worker, 1..10 cities. */
export function atlasChunkSize(n: number, workers: number): number {
  return Math.max(1, Math.min(10, Math.ceil(n / (Math.max(1, workers) * 4))))
}

/**
 * Merge shard results into the order a single runAtlas over `cityIds` returns: its sort is stable,
 * so full ties keep `cityIds` order, which the position tie-break reproduces here.
 */
export function mergeShards(cityIds: string[], shards: AtlasEntry[][]): AtlasEntry[] {
  const pos = new Map<string, number>()
  cityIds.forEach((id, i) => pos.has(id) || pos.set(id, i))
  const at = (e: AtlasEntry) => pos.get(e.cityId) ?? Number.MAX_SAFE_INTEGER
  return shards.flat().sort((a, b) => compareAtlas(a, b) || at(a) - at(b))
}

/** A chunked ranking with a synchronous runner per chunk (tests; the UI runs chunks on workers). */
export function runAtlasChunked(cityIds: string[], size: number, run: (ids: string[]) => AtlasEntry[]): AtlasEntry[] {
  return mergeShards(cityIds, chunkCities(cityIds, size).map(run))
}
