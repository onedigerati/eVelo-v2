// Existing line-of-credit balance: how far into the loan the plan starts.

/**
 * 'ok': under the margin-call LTV.
 * 'over-limit': past the margin-call LTV, so the plan opens with a forced sale (which it survives).
 * 'breaks': at or past the after-tax line V·(1 − g·capGainsRate) — selling everything can't repay
 *   the loan once the gains tax is paid, so the engine counts every BBD path as broken in month 0.
 */
export type ExistingLoanStatus = 'ok' | 'over-limit' | 'breaks'

export interface ExistingLoanInput {
  portfolio: number
  balance: number
  maxLtv: number
  /** Share of today's value that is cost basis (0–1). */
  basisFraction: number
  capGainsRate: number
}

export interface ExistingLoanInfo {
  /** Balance ÷ portfolio today (0 with no portfolio). */
  ltv: number
  /** Largest balance the plan accepts: $1 under the portfolio (never negative), so the loan is always strictly smaller. */
  maxBalance: number
  /** LTV at or above which a forced sale can't cover the loan after tax: 1 − g·capGainsRate, g = max(0, 1 − basis). */
  breakLtv: number
  status: ExistingLoanStatus
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

export function existingLoanInfo({ portfolio, balance, maxLtv, basisFraction, capGainsRate }: ExistingLoanInput): ExistingLoanInfo {
  const maxBalance = maxExistingLoan(portfolio)
  const b = clampExistingLoan(balance, portfolio)
  const ltv = portfolio > 0 ? b / portfolio : 0
  const gain = Math.max(0, 1 - basisFraction)
  const breakLtv = 1 - gain * capGainsRate
  // Compare balances, not ratios, so the boundary is exact: L0 ≥ V·(1 − g·tax) breaks.
  const status: ExistingLoanStatus =
    b <= 0 ? 'ok' : b >= portfolio * breakLtv ? 'breaks' : b > portfolio * maxLtv ? 'over-limit' : 'ok'
  return { ltv, maxBalance, breakLtv, status }
}
