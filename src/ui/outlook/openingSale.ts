// The opening forced sale: a starting balance above the call line is sold down today, before the
// first month. Read in one place so the captions agree, and defensively until the engine's
// `SimulationResult.openingSale` field lands everywhere.

import type { SimulationResult } from '../../engine/types'

export interface OpeningSale {
  /** Portfolio sold today (today's dollars). */
  sold: number
  /** Capital-gains tax that sale paid. */
  taxPaid: number
}

/** The plan's opening forced sale, or null when there is none. */
export function openingSaleOf(r: SimulationResult): OpeningSale | null {
  const s = (r as unknown as { openingSale?: OpeningSale | null }).openingSale ?? null
  return s && s.sold > 0 ? s : null
}

/** True when the plan is broken from the start: the existing balance is past what an opening sale
 *  can cover after tax (or at the portfolio). Missing on older results means false. */
export function openingBrokenOf(r: SimulationResult): boolean {
  return (r as unknown as { openingBroken?: boolean }).openingBroken === true
}

/** The one sentence every caption gives for a plan broken from the start. */
export const BROKEN_AT_START = 'This plan fails at once: after tax, a forced sale can’t cover the existing balance.'
