import { describe, expect, it } from 'vitest'
import type { IncomeResult, IncomeYearRow } from '../../../engine/incomeTypes'
import { currency } from '../../format'
import { ageTicks, bandIndexAt, bandX, chartSummary, justAddedLine, MEDIAN_NOTE, readoutRows, stackRow, stackRows, yMaxFor, type IncomeLayers } from '../incomeChart'
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
    for (const r of [...rows, row(), row({ otherIncome: 30_000, tax: 6_000, gapSold: 12_000 })])
      for (const l of LAYERS) {
        const s = stackRow(r, l)
        const order = [s.dividends, s.muni, s.taxable, s.social, s.gap, s.tax]
        expect(order[0][0]).toBe(0)
        for (let i = 1; i < order.length; i++) expect(order[i][0]).toBeCloseTo(order[i - 1][1], 6)
        expect(order.reduce((a, sp) => a + h(sp), 0)).toBeCloseTo(s.top, 6)
        expect(h(s.dividends) + h(s.muni) + h(s.taxable) + h(s.social)).toBeCloseTo(s.afterTax, 6)
        expect(s.afterTax + h(s.tax)).toBeCloseTo(s.gross, 6)
      }
  })

  it('draws only the layers asked for', () => {
    const r = row({ otherIncome: 30_000, gapSold: 13_800 })
    const at = (l: IncomeLayers) => stackRow(r, l)
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
    // Layer 4: Social Security, then the engine's gapSold on top of after-tax income (here it meets
    // spending exactly); tax sits above it. The tax now comes off the top segment, Social Security.
    expect(h(at(4).social)).toBe(30_000 - 3_000)
    expect(h(at(4).taxable)).toBe(8_600)
    expect(at(4).gap).toEqual([82_200, 96_000])
    expect(at(4).tax).toEqual([96_000, 99_000])
    expect(at(5)).toEqual(at(4))
  })

  it('a year that sells nothing draws no gap', () => {
    const s = stackRow(row({ dividends: 120_000 }), 5)
    expect(h(s.gap)).toBe(0)
    expect(s.top).toBe(s.gross)
  })

  it('tax never exceeds the income drawn', () => {
    const s = stackRow(row({ tax: 50_000 }), 3)
    expect(h(s.tax)).toBe(s.gross - s.afterTax)
    expect(s.afterTax).toBe(5_200)
    expect(stackRow(row({ tax: 999_999 }), 1).afterTax).toBe(22_400)
  })
})

describe('the gap sold to cover', () => {
  it("equals the row's gapSold for every row — the number the ledger and the summary use", () => {
    expect(rows.some((r) => r.gapSold > 0)).toBe(true)
    for (const r of rows)
      for (const l of [4, 5] as IncomeLayers[]) {
        const s = stackRow(r, l)
        expect(h(s.gap)).toBeCloseTo(r.gapSold, 6)
        expect(s.gap[0]).toBe(s.afterTax)
      }
  })
  it('is not drawn before layer 4, and is never worked out from spending', () => {
    const r = row({ gapSold: 40_000 })
    for (const l of [0, 1, 2, 3] as IncomeLayers[]) expect(h(stackRow(r, l).gap)).toBe(0)
    // Income short of spending but gapSold 0: nothing is drawn as sold.
    expect(h(stackRow(row(), 4).gap)).toBe(0)
  })
  it('lands near the spending line in the fixture, where the per-field medians nearly add up', () => {
    for (const r of rows)
      if (r.gapSold > 0) {
        const s = stackRow(r, 5)
        expect(Math.abs(s.afterTax + h(s.gap) - r.spending) / r.spending).toBeLessThan(0.1)
      }
  })
})

describe('yMaxFor', () => {
  it('is a nice number covering every layer and the spending line', () => {
    const m = yMaxFor(rows, 96_000)
    expect(m).toBeGreaterThanOrEqual(96_000)
    expect(m % 10_000).toBe(0)
    for (const l of LAYERS) for (const s of stackRows(rows, l)) expect(s.top).toBeLessThanOrEqual(m)
  })
  it('does not depend on the layers drawn, so it holds still when spending appears', () => {
    // The only input is the series and spending: the same max serves layer 0 through 5.
    const m = yMaxFor(rows, 96_000)
    const tallest = (l: IncomeLayers) => Math.max(...stackRows(rows, l).map((s) => s.top))
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
    expect(stackRow(zero, 5).top).toBe(0)
    expect(yMaxFor([], 50_000)).toBe(50_000)
  })
  it('ignores non-finite or negative fields', () => {
    const s = stackRow(row({ dividends: NaN, muniInterest: -5, gapSold: NaN }), 5)
    expect(h(s.dividends)).toBe(0)
    expect(h(s.muni)).toBe(0)
    expect(h(s.gap)).toBe(0)
    expect(Number.isFinite(s.top)).toBe(true)
  })
})

