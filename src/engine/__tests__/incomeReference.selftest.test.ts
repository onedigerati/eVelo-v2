// Hand-computed sanity checks of the income reference itself, on a synthetic constant market.
import { describe, expect, it } from 'vitest'
import { referenceIncome, SLEEVES, type RefInputs } from './incomeReference'
import type { MarketData } from '../types'

const M = 101

/** Constant monthly return r, yield y (per sleeve) and CPI. */
function market(opts: { r?: number[]; y: number[]; cpi?: number; ySeries?: Record<string, number[]> }): MarketData {
  const assets: MarketData['assets'] = {}
  SLEEVES.forEach((sym, i) => {
    const y = opts.y[i]
    assets[sym] = {
      symbol: sym,
      name: sym,
      cls: sym === 'SPY' ? 'etf-equity' : 'etf-bond',
      first: 0,
      r: new Array(M).fill(opts.r ? opts.r[i] : y / 12), // default: V constant (r = y/12)
      y: opts.ySeries?.[sym] ?? new Array(M).fill(y),
    }
  })
  return { asOf: '2026-11-18', start: '2000-01', months: M, cpi: new Array(M).fill(opts.cpi ?? 0), assets }
}

const base: RefInputs = {
  portfolio: 100_000,
  basisFraction: 1,
  age: 50,
  horizonYears: 2,
  spending: 1_000,
  otherIncome: 0,
  incomeStartAge: 67,
  stockShare: 1,
  muniShare: 0,
  filingStatus: 'single',
  homeCityId: 'london', // foreign: federal only
  outlook: 'historical',
}

const idx = (years: number, paths = 1, month = 10) => new Int32Array(paths * years * 12).fill(month)

describe('income reference self-test', () => {
  it('income = V·y, untaxed below the deduction, surplus reinvested', () => {
    const res = referenceIncome(market({ y: [0.02, 0.03, 0.04, 0.05] }), base, idx(2))
    const [p] = res.paths
    expect(res.startYield).toEqual({ stocks: 0.02, munis: 0.03, taxable: 0.045 })
    expect(p.rows[0].dividends).toBeCloseTo(2_000, 6)
    expect(p.rows[0].tax).toBe(0)
    expect(p.rows[0].reinvested).toBeCloseTo(1_000, 6)
    expect(p.rows[0].value).toBeCloseTo(101_000, 6)
    expect(p.rows[1].dividends).toBeCloseTo(2_020, 6)
    expect(p.values[2]).toBeCloseTo(102_020, 6)
    expect(p.lasts && p.principalKept && p.keepsPace).toBe(true)
  })

  it('splits income by type to the sleeve weights', () => {
    const inp = { ...base, stockShare: 0.5, muniShare: 0.5, horizonYears: 1 }
    const [p] = referenceIncome(market({ y: [0.02, 0.03, 0.04, 0.05] }), inp, idx(1)).paths
    expect(p.rows[0].dividends).toBeCloseTo(50_000 * 0.02, 6)
    expect(p.rows[0].muniInterest).toBeCloseTo(25_000 * 0.03, 6)
    expect(p.rows[0].treasuryInterest).toBeCloseTo(12_500 * 0.04, 6)
    expect(p.rows[0].taxableInterest).toBeCloseTo(12_500 * 0.05, 6)
  })

  it('reports real amounts under constant inflation', () => {
    const cpi = 0.002
    const P = (1 + cpi) ** 12
    const inp = { ...base, horizonYears: 1 }
    const [p] = referenceIncome(market({ y: [0.02, 0.02, 0.02, 0.02], cpi }), inp, idx(1)).paths
    expect(p.rows[0].dividends).toBeCloseTo(2_000 / P, 6)
    expect(p.rows[0].spending).toBe(1_000)
    expect(p.rows[0].reinvested).toBeCloseTo((2_000 - 1_000 * P) / P, 6)
  })

  it('taxes qualified dividends at 0/15% (federal only, foreign home)', () => {
    // 200k dividends single: taxable 183,900; 15% over 49,450 = 20,167.50; NIIT 0 at exactly 200k.
    const inp = { ...base, portfolio: 10_000_000, spending: 100_000, horizonYears: 1 }
    const [p] = referenceIncome(market({ y: [0.02, 0.02, 0.02, 0.02] }), inp, idx(1)).paths
    expect(p.rows[0].tax).toBeCloseTo(20_167.5, 4)
    expect(p.rows[0].reinvested).toBeCloseTo(79_832.5, 4)
  })

  it('a gap sale with no gain', () => {
    const inp = { ...base, spending: 5_000, horizonYears: 1 }
    const [p] = referenceIncome(market({ y: [0.02, 0.02, 0.02, 0.02] }), inp, idx(1)).paths
    expect(p.rows[0].gapSold).toBeCloseTo(3_000, 6)
    expect(p.rows[0].value).toBeCloseTo(97_000, 6)
    expect(p.principalKept).toBe(false)
    expect(p.lasts).toBe(true)
  })

  it('a gap sale with gains solves S = 120,167.50 + 0.094·S', () => {
    // 10M in SPY, 200k dividends, need 300k, basis 1/2: gain = S/2 at 15% + 3.8% NIIT.
    const inp = { ...base, portfolio: 10_000_000, spending: 300_000, basisFraction: 0.5, horizonYears: 1 }
    const [p] = referenceIncome(market({ y: [0.02, 0.02, 0.02, 0.02] }), inp, idx(1)).paths
    const S = 120_167.5 / 0.906
    expect(Math.abs(p.rows[0].gapSold - S)).toBeLessThan(1)
    expect(p.rows[0].tax + 300_000).toBeCloseTo(200_000 + p.rows[0].gapSold, 6) // cash balances
    expect(p.rows[0].value).toBeCloseTo(10_000_000 - p.rows[0].gapSold, 4)
  })

  it('fails when the portfolio cannot cover the gap, and stays failed', () => {
    const inp = { ...base, portfolio: 10_000, spending: 50_000, horizonYears: 3 }
    const [p] = referenceIncome(market({ y: [0.02, 0.02, 0.02, 0.02] }), inp, idx(3)).paths
    expect(p.values).toEqual([10_000, 0, 0, 0])
    expect(p.rows[0].gapSold).toBeCloseTo(10_000, 6)
    expect(p.lasts || p.principalKept || p.keepsPace).toBe(false)
  })

  it('caps Δy at its 99th percentile and floors the yield at 0.25%', () => {
    const y = Array.from({ length: M }, (_, m) => 0.01 + 0.0001 * m + (m >= 50 ? 0.01 : 0))
    const res = referenceIncome(
      market({ y: [0.001, 0.02, 0.02, 0.02], ySeries: { SPY: y.map(() => 0.001), VWITX: y } }),
      { ...base, horizonYears: 1 },
      idx(1, 1, 50),
    )
    // 99 diffs of 0.0001 and one of 0.0101: position 98.01 of the sorted 100.
    expect(res.caps.VWITX).toBeCloseTo(0.0001 + 0.01 * 0.01, 12)
    // SPY starts at 0.001 (used in month 1), then floors to 0.0025 for months 2..12.
    expect(res.paths[0].rows[0].dividends).toBeCloseTo((100_000 * 0.001) / 12 + (11 * 100_000 * 0.0025) / 12, 0)
  })
})
