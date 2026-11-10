// The plan card's "Spending in <city>" numbers, kept pure so a node test can check them against
// the engine.

import { amountsTotal, budgetTotal, destinationSpend, type SpendInputs } from '../../engine/cost'
import type { BudgetCategory, City } from '../../engine/types'

export interface PlanCardSpend {
  /** Destination annual spending per category, today's USD (as the engine spends it). */
  amounts: Record<BudgetCategory, number>
  homeTotal: number
  destTotal: number
  /** destTotal ÷ homeTotal − 1; 0 with no home budget. */
  delta: number
}

/** Per-category and total spending in `dest` vs `home`, priced by `destinationSpend`. */
export function planCardSpend(inputs: SpendInputs, home: City, dest: City): PlanCardSpend {
  const { amounts } = destinationSpend(inputs, home, dest)
  const homeTotal = budgetTotal(inputs.budget)
  const destTotal = amountsTotal(amounts)
  return { amounts, homeTotal, destTotal, delta: homeTotal > 0 ? destTotal / homeTotal - 1 : 0 }
}
