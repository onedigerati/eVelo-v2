import { describe, expect, it } from 'vitest'
import marketJson from '../../../data/market.json'
import { DEFAULT_INPUTS } from '../../../engine/defaults'
import { resolveDestination, simulate } from '../../../engine/simulate'
import type { MarketData } from '../../../engine/types'
import { CITIES_FIX } from '../../../engine/__tests__/fixtures'
import { clampExistingLoan, existingLoanInfo, firstYearSpend, maxExistingLoan } from '../existingLoan'

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
  it('reports the net worth left: portfolio less loan, after the opening sale', () => {
    expect(info(3_000_000, 0).netWorthLeft).toBe(3_000_000)
    expect(info(3_000_000, 500_000).netWorthLeft).toBe(2_500_000)
    // $2.1M on $3M: about $1.84M sold, $263K tax, leaving about $637K
    const sold = info(3_000_000, 2_100_000)
    expect(sold.netWorthLeft).toBeCloseTo(3_000_000 - 2_100_000 - sold.sale!.taxPaid, 4)
    expect(Math.round(sold.netWorthLeft / 1000)).toBe(637)
    // just under the break line ($2.5716M): about $3.0M sold, $428K tax, almost nothing left
    const near = info(3_000_000, 2_570_000)
    expect(near.status).toBe('over-limit')
    expect(Math.round(near.sale!.taxPaid / 1000)).toBe(428)
    expect(near.netWorthLeft).toBeGreaterThan(0)
    expect(near.netWorthLeft).toBeLessThan(3_000)
    expect(info(3_000_000, 2_700_000)).toMatchObject({ status: 'breaks', netWorthLeft: 0 })
  })
  it('flags a sale that leaves less than a year of spending as thin', () => {
    const spend = { annualSpend: 87_000 }
    const at = (b: number) => existingLoanInfo({ portfolio: 3_000_000, balance: b, maxLtv: 0.6, targetLtv: 0.45, basisFraction: 0.4, capGainsRate: 0.238, ...spend })
    expect(at(2_570_000).thin).toBe(true)
    expect(at(2_100_000).thin).toBe(false)
    // only an opening sale is ever thin: no sale, or a break, has its own copy
    expect(at(500_000).thin).toBe(false)
    expect(at(2_700_000).thin).toBe(false)
    // without a spending figure nothing is thin
    expect(info(3_000_000, 2_570_000).thin).toBe(false)
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
          expect(r.openingBroken, at).toBe(true)
          expect(w.netWorthLeft, at).toBe(0)
        } else if (w.status === 'over-limit') {
          expect(r.openingBroken, at).toBe(false)
          expect(r.netWorth.p50[0], at).toBeCloseTo(w.netWorthLeft, 4)
          expect(r.openingSale, at).not.toBeNull()
          expect(r.openingSale!.sold, at).toBeCloseTo(w.sale!.sold, 6)
          expect(r.openingSale!.taxPaid, at).toBeCloseTo(w.sale!.taxPaid, 6)
          expect(r.portfolioValue.p50[0], at).toBeCloseTo(portfolio - w.sale!.sold, 6)
          expect(r.ltv.p5[0], at).toBeCloseTo(w.sale!.ltv, 10)
          expect(r.ltv.p95[0], at).toBeCloseTo(w.sale!.ltv, 10)
        } else {
          expect(r.openingSale, at).toBeNull()
          expect(r.openingBroken, at).toBe(false)
          expect(w.netWorthLeft, at).toBe(portfolio - existingLoan)
          expect(r.portfolioValue.p50[0], at).toBe(portfolio)
          expect(r.loan.p5[0], at).toBe(existingLoan)
          expect(r.loan.p95[0], at).toBe(existingLoan)
        }
      }
    }
    expect([...seen].sort()).toEqual(['breaks', 'ok', 'over-limit'])
  })
})

