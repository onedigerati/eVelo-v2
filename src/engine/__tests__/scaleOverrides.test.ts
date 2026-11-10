import { describe, expect, it } from 'vitest'
import marketJson from '../../data/market.json'
import { CITY_BY_ID } from '../../data/cities'
import { amountsTotal, BUDGET_CATEGORIES, categoryRatios, destinationSpend, premiumMovesTyped, scaleTyped, type SpendInputs } from '../cost'
import { DEFAULT_INPUTS } from '../defaults'
import { simulate } from '../simulate'
import type { Budget, City, MarketData, PlanInputs } from '../types'
import { CITIES_FIX } from './fixtures'

const market = marketJson as unknown as MarketData

// Hand-built cities with exact ratios against HOME (every index 100, healthcare 1).
const base = { region: 'Europe' as const, lat: 0, lon: 0, notes: [], currency: 'USD', fxVol: 0, healthcare: 1 }
const city = (id: string, rent: number): City => ({
  ...base, id, name: id, country: 'X', countryCode: 'XX', idx: { col: 100, rent, groceries: 100, restaurants: 100 },
})
const HOME = city('home', 100)
const HALF = city('half', 50) // housing raw ratio 0.5
const QUARTER = city('quarter', 25) // housing raw ratio 0.25
const PRICEY = city('pricey', 200) // housing raw ratio 2 (premium doesn't touch it)
const FREE = city('free', 0) // housing raw ratio 0

const budget: Budget = { ...DEFAULT_INPUTS.budget, housing: 20000, travel: 6000 }
const model = (r: number, e: number) => (r < 1 ? r + (1 - r) * e : r)
const plan = (o: Partial<SpendInputs>): SpendInputs => ({ budget, expatFactor: 0.35, ...o })

describe('scaleTyped', () => {
  it('is exact when the model has not moved, scales by mNow/mAt, and caps at max(cap, typed)', () => {
    expect(scaleTyped(9000, 0.6, 0.6, 20000)).toBe(9000)
    expect(scaleTyped(9000, 0.8, 0.6, 20000)).toBeCloseTo(12000, 9)
    expect(scaleTyped(15000, 1, 0.5, 20000)).toBe(20000)
    expect(scaleTyped(25000, 1, 0.5, 20000)).toBe(25000) // typed above home: capped at typed
    expect(scaleTyped(9000, 0.3, 0.6, 20000)).toBeCloseTo(4500, 9) // scales down too
  })

  it('returns typed (finite) when the anchor model ratio is 0 or not finite', () => {
    for (const mAt of [0, -1, NaN, Infinity]) {
      const v = scaleTyped(5000, 0.7, mAt, 20000)
      expect(v).toBe(5000)
      expect(Number.isFinite(v)).toBe(true)
    }
  })
})

