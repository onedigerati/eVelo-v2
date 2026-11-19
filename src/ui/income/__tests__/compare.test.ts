// The comparison's pure logic: the columns read the two results' own fields, the like-for-like
// lines, the chart geometry, and (the like-for-like proof) after a sync of the futures and years the
// mode runs on exactly the months eVelo draws for the plan.
import { describe, expect, it } from 'vitest'
import marketJson from '../../../data/market.json'
import { CITIES, CITY_BY_ID } from '../../../data/cities'
import { DEFAULT_INPUTS } from '../../../engine/defaults'
import { INCOME_DEFAULTS, runIncomeOnMonths, runIncomePaths } from '../../../engine/income'
import type { IncomeInputs } from '../../../engine/incomeTypes'
import { prepare } from '../../../engine/prepare'
import { generateScenarios } from '../../../engine/scenarios'
import { simulate } from '../../../engine/simulate'
import type { MarketData, PlanInputs } from '../../../engine/types'
import { applySync, snapshotFromEvelo, SYNC_FIELDS } from '../../../state/incomeSync'
import { compareColumns, compareHeading, eveloRate, incomeRate, likeForLike, localTaxWords, MEASURES, SAME_HEADING, SIDE_BY_SIDE_HEADING, stableKey, statText } from '../compare'
import { chartGeom, compareRows, compareSummary, yMaxOf, type CompareSeries } from '../compareChart'

const market = marketJson as unknown as MarketData
// DEFAULT_INPUTS moves abroad; these plans stay home unless a test says otherwise.
const plan = (o: Partial<PlanInputs> = {}): PlanInputs => ({ ...structuredClone(DEFAULT_INPUTS), destCityId: null, ...o })
const last = (a: number[]) => a[a.length - 1]

describe('columns', () => {
  const evelo = plan({ paths: 1000, seed: 41, horizonYears: 25 })
  const inputs: IncomeInputs = applySync(INCOME_DEFAULTS, snapshotFromEvelo(evelo), ['portfolio', 'basisFraction', 'age', 'horizonYears', 'spending', 'otherIncome', 'homeCityId', 'futures'])
  const ir = runIncomePaths(market, inputs)
  const er = simulate(market, CITIES, evelo)

  it('equal the two results’ fields under every measure', () => {
    const expected = {
      lasts: [ir.lastsRate, 1 - er.brokenRate],
      principal: [ir.principalKeptRate, er.successRate],
      pace: [ir.keepsPaceRate, 1 - er.brokenRate],
    }
    for (const { key } of MEASURES) {
      const [inc, ev] = compareColumns(key, ir, er)
      expect([inc.rate, ev.rate]).toEqual(expected[key])
      expect(inc.rate).toBe(incomeRate(ir, key))
      expect(ev.rate).toBe(eveloRate(er, key))
      const stat = (c: typeof inc, k: string) => c.stats.find((s) => s.key === k)!
      expect(stat(inc, 'estate').value).toBe(last(ir.value.p50))
      expect(stat(inc, 'estate').label).toBe('Median estate, before inheritance tax')
      expect(stat(inc, 'tax').value).toBe(ir.totalTaxMedian)
      expect(stat(inc, 'sold').value).toBe(ir.totalSoldMedian)
      expect(stat(ev, 'estate').value).toBe(er.estate.bbdMedian)
      expect(stat(ev, 'loan').value).toBe(last(er.loan.p50))
      // eVelo has no lifetime tax figure for the borrow plan: a note, never a number.
      expect(stat(ev, 'tax').value).toBeNull()
      expect(statText(stat(ev, 'tax'))).toMatch(/^Not tallied/)
    }
    expect(ir.totalTaxMedian).toBeGreaterThan(0)
  })
})