describe('justAddedLine', () => {
  const r = row({ dividends: 22_449, muniInterest: 24_151, taxableInterest: 4_320, treasuryInterest: 4_300, tax: 3_049, gapSold: 43_790 })
  it('names each layer in year one dollars, rounded to $100', () => {
    expect(justAddedLine([r], 1)).toBe('Just added: dividends, $22,400 a year')
    expect(justAddedLine([r], 2)).toBe('Just added: muni coupons, $24,200 a year, tax-free · taxable interest, $8,600')
    expect(justAddedLine([r], 3)).toBe('Just added: tax, $3,000 a year')
    expect(justAddedLine([r], 4)).toBe('Just added: spending, $96,000 a year · sold to cover, $43,800')
  })
  it('gives Social Security from the age it starts', () => {
    const later = { ...r, year: 10, age: 67, otherIncome: 30_040 }
    expect(justAddedLine([r, later], 4)).toBe('Just added: spending, $96,000 a year · sold to cover, $43,800 · Social Security, $30,000 from age 67')
    expect(justAddedLine([{ ...r, otherIncome: 30_000, gapSold: 13_820 }], 4)).toBe('Just added: spending, $96,000 a year · sold to cover, $13,800 · Social Security, $30,000')
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
    expect(s).toContain(`sold to cover ${currency(Math.round(rows[0].gapSold / 100) * 100)}`)
    expect(s).toContain(MEDIAN_NOTE)
    expect(chartSummary(rows, 3, 96_000)).not.toContain(MEDIAN_NOTE)
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

describe('bandIndexAt', () => {
  it('maps a plot x to the nearest bar, padding included, clamped to the ends', () => {
    const rs = [row({ age: 58 }), row({ age: 59 }), row({ age: 60 }), row({ age: 61 })]
    const x = bandX(rs, 0, 400, 0.2)
    const step = x.step()
    const bw = x.bandwidth()
    expect(step).toBeGreaterThan(bw)
    rs.forEach((r, i) => {
      const c = (x(r.age) ?? 0) + bw / 2
      expect(bandIndexAt(c, rs.length, 0, step, bw)).toBe(i)
      // anywhere up to half a step either side of the centre: the bar plus its share of the gaps
      expect(bandIndexAt(c - step * 0.49, rs.length, 0, step, bw)).toBe(i)
      expect(bandIndexAt(c + step * 0.49, rs.length, 0, step, bw)).toBe(i)
    })
    expect(bandIndexAt(-50, rs.length, 0, step, bw)).toBe(0)
    expect(bandIndexAt(1e4, rs.length, 0, step, bw)).toBe(3)
  })

  it('works with an offset, a single bar and an empty series', () => {
    const rs = [row({ age: 58 }), row({ age: 59 })]
    const x = bandX(rs, 30, 200, 0.1)
    expect(bandIndexAt((x(59) ?? 0) + 1, 2, 30, x.step(), x.bandwidth())).toBe(1)
    expect(bandIndexAt((x(58) ?? 0) + 1, 2, 30, x.step(), x.bandwidth())).toBe(0)
    const one = bandX([row()], 0, 100, 0.2)
    expect(bandIndexAt(80, 1, 0, one.step(), one.bandwidth())).toBe(0)
    expect(bandIndexAt(10, 0, 0, 0, 0)).toBe(0)
  })
})

describe('readoutRows', () => {
  const keys = (r: IncomeYearRow, l: IncomeLayers, s = false) => readoutRows(r, l, s).map((x) => x.key)

  it('shows only the lines unlocked so far', () => {
    const r = row({ otherIncome: 30_000, gapSold: 5_000, spending: 200_000 })
    expect(keys(r, 0, true)).toEqual([])
    expect(keys(r, 1, true)).toEqual(['dividends'])
    expect(keys(r, 2, true)).toEqual(['dividends', 'muni', 'taxable'])
    expect(keys(r, 3, true)).toEqual(['dividends', 'muni', 'taxable', 'tax'])
    expect(keys(r, 4, true)).toEqual(['dividends', 'muni', 'taxable', 'social', 'tax', 'spending', 'gap'])
    expect(keys(r, 5, true)).toEqual(keys(r, 4, true))
  })

  it('shows Social Security when the plan has it or the year pays it, and sold to cover only when any', () => {
    expect(keys(row(), 4, false)).not.toContain('social')
    expect(keys(row(), 4, true)).toContain('social')
    expect(keys(row({ otherIncome: 10_000 }), 4, false)).toContain('social')
    expect(keys(row({ gapSold: 0 }), 4)).not.toContain('gap')
  })

  it("uses the row's own figures, under the ledger's labels", () => {
    const r = row({ otherIncome: 30_000, gapSold: 5_000 })
    const lines = readoutRows(r, 5, true)
    const v = Object.fromEntries(lines.map((x) => [x.key, x.value]))
    expect(v.dividends).toBe(r.dividends)
    expect(v.muni).toBe(r.muniInterest)
    expect(v.taxable).toBe(r.taxableInterest + r.treasuryInterest)
    expect(v.social).toBe(r.otherIncome)
    expect(v.tax).toBe(r.tax)
    expect(v.gap).toBe(r.gapSold)
    expect(v.spending).toBe(r.spending)
    expect(lines.map((x) => x.label)).toEqual(['Dividends', 'Muni coupons', 'Taxable interest', 'Social Security', 'Tax', 'Spending', 'Sold to cover'])
  })

  it('ends with spending, then the shares sold or the surplus reinvested, never both', () => {
    expect(keys(row({ gapSold: 7_800, reinvested: 0 }), 4).slice(-2)).toEqual(['spending', 'gap'])
    expect(readoutRows(row({ gapSold: 0, reinvested: 2_200 }), 4, false).at(-1)).toEqual({ key: 'reinvested', label: 'Reinvested', value: 2_200 })
    expect(keys(row({ gapSold: 0, reinvested: 0 }), 4).at(-1)).toBe('spending')
  })
})
