// The one-line summary above the mode's results: how much of the spending the typical future's
// after-tax income pays in year one, in a friendly fraction, then whether selling covers the rest.
// Pure, so it's tested on its own (__tests__/incomeSummary.test.ts).
//
// Year one, medians: income = the median of real after-tax income (portfolio income + Social
// Security − tax), afterTaxIncome.p50[0]; spending = inputs.spending (today's dollars, constant).

import type { IncomeInputs, IncomeResult } from '../../engine/incomeTypes'
import { currency } from '../format'

/** The sentence in three parts, so the view can set the fraction in brass. */
export interface SummaryParts {
  before: string
  emphasis: string
  after: string
}

/** Fractions a reader takes in at a glance, nearest wins. Below 5% reads "almost none", from 90%
 *  "nearly all", within half a percent of 100% "all" (so a rounding hair is never "more than"). */
const FRACTIONS: readonly [number, string][] = [
  [1 / 10, 'about a tenth'],
  [1 / 5, 'about a fifth'],
  [1 / 4, 'about a quarter'],
  [1 / 3, 'about a third'],
  [2 / 5, 'about two-fifths'],
  [1 / 2, 'about half'],
  [3 / 5, 'about three-fifths'],
  [2 / 3, 'about two-thirds'],
  [3 / 4, 'about three-quarters'],
  [4 / 5, 'about four-fifths'],
  [9 / 10, 'about nine-tenths'],
]
const NEARLY_ALL = 0.9
const ALL_BAND = 0.005
const ALMOST_NONE = 0.05

/** The friendly fraction for a covered share `r` (income ÷ spending) below "all". */
export function friendlyFraction(r: number): string {
  if (!(r > 0)) return 'none'
  if (r < ALMOST_NONE) return 'almost none'
  if (r >= 1 - ALL_BAND) return 'all'
  if (r >= NEARLY_ALL) return 'nearly all'
  let best = FRACTIONS[0]
  for (const f of FRACTIONS) if (Math.abs(f[0] - r) < Math.abs(best[0] - r)) best = f
  return best[1]
}

/** A yearly amount to the nearest $100, as eVelo writes money: "$4,300". */
const roundMoney = (v: number) => currency(Math.round(v / 100) * 100)

/** The first year (1-based) the typical future sells to cover a gap, or null if it never does. */
export function firstSaleYear(result: IncomeResult): number | null {
  const row = result.median.find((r) => r.gapSold > 0)
  return row ? row.year : null
}

export function summaryParts(result: IncomeResult, inputs: Pick<IncomeInputs, 'spending' | 'otherIncome' | 'age' | 'incomeStartAge'>): SummaryParts {
  const income = Math.max(0, finite(result.afterTaxIncome.p50[0]))
  const spending = Math.max(0, finite(inputs.spending))
  const sale = firstSaleYear(result)
  const tail = (covered: boolean) =>
    !covered ? ' Selling covers the rest.' : sale === null ? ' Nothing is sold in the typical future.' : ` Selling starts in year ${sale} of the typical future.`

  if (spending === 0) return { before: 'There is no spending to cover', emphasis: '', after: '.' }

  const r = income / spending
  if (r >= 1 + ALL_BAND) {
    const surplus = roundMoney(income - spending)
    const ssYearOne = inputs.age >= inputs.incomeStartAge ? finite(inputs.otherIncome) : 0
    // Only when Social Security pays the bills and the whole year's tax by itself.
    if (ssYearOne >= spending + Math.max(0, finite(result.median[0]?.tax)))
      return { before: 'Social Security alone covers the bills, with ', emphasis: `${surplus} a year`, after: ` to reinvest.${tail(true)}` }
    return { before: 'Your income after tax pays ', emphasis: 'more than all', after: ` of the bills, with ${surplus} a year to reinvest.${tail(true)}` }
  }
  const f = friendlyFraction(r)
  if (f === 'none') return { before: 'Your income after tax pays ', emphasis: 'none', after: ' of the bills. Selling covers all of it.' }
  return { before: 'Your income after tax pays ', emphasis: f, after: ` of the bills.${tail(f === 'all')}` }
}

/** The summary as one plain sentence (or two). */
export function summarySentence(result: IncomeResult, inputs: Pick<IncomeInputs, 'spending' | 'otherIncome' | 'age' | 'incomeStartAge'>): string {
  const p = summaryParts(result, inputs)
  return p.before + p.emphasis + p.after
}

function finite(v: number | undefined): number {
  return typeof v === 'number' && Number.isFinite(v) ? v : 0
}
