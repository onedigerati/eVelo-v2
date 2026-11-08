import { describe, expect, it } from 'vitest'
import marketJson from '../../data/market.json'
import { runAtlas } from '../atlas'
import { amountsTotal, applyRatios, BUDGET_CATEGORIES, categoryRatios, destinationAmounts } from '../cost'
import { DEFAULT_INPUTS } from '../defaults'
import { findCity, resolveDestination, simulate } from '../simulate'
import { solveSpending } from '../solve'
import type { MarketData, PlanInputs } from '../types'
import { BKK, CITIES_FIX, STL } from './fixtures'

const market = marketJson as unknown as MarketData
const withInputs = (o: Partial<PlanInputs>): PlanInputs => ({ ...DEFAULT_INPUTS, homeCityId: 'st-louis', ...o })

describe('destinationAmounts', () => {
  it('a fixed amount replaces budget × ratio regardless of home budget and expat factor', () => {
    for (const expat of [0, 0.35, 1]) {
      for (const scale of [0.5, 1, 3]) {
        const budget = { ...DEFAULT_INPUTS.budget, housing: DEFAULT_INPUTS.budget.housing * scale }
        const ratios = categoryRatios(STL, BKK, expat, { housing: 0.2 })
        const a = destinationAmounts(budget, ratios, { housing: 18000 })
        expect(a.housing).toBe(18000)
      }
    }
  })

  it('ratio overrides and untouched rows are unchanged', () => {
    const budget = DEFAULT_INPUTS.budget
    const ratios = categoryRatios(STL, BKK, 0.35, { dining: 0.5 })
    const a = destinationAmounts(budget, ratios, { housing: 18000 })
    expect(a.dining).toBeCloseTo(budget.dining * 0.5, 9)
    for (const c of BUDGET_CATEGORIES) if (c !== 'housing') expect(a[c]).toBeCloseTo(budget[c] * ratios[c], 9)
    // Without fixed amounts the total matches applyRatios exactly.
    expect(amountsTotal(destinationAmounts(budget, ratios))).toBeCloseTo(applyRatios(budget, ratios), 6)
  })

  it('a $0 home category can carry a fixed amount', () => {
    const budget = { ...DEFAULT_INPUTS.budget, travel: 0 }
    const ratios = categoryRatios(STL, BKK, 0.35)
    expect(destinationAmounts(budget, ratios).travel).toBe(0)
    expect(destinationAmounts(budget, ratios, { travel: 5000 }).travel).toBe(5000)
  })

  it('ignores non-finite and negative fixed amounts; accepts 0', () => {
    const budget = DEFAULT_INPUTS.budget
    const ratios = categoryRatios(STL, BKK, 0.35)
    const a = destinationAmounts(budget, ratios, { housing: NaN, dining: -1, groceries: Infinity, transport: 0 })
    expect(a.housing).toBeCloseTo(budget.housing * ratios.housing, 9)
    expect(a.dining).toBeCloseTo(budget.dining * ratios.dining, 9)
    expect(a.groceries).toBeCloseTo(budget.groceries * ratios.groceries, 9)
    expect(a.transport).toBe(0)
  })
})

describe('fixed amounts through the engine', () => {
  const fixed = { bangkok: { housing: 40000 } }
  const inp = withInputs({ destCityId: 'bangkok', paths: 1000, amountOverrides: fixed })
  const plain = withInputs({ destCityId: 'bangkok', paths: 1000 })

  it('resolveDestination uses only the destination city’s own amounts', () => {
    const home = findCity(CITIES_FIX, 'st-louis')
    const bkk = resolveDestination(inp, home, findCity(CITIES_FIX, 'bangkok'))
    const zrh = resolveDestination(inp, home, findCity(CITIES_FIX, 'zurich'))
    const zrhPlain = resolveDestination(plain, home, findCity(CITIES_FIX, 'zurich'))
    expect(bkk.amounts!.housing).toBe(40000)
    expect(bkk.annual).toBeCloseTo(amountsTotal(bkk.amounts!), 9)
    expect(zrh).toEqual(zrhPlain)
    expect(resolveDestination(inp, home, home).amounts).toBeNull()
  })

  it('simulate reports categoryAmounts and spendDest from the fixed amount', () => {
    const r = simulate(market, CITIES_FIX, inp)
    const p = simulate(market, CITIES_FIX, plain)
    expect(r.categoryAmounts!.housing).toBe(40000)
    expect(r.spendDest).toBeCloseTo(amountsTotal(r.categoryAmounts!), 6)
    expect(r.spendDest! - p.spendDest!).toBeCloseTo(40000 - p.categoryAmounts!.housing, 6)
    expect(r.categoryRatios).toEqual(p.categoryRatios)
    // Pricier Bangkok housing can only lower the odds.
    expect(r.successRate).toBeLessThanOrEqual(p.successRate)
    expect(simulate(market, CITIES_FIX, { ...inp, destCityId: null }).categoryAmounts).toBeNull()
  })

  it('the home budget does not move a fixed amount', () => {
    const rich = simulate(market, CITIES_FIX, { ...inp, budget: { ...inp.budget, housing: 90000 } })
    expect(rich.categoryAmounts!.housing).toBe(40000)
  })

  it('atlas: an override keyed to Bangkok changes Bangkok’s row only', () => {
    const ids = ['st-louis', 'bangkok', 'zurich']
    const a = runAtlas(market, CITIES_FIX, inp, ids)
    const b = runAtlas(market, CITIES_FIX, plain, ids)
    const row = (xs: typeof a, id: string) => xs.find((x) => x.cityId === id)!
    expect(row(a, 'bangkok').spendUsd).toBeCloseTo(simulate(market, CITIES_FIX, inp).spendDest!, 6)
    expect(row(a, 'bangkok').spendUsd).not.toBeCloseTo(row(b, 'bangkok').spendUsd, 0)
    expect(row(a, 'zurich')).toEqual(row(b, 'zurich'))
    expect(row(a, 'st-louis')).toEqual(row(b, 'st-louis'))
    expect(row(a, 'bangkok').successRate).toBe(simulate(market, CITIES_FIX, inp).successRate)
  })

  it('solver: maxSpendDest scales the fixed-amount annual', () => {
    const s = solveSpending(market, CITIES_FIX, inp, 0.85)
    const annual = simulate(market, CITIES_FIX, inp).spendDest!
    const homeTotal = Object.values(inp.budget).reduce((x, y) => x + y, 0)
    expect(s.maxSpendHome).toBeGreaterThan(0)
    expect(s.maxSpendDest! / s.maxSpendHome).toBeCloseTo(annual / homeTotal, 9)
    // The fixed amount changes the solved lifestyle (pricier housing → smaller multiplier).
    const p = solveSpending(market, CITIES_FIX, plain, 0.85)
    expect(s.maxSpendHome).toBeLessThanOrEqual(p.maxSpendHome)
    // An override for another city leaves the solve unchanged.
    const other = solveSpending(market, CITIES_FIX, { ...plain, amountOverrides: { zurich: { housing: 99000 } } }, 0.85)
    expect(other).toEqual(solveSpending(market, CITIES_FIX, plain, 0.85))
  })
})
