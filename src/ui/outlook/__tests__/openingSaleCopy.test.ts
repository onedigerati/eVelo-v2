import { describe, expect, it, vi } from 'vitest'

// The captions are pure, but their modules import the store, which reads `window` on load.
vi.mock('../../../state/store', () => ({ useStore: () => undefined }))
vi.mock('../../../state/fx', () => ({ useFx: () => undefined, useRate: () => 1 }))
import { DEFAULT_INPUTS } from '../../../engine/defaults'
import type { SimulationResult } from '../../../engine/types'
import { fanCaption } from '../FanCard'
import { marginCallCaption } from '../MarginCallChart'
import { sellStartNote } from '../cards'
import { BROKEN_AT_START, openingBrokenOf, openingSaleOf } from '../openingSale'

type Band = { p5: number[]; p25: number[]; p50: number[]; p75: number[]; p95: number[] }
const band = (start: number, end: number): Band => {
  const s = [start, (start + end) / 2, end]
  return { p5: s.map((x) => x * 0.5), p25: s, p50: s, p75: s, p95: s.map((x) => x * 1.5) }
}
const series = (p50: number[], p95: number[]): Band => ({ p5: p50, p25: p50, p50, p75: p50, p95 })

/** 30 years of first-forced-sale weights from a sparse map of year → weight. */
const years = (w: Record<number, number>) => Array.from({ length: 30 }, (_, i) => w[i] ?? 0)

interface Over {
  ltv?: Band
  loan?: Band
  byYear?: number[]
  total?: number
  openingSale?: { sold: number; taxPaid: number } | null
  openingBroken?: boolean
}

// maxLtv is the default 60%; portfolio $2M at age 60; the fan bands run 3 points (to age 62).
function fake(existingLoan: number, o: Over = {}): SimulationResult {
  const byYear = o.byYear ?? years({})
  const r: Record<string, unknown> = {
    inputs: { ...DEFAULT_INPUTS, portfolio: 2_000_000, existingLoan, age: 60 },
    netWorth: band(2_000_000 - existingLoan, 3_000_000),
    portfolioValue: band(2_000_000, 4_000_000),
    loan: o.loan ?? band(existingLoan, 1_000_000),
    ltv: o.ltv ?? band(existingLoan / 2_000_000, 0.25),
    marginCallByYear: byYear,
    marginCallCumulative: byYear.map((_, i) => (i === byYear.length - 1 ? (o.total ?? 0) : 0)),
    estate: { bbdMedian: 3_000_000, sellMedian: 2_500_000, bbdWins: 0.7, sellTaxMedian: 100_000 },
  }
  if (o.openingSale !== undefined) r.openingSale = o.openingSale
  if (o.openingBroken !== undefined) r.openingBroken = o.openingBroken
  return r as unknown as SimulationResult
}

const SALE = { sold: 900_000, taxPaid: 100_000 }

describe('openingSaleOf', () => {
  it('is null when the field is missing, null, or sold nothing', () => {
    expect(openingSaleOf(fake(0))).toBeNull()
    expect(openingSaleOf(fake(0, { openingSale: null }))).toBeNull()
    expect(openingSaleOf(fake(0, { openingSale: { sold: 0, taxPaid: 0 } }))).toBeNull()
    expect(openingSaleOf(fake(1_500_000, { openingSale: SALE }))).toEqual(SALE)
  })
})

describe('captions at a zero balance stay as they were', () => {
  it('portfolio', () => {
    expect(fanCaption(fake(0), 'portfolio')).toBe(
      'Nothing is sold to fund your life: the median portfolio compounds to $4.0M by 62, carrying the loan on top.',
    )
  })

  it('loan-to-value, well under the line', () => {
    expect(fanCaption(fake(0), 'ltv')).toBe(
      'Median loan-to-value peaks at 25% around 62, well under the 60% call line; even the worst 5% never reach it.',
    )
  })

  it('loan-to-value with no borrowing at all', () => {
    expect(fanCaption(fake(0, { ltv: series([0, 0, 0], [0, 0, 0]) }), 'ltv')).toBe(
      'Median loan-to-value peaks at 0% around 60, well under the 60% call line; even the worst 5% never reach it.',
    )
  })

  it('loan-to-value whose worst 5% touch the line', () => {
    expect(fanCaption(fake(0, { ltv: series([0, 0.1, 0.2], [0, 0.4, 0.7]) }), 'ltv')).toBe(
      'Median loan-to-value peaks at 20% around 62, well under the 60% call line; the worst 5% touch it by 62.',
    )
  })

  it('margin calls: none, early over several years, and late', () => {
    expect(marginCallCaption(fake(0))).toBe(
      'Not one simulated future in two hundred forces a sale: the loan never gets near the call line.',
    )
    expect(marginCallCaption(fake(0, { byYear: years({ 0: 1, 1: 1, 2: 1 }), total: 0.15 }))).toBe(
      'Risk is concentrated early: 80% of forced sales happen in the first 3 years (ages 60 to 63), when a crash can hit before the portfolio has grown past the loan.',
    )
    const late = years(Object.fromEntries(Array.from({ length: 10 }, (_, i) => [20 + i, 1])))
    expect(marginCallCaption(fake(0, { byYear: late, total: 0.2 }))).toBe(
      'Risk is concentrated: 80% of forced sales fall between ages 80 and 88, as the loan compounds faster than the portfolio. Outside that window forced sales are rare.',
    )
  })
})

