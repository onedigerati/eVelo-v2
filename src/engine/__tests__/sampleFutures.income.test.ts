// The income engine's sample futures: with the picker mocked to fixed picks, each sample row is that
// path's own figures; fat-tail gives none; null picks are skipped; every other figure is unchanged.
import { createHash } from 'node:crypto'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import marketJson from '../../data/market.json'
import { INCOME_DEFAULTS, runIncomeOnMonths, runIncomePaths } from '../income'
import type { IncomeInputs, IncomeResult } from '../incomeTypes'
import { pickSampleFutures, realStockMonthly, type SamplePicks } from '../sampleFutures'
import type { MarketData } from '../types'

const PICKS: SamplePicks = { earlyCrash: 7, typical: 21, lateCrash: null, lucky: 7 }

vi.mock('../sampleFutures', async (importActual) => {
  const actual = await importActual<typeof import('../sampleFutures')>()
  return {
    ...actual,
    realStockMonthly: vi.fn(() => new Float64Array(0)),
    pickSampleFutures: vi.fn(() => ({ ...PICKS })),
  }
})

const market = marketJson as unknown as MarketData
const inputs: IncomeInputs = {
  ...INCOME_DEFAULTS,
  portfolio: 1_500_000,
  spending: 60_000,
  otherIncome: 30_000,
  incomeStartAge: 67,
  age: 60,
  horizonYears: 25,
  paths: 60,
  seed: 5,
}
const T = inputs.horizonYears * 12
const sha = (x: unknown) => createHash('sha256').update(JSON.stringify(x) ?? 'none').digest('hex')
const withoutSamples = (r: IncomeResult) => {
  const { samples, ...rest } = r
  void samples
  return rest
}

beforeEach(() => vi.mocked(pickSampleFutures).mockClear())

describe('income sample futures', () => {
  it('picks from the drawn months before settling, one entry per non-null pick in SAMPLE_KEYS order', () => {
    const r = runIncomePaths(market, inputs)
    expect(vi.mocked(pickSampleFutures)).toHaveBeenCalledTimes(1)
    const [idx, t] = vi.mocked(pickSampleFutures).mock.calls[0]
    expect(t).toBe(T)
    expect(idx.length).toBe(inputs.paths * T)
    expect(vi.mocked(realStockMonthly)).toHaveBeenCalledWith(market)
    expect(r.samples!.map((s) => [s.key, s.path])).toEqual([
      ['earlyCrash', 7],
      ['typical', 21],
      ['lucky', 7],
    ])
    for (const s of r.samples!) expect(s.years).toHaveLength(inputs.horizonYears)
    // The same path picked twice gives equal, separate rows.
    expect(r.samples![2].years).toEqual(r.samples![0].years)
    expect(r.samples![2].years).not.toBe(r.samples![0].years)
  })

  it("each row equals that path's own figures, year by year, to the cent", () => {
    const r = runIncomePaths(market, inputs)
    const idx = vi.mocked(pickSampleFutures).mock.calls[0][0]
    for (const s of r.samples!) {
      const months = idx.slice(s.path * T, (s.path + 1) * T)
      // One path: its medians are the path itself.
      const one = runIncomeOnMonths(market, inputs, months, null)
      expect(one.samples).toBeNull()
      s.years.forEach((y, i) => {
        const m = one.median[i]
        expect(y.portfolio).toBeCloseTo(one.value.p50[i + 1], 2)
        expect(y.dividendsInterest).toBeCloseTo(m.dividends + m.muniInterest + m.taxableInterest + m.treasuryInterest, 2)
        expect(y.socialSecurity).toBeCloseTo(m.otherIncome, 2)
        expect(y.sold).toBeCloseTo(m.gapSold, 2)
        expect(y.tax).toBeCloseTo(m.tax, 2)
        expect(y.reinvested).toBeCloseTo(m.reinvested, 2)
      })
      // And exactly the rows the same path records when run alone.
      const alone = runIncomeOnMonths(market, inputs, months, { earlyCrash: null, typical: 0, lateCrash: null, lucky: null })
      expect(alone.samples).toEqual([{ key: 'typical', path: 0, years: s.years }])
    }
    // The rows exercise every flow somewhere (Social Security arrives at 67; this plan sells and reinvests).
    const all = r.samples!.flatMap((s) => s.years)
    for (const f of ['dividendsInterest', 'socialSecurity', 'sold', 'tax', 'reinvested'] as const)
      expect(all.some((y) => y[f] > 0)).toBe(true)
  })

  it('under fat-tail there are none, and the picker is not asked', () => {
    const r = runIncomePaths(market, { ...inputs, method: 'fat-tail' })
    expect(r.samples).toBeNull()
    expect(vi.mocked(pickSampleFutures)).not.toHaveBeenCalled()
    const idx = new Int32Array(T)
    expect(runIncomeOnMonths(market, { ...inputs, method: 'fat-tail' }, idx, { ...PICKS, typical: 0, earlyCrash: 0, lucky: 0 }).samples).toBeNull()
  })

  it('skips null picks; all null gives an empty list; a pick outside the paths throws', () => {
    const idx = new Int32Array(2 * T)
    const none = { earlyCrash: null, typical: null, lateCrash: null, lucky: null }
    expect(runIncomeOnMonths(market, inputs, idx, none).samples).toEqual([])
    expect(runIncomeOnMonths(market, inputs, idx, { ...none, lateCrash: 1 }).samples!.map((s) => s.key)).toEqual(['lateCrash'])
    expect(() => runIncomeOnMonths(market, inputs, idx, { ...none, lucky: 2 })).toThrow(/out of range/)
  })

  it('leaves every other figure unchanged', () => {
    const r = runIncomePaths(market, inputs)
    const idx = vi.mocked(pickSampleFutures).mock.calls[0][0]
    expect(withoutSamples(r)).toEqual(withoutSamples(runIncomeOnMonths(market, inputs, idx, null)))
  })

  // Captured at c16fa42, before the samples existed: the result (bootstrap, fat-tail) hashed whole,
  // so the narrowed hash proves every older figure bit-identical. Then the samples on their own
  // (fixed picks, so the golden doesn't hang on the picker). Like simulate's, these may differ by
  // arch in the last bits; an arch without an entry logs its hashes instead.
  const GOLDEN: Record<string, { bootstrap: string; 'fat-tail': string; samples: string }> = {
    arm64: {
      bootstrap: '2de684351760de626bffcd030fa21d1a5c634f4c49fe4a65ee8cf0ea5f86b1b9',
      'fat-tail': '6e718a1d1e774ae53b545f637b3fe13077ec4d427ae5dc7305038bb4a4e0fa84',
      samples: 'be41593837be084e341b53253b39fba3cfb2e73e65067d41c315afd6d82d6b2f',
    },
  }
  it('goldens: the result without samples is bit-identical to before; the samples are pinned', () => {
    const g = GOLDEN[process.arch]
    const got = {
      bootstrap: sha(withoutSamples(runIncomePaths(market, { ...INCOME_DEFAULTS, paths: 300 }))),
      'fat-tail': sha(withoutSamples(runIncomePaths(market, { ...INCOME_DEFAULTS, paths: 300, method: 'fat-tail' }))),
      samples: sha(runIncomePaths(market, { ...INCOME_DEFAULTS, paths: 300 }).samples),
    }
    if (g) expect(got).toEqual(g)
    else console.log(`no income goldens for ${process.arch}:`, JSON.stringify(got))
  })
})
