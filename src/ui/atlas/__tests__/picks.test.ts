import { describe, expect, it, vi } from 'vitest'

// atlasData (cityCosts) imports the store and the sim client, which touch `window` on load.
vi.mock('../../../state/store', () => ({ useStore: () => undefined }))
vi.mock('../../../state/sim', () => ({}))
import { CITIES, CITY_BY_ID } from '../../../data/cities'
import { EXPAT_PICKS, expatPickFor, type ExpatProfile } from '../../../data/expatPicks'
import { categoryRatios } from '../../../engine/cost'
import { DEFAULT_INPUTS } from '../../../engine/defaults'
import {
  categoryCompare,
  CARD_PICKS,
  costDataLine,
  isProfiled,
  longDate,
  monthYear,
  oddsVsHome,
  pickViews,
  profileEyebrow,
  profileView,
  scoreLabel,
  splitPicks,
  verifiedLabel,
  type PickRow,
} from '../picks'
import { cityCosts } from '../atlasData'

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

  it('profiles every pick', () => {
    const views = pickViews([])
    expect(views.filter(isProfiled)).toHaveLength(75)
  })

  it('drops picks whose city is missing', () => {
    const views = pickViews([], [{ rank: 1, cityId: 'atlantis', why: '', sourceRefs: [] }])
    expect(views).toEqual([])
  })
})

describe('splitPicks', () => {
  it('puts ranks 1–15 in the card grid and 16–75 in the compact rows', () => {
    expect(CARD_PICKS).toBe(15)
    const { cards, rest } = splitPicks(pickViews([]))
    expect(cards.map((v) => v.pick.rank)).toEqual(Array.from({ length: 15 }, (_, i) => i + 1))
    expect(rest.map((v) => v.pick.rank)).toEqual(Array.from({ length: 60 }, (_, i) => i + 16))
    // Compact rows carry profiles too, so a tap can open them.
    expect(rest.every(isProfiled)).toBe(true)
  })

  it('keeps an unprofiled later pick in the rows and leaves an unprofiled top pick out of the grid', () => {
    const picks = [
      { ...EXPAT_PICKS[0], profile: undefined },
      EXPAT_PICKS[1],
      { ...EXPAT_PICKS[20], profile: undefined },
    ]
    const { cards, rest } = splitPicks(pickViews([], picks))
    expect(cards.map((v) => v.pick.rank)).toEqual([2])
    expect(rest.map((v) => v.pick.rank)).toEqual([21])
    expect(isProfiled(rest[0])).toBe(false)
  })
})

describe('scoreLabel', () => {
  it('reads all nine factors in display order, out of 5', () => {
    expect(
      scoreLabel({ cost: 3, healthcare: 3, safety: 5, visa: 4, climate: 5, community: 5, tax: 2, estate: 5, lending: 3 }),
    ).toBe(
      'Scores out of 5: Tax on holdings 2, Estate 5, Lending 3, Residency 4, Healthcare 3, Cost 3, Safety 5, Climate 5, Community 5',
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

  it('uses a fixed amount only for its own city', () => {
    const base = { ...DEFAULT_INPUTS, budget: { ...DEFAULT_INPUTS.budget, housing: 24_000 } }
    const inputs = { ...base, amountOverrides: { lisbon: { housing: 12_000 } } }
    const lis = categoryCompare(inputs, CITY_BY_ID.lisbon).find((c) => c.cat === 'housing')!
    expect(lis.here).toBe(12_000)
    expect(lis.ratio).toBeCloseTo(0.5)
    // another city keeps its priced amount
    expect(categoryCompare(inputs, CITY_BY_ID.bangkok)).toEqual(categoryCompare(base, CITY_BY_ID.bangkok))
    // staying home ignores fixed amounts, even one keyed by the home city
    const homeId = inputs.homeCityId
    const atHome = categoryCompare({ ...base, amountOverrides: { [homeId]: { housing: 1 } } }, CITY_BY_ID[homeId])
    expect(atHome.find((c) => c.cat === 'housing')).toMatchObject({ here: 24_000, ratio: 1 })
  })

  it('shows a fixed amount on a $0 home category with no ratio, never Infinity or NaN', () => {
    const inputs = { ...DEFAULT_INPUTS, budget: { ...DEFAULT_INPUTS.budget, travel: 0 }, amountOverrides: { lisbon: { travel: 5_000 } } }
    const t = categoryCompare(inputs, CITY_BY_ID.lisbon).find((c) => c.cat === 'travel')!
    expect(t).toEqual({ cat: 'travel', home: 0, here: 5_000, ratio: null })
    expect(categoryCompare(inputs, CITY_BY_ID.bangkok).some((c) => c.cat === 'travel')).toBe(false)
  })
})

describe('cityCosts', () => {
  it('applies only the city’s own fixed amounts', () => {
    const inputs = { ...DEFAULT_INPUTS, budget: { ...DEFAULT_INPUTS.budget, dining: 0 }, amountOverrides: { lisbon: { housing: 9_000, dining: 3_000 } } }
    const lis = cityCosts(inputs, CITY_BY_ID.lisbon)
    expect(lis.housing).toBe(9_000)
    expect(lis.dining).toBe(3_000)
    const bkk = cityCosts(inputs, CITY_BY_ID.bangkok)
    expect(bkk).toEqual(cityCosts({ ...inputs, amountOverrides: undefined }, CITY_BY_ID.bangkok))
    expect(bkk.dining).toBe(0)
    for (const v of Object.values(lis)) expect(Number.isFinite(v)).toBe(true)
  })
})

describe('profileView / profileEyebrow (any profiled city)', () => {
  const fakeProfile = { tagline: 'Test' } as ExpatProfile
  // Stands in for an unranked profile (e.g. Tokyo) whether or not its file exists yet.
  const lookup = {
    profile: (id: string) => (id === 'tokyo' ? fakeProfile : EXPAT_PICKS.find((p) => p.cityId === id)?.profile),
    pick: expatPickFor,
  }

  it('opens a pick with its rank and row', () => {
    const v = profileView('algarve', [row('algarve', 0.9, 2)])!
    expect(v.pick?.rank).toBe(1)
    expect(v.profile).toBe(expatPickFor('algarve')!.profile)
    expect(v.row?.successRate).toBe(0.9)
    expect(profileEyebrow(v)).toBe('Top pick 1 of 75 · Portugal')
  })

  it('opens an unranked profiled city without a pick, and says "Profile · <country>"', () => {
    const v = profileView('tokyo', [row('tokyo', 0.7, 40)], lookup)!
    expect(v).not.toBeNull()
    expect(v.pick).toBeUndefined()
    expect(v.profile).toBe(fakeProfile)
    expect(v.row?.rank).toBe(40)
    expect(profileEyebrow(v)).toBe('Profile · Japan')
  })

  it('returns null for a city with no profile or an unknown id', () => {
    expect(profileView('st-louis', [], { profile: () => undefined, pick: () => undefined })).toBeNull()
    expect(profileView('atlantis', [], lookup)).toBeNull()
  })

  it('never adds an unranked profile to the top-picks list', () => {
    const views = pickViews([row('tokyo', 0.99, 1)])
    expect(views.some((v) => v.pick.cityId === 'tokyo')).toBe(false)
    expect(views).toHaveLength(75)
  })
})
