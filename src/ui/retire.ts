// Retiring later: the ages the UI shows, kept in line with the engine (simulate.ts kernelConfig).

import type { PlanInputs } from '../engine/types'

type RetireInputs = Pick<PlanInputs, 'age' | 'retireInYears'>
type MoveInputs = Pick<PlanInputs, 'moveInYears' | 'retireInYears'>

/** Whole years until retirement (0 = retired now); non-finite or negative values are 0. */
export function retireInYearsOf(i: Pick<PlanInputs, 'retireInYears'>): number {
  const r = Math.round(i.retireInYears)
  return Number.isFinite(r) ? Math.max(0, r) : 0
}

/** The age at which the plan starts drawing: today's age plus the working years. */
export function retireAge(i: RetireInputs): number {
  return i.age + retireInYearsOf(i)
}

/** Years until the move takes effect: the move can't come before retirement (the engine's
 *  max(move, retirement)). */
export function effectiveMoveInYears(i: MoveInputs): number {
  return Math.max(i.moveInYears, retireInYearsOf(i))
}

/**
 * Where (and whether still working) the plan spends its years, for the verdict sentence:
 * "staying in St. Louis" / "living in Bangkok from age 55" / "in St. Louis, moving to Lisbon at 60";
 * with working years first: "working in St. Louis until 59 and retiring there" /
 * "working in St. Louis until 59, then living in Bangkok" /
 * "working until 59, then in St. Louis, moving to Bangkok at 61".
 * `dest` is the destination's name, or null when staying home.
 */
export function placePhraseFor(i: Pick<PlanInputs, 'age' | 'retireInYears' | 'moveInYears'>, home: string, dest: string | null): string {
  const working = retireInYearsOf(i)
  const moveIn = effectiveMoveInYears(i)
  const moveAge = i.age + moveIn
  if (working === 0) {
    if (!dest) return `staying in ${home}`
    return moveIn > 0 ? `in ${home}, moving to ${dest} at ${moveAge}` : `living in ${dest} from age ${i.age}`
  }
  const until = retireAge(i)
  if (!dest) return `working in ${home} until ${until} and retiring there`
  return moveIn > working ? `working until ${until}, then in ${home}, moving to ${dest} at ${moveAge}` : `working in ${home} until ${until}, then living in ${dest}`
}
