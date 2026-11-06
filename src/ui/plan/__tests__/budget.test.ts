import { describe, expect, it } from 'vitest'
import { scaleBudget } from '../budget'
import { budgetTotal } from '../../../engine/cost'
import { DEFAULT_INPUTS } from '../../../engine/defaults'

describe('scaleBudget', () => {
  it('lands exactly on the typed total and keeps the mix', () => {
    const b = scaleBudget(DEFAULT_INPUTS.budget, 95_000)
    expect(budgetTotal(b)).toBe(95_000)
    const share = (x: typeof b) => x.housing / budgetTotal(x)
    expect(share(b)).toBeCloseTo(share(DEFAULT_INPUTS.budget), 2)
  })
  it('handles odd amounts and zero', () => {
    expect(budgetTotal(scaleBudget(DEFAULT_INPUTS.budget, 87_654))).toBe(87_654)
    expect(budgetTotal(scaleBudget(DEFAULT_INPUTS.budget, 0))).toBe(0)
  })
  it('uses the default mix when the budget is empty', () => {
    const empty = scaleBudget(DEFAULT_INPUTS.budget, 0)
    const b = scaleBudget(empty, 110_000)
    expect(budgetTotal(b)).toBe(110_000)
    expect(b.housing).toBeGreaterThan(0)
  })
})
