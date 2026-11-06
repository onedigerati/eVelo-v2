import { describe, expect, it } from 'vitest'
import { CITIES, CITY_BY_ID } from '../../../data/cities'
import { EXPAT_PICKS } from '../../../data/expatPicks'
import { categoryRatios } from '../../../engine/cost'
import { DEFAULT_INPUTS } from '../../../engine/defaults'
import {
  categoryCompare,
  costDataLine,
  isProfiled,
  longDate,
  monthYear,
  oddsVsHome,
  pickViews,
  scoreLabel,
  verifiedLabel,
  type PickRow,
} from '../picks'

const row = (cityId: string, successRate: number, rank: number): PickRow => ({
  cityId,
  successRate,
  spendUsd: 50_000,
  costRatio: 0.7,
  city: CITY_BY_ID[cityId],
  rank,
})

describe('pickViews', () => {
  it('joins every pick to its city and ranking row, in pick order', () => {
    const rows = [row('lisbon', 0.82, 1), row('algarve', 0.9, 2)]
    const views = pickViews(rows)
    expect(views).toHaveLength(EXPAT_PICKS.length)
    expect(views.map((v) => v.pick.rank)).toEqual(EXPAT_PICKS.map((p) => p.rank))
    const algarve = views.find((v) => v.pick.cityId === 'algarve')!
    expect(algarve.city.id).toBe('algarve')
    expect(algarve.row?.successRate).toBe(0.9)
    // Cities not yet ranked have no row (the UI shows a skeleton).
    expect(views.find((v) => v.pick.cityId === 'boquete')!.row).toBeUndefined()
  })

  it('splits the 15 profiled picks from picks 16–25', () => {
    const views = pickViews([])
    const profiled = views.filter(isProfiled)
    expect(profiled.map((v) => v.pick.rank)).toEqual(Array.from({ length: 15 }, (_, i) => i + 1))
    expect(views.filter((v) => !isProfiled(v)).map((v) => v.pick.rank)).toEqual(Array.from({ length: 10 }, (_, i) => i + 16))
  })

  it('drops picks whose city is missing', () => {
    const views = pickViews([], [{ rank: 1, cityId: 'atlantis', why: '', sourceRefs: [] }])
    expect(views).toEqual([])
  })
})

describe('scoreLabel', () => {
  it('reads all six factors in order, out of 5', () => {
    expect(scoreLabel({ cost: 3, healthcare: 3, safety: 5, visa: 4, climate: 5, community: 5 })).toBe(
      'Scores out of 5: Cost 3, Healthcare 3, Safety 5, Visa 4, Climate 5, Community 5',
    )
  })
})

describe('dates', () => {
  it('formats ISO dates without a time-zone shift', () => {
    expect(monthYear('2026-11-06')).toBe('Nov 2026')
    expect(monthYear('2026-01-01')).toBe('Jan 2026')
    expect(longDate('2026-11-06')).toBe('November 6, 2026')
    expect(monthYear('soon')).toBe('soon')
  })
})

describe('verifiedLabel', () => {
  it('labels verified cities with month and source', () => {
    const l = verifiedLabel(CITY_BY_ID.lisbon)
    expect(l.kind).toBe('verified')
    expect(l.text).toBe('Verified Nov 2026')
    expect(l.title).toContain('Numbeo')
    expect(l.title).toContain('November 6, 2026')
    expect(l.spoken).toContain('verified Nov 2026')
  })

  it('says so when confidence is low', () => {
    const l = verifiedLabel(CITY_BY_ID.boquete)
    expect(l.kind).toBe('low')
    expect(l.text).toBe('Verified Nov 2026')
    expect(l.title).toContain('Low confidence')
    expect(l.spoken).toContain('low confidence')
  })

  it('labels unverified cities as estimates', () => {
    const est = CITIES.find((c) => !c.verified)!
    const l = verifiedLabel(est)
    expect(l.kind).toBe('estimate')
    expect(l.text).toBe('Estimate')
    expect(l.spoken).toBe('cost data is a rough estimate')
  })

  it('every pick is verified', () => {
    for (const p of EXPAT_PICKS) expect(verifiedLabel(CITY_BY_ID[p.cityId]).kind).not.toBe('estimate')
  })
})

describe('costDataLine', () => {
  it('cites the date and source, with the low-confidence note where it applies', () => {
    expect(costDataLine(CITY_BY_ID.lisbon)).toBe('Cost indices verified November 6, 2026 from Numbeo current city index.')
    expect(costDataLine(CITY_BY_ID.boquete)).toMatch(/Low confidence: thin data: 9 Numbeo contributors/)
  })
})

describe('oddsVsHome', () => {
  it('compares displayed whole percents', () => {
    expect(oddsVsHome(0.82, 0.7)).toBe('+12 pts')
    expect(oddsVsHome(0.66, 0.7)).toBe('−4 pts')
    expect(oddsVsHome(0.701, 0.699)).toBe('same')
  })
})

describe('categoryCompare', () => {
  it('prices the home budget with the plan’s expat factor and overrides', () => {
    const inputs = { ...DEFAULT_INPUTS, ratioOverrides: { dining: 0.5 } }
    const city = CITY_BY_ID.lisbon
    const r = categoryRatios(CITY_BY_ID[inputs.homeCityId], city, inputs.expatFactor, inputs.ratioOverrides)
    const out = categoryCompare(inputs, city)
    expect(out.length).toBeGreaterThan(0)
    for (const c of out) {
      expect(c.home).toBe(inputs.budget[c.cat])
      expect(c.ratio).toBe(r[c.cat])
      expect(c.here).toBeCloseTo(inputs.budget[c.cat] * r[c.cat])
    }
    expect(out.find((c) => c.cat === 'dining')?.ratio).toBe(0.5)
  })

  it('is 1:1 for the home city and skips empty categories', () => {
    const inputs = { ...DEFAULT_INPUTS, budget: { ...DEFAULT_INPUTS.budget, travel: 0 } }
    const out = categoryCompare(inputs, CITY_BY_ID[inputs.homeCityId])
    expect(out.every((c) => c.ratio === 1 && c.here === c.home)).toBe(true)
    expect(out.some((c) => c.cat === 'travel')).toBe(false)
  })
})
