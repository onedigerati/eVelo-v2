// Cross-check: the engine (runIncomeOnMonths) against the independent scalar reference
// (incomeReference.ts), written separately from the same spec, on the real market data and random
// inputs and months. Per path, every year row field, the value and after-tax income, and the three
// booleans must agree; over the paths together, the medians and the three rates.
import { describe, expect, it } from 'vitest'
import marketJson from '../../data/market.json'
import { CITIES } from '../../data/cities'
import { STATE_INCOME_TAX } from '../../data/stateIncomeTax'
import { INCOME_DEFAULTS, runIncomeOnMonths } from '../income'
import type { IncomeInputs, IncomeResult, IncomeYearRow } from '../incomeTypes'
import { createRng } from '../rng'
import { quantile } from '../simulate'
import type { MarketData, Outlook } from '../types'
import { referenceIncome, type RefPath, type RefYearRow } from './incomeReference'

const market = marketJson as unknown as MarketData
const CASES = 240
const PATHS = 3
const US = Object.keys(STATE_INCOME_TAX)
const ABROAD = CITIES.filter((c) => c.countryCode !== 'US').map((c) => c.id)
const OUTLOOKS: Outlook[] = ['historical', 'balanced', 'conservative']
const FIELDS = ['dividends', 'muniInterest', 'taxableInterest', 'treasuryInterest', 'otherIncome', 'tax', 'spending', 'gapSold', 'reinvested', 'value'] as const

/** Within a cent, or 1e-9 relative for large amounts. */
function close(a: number, b: number): boolean {
  return Math.abs(a - b) <= Math.max(0.01, 1e-9 * Math.max(Math.abs(a), Math.abs(b)))
}

