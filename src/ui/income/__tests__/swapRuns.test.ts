// Swap the mixes, stage 1: swapped runs are paired with the inputs they ran for, kept for the
// session by their key (switching back is instant), and run on their own client, so a swapped run
// never cancels the plan's own run. The worker is faked; the logic under test is the real client's.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_INPUTS } from '../../../engine/defaults'
import { INCOME_DEFAULTS } from '../../../engine/income'
import type { IncomeResult } from '../../../engine/incomeTypes'
import type { SimulationResult } from '../../../engine/types'
import { IncomeClient, type IncomeComputed } from '../incomeClient'
import { swapInputs, swappedEveloPlan, swappedIncomeInputs } from '../swap'
import { neededRun, resolvePair, SwapRuns, swapKey, type EveloComputed } from '../swapRuns'

interface Posted {
  id: number
  kind: string
  inputs: unknown
}
let made: FakeWorker[] = []
class FakeWorker {
  onmessage: ((ev: { data: unknown }) => void) | null = null
  onerror: unknown = null
  posted: Posted[] = []
  terminated = 0
  constructor() {
    made.push(this)
  }
  postMessage(m: Posted) {
    this.posted.push(m)
  }
  terminate() {
    this.terminated++
  }
  reply(i: number, result: unknown) {
    const m = this.posted[i]
    this.onmessage!({ data: { id: m.id, kind: m.kind, result } })
  }
  fail(i: number, message: string) {
    this.onmessage!({ data: { id: this.posted[i].id, kind: 'error', message } })
  }
}

beforeEach(() => {
  made = []
  vi.stubGlobal('Worker', FakeWorker)
})
afterEach(() => vi.unstubAllGlobals())

const plan = { ...DEFAULT_INPUTS, paths: 300 }
const income = { ...INCOME_DEFAULTS, paths: 300 }
const ownIncome: IncomeComputed = { inputs: income, result: { tag: 'own income' } as unknown as IncomeResult }
const ownEveloResult = { tag: 'own evelo' } as unknown as SimulationResult
const flush = () => new Promise((r) => setTimeout(r, 0))

describe('SwapRuns', () => {
  it('pairs each swapped run with the inputs it ran for and caches it for the session by its key', async () => {
    const cache = new Map()
    const runs = new SwapRuns(cache)
    const sw = swappedEveloPlan(plan, income)
    const p = runs.run('evelo', sw)
    // Asking again while it runs is the same run, not a second request.
    expect(runs.run('evelo', sw)).toBe(p)
    expect(made).toHaveLength(1)
    expect(made[0].posted).toHaveLength(1)
    expect(made[0].posted[0]).toMatchObject({ kind: 'simulate', inputs: sw })
    made[0].reply(0, { tag: 'swapped evelo' })
    const done = await p
    expect(done).toEqual({ inputs: sw, result: { tag: 'swapped evelo' } })
    expect(done.inputs).toBe(sw)
    expect(cache.get(swapKey('evelo', sw))).toBe(done)

    // Switching back later (another card mount, a new client): the cached pair is read synchronously
    // and nothing is posted.
    const again = new SwapRuns(cache)
    expect(again.peek('evelo', { ...sw })).toBe(done)
    await expect(again.run('evelo', sw)).resolves.toBe(done)
    expect(made).toHaveLength(1)
    expect(neededRun(swapInputs('income', plan, income), again)).toBeNull()

    // The mode on eVelo's mix, the same way.
    const si = swappedIncomeInputs(income, plan)!
    const q = runs.run('income', si)
    expect(made[0].posted[1]).toMatchObject({ kind: 'income', inputs: si })
    made[0].reply(1, { tag: 'swapped income' })
    await expect(q).resolves.toEqual({ inputs: si, result: { tag: 'swapped income' } })
    expect(again.peek('income', si)?.inputs).toBe(si)
  })

  it('a swapped run never cancels the plan’s own runs: they sit on other clients and workers', async () => {
    const modeClient = new IncomeClient() // useIncomeRun's
    const compareClient = new IncomeClient() // useEveloResult's
    const ownIncomeRun = modeClient.run(income)
    const ownEveloRun = compareClient.simulate(plan)
    const runs = new SwapRuns(new Map())
    const se = runs.run('evelo', swappedEveloPlan(plan, income))
    const si = runs.run('income', swappedIncomeInputs(income, plan)!)
    expect(made).toHaveLength(3)
    const [modeW, compareW, swapW] = made
    expect(swapW.posted.map((m) => m.kind)).toEqual(['simulate', 'income'])
    // Stopping the swap runs (leaving the card) doesn't touch the others either.
    const settled = vi.fn()
    ownIncomeRun.then(settled, settled)
    ownEveloRun.then(settled, settled)
    runs.stop()
    await expect(se).rejects.toThrow('cancelled')
    await expect(si).rejects.toThrow('cancelled')
    await flush()
    expect(settled).not.toHaveBeenCalled()
    expect(modeW.terminated + compareW.terminated).toBe(0)
    modeW.reply(0, { tag: 'own income' })
    compareW.reply(0, { tag: 'own evelo' })
    await expect(ownIncomeRun).resolves.toEqual({ tag: 'own income' })
    await expect(ownEveloRun).resolves.toEqual({ tag: 'own evelo' })
  })

  it('a newer swapped run supersedes only an older swapped run of its kind; neither is cached or failed', async () => {
    const runs = new SwapRuns(new Map())
    const a = swappedEveloPlan(plan, { stockShare: 0.6, muniShare: 0.5 })
    const b = swappedEveloPlan(plan, { stockShare: 0.4, muniShare: 0.5 })
    const pa = runs.run('evelo', a)
    const pb = runs.run('evelo', b)
    await expect(pa).rejects.toThrow('cancelled')
    expect(runs.peek('evelo', a)).toBeUndefined()
    expect(runs.hasFailed('evelo', a)).toBe(false)
    made[0].reply(0, { tag: 'stale' })
    made[0].reply(1, { tag: 'b' })
    await expect(pb).resolves.toEqual({ inputs: b, result: { tag: 'b' } })
  })
})

