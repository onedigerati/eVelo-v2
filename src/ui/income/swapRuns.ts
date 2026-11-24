// Swapped runs (docs/PLAN.md, Swap the mixes, stage 1): the re-run of whichever plan borrows the
// other's mix, each result paired with the inputs it ran for and kept for the session by those
// inputs, so switching back to a mix already seen is instant.
//
// The runs go through their own IncomeClient (so their own worker): the mode's income run
// (useIncomeRun) and the comparison's eVelo run (IncomeCompare's useEveloResult) each sit on a
// client of their own, and a client only ever supersedes its own older request of the same kind,
// so a swapped run can never cancel the plan's own run. eVelo's main sim client isn't touched.
//
// Stages 2–3 call useSwapPair(mode, plan, ownIncome, ownEvelo) and read the pair it returns.

import { useEffect, useMemo, useState } from 'react'
import type { IncomeInputs } from '../../engine/incomeTypes'
import type { PlanInputs, SimulationResult } from '../../engine/types'
import { stableKey } from './compare'
import { IncomeClient, type IncomeComputed } from './incomeClient'
import { swapInputs, type HoldingsMode, type SwapInputs } from './swap'

/** An eVelo result with the plan it was worked out for. */
export interface EveloComputed {
  inputs: PlanInputs
  result: SimulationResult
}

export type SwapKind = 'evelo' | 'income'
type Computed<K extends SwapKind> = K extends 'evelo' ? EveloComputed : IncomeComputed
type InputsOf<K extends SwapKind> = K extends 'evelo' ? PlanInputs : IncomeInputs

/** Swapped results this session, by swapKey. Module-level: it outlives the card (and its client). */
const SESSION_SWAPS = new Map<string, EveloComputed | IncomeComputed>()

export const swapKey = (kind: SwapKind, inputs: PlanInputs | IncomeInputs) => `${kind}:${stableKey(inputs)}`

export class SwapRuns {
  private client: IncomeClient | null = null
  /** Runs in flight by key, so asking twice for the same inputs doesn't supersede itself. */
  private inflight = new Map<string, Promise<EveloComputed | IncomeComputed>>()
  /** Keys whose run failed on this instance (a retry needs a new instance, i.e. a remount). */
  private failed = new Set<string>()

  constructor(
    private readonly cache: Map<string, EveloComputed | IncomeComputed> = SESSION_SWAPS,
    private readonly makeClient: () => IncomeClient = () => new IncomeClient(),
  ) {}

  /** The cached run for these inputs, synchronously, or undefined. */
  peek<K extends SwapKind>(kind: K, inputs: InputsOf<K>): Computed<K> | undefined {
    return this.cache.get(swapKey(kind, inputs)) as Computed<K> | undefined
  }

  hasFailed(kind: SwapKind, inputs: PlanInputs | IncomeInputs): boolean {
    return this.failed.has(swapKey(kind, inputs))
  }

  /** Runs (or returns the cached / in-flight run for) these inputs; resolves with the result paired
   *  with exactly the inputs it ran for. A newer run of the same kind supersedes an older one still
   *  in flight (it rejects with 'cancelled'), on this instance's client only. */
  run<K extends SwapKind>(kind: K, inputs: InputsOf<K>): Promise<Computed<K>> {
    const key = swapKey(kind, inputs)
    const hit = this.cache.get(key)
    if (hit) return Promise.resolve(hit as Computed<K>)
    const live = this.inflight.get(key)
    if (live) return live as Promise<Computed<K>>
    const c = (this.client ??= this.makeClient())
    const p = (
      kind === 'evelo'
        ? c.simulate(inputs as PlanInputs).then((result): EveloComputed => ({ inputs: inputs as PlanInputs, result }))
        : c.run(inputs as IncomeInputs).then((result): IncomeComputed => ({ inputs: inputs as IncomeInputs, result }))
    ).then(
      (done) => {
        this.inflight.delete(key)
        this.cache.set(key, done)
        return done
      },
      (e: Error) => {
        this.inflight.delete(key)
        if (e.message !== 'cancelled') this.failed.add(key)
        throw e
      },
    )
    this.inflight.set(key, p)
    return p as Promise<Computed<K>>
  }

