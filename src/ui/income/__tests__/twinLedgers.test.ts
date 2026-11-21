import { describe, expect, it } from 'vitest'
import { eveloBar, eveloEvent, eveloFunded, incomeBar, incomeEvent, portfolioFall } from '../twinLedgers'
import type { EveloYear, IncomeYear } from '../walkthrough'

const inc = (o: Partial<IncomeYear> = {}): IncomeYear => ({
  netWorthStart: 2e6,
  netWorth: 2.05e6,
  dividendsInterest: 52_000,
  socialSecurity: 0,
  sold: 0,
  tax: 4_000,
  reinvested: 0,
  spending: 85_000,
  portfolioStart: 2e6,
  portfolio: 2.05e6,
  ...o,
})

const ev = (o: Partial<EveloYear> = {}): EveloYear => ({
  netWorthStart: 2e6,
  netWorth: 2e6,
  socialSecurity: 0,
  borrowed: 85_000,
  interest: 2_000,
  repaid: 0,
  forcedSaleSold: 0,
  wealthTax: 0,
  loan: 170_000,
  portfolioStart: 2.1e6,
  portfolio: 2.2e6,
  ltv: 0.08,
  ...o,
})

const sum = (xs: { share: number }[]) => xs.reduce((s, p) => s + p.share, 0)

describe('incomeBar', () => {
  it('caps dividends and interest at spending and normalises the shares', () => {
    const p = incomeBar(inc({ dividendsInterest: 60_000, socialSecurity: 30_000, sold: 10_000 }))
    expect(p.map((x) => x.key)).toEqual(['income', 'ss', 'sold'])
    expect(sum(p)).toBeCloseTo(1)
    expect(incomeBar(inc({ dividendsInterest: 120_000 }))[0].value).toBe(85_000)
  })
  it('drops empty parts', () => {
    expect(incomeBar(inc({ sold: 33_000 })).map((x) => x.key)).toEqual(['income', 'sold'])
  })
  it('is empty with zero spending and no Social Security or sales', () => {
    expect(incomeBar(inc({ spending: 0 }))).toEqual([])
  })
})

describe('eveloBar', () => {
  it('splits Social Security and borrowing', () => {
    const p = eveloBar(ev({ socialSecurity: 30_000, borrowed: 55_000 }))
    expect(p.map((x) => x.key)).toEqual(['ss', 'borrowed'])
    expect(p[0].share).toBeCloseTo(30 / 85)
    expect(eveloFunded(ev({ socialSecurity: 30_000, borrowed: 55_000 }))).toBe(85_000)
  })
  it('is empty when nothing is funded', () => {
    expect(eveloBar(ev({ borrowed: 0 }))).toEqual([])
  })
})

describe('portfolioFall', () => {
  it('is the fraction lost, never negative, 0 without a start', () => {
    expect(portfolioFall(100, 80)).toBeCloseTo(0.2)
    expect(portfolioFall(100, 120)).toBe(0)
    expect(portfolioFall(0, 50)).toBe(0)
  })
})

describe('incomeEvent', () => {
  it('quiet years', () => {
    expect(incomeEvent(inc())).toBe('A quiet year: income covers it.')
    expect(incomeEvent(inc({ sold: 30_000 }))).toBe('A quiet year: income plus a top-up sale.')
  })
  it('surplus goes back in', () => {
    expect(incomeEvent(inc({ reinvested: 12_000 }))).toBe('Income beats spending; $12K goes back in.')
  })
  it('a falling portfolio, and selling into it', () => {
    expect(incomeEvent(inc({ portfolio: 1.6e6, sold: 30_000 }))).toBe('The portfolio falls 20% this year. Sells $30K into the drop.')
    expect(incomeEvent(inc({ portfolio: 1.95e6 }))).toBe('A quiet year: income covers it.')
  })
  it('Social Security starts against the previous year', () => {
    expect(incomeEvent(inc({ socialSecurity: 30_000 }), inc())).toBe('Social Security starts.')
    expect(incomeEvent(inc({ socialSecurity: 30_000 }), inc({ socialSecurity: 30_000 }))).toBe('A quiet year: income covers it.')
    expect(incomeEvent(inc({ socialSecurity: 30_000 }))).toBe('A quiet year: income covers it.')
  })
  it('zero spending', () => {
    expect(incomeEvent(inc({ spending: 0, reinvested: 48_000 }))).toBe('Income beats spending; $48K goes back in.')
  })
})

describe('eveloEvent', () => {
  it('quiet year', () => {
    expect(eveloEvent(ev())).toBe('A quiet year: the loan grows, nothing is sold.')
  })
  it('forced sale wins over the loan-to-value line', () => {
    expect(eveloEvent(ev({ forcedSaleSold: 250_000, portfolio: 1.5e6 }))).toBe('Forced sale: $250K of shares sold.')
  })
  it('loan-to-value jumps when the portfolio falls', () => {
    expect(eveloEvent(ev({ portfolio: 1.68e6, ltv: 0.12 }))).toBe('The portfolio falls 20%; loan-to-value jumps to 12%.')
  })
  it('Social Security starts', () => {
    expect(eveloEvent(ev({ socialSecurity: 30_000 }), ev())).toBe('Social Security starts.')
  })
  it('income above spending repays the loan', () => {
    expect(eveloEvent(ev({ borrowed: 0, repaid: 5_000, socialSecurity: 90_000 }))).toBe('Income above spending repays $5.0K of the loan.')
  })
})
