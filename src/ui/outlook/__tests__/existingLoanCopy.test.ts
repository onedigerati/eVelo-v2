import { describe, expect, it, vi } from 'vitest'

// The captions are pure, but their modules import the store, which reads `window` on load.
vi.mock('../../../state/store', () => ({ useStore: () => undefined }))
vi.mock('../../../state/fx', () => ({ useFx: () => undefined, useRate: () => 1 }))
import { DEFAULT_INPUTS } from '../../../engine/defaults'
import type { SimulationResult } from '../../../engine/types'
import { estateCaption, sellStartNote, startNetWorth } from '../cards'
import { fanCaption } from '../FanCard'

const band = (start: number, end: number) => {
  const s = [start, (start + end) / 2, end]
  return { p5: s.map((x) => x * 0.5), p25: s, p50: s, p75: s, p95: s.map((x) => x * 1.5) }
}

function fake(existingLoan: number, over: Partial<SimulationResult> = {}): SimulationResult {
  return {
    inputs: { ...DEFAULT_INPUTS, portfolio: 2_000_000, existingLoan, age: 60 },
    netWorth: band(2_000_000 - existingLoan, 3_000_000),
    portfolioValue: band(2_000_000, 4_000_000),
    loan: band(existingLoan, 1_000_000),
    ltv: band(existingLoan / 2_000_000, 0.25),
    estate: { bbdMedian: 3_000_000, sellMedian: 2_500_000, bbdWins: 0.7, sellTaxMedian: 100_000 },
    ...over,
  } as unknown as SimulationResult
}

describe('existing loan copy', () => {
  it('leaves captions unchanged at a zero balance', () => {
    const r = fake(0)
    expect(fanCaption(r, 'loan')).toBe(
      'Borrowing compounds: the median loan reaches $1.0M by 62, and $1.5M in the costliest 5% of futures.',
    )
    expect(sellStartNote(r)).toBeNull()
    expect(startNetWorth(r)).toBe(2_000_000)
  })

  it('mentions the existing balance when there is one', () => {
    const r = fake(300_000)
    expect(fanCaption(r, 'loan')).toMatch(/^Borrowing compounds: from your existing \$300K balance, the median loan reaches/)
    expect(sellStartNote(r)).toContain('$300K')
    expect(startNetWorth(r)).toBe(1_700_000)
  })

  it('scales "almost nothing" by starting net worth, not the portfolio', () => {
    // $30K is under 2% of a $2M start ($40K) but over 2% of a $1M start ($20K).
    const netWorth = { p5: [1_000_000, 500_000, 30_000], p25: [0, 0, 0], p50: [1_000_000, 900_000, 800_000], p75: [0, 0, 0], p95: [0, 0, 0] }
    expect(fanCaption(fake(0, { netWorth } as Partial<SimulationResult>), 'networth')).toContain('with almost nothing')
    expect(fanCaption(fake(1_000_000, { netWorth } as Partial<SimulationResult>), 'networth')).toContain('near $30K')
  })

  it('scales the "no estate" threshold by starting net worth', () => {
    const estate = { bbdMedian: 15_000, sellMedian: 5_000, bbdWins: 0.5, sellTaxMedian: 0 }
    expect(estateCaption(fake(0, { estate } as Partial<SimulationResult>))).toMatch(/^In the median future neither/)
    expect(estateCaption(fake(1_000_000, { estate } as Partial<SimulationResult>))).toMatch(/^Borrowing leaves heirs/)
  })
})
