import { describe, expect, it } from 'vitest'
import { DEFAULT_INPUTS } from '../../engine/defaults'
import type { PlanInputs } from '../../engine/types'
import { clampAfterPatch, clampAfterReplace, clampAfterSet, keepLoanUnderPortfolio, loanLoweredNotice } from '../loanClamp'

const plan = (over: Partial<PlanInputs> = {}): PlanInputs => ({ ...DEFAULT_INPUTS, portfolio: 3_000_000, existingLoan: 500_000, ...over })

describe('keepLoanUnderPortfolio', () => {
  it('passes a balance under the portfolio through untouched (same object)', () => {
    const p = plan()
    expect(keepLoanUnderPortfolio(p, false)).toEqual({ inputs: p, lowered: null })
    expect(keepLoanUnderPortfolio(p, false).inputs).toBe(p)
  })

  it('lowers a balance at or above the portfolio to $1 under it, and reports it', () => {
    const c = keepLoanUnderPortfolio(plan({ portfolio: 300_000 }), false)
    expect(c.inputs.existingLoan).toBe(299_999)
    expect(c.lowered).toEqual({ from: 500_000, to: 299_999 })
  })

  it('clamps an entered balance without reporting it (the Borrowing field already blocks it)', () => {
    const c = keepLoanUnderPortfolio(plan({ existingLoan: 4_000_000 }), true)
    expect(c.inputs.existingLoan).toBe(2_999_999)
    expect(c.lowered).toBeNull()
  })

  it('lowers the balance back to 0 when the portfolio goes to 0', () => {
    const c = keepLoanUnderPortfolio(plan({ portfolio: 0 }), false)
    expect(c.inputs.existingLoan).toBe(0)
    expect(c.lowered).toEqual({ from: 500_000, to: 0 })
  })

  it('never reports a zero or non-finite balance', () => {
    expect(keepLoanUnderPortfolio(plan({ portfolio: 0, existingLoan: 0 }), false).lowered).toBeNull()
    const nan = keepLoanUnderPortfolio(plan({ existingLoan: Number.NaN }), false)
    expect(nan.inputs.existingLoan).toBe(0)
    expect(nan.lowered).toBeNull()
  })
})

describe('store update semantics', () => {
  const base = plan()

  it('setInput on the portfolio reports; setInput on the loan itself does not', () => {
    expect(clampAfterSet(base, 'portfolio', 300_000).lowered).toEqual({ from: 500_000, to: 299_999 })
    const own = clampAfterSet(base, 'existingLoan', 5_000_000)
    expect(own.inputs.existingLoan).toBe(2_999_999)
    expect(own.lowered).toBeNull()
  })

  it('setInput on an unrelated key leaves the loan alone', () => {
    const c = clampAfterSet(base, 'age', 61)
    expect(c.inputs.existingLoan).toBe(500_000)
    expect(c.lowered).toBeNull()
  })

  it('a patch counts as entering the loan only when it carries the field', () => {
    expect(clampAfterPatch(base, { portfolio: 300_000 }).lowered).toEqual({ from: 500_000, to: 299_999 })
    const both = clampAfterPatch(base, { portfolio: 300_000, existingLoan: 400_000 })
    expect(both.inputs.existingLoan).toBe(299_999)
    expect(both.lowered).toBeNull()
  })

  it('replace always reports a lowered balance', () => {
    const c = clampAfterReplace(plan({ portfolio: 300_000, existingLoan: 400_000 }))
    expect(c.inputs.existingLoan).toBe(299_999)
    expect(c.lowered).toEqual({ from: 400_000, to: 299_999 })
  })

  it('does not mutate the inputs it was given', () => {
    const p = plan({ portfolio: 300_000 })
    clampAfterReplace(p)
    expect(p.existingLoan).toBe(500_000)
  })
})

describe('loanLoweredNotice', () => {
  it('names the new and old balances in full dollars', () => {
    expect(loanLoweredNotice({ from: 500_000, to: 299_999 })).toEqual({
      message: 'Loan balance lowered to $299,999',
      detail: 'It was $500,000; it has to stay below the portfolio.',
    })
  })
})
