// The walkthrough's chapter paragraphs (docs/PLAN.md stage 2): figures come from the rows, words
// follow the numbers.
import { describe, expect, it } from 'vitest'
import { currencyCompact as k, percent as pct } from '../../format'
import { CHAPTER_NAMES, type Chapter, type ChapterKey, type EveloYear, type IncomeYear, type WalkInputs, type WalkYear } from '../walkthrough'
import { chapterStory } from '../walkthroughStory'

const inputs = { income: {}, evelo: { maxLtv: 0.6 } } as unknown as WalkInputs
const ch = (key: ChapterKey, from: number, to: number, badYear?: number): Chapter => ({
  key,
  name: CHAPTER_NAMES[key],
  from,
  to,
  ...(badYear != null ? { badYear } : {}),
})

const inc = (o: Partial<IncomeYear> = {}): IncomeYear => ({
  netWorthStart: 1_000_000,
  netWorth: 1_000_000,
  dividendsInterest: 30_000,
  socialSecurity: 0,
  sold: 50_000,
  tax: 5_000,
  reinvested: 0,
  spending: 80_000,
  portfolioStart: 1_000_000,
  portfolio: 1_000_000,
  ...o,
})
const ev = (o: Partial<EveloYear> = {}): EveloYear => ({
  netWorthStart: 1_000_000,
  netWorth: 1_000_000,
  socialSecurity: 0,
  borrowed: 80_000,
  interest: 4_000,
  repaid: 0,
  forcedSaleSold: 0,
  wealthTax: 0,
  loan: 200_000,
  portfolioStart: 1_200_000,
  portfolio: 1_200_000,
  ltv: 0.15,
  ...o,
})
const row = (index: number, income: IncomeYear | null, evelo: EveloYear | null): WalkYear => ({ index, age: 60 + index, income, evelo })

