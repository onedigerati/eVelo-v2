// The plan card's per-row note for typed spending: "scales with premium", plus what was typed once
// the slider has moved it. Pure, so a node test checks which rows carry it.

import { BUDGET_CATEGORIES, destinationSpend, isFixedAmount, type SpendInputs } from '../../engine/cost'
import type { BudgetCategory, City } from '../../engine/types'
import { currency, percent } from '../format'
import { changeLabel } from './spendOverrides'

/** The short note on a typed row the premium can move (shared wording with the city profile). */
export const SCALES_NOTE = 'scales with premium'

/** The premium as the slider shows it: 0.35 -> "35%". */
export const premiumLabel = (e: number) => `${Math.round(e * 100)}%`

export interface ScaleNote {
  /** Always SCALES_NOTE. */
  note: string
  /** "you typed $6,000 at 35%" / "you typed −50% at 35%" once the row has moved off what was typed; else null. */
  typed: string | null
}

const anchorOr = (a: number | undefined, e: number) => (typeof a === 'number' && Number.isFinite(a) ? a : e)

/**
 * Per category, the note for a typed row (`$` for this city, else a `%`) that the premium can move,
 * or null: no typed value, a row the premium never touches (pricier than home, Travel: eVelo's model
 * is the same at 0% and 100%), or a `%` on a row with no home amount (nothing to scale). `typed` is
 * set only when the premium now differs from the row's anchor and the value differs from what was typed.
 */
export function scaleNotes(inputs: SpendInputs, home: City, dest: City): Record<BudgetCategory, ScaleNote | null> {
  const e = inputs.expatFactor
  const now = destinationSpend(inputs, home, dest)
  const at0 = destinationSpend({ ...inputs, expatFactor: 0 }, home, dest).model
  const at1 = destinationSpend({ ...inputs, expatFactor: 1 }, home, dest).model
  const out = {} as Record<BudgetCategory, ScaleNote | null>
  for (const c of BUDGET_CATEGORIES) {
    const kind = now.override[c]
    const movable = Math.abs(at1[c] - at0[c]) > 1e-9
    if (!kind || !movable || (kind === 'ratio' && !((inputs.budget[c] || 0) > 0))) {
      out[c] = null
      continue
    }
    let typed: string | null = null
    if (kind === 'amount') {
      const t = inputs.amountOverrides?.[dest.id]?.[c]
      const at = anchorOr(inputs.amountOverrideAt?.[dest.id]?.[c], e)
      if (isFixedAmount(t) && at !== e && Math.abs(now.amounts[c] - t) >= 0.5)
        typed = `you typed ${currency(t)} at ${premiumLabel(at)}`
    } else {
      const t = inputs.ratioOverrides?.[c]
      const at = anchorOr(inputs.ratioOverrideAt?.[c], e)
      if (typeof t === 'number' && at !== e && Math.abs(now.ratios[c] - t) >= 0.00005)
        typed = `you typed ${changeLabel(t - 1, (v) => percent(v, { signed: true }))} at ${premiumLabel(at)}`
    }
    out[c] = { note: SCALES_NOTE, typed }
  }
  return out
}

/** The plan card's ⓘ tip: how the card's numbers are worked out and how typed values behave. */
export function spendTip(destName: string, homeName: string): string {
  return (
    `Each % compares ${destName}’s cost for that category with what you spend on it in ${homeName}, after the expat price ` +
    'premium. Tap the % or the $ to set your own: a $ is a yearly price you found, a % a change on your home budget. ' +
    'What you type scales with the premium from where you typed it, the way eVelo’s estimate for that row moves, and ' +
    'returns exactly to what you typed when you slide back. It never rises above the larger of your home amount and what ' +
    'you typed. Rows the premium doesn’t move (pricier than home, Travel) stay as typed. × undoes a row; Reset all undoes them all.'
  )
}