describe('resolvePair', () => {
  it('“Each its own” passes both plans’ own results through, with their own inputs', () => {
    const runs = new SwapRuns(new Map())
    expect(resolvePair('own', plan, ownIncome, { status: 'done', result: ownEveloResult }, runs)).toEqual({
      status: 'done', mode: 'own', borrowed: null, approximate: false,
      evelo: { inputs: plan, result: ownEveloResult }, income: ownIncome,
    })
    expect(resolvePair('own', plan, ownIncome, { status: 'loading' }, runs)).toEqual({ status: 'loading', mode: 'own' })
    expect(resolvePair('own', plan, ownIncome, { status: 'empty' }, runs)).toEqual({ status: 'empty', mode: 'own' })
  })

  it('a shared mix reads the borrower’s swapped run (loading until it is in, error if it fails), paired with its inputs', async () => {
    const runs = new SwapRuns(new Map())
    const own = { status: 'done', result: ownEveloResult } as const
    // Both on the mode's mix: eVelo borrows, exact.
    const sw = swappedEveloPlan(plan, income)
    expect(neededRun(swapInputs('income', plan, income), runs)).toEqual({ kind: 'evelo', inputs: sw })
    expect(resolvePair('income', plan, ownIncome, own, runs)).toEqual({ status: 'loading', mode: 'income' })
    const p = runs.run('evelo', sw)
    made[0].reply(0, { tag: 'swapped evelo' })
    const ev: EveloComputed = await p
    expect(resolvePair('income', plan, ownIncome, own, runs)).toEqual({
      status: 'done', mode: 'income', borrowed: 'evelo', approximate: false, evelo: ev, income: ownIncome,
    })
    // Both on eVelo's mix: the mode borrows, approximate.
    const si = swappedIncomeInputs(income, plan)!
    const q = runs.run('income', si)
    made[0].fail(1, 'boom')
    await expect(q).rejects.toThrow('boom')
    expect(resolvePair('evelo', plan, ownIncome, own, runs)).toEqual({ status: 'error', mode: 'evelo' })
    expect(neededRun(swapInputs('evelo', plan, income), runs)).toBeNull()
    const cache = new Map([[swapKey('income', si), { inputs: si, result: { tag: 'si' } as unknown as IncomeResult }]])
    const pair = resolvePair('evelo', plan, ownIncome, own, new SwapRuns(cache))
    expect(pair).toMatchObject({ status: 'done', borrowed: 'income', approximate: true, evelo: { inputs: plan, result: ownEveloResult } })
    expect(pair.status === 'done' && pair.income.inputs).toBe(si)
    // An empty eVelo mix has nothing to lend.
    expect(resolvePair('evelo', { ...plan, holdings: [] }, ownIncome, own, runs)).toEqual({ status: 'empty', mode: 'evelo' })
  })
})
