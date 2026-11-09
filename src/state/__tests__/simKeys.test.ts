// Retire-in and savings while working must reach every cache key and the stay-home baseline, so
// changing either recomputes the plan, the safe-spend solve, the Atlas odds and the baseline.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_INPUTS } from '../../engine/defaults'
import type { PlanInputs, WorkerRequest } from '../../engine/types'

const state = vi.hoisted(() => ({
  inputs: null as unknown as PlanInputs,
  baseline: null as unknown,
  set: {} as Record<string, unknown>,
}))
vi.mock('../store', () => {
  const setter = (name: string) => (v: unknown) => {
    state.set[name] = v
    if (name === 'setBaseline') state.baseline = v
  }
  const st = {
    get inputs() {
      return state.inputs
    },
    ...Object.fromEntries(
      ['setResult', 'setBaseline', 'setSolve', 'setSolving', 'setStatus', 'setAtlas', 'setAtlasRunning'].map((n) => [n, setter(n)]),
    ),
  }
  return { useStore: Object.assign(() => undefined, { getState: () => st, subscribe: () => () => {} }) }
})

/** Every request any worker received, answered right away with a stub result. */
const posted: WorkerRequest[] = []
class FakeWorker {
  onmessage: ((ev: { data: unknown }) => void) | null = null
  onerror: unknown = null
  postMessage(req: WorkerRequest) {
    posted.push(structuredClone(req))
    const result =
      req.kind === 'atlas' ? [] : req.kind === 'solve' ? { multiplier: 1 } : { successRate: req.inputs.retireInYears / 100 + req.inputs.savingsWhileWorking / 1e9 }
    queueMicrotask(() => this.onmessage?.({ data: { id: req.id, kind: req.kind, result } }))
  }
  terminate() {}
}

const { atlasClient, atlasKey, homeVariant, inputsKey, sim, destinationClient } = await import('../sim')

const base: PlanInputs = { ...structuredClone(DEFAULT_INPUTS), destCityId: 'lisbon', moveInYears: 2 }
const variants: [string, PlanInputs][] = [
  ['retireInYears', { ...base, retireInYears: 4 }],
  ['savingsWhileWorking', { ...base, savingsWhileWorking: 60_000 }],
]
const count = (kind: WorkerRequest['kind']) => posted.filter((r) => r.kind === kind).length

beforeEach(() => {
  vi.stubGlobal('Worker', FakeWorker)
})
afterEach(() => {
  vi.unstubAllGlobals()
})

describe('cache keys follow retire-in and savings', () => {
  it('inputsKey and atlasKey change when either changes', () => {
    const cities = ['lisbon', 'bangkok']
    for (const [k, v] of variants) {
      expect(inputsKey(v), k).not.toBe(inputsKey(base))
      expect(atlasKey(v, cities), k).not.toBe(atlasKey(base, cities))
    }
    expect(inputsKey(variants[0][1])).not.toBe(inputsKey(variants[1][1]))
    // ...while the destination still doesn't matter to a city ranking
    expect(atlasKey({ ...variants[0][1], destCityId: 'bangkok' }, cities)).toBe(atlasKey(variants[0][1], cities))
  })

  it('simulate and solve rerun for either; the same inputs hit the cache', async () => {
    const plan = { ...base, seed: 101 } // fresh keys for this test
    await sim.simulate(plan)
    await sim.solve(plan)
    const [s0, v0] = [count('simulate'), count('solve')]
    await sim.simulate(plan)
    await sim.solve(plan)
    expect([count('simulate'), count('solve')]).toEqual([s0, v0])
    for (const [k, v] of variants) {
      const p = { ...v, seed: 101 }
      await sim.simulate(p)
      await sim.solve(p)
      const last = posted.filter((r) => r.kind === 'solve').at(-1)!
      expect(last.inputs[k as keyof PlanInputs], k).toBe(p[k as keyof PlanInputs])
    }
    expect([count('simulate'), count('solve')]).toEqual([s0 + 2, v0 + 2])
  })

  it('Atlas odds rerun for either', async () => {
    const cities = ['lisbon']
    const plan = { ...base, seed: 202 }
    await atlasClient.rank(plan, cities)
    const a0 = count('atlas')
    await atlasClient.rank(plan, cities)
    expect(count('atlas')).toBe(a0)
    for (const [k, v] of variants) {
      await atlasClient.rank({ ...v, seed: 202 }, cities)
      expect((posted.at(-1)!.inputs as unknown as Record<string, unknown>)[k], k).toBe((v as unknown as Record<string, unknown>)[k])
    }
    expect(count('atlas')).toBe(a0 + 2)
    expect(atlasClient.peek({ ...variants[0][1], seed: 202 }, cities)).not.toBeNull()
    expect(atlasClient.peek({ ...variants[0][1], seed: 202, retireInYears: 5 }, cities)).toBeNull()
  })

  it('profile-sheet destination runs rerun for either', async () => {
    const plan = { ...base, seed: 303 }
    await destinationClient.simulate(plan)
    const d0 = count('simulate')
    await destinationClient.simulate(plan)
    expect(count('simulate')).toBe(d0)
    for (const [, v] of variants) await destinationClient.simulate({ ...v, seed: 303 })
    expect(count('simulate')).toBe(d0 + 2)
  })
})

describe('stay-home baseline', () => {
  it('drops the destination but keeps retire-in and savings', () => {
    const plan = { ...base, retireInYears: 5, savingsWhileWorking: 40_000 }
    const home = homeVariant(plan)
    expect(home).toMatchObject({ destCityId: null, moveInYears: 0, retireInYears: 5, savingsWhileWorking: 40_000 })
    expect(inputsKey(homeVariant({ ...plan, retireInYears: 2 }))).not.toBe(inputsKey(home))
    expect(inputsKey(homeVariant({ ...plan, savingsWhileWorking: 0 }))).not.toBe(inputsKey(home))
  })

  it('the pipeline runs the baseline with both fields and keys it to the plan', async () => {
    for (const [retireInYears, savingsWhileWorking] of [
      [0, 0],
      [3, 25_000],
      [3, 50_000],
    ]) {
      state.inputs = { ...base, seed: 404, retireInYears, savingsWhileWorking }
      const before = posted.length
      sim.schedule(true)
      await vi.waitFor(() => expect(state.set.setSolving).toBe(false))
      state.set.setSolving = undefined
      const sims = posted.slice(before).filter((r) => r.kind === 'simulate')
      expect(sims.map((r) => r.inputs.destCityId)).toEqual(['lisbon', null])
      expect(sims[1].inputs).toMatchObject({ retireInYears, savingsWhileWorking })
      expect(state.baseline).toEqual({
        homeCityId: base.homeCityId,
        successRate: retireInYears / 100 + savingsWhileWorking / 1e9,
        key: inputsKey(state.inputs),
      })
    }
  })
})
