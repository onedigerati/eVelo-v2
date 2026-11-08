import { describe, expect, it } from 'vitest'
import { DEFAULT_INPUTS } from '../../engine/defaults'
import type { PlanInputs } from '../../engine/types'
import { clampAfterPatch, clampAfterReplace, clampAfterSet, keepLoanUnderPortfolio, loanLoweredNotice, loanToastRun } from '../loanClamp'

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

describe('loanToastRun', () => {
  /** A fake toast stack: show pushes, dismiss removes, and `expire` stands in for a timeout. */
  function fakeToasts() {
    const live = new Map<number, string>()
    let next = 1
    const api = {
      show: (_m: string, detail: string) => (live.set(next, detail), next++),
      dismiss: (id: number) => void live.delete(id),
      isLive: (id: number) => live.has(id),
    }
    return { api, live, expire: () => live.clear(), details: () => [...live.values()] }
  }

  /** Lowers the portfolio through `ports`, clamping the plan's balance at each step. */
  function stepDown(show: ReturnType<typeof loanToastRun>, inputs: PlanInputs, ports: number[]): PlanInputs {
    for (const portfolio of ports) {
      const c = clampAfterSet(inputs, 'portfolio', portfolio)
      if (c.lowered) show(c.lowered)
      inputs = c.inputs
    }
    return inputs
  }

  it('keeps the original balance as "It was" through a run of arrow-key steps', () => {
    const t = fakeToasts()
    const show = loanToastRun(t.api)
    const after = stepDown(show, plan({ existingLoan: 500_000 }), [490_000, 480_000, 470_000, 460_000])
    expect(after.existingLoan).toBe(459_999)
    // one toast on screen, the latest, still naming the balance the user entered
    expect(t.live.size).toBe(1)
    expect(t.details()).toEqual(['It was $500,000; it has to stay below the portfolio.'])
  })

  it('starts a new run once the toast has timed out or been dismissed', () => {
    const t = fakeToasts()
    const show = loanToastRun(t.api)
    const p = stepDown(show, plan({ existingLoan: 500_000 }), [490_000, 480_000])
    t.expire()
    stepDown(show, p, [470_000])
    expect(t.details()).toEqual(['It was $479,999; it has to stay below the portfolio.'])
  })

  it('starts a new run when the balance changed in between', () => {
    const t = fakeToasts()
    const show = loanToastRun(t.api)
    let p = stepDown(show, plan({ existingLoan: 500_000 }), [490_000])
    // the user enters a new balance under the portfolio, then lowers the portfolio below it
    p = clampAfterSet(p, 'existingLoan', 400_000).inputs
    stepDown(show, p, [300_000])
    expect(t.details()).toEqual(['It was $400,000; it has to stay below the portfolio.'])
  })

  it('starts a new run when the user types the clamped value back in (reset)', () => {
    const t = fakeToasts()
    const show = loanToastRun(t.api)
    let p = stepDown(show, plan({ existingLoan: 500_000 }), [490_000])
    expect(p.existingLoan).toBe(489_999)
    // the user types the balance the clamp left; the store resets the run on any direct entry
    show.reset()
    p = clampAfterSet(p, 'existingLoan', 489_999).inputs
    stepDown(show, p, [480_000])
    expect(t.live.size).toBe(1)
    expect(t.details()).toEqual(['It was $489,999; it has to stay below the portfolio.'])
  })

  it('a reset lasts for one clamp: the steps after it join the new run', () => {
    const t = fakeToasts()
    const show = loanToastRun(t.api)
    let p = stepDown(show, plan({ existingLoan: 500_000 }), [490_000])
    show.reset()
    p = stepDown(show, p, [480_000, 470_000])
    expect(t.details()).toEqual(['It was $489,999; it has to stay below the portfolio.'])
  })

  it('reads as before for a single clamp', () => {
    const t = fakeToasts()
    stepDown(loanToastRun(t.api), plan({ existingLoan: 500_000 }), [300_000])
    expect(t.details()).toEqual(['It was $500,000; it has to stay below the portfolio.'])
  })
})
