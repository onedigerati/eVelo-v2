// Keeps "retire in" a whole number of years, within the limit and below the horizon.

import type { PlanInputs } from '../engine/types'
import { MAX_RETIRE_IN_YEARS } from './share'

/** Largest retire-in the plan accepts for a horizon: 15 years, and at least a year before the plan ends. */
export function maxRetireInYears(horizonYears: number): number {
  const h = Math.round(horizonYears)
  return Number.isFinite(h) ? Math.max(0, Math.min(MAX_RETIRE_IN_YEARS, h - 1)) : 0
}

/**
 * Clamps `retireInYears` as the engine's normalizeInputs and sanitizeInputs do (whole years in
 * [0, maxRetireInYears(horizon)], non-finite = 0), so lowering the horizon pulls retirement in with
 * it. Returns `inputs` itself when nothing changes.
 */
export function keepRetireBeforeHorizon(inputs: PlanInputs): PlanInputs {
  const r = Math.round(inputs.retireInYears)
  const retireInYears = Number.isFinite(r) ? Math.max(0, Math.min(r, maxRetireInYears(inputs.horizonYears))) : 0
  return retireInYears === inputs.retireInYears ? inputs : { ...inputs, retireInYears }
}