describe('likeForLike', () => {
  const synced = (p: PlanInputs) => applySync(INCOME_DEFAULTS, snapshotFromEvelo(p), SYNC_FIELDS)
  const keys = (p: PlanInputs, i: IncomeInputs = synced(p)) => likeForLike(p, i).map((l) => l.key)

  it('says both run on the same futures when nothing differs', () => {
    const p = plan({ paths: 4000 })
    expect(likeForLike(p, synced(p))).toEqual([{ key: 'same', text: 'Both run on the same 4,000 futures.' }])
  })

  it('names a move, retiring later, fat tails and a loan', () => {
    const dest = CITIES.find((c) => c.id !== DEFAULT_INPUTS.homeCityId && !localTaxWords(c))!
    const lines = likeForLike(plan({ destCityId: dest.id }), synced(plan()))
    expect(lines[0]).toEqual({ key: 'move', text: `Your eVelo plan moves to ${CITY_BY_ID[dest.id].name}; living on income stays home.` })
    expect(likeForLike(plan({ retireInYears: 5 }), synced(plan()))[0].text).toBe('eVelo retires in 5 years; this mode retires now.')
    expect(likeForLike(plan({ retireInYears: 1 }), synced(plan()))[0].text).toBe('eVelo retires in 1 year; this mode retires now.')
    expect(likeForLike(plan({ retireInYears: 5, savingsWhileWorking: 40_000 }), synced(plan()))[0].text).toBe(
      'eVelo retires in 5 years, adding $40K a year until then; this mode retires now.',
    )
    const ft = plan({ method: 'fat-tail' })
    expect(keys(ft)).toEqual(['method'])
    expect(likeForLike(ft, synced(ft))[0].text).toBe('eVelo uses fat tails; this mode always replays history.')
    expect(likeForLike(plan({ existingLoan: 250_000 }), synced(plan()))[0].text).toBe('eVelo starts with a $250K loan.')
    expect(keys(plan({ existingLoan: 250_000, retireInYears: 3, destCityId: dest.id }), synced(plan()))).toEqual(['move', 'retire', 'loan', 'same'])
  })

  it('a destination equal to home is no move', () => {
    expect(keys(plan({ destCityId: DEFAULT_INPUTS.homeCityId }))).toEqual(['same'])
  })

  it('flags different futures when seed, paths, block length or outlook differ', () => {
    const p = plan()
    for (const o of [{ seed: p.seed + 1 }, { paths: 1000 }, { blockMonths: p.blockMonths + 1 }, { outlook: 'conservative' as const }]) {
      const i = { ...synced(p), ...o }
      if (stableKey(i) === stableKey(synced(p))) continue
      expect(likeForLike(p, i)).toEqual([{ key: 'futures', text: 'These run on different futures; sync ‘Futures’ to match.' }])
    }
    expect(keys(p, { ...synced(p), horizonYears: p.horizonYears - 5 })).toEqual(['horizon'])
  })
})

describe('likeForLike: the person', () => {
  const p = plan({ portfolio: 2_400_000, basisFraction: 0.4, age: 60, otherIncome: 30_000, incomeStartAge: 67, homeCityId: 'new-york' })
  const all = applySync(INCOME_DEFAULTS, snapshotFromEvelo(p), SYNC_FIELDS)

  it('names each differing field with both values', () => {
    const snap = snapshotFromEvelo(p)
    const cases: [Partial<IncomeInputs>, string][] = [
      [{ portfolio: 2_000_000 }, 'Portfolio differs: $2.4M in eVelo, $2.0M here.'],
      [{ basisFraction: 0.6 }, 'Cost basis differs: 40% in eVelo, 60% here.'],
      [{ age: 65 }, 'Age differs: 60 in eVelo, 65 here.'],
      [{ spending: 100_000 }, `Spending differs: $${Math.round(snap.spending! / 1000)}K a year in eVelo, $100K a year here.`],
      [{ otherIncome: 40_000 }, 'Social Security differs: $30K from 67 in eVelo, $40K from 67 here.'],
      [{ incomeStartAge: 70 }, 'Social Security differs: $30K from 67 in eVelo, $30K from 70 here.'],
      [{ otherIncome: 0 }, 'Social Security differs: $30K from 67 in eVelo, none here.'],
      [{ homeCityId: 'chicago' }, `Home city differs: ${CITY_BY_ID['new-york'].name} in eVelo, ${CITY_BY_ID.chicago.name} here.`],
    ]
    for (const [o, want] of cases) {
      const lines = likeForLike(p, { ...all, ...o })
      expect(lines[0].text).toBe(want)
      expect(lines[0].key.startsWith('differs-')).toBe(true)
      expect(compareHeading(lines)).toBe(SIDE_BY_SIDE_HEADING)
    }
  })

  it('lists two differing fields one line each, more than two in one line', () => {
    const two = likeForLike(p, { ...all, portfolio: 2_000_000, age: 65 }).map((l) => l.text)
    expect(two.slice(0, 2)).toEqual(['Portfolio differs: $2.4M in eVelo, $2.0M here.', 'Age differs: 60 in eVelo, 65 here.'])
    const lines = likeForLike(p, { ...all, portfolio: 2_000_000, age: 65, spending: 1 })
    expect(lines[0]).toEqual({ key: 'differs', text: 'Portfolio, age and spending differ from your eVelo plan.' })
    expect(lines.filter((l) => l.key.startsWith('differs'))).toHaveLength(1)
  })

  it('says “same person, same markets” only when nothing about the person or the futures differs', () => {
    expect(compareHeading(likeForLike(p, all))).toBe(SAME_HEADING)
    expect(compareHeading(likeForLike(p, { ...all, seed: all.seed + 1 }))).toBe(SIDE_BY_SIDE_HEADING)
    expect(compareHeading(likeForLike(p, { ...all, horizonYears: all.horizonYears - 5 }))).toBe(SIDE_BY_SIDE_HEADING)
    expect(compareHeading(likeForLike({ ...p, method: 'fat-tail' }, all))).toBe(SIDE_BY_SIDE_HEADING)
    // Only the futures and years synced: the person still differs from the mode's defaults.
    const futuresOnly = applySync(INCOME_DEFAULTS, snapshotFromEvelo(p), ['futures', 'horizonYears'])
    expect(compareHeading(likeForLike(p, futuresOnly))).toBe(SIDE_BY_SIDE_HEADING)
  })
})

