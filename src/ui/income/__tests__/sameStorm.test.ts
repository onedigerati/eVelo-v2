// Same storm's gate, hidden lines, chips and captions (docs/PLAN.md stage 4, checks 1 and 3).
import { describe, expect, it } from 'vitest'
import { DEFAULT_INPUTS } from '../../../engine/defaults'
import { INCOME_DEFAULTS } from '../../../engine/income'
import type { IncomeInputs, IncomeResult, IncomeSampleYear } from '../../../engine/incomeTypes'
import type { SampleFuture, SampleKey } from '../../../engine/sampleFutures'
import type { EveloSampleYear, PlanInputs, SimulationResult } from '../../../engine/types'
import { likeForLike } from '../compare'
import { crashWindow, stormFutures, stormGate, stormHiddenText } from '../sameStorm'

const N = 10
const START = 1_000_000

/** Income rows: portfolio per year from `port`, `sold` per year from `sold`. */
const incRows = (port: (y: number) => number = () => START, sold: (y: number) => number = () => 0): IncomeSampleYear[] =>
  Array.from({ length: N }, (_, y) => ({ portfolio: port(y), dividendsInterest: 0, socialSecurity: 0, sold: sold(y), tax: 0, reinvested: 0 }))
/** eVelo rows: net worth per year from `nw`, forced sales from `forced`. */
const eveRows = (nw: (y: number) => number = () => START, forced: (y: number) => number = () => 0): EveloSampleYear[] =>
  Array.from({ length: N }, (_, y) => ({ netWorth: nw(y), portfolio: nw(y), loan: 0, ltv: 0.3, borrowed: 0, interest: 0, forcedSaleSold: forced(y) }))

type Paths = Partial<Record<SampleKey, number>>
const PATHS: Paths = { earlyCrash: 3, typical: 11, lateCrash: 42, lucky: 7 }

function eveloRes(paths: Paths = PATHS, rows: (k: SampleKey) => EveloSampleYear[] = () => eveRows()): SimulationResult {
  const samples: SampleFuture<EveloSampleYear>[] = Object.entries(paths).map(([k, p]) => ({ key: k as SampleKey, path: p!, years: rows(k as SampleKey) }))
  return { samples } as unknown as SimulationResult
}
function incomeRes(paths: Paths = PATHS, rows: (k: SampleKey) => IncomeSampleYear[] = () => incRows()): IncomeResult {
  const samples: SampleFuture<IncomeSampleYear>[] = Object.entries(paths).map(([k, p]) => ({ key: k as SampleKey, path: p!, years: rows(k as SampleKey) }))
  return { samples } as unknown as IncomeResult
}

const ev = (o: Partial<PlanInputs> = {}): PlanInputs => ({ ...DEFAULT_INPUTS, horizonYears: N, age: 60, ...o })
const inc = (o: Partial<IncomeInputs> = {}): IncomeInputs => ({ ...INCOME_DEFAULTS, horizonYears: N, portfolio: START, age: 60, ...o })

