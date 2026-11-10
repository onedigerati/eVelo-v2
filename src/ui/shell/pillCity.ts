import type { PlanInputs } from '../../engine/types'

/**
 * The city a verdict pill's odds are for: the destination when one is set, else home.
 * `nameOf` resolves an id to its display name (`cityName` from outlook/cards in the app).
 * Returns null when no name resolves, so the pill renders as it did before cities were named.
 */
export function pillCity(
  inputs: Pick<PlanInputs, 'homeCityId' | 'destCityId'>,
  nameOf: (id: string) => string,
): string | null {
  const id = inputs.destCityId || inputs.homeCityId
  const name = id ? nameOf(id).trim() : ''
  return name || null
}

/** What the pill does when activated, spoken after the odds. */
export type PillAction = 'outlook' | 'verdict' | 'drawer'

const ACTION: Record<PillAction, string> = {
  outlook: 'See the outlook.',
  verdict: 'Back to the verdict.',
  drawer: 'Close the plan and go to the verdict.',
}

/** Spoken label: "Holds in 68% of futures in Bangkok. See the outlook." (no " in …" without a city). */
export function pillLabel(success: number, city: string | null, action: PillAction): string {
  const pct = Math.round(success * 100)
  return `Holds in ${pct}% of futures${city ? ` in ${city}` : ''}. ${ACTION[action]}`
}