describe('the relation to the call line', () => {
  it('reads "close to", never "well close to", between 60% of the line and the line', () => {
    const c = fanCaption(fake(0, { ltv: series([0, 0.3, 0.5], [0, 0.4, 0.55]) }), 'ltv')
    expect(c).toBe('Median loan-to-value peaks at 50% around 62, close to the 60% call line; even the worst 5% never reach it.')
  })

  it('reads "above" at or past the line', () => {
    const c = fanCaption(fake(0, { ltv: series([0, 0.4, 0.6], [0, 0.6, 0.9]) }), 'ltv')
    expect(c).toBe('Median loan-to-value peaks at 60% around 62, above the 60% call line; the worst 5% touch it by 61.')
  })
})

describe('a year-0 peak from an existing balance', () => {
  it('starts at its peak and falls', () => {
    const c = fanCaption(fake(800_000, { ltv: series([0.4, 0.3, 0.25], [0.4, 0.45, 0.5]) }), 'ltv')
    expect(c).toBe('Median loan-to-value starts at its peak, 40% (close to the 60% call line), and falls from there; even the worst 5% never reach it.')
  })

  it('blames the existing balance for early forced sales', () => {
    expect(marginCallCaption(fake(800_000, { byYear: years({ 0: 3, 1: 1 }), total: 0.2 }))).toBe(
      'Risk is concentrated early: 80% of forced sales happen in the first 2 years (ages 60 to 62), when a crash can hit while your existing balance still sits near the call line.',
    )
  })

  it('keeps the growth explanation for a small balance', () => {
    expect(marginCallCaption(fake(200_000, { byYear: years({ 0: 3, 1: 1 }), total: 0.2 }))).toContain(
      'when a crash can hit before the portfolio has grown past the loan.',
    )
  })
})

describe('an over-call start (no opening sale reported)', () => {
  it('says the worst 5% start at or past the line', () => {
    const c = fanCaption(fake(1_300_000, { ltv: series([0.65, 0.55, 0.5], [0.65, 0.7, 0.8]) }), 'ltv')
    expect(c).toBe('Median loan-to-value starts at its peak, 65% (above the 60% call line), and falls from there; the worst 5% start at or past it.')
  })
})

describe('an opening forced sale', () => {
  const r = (o: Over = {}) => fake(1_500_000, { loan: band(450_000, 1_000_000), openingSale: SALE, ...o })

  it('opens the portfolio caption with the sale and its tax', () => {
    expect(fanCaption(r(), 'portfolio')).toBe(
      'The plan opens with a forced sale of $900K today, paying $100K in tax; after that, nothing more is sold to fund your life, and the median portfolio compounds to $4.0M by 62, carrying the loan on top.',
    )
  })

  it('shows the balance cut by the sale in the loan caption', () => {
    expect(fanCaption(r(), 'loan')).toBe(
      'Borrowing compounds: from your existing $1.5M balance, cut to $450K by the opening sale, the median loan reaches $1.0M by 62, and $1.5M in the costliest 5% of futures.',
    )
  })

  it('starts the loan-to-value caption with the sale', () => {
    expect(fanCaption(r({ ltv: series([0.45, 0.4, 0.35], [0.45, 0.5, 0.65]) }), 'ltv')).toBe(
      'A forced sale today brings loan-to-value to 45% (close to the 60% call line), and the median falls from there; the worst 5% touch it by 62.',
    )
    expect(fanCaption(r({ ltv: series([0.45, 0.5, 0.4], [0.45, 0.55, 0.5]) }), 'ltv')).toBe(
      'A forced sale today brings loan-to-value to 45%; the median then peaks at 50% around 61, close to the 60% call line; even the worst 5% never reach it.',
    )
  })

  it('leaves the opening sale out of the margin-call count', () => {
    expect(marginCallCaption(r())).toBe(
      'Beyond the opening sale, not one simulated future in two hundred forces another: the loan never climbs back to the call line.',
    )
    expect(marginCallCaption(r({ byYear: years({ 0: 1 }), total: 0.1 }))).toBe(
      'Risk is concentrated early: 80% of forced sales happen in the first year (ages 60 to 61), when a crash can hit while the loan is still near the call line after the opening sale. The opening sale today isn’t counted.',
    )
    const late = years(Object.fromEntries(Array.from({ length: 10 }, (_, i) => [20 + i, 1])))
    expect(marginCallCaption(r({ byYear: late, total: 0.2 }))).toMatch(/forced sales are rare\. The opening sale today isn’t counted\.$/)
  })
})