describe('firstYearSpend', () => {
  const [STL, BKK] = CITIES_FIX
  const home = DEFAULT_INPUTS.budget
  const homeTotal = Object.values(home).reduce((a, b) => a + b, 0)
  // income not started yet, so only the budget counts
  const base = { ...DEFAULT_INPUTS, age: 55, incomeStartAge: 67, otherIncome: 40_000 }

  it('uses the destination budget, priced as the engine prices it, when the move is within the first year', () => {
    const dest = resolveDestination(base, STL, BKK).annual!
    expect(dest).not.toBeCloseTo(homeTotal, 0)
    expect(firstYearSpend({ ...base, destCityId: 'bangkok', moveInYears: 0 }, STL, BKK)).toBeCloseTo(dest, 6)
    expect(firstYearSpend({ ...base, destCityId: 'bangkok', moveInYears: 0.5 }, STL, BKK)).toBeCloseTo(dest, 6)
    // the expat factor and overrides move it, as they move the engine's figure
    const pricey = { ...base, destCityId: 'bangkok', moveInYears: 0, expatFactor: 1, ratioOverrides: { housing: 2 } }
    expect(firstYearSpend(pricey, STL, BKK)).toBeCloseTo(resolveDestination(pricey, STL, BKK).annual!, 6)
  })

  it('honours fixed amounts for the destination city only', () => {
    const moving = { ...base, destCityId: 'bangkok', moveInYears: 0 }
    const priced = firstYearSpend(moving, STL, BKK)
    const fixed = { ...moving, amountOverrides: { bangkok: { housing: 30_000 } } }
    expect(firstYearSpend(fixed, STL, BKK)).toBeCloseTo(resolveDestination(fixed, STL, BKK).annual!, 6)
    expect(firstYearSpend(fixed, STL, BKK)).not.toBeCloseTo(priced, 0)
    // another city's fixed amount leaves this one priced
    expect(firstYearSpend({ ...moving, amountOverrides: { zurich: { housing: 30_000 } } }, STL, BKK)).toBeCloseTo(priced, 6)
    // a fixed amount on a $0 home category is still spent, and stays finite
    const zeroHome = { ...moving, budget: { ...moving.budget, travel: 0 }, amountOverrides: { bangkok: { travel: 7_000 } } }
    const z = firstYearSpend(zeroHome, STL, BKK)
    expect(Number.isFinite(z)).toBe(true)
    expect(z).toBeCloseTo(firstYearSpend({ ...zeroHome, amountOverrides: undefined }, STL, BKK) + 7_000, 6)
  })

  it('uses the home budget when the move is a year or more away, or there is no destination', () => {
    expect(firstYearSpend({ ...base, destCityId: 'bangkok', moveInYears: 1 }, STL, BKK)).toBe(homeTotal)
    expect(firstYearSpend({ ...base, destCityId: null, moveInYears: 0 }, STL, null)).toBe(homeTotal)
    // a destination equal to home, or an unknown city, means staying home
    expect(firstYearSpend({ ...base, destCityId: 'st-louis', moveInYears: 0 }, STL, STL)).toBe(homeTotal)
    expect(firstYearSpend({ ...base, destCityId: 'nowhere', moveInYears: 0 }, STL, undefined)).toBe(homeTotal)
  })

  it('subtracts other income only once it has started, and never goes below 0', () => {
    const stay = { ...base, destCityId: null }
    expect(firstYearSpend({ ...stay, incomeStartAge: 55 }, STL, null)).toBe(homeTotal - 40_000)
    expect(firstYearSpend({ ...stay, incomeStartAge: 50 }, STL, null)).toBe(homeTotal - 40_000)
    expect(firstYearSpend({ ...stay, incomeStartAge: 56 }, STL, null)).toBe(homeTotal)
    expect(firstYearSpend({ ...stay, incomeStartAge: 55, otherIncome: 10 * homeTotal }, STL, null)).toBe(0)
  })

  it('makes a sale thin against the first year’s draw, not the home budget', () => {
    // the opening sale on $2.57M of $3M leaves `left` of net worth
    const left = info(3_000_000, 2_570_000).netWorthLeft
    const thin = (spend: number) => existingLoanInfo({ portfolio: 3_000_000, balance: 2_570_000, maxLtv: 0.6, targetLtv: 0.45, basisFraction: 0.4, capGainsRate: 0.238, annualSpend: spend }).thin
    // income that covers the budget leaves nothing to draw: not thin
    expect(thin(firstYearSpend({ ...base, destCityId: null, incomeStartAge: 55, otherIncome: 10 * homeTotal }, STL, null))).toBe(false)
    expect(thin(left + 1)).toBe(true)
  })
})
