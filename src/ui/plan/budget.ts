import { BUDGET_CATEGORIES, budgetTotal } from '../../engine/cost'
import { DEFAULT_INPUTS } from '../../engine/defaults'
import type { Budget } from '../../engine/types'

/**
 * Rescale a budget to a new annual total, keeping its category mix (or the default
 * mix when the budget is empty). Categories round to $100; the rounding remainder goes
 * to the largest category so the total lands exactly on what the user typed.
 */
export function scaleBudget(budget: Budget, total: number): Budget {
  const target = Math.max(0, Math.round(total))
  const base = budgetTotal(budget) > 0 ? budget : DEFAULT_INPUTS.budget
  const baseTotal = budgetTotal(base)
  const out = {} as Budget
  for (const c of BUDGET_CATEGORIES) out[c] = Math.round((base[c] * target) / baseTotal / 100) * 100
  const largest = BUDGET_CATEGORIES.reduce((a, c) => (out[c] > out[a] ? c : a), BUDGET_CATEGORIES[0])
  out[largest] = Math.max(0, out[largest] + target - budgetTotal(out))
  return out
}