describe('stormGate', () => {
  it('is shown when both plans draw the same futures and the sample paths agree', () => {
    expect(stormGate(ev(), eveloRes(), inc(), incomeRes())).toBe('shown')
  })

  it('fat tails on either side hide it', () => {
    expect(stormGate(ev({ method: 'fat-tail' }), eveloRes(), inc(), incomeRes())).toBe('fat-tail')
    expect(stormGate(ev(), eveloRes(), inc({ method: 'fat-tail' }), incomeRes())).toBe('fat-tail')
  })

  it('a different seed, path count, block length or outlook is different futures', () => {
    expect(stormGate(ev({ seed: 8 }), eveloRes(), inc(), incomeRes())).toBe('different-futures')
    expect(stormGate(ev({ paths: 1000 }), eveloRes(), inc(), incomeRes())).toBe('different-futures')
    expect(stormGate(ev({ blockMonths: 12 }), eveloRes(), inc(), incomeRes())).toBe('different-futures')
    expect(stormGate(ev({ outlook: 'historical' }), eveloRes(), inc(), incomeRes())).toBe('different-futures')
  })

  it('a fractional eVelo block length is its own reason, since syncing can’t match it', () => {
    expect(stormGate(ev({ blockMonths: 24.4 }), eveloRes(), inc({ blockMonths: 24 }), incomeRes())).toBe('block-fraction')
    // Both sides fractional: eVelo keeps 24.5, income rounds to 25 (as syncing does).
    expect(stormGate(ev({ blockMonths: 24.5 }), eveloRes(), inc({ blockMonths: 25 }), incomeRes())).toBe('block-fraction')
    expect(stormHiddenText('block-fraction', 24.5)).toBe(
      'Same storm needs both plans on the same futures: eVelo’s block length (24.5 months) isn’t a whole number, so the two can’t draw the same months; set it in eVelo’s settings.',
    )
    expect(stormHiddenText('block-fraction', 24.5)).not.toContain('sync')
    // Another difference as well is plain different futures, which syncing does fix first.
    expect(stormGate(ev({ blockMonths: 24.5, seed: 9 }), eveloRes(), inc({ blockMonths: 25, seed: 8 }), incomeRes())).toBe('different-futures')
  })

  it('compares what each engine draws, not the raw inputs', () => {
    // eVelo floors 4000.7 paths, income floors too; the income horizon 10.2 rounds to 10.
    expect(stormGate(ev({ paths: 4000.7 }), eveloRes(), inc({ paths: 4000.4, horizonYears: 10.2 }), incomeRes())).toBe('shown')
  })

  it('different horizons are different years; futures are named first when both differ', () => {
    expect(stormGate(ev({ horizonYears: 20 }), eveloRes(), inc(), incomeRes())).toBe('different-years')
    expect(stormGate(ev({ horizonYears: 20, seed: 9 }), eveloRes(), inc(), incomeRes())).toBe('different-futures')
  })

  it('start ages don’t matter', () => {
    expect(stormGate(ev({ age: 50 }), eveloRes(), inc({ age: 70 }), incomeRes())).toBe('shown')
  })

  it('missing samples on either side, or paths that disagree key by key, are no samples', () => {
    const none = { samples: null } as unknown as SimulationResult
    const empty = { samples: [] } as unknown as IncomeResult
    expect(stormGate(ev(), none, inc(), incomeRes())).toBe('no-samples')
    expect(stormGate(ev(), eveloRes(), inc(), empty)).toBe('no-samples')
    expect(stormGate(ev(), eveloRes({ ...PATHS, lucky: 8 }), inc(), incomeRes())).toBe('no-samples')
    const { lateCrash: _, ...noLate } = PATHS
    expect(stormGate(ev(), eveloRes(noLate), inc(), incomeRes())).toBe('no-samples')
    // Missing from both sides is fine: that future simply isn't shown.
    expect(stormGate(ev(), eveloRes(noLate), inc(), incomeRes(noLate))).toBe('shown')
  })
})

describe('stormHiddenText', () => {
  it('says why in one sentence', () => {
    expect(stormHiddenText('fat-tail')).toBe('Same storm needs both plans on the same futures: eVelo uses fat tails, so its months aren’t replayed history.')
    expect(stormHiddenText('different-futures')).toMatch(/sync ‘Futures’ to match\.$/)
    expect(stormHiddenText('different-years')).toMatch(/sync ‘Years’ to match\.$/)
    expect(stormHiddenText('no-samples')).toMatch(/^Same storm .*\.$/)
  })
})

