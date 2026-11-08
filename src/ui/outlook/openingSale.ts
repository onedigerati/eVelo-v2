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
