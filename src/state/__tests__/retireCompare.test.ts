// "When could you retire?": which dates are compared, and that the comparison runs after the main
// pipeline through the same caches, so each card's figures are exactly what the verdict and the
// safe-spending card show when that date is chosen (and choosing it reruns nothing).

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_INPUTS } from '../../engine/defaults'
import type { PlanInputs, WorkerRequest } from '../../engine/types'
import { COMPARE_PRESETS, compareYears, planRetireIn, withRetireIn, type CompareEntry } from '../retireCompare'

const state = vi.hoisted(() => ({
  inputs: null as unknown as PlanInputs,
  set: {} as Record<string, unknown>,
  calls: [] as string[],
}))
vi.mock('../store', () => {
  const setter = (name: string) => (v: unknown) => {
    state.set[name] = v
    state.calls.push(name)
  }
  const st = {
    get inputs() {
      return state.inputs
    },
    ...Object.fromEntries(
      ['setResult', 'setBaseline', 'setSolve', 'setSolving', 'setStatus', 'setCompare', 'setAtlas', 'setAtlasRunning'].map((n) => [n, setter(n)]),
    ),
  }
  return { useStore: Object.assign(() => undefined, { getState: () => st, subscribe: () => () => {} }) }
})

/** Stub engine: figures that depend on retire-in, the destination and the seed, so mix-ups show. */
const odds = (i: PlanInputs) => 0.5 + i.retireInYears / 100 + (i.destCityId ? 0.001 : 0) + i.seed / 1e6
const spend = (i: PlanInputs, target: number) => 100_000 + i.retireInYears * 1000 + target + i.seed

const posted: WorkerRequest[] = []
class FakeWorker {
  onmessage: ((ev: { data: unknown }) => void) | null = null
  onerror: unknown = null
  postMessage(req: WorkerRequest) {
    posted.push(structuredClone(req))
    const result =
      req.kind === 'solve'
        ? { maxSpendHome: spend(req.inputs, req.target), maxSpendDest: null, target: req.target }
        : req.kind === 'simulate'
          ? { inputs: req.inputs, successRate: odds(req.inputs) }
          : []
    queueMicrotask(() => this.onmessage?.({ data: { id: req.id, kind: req.kind, result } }))
  }
  terminate() {}
}

const { inputsKey, homeVariant, sim, SOLVE_TARGET } = await import('../sim')

/** Lets the fake worker's answers and the pipeline's awaits all settle. */
const settle = () => new Promise((r) => setTimeout(r, 0))
async function runPipeline(inputs: PlanInputs) {
  state.inputs = inputs
  posted.length = 0
  state.calls.length = 0
  sim.schedule(true)
  await settle()
}
const compare = () => state.set.setCompare as Record<string, CompareEntry>

beforeEach(() => vi.stubGlobal('Worker', FakeWorker))
afterEach(() => vi.unstubAllGlobals())

describe('which retire-in dates are compared', () => {
  const at = (retireInYears: number, horizonYears = 30) => compareYears({ retireInYears, horizonYears })

  it('now, 2, 4 and 5 years; the plan on one of them adds nothing', () => {
    expect(COMPARE_PRESETS).toEqual([0, 2, 4, 5])
    for (const r of [0, 2, 4, 5]) expect(at(r)).toEqual([0, 2, 4, 5])
  })

  it('a fifth "your plan" card, in order, when the plan retires on another date', () => {
    expect(at(1)).toEqual([0, 1, 2, 4, 5])
    expect(at(3)).toEqual([0, 2, 3, 4, 5])
    expect(at(10)).toEqual([0, 2, 4, 5, 10])
    expect(at(15)).toEqual([0, 2, 4, 5, 15])
  })

  it('drops dates at or past the horizon (retire-in must stay below it)', () => {
    expect(at(0, 6)).toEqual([0, 2, 4, 5])
    expect(at(0, 5)).toEqual([0, 2, 4])
    expect(at(0, 4)).toEqual([0, 2])
    expect(at(3, 4)).toEqual([0, 2, 3])
    expect(at(0, 2)).toEqual([0])
    expect(at(0, 1)).toEqual([0])
  })

  it('uses the plan date the engine runs (clamped below the horizon, whole years)', () => {
    expect(planRetireIn({ retireInYears: 9, horizonYears: 5 })).toBe(4)
    expect(at(9, 5)).toEqual([0, 2, 4])
    expect(planRetireIn({ retireInYears: 2.6, horizonYears: 30 })).toBe(3)
    expect(planRetireIn({ retireInYears: NaN, horizonYears: 30 })).toBe(0)
  })

  it("a card's plan differs from the plan only in retire-in; the plan's own card is the plan", () => {
    const plan: PlanInputs = { ...structuredClone(DEFAULT_INPUTS), retireInYears: 4, savingsWhileWorking: 60_000 }
    expect(inputsKey(withRetireIn(plan, 4))).toBe(inputsKey(plan))
    const later = withRetireIn(plan, 5)
    expect(later).toEqual({ ...plan, retireInYears: 5 })
    expect(inputsKey(later)).toBe(inputsKey({ ...plan, retireInYears: 5 }))
    expect(Object.keys(later)).toEqual(Object.keys(plan))
  })
})

