// Same storm: both plans through the same sampled futures (stage 4 of the walkthrough plan).
// Contract shared by the logic builder (this file's bodies + tests) and the view builder
// (SameStorm.tsx). Pure, no React.

import type { IncomeInputs, IncomeResult, IncomeSampleYear } from '../../engine/incomeTypes'
import type { SampleKey } from '../../engine/sampleFutures'
import type { EveloSampleYear, PlanInputs, SimulationResult } from '../../engine/types'

/** Why Same storm is hidden, or 'shown'. */
export type StormGate = 'shown' | 'fat-tail' | 'different-futures' | 'different-years' | 'no-samples'

/** One chip: a future both plans lived through. `keys` holds every sample key that picked this
 *  path (repeats merged), `label` names it ("Typical", "Typical · Lucky"). */
export interface StormFuture {
  keys: SampleKey[]
  label: string
  path: number
  /** Per year, index y = year y (length = the shorter plan's horizon). Year-end values. */
  years: StormYear[]
  /** eVelo's margin-call loan-to-value (PlanInputs.maxLtv). */
  callLtv: number
  caption: string
}

export interface StormYear {
  /** Age during the year. */
  age: number
  income: IncomeSampleYear
  evelo: EveloSampleYear
}

export function stormGate(evelo: PlanInputs, eveloResult: SimulationResult, income: IncomeInputs, incomeResult: IncomeResult): StormGate {
  void evelo
  void eveloResult
  void income
  void incomeResult
  throw new Error('stormGate: not built yet')
}

/** The line shown in Same storm's place when the gate isn't 'shown'. */
export function stormHiddenText(gate: Exclude<StormGate, 'shown'>): string {
  void gate
  throw new Error('stormHiddenText: not built yet')
}

/** The chips, in SAMPLE_KEYS order, repeats merged, captions filled. Empty when the gate isn't 'shown'. */
export function stormFutures(evelo: PlanInputs, eveloResult: SimulationResult, income: IncomeInputs, incomeResult: IncomeResult): StormFuture[] {
  void evelo
  void eveloResult
  void income
  void incomeResult
  throw new Error('stormFutures: not built yet')
}
