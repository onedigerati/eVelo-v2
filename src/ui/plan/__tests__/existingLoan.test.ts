import { describe, expect, it } from 'vitest'
import { clampExistingLoan, existingLoanInfo, maxExistingLoan } from '../existingLoan'

// Defaults: basis 0.4, gains tax 23.8% → breaks at 1 − 0.6·0.238 = 85.72% LTV.
const info = (portfolio: number, balance: number, o: { maxLtv?: number; basisFraction?: number; capGainsRate?: number } = {}) =>
  existingLoanInfo({ portfolio, balance, maxLtv: 0.6, basisFraction: 0.4, capGainsRate: 0.238, ...o })

describe('existing loan', () => {
  it('reports today’s LTV', () => {
    expect(info(3_000_000, 500_000)).toMatchObject({ ltv: 1 / 6, maxBalance: 2_999_999, status: 'ok' })
    expect(info(3_000_000, 0)).toMatchObject({ ltv: 0, maxBalance: 2_999_999, status: 'ok' })
  })
  it('flags a balance past the margin-call LTV, but not one exactly at it', () => {
    expect(info(1_000_000, 600_000).status).toBe('ok')
    expect(info(1_000_000, 600_001).status).toBe('over-limit')
    expect(info(1_000_000, 800_000)).toMatchObject({ ltv: 0.8, status: 'over-limit' })
  })
  it('breaks at V·(1 − g·tax), the line where a full sale cannot repay the loan after tax', () => {
    const r = info(1_000_000, 0)
    expect(r.breakLtv).toBeCloseTo(0.8572, 10)
    const line = 1_000_000 * (1 - 0.6 * 0.238) // 857,200
    expect(info(1_000_000, line - 1).status).toBe('over-limit')
    expect(info(1_000_000, line).status).toBe('breaks')
    expect(info(1_000_000, line + 1).status).toBe('breaks')
    expect(info(1_000_000, 999_999).status).toBe('breaks')
  })
  it('moves the break line with basis and tax', () => {
    // Full basis or no tax: no embedded-gain tax, so only the portfolio itself caps the loan.
    expect(info(1_000_000, 999_999, { basisFraction: 1 })).toMatchObject({ breakLtv: 1, status: 'over-limit' })
    expect(info(1_000_000, 999_999, { capGainsRate: 0 }).status).toBe('over-limit')
    // Basis above value (a loss) counts as no gain.
    expect(info(1_000_000, 0, { basisFraction: 1.5 }).breakLtv).toBe(1)
    // Zero basis, 20% tax: breaks at 80%, below a 0.8 threshold that would otherwise only warn.
    expect(info(1_000_000, 800_000, { basisFraction: 0, capGainsRate: 0.2, maxLtv: 0.8 }).status).toBe('breaks')
    expect(info(1_000_000, 799_999, { basisFraction: 0, capGainsRate: 0.2, maxLtv: 0.8 }).status).toBe('ok')
  })
  it('keeps the balance strictly under the portfolio', () => {
    for (const p of [0.5, 1, 2, 10_000, 3_000_000, 1e10]) {
      const max = maxExistingLoan(p)
      expect(max).toBeGreaterThanOrEqual(0)
      expect(max).toBeLessThan(p)
      expect(clampExistingLoan(p, p)).toBe(max)
      expect(clampExistingLoan(p * 2 + 5, p)).toBe(max)
    }
    expect(maxExistingLoan(0)).toBe(0)
    expect(info(1_000_000, 5_000_000).ltv).toBeLessThan(1)
  })
  it('treats hostile values as no loan', () => {
    expect(clampExistingLoan(-5, 1_000_000)).toBe(0)
    expect(clampExistingLoan(Number.NaN, 1_000_000)).toBe(0)
    expect(clampExistingLoan(Infinity, 1_000_000)).toBe(0)
    expect(maxExistingLoan(Number.NaN)).toBe(0)
    expect(info(0, 100)).toMatchObject({ ltv: 0, maxBalance: 0, status: 'ok' })
  })
})
