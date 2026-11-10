import { describe, expect, it, vi } from 'vitest'

// atlasData and cards.tsx import the store, the sim client and the FX store, which touch `window`.
vi.mock('../../state/store', () => ({ useStore: () => undefined }))
vi.mock('../../state/sim', () => ({}))
vi.mock('../../state/fx', () => ({ useFx: () => undefined, useRate: () => 1 }))
import marketJson from '../../data/market.json'
import { CITIES, CITY_BY_ID } from '../../data/cities'
import { runAtlas } from '../../engine/atlas'
import { amountsTotal, BUDGET_CATEGORIES, categoryRatios, destinationAmounts, destinationSpend } from '../../engine/cost'
import { DEFAULT_INPUTS } from '../../engine/defaults'
import { simulate } from '../../engine/simulate'
import type { MarketData, PlanInputs } from '../../engine/types'
import { cityCosts } from '../atlas/atlasData'
import { categoryCompare } from '../atlas/picks'
import { costRows } from '../outlook/cards'
import { firstYearSpend } from '../plan/existingLoan'
import { planCardSpend } from '../plan/planCardSpend'

const market = marketJson as unknown as MarketData
const HOME = CITY_BY_ID['st-louis']
const DEST = CITY_BY_ID['lisbon']
const OTHER = CITY_BY_ID['bangkok']

// A `$` (Lisbon groceries) and a `%` (dining, every city) typed at premium 0.1, now priced at 0.7.
// Both rows are cheaper in Lisbon and Bangkok than in St. Louis, so the premium moves them.
const inputs: PlanInputs = {
  ...DEFAULT_INPUTS,
  homeCityId: HOME.id,
  destCityId: DEST.id,
  moveInYears: 0,
  retireInYears: 0,
  paths: 200,
  expatFactor: 0.7,
  ratioOverrides: { dining: 0.5 },
  ratioOverrideAt: { dining: 0.1 },
  amountOverrides: { [DEST.id]: { groceries: 4_000 }, [OTHER.id]: { housing: 6_000 } },
  amountOverrideAt: { [DEST.id]: { groceries: 0.1 }, [OTHER.id]: { housing: 0.1 } },
}

describe('every view prices destination spending through destinationSpend', () => {
  const ds = destinationSpend(inputs, HOME, DEST)
  const total = amountsTotal(ds.amounts)

  it('the plan really scales: typed values moved with the premium', () => {
    // Unscaled (typed as is) would be 4,000 for groceries and 0.5 × home for dining.
    const unscaled = destinationAmounts(inputs.budget, categoryRatios(HOME, DEST, inputs.expatFactor, inputs.ratioOverrides), inputs.amountOverrides![DEST.id])
    expect(ds.amounts.groceries).toBeGreaterThan(4_000)
    expect(ds.amounts.dining).toBeGreaterThan(inputs.budget.dining * 0.5)
    expect(amountsTotal(unscaled)).not.toBeCloseTo(total, 2)
  })

  it('simulation, Atlas odds, picks, Outlook cost card, existing-loan check and plan card all agree', () => {
    const r = simulate(market, CITIES, inputs)
    expect(r.categoryAmounts).toEqual(ds.amounts)
    expect(r.spendDest).toBeCloseTo(total, 6)

    // Atlas: the ranking's spend (and odds) for the destination, and the per-city cost rows.
    const atlas = runAtlas(market, CITIES, inputs, [DEST.id, OTHER.id])
    const lis = atlas.find((e) => e.cityId === DEST.id)!
    expect(lis.spendUsd).toBeCloseTo(total, 6)
    expect(lis.successRate).toBe(r.successRate)
    expect(cityCosts(inputs, DEST)).toEqual(ds.amounts)

    // Picks / profile spending rows (rows with nothing at home or here are left out).
    const rows = categoryCompare(inputs, DEST)
    for (const row of rows) {
      expect(row.here).toBe(ds.amounts[row.cat])
      expect(row.override).toBe(ds.override[row.cat])
    }
    expect(rows.find((x) => x.cat === 'groceries')!.ratio).toBeCloseTo(ds.amounts.groceries / inputs.budget.groceries, 9)
    expect(rows.find((x) => x.cat === 'dining')!.ratio).toBe(ds.ratios.dining)

    // Existing-loan check: first-year draw (retired, moving now) less other income.
    const income = inputs.incomeStartAge <= inputs.age ? Math.max(0, inputs.otherIncome) : 0
    expect(firstYearSpend(inputs, HOME, DEST)).toBeCloseTo(Math.max(0, total - income), 6)

    // Outlook cost card.
    const cost = costRows(r, inputs.budget)
    for (const row of cost) expect(row.dest).toBe(ds.amounts[row.c])
    expect(cost.find((x) => x.c === 'groceries')!.ratio).toBeCloseTo(ds.amounts.groceries / inputs.budget.groceries, 9)

    // Plan card.
    const card = planCardSpend(inputs, HOME, DEST)
    expect(card.amounts).toEqual(ds.amounts)
    expect(card.destTotal).toBeCloseTo(total, 9)
  })

  it('another Atlas city gets its own scaled values', () => {
    const other = destinationSpend(inputs, HOME, OTHER)
    // Its own $ (housing) scaled from its anchor; Lisbon's groceries $ isn't its; the % scaled by
    // its own model ratio.
    expect(other.override.housing).toBe('amount')
    expect(other.amounts.housing).toBeGreaterThan(6_000)
    expect(other.override.groceries).toBeNull()
    expect(other.amounts.groceries).toBeCloseTo(inputs.budget.groceries * other.model.groceries, 9)
    expect(other.ratios.dining).toBeGreaterThan(0.5)
    expect(other.ratios.dining).not.toBeCloseTo(ds.ratios.dining, 6)

    expect(cityCosts(inputs, OTHER)).toEqual(other.amounts)
    for (const row of categoryCompare(inputs, OTHER)) expect(row.here).toBe(other.amounts[row.cat])
    const atlas = runAtlas(market, CITIES, inputs, [OTHER.id])
    expect(atlas[0].spendUsd).toBeCloseTo(amountsTotal(other.amounts), 6)
    const r = simulate(market, CITIES, { ...inputs, destCityId: OTHER.id })
    expect(r.categoryAmounts).toEqual(other.amounts)
    expect(firstYearSpend({ ...inputs, destCityId: OTHER.id }, HOME, OTHER)).toBeGreaterThan(0)
    for (const c of BUDGET_CATEGORIES) expect(planCardSpend(inputs, HOME, OTHER).amounts[c]).toBe(other.amounts[c])
  })
})