describe('likeForLike: local taxes', () => {
  const lines = (p: PlanInputs) => likeForLike(p, applySync(INCOME_DEFAULTS, snapshotFromEvelo(p), SYNC_FIELDS))

  it('says eVelo includes a taxed home city’s tax and the mode doesn’t', () => {
    const l = lines(plan({ homeCityId: 'philadelphia' }))
    expect(l.map((x) => x.key)).toEqual(['tax', 'same'])
    expect(l[0].text).toBe('eVelo’s figures include Philadelphia’s state inheritance tax; living on income doesn’t model it.')
    expect(compareHeading(l)).toBe(SAME_HEADING)
    expect(lines(plan({ homeCityId: 'st-louis' })).map((x) => x.key)).toEqual(['same'])
  })

  it('the move line names a taxed destination’s tax', () => {
    const dest = CITIES.find((c) => c.localTax?.wealth && !c.localTax.inheritance && c.countryCode !== 'US')!
    const l = lines(plan({ destCityId: dest.id }))
    expect(l[0]).toEqual({
      key: 'move',
      text: `Your eVelo plan moves to ${dest.name}, and its figures include ${dest.name}’s wealth tax; living on income stays home and doesn’t model it.`,
    })
    expect(l.some((x) => x.key === 'tax')).toBe(false)
  })
})

describe('like for like: the same months as eVelo', () => {
  // A plan away from every default, so the copy is what makes the months match.
  const p = plan({ seed: 987_654, paths: 1000, blockMonths: 18, horizonYears: 22, outlook: 'balanced' })

  it('after syncing futures and years, the mode runs on the months eVelo draws for the plan', () => {
    const inputs = applySync(INCOME_DEFAULTS, snapshotFromEvelo(p), ['horizonYears', 'futures'])
    expect([inputs.seed, inputs.paths, inputs.blockMonths, inputs.horizonYears, inputs.outlook]).toEqual([p.seed, p.paths, p.blockMonths, p.horizonYears, p.outlook])
    // eVelo's draw for the plan (simulate → makeScenarios), with stage 3's indices option.
    const ev = generateScenarios(prepare(market, p.holdings, p.outlook), p.method, p.blockMonths, p.paths, p.horizonYears * 12, p.seed, { indices: true })
    expect(ev.paths).toBe(1000)
    expect(runIncomePaths(market, inputs)).toEqual(runIncomeOnMonths(market, inputs, ev.idx!))
    // Without the futures copied, the mode's months are not eVelo's.
    const unsynced = applySync(INCOME_DEFAULTS, snapshotFromEvelo(p), ['horizonYears'])
    expect(runIncomePaths(market, { ...unsynced, paths: 1000 })).not.toEqual(runIncomeOnMonths(market, { ...unsynced, paths: 1000 }, ev.idx!))
  })
})

describe('compare chart geometry', () => {
  const band = (a: number[]) => ({ p25: a.map((v) => v * 0.8), p50: a, p75: a.map((v) => v * 1.25) })
  const series: CompareSeries[] = [
    { key: 'income', label: 'Living on income', age: 60, bands: band([1e6, 1.1e6, 1.2e6]) },
    { key: 'evelo', label: 'eVelo', age: 60, bands: band([1e6, 1.4e6, 2e6]) },
  ]

  it('puts both on one scale over the upper quartile', () => {
    expect(yMaxOf(series)).toBeGreaterThanOrEqual(2.5e6)
    const g = chartGeom(series, { l: 0, r: 100, t: 0, b: 100 })
    expect(g.ages).toEqual([60, 62])
    expect(g.paths.map((p) => p.key)).toEqual(['income', 'evelo'])
    expect(g.paths[1].end[0]).toBe(100)
    expect(g.paths[1].end[1]).toBeLessThan(g.paths[0].end[1])
  })

  it('lists every age with both series in the hidden table', () => {
    const rows = compareRows([series[0], { ...series[1], age: 61 }])
    expect(rows.map((r) => r.age)).toEqual([60, 61, 62, 63])
    expect(rows[0].evelo).toBeNull()
    expect(rows[3].income).toBeNull()
    expect(rows[1].evelo).toEqual([0.8e6, 1e6, 1.25e6])
    expect(compareSummary(series)).toContain('eVelo’s median'.replace('’', "'"))
  })
})