describe('openingBrokenOf', () => {
  it('is true only when the engine says so', () => {
    expect(openingBrokenOf(fake(0))).toBe(false)
    expect(openingBrokenOf(fake(0, { openingBroken: false }))).toBe(false)
    expect(openingBrokenOf(fake(1_900_000, { openingBroken: true }))).toBe(true)
  })
})

describe('a plan broken from the start', () => {
  // What simulate records: every path liquidated before month 0, all of them called in year 0.
  const zeros = series([0, 0, 0], [0, 0, 0])
  const r = () => {
    const x = fake(1_900_000, {
      openingSale: null,
      openingBroken: true,
      loan: zeros,
      ltv: series([1, 1, 1], [1, 1, 1]),
      byYear: years({ 0: 1 }),
      total: 1,
    }) as unknown as Record<string, unknown>
    x.netWorth = zeros
    x.portfolioValue = zeros
    return x as unknown as SimulationResult
  }

  it('says so plainly in every fan caption and the margin-call caption', () => {
    expect(BROKEN_AT_START).toBe('This plan fails at once: after tax, a forced sale can’t cover the existing balance.')
    for (const m of ['networth', 'portfolio', 'loan', 'ltv'] as const) expect(fanCaption(r(), m)).toBe(BROKEN_AT_START)
    expect(marginCallCaption(r())).toBe(BROKEN_AT_START)
  })

  it('says the borrowing side fails at once in the sell note', () => {
    expect(sellStartNote(r())).toBe(
      'Selling as you go starts at the portfolio less your existing $1.9M loan, with no debt; the borrowing side fails at once, as a forced sale can’t cover that balance after tax.',
    )
  })
})

describe('a flat loan-to-value is not a peak', () => {
  it('says it stays, not that it falls', () => {
    expect(fanCaption(fake(800_000, { ltv: series([0.4, 0.4, 0.4], [0.4, 0.45, 0.5]) }), 'ltv')).toBe(
      'Median loan-to-value stays at 40% (close to the 60% call line); even the worst 5% never reach it.',
    )
    expect(fanCaption(fake(1_500_000, { openingSale: SALE, ltv: series([0.45, 0.45, 0.45], [0.45, 0.5, 0.55]) }), 'ltv')).toBe(
      'A forced sale today brings loan-to-value to 45% (close to the 60% call line), and the median stays there; even the worst 5% never reach it.',
    )
  })
})

describe('the sell note', () => {
  it('is absent with no balance', () => {
    expect(sellStartNote(fake(0))).toBeNull()
  })

  it('claims the same starting net worth when there is no opening sale', () => {
    expect(sellStartNote(fake(800_000, { openingSale: null, openingBroken: false }))).toBe(
      'Selling as you go starts at the portfolio less your existing $800K loan, with no debt, so both start from the same net worth.',
    )
  })

  it('says the opening sale’s tax comes off the borrowing side first', () => {
    // $2.1M on $3M at the defaults: $1.84M sold, $263K tax
    expect(sellStartNote(fake(2_100_000, { openingSale: { sold: 1_840_000, taxPaid: 263_000 } }))).toBe(
      'Selling as you go starts at the portfolio less your existing $2.1M loan, with no debt, so both start from the same net worth, but the opening sale’s $263K tax comes off the borrowing side first.',
    )
  })

  it('keeps the plain note when the opening sale paid no tax', () => {
    expect(sellStartNote(fake(1_500_000, { openingSale: { sold: 900_000, taxPaid: 0 } }))).toBe(
      'Selling as you go starts at the portfolio less your existing $1.5M loan, with no debt, so both start from the same net worth.',
    )
  })
})