  stop() {
    this.client?.stop()
    this.client = null
    this.inflight.clear()
  }
}

/** The plan's own eVelo run, as IncomeCompare's useEveloResult reports it. */
export type OwnEvelo = { status: 'loading' } | { status: 'done'; result: SimulationResult } | { status: 'error' } | { status: 'empty' }

/** Both plans' results under a holdings mode, each with the inputs it ran for. `borrowed` names the
 *  plan on the other's mix; `approximate` is true when that's the mode on eVelo's mix. */
export type SwapPair =
  | { status: 'loading' | 'error' | 'empty'; mode: HoldingsMode }
  | { status: 'done'; mode: HoldingsMode; borrowed: SwapKind | null; approximate: boolean; evelo: EveloComputed; income: IncomeComputed }

/** The swapped run a mode still needs, or null (under 'own', when cached, or when it can't run). */
export function neededRun(target: SwapInputs, runs: Pick<SwapRuns, 'peek' | 'hasFailed'>): { kind: 'evelo'; inputs: PlanInputs } | { kind: 'income'; inputs: IncomeInputs } | null {
  if (target.swapped === 'evelo' && target.evelo && !runs.peek('evelo', target.evelo) && !runs.hasFailed('evelo', target.evelo))
    return { kind: 'evelo', inputs: target.evelo }
  if (target.swapped === 'income' && target.income && !runs.peek('income', target.income) && !runs.hasFailed('income', target.income))
    return { kind: 'income', inputs: target.income }
  return null
}

/** The pair for a mode from the plans' own results and the swapped cache. Pure. */
export function resolvePair(
  mode: HoldingsMode,
  plan: PlanInputs,
  ownIncome: IncomeComputed,
  ownEvelo: OwnEvelo,
  runs: Pick<SwapRuns, 'peek' | 'hasFailed'>,
): SwapPair {
  const target = swapInputs(mode, plan, ownIncome.inputs)
  let evelo: EveloComputed
  let income: IncomeComputed
  if (target.swapped === 'evelo') {
    const e = target.evelo!
    const hit = runs.peek('evelo', e)
    if (!hit) return { status: runs.hasFailed('evelo', e) ? 'error' : 'loading', mode }
    evelo = hit
    income = ownIncome
  } else {
    if (ownEvelo.status !== 'done') return { status: ownEvelo.status, mode }
    evelo = { inputs: plan, result: ownEvelo.result }
    if (target.swapped === 'income') {
      if (!target.income) return { status: 'empty', mode }
      const hit = runs.peek('income', target.income)
      if (!hit) return { status: runs.hasFailed('income', target.income) ? 'error' : 'loading', mode }
      income = hit
    } else income = ownIncome
  }
  return { status: 'done', mode, borrowed: target.swapped, approximate: target.swapped === 'income', evelo, income }
}

/** Both plans' results under `mode`: 'own' passes the plans' own results through; a shared mix
 *  starts (or reads from the session cache) the borrowing plan's swapped run on its own client. */
export function useSwapPair(mode: HoldingsMode, plan: PlanInputs, ownIncome: IncomeComputed, ownEvelo: OwnEvelo): SwapPair {
  const [runs] = useState(() => new SwapRuns())
  const [, setTick] = useState(0)
  useEffect(() => () => runs.stop(), [runs])
  const target = useMemo(() => swapInputs(mode, plan, ownIncome.inputs), [mode, plan, ownIncome.inputs])
  const need = neededRun(target, runs)
  const needKey = need ? swapKey(need.kind, need.inputs) : null

  useEffect(() => {
    if (!need) return
    let live = true
    const p: Promise<unknown> = need.kind === 'evelo' ? runs.run('evelo', need.inputs) : runs.run('income', need.inputs)
    const rerender = () => live && setTick((t) => t + 1)
    p.then(rerender, (e: Error) => e.message !== 'cancelled' && rerender())
    return () => {
      live = false
    }
    // needKey stands for `need`: the run is the same while its key is.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runs, needKey])

  return resolvePair(mode, plan, ownIncome, ownEvelo, runs)
}
