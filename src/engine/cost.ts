// City cost model: per-category destination/home cost ratios.

import type { Budget, BudgetCategory, City } from './types'

export const BUDGET_CATEGORIES: BudgetCategory[] = [
  'housing',
  'groceries',
  'dining',
  'transport',
  'utilities',
  'healthcare',
  'travel',
  'other',
]

/**
 * Effective destination/home cost ratio per budget category.
 * housing→rent, groceries→groceries, dining→restaurants, transport/utilities/other→col,
 * healthcare→city.healthcare, travel→1. Where the raw ratio is < 1 the expat factor claws back
 * part of the savings: eff = ratio + (1 - ratio) * expatFactor. Overrides replace the result.
 */
export function categoryRatios(
  home: City,
  dest: City,
  expatFactor: number,
  overrides?: Partial<Record<BudgetCategory, number>>,
): Record<BudgetCategory, number> {
  const q = (a: number, b: number) => (b > 0 ? a / b : 1)
  const col = q(dest.idx.col, home.idx.col)
  const raw: Record<BudgetCategory, number> = {
    housing: q(dest.idx.rent, home.idx.rent),
    groceries: q(dest.idx.groceries, home.idx.groceries),
    dining: q(dest.idx.restaurants, home.idx.restaurants),
    transport: col,
    utilities: col,
    healthcare: q(dest.healthcare, home.healthcare),
    travel: 1,
    other: col,
  }
  const e = Math.min(1, Math.max(0, expatFactor))
  const out = {} as Record<BudgetCategory, number>
  for (const c of BUDGET_CATEGORIES) {
    const r = raw[c]
    const o = overrides?.[c]
    out[c] = o != null && Number.isFinite(o) ? o : r < 1 ? r + (1 - r) * e : r
  }
  return out
}

export function budgetTotal(b: Budget): number {
  let s = 0
  for (const c of BUDGET_CATEGORIES) s += b[c] || 0
  return s
}

export function applyRatios(b: Budget, ratios: Record<BudgetCategory, number>): number {
  let s = 0
  for (const c of BUDGET_CATEGORIES) s += (b[c] || 0) * ratios[c]
  return s
}

/** True when `x` is a usable fixed amount: a finite number >= 0. */
export function isFixedAmount(x: unknown): x is number {
  return typeof x === 'number' && Number.isFinite(x) && x >= 0
}

/**
 * Destination annual spending per category, today's USD: `fixed[c]` where it is a finite number
 * >= 0, else home budget × ratio. A category whose home budget is $0 can still carry a fixed amount.
 */
export function destinationAmounts(
  b: Budget,
  ratios: Record<BudgetCategory, number>,
  fixed?: Partial<Record<BudgetCategory, number>>,
): Record<BudgetCategory, number> {
  const out = {} as Record<BudgetCategory, number>
  for (const c of BUDGET_CATEGORIES) {
    const f = fixed?.[c]
    out[c] = isFixedAmount(f) ? f : (b[c] || 0) * ratios[c]
  }
  return out
}

export function amountsTotal(a: Record<BudgetCategory, number>): number {
  let s = 0
  for (const c of BUDGET_CATEGORIES) s += a[c]
  return s
}
