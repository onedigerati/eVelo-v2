// Stage 3 (matched sample futures), eVelo side: simulate returns per-year rows for the picked paths,
// read from the kernel's own per-path recorder. The picker is mocked with fixed picks so these tests
// prove simulate's plumbing on its own (the picker has its own tests); SAMPLE_KEYS and the types are
// the real ones.
import { createHash } from 'node:crypto'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_INPUTS } from '../defaults'
import { createRecorder, runPaths, type Recorder } from '../kernel'
import { prepare } from '../prepare'
import { SAMPLE_KEYS, type SamplePicks } from '../sampleFutures'
import { generateScenarios } from '../scenarios'
import { findCity, kernelConfig, makeScenarios, normalizeInputs, resolveDestination, simulate } from '../simulate'
import type { MarketData, PlanInputs, SimulationResult } from '../types'
import { CITIES_FIX, syntheticMarket } from './fixtures'

const mock = vi.hoisted(() => ({
  picks: null as null | ((paths: number) => SamplePicks),
  calls: [] as { idx: Int32Array; T: number; realStock: ArrayLike<number> }[],
}))

vi.mock('../sampleFutures', async (importActual) => {
  const actual = await importActual<typeof import('../sampleFutures')>()
  return {
    ...actual,
    realStockMonthly: (market: MarketData) => Float64Array.from({ length: market.months }, (_, m) => m / 1000),
    pickSampleFutures: (idx: Int32Array, T: number, realStock: ArrayLike<number>): SamplePicks => {
      mock.calls.push({ idx, T, realStock })
      return mock.picks!(idx.length / T)
    },
  }
})

beforeEach(() => {
  mock.calls.length = 0
  mock.picks = (paths) => ({ earlyCrash: 0, typical: Math.floor(paths / 2), lateCrash: paths - 1, lucky: 1 })
})

// The fixture of the simulate golden in income.test.ts.
const mkt = syntheticMarket(240, [
  { symbol: 'QQQ', alpha: 0.002, beta: 1.2, noise: 0.02, cls: 'etf-equity' },
  { symbol: 'BND', alpha: 0.003, beta: 0.1, noise: 0.01, first: 120 },
])
const holdings = [{ symbol: 'SPY', weight: 0.5 }, { symbol: 'QQQ', weight: 0.3 }, { symbol: 'BND', weight: 0.2 }]
const goldenInputs = (method: PlanInputs['method']): PlanInputs => ({ ...DEFAULT_INPUTS, holdings, method, paths: 300, horizonYears: 25 })

/** A stressed plan (big budget, existing loan, Bangkok move) so paths are clean, bruised and broken. */
const stressed: PlanInputs = normalizeInputs({
  ...goldenInputs('bootstrap'),
  paths: 400,
  horizonYears: 30,
  budget: Object.fromEntries(Object.entries(DEFAULT_INPUTS.budget).map(([k, v]) => [k, v * 1.6])) as unknown as PlanInputs['budget'],
  existingLoan: 300_000,
  homeCityId: 'st-louis',
  destCityId: 'bangkok',
  moveInYears: 3,
})

/** simulate's own recorder for these inputs, rebuilt outside simulate. */
function ownRecorder(market: MarketData, inputs: PlanInputs): { rec: Recorder; paths: number } {
  const n = normalizeInputs(inputs)
  const prep = prepare(market, n.holdings, n.outlook)
  const dest = resolveDestination(n, findCity(CITIES_FIX, n.homeCityId), findCity(CITIES_FIX, n.destCityId))
  const cfg = kernelConfig(n, dest)
  const sc = makeScenarios(prep, n, n.paths)
  const rec = createRecorder(sc.paths, Math.floor(cfg.T / 12))
  runPaths(sc, cfg, rec)
  return { rec, paths: sc.paths }
}

/** Each sample's rows against `rec`; `at` maps the sample's path to its index in `rec`. */
function expectRowsMatch(r: SimulationResult, rec: Recorder, paths: number, at = (path: number) => path) {
  for (const s of r.samples!) {
    const p = at(s.path)
    expect(s.years.length).toBe(r.inputs.horizonYears)
    s.years.forEach((row, y) => {
      const e = (y + 1) * paths + p
      const f = y * paths + p
      expect(row).toEqual({
        netWorth: rec.nw[e],
        portfolio: rec.port[e],
        loan: rec.loan[e],
        ltv: rec.ltv[e],
        borrowed: rec.borrowed[f],
        interest: rec.interest[f],
        forcedSaleSold: rec.forcedSaleSold[f],
      })
    })
  }
}

