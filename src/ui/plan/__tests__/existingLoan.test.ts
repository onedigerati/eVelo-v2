import { describe, expect, it } from 'vitest'
import marketJson from '../../../data/market.json'
import { DEFAULT_INPUTS } from '../../../engine/defaults'
import { simulate } from '../../../engine/simulate'
import type { MarketData } from '../../../engine/types'
import { CITIES_FIX } from '../../../engine/__tests__/fixtures'
import { clampExistingLoan, existingLoanInfo, maxExistingLoan } from '../existingLoan'

// Defaults: basis 0.4, gains tax 23.8%, call at 60%, sold back to 45% → the opening sale can't
// cover the loan from 1 − 0.6·0.238 = 85.72% LTV.
const info = (
  portfolio: number,
  balance: number,
  o: { maxLtv?: number; targetLtv?: number; basisFraction?: number; capGainsRate?: number } = {},
) => existingLoanInfo({ portfolio, balance, maxLtv: 0.6, targetLtv: 0.45, basisFraction: 0.4, capGainsRate: 0.238, ...o })

describe('existing loan', () => {
  it('reports today’s LTV', () => {
    expect(info(3_000_000, 500_000)).toMatchObject({ ltv: 1 / 6, maxBalance: 2_999_999, status: 'ok', sale: null })
    expect(info(3_000_000, 0)).toMatchObject({ ltv: 0, maxBalance: 2_999_999, status: 'ok', sale: null })
  })
  it('flags a balance past the margin-call LTV, but not one exactly at it', () => {
    expect(info(1_000_000, 600_000).status).toBe('ok')
    expect(info(1_000_000, 600_001).status).toBe('over-limit')
    expect(info(1_000_000, 800_000)).toMatchObject({ ltv: 0.8, status: 'over-limit' })
  })
  it('reports the opening sale: shares sold, tax paid, and the target LTV it lands at', () => {
    const g = 0.6
    const S = (800_000 - 0.45 * 1_000_000) / (1 - g * 0.238 - 0.45)
    const { sale } = info(1_000_000, 800_000)
    expect(sale!.sold).toBeCloseTo(S, 6)
    expect(sale!.taxPaid).toBeCloseTo(S * g * 0.238, 6)
    expect(sale!.ltv).toBeCloseTo(0.45, 12)
    // a target above the threshold is capped at it, as in the engine
    expect(info(1_000_000, 700_000, { targetLtv: 0.7 }).sale!.ltv).toBeCloseTo(0.6, 12)
  })
  it('breaks where the sale cannot cover the loan after tax, V·(1 − g·tax)', () => {
    const line = 1_000_000 * (1 - 0.6 * 0.238) // 857,200
    expect(info(1_000_000, line - 1).status).toBe('over-limit')
    expect(info(1_000_000, line).status).toBe('breaks')
    expect(info(1_000_000, line + 1).status).toBe('breaks')
    expect(info(1_000_000, 999_999)).toMatchObject({ status: 'breaks', sale: null })
  })
  it('moves the break line with basis and tax', () => {
    // Full basis or no tax: no embedded-gain tax, so only the portfolio itself caps the loan.
    expect(info(1_000_000, 999_999, { basisFraction: 1 }).status).toBe('over-limit')
    expect(info(1_000_000, 999_999, { capGainsRate: 0 }).status).toBe('over-limit')
    // Basis above value (a loss) counts as full basis: no gain, no tax.
    expect(info(1_000_000, 999_999, { basisFraction: 1.5 })).toMatchObject({ status: 'over-limit', sale: { taxPaid: 0 } })
    // Zero basis, 20% tax, call at 80%: a balance exactly at the threshold forces no sale.
    expect(info(1_000_000, 800_000, { basisFraction: 0, capGainsRate: 0.2, maxLtv: 0.8 }).status).toBe('ok')
    expect(info(1_000_000, 799_999, { basisFraction: 0, capGainsRate: 0.2, maxLtv: 0.8 }).status).toBe('ok')
    // ...but just past it the sale can't cover the loan after tax (break line 80%).
    expect(info(1_000_000, 800_001, { basisFraction: 0, capGainsRate: 0.2, maxLtv: 0.8 }).status).toBe('breaks')
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

describe('existing loan: the warning agrees with the engine', () => {
  const market = marketJson as unknown as MarketData
  const configs = [
    {},
    { maxLtv: 0.8, targetLtvAfterCall: 0.6, basisFraction: 0, capGainsRate: 0.2 },
    { maxLtv: 0.5, targetLtvAfterCall: 0.7, basisFraction: 1.5, capGainsRate: 0.3 }, // target capped, basis clamped
    { maxLtv: 0.7, targetLtvAfterCall: 0.65, basisFraction: -0.2, capGainsRate: 0.5 },
  ]
  const portfolio = DEFAULT_INPUTS.portfolio
  const balances = [0, 0.3, 0.5, 0.6, 0.600001, 0.65, 0.7, 0.75, 0.8, 0.85, 0.8572, 0.86, 0.9, 0.95, 0.999].map((f) =>
    Math.round(f * portfolio),
  )

  it('over a grid of balances, the status matches what simulate records at year 0', () => {
    const seen = new Set<string>()
    for (const c of configs) {
      for (const existingLoan of balances) {
        const inputs = { ...DEFAULT_INPUTS, ...c, existingLoan, paths: 20 }
        const r = simulate(market, CITIES_FIX, inputs)
        const w = existingLoanInfo({
          portfolio,
          balance: existingLoan,
          maxLtv: inputs.maxLtv,
          targetLtv: inputs.targetLtvAfterCall,
          basisFraction: inputs.basisFraction,
          capGainsRate: inputs.capGainsRate,
        })
        seen.add(w.status)
        const at = `${JSON.stringify(c)} @ ${existingLoan}`
        if (w.status === 'breaks') {
          expect(r.brokenRate, at).toBe(1)
          expect(r.portfolioValue.p95[0], at).toBe(0)
          expect(r.ltv.p5[0], at).toBe(1)
          expect(r.openingSale, at).toBeNull()
        } else if (w.status === 'over-limit') {
          expect(r.openingSale, at).not.toBeNull()
          expect(r.openingSale!.sold, at).toBeCloseTo(w.sale!.sold, 6)
          expect(r.openingSale!.taxPaid, at).toBeCloseTo(w.sale!.taxPaid, 6)
          expect(r.portfolioValue.p50[0], at).toBeCloseTo(portfolio - w.sale!.sold, 6)
          expect(r.ltv.p5[0], at).toBeCloseTo(w.sale!.ltv, 10)
          expect(r.ltv.p95[0], at).toBeCloseTo(w.sale!.ltv, 10)
        } else {
          expect(r.openingSale, at).toBeNull()
          expect(r.portfolioValue.p50[0], at).toBe(portfolio)
          expect(r.loan.p5[0], at).toBe(existingLoan)
          expect(r.loan.p95[0], at).toBe(existingLoan)
        }
      }
    }
    expect([...seen].sort()).toEqual(['breaks', 'ok', 'over-limit'])
  })
})
