// "When could you retire?": which retire-in dates the Outlook compares, and the plan each card runs.
// Each card is the plan itself with only `retireInYears` changed, so its inputsKey is exactly the key
// the main pipeline uses when that date is chosen: a card's numbers are the main runs' cached results.

import type { PlanInputs } from '../engine/types'
import { keepRetireBeforeHorizon, maxRetireInYears } from './retireClamp'

/** The dates every comparison offers (years from today), when they fit before the horizon. */
export const COMPARE_PRESETS = [0, 2, 4, 5] as const

/**
 * Retire-in years to compare, ascending: the presets at or below maxRetireInYears(horizon), plus the
 * plan's own retire-in (clamped the way the engine clamps it) when it isn't one of them.
 */
export function compareYears(inputs: Pick<PlanInputs, 'retireInYears' | 'horizonYears'>): number[] {
  const max = maxRetireInYears(inputs.horizonYears)
  const years: number[] = COMPARE_PRESETS.filter((y) => y <= max)
  const plan = planRetireIn(inputs)
  if (!years.includes(plan)) years.push(plan)
  return years.sort((a, b) => a - b)
}

/** The plan's retire-in as the engine runs it (whole years, below the horizon). */
export function planRetireIn(inputs: Pick<PlanInputs, 'retireInYears' | 'horizonYears'>): number {
  return keepRetireBeforeHorizon(inputs as PlanInputs).retireInYears
}

/** The plan with retirement in `years`: everything else (portfolio, budget, savings, seed) unchanged.
 *  Spreading keeps the key order, so `withRetireIn(i, i.retireInYears)` has the same inputsKey as `i`. */
export function withRetireIn(inputs: PlanInputs, years: number): PlanInputs {
  return inputs.retireInYears === years ? inputs : { ...inputs, retireInYears: years }
}

/** One card's figures: null while still computing. */
export interface CompareEntry {
  successRate: number | null
  /** The safe-spending solve's home-city figure, the number the main "What you could spend" card shows. */
  maxSpend: number | null
  /** The comparison run failed before this card's figures arrived. */
  failed?: boolean
}
