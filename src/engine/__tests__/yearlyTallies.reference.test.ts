// Stage 1 (eVelo yearly tallies): a hand-worked eVelo path against the scalar reference
// (evReference.ts), and simulate(...).yearly against both. A constant market (every month the same
// return and inflation) makes every bootstrap path identical, so with paths: 1 the median is the path.
import { describe, expect, it } from 'vitest'
import { DEFAULT_INPUTS } from '../defaults'
import { prepare } from '../prepare'
import { makeScenarios, normalizeInputs, simulate } from '../simulate'
import type { MarketData, PlanInputs, SimulationResult } from '../types'
import { evReference, type EvRefInputs, type EvRefYears } from './evReference'
import { CITIES_FIX } from './fixtures'

/** The contract the kernel builder adds to SimulationResult (typed here until it lands). */
type Yearly = { borrowed: number[]; interest: number[]; forcedSaleSold: number[] }
const yearlyOf = (r: SimulationResult) => (r as SimulationResult & { yearly: Yearly }).yearly

/** A market where SPY returns `ret` and CPI is `cpi` every month. */
function constantMarket(ret: number, cpi: number, months = 360): MarketData {
  return {
    asOf: '2026-11-01',
    start: '1990-01',
    months,
    cpi: new Array(months).fill(cpi),
    assets: { SPY: { symbol: 'SPY', name: 'SPY', cls: 'etf-equity', first: 0, r: new Array(months).fill(ret) } },
  }
}

const zeroBudget = { housing: 0, groceries: 0, dining: 0, transport: 0, utilities: 0, healthcare: 0, travel: 0, other: 0 }

/** Retired today at 65 in St. Louis (no local tax), staying home, all in SPY, no drag, no existing loan. */
function planInputs(o: Partial<PlanInputs>): PlanInputs {
  return normalizeInputs({
    ...DEFAULT_INPUTS,
    holdings: [{ symbol: 'SPY', weight: 1 }],
    portfolio: 1_000_000,
    basisFraction: 0.5,
    age: 65,
    horizonYears: 4,
    budget: { ...zeroBudget, housing: 60_000 },
    homeCityId: 'st-louis',
    destCityId: null,
    moveInYears: 0,
    retireInYears: 0,
    savingsWhileWorking: 0,
    otherIncome: 24_000,
    incomeStartAge: 67,
    existingLoan: 0,
    loanRate: 0.06,
    maxLtv: 0.6,
    targetLtvAfterCall: 0.45,
    capGainsRate: 0.238,
    dividendTaxDrag: 0,
    method: 'bootstrap',
    outlook: 'historical',
    blockMonths: 12,
    paths: 1,
    seed: 3,
    ...o,
  })
}

/** The reference fed the exact monthly returns and inflation the engine draws (Float32 scenarios). */
function referenceFor(market: MarketData, inputs: PlanInputs): EvRefYears {
  const prep = prepare(market, inputs.holdings, inputs.outlook)
  const sc = makeScenarios(prep, inputs, 1)
  const ref: EvRefInputs = {
    portfolio: inputs.portfolio,
    basisFraction: inputs.basisFraction,
    loanRate: inputs.loanRate,
    maxLtv: inputs.maxLtv,
    targetLtv: inputs.targetLtvAfterCall,
    capGainsRate: inputs.capGainsRate,
    spendingMonthly: 60_000 / 12,
    incomeMonthly: inputs.otherIncome / 12,
    incomeStartMonth: (inputs.incomeStartAge - inputs.age) * 12,
    ret: Array.from(sc.ret, (r) => r - inputs.dividendTaxDrag / 12),
    infl: Array.from(sc.infl),
  }
  return evReference(ref)
}

const expectCents = (got: number[], want: number[]) => {
  expect(got).toHaveLength(want.length)
  want.forEach((w, i) => expect(got[i], `year ${i}`).toBeCloseTo(w, 2))
}