describe('stormFutures', () => {
  it('is empty when hidden', () => {
    expect(stormFutures(ev({ seed: 1 }), eveloRes(), inc(), incomeRes())).toEqual([])
  })

  it('one chip per path in key order, with labels, ages from the income plan and the call line', () => {
    const f = stormFutures(ev({ age: 50, maxLtv: 0.55 }), eveloRes(), inc(), incomeRes())
    expect(f.map((x) => x.label)).toEqual(['Early crash', 'Typical', 'Late crash', 'Lucky'])
    expect(f.map((x) => x.path)).toEqual([3, 11, 42, 7])
    expect(f[0].years).toHaveLength(N)
    expect(f[0].years.map((y) => y.age)).toEqual(Array.from({ length: N }, (_, y) => 60 + y))
    expect(f[0].callLtv).toBe(0.55)
  })

  it('merges keys that picked the same path and leaves missing ones out', () => {
    const paths: Paths = { typical: 5, lateCrash: 9, lucky: 5 }
    const f = stormFutures(ev(), eveloRes(paths), inc(), incomeRes(paths))
    expect(f.map((x) => x.label)).toEqual(['Typical · Lucky', 'Late crash'])
    expect(f[0].keys).toEqual(['typical', 'lucky'])
  })

  it('zips both engines’ rows by year', () => {
    const f = stormFutures(ev(), eveloRes(PATHS, () => eveRows((y) => 100 + y)), inc(), incomeRes(PATHS, () => incRows((y) => 200 + y)))
    expect(f[1].years[4].evelo.netWorth).toBe(104)
    expect(f[1].years[4].income.portfolio).toBe(204)
  })

  const typical = (e: EveloSampleYear[], i: IncomeSampleYear[]) =>
    stormFutures(ev(), eveloRes({ typical: 1 }, () => e), inc(), incomeRes({ typical: 1 }, () => i))[0].caption

  it('eVelo ahead, no forced sale, nothing sold', () => {
    expect(typical(eveRows(() => 2_500_000), incRows(() => 1_300_000))).toBe(
      'eVelo ends $1.2M ahead. eVelo never hits a forced sale; living on income sells nothing in its first seven years.',
    )
  })

  it('living on income ahead, a forced sale summed from its first year, selling in the first seven years', () => {
    const caption = typical(
      eveRows(() => 900_000, (y) => (y === 6 ? 200_000 : y === 8 ? 140_000 : 0)),
      incRows(() => 1_400_000, (y) => (y < 7 ? 10_000 : 99_000)),
    )
    expect(caption).toBe('Living on income ends $500K ahead. eVelo hits a forced sale at 66 ($340K sold in all); living on income sells $70K in its first seven years.')
    expect(caption).not.toMatch(/eVelo ends/)
  })

  it('crash chips add the fall from the rows', () => {
    const paths: Paths = { earlyCrash: 2 }
    const f = stormFutures(
      ev(),
      eveloRes(paths, () => eveRows(() => 2_000_000)),
      inc(),
      incomeRes(paths, () => incRows((y) => (y < 2 ? START : y === 2 ? 750_000 : 900_000))),
    )
    expect(f[0].caption).toBe(
      'At 62 living on income’s portfolio falls 25% in a year, and eVelo ends $1.1M ahead. eVelo never hits a forced sale; living on income sells nothing in its first seven years.',
    )
  })

  it('a crash chip whose rows never fall leaves the clause out', () => {
    const paths: Paths = { lateCrash: 2 }
    const f = stormFutures(ev(), eveloRes(paths), inc(), incomeRes(paths, () => incRows((y) => START + y * 1000)))
    expect(f[0].caption).toMatch(/^Living on income ends /)
    expect(f[0].caption).not.toContain('never ends a year lower')
  })

  it('the crash clause looks only in the chip’s window and needs a 5% fall', () => {
    const long = (n: number) => Array.from({ length: n })
    const H = 30
    const evRows = () => long(H).map(() => ({ netWorth: 2e6, portfolio: 2e6, loan: 0, ltv: 0.3, borrowed: 0, interest: 0, forcedSaleSold: 0 }))
    const incPort = (fallAt: number, by: number) => () =>
      long(H).map((_, y) => ({ portfolio: y >= fallAt ? START * (1 - by) : START, dividendsInterest: 0, socialSecurity: 0, sold: 0, tax: 0, reinvested: 0 }))
    const cap = (key: SampleKey, fallAt: number, by: number) =>
      stormFutures(ev({ horizonYears: H }), eveloRes({ [key]: 2 }, evRows), inc({ horizonYears: H }), incomeRes({ [key]: 2 }, incPort(fallAt, by)))[0].caption
    // Early crash window: years 0–4. A 30% fall in year 3 is reported; in year 20 it isn't.
    expect(cap('earlyCrash', 3, 0.3)).toMatch(/^At 63 living on income’s portfolio falls 30% in a year/)
    expect(cap('earlyCrash', 20, 0.3)).not.toContain('falls')
    // Late crash window over 30 years: months [240, 360) → years 20–29.
    expect(cap('lateCrash', 22, 0.3)).toMatch(/^At 82 /)
    expect(cap('lateCrash', 3, 0.3)).not.toContain('falls')
    // Under 5% isn't reported.
    expect(cap('earlyCrash', 3, 0.04)).not.toContain('falls')
  })

  it('crash windows follow the sample picker', () => {
    expect(crashWindow(['earlyCrash'], 30)).toEqual([0, 4])
    expect(crashWindow(['lateCrash'], 30)).toEqual([20, 29])
    expect(crashWindow(['lateCrash'], 10)).toEqual([5, 9])
    expect(crashWindow(['earlyCrash'], 6)).toEqual([0, 2])
    expect(crashWindow(['earlyCrash', 'lateCrash'], 30)).toEqual([0, 29])
    expect(crashWindow(['typical'], 30)).toEqual([0, -1])
  })

  it('eVelo’s events use eVelo’s own age, living on income’s use the income age', () => {
    const f = stormFutures(
      ev({ age: 55 }),
      eveloRes({ typical: 1 }, () => eveRows((y) => (y >= 8 ? 0 : 900_000), (y) => (y === 3 ? 50_000 : 0))),
      inc({ age: 60 }),
      incomeRes({ typical: 1 }, () => incRows(() => 1_400_000)),
    )[0]
    expect(f.caption).toContain('eVelo hits a forced sale at 58')
    expect(f.caption).toContain('after eVelo runs out at 63')
    expect(f.years[0]).toMatchObject({ age: 60, eveloAge: 55 })
  })

  it('names fewer first years on a short horizon', () => {
    const short = (n: number) => ({ ...ev(), horizonYears: n })
    const rowsE = eveRows().slice(0, 3)
    const rowsI = incRows(() => START, () => 1000).slice(0, 3)
    const f = stormFutures(short(3), eveloRes({ typical: 1 }, () => rowsE), inc({ horizonYears: 3 }), incomeRes({ typical: 1 }, () => rowsI))
    expect(f[0].caption).toBe('Both plans end level at $1.0M. eVelo never hits a forced sale; living on income sells $3.0K in its first three years.')
  })

  it('running out is said as such, not a level finish at $0', () => {
    const both = typical(eveRows((y) => (y >= 6 ? 0 : 500_000)), incRows((y) => (y >= 8 ? 0 : 400_000)))
    expect(both).toMatch(/^Both plans run out of money: eVelo at 66, living on income at 68\./)
    expect(both).not.toContain('level')
    const same = typical(eveRows((y) => (y >= 7 ? 0 : 500_000)), incRows((y) => (y >= 7 ? 0 : 400_000)))
    expect(same).toMatch(/^Both plans run out of money at 67\./)
    const one = typical(eveRows(() => 800_000), incRows((y) => (y >= 5 ? 0 : 400_000)))
    expect(one).toMatch(/^eVelo ends \$800K ahead, after living on income runs out at 65\./)
  })

  it('a crash chip doesn\'t call running dry a 100% fall', () => {
    const paths: Paths = { earlyCrash: 2 }
    const dry = stormFutures(ev(), eveloRes(paths, () => eveRows(() => 2_000_000)), inc(), incomeRes(paths, () => incRows((y) => (y < 3 ? START - y * 100_000 : y === 3 ? 600_000 : y === 4 ? 0 : 0))))
    expect(dry[0].caption).not.toContain('100%')
    expect(dry[0].caption).toMatch(/^At 63 living on income’s portfolio falls 25% in a year, and eVelo ends \$2\.0M ahead, after living on income runs out at 64\./)
    const onlyDry = stormFutures(ev(), eveloRes(paths, () => eveRows(() => 2_000_000)), inc(), incomeRes(paths, () => incRows((y) => (y < 4 ? START : 0))))
    expect(onlyDry[0].caption).toMatch(/^eVelo ends \$2\.0M ahead, after living on income runs out at 64\./)
  })
})

