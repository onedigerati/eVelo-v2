// Same storm's gate, hidden lines, chips and captions (docs/PLAN.md stage 4, checks 1 and 3).
import { describe, expect, it } from 'vitest'
import { DEFAULT_INPUTS } from '../../../engine/defaults'
import { INCOME_DEFAULTS } from '../../../engine/income'
import type { IncomeInputs, IncomeResult, IncomeSampleYear } from '../../../engine/incomeTypes'
import type { SampleFuture, SampleKey } from '../../../engine/sampleFutures'
import type { EveloSampleYear, PlanInputs, SimulationResult } from '../../../engine/types'
import { stormFutures, stormGate, stormHiddenText } from '../sameStorm'

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

const ev = (o: Partial<PlanInputs> = {}): PlanInputs => ({ ...DEFAULT_INPUTS, horizonYears: N, ...o })
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

  it('a fractional eVelo block length is not the income engine’s rounded one', () => {
    expect(stormGate(ev({ blockMonths: 24.4 }), eveloRes(), inc({ blockMonths: 24 }), incomeRes())).toBe('different-futures')
    // Both sides fractional: eVelo keeps 24.4, income rounds to 24.
    expect(stormGate(ev({ blockMonths: 24.4 }), eveloRes(), inc({ blockMonths: 24.4 }), incomeRes())).toBe('different-futures')
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

  it('a crash chip whose rows never fall says so', () => {
    const paths: Paths = { lateCrash: 2 }
    const f = stormFutures(ev(), eveloRes(paths), inc(), incomeRes(paths, () => incRows((y) => START + y * 1000)))
    expect(f[0].caption).toMatch(/^Through the fall living on income’s portfolio never ends a year lower, and /)
  })

  it('names fewer first years on a short horizon', () => {
    const short = (n: number) => ({ ...ev(), horizonYears: n })
    const rowsE = eveRows().slice(0, 3)
    const rowsI = incRows(() => START, () => 1000).slice(0, 3)
    const f = stormFutures(short(3), eveloRes({ typical: 1 }, () => rowsE), inc({ horizonYears: 3 }), incomeRes({ typical: 1 }, () => rowsI))
    expect(f[0].caption).toBe('Both plans end level at $1.0M. eVelo never hits a forced sale; living on income sells $3.0K in its first three years.')
  })
})
