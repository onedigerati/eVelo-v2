import { describe, expect, it } from 'vitest'
import type { IncomeResult, IncomeYearRow } from '../../../engine/incomeTypes'
import { firstSaleYear, friendlyFraction, summaryParts, summarySentence } from '../incomeSummary'
import fixture from './fixtures/incomeResult.json'

const row = (year: number, o: Partial<IncomeYearRow> = {}): IncomeYearRow => ({
  year,
  age: 59 + year,
  dividends: 0,
  muniInterest: 0,
  taxableInterest: 0,
  treasuryInterest: 0,
  otherIncome: 0,
  tax: 0,
  spending: 100_000,
  gapSold: 0,
  reinvested: 0,
  value: 1e6,
  ...o,
})
/** A result whose year-one median after-tax income is `income`; `sales` are per-year gap sales. */
function result(income: number, sales: number[] = [], rows: Partial<IncomeYearRow>[] = []): IncomeResult {
  const years = Math.max(3, sales.length)
  const band = Array.from({ length: years }, () => income)
  return {
    paths: 100,
    years,
    lastsRate: 0.9,
    principalKeptRate: 0.1,
    keepsPaceRate: 0.5,
    value: { p5: [], p25: [], p50: [], p75: [], p95: [] },
    afterTaxIncome: { p5: band, p25: band, p50: band, p75: band, p95: band },
    totalTaxMedian: 0,
    totalSoldMedian: 0,
    median: Array.from({ length: years }, (_, i) => row(i + 1, { gapSold: sales[i] ?? 0, ...rows[i] })),
    startYield: { stocks: 0.012, munis: 0.031, taxable: 0.04 },
  }
}
const inputs = { spending: 100_000, otherIncome: 0, age: 60, incomeStartAge: 67 }

describe('friendlyFraction', () => {
  it.each([
    [0, 'none'],
    [-0.2, 'none'],
    [NaN, 'none'],
    [0.01, 'almost none'],
    [0.049, 'almost none'],
    [0.05, 'about a tenth'],
    [0.1, 'about a tenth'],
    [0.2, 'about a fifth'],
    [0.24, 'about a quarter'],
    [0.26, 'about a quarter'],
    [0.31, 'about a third'],
    [0.4, 'about two-fifths'],
    [0.47, 'about half'],
    [0.53, 'about half'],
    [0.58, 'about three-fifths'],
    [0.6, 'about three-fifths'],
    [0.65, 'about two-thirds'],
    [0.74, 'about three-quarters'],
    [0.8, 'about four-fifths'],
    [0.87, 'about nine-tenths'],
    [0.9, 'nearly all'],
    [0.994, 'nearly all'],
    [0.995, 'all'],
    [1.004, 'all'],
  ])('%s → %s', (r, words) => expect(friendlyFraction(r)).toBe(words))
})

describe('summarySentence', () => {
  it('names the fraction and says selling covers the rest', () => {
    expect(summarySentence(result(60_000, [40_000]), inputs)).toBe('Your income after tax pays about three-fifths of the bills. Selling covers the rest.')
    expect(summarySentence(result(25_000, [75_000]), inputs)).toBe('Your income after tax pays about a quarter of the bills. Selling covers the rest.')
    expect(summarySentence(result(93_000, [7_000]), inputs)).toBe('Your income after tax pays nearly all of the bills. Selling covers the rest.')
  })

  it('splits off the fraction for the view to set in brass', () => {
    expect(summaryParts(result(60_000), inputs)).toEqual({
      before: 'Your income after tax pays ',
      emphasis: 'about three-fifths',
      after: ' of the bills. Selling covers the rest.',
    })
  })

  it('with no income, selling covers all of it', () => {
    expect(summarySentence(result(0, [100_000]), inputs)).toBe('Your income after tax pays none of the bills. Selling covers all of it.')
    expect(summarySentence(result(-500), inputs)).toBe('Your income after tax pays none of the bills. Selling covers all of it.')
  })

  it('with income above spending, names the surplus to the nearest $100', () => {
    expect(summarySentence(result(112_340), inputs)).toBe(
      'Your income after tax pays more than all of the bills, with $12,300 a year to reinvest. Nothing is sold in the typical future.',
    )
    expect(summaryParts(result(112_340), inputs).emphasis).toBe('more than all')
  })

  it('says when selling starts if a covered first year gives way later', () => {
    expect(summarySentence(result(120_000, [0, 0, 5_000]), inputs)).toBe(
      'Your income after tax pays more than all of the bills, with $20,000 a year to reinvest. Selling starts in year 3 of the typical future.',
    )
    expect(summarySentence(result(100_200), inputs)).toBe('Your income after tax pays all of the bills. Nothing is sold in the typical future.')
  })

  it('Social Security alone covering the bills and its tax', () => {
    const ss = { ...inputs, otherIncome: 110_000, age: 70 }
    expect(summarySentence(result(125_000, [], [{ tax: 5_000 }]), ss)).toBe(
      'Social Security alone covers the bills, with $25,000 a year to reinvest. Nothing is sold in the typical future.',
    )
    expect(summaryParts(result(125_000, [], [{ tax: 5_000 }]), ss).emphasis).toBe('$25,000 a year')
    // Its tax would eat into the bills: the portfolio is part of the story.
    expect(summarySentence(result(125_000, [], [{ tax: 15_000 }]), ss)).toMatch(/^Your income after tax pays more than all/)
    // Not started yet in year one.
    expect(summarySentence(result(125_000), { ...ss, age: 60, incomeStartAge: 67 })).toMatch(/^Your income after tax pays more than all/)
  })

  it('handles zero spending and missing numbers', () => {
    expect(summarySentence(result(10_000), { ...inputs, spending: 0 })).toBe('There is no spending to cover.')
    expect(summarySentence(result(NaN), inputs)).toBe('Your income after tax pays none of the bills. Selling covers all of it.')
  })

  it('reads the engine fixture', () => {
    const r = fixture as IncomeResult
    expect(firstSaleYear(r)).toBe(r.median.find((x) => x.gapSold > 0)?.year ?? null)
    expect(summarySentence(r, { spending: r.median[0].spending, otherIncome: 0, age: r.median[0].age, incomeStartAge: 67 })).toMatch(
      /^Your income after tax pays (about|nearly|all|more|none|almost)/,
    )
  })
})
