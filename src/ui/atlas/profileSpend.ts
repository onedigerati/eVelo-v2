import { currencyCompact, percent } from '../format'
import { CATEGORY_LABEL, costDelta } from './atlasData'
import type { CategoryCompare } from './picks'

/** Words for each override kind, as the sr-only line and the marker's tooltip say them. */
export const OVERRIDE_SPOKEN = { amount: 'your amount', ratio: 'your change' } as const
export const OVERRIDE_TITLE = {
  amount: 'Your amount, typed in the plan for this city',
  ratio: 'Your change versus home, typed in the plan for every city',
} as const

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
  return `Your ${homeName} budget at local prices, with ${listOf(parts)}.`
}

/** Screen-reader line for one category row; marked rows end in "your amount" / "your change". */
export function spendRowSpoken(c: CategoryCompare, homeName: string, isHome: boolean): string {
  const label = CATEGORY_LABEL[c.cat]
  if (isHome) return `${label}: ${currencyCompact(c.here)} a year.`
  const delta = c.ratio == null ? '' : `, ${costDelta(c.ratio)}`
  const mark = c.override ? `, ${OVERRIDE_SPOKEN[c.override]}` : ''
  return `${label}: ${currencyCompact(c.here)} here vs ${currencyCompact(c.home)} in ${homeName}${delta}${mark}.`
}
