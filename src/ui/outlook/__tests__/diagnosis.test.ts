import { describe, expect, it, vi } from 'vitest'

// diagnosis is pure, but its module imports the store, which reads `window` on load.
vi.mock('../../../state/store', () => ({ useStore: () => undefined }))
vi.mock('../../../state/fx', () => ({ useFx: () => undefined, useRate: () => 1 }))
import { DEFAULT_INPUTS } from '../../../engine/defaults'
import type { SimulationResult } from '../../../engine/types'
import { diagnosis } from '../VerdictHero'

// Defaults-like stats: average year 9.69% nominal, compounded (median CAGR) 8.68% nominal.
const baseStats = {
  expReturn: 0.0969,
  cagrMedian: 0.0868,
  volatility: 0.136,
  expReturnReal: 0.07,
  cagrMedianReal: 0.06,
}

function fake(loanRate: number, opts: { successRate?: number; stats?: Partial<typeof baseStats> } = {}): SimulationResult {
  return {
    inputs: { ...DEFAULT_INPUTS, loanRate },
    successRate: opts.successRate ?? 0.4,
    brokenRate: 0.4,
    bruisedRate: 0.2,
    stats: { ...baseStats, ...opts.stats },
  } as unknown as SimulationResult
}

describe('diagnosis', () => {
  it('warns when the loan rate sits between the average return and compounded growth', () => {
    const why = diagnosis(fake(0.092))
    expect(why).toMatch(/^The loan costs 9\.2% a year but this portfolio typically grows only about 8\.7% a year compounded:/)
    expect(why).toContain('the debt compounds faster than the assets')
    expect(why).not.toContain('9.7%')
  })

  it('compares the effective annual loan cost (APR compounded monthly), quoting the APR', () => {
    // 12% APR costs 12.68% a year: above 12.4% growth although the APR is below it.
    const why = diagnosis(fake(0.12, { stats: { cagrMedian: 0.124 } }))
    expect(why).toMatch(/^The loan costs 12% a year but this portfolio typically grows only about 12\.4% a year compounded:/)
  })

  it('gives no loan sentence when the effective loan cost is just below growth', () => {
    expect(diagnosis(fake(0.12, { stats: { cagrMedian: 0.127, cagrMedianReal: 0.1 } }))).toBeNull()
  })

  it('gives no loan sentence when the loan rate is below both', () => {
    expect(diagnosis(fake(0.06))).toBeNull()
  })

  it('stays silent for a plan that mostly holds', () => {
    expect(diagnosis(fake(0.12, { successRate: 0.95 }))).toBeNull()
  })

  it('uses real compounded growth, not the real average, for the low-growth sentence', () => {
    // Real average 3.5% clears the 3% bar; real median CAGR 2.5% does not.
    const why = diagnosis(fake(0.05, { stats: { expReturnReal: 0.035, cagrMedianReal: 0.025 } }))
    expect(why).toBe('With real growth near 2.5% a year compounded, spending plus interest outruns growth in most futures.')
  })
})