describe('the comparison run', () => {
  it('runs after the main simulate, baseline and solve, then each card, then the baselines', async () => {
    const plan: PlanInputs = { ...structuredClone(DEFAULT_INPUTS), destCityId: 'bangkok', seed: 11 }
    await runPipeline(plan)
    const seq = posted.map((r) => `${r.kind}:${r.inputs.retireInYears}${r.inputs.destCityId ? '' : 'h'}`)
    expect(seq).toEqual([
      // main pipeline, unchanged and first
      'simulate:0',
      'simulate:0h',
      'solve:0',
      // the comparison: odds first, then safe spending, then the stay-home baselines
      'simulate:2',
      'simulate:4',
      'simulate:5',
      'solve:2',
      'solve:4',
      'solve:5',
      'simulate:2h',
      'simulate:4h',
      'simulate:5h',
    ])
    for (const r of posted) {
      expect(r.inputs.seed).toBe(11)
      expect(r.inputs.paths).toBe(plan.paths)
      if (r.kind === 'solve') expect(r.target).toBe(SOLVE_TARGET)
    }
    // The verdict is published before any comparison work.
    expect(state.calls.indexOf('setSolve')).toBeLessThan(state.calls.lastIndexOf('setCompare'))
  })

  it('shows loading (nulls) until each figure lands, then every card filled', async () => {
    const plan: PlanInputs = { ...structuredClone(DEFAULT_INPUTS), seed: 12 }
    state.inputs = plan
    const snapshots: Record<string, CompareEntry>[] = []
    posted.length = 0
    const st = (await import('../store')).useStore.getState() as unknown as { setCompare: (c: unknown) => void }
    const orig = st.setCompare
    st.setCompare = (c) => {
      snapshots.push(c as Record<string, CompareEntry>)
      orig(c)
    }
    sim.schedule(true)
    await settle()
    st.setCompare = orig
    const keys = [0, 2, 4, 5].map((y) => inputsKey(withRetireIn(plan, y)))
    expect(Object.keys(snapshots[0])).toEqual(keys)
    expect(Object.values(snapshots[0]).every((e) => e.successRate === null && e.maxSpend === null)).toBe(true)
    const last = snapshots.at(-1)!
    for (const [i, y] of [0, 2, 4, 5].entries()) {
      const p = withRetireIn(plan, y)
      expect(last[keys[i]]).toEqual({ successRate: odds(p), maxSpend: spend(p, SOLVE_TARGET) })
    }
  })

  it("a card's figures are the main results for that date, and choosing it reruns nothing", async () => {
    const plan: PlanInputs = { ...structuredClone(DEFAULT_INPUTS), destCityId: 'bangkok', seed: 13, savingsWhileWorking: 50_000 }
    await runPipeline(plan)
    const card = compare()[inputsKey(withRetireIn(plan, 4))]

    // Tap "In 4 yrs": the main pipeline for retire-in 4.
    const chosen = withRetireIn(plan, 4)
    await runPipeline(chosen)
    expect(posted).toEqual([]) // simulate, baseline and solve all came from the cache
    const result = state.set.setResult as { successRate: number }
    const solve = state.set.setSolve as { maxSpendHome: number }
    expect(card.successRate).toBe(result.successRate)
    expect(card.maxSpend).toBe(solve.maxSpendHome)
    expect(state.set.setBaseline).toMatchObject({ successRate: odds(homeVariant(chosen)) })
    // ...and the row for the new plan is complete straight away.
    const now = compare()
    expect(Object.values(now).every((e) => e.successRate != null && e.maxSpend != null)).toBe(true)
    expect(now[inputsKey(withRetireIn(plan, 0))].successRate).toBe(odds(withRetireIn(plan, 0)))
  })

  it('adds the plan\'s own date as a fifth card and runs it as the main plan', async () => {
    const plan: PlanInputs = { ...structuredClone(DEFAULT_INPUTS), destCityId: null, seed: 14, retireInYears: 3 }
    await runPipeline(plan)
    expect(Object.keys(compare())).toEqual([0, 2, 3, 4, 5].map((y) => inputsKey(withRetireIn(plan, y))))
    // The plan itself ran once (main), not again for its card; no destination, no baselines.
    expect(posted.filter((r) => r.kind === 'simulate' && r.inputs.retireInYears === 3)).toHaveLength(1)
    expect(posted.map((r) => `${r.kind}:${r.inputs.retireInYears}`)).toEqual([
      'simulate:3',
      'solve:3',
      'simulate:0',
      'simulate:2',
      'simulate:4',
      'simulate:5',
      'solve:0',
      'solve:2',
      'solve:4',
      'solve:5',
    ])
  })

  it('respects the horizon cap', async () => {
    const plan: PlanInputs = { ...structuredClone(DEFAULT_INPUTS), destCityId: null, seed: 15, horizonYears: 4 }
    await runPipeline(plan)
    expect(Object.keys(compare())).toEqual([0, 2].map((y) => inputsKey(withRetireIn(plan, y))))
    expect(posted.every((r) => r.inputs.retireInYears <= 2)).toBe(true)
  })

  it('new inputs supersede the comparison in flight', async () => {
    const a: PlanInputs = { ...structuredClone(DEFAULT_INPUTS), destCityId: null, seed: 16 }
    const b: PlanInputs = { ...a, seed: 17 }
    state.inputs = a
    posted.length = 0
    sim.schedule(true)
    // Let the main pipeline land, then change the plan before the comparison finishes.
    for (let i = 0; i < 6; i++) await Promise.resolve()
    state.inputs = b
    sim.schedule(true)
    await settle()
    const last = compare()
    expect(Object.keys(last)).toEqual([0, 2, 4, 5].map((y) => inputsKey(withRetireIn(b, y))))
    expect(Object.values(last).every((e) => e.successRate != null && e.maxSpend != null)).toBe(true)
  })

  it('no holdings: no comparison', async () => {
    await runPipeline({ ...structuredClone(DEFAULT_INPUTS), holdings: [], seed: 18 })
    expect(posted).toEqual([])
    expect(compare()).toEqual({})
  })
})