describe('destinationSpend: typed $ scales with the premium', () => {
  const typed = { half: { housing: 9000 } }
  const at = { half: { housing: 0.2 } }

  it('reads exactly as typed at e0, scales at e, and is exact again back at e0', () => {
    const at0 = destinationSpend(plan({ expatFactor: 0.2, amountOverrides: typed, amountOverrideAt: at }), HOME, HALF)
    expect(at0.amounts.housing).toBe(9000)
    expect(at0.override.housing).toBe('amount')
    for (const e of [0, 0.35, 0.6, 1]) {
      const s = destinationSpend(plan({ expatFactor: e, amountOverrides: typed, amountOverrideAt: at }), HOME, HALF)
      const want = Math.min((9000 * model(0.5, e)) / model(0.5, 0.2), Math.max(20000, 9000))
      expect(s.amounts.housing).toBeCloseTo(want, 9)
      expect(s.model.housing).toBeCloseTo(model(0.5, e), 12)
    }
    expect(destinationSpend(plan({ expatFactor: 0.6, amountOverrides: typed, amountOverrideAt: at }), HOME, HALF).amounts.housing)
      .toBeCloseTo(12000, 9)
    const back = destinationSpend(plan({ expatFactor: 0.2, amountOverrides: typed, amountOverrideAt: at }), HOME, HALF)
    expect(back.amounts.housing).toBe(9000)
  })

  it('caps at max(home amount, typed)', () => {
    // 15000 typed at e0 = 0 (model 0.5) would double to 30000 at e = 1; home is 20000.
    const o = { amountOverrides: { half: { housing: 15000 } }, amountOverrideAt: { half: { housing: 0 } } }
    expect(destinationSpend(plan({ ...o, expatFactor: 1 }), HOME, HALF).amounts.housing).toBe(20000)
    // Typed above home: capped at the typed value, never above it.
    const hi = { amountOverrides: { half: { housing: 26000 } }, amountOverrideAt: { half: { housing: 0 } } }
    expect(destinationSpend(plan({ ...hi, expatFactor: 1 }), HOME, HALF).amounts.housing).toBe(26000)
    expect(destinationSpend(plan({ ...hi, expatFactor: 0 }), HOME, HALF).amounts.housing).toBe(26000)
  })

  it('applies only to its own city', () => {
    const s = destinationSpend(plan({ expatFactor: 0.6, amountOverrides: typed, amountOverrideAt: at }), HOME, QUARTER)
    expect(s.override.housing).toBeNull()
    expect(s.amounts.housing).toBeCloseTo(20000 * model(0.25, 0.6), 9)
  })

  it('changing the home budget does not move a $ (cap not binding)', () => {
    for (const e of [0.2, 0.6, 1]) {
      const vals = [16000, 20000, 60000].map(
        (h) =>
          destinationSpend(
            { budget: { ...budget, housing: h }, expatFactor: e, amountOverrides: typed, amountOverrideAt: at },
            HOME,
            HALF,
          ).amounts.housing,
      )
      expect(vals[1]).toBe(vals[0])
      expect(vals[2]).toBe(vals[0])
    }
  })
})

describe('destinationSpend: typed % scales per city', () => {
  const o = { ratioOverrides: { housing: 0.4 }, ratioOverrideAt: { housing: 0 } }

  it('reads as typed at e0 in every city', () => {
    for (const d of [HALF, QUARTER]) {
      const s = destinationSpend(plan({ ...o, expatFactor: 0 }), HOME, d)
      expect(s.ratios.housing).toBe(0.4)
      expect(s.amounts.housing).toBeCloseTo(20000 * 0.4, 9)
      expect(s.override.housing).toBe('ratio')
    }
  })

  it('each city scales by its own model ratio', () => {
    const half = destinationSpend(plan({ ...o, expatFactor: 0.2 }), HOME, HALF)
    const quarter = destinationSpend(plan({ ...o, expatFactor: 0.2 }), HOME, QUARTER)
    expect(half.ratios.housing).toBeCloseTo((0.4 * 0.6) / 0.5, 12) // 0.48
    expect(quarter.ratios.housing).toBeCloseTo((0.4 * 0.4) / 0.25, 12) // 0.64
    expect(half.amounts.housing).toBeCloseTo(20000 * half.ratios.housing, 9)
    expect(quarter.amounts.housing).toBeCloseTo(20000 * quarter.ratios.housing, 9)
  })

  it('caps at max(1, typed) and returns exactly to typed at e0', () => {
    expect(destinationSpend(plan({ ...o, expatFactor: 1 }), HOME, QUARTER).ratios.housing).toBe(1) // 0.4 × 4 → 1
    const hi = { ratioOverrides: { housing: 1.3 }, ratioOverrideAt: { housing: 0 } }
    expect(destinationSpend(plan({ ...hi, expatFactor: 1 }), HOME, QUARTER).ratios.housing).toBe(1.3)
    expect(destinationSpend(plan({ ...o, expatFactor: 0 }), HOME, QUARTER).ratios.housing).toBe(0.4)
  })

  it('real Atlas cities each scale by their own model ratio', () => {
    const home = CITY_BY_ID['st-louis']
    const dests = ['bangkok', 'lisbon', 'mexico-city', 'zurich', 'medellin'].map((id) => CITY_BY_ID[id]).filter(Boolean)
    expect(dests.length).toBeGreaterThanOrEqual(3)
    const typed = { housing: 0.5, dining: 0.7 }
    const anchors = { housing: 0.1, dining: 0.1 }
    const seen = new Set<number>()
    for (const d of dests) {
      const m0 = categoryRatios(home, d, 0.1)
      const m1 = categoryRatios(home, d, 0.7)
      const s = destinationSpend(
        { budget, expatFactor: 0.7, ratioOverrides: typed, ratioOverrideAt: anchors },
        home,
        d,
      )
      for (const c of ['housing', 'dining'] as const) {
        const want = m0[c] > 0 ? Math.min((typed[c] * m1[c]) / m0[c], Math.max(1, typed[c])) : typed[c]
        expect(s.ratios[c]).toBeCloseTo(want, 12)
      }
      seen.add(Math.round(s.ratios.housing * 1e6))
    }
    expect(seen.size).toBeGreaterThan(1) // not one shared scale
  })
})

