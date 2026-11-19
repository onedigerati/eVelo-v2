import { describe, expect, it } from 'vitest'
import marketJson from '../market.json'
import sourcesJson from '../income-yield-sources.json'
import type { MarketData } from '../../engine/types'
import {
  impliedPayouts,
  incomeYield,
  incomeYieldDetail,
  median,
  monthlyDistributions,
  // @ts-expect-error plain JS build script
} from '../../../scripts/income-yield.mjs'
// @ts-expect-error plain JS build script
import { buildIndex, INDEX_HIDDEN } from '../../../scripts/build-market-index.mjs'
import indexJson from '../market-index.json'

const market = marketJson as unknown as MarketData
const FUNDS = ['VWITX', 'VFITX', 'VBMFX']
const INCOME = ['SPY', ...FUNDS]

const monthIdx = (m: string) => {
  const [y, mm] = m.split('-').map(Number)
  const [y0, m0] = market.start.split('-').map(Number)
  return (y - y0) * 12 + (mm - m0)
}
const yearMean = (sym: string, year: number) => {
  const y = market.assets[sym].y!
  const xs = y.slice(Math.max(0, monthIdx(`${year}-01`)), monthIdx(`${year}-12`) + 1)
  return xs.reduce((s, x) => s + x, 0) / xs.length
}

describe('bundled bond funds', () => {
  it('starts on the calendar', () => expect(market.start).toBe('1993-02'))

  it.each(FUNDS)('%s is a real series from 1993-02 (first = 0, no backfill)', (sym) => {
    const a = market.assets[sym]
    expect(a).toBeDefined()
    expect(a.cls).toBe('etf-bond')
    expect(a.first).toBe(0)
    expect(a.r).toHaveLength(market.months)
    expect(a.r.every((x) => typeof x === 'number' && Number.isFinite(x))).toBe(true)
    // Real history, not a copy of another series: its own returns, bond-like volatility.
    const first12 = a.r.slice(0, 12) as number[]
    expect(new Set(first12).size).toBeGreaterThan(6)
    expect(Math.max(...first12.map(Math.abs))).toBeLessThan(0.05)
    for (const other of Object.values(market.assets))
      if (other.symbol !== sym) expect(other.r.slice(0, 12)).not.toEqual(first12)
  })
})

describe('income yield series', () => {
  it('only income assets carry y', () => {
    const withY = Object.values(market.assets).filter((a) => a.y).map((a) => a.symbol).sort()
    expect(withY).toEqual([...INCOME].sort())
  })

  it.each(INCOME)('%s has a full, sane monthly y aligned with r', (sym) => {
    const a = market.assets[sym]
    expect(a.y).toHaveLength(a.r.length)
    expect(a.y).toHaveLength(market.months)
    for (const v of a.y!) {
      expect(Number.isFinite(v)).toBe(true)
      expect(v).toBeGreaterThan(0)
      expect(v).toBeLessThan(0.1)
    }
  })

  it('records where each month of y came from, for the same calendar', () => {
    expect(sourcesJson.asOf).toBe(market.asOf)
    expect(sourcesJson.start).toBe(market.start)
    expect(Object.keys(sourcesJson.assets).sort()).toEqual([...INCOME].sort())
    for (const sym of INCOME) {
      const src = (sourcesJson.assets as Record<string, string>)[sym]
      expect(src).toHaveLength(market.months)
      expect(src).toMatch(/^B*[EIC]*$/)
    }
  })

  it.each(INCOME)('%s: the last 12 months of y rest on real or implied payouts, not copies', (sym) => {
    const src = (sourcesJson.assets as Record<string, string>)[sym]
    expect(src.slice(-12)).toMatch(/^[EI]{12}$/)
    // A copy repeats the previous value exactly; a recomputed month moves with the price.
    const y = market.assets[sym].y!.slice(-13)
    const repeats = y.slice(1).filter((v, i) => v === y[i]).length
    expect(repeats).toBeLessThan(6)
  })

  it('SPY has no warm-up jump: 1993 is flat until its first full window', () => {
    const y = market.assets.SPY.y!
    const first = (sourcesJson.assets.SPY as string).indexOf('E')
    expect(first).toBeGreaterThan(0)
    for (let i = 0; i < first; i++) expect(y[i]).toBe(y[first])
    // 1993-06, when the partial first quarter used to pull the median down, sits with its neighbours.
    const i = monthIdx('1993-06')
    expect(Math.abs(y[i] / y[i - 1] - 1)).toBeLessThan(0.05)
  })

  it('matches known yield points', () => {
    // VWITX: ~6% in 1993, ~2.5-3% in 2025
    expect(yearMean('VWITX', 1993)).toBeGreaterThan(0.05)
    expect(yearMean('VWITX', 1993)).toBeLessThan(0.07)
    expect(yearMean('VWITX', 2025)).toBeGreaterThan(0.02)
    expect(yearMean('VWITX', 2025)).toBeLessThan(0.035)
    // SPY: ~2.4% in 1993, ~1.1% in 2025
    expect(yearMean('SPY', 1993)).toBeGreaterThan(0.02)
    expect(yearMean('SPY', 1993)).toBeLessThan(0.03)
    expect(yearMean('SPY', 2025)).toBeGreaterThan(0.009)
    expect(yearMean('SPY', 2025)).toBeLessThan(0.014)
    // Taxable funds tracked the rate cycle: high in 1993, a trough around 2021, back up by 2025.
    for (const sym of ['VFITX', 'VBMFX']) {
      expect(yearMean(sym, 1993)).toBeGreaterThan(0.05)
      expect(yearMean(sym, 2021)).toBeLessThan(0.025)
      expect(yearMean(sym, 2025)).toBeGreaterThan(yearMean(sym, 2021))
    }
  })
})

