// Existing line-of-credit balance: how far into the loan the plan starts.

import { amountsTotal, budgetTotal, destinationSpend } from '../../engine/cost'
import { openingSale } from '../../engine/openingSale'
import type { City, PlanInputs } from '../../engine/types'
import { effectiveMoveInYears, retireInYearsOf } from '../retire'

/**
 * 'ok': at or under the margin-call LTV — no sale.
 * 'over-limit': past the margin-call LTV, so the lender forces a sale today, before the plan's
 *   first month, bringing the loan to the post-call target (the plan is judged from there).
 * 'breaks': that sale can't cover the loan after tax (or the loan is at or above the portfolio), so
 *   the engine counts every BBD path as broken from the start.
 * Status comes from the engine's own openingSale, with kernelConfig's clamps, so the two agree.
 */
export type ExistingLoanStatus = 'ok' | 'over-limit' | 'breaks'

export interface ExistingLoanInput {
  portfolio: number
  balance: number
  maxLtv: number
  /** LTV a forced sale brings the loan back to (targetLtvAfterCall); capped at maxLtv as in the engine. */
  targetLtv: number
  /** Share of today's value that is cost basis (0–1; clamped as in the engine). */
  basisFraction: number
  capGainsRate: number
  /** One year of the plan's spending (today's USD); an opening sale that leaves less net worth than
   *  this is flagged `thin`. Optional: without it, nothing is thin. */
  annualSpend?: number
}

export interface ExistingLoanInfo {
  /** Balance ÷ portfolio today (0 with no portfolio). */
  ltv: number
  /** Largest balance the plan accepts: $1 under the portfolio (never negative), so the loan is always strictly smaller. */
  maxBalance: number
  status: ExistingLoanStatus
  /** The opening forced sale ('over-limit' only, else null): shares sold, tax paid (today's USD) and the LTV it lands at. */
  sale: { sold: number; taxPaid: number; ltv: number } | null
  /** Net worth the plan starts with: portfolio − loan, after the opening sale when there is one
   *  (today's USD; 0 when it breaks). */
  netWorthLeft: number
  /** 'over-limit' only: the sale leaves less than one year of spending (`annualSpend`). */
  thin: boolean
}

/** Largest existing balance allowed for a portfolio: $1 under it, and 0 when there is nothing to borrow against. */
export function maxExistingLoan(portfolio: number): number {
  return Number.isFinite(portfolio) ? Math.max(0, portfolio - 1) : 0
}

/** Clamps a balance into [0, maxExistingLoan(portfolio)]; non-finite values become 0. */
export function clampExistingLoan(balance: number, portfolio: number): number {
  if (!Number.isFinite(balance)) return 0
  return Math.min(maxExistingLoan(portfolio), Math.max(0, balance))
}

export function existingLoanInfo({ portfolio, balance, maxLtv, targetLtv, basisFraction, capGainsRate, annualSpend = 0 }: ExistingLoanInput): ExistingLoanInfo {
  const maxBalance = maxExistingLoan(portfolio)
  const b = clampExistingLoan(balance, portfolio)
  const ltv = portfolio > 0 ? b / portfolio : 0
  // Same clamps as kernelConfig: basis in [0, 1], target no higher than the threshold.
  const basis = portfolio * Math.min(1, Math.max(0, basisFraction))
  const open = openingSale(portfolio, basis, b, maxLtv, Math.min(targetLtv, maxLtv), capGainsRate)
  if (open === null) return { ltv, maxBalance, status: 'ok', sale: null, netWorthLeft: Math.max(0, portfolio - b), thin: false }
  if (open.broken) return { ltv, maxBalance, status: 'breaks', sale: null, netWorthLeft: 0, thin: false }
  const netWorthLeft = Math.max(0, open.port - open.loan)
  return {
    ltv,
    maxBalance,
    status: 'over-limit',
    sale: { sold: open.sold, taxPaid: open.taxPaid, ltv: open.loan / open.port },
    netWorthLeft,
    thin: netWorthLeft < annualSpend,
  }
}

export type FirstYearInputs = Pick<
  PlanInputs,
  | 'budget'
  | 'destCityId'
  | 'moveInYears'
  | 'retireInYears'
  | 'expatFactor'
  | 'ratioOverrides'
  | 'ratioOverrideAt'
  | 'amountOverrides'
  | 'amountOverrideAt'
  | 'otherIncome'
  | 'incomeStartAge'
  | 'age'
>

/**
 * What the plan draws in its first year (today's USD). While still working (retireInYears > 0)
 * nothing is drawn — savings go in instead — so it is 0. Otherwise: the destination's budget when the
 * (effective) move happens within the year (priced by `destinationSpend`, as the engine and the Place section price it:
 * per-category city ratios with the expat factor, typed overrides scaled from their anchors), else the home budget, less other income when it has
 * already started. Never negative. `home`/`dest` are the plan's cities (null or missing when unknown);
 * a destination equal to home means staying home, as in the engine.
 */
export function firstYearSpend(inputs: FirstYearInputs, home: City | null | undefined, dest: City | null | undefined): number {
  // Working years come first: no withdrawals, so no first-year draw (the engine's retireMonth > 0).
  if (retireInYearsOf(inputs) > 0) return 0
  const moved =
    inputs.destCityId != null && home != null && dest != null && dest.id !== home.id && effectiveMoveInYears(inputs) < 1
  const spend = moved
    ? amountsTotal(destinationSpend(inputs, home, dest).amounts)
    : budgetTotal(inputs.budget)
  const income = inputs.incomeStartAge <= inputs.age && Number.isFinite(inputs.otherIncome) ? Math.max(0, inputs.otherIncome) : 0
  return Math.max(0, spend - income)
}