describe('eVelo yearly tallies: hand-worked flat path', () => {
  // $1M in SPY at 0% a month, no inflation (real = nominal), 6% loan (0.5% a month), $60k/yr spending
  // ($5,000 a month), Social Security $24k/yr ($2,000 a month) from age 67 = month 24, 4 years.
  const market = constantMarket(0, 0)
  const inputs = planInputs({})
  const ref = referenceFor(market, inputs)

  // By hand: borrowing b a month at monthly rate i, a loan L grows over 12 months to
  //   L·(1+i)^12 + b·s,  s = ((1+i)^12 − 1)/i = 12.3355623729   (the year's interest is the excess)
  const i = 0.06 / 12
  const g = (1 + i) ** 12
  const s = (g - 1) / i
  const monthly = [5000, 5000, 3000, 3000]
  const handLoan: number[] = []
  const handInterest: number[] = []
  monthly.reduce((L, b) => {
    const end = L * g + b * s
    handLoan.push(end)
    handInterest.push(end - L - 12 * b)
    return end
  }, 0)

  it('the market is flat: every drawn month returns 0 with no inflation', () => {
    const sc = makeScenarios(prepare(market, inputs.holdings, inputs.outlook), inputs, 1)
    expect(Array.from(sc.ret).every((r) => r === 0)).toBe(true)
    expect(Array.from(sc.infl).every((r) => r === 0)).toBe(true)
  })

  it('borrowing equals spending less Social Security, each year: 60,000, 60,000, 36,000, 36,000', () => {
    expectCents(ref.borrowed, [60_000 - 0, 60_000 - 0, 60_000 - 24_000, 60_000 - 24_000])
  })

  it('interest is the loan × monthly rate summed over the year: 1,677.81, 5,481.96, 8,849.62, 11,615.85', () => {
    expectCents(handInterest, [1677.81, 5481.96, 8849.62, 11615.85]) // the closed form, written out
    expectCents(ref.interest, handInterest)
    expectCents(ref.loanEnd, handLoan) // 61,677.81, 127,159.78, 172,009.40, 219,625.25
  })

  it('loan at year end = last year\'s loan + borrowed + interest − repayments', () => {
    let prev = 0
    for (let y = 0; y < ref.loanEnd.length; y++) {
      expect(ref.loanEnd[y]).toBeCloseTo(prev + ref.borrowed[y] + ref.interest[y] - ref.repaid[y], 2)
      prev = ref.loanEnd[y]
    }
    expectCents(ref.repaid, [0, 0, 0, 0])
    expectCents(ref.forcedSaleSold, [0, 0, 0, 0])
  })

  it('a surplus repays the loan first: Social Security above spending pays the loan down', () => {
    // Spending $60k, Social Security $84k from month 24: a $2,000 a month surplus repays the loan.
    const r = referenceFor(market, planInputs({ otherIncome: 84_000 }))
    expectCents(r.borrowed, [60_000, 60_000, 0, 0])
    expectCents(r.repaid, [0, 0, 24_000, 24_000])
    let prev = 0
    for (let y = 0; y < r.loanEnd.length; y++) {
      expect(r.loanEnd[y]).toBeCloseTo(prev + r.borrowed[y] + r.interest[y] - r.repaid[y], 2)
      prev = r.loanEnd[y]
    }
  })

  it('the engine\'s loan band median (index y + 1 = end of year y, real) is the reference\'s year-end loan', () => {
    const res = simulate(market, CITIES_FIX, inputs)
    expectCents(res.loan.p50.slice(1), ref.loanEnd)
    expect(res.successRate).toBe(1)
  })

  it('simulate(...).yearly equals the reference to the cent', () => {
    const res = simulate(market, CITIES_FIX, inputs)
    const yearly = yearlyOf(res)
    expect(yearly, 'SimulationResult.yearly (stage 1 contract)').toBeDefined()
    expectCents(yearly.borrowed, ref.borrowed)
    expectCents(yearly.interest, ref.interest)
    expectCents(yearly.forcedSaleSold, ref.forcedSaleSold)
  })
})

describe('eVelo yearly tallies: a stressed path with forced sales', () => {
  // SPY −1.5% every month, CPI +0.2% a month, basis 40%, 6 years: margin calls in years 4 and 5,
  // and the path survives to the horizon.
  const market = constantMarket(-0.015, 0.002)
  const inputs = planInputs({ basisFraction: 0.4, horizonYears: 6 })
  const ref = referenceFor(market, inputs)

  it('the reference sells in years 4 and 5 only, and stays solvent', () => {
    expect(ref.broken).toBe(false)
    expect(Math.floor(ref.firstCallMonth / 12)).toBe(4)
    ref.forcedSaleSold.forEach((x, y) => (y >= 4 ? expect(x).toBeGreaterThan(50_000) : expect(x).toBe(0)))
  })

  it('borrowing is still spending less Social Security in real terms', () => {
    expectCents(ref.borrowed, [60_000, 60_000, 36_000, 36_000, 36_000, 36_000])
  })

  it('the nominal loan identity holds to the cent; under inflation the real one does not (erosion)', () => {
    const n = ref.nominal
    let prevNominal = 0
    let prevReal = 0
    for (let y = 0; y < n.loanEnd.length; y++) {
      expect(n.loanEnd[y]).toBeCloseTo(prevNominal + n.borrowed[y] + n.interest[y] - n.repaid[y], 2)
      expect(ref.loanEnd[y]).toBeCloseTo(n.loanEnd[y] / ref.priceEnd[y], 6)
      // Real flows are deflated by each month's price level, the year-end loan by December's: inflation
      // erodes the real balance, so the real "identity" overstates the year-end loan.
      const realSum = prevReal + ref.borrowed[y] + ref.interest[y] - ref.repaid[y]
      expect(realSum - ref.loanEnd[y]).toBeGreaterThan(0.01)
      prevNominal = n.loanEnd[y]
      prevReal = ref.loanEnd[y]
    }
  })

  it('the engine\'s loan band median matches the reference\'s real year-end loan, and the path is bruised', () => {
    const res = simulate(market, CITIES_FIX, inputs)
    expectCents(res.loan.p50.slice(1), ref.loanEnd)
    expect(res.bruisedRate).toBe(1)
    expect(res.marginCallByYear[4]).toBe(1)
  })

  it('simulate(...).yearly equals the reference to the cent, forced sales included', () => {
    const res = simulate(market, CITIES_FIX, inputs)
    const yearly = yearlyOf(res)
    expect(yearly, 'SimulationResult.yearly (stage 1 contract)').toBeDefined()
    expectCents(yearly.borrowed, ref.borrowed)
    expectCents(yearly.interest, ref.interest)
    expectCents(yearly.forcedSaleSold, ref.forcedSaleSold)
  })
})