describe('chapterStory', () => {
  it('before: totals sold and borrowed, first-year cover, loan at the end', () => {
    const y = [
      row(0, inc({ sold: 50_000, dividendsInterest: 32_000 }), ev({ borrowed: 80_000, loan: 80_000 })),
      row(1, inc({ sold: 52_000 }), ev({ borrowed: 82_000, loan: 165_000 })),
    ]
    const s = chapterStory(ch('before', 0, 1), y, inputs)
    expect(s.income.title).toBe('Sells to fill the gap')
    expect(s.income.figure).toBe(`${k(102_000)} sold over 2 years`)
    expect(s.income.text).toContain(`about ${pct(0.4)} of spending`)
    expect(s.evelo.figure).toBe(`${k(162_000)} borrowed`)
    expect(s.evelo.text).toContain('Nothing is sold.')
    expect(s.evelo.text).toContain(`reaches ${k(165_000)} by 62`)
  })

  it('arrives: selling and borrowing slow against the year before; interest share', () => {
    const y = [
      row(0, inc({ sold: 50_000 }), ev({ borrowed: 80_000 })),
      row(1, inc({ sold: 12_000, socialSecurity: 30_000 }), ev({ borrowed: 50_000, interest: 10_000, socialSecurity: 30_000 })),
    ]
    const s = chapterStory(ch('arrives', 1, 1), y, inputs)
    expect(s.income.title).toBe('Selling slows')
    expect(s.income.figure).toBe(`${k(12_000)} sold this year`)
    expect(s.income.text).toContain(`from ${k(50_000)} the year before`)
    expect(s.evelo.title).toBe('Borrowing slows')
    expect(s.evelo.figure).toBe(`${k(50_000)} borrowed this year`)
    expect(s.evelo.text).toContain(`Interest is ${pct(10_000 / 60_000)}`)
  })

  it('bad, no call: income sells into the fall; eVelo peak loan-to-value under the line', () => {
    const y = [
      row(0, inc({ sold: 40_000, portfolioStart: 1_000_000, portfolio: 800_000 }), ev({ ltv: 0.25 })),
      row(1, inc({ sold: 45_000, portfolioStart: 800_000, portfolio: 750_000 }), ev({ ltv: 0.31 })),
    ]
    const s = chapterStory(ch('bad', 0, 1), y, inputs)
    expect(s.income.title).toBe('Sells into the drop')
    expect(s.income.figure).toBe(`${k(85_000)} sold in the drop`)
    expect(s.income.text).toContain(`falls ${pct(0.25)}`)
    expect(s.evelo.title).toBe('A scare, not a call')
    expect(s.evelo.figure).toBe(`Loan-to-value peaks at ${pct(0.31)}`)
    expect(s.evelo.text).toContain(`well under the ${pct(0.6)} margin-call line`)
  })

  it('bad, with a forced sale: says margin call and the shares sold', () => {
    const y = [row(0, inc(), ev({ ltv: 0.58, forcedSaleSold: 120_000 }))]
    const s = chapterStory(ch('bad', 0, 0), y, inputs)
    expect(s.evelo.title).toBe('A margin call')
    expect(s.evelo.figure).toBe(`${k(120_000)} of shares sold`)
    expect(s.evelo.text).toContain(pct(0.58))
    expect(s.evelo.text).not.toContain('Nothing is sold')
  })

  it('early: portfolio start to end, surplus reinvested, eVelo ahead and widening', () => {
    const y = [
      row(0, inc({ portfolioStart: 1_000_000, sold: 10_000, netWorthStart: 1_000_000, netWorth: 1_050_000 }), ev({ netWorthStart: 1_100_000, netWorth: 1_200_000 })),
      row(1, inc({ portfolio: 1_100_000, sold: 0, reinvested: 7_000, netWorth: 1_100_000 }), ev({ netWorth: 1_400_000, loan: 300_000 })),
    ]
    const s = chapterStory(ch('early', 0, 1), y, inputs)
    expect(s.income.figure).toBe(`${k(1_000_000)} → ${k(1_100_000)}`)
    expect(s.income.title).toBe('Top-ups and a surplus')
    expect(s.income.text).toContain(`about ${k(7_000)} goes back in`)
    expect(s.evelo.title).toBe('The gap widens')
    expect(s.evelo.figure).toBe(`${k(300_000)} ahead by 62`)
    expect(s.evelo.text).toContain(`the loan at ${k(300_000)}`)
  })

  it('middle: eVelo behind reads behind, not ahead', () => {
    const y = [
      row(0, inc({ netWorthStart: 1_000_000, netWorth: 1_000_000 }), ev({ netWorthStart: 1_000_000, netWorth: 900_000 })),
      row(1, inc({ netWorth: 1_100_000 }), ev({ netWorth: 850_000 })),
    ]
    const s = chapterStory(ch('middle', 0, 1), y, inputs)
    expect(s.evelo.title).toBe('Falls behind')
    expect(s.evelo.figure).toBe(`${k(250_000)} behind by 62`)
    expect(s.evelo.figure).not.toContain('ahead')
  })

  it('estate: heirs get each net worth; lifetime tax, sales and interest say "about"', () => {
    const y = [
      row(0, inc({ tax: 4_000, sold: 30_000 }), ev({ interest: 5_000 })),
      row(1, inc({ tax: 6_000, sold: 20_000, netWorth: 1_500_000 }), ev({ interest: 7_000, netWorth: 2_100_000, loan: 600_000 })),
    ]
    const s = chapterStory(ch('estate', 1, 1), y, inputs)
    expect(s.income.title).toBe('What heirs get')
    expect(s.income.figure).toBe(`${k(1_500_000)} at 62`)
    expect(s.income.text).toContain(`about ${k(10_000)} in tax`)
    expect(s.income.text).toContain(`about ${k(50_000)} of shares`)
    expect(s.evelo.figure).toBe(`${k(2_100_000)} at 62, after the loan`)
    expect(s.evelo.text).toContain(`repays the ${k(600_000)} loan`)
    expect(s.evelo.text).toContain(`about ${k(12_000)}`)
  })

  it('a plan with no years in the chapter says so', () => {
    const y = [row(0, inc(), null), row(1, inc(), null)]
    const s = chapterStory(ch('middle', 0, 1), y, inputs)
    expect(s.evelo.title).toBe('Not in these years')
    expect(s.evelo.text).toContain('ages 60–61')
    expect(s.income.figure).toContain('→')
  })

  it('zero sales: no "sold $0" anywhere', () => {
    const y = [
      row(0, inc({ sold: 0, dividendsInterest: 90_000, spending: 80_000 }), ev()),
      row(1, inc({ sold: 0, socialSecurity: 30_000 }), ev({ borrowed: 0, socialSecurity: 30_000 })),
    ]
    const before = chapterStory(ch('before', 0, 0), y, inputs)
    expect(before.income.title).toBe('Income covers it')
    expect(before.income.figure).toBe(`${k(90_000)} of dividends and interest`)
    const arr = chapterStory(ch('arrives', 1, 1), y, inputs)
    expect(arr.income.figure).toBe('Nothing sold this year')
    expect(arr.evelo.figure).toBe('Nothing borrowed this year')
    const est = chapterStory(ch('estate', 0, 1), [row(0, inc({ sold: 0, tax: 0 }), ev())], inputs)
    expect(est.income.text).toContain('sold no shares')
    for (const p of [before.income, arr.income, est.income]) expect(`${p.figure} ${p.text}`).not.toContain('$0')
  })

  it('a kept bad year adds one clause per plan with that year\'s fall', () => {
    const y = [
      row(0, inc(), ev()),
      row(1, inc({ portfolioStart: 1_000_000, portfolio: 820_000 }), ev({ portfolioStart: 1_200_000, portfolio: 960_000, ltv: 0.27 })),
    ]
    const s = chapterStory(ch('before', 0, 1, 1), y, inputs)
    expect(s.income.text).toContain(`In the drop at 61 the portfolio falls ${pct(0.18)}.`)
    expect(s.evelo.text).toContain(`falls ${pct(0.2)}, taking loan-to-value to ${pct(0.27)}`)
    const plain = chapterStory(ch('before', 0, 1), y, inputs)
    expect(plain.income.text).not.toContain('drop')
  })
})
