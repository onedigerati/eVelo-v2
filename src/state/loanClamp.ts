// Keeps the existing loan balance strictly below the portfolio, and says when that lowered it.

import type { PlanInputs } from '../engine/types'
import { clampExistingLoan } from '../ui/plan/existingLoan'
import { currency } from '../ui/format'

export interface LoanLowered {
  /** The balance before the clamp. */
  from: number
  /** The balance after it. */
  to: number
}

export interface LoanClamp {
  inputs: PlanInputs
  /** Set when the clamp lowered a balance the user didn't just enter; null otherwise. */
  lowered: LoanLowered | null
}

/**
 * Clamps `existingLoan` into [0, portfolio − 1] (as sanitizeInputs does). `enteredLoan` is true when
 * the update itself set the balance: the Borrowing field already blocks values at or above the
 * portfolio, so lowering it there is not news and `lowered` stays null.
 */
export function keepLoanUnderPortfolio(inputs: PlanInputs, enteredLoan: boolean): LoanClamp {
  const from = inputs.existingLoan ?? 0
  const existingLoan = clampExistingLoan(from, inputs.portfolio)
  if (existingLoan === inputs.existingLoan) return { inputs, lowered: null }
  // Only a real lowering of a finite, positive balance is worth telling the user about.
  const lowered = !enteredLoan && Number.isFinite(from) && from > existingLoan ? { from, to: existingLoan } : null
  return { inputs: { ...inputs, existingLoan }, lowered }
}

/** The store's setInput: entering the balance itself never notifies. */
export function clampAfterSet<K extends keyof PlanInputs>(inputs: PlanInputs, key: K, value: PlanInputs[K]): LoanClamp {
  return keepLoanUnderPortfolio({ ...inputs, [key]: value }, key === 'existingLoan')
}

/** The store's patchInputs: a patch that carries the balance counts as entering it. */
export function clampAfterPatch(inputs: PlanInputs, patch: Partial<PlanInputs>): LoanClamp {
  return keepLoanUnderPortfolio({ ...inputs, ...patch }, 'existingLoan' in patch)
}

/** The store's replaceInputs: a whole new plan always notifies when its balance is lowered. */
export function clampAfterReplace(inputs: PlanInputs): LoanClamp {
  return keepLoanUnderPortfolio(inputs, false)
}

/** The toast for a lowered balance. */
export function loanLoweredNotice(l: LoanLowered): { message: string; detail: string } {
  return {
    message: `Loan balance lowered to ${currency(l.to)}`,
    detail: `It was ${currency(l.from)}; it has to stay below the portfolio.`,
  }
}

/** What the run tracker needs from the toast system. */
export interface LoanToastApi {
  show(message: string, detail: string): number
  dismiss(id: number): void
  /** Still on screen: not dismissed, timed out or pushed off the stack. */
  isLive(id: number): boolean
}

/**
 * Shows "loan balance lowered" toasts, one at a time. Successive clamps while the toast is live
 * (stepping the portfolio down by arrow keys) form a run: each replaces the last, and "It was"
 * keeps the balance from before the run's first clamp, the one the user actually entered. A run
 * ends when its toast goes away, or when the next clamp doesn't start from the last one's result.
 */
export function loanToastRun(api: LoanToastApi): (l: LoanLowered) => void {
  let id: number | null = null
  let first = 0
  let last = 0
  return (l) => {
    const live = id !== null && api.isLive(id)
    const continues = live && l.from === last
    if (id !== null && live) api.dismiss(id)
    if (!continues) first = l.from
    last = l.to
    const { message, detail } = loanLoweredNotice({ from: first, to: l.to })
    id = api.show(message, detail)
  }
}