describe('market index', () => {
  it('keeps the hidden-mode bond funds out of the ticker index', () => {
    expect([...INDEX_HIDDEN].sort()).toEqual([...FUNDS].sort())
    const listed = indexJson.assets.map((a) => a.symbol)
    for (const sym of FUNDS) {
      expect(market.assets[sym]).toBeDefined()
      expect(listed).not.toContain(sym)
    }
    expect(buildIndex(market).assets.map((a: { symbol: string }) => a.symbol)).toEqual(listed)
    expect(listed).toContain('SPY')
  })
})

describe('incomeYield (pure)', () => {
  const cal: string[] = []
  for (let y = 2000; y <= 2002; y++) for (let m = 1; m <= 12; m++) cal.push(`${y}-${String(m).padStart(2, '0')}`)
  const closes = new Map(cal.map((m) => [m, 10]))

  it('median', () => {
    expect(median([3, 1, 2])).toBe(2)
    expect(median([4, 1, 3, 2])).toBe(2.5)
  })

  it('rejects lump distributions in a monthly payer', () => {
    const dists = new Map(cal.map((m) => [m, 0.05]))
    dists.set('2001-06', 0.05 + 1.2) // capital-gain lump paid with the regular income
    dists.set('2001-12', 0.9)
    const y = incomeYield(cal, dists, closes, 12)
    for (const v of y) expect(v).toBeCloseTo(0.06, 6)
  })

  it('annualises a quarterly payer and absorbs slipped payments', () => {
    const dists = new Map<string, number>()
    for (const m of cal) if (['03', '06', '09', '12'].includes(m.slice(5))) dists.set(m, 0.1)
    // One payment slips into the next month; the empty month is ignored.
    dists.delete('2001-09')
    dists.set('2001-10', 0.1)
    const y = incomeYield(cal, dists, closes, 4)
    // Before the first payment, back-filled from the first computed month.
    expect(y[0]).toBeCloseTo(0.04, 6)
    for (const v of y) expect(v).toBeCloseTo(0.04, 6)
  })

  it('uses the price of the month and carries gaps forward', () => {
    const dists = new Map(cal.map((m) => [m, 0.05]))
    const c = new Map(closes)
    c.set('2002-01', 20)
    c.delete('2002-02')
    const y = incomeYield(cal, dists, c, 12)
    expect(y[cal.indexOf('2002-01')]).toBeCloseTo(0.03, 6)
    expect(y[cal.indexOf('2002-02')]).toBeCloseTo(0.03, 6)
    expect(y[cal.indexOf('2002-03')]).toBeCloseTo(0.06, 6)
  })

  it('buckets Yahoo dividend events by month', () => {
    const t = (d: string) => Date.parse(`${d}T14:30:00Z`) / 1000
    const m = monthlyDistributions({
      a: { amount: 0.04, date: t('2020-01-31') },
      b: { amount: 0.5, date: t('2020-01-15') },
      c: { amount: 0.04, date: t('2020-02-28') },
    })
    expect(m.get('2020-01')).toBeCloseTo(0.54, 9)
    expect(m.get('2020-02')).toBe(0.04)
  })

  it('ignores non-numeric and non-finite amounts', () => {
    const t = Date.parse('2020-01-15T14:30:00Z') / 1000
    const m = monthlyDistributions({
      a: { amount: 0.04, date: t },
      b: { amount: '0.5', date: t },
      c: { amount: NaN, date: t },
      d: { amount: Infinity, date: t },
      e: { amount: null, date: t },
      f: { date: t },
    })
    expect(m.get('2020-01')).toBe(0.04)
    expect(m.size).toBe(1)
  })

  it('implies a payout from adjusted against raw close', () => {
    // Raw close 10 -> 10.1 with a 0.05 payout reinvested: adj grows by (10.1 + 0.05) / 10.
    const raw = new Map([['2020-01', 10], ['2020-02', 10.1], ['2020-03', 9.9], ['2020-04', 10]])
    const adj = new Map([['2020-01', 5], ['2020-02', 5 * 1.015], ['2020-03', 5 * 1.015 * (9.9 / 10.1)], ['2020-04', 5]])
    const p = impliedPayouts(adj, raw)
    expect(p.has('2020-01')).toBe(false) // no previous month
    expect(p.get('2020-02')).toBeCloseTo(0.05, 9)
    expect(p.get('2020-03')).toBeCloseTo(0, 9) // price move only
    expect(p.get('2020-04')).toBe(0) // adj fell more than the price: floored at 0
  })

  it('fills a monthly payer\'s missing events with implied payouts, and only a monthly payer\'s', () => {
    const dists = new Map(cal.filter((m) => m < '2002-03').map((m) => [m, 0.05]))
    const implied = new Map(cal.map((m) => [m, 0.0501]))
    implied.set('2002-07', 0.0001 * 10 * 0.5) // noise below the threshold: not a payment
    const d = incomeYieldDetail(cal, dists, closes, 12, implied)
    expect(d.implied).toEqual(cal.filter((m) => m >= '2002-03' && m !== '2002-07'))
    expect(d.copied).toEqual([])
    expect(d.src.slice(-10)).toBe('IIIIIIIIII')
    expect(d.paid.at(-1)).toBe(11)
    for (const v of d.y.slice(12)) expect(v).toBeGreaterThanOrEqual(0.06)
    // Without implied payouts the window drains to the two event months.
    const bare = incomeYieldDetail(cal, dists, closes, 12)
    expect(bare.implied).toEqual([])
    expect(bare.paid.at(-1)).toBe(2)
    // A quarterly payer is never filled.
    expect(incomeYieldDetail(cal, dists, closes, 4, implied).implied).toEqual([])
  })

  it('back-fills the warm-up so a partial first payment leaves no jump', () => {
    const c = new Map([...closes].filter(([m]) => m >= '2000-02'))
    const dists = new Map<string, number>([['2000-03', 0.03]])
    for (const m of cal) if (m > '2000-03' && ['03', '06', '09', '12'].includes(m.slice(5))) dists.set(m, 0.1)
    const d = incomeYieldDetail(cal, dists, c, 4)
    // The first window that lies wholly inside the price history ends at 2001-02.
    expect(d.src.indexOf('E')).toBe(cal.indexOf('2001-02'))
    expect(d.backfilled).toHaveLength(cal.indexOf('2001-02'))
    for (const v of d.y.slice(0, cal.indexOf('2001-03'))) expect(v).toBeCloseTo(0.04, 6)
  })
})
