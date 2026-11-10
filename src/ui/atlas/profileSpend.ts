import { currencyCompact, percent } from '../format'
import { CATEGORY_LABEL, costDelta } from './atlasData'
import type { CategoryCompare } from './picks'

/** Words for each override kind, as the sr-only line and the marker's tooltip say them. */
export const OVERRIDE_SPOKEN = { amount: 'your amount', ratio: 'your change' } as const
export const OVERRIDE_TITLE = {
  amount: 'Your amount, typed in the plan for this city',
  ratio: 'Your change versus home, typed in the plan for every city',
} as const

/** Added to a marker on a row the Expat price premium can move (the plan card uses the same words). */
export const SCALES_MARK = 'scales with premium'

/** The row's marker as words: "your amount · scales with premium", or just "your amount" where the
 *  premium can't move the row (Travel, pricier than home). Null on rows with no override. */
export function overrideMarker(c: Pick<CategoryCompare, 'override' | 'scales'>): string | null {
  if (!c.override) return null
  return c.scales ? `${OVERRIDE_SPOKEN[c.override]} · ${SCALES_MARK}` : OVERRIDE_SPOKEN[c.override]
}

/** Tooltip on a marked row's value. */
export function overrideTitle(c: Pick<CategoryCompare, 'override' | 'scales'>): string | undefined {
  if (!c.override) return undefined
  const base = OVERRIDE_TITLE[c.override]
  return c.scales ? `${base}; it scales with the Expat price premium from where you typed it.` : `${base}.`
}

/** "A", "A and B", "A, B and C". */
function listOf(items: string[]): string {
  if (items.length <= 1) return items.join('')
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`
}

const names = (cats: CategoryCompare[], kind: 'amount' | 'ratio'): string[] =>
  cats.filter((c) => c.override === kind).map((c) => CATEGORY_LABEL[c.cat])

/**
 * Note under a profile's spending list. Away from home it names the categories the user set:
 * "…premium (15%), your own amount for Housing and your change for Dining out." Says nothing
 * about overrides when no row carries one.
 */
export function spendNote(cats: CategoryCompare[], homeName: string, expatFactor: number, isHome: boolean): string {
  if (isHome) return `Your budget at ${homeName} prices, as you set it in the plan.`
  const parts = [`your expat price premium (${percent(expatFactor)})`]
  const amt = names(cats, 'amount')
  const chg = names(cats, 'ratio')
  if (amt.length) parts.push(`your own ${amt.length > 1 ? 'amounts' : 'amount'} for ${listOf(amt)}`)
  if (chg.length) parts.push(`your ${chg.length > 1 ? 'changes' : 'change'} for ${listOf(chg)}`)
  const note = `Your ${homeName} budget at local prices, with ${listOf(parts)}.`
  const marked = cats.filter((c) => c.override)
  const moving = marked.filter((c) => c.scales)
  if (!moving.length) return note
  // All the named rows move: "These follow…"; only some: name them.
  const who =
    moving.length === marked.length
      ? moving.length > 1 ? 'These follow' : 'It follows'
      : `${listOf(moving.map((c) => CATEGORY_LABEL[c.cat]))} ${moving.length > 1 ? 'follow' : 'follows'}`
  return `${note} ${who} the Expat price premium from where ${moving.length > 1 ? 'they were' : 'it was'} typed.`
}

/** Screen-reader line for one category row; marked rows end in "your amount" / "your change",
 *  plus ", scales with premium" where the premium can move them. */
export function spendRowSpoken(c: CategoryCompare, homeName: string, isHome: boolean): string {
  const label = CATEGORY_LABEL[c.cat]
  if (isHome) return `${label}: ${currencyCompact(c.here)} a year.`
  const delta = c.ratio == null ? '' : `, ${costDelta(c.ratio)}`
  const m = overrideMarker(c)
  const mark = m ? `, ${m.replace(' · ', ', ')}` : ''
  return `${label}: ${currencyCompact(c.here)} here vs ${currencyCompact(c.home)} in ${homeName}${delta}${mark}.`
}