describe('destinationSpend: rows the premium does not touch, zero ratio, missing anchors', () => {
  it('raw ratio ≥ 1 and Travel do not move with the slider', () => {
    const o = {
      ratioOverrides: { housing: 0.8, travel: 0.5 },
      ratioOverrideAt: { housing: 0, travel: 0 },
      amountOverrides: { pricey: { housing: 30000, travel: 4000 } },
      amountOverrideAt: { pricey: { housing: 0, travel: 0 } },
    }
    for (const e of [0, 0.5, 1]) {
      const p = destinationSpend(plan({ ...o, expatFactor: e }), HOME, PRICEY)
      expect(p.amounts.housing).toBe(30000)
      expect(p.amounts.travel).toBe(4000)
      const h = destinationSpend(plan({ ...o, expatFactor: e }), HOME, HALF)
      expect(h.ratios.travel).toBe(0.5)
      expect(h.amounts.travel).toBeCloseTo(6000 * 0.5, 9)
      const q = destinationSpend(plan({ ...o, ratioOverrides: { housing: 0.8 }, expatFactor: e }), HOME, PRICEY)
      expect(q.ratios.housing).toBe(0.8)
    }
  })

  it('a model ratio of 0 at e0 does not divide by zero', () => {
    const o = {
      ratioOverrides: { housing: 0.3 },
      ratioOverrideAt: { housing: 0 },
      amountOverrides: { free: { housing: 5000 } },
      amountOverrideAt: { free: { housing: 0 } },
    }
    for (const e of [0, 0.5, 1]) {
      const s = destinationSpend(plan({ ...o, expatFactor: e }), HOME, FREE)
      expect(s.amounts.housing).toBe(5000)
      expect(s.ratios.housing).toBe(0.3)
      for (const c of BUDGET_CATEGORIES) expect(Number.isFinite(s.amounts[c])).toBe(true)
    }
  })

  it('a missing anchor means no scaling', () => {
    const o = { ratioOverrides: { housing: 0.4 }, amountOverrides: { half: { dining: 7000 } } }
    for (const e of [0, 0.35, 1]) {
      const h = destinationSpend(plan({ ...o, expatFactor: e }), HOME, HALF)
      const q = destinationSpend(plan({ ...o, expatFactor: e }), HOME, QUARTER)
      expect(h.ratios.housing).toBe(0.4)
      expect(q.ratios.housing).toBe(0.4)
      expect(h.amounts.dining).toBe(7000)
    }
    // An anchor map for another category or city doesn't anchor this one.
    const other = { ...o, ratioOverrideAt: { dining: 0 }, amountOverrideAt: { quarter: { dining: 0 } } }
    const s = destinationSpend(plan({ ...other, expatFactor: 1 }), HOME, HALF)
    expect(s.ratios.housing).toBe(0.4)
    expect(s.amounts.dining).toBe(7000)
  })

  it('with no overrides it matches categoryRatios × budget', () => {
    const s = destinationSpend(plan({ expatFactor: 0.35 }), HOME, QUARTER)
    const r = categoryRatios(HOME, QUARTER, 0.35)
    expect(s.ratios).toEqual(r)
    expect(s.model).toEqual(r)
    for (const c of BUDGET_CATEGORIES) expect(s.amounts[c]).toBeCloseTo((budget[c] || 0) * r[c], 9)
  })
})