describe('eVelo sample futures', () => {
  it("each row is the kernel's own per-path figure for that path (clean, bruised and broken paths)", () => {
    const { rec, paths } = ownRecorder(mkt, stressed)
    // Pick one path of each outcome, the bruised one with its first call mid-horizon.
    const of = (o: number) => {
      for (let p = 0; p < paths; p++) if (rec.outcome[p] === o) return p
      throw new Error(`no path with outcome ${o}`)
    }
    const picked = { earlyCrash: of(2), typical: of(0), lateCrash: of(1), lucky: paths - 1 }
    mock.picks = () => picked
    const r = simulate(mkt, CITIES_FIX, stressed)
    expect(r.samples!.map((s) => [s.key, s.path])).toEqual(SAMPLE_KEYS.map((k) => [k, picked[k]]))
    expectRowsMatch(r, rec, paths)
    // The bruised path has a forced sale in its rows; the broken one ends at 0 with ltv 1.
    const bruised = r.samples!.find((s) => s.key === 'lateCrash')!
    expect(bruised.years.some((row) => row.forcedSaleSold > 0)).toBe(true)
    const broken = r.samples!.find((s) => s.key === 'earlyCrash')!.years.at(-1)!
    expect(broken).toMatchObject({ netWorth: 0, portfolio: 0, loan: 0, ltv: 1 })
  })

  it("a sample row equals a 1-path run on that path's own months", () => {
    const n = normalizeInputs(goldenInputs('bootstrap'))
    const r = simulate(mkt, CITIES_FIX, n)
    const prep = prepare(mkt, n.holdings, n.outlook)
    const sc = makeScenarios(prep, n, n.paths)
    const cfg = kernelConfig(n, resolveDestination(n, findCity(CITIES_FIX, n.homeCityId), findCity(CITIES_FIX, n.destCityId)))
    const T = sc.T
    for (const s of r.samples!) {
      const o = s.path * T
      const one = { paths: 1, T, ret: sc.ret.slice(o, o + T), infl: sc.infl.slice(o, o + T), fxz: sc.fxz.slice(o, o + T) }
      const rec1 = createRecorder(1, n.horizonYears)
      runPaths(one, cfg, rec1)
      expectRowsMatch({ ...r, samples: [s] }, rec1, 1, () => 0)
    }
  })

  it('the picker gets the drawn calendar months, the horizon in months and the real stock series', () => {
    const n = normalizeInputs(goldenInputs('bootstrap'))
    simulate(mkt, CITIES_FIX, n)
    expect(mock.calls.length).toBe(1)
    const { idx, T, realStock } = mock.calls[0]
    const sc = generateScenarios(prepare(mkt, n.holdings, n.outlook), 'bootstrap', n.blockMonths, n.paths, n.horizonYears * 12, n.seed, {
      indices: true,
    })
    expect(T).toBe(n.horizonYears * 12)
    expect(Array.from(idx)).toEqual(Array.from(sc.idx!))
    expect(realStock.length).toBe(mkt.months)
  })

  it('under fat-tail there are no sample futures, and the picker is not asked', () => {
    const r = simulate(mkt, CITIES_FIX, goldenInputs('fat-tail'))
    expect(r.samples).toBeNull()
    expect(mock.calls.length).toBe(0)
  })

  it('null picks are skipped; the rest keep SAMPLE_KEYS order', () => {
    mock.picks = () => ({ lucky: 7, lateCrash: null, typical: 3, earlyCrash: null })
    const r = simulate(mkt, CITIES_FIX, goldenInputs('bootstrap'))
    expect(r.samples!.map((s) => [s.key, s.path])).toEqual([
      ['typical', 3],
      ['lucky', 7],
    ])
    mock.picks = () => ({ lucky: null, lateCrash: null, typical: null, earlyCrash: null })
    expect(simulate(mkt, CITIES_FIX, goldenInputs('bootstrap')).samples).toEqual([])
  })

  it("simulate's other figures are unchanged with samples on (the golden from before), and samples are pinned", () => {
    // Same arm64/x64 split as income.test.ts's SIM_BOOTSTRAP.
    const SIM_BOOTSTRAP: Record<string, string> = {
      arm64: '276c6b093ec7d995f8cf7da182f737077f0a15b206233f93630a7f2d78b3db2d',
      x64: '2518efdee8d7deec6194b7e0b5aabe72195fb9d198fbf8e8d6d089603eef7b65',
    }
    // result.samples under the fixed picks (0, 150, 299, 1); an arch without an entry logs its hash.
    const SAMPLES: Record<string, string> = {
      arm64: '78e68c81918044748c31003f2da4a9cea7e5da5a98553bb6b38f88abd21bbf88',
      // From CI's x64 run of a44df52 (identical to arm64).
      x64: '78e68c81918044748c31003f2da4a9cea7e5da5a98553bb6b38f88abd21bbf88',
    }
    const { elapsedMs: _, yearly: __, samples, ...rest } = simulate(mkt, CITIES_FIX, goldenInputs('bootstrap'))
    expect(createHash('sha256').update(JSON.stringify(rest)).digest('hex')).toBe(SIM_BOOTSTRAP[process.arch] ?? SIM_BOOTSTRAP.x64)
    expect(samples!.map((s) => s.path)).toEqual([0, 150, 299, 1])
    const h = createHash('sha256').update(JSON.stringify(samples)).digest('hex')
    if (SAMPLES[process.arch]) expect(h).toBe(SAMPLES[process.arch])
    else console.log(`no samples golden for ${process.arch}: ${h}`)
  })
})
