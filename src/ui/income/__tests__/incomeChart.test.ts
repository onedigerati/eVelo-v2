import { describe, expect, it } from 'vitest'
import type { IncomeResult, IncomeYearRow } from '../../../engine/incomeTypes'
import { ageTicks, bandX, chartSummary, gapFor, justAddedLine, stackRow, stackRows, yMaxFor, type IncomeLayers } from '../incomeChart'
import fixture from './fixtures/incomeResult.json'

const rows = (fixture as IncomeResult).median
const row = (o: Partial<IncomeYearRow> = {}): IncomeYearRow => ({
  year: 1,
  age: 58,
  dividends: 22_400,
  muniInterest: 24_200,
  taxableInterest: 4_300,
  treasuryInterest: 4_300,
  otherIncome: 0,
  tax: 3_000,
  spending: 96_000,
  gapSold: 0,
  reinvested: 0,
  value: 2_400_000,
  ...o,
})
const LAYERS: IncomeLayers[] = [0, 1, 2, 3, 4, 5]
const h = (s: [number, number]) => s[1] - s[0]

describe('stackRow', () => {
  it('stacks contiguously from zero, and the drawn parts sum to the top', () => {
    for (const r of [...rows, row(), row({ otherIncome: 30_000, tax: 6_000 })])
      for (const l of LAYERS) {
        const s = stackRow(r, l, 96_000)
        const order = [s.dividends, s.muni, s.taxable, s.social, s.gap, s.tax]
        expect(order[0][0]).toBe(0)
        for (let i = 1; i < order.length; i++) expect(order[i][0]).toBeCloseTo(order[i - 1][1], 6)
        expect(order.reduce((a, sp) => a + h(sp), 0)).toBeCloseTo(s.top, 6)
        expect(h(s.dividends) + h(s.muni) + h(s.taxable) + h(s.social)).toBeCloseTo(s.afterTax, 6)
        expect(s.afterTax + h(s.tax)).toBeCloseTo(s.gross, 6)
      }
  })

  it('draws only the layers asked for', () => {
    const r = row({ otherIncome: 30_000 })
    const at = (l: IncomeLayers) => stackRow(r, l, 96_000)
    expect(at(0).top).toBe(0)
    expect(h(at(1).dividends)).toBe(22_400)
    expect(h(at(1).muni) + h(at(1).taxable) + h(at(1).social) + h(at(1).tax) + h(at(1).gap)).toBe(0)
    // Layer 2: muni coupons, and taxable interest = taxable funds + Treasuries.
    expect(h(at(2).muni)).toBe(24_200)
    expect(h(at(2).taxable)).toBe(8_600)
    expect(h(at(2).tax) + h(at(2).social) + h(at(2).gap)).toBe(0)
    // Layer 3: tax carved off the top — same bar height, after-tax income below the hatch.
    expect(at(3).top).toBe(at(2).top)
    expect(h(at(3).tax)).toBe(3_000)
    expect(at(3).afterTax).toBe(55_200 - 3_000)
    expect(h(at(3).taxable)).toBe(8_600 - 3_000)
    expect(h(at(3).social) + h(at(3).gap)).toBe(0)
    // Layer 4: Social Security, and the gap fills after-tax income up to spending; tax sits above it.
    // The tax now comes off the top segment, Social Security; taxable interest is whole again.
    expect(h(at(4).social)).toBe(30_000 - 3_000)
    expect(h(at(4).taxable)).toBe(8_600)
    expect(at(4).gap[1]).toBe(96_000)
    expect(at(4).tax).toEqual([96_000, 99_000])
    expect(at(5)).toEqual(at(4))
  })

  it('a year whose income covers spending sells nothing', () => {
    const s = stackRow(row({ dividends: 120_000 }), 5, 96_000)
    expect(h(s.gap)).toBe(0)
    expect(s.top).toBe(s.gross)
  })

  it('tax never exceeds the income drawn', () => {
    const s = stackRow(row({ tax: 50_000 }), 3, 96_000)
    expect(h(s.tax)).toBe(s.gross - s.afterTax)
    expect(s.afterTax).toBe(5_200)
    expect(stackRow(row({ tax: 999_999 }), 1, 0).afterTax).toBe(22_400)
  })
})

describe('gapFor', () => {
  it('is spending less after-tax income, floored at zero', () => {
    expect(gapFor(row(), 96_000)).toBe(96_000 - (55_200 - 3_000))
    expect(gapFor(row({ otherIncome: 30_000 }), 96_000)).toBe(96_000 - (85_200 - 3_000))
    expect(gapFor(row(), 10_000)).toBe(0)
  })
  it('matches the drawn gap at layer 4', () => {
    for (const r of rows) {
      const s = stackRow(r, 4, r.spending)
      expect(h(s.gap)).toBeCloseTo(gapFor(r, r.spending), 6)
    }
  })
})

