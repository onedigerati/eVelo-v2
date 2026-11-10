// A ranking split across N workers must equal a single run: same cities, same order, same rates
// and spend. Each chunk uses the plan's common random scenarios (built from its seed, or reused
// from the worker's memo), so it does.

import { describe, expect, it } from 'vitest'
import marketJson from '../../data/market.json'
import { CITIES } from '../../data/cities'
import { atlasChunkSize, chunkCities, mergeShards, runAtlas, runAtlasChunked, type ScenarioMemo } from '../atlas'
import { DEFAULT_INPUTS } from '../defaults'
import type { AtlasEntry, MarketData, PlanInputs } from '../types'

const market = marketJson as unknown as MarketData
const IDS = CITIES.map((c) => c.id)
// Few paths keeps the test quick (and makes rate ties likelier, which exercises the tie-break).
const plan = (o: Partial<PlanInputs>): PlanInputs => ({ ...structuredClone(DEFAULT_INPUTS), paths: 300, ...o })

const PLANS: [string, PlanInputs][] = [
  ['default plan', plan({})],
  ['existing loan', plan({ existingLoan: 400_000 })],
  ['retire later', plan({ retireInYears: 6, savingsWhileWorking: 40_000 })],
]

describe('sharded Atlas ranking', () => {
  for (const [name, inputs] of PLANS) {
    it(`${name}: N = 1..5 workers return exactly the single run's entries`, () => {
      const single = runAtlas(market, CITIES, inputs, IDS)
      expect(single.length).toBe(IDS.length)
      for (let n = 1; n <= 5; n++) {
        // n workers, each with its own scenario memo, taking chunks in turn (as the queue does)
        const memos: ScenarioMemo[] = Array.from({ length: n }, () => ({ current: null }))
        let k = 0
        const chunked = runAtlasChunked(IDS, atlasChunkSize(IDS.length, n), (ids) => runAtlas(market, CITIES, inputs, ids, memos[k++ % n]))
        expect(chunked, `N = ${n}`).toEqual(single)
        expect(memos.every((m) => m.current !== null), `N = ${n}`).toBe(true)
      }
      // without a memo, and with chunks in reverse order
      const chunks = chunkCities(IDS, 7)
      const rev = chunks.map((_, i) => runAtlas(market, CITIES, inputs, chunks[chunks.length - 1 - i])).reverse()
      expect(mergeShards(IDS, rev)).toEqual(single)
    })
  }

  it('chunks cover every city once, in order', () => {
    for (const size of [1, 4, 8, 10, 500]) {
      const chunks = chunkCities(IDS, size)
      expect(chunks.flat()).toEqual(IDS)
      expect(chunks.every((c) => c.length >= 1 && c.length <= size)).toBe(true)
    }
    expect(chunkCities(['a', 'b', 'c'], 2)).toEqual([['a', 'b'], ['c']])
    expect(chunkCities(['a'], 0)).toEqual([['a']])
    expect(chunkCities([], 3)).toEqual([])
    // ~4 chunks per worker, 1..10 cities each
    expect(atlasChunkSize(133, 6)).toBe(6)
    expect(atlasChunkSize(133, 1)).toBe(10)
    expect(atlasChunkSize(8, 4)).toBe(1)
    expect(atlasChunkSize(0, 4)).toBe(1)
  })

  it('a memo from another plan is not reused', () => {
    const memo: ScenarioMemo = { current: null }
    const [a, b] = [PLANS[0][1], PLANS[2][1]]
    runAtlas(market, CITIES, a, IDS.slice(0, 3), memo)
    expect(runAtlas(market, CITIES, b, IDS.slice(0, 3), memo)).toEqual(runAtlas(market, CITIES, b, IDS.slice(0, 3)))
  })

  it('full ties keep the requested city order, as the single run does', () => {
    const e = (cityId: string): AtlasEntry => ({ cityId, successRate: 0.5, spendUsd: 100, costRatio: 1 })
    expect(mergeShards(['c', 'a', 'b'], [[e('a')], [e('b'), e('c')]]).map((x) => x.cityId)).toEqual(['c', 'a', 'b'])
  })
})
