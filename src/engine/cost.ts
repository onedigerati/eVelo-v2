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

/** Raw destination/home cost ratio per category, before the expat premium. */
function rawRatios(home: City, dest: City): Record<BudgetCategory, number> {
  const q = (a: number, b: number) => (b > 0 ? a / b : 1)
  const col = q(dest.idx.col, home.idx.col)
  return {
    housing: q(dest.idx.rent, home.idx.rent),
    groceries: q(dest.idx.groceries, home.idx.groceries),
    dining: q(dest.idx.restaurants, home.idx.restaurants),
    transport: col,
    utilities: col,
    healthcare: q(dest.healthcare, home.healthcare),
    travel: 1,
    other: col,
  }
}

const clamp01 = (e: number) => Math.min(1, Math.max(0, e))

/** eVelo's model ratio at premium `e` for a raw ratio `r`: r + (1 − r)·e where r < 1, else r. */
function modelAt(r: number, e: number): number {
  return r < 1 ? r + (1 - r) * clamp01(e) : r
}

/**
 * Effective destination/home cost ratio per budget category.
 * housing→rent, groceries→groceries, dining→restaurants, transport/utilities/other→col,
 * healthcare→city.healthcare, travel→1. Where the raw ratio is < 1 the expat factor claws back
 * part of the savings: eff = ratio + (1 - ratio) * expatFactor. Overrides replace the result as is
 * (no premium scaling: use `destinationSpend` for a plan's typed overrides).
 */
export function categoryRatios(
  home: City,
  dest: City,
  expatFactor: number,
  overrides?: Partial<Record<BudgetCategory, number>>,
): Record<BudgetCategory, number> {
  const raw = rawRatios(home, dest)
  const out = {} as Record<BudgetCategory, number>
  for (const c of BUDGET_CATEGORIES) {
    const o = overrides?.[c]
    out[c] = o != null && Number.isFinite(o) ? o : modelAt(raw[c], expatFactor)
  }
  return out
}

/**
 * A typed value pinned to the premium it was typed at (model ratio `mAt`), scaled to the model
 * ratio now (`mNow`): typed × mNow / mAt, capped at max(`cap`, typed). Exact (typed) when the model
 * hasn't moved; typed as is when `mAt` isn't a finite number > 0 (nothing to scale from).
 */
export function scaleTyped(typed: number, mNow: number, mAt: number, cap: number): number {
  if (!(mAt > 0) || !Number.isFinite(mAt) || !Number.isFinite(mNow) || mNow === mAt) return typed
  return Math.min(typed * (mNow / mAt), Math.max(cap, typed))
}

/** The plan fields `destinationSpend` reads. */
export type SpendInputs = {
  budget: Budget
  expatFactor: number
  ratioOverrides?: Partial<Record<BudgetCategory, number>>
  ratioOverrideAt?: Partial<Record<BudgetCategory, number>>
  amountOverrides?: Partial<Record<string, Partial<Record<BudgetCategory, number>>>>
  amountOverrideAt?: Partial<Record<string, Partial<Record<BudgetCategory, number>>>>
}

export interface DestinationSpend {
  /** eVelo's own model ratio per category at the plan's premium (no overrides). */
  model: Record<BudgetCategory, number>
  /** Effective ratio per category: a typed % scaled with the premium where set, else the model. */
  ratios: Record<BudgetCategory, number>
  /** Destination annual spending per category, today's USD: a typed $ for this city scaled with
   *  the premium where set, else home budget × ratio. */
  amounts: Record<BudgetCategory, number>
  /** Which override each category carries for this city: a $ (`amount`), a % (`ratio`), or none. */
  override: Record<BudgetCategory, 'amount' | 'ratio' | null>
}

/**
 * The one place a plan's destination spending is priced, so every view agrees (simulation, Atlas,
 * profiles, Outlook cost card, existing-loan check, plan card). Typed overrides are pinned to the
 * premium they were typed at (`ratioOverrideAt` / `amountOverrideAt`; missing = the plan's current
 * premium, i.e. no scaling) and scale as eVelo's model ratio m_c for this city moves:
 * - `$` (amountOverrides[dest.id][c]): typed × m_c(e)/m_c(e0), capped at max(home budget c, typed);
 * - `%` (ratioOverrides[c], every city): typed × m_c(e)/m_c(e0) with this city's m, capped at max(1, typed).
 * Rows the premium doesn't touch (raw ratio ≥ 1, Travel) never move; m_c(e0) ≤ 0 means no scaling.
 */
export function destinationSpend(inputs: SpendInputs, home: City, dest: City): DestinationSpend {
  const raw = rawRatios(home, dest)
  const e = inputs.expatFactor
  const fixed = inputs.amountOverrides?.[dest.id]
  const fixedAt = inputs.amountOverrideAt?.[dest.id]
  const model = {} as Record<BudgetCategory, number>
  const ratios = {} as Record<BudgetCategory, number>
  const amounts = {} as Record<BudgetCategory, number>
  const override = {} as Record<BudgetCategory, 'amount' | 'ratio' | null>
  const anchorOf = (a: number | undefined) => (typeof a === 'number' && Number.isFinite(a) ? a : e)
  for (const c of BUDGET_CATEGORIES) {
    const r = raw[c]
    const m = modelAt(r, e)
    model[c] = m
    const o = inputs.ratioOverrides?.[c]
    const hasRatio = o != null && Number.isFinite(o)
    ratios[c] = hasRatio ? scaleTyped(o, m, modelAt(r, anchorOf(inputs.ratioOverrideAt?.[c])), 1) : m
    const home$ = inputs.budget[c] || 0
    const f = fixed?.[c]
    if (isFixedAmount(f)) {
      amounts[c] = scaleTyped(f, m, modelAt(r, anchorOf(fixedAt?.[c])), home$)
      override[c] = 'amount'
    } else {
      amounts[c] = home$ * ratios[c]
      override[c] = hasRatio ? 'ratio' : null
    }
  }
  return { model, ratios, amounts, override }
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
