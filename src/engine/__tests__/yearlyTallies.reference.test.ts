// Stage 1 (eVelo yearly tallies): a hand-worked eVelo path against the scalar reference
// (evReference.ts), and simulate(...).yearly against both. A constant market (every month the same
// return and inflation) makes every bootstrap path identical, so with paths: 1 the median is the path.
import { describe, expect, it } from 'vitest'
import { DEFAULT_INPUTS } from '../defaults'
import { prepare } from '../prepare'
import { makeScenarios, normalizeInputs, simulate } from '../simulate'
import type { City, MarketData, PlanInputs, SimulationResult } from '../types'
import { evReference, type EvRefInputs, type EvRefYears } from './evReference'
import { CITIES_FIX, STL } from './fixtures'

/** St. Louis's costs with a flat 1% wealth tax on net worth, charged from year 0 (a taxed home). */
const TAXED_HOME: City = {
  ...STL,
  id: 'taxed-home',
  localTax: { wealth: { base: 'net', bands: [{ from: 0, rate: 0.01 }] }, note: 'test', sources: [] },
}
const CITIES_TAX = [...CITIES_FIX, TAXED_HOME]

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
function referenceFor(market: MarketData, inputs: PlanInputs, wealthTaxRate?: number): EvRefYears {
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
    wealthTaxRate,
  }
  return evReference(ref)
}

const expectCents = (got: number[], want: number[]) => {
  expect(got).toHaveLength(want.length)
  want.forEach((w, i) => expect(got[i], `year ${i}`).toBeCloseTo(w, 2))
}

/** Every field of simulate(...).yearly against the reference, to the cent. */
function expectYearly(res: SimulationResult, ref: EvRefYears) {
  expectCents(res.yearly.borrowed, ref.borrowed)
  expectCents(res.yearly.interest, ref.interest)
  expectCents(res.yearly.forcedSaleSold, ref.forcedSaleSold)
  expectCents(res.yearly.repaid, ref.repaid)
  expectCents(res.yearly.wealthTax, ref.wealthTax)
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

  it('simulate(...).yearly.repaid equals the reference when Social Security exceeds spending', () => {
    const inp = planInputs({ otherIncome: 84_000 })
    const r = referenceFor(market, inp)
    expect(r.repaid[2]).toBeGreaterThan(0)
    expectYearly(simulate(market, CITIES_FIX, inp), r)
  })

  it('a surplus larger than the loan repays only the loan; the rest is reinvested, not counted', () => {
    // $200k/yr Social Security from month 24: the loan is cleared within year 2, then repaid is 0.
    const inp = planInputs({ otherIncome: 200_000 })
    const r = referenceFor(market, inp)
    expect(r.loanEnd[2]).toBe(0)
    expect(r.repaid[2]).toBeCloseTo(r.loanEnd[1] + r.interest[2], 2)
    expect(r.repaid[3]).toBe(0)
    expectYearly(simulate(market, CITIES_FIX, inp), r)
  })

  it('the engine\'s loan band median (index y + 1 = end of year y, real) is the reference\'s year-end loan', () => {
    const res = simulate(market, CITIES_FIX, inputs)
    expectCents(res.loan.p50.slice(1), ref.loanEnd)
    expect(res.successRate).toBe(1)
  })

  it('simulate(...).yearly equals the reference to the cent', () => {
    expectYearly(simulate(market, CITIES_FIX, inputs), ref)
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
    expectYearly(simulate(market, CITIES_FIX, inputs), ref)
  })
})

describe('eVelo yearly tallies: forced-sale repayments', () => {
  // The stressed path with a low cost basis (10%), so the sales realize gains: in the sale years,
  // repaid is the proceeds after capital-gains tax, more than zero and less than what was sold.
  const market = constantMarket(-0.015, 0.002)
  const inputs = planInputs({ basisFraction: 0.1, horizonYears: 6 })
  const ref = referenceFor(market, inputs)

  it('the proceeds after tax repay the loan in the sale years, and match the engine', () => {
    for (const y of [4, 5]) {
      expect(ref.repaid[y]).toBeGreaterThan(0)
      expect(ref.repaid[y]).toBeLessThan(ref.forcedSaleSold[y])
    }
    expectCents(ref.repaid.slice(0, 4), [0, 0, 0, 0])
    expectCents(simulate(market, CITIES_FIX, inputs).yearly.repaid, ref.repaid)
  })
})

describe('eVelo yearly tallies: a wealth tax added to the loan', () => {
  // A taxed home: 1% of real net worth each year-end, borrowed. CPI +0.2% a month, SPY +0.5%.
  const market = constantMarket(0.005, 0.002)
  const inputs = planInputs({ homeCityId: TAXED_HOME.id, horizonYears: 5 })
  const ref = referenceFor(market, inputs, 0.01)

  it('every year adds about 1% of net worth, and the nominal loan identity holds with it', () => {
    ref.wealthTax.forEach((w) => expect(w).toBeGreaterThan(5_000))
    const n = ref.nominal
    let prev = 0
    for (let y = 0; y < n.loanEnd.length; y++) {
      expect(n.loanEnd[y]).toBeCloseTo(prev + n.borrowed[y] + n.interest[y] + n.wealthTax[y] - n.repaid[y], 2)
      prev = n.loanEnd[y]
    }
  })

  it('simulate(...).yearly equals the reference to the cent, wealth tax included and not in borrowed', () => {
    const res = simulate(market, CITIES_TAX, inputs)
    expectCents(res.loan.p50.slice(1), ref.loanEnd)
    expectYearly(res, ref)
    expectCents(res.yearly.borrowed, [60_000, 60_000, 36_000, 36_000, 36_000])
  })
})

describe('eVelo yearly tallies: a path that breaks mid-horizon', () => {
  // SPY −3% a month: margin calls until a sale can no longer reach the target and the lender
  // liquidates, in month 57 (year 4, its tenth month).
  const market = constantMarket(-0.03, 0)
  const inputs = planInputs({ horizonYears: 8 })
  const ref = referenceFor(market, inputs)
  const breakYear = Math.floor(ref.breakMonth / 12)

  it('the reference breaks inside the horizon, not at a year boundary', () => {
    expect(ref.broken).toBe(true)
    expect(ref.breakMonth).toBe(57)
  })

  it('the break month\'s borrowing and interest count; nothing after it does', () => {
    // Retired at 65, Social Security from month 24: need is $5,000 a month before, $3,000 after.
    let want = 0
    for (let t = breakYear * 12; t <= ref.breakMonth; t++) want += t < 24 ? 5000 : 3000
    expect(ref.borrowed[breakYear]).toBeCloseTo(want, 2)
    expect(ref.interest[breakYear]).toBeGreaterThan(0)
    for (let y = breakYear + 1; y < 8; y++) {
      expect(ref.borrowed[y]).toBe(0)
      expect(ref.interest[y]).toBe(0)
      expect(ref.forcedSaleSold[y]).toBe(0)
      expect(ref.repaid[y]).toBe(0)
    }
  })

  it('the kernel agrees: simulate(...).yearly equals the reference, and the path is broken', () => {
    const res = simulate(market, CITIES_FIX, inputs)
    expect(res.brokenRate).toBe(1)
    expectYearly(res, ref)
  })
})