describe('yMaxFor', () => {
  it('is a nice number covering every layer and the spending line', () => {
    const m = yMaxFor(rows, 96_000)
    expect(m).toBeGreaterThanOrEqual(96_000)
    expect(m % 10_000).toBe(0)
    for (const l of LAYERS) for (const s of stackRows(rows, l, 96_000)) expect(s.top).toBeLessThanOrEqual(m)
  })
  it('does not depend on the layers drawn, so it holds still when spending appears', () => {
    // The only input is the series and spending: the same max serves layer 0 through 5.
    const m = yMaxFor(rows, 96_000)
    const tallest = (l: IncomeLayers) => Math.max(...stackRows(rows, l, 96_000).map((s) => s.top))
    expect(tallest(3)).toBeLessThan(96_000)
    expect(tallest(4)).toBeGreaterThan(96_000)
    expect(tallest(4)).toBeLessThanOrEqual(m)
    expect(yMaxFor(rows, 96_000)).toBe(m)
  })
  it('is positive and finite for an empty or all-zero series', () => {
    expect(yMaxFor([], 0)).toBeGreaterThan(0)
    const zero = row({ dividends: 0, muniInterest: 0, taxableInterest: 0, treasuryInterest: 0, tax: 0, spending: 0 })
    expect(yMaxFor([zero, zero], 0)).toBeGreaterThan(0)
    expect(Number.isFinite(yMaxFor([zero], 0))).toBe(true)
    expect(stackRow(zero, 5, 0).top).toBe(0)
    expect(yMaxFor([], 50_000)).toBe(50_000)
  })
  it('ignores non-finite or negative fields', () => {
    const s = stackRow(row({ dividends: NaN, muniInterest: -5 }), 5, 96_000)
    expect(h(s.dividends)).toBe(0)
    expect(h(s.muni)).toBe(0)
    expect(Number.isFinite(s.top)).toBe(true)
  })
})

describe('justAddedLine', () => {
  const r = row({ dividends: 22_449, muniInterest: 24_151, taxableInterest: 4_320, treasuryInterest: 4_300, tax: 3_049 })
  it('names each layer in year one dollars, rounded to $100', () => {
    expect(justAddedLine([r], 1)).toBe('Just added: dividends, $22,400 a year')
    expect(justAddedLine([r], 2)).toBe('Just added: muni coupons, $24,200 a year, tax-free · taxable interest, $8,600')
    expect(justAddedLine([r], 3)).toBe('Just added: tax, $3,000 a year')
    expect(justAddedLine([r], 4)).toBe('Just added: spending, $96,000 a year · sold to cover, $43,800')
  })
  it('gives Social Security from the age it starts', () => {
    const later = { ...r, year: 10, age: 67, otherIncome: 30_040 }
    expect(justAddedLine([r, later], 4)).toBe('Just added: spending, $96,000 a year · sold to cover, $43,800 · Social Security, $30,000 from age 67')
    expect(justAddedLine([{ ...r, otherIncome: 30_000 }], 4)).toBe('Just added: spending, $96,000 a year · sold to cover, $13,800 · Social Security, $30,000')
  })
  it('is empty for no layer, the results state or no rows', () => {
    expect(justAddedLine([r], 0)).toBe('')
    expect(justAddedLine([r], 5)).toBe('')
    expect(justAddedLine([], 2)).toBe('')
  })
  it('reads the fixture', () => {
    expect(justAddedLine(rows, 2)).toMatch(/^Just added: muni coupons, \$[\d,]+00 a year, tax-free · taxable interest, \$[\d,]+00$/)
  })
})

describe('ageTicks and chartSummary', () => {
  it('ticks the first age and every step after', () => {
    expect(ageTicks(rows, 10)).toEqual([58, 68, 78])
    expect(ageTicks([], 10)).toEqual([])
  })
  it('summarises year one and the final year for the layers drawn', () => {
    const s = chartSummary(rows, 5, 96_000)
    expect(s).toMatch(/age 58 to 87/)
    expect(s).toMatch(/Year 1, age 58: dividends \$[\d,]+, muni coupons/)
    expect(s).toMatch(/Final year, age 87: .*Social Security \$30,000/)
    expect(chartSummary(rows, 1, 96_000)).not.toMatch(/muni|spending/)
    expect(chartSummary(rows, 0, 96_000)).toMatch(/Nothing answered yet/)
    expect(chartSummary([], 0, 0)).toMatch(/no years/)
  })
})

describe('bandX', () => {
  it('spans the width, first bar at the left edge and last flush right', () => {
    const x = bandX(rows, 10, 600, 0.2)
    expect(x(rows[0].age)).toBe(10)
    expect(x(rows[rows.length - 1].age)! + x.bandwidth()).toBeCloseTo(610, 6)
    expect(x(999)).toBeUndefined()
    expect(bandX([], 0, 100, 0.2).bandwidth()).toBe(100)
    expect(bandX(rows.slice(0, 1), 0, 100, 0.2).bandwidth()).toBe(100)
  })
})
