// result.yearly: per-year medians of what the eVelo path borrowed, the interest added to its loan
// and what margin-call forced sales sold, tallied in the kernel's recording branch.

import { describe, expect, it } from 'vitest'
import marketJson from '../../data/market.json'
import { DEFAULT_INPUTS } from '../defaults'
import { simulate } from '../simulate'
import type { MarketData, PlanInputs } from '../types'
import { CITIES_FIX } from './fixtures'

const market = marketJson as unknown as MarketData
const run = (o: Partial<PlanInputs>) => simulate(market, CITIES_FIX, { ...structuredClone(DEFAULT_INPUTS), paths: 600, ...o })
const FIELDS = ['borrowed', 'interest', 'forcedSaleSold', 'repaid', 'wealthTax'] as const

describe('eVelo yearly tallies', () => {
  it('one finite, non-negative median per year for each field', () => {
    for (const horizonYears of [30, 12]) {
      const r = run({ horizonYears })
      for (const f of FIELDS) {
        expect(r.yearly[f].length).toBe(horizonYears)
        for (const x of r.yearly[f]) {
          expect(Number.isFinite(x)).toBe(true)
          expect(x).toBeGreaterThanOrEqual(0)
        }
      }
      // Retired from today with spending above income: the loan funds every year, and accrues interest.
      for (let y = 0; y < horizonYears; y++) expect(r.yearly.borrowed[y]).toBeGreaterThan(0)
      for (let y = 1; y < horizonYears; y++) expect(r.yearly.interest[y]).toBeGreaterThan(0)
    }
  })

  it('nothing is borrowed (and with no loan, no interest) before retirement', () => {
    const r = run({ retireInYears: 6, savingsWhileWorking: 40_000, moveInYears: 6 })
    for (let y = 0; y < 6; y++) {
      expect(r.yearly.borrowed[y]).toBe(0)
      expect(r.yearly.interest[y]).toBe(0)
      expect(r.yearly.forcedSaleSold[y]).toBe(0)
    }
    expect(r.yearly.borrowed[6]).toBeGreaterThan(0)
  })

  it('an existing loan accrues interest from month 0, about a year of the loan rate in year 0', () => {
    const r = run({ existingLoan: 500_000, otherIncome: 200_000, incomeStartAge: 55 })
    // Income covers spending: the loan only grows by interest (less any surplus paid down), so the
    // year-0 interest is at most ~6% of $500K and well above zero.
    expect(r.yearly.interest[0]).toBeGreaterThan(20_000)
    expect(r.yearly.interest[0]).toBeLessThan(0.06 * 500_000 * 1.01)
    expect(r.yearly.borrowed[0]).toBe(0)
  })

  it('a stressed plan has forced sales; a calm one has none', () => {
    // A loan just under the 60% limit and triple the spending: most paths cross it in year 0.
    const budget = Object.fromEntries(Object.entries(DEFAULT_INPUTS.budget).map(([k, v]) => [k, v * 3])) as unknown as PlanInputs['budget']
    const stressed = run({ existingLoan: 1_770_000, budget })
    expect(stressed.yearly.forcedSaleSold[0]).toBeGreaterThan(0)
    const calm = run({ portfolio: 20_000_000 })
    expect(calm.yearly.forcedSaleSold.every((x) => x === 0)).toBe(true)
  })

  it('a path broken today tallies nothing', () => {
    // A loan above the portfolio: liquidated before month 0 on every path.
    const r = run({ portfolio: 1_000_000, existingLoan: 1_500_000 })
    expect(r.brokenRate).toBe(1)
    for (const f of FIELDS) expect(r.yearly[f].every((x) => x === 0)).toBe(true)
  })
})