describe('premiumMovesTyped: can the premium move a typed row', () => {
  it('yes below home prices with an anchor whose model ratio is > 0', () => {
    expect(premiumMovesTyped(0.5, 0.35)).toBe(true)
    expect(premiumMovesTyped(0.5, 0)).toBe(true)
    expect(premiumMovesTyped(0, 0.2)).toBe(true) // model 0.2 at the anchor
    expect(premiumMovesTyped(0.99, 1)).toBe(true)
  })

  it('no at or above home prices (Travel is always 1), with a non-finite anchor, or a 0 model at the anchor', () => {
    expect(premiumMovesTyped(1, 0.35)).toBe(false)
    expect(premiumMovesTyped(2, 0)).toBe(false)
    expect(premiumMovesTyped(0.5, NaN)).toBe(false)
    expect(premiumMovesTyped(0, 0)).toBe(false)
    expect(premiumMovesTyped(NaN, 0.35)).toBe(false)
  })

  it('agrees with destinationSpend: a row flagged `scales` moves with the slider, an unflagged one does not', () => {
    const o = {
      ratioOverrides: { housing: 0.4, travel: 0.5, dining: 0.9 },
      ratioOverrideAt: { housing: 0.35, travel: 0.35 },
      amountOverrides: { half: { groceries: 1000 }, pricey: { housing: 30000 }, free: { housing: 5000 } },
      amountOverrideAt: { half: { groceries: 0.35 }, pricey: { housing: 0.35 }, free: { housing: 0 } },
    }
    for (const dest of [HALF, PRICEY, FREE, QUARTER]) {
      const a = destinationSpend(plan({ ...o, expatFactor: 0.35 }), HOME, dest)
      const b = destinationSpend(plan({ ...o, expatFactor: 0.9 }), HOME, dest)
      for (const c of BUDGET_CATEGORIES) {
        if (!a.override[c]) expect(a.scales[c]).toBe(false)
        else if (!a.scales[c]) expect(b.amounts[c]).toBeCloseTo(a.amounts[c], 9)
        else expect(b.amounts[c]).not.toBeCloseTo(a.amounts[c], 6)
      }
    }
    const h = destinationSpend(plan({ ...o, expatFactor: 0.35 }), HOME, HALF)
    expect(h.scales.housing).toBe(true) // typed %, raw 0.5
    expect(h.scales.groceries).toBe(false) // typed $, but groceries raw ratio is 1 here
    expect(h.scales.travel).toBe(false)
    expect(h.scales.dining).toBe(false) // dining raw ratio is 1 here
    expect(destinationSpend(plan(o), HOME, QUARTER).scales.housing).toBe(true)
    expect(destinationSpend(plan({ ...o, expatFactor: 0.9 }), HOME, HALF).amounts.housing).not.toBeCloseTo(h.amounts.housing, 3)
    expect(destinationSpend(plan(o), HOME, PRICEY).scales.housing).toBe(false)
    expect(destinationSpend(plan(o), HOME, FREE).scales.housing).toBe(false) // model 0 at anchor 0
  })
})

describe('simulate uses destinationSpend', () => {
  it('destination spending equals amountsTotal(destinationSpend(...).amounts) with anchored overrides at a moved premium', () => {
    const inputs: PlanInputs = {
      ...DEFAULT_INPUTS,
      homeCityId: 'st-louis',
      destCityId: 'bangkok',
      paths: 200,
      expatFactor: 0.8,
      ratioOverrides: { dining: 0.3 },
      ratioOverrideAt: { dining: 0.1 },
      amountOverrides: { bangkok: { housing: 6000 } },
      amountOverrideAt: { bangkok: { housing: 0.1 } },
    }
    const home = CITIES_FIX.find((c) => c.id === 'st-louis')!
    const dest = CITIES_FIX.find((c) => c.id === 'bangkok')!
    const ds = destinationSpend(inputs, home, dest)
    const r = simulate(market, CITIES_FIX, inputs)
    expect(r.spendDest).toBeCloseTo(amountsTotal(ds.amounts), 6)
    expect(r.categoryAmounts).toEqual(ds.amounts)
    expect(r.categoryRatios).toEqual(ds.ratios)
    // The premium really moved the typed values.
    expect(ds.amounts.housing).toBeGreaterThan(6000)
    expect(ds.ratios.dining).toBeGreaterThan(0.3)
  })
})