describe('engine vs the independent reference', () => {
  it(`agrees on ${CASES} random plans × ${PATHS} paths on the real data`, () => {
    const rng = createRng(20261118)
    const u = (lo: number, hi: number) => lo + (hi - lo) * rng.next()
    const pick = <T,>(a: readonly T[]) => a[rng.int(a.length)]
    const M = market.months
    const misses: string[] = []
    const miss = (c: number, what: string, a: number | boolean, b: number | boolean) => {
      if (misses.length < 20) misses.push(`case ${c} ${what}: engine ${a}, reference ${b}`)
    }
    const seen = { gap: 0, failed: 0, kept: 0, pace: 0, us: 0, mfj: 0, over65: 0, other: 0 }

    for (let c = 0; c < CASES; c++) {
      const portfolio = Math.round(Math.exp(u(Math.log(2e5), Math.log(1e7))))
      const stockShare = rng.next() < 0.15 ? pick([0, 1]) : u(0, 1)
      const muniShare = rng.next() < 0.15 ? pick([0, 1]) : u(0, 1)
      const age = 55 + rng.int(21)
      const homeCityId = rng.next() < 0.6 ? pick(US) : pick(ABROAD)
      const inputs: IncomeInputs = {
        ...INCOME_DEFAULTS,
        portfolio,
        basisFraction: rng.next() < 0.1 ? pick([0, 1]) : u(0, 1),
        age,
        horizonYears: 5 + rng.int(36),
        // Portfolio income is about 1.5-4% of the value: from a third of it to several times it.
        spending: Math.round(portfolio * Math.exp(u(Math.log(0.005), Math.log(0.15)))),
        otherIncome: rng.next() < 0.4 ? 0 : Math.round(u(5_000, 80_000)),
        incomeStartAge: 60 + rng.int(11),
        stockShare,
        muniShare,
        filingStatus: rng.next() < 0.5 ? 'single' : 'mfj',
        homeCityId,
        outlook: pick(OUTLOOKS),
        paths: PATHS,
      }
      const T = inputs.horizonYears * 12
      const idx = Int32Array.from({ length: PATHS * T }, () => rng.int(M))

      const ref = referenceIncome(market, inputs, idx)
      const all = runIncomeOnMonths(market, inputs, idx)
      expect(all.startYield).toEqual(ref.startYield)

      // Per path: the engine on that path alone, whose medians are the path itself.
      for (let p = 0; p < PATHS; p++) {
        const one = runIncomeOnMonths(market, inputs, idx.slice(p * T, (p + 1) * T))
        const rp = ref.paths[p]
        expect(one.startYield).toEqual(ref.startYield)
        for (let k = 0; k < inputs.horizonYears; k++) {
          const er = one.median[k], rr = rp.rows[k]
          expect(er.year).toBe(rr.year)
          expect(er.age).toBe(rr.age)
          for (const f of FIELDS) if (!close(er[f], rr[f])) miss(c, `path ${p} year ${k + 1} ${f}`, er[f], rr[f])
          if (!close(one.afterTaxIncome.p50[k], rr.afterTaxIncome)) miss(c, `path ${p} year ${k + 1} after-tax`, one.afterTaxIncome.p50[k], rr.afterTaxIncome)
          if (!close(one.value.p50[k + 1], rp.values[k + 1])) miss(c, `path ${p} value ${k + 1}`, one.value.p50[k + 1], rp.values[k + 1])
        }
        const b = (x: number) => x === 1
        if (b(one.lastsRate) !== rp.lasts) miss(c, `path ${p} lasts`, b(one.lastsRate), rp.lasts)
        if (b(one.principalKeptRate) !== rp.principalKept) miss(c, `path ${p} principalKept`, b(one.principalKeptRate), rp.principalKept)
        if (b(one.keepsPaceRate) !== rp.keepsPace) miss(c, `path ${p} keepsPace`, b(one.keepsPaceRate), rp.keepsPace)
        if (rp.rows.some((r) => r.gapSold > 0)) seen.gap++
        if (!rp.lasts) seen.failed++
        if (rp.principalKept) seen.kept++
        if (rp.keepsPace) seen.pace++
      }

      // Over the paths: the rates from the reference's booleans, and the per-year medians.
      compareAggregate(c, all, ref.paths, miss)
      if (US.includes(homeCityId)) seen.us++
      if (inputs.filingStatus === 'mfj') seen.mfj++
      if (age + inputs.horizonYears > 65) seen.over65++
      if (inputs.otherIncome > 0) seen.other++
    }

    console.log(`cross-check: ${CASES} plans × ${PATHS} paths;`, JSON.stringify(seen))
    expect(misses).toEqual([])
    // The draw reached every branch: gap sales, failures, kept principal, both ways of keeping pace.
    expect(seen.gap).toBeGreaterThan(50)
    expect(seen.failed).toBeGreaterThan(20)
    expect(seen.kept).toBeGreaterThan(50)
    expect(seen.pace).toBeGreaterThan(20)
    expect(seen.pace).toBeLessThan(CASES * PATHS - 20)
    expect(seen.us).toBeGreaterThan(CASES / 3)
    expect(seen.us).toBeLessThan(CASES - CASES / 5)
  })
})

function compareAggregate(
  c: number,
  all: IncomeResult,
  paths: RefPath[],
  miss: (c: number, what: string, a: number, b: number) => void,
): void {
  const share = (f: (p: RefPath) => boolean) => paths.filter(f).length / paths.length
  if (all.lastsRate !== share((p) => p.lasts)) miss(c, 'lastsRate', all.lastsRate, share((p) => p.lasts))
  if (all.principalKeptRate !== share((p) => p.principalKept)) miss(c, 'principalKeptRate', all.principalKeptRate, share((p) => p.principalKept))
  if (all.keepsPaceRate !== share((p) => p.keepsPace)) miss(c, 'keepsPaceRate', all.keepsPaceRate, share((p) => p.keepsPace))
  const med = (k: number, f: keyof RefYearRow) => quantile(Float64Array.from(paths, (p) => p.rows[k][f]).sort(), 0.5)
  all.median.forEach((row: IncomeYearRow, k) => {
    for (const f of FIELDS) if (!close(row[f], med(k, f))) miss(c, `median year ${k + 1} ${f}`, row[f], med(k, f))
    if (!close(all.afterTaxIncome.p50[k], med(k, 'afterTaxIncome'))) miss(c, `median after-tax ${k + 1}`, all.afterTaxIncome.p50[k], med(k, 'afterTaxIncome'))
  })
}