describe('Same storm and the comparison agree on "same futures"', () => {
  const CASES: [string, Partial<PlanInputs>, Partial<IncomeInputs>][] = [
    ['identical', {}, {}],
    ['seed differs', { seed: 5 }, { seed: 6 }],
    ['fractional seed, same as used', { seed: 42.4 }, { seed: 42 }],
    ['fractional paths, same as used', { paths: 300.5 }, { paths: 300 }],
    ['paths differ', { paths: 300 }, { paths: 500 }],
    ['block differs', { blockMonths: 24 }, { blockMonths: 36 }],
    ['fractional eVelo block', { blockMonths: 24.5 }, { blockMonths: 25 }],
    ['outlook differs', { outlook: 'balanced' }, { outlook: 'conservative' }],
    ['years differ', { horizonYears: N + 5 }, {}],
    ['years and seed differ', { horizonYears: N + 5, seed: 1 }, { seed: 2 }],
  ]
  it.each(CASES)('%s', (_, e, i) => {
    const plan = ev({ method: 'bootstrap', paths: 1000, seed: 3, blockMonths: 24, outlook: 'historical', ...e })
    const mode = inc({ method: 'bootstrap', paths: 1000, seed: 3, blockMonths: 24, outlook: 'historical', ...i })
    const gate = stormGate(plan, eveloRes(), mode, incomeRes())
    const keys = likeForLike(plan, mode).map((l) => l.key)
    expect(gate === 'different-futures' || gate === 'block-fraction').toBe(keys.includes('futures'))
    expect(gate === 'different-years').toBe(keys.includes('horizon'))
    expect(gate === 'shown').toBe(keys.includes('same'))
  })
})

