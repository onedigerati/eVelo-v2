// Independent reference implementation of the stage 3 income engine (docs/specs/income-engine.md).
// Test-only. Plain scalar code, one path at a time, written to be read, not to be fast.
//
// AMBIGUITIES: (how this reference reads the spec where it could be read more than one way)
//  A1. Δy for calendar month 0 (no month −1) is taken as 0. For months 1..M−1 Δy is demeaned
//      (spec, Resolved point 1): Δy[c] = y[c] − y[c−1] − mean of those M−1 raw changes.
//  A2. CAP = 99th percentile of the demeaned |Δy| over calendar months 1..M−1, using the same
//      linear-interpolation quantile as simulate.ts (pos = (n − 1)·q on the sorted values). The clamp
//      applies to the demeaned change.
//  A3. Order within a month: income and the value update use the yield in force at the start of the
//      month; the yield is updated with that month's Δy at month end. So month 1 of year 1 uses
//      exactly the latest market.json yield (startYield), and income is V·y/12 with it.
//  A4. r comes from prepare(market, [the four sleeves], outlook).R, i.e. the outlook-shrunk series,
//      in double precision (not the Float32-rounded scenario returns). CPI is market.cpi in double.
//  A5. Starting sleeves: SPY = stockShare·portfolio; VWITX = (1−stockShare)·muniShare·portfolio;
//      VFITX = VBMFX = (1−stockShare)·(1−muniShare)/2·portfolio. Basis = basisFraction × each sleeve.
//      Surplus is reinvested to these same target weights.
//  A6. Age in simulated year t (1-based) is age + t − 1 (the age during the year, matching eVelo's
//      incomeStartMonth = (incomeStartAge − age)·12). Other income is counted when that age ≥
//      incomeStartAge; over65 is 2 (MFJ) or 1 (single) when that age ≥ 65. Row `age` is that age.
//  A7. Tax year = 2026 + (t − 1): year 1 is tax year 2026 (the "t" in the spec read as years elapsed
//      at the start of the year, 0-based).
//  A8. Gap iteration: S₀ = need − (cashIn − tax(no sale)); S_{k+1} = need − cashIn + tax(S_k), at most
//      6 updates, stopping when |S_{k+1} − S_k| < $1 nominal. The gain on a sale S is
//      Σ_i S·V_i/ΣV·(1 − B_i/V_i), netted across sleeves (a net loss passes as 0). The tax recorded is
//      the one that balances the cash exactly: tax = cashIn + S_final − need (= tax(S_{final−1})).
//  A9. Failure: the final S exceeds ΣV (strictly). The path fails that year: everything is sold
//      (gapSold = ΣV, real), tax recorded = tax with the whole portfolio sold, value 0. Later years
//      record no portfolio income, gapSold 0, reinvested 0, value 0, but otherIncome (when eligible)
//      and the tax on it are still recorded. lasts = false. Every year from the failure year on
//      counts as not keeping pace.
//  A10. Row `spending` is the need (spending in real terms, constant), even in a failed year.
//  A11. After-tax income for keepsPace = (portfolio income + otherIncome − tax) real, where tax
//      includes the tax on gap-sale gains. Keeps pace iff every year's ≥ 0.9 × year one's.
//  A12. Basis after a pro-rata sale: B_i ← B_i·(1 − sale_i/V_i) (average cost). A sleeve at V = 0 has
//      no sale and no gain. Basis is not touched by monthly returns.
//  A13. A gap year is cashIn − tax < need strictly; principalKept = no gap year (a failed year is one).

import { incomeTax } from '../incomeTax'
import { prepare } from '../prepare'
import { stateIncomeTaxFor } from '../../data/stateIncomeTax'
import type { FilingStatus } from '../incomeTaxTypes'
import type { MarketData, ModelMethod, Outlook } from '../types'

export interface RefInputs {
  portfolio: number
  basisFraction: number
  age: number
  horizonYears: number
  spending: number
  otherIncome: number
  incomeStartAge: number
  stockShare: number
  muniShare: number
  filingStatus: FilingStatus
  homeCityId: string
  method?: ModelMethod
  outlook: Outlook
  blockMonths?: number
  paths?: number
  seed?: number
}

export interface RefYearRow {
  year: number
  age: number
  dividends: number
  muniInterest: number
  taxableInterest: number
  treasuryInterest: number
  otherIncome: number
  tax: number
  spending: number
  gapSold: number
  reinvested: number
  value: number
  /** Extra (not an IncomeYearRow field): real after-tax income used by keepsPace. */
  afterTaxIncome: number
}

export interface RefPath {
  rows: RefYearRow[]
  /** Real portfolio value, years 0..horizon. */
  values: number[]
  lasts: boolean
  principalKept: boolean
  keepsPace: boolean
}

export interface RefResult {
  paths: RefPath[]
  startYield: { stocks: number; munis: number; taxable: number }
  caps: Record<string, number>
}

export const SLEEVES = ['SPY', 'VWITX', 'VFITX', 'VBMFX'] as const
const FLOOR = 0.0025

function quantileSorted(sorted: number[], q: number): number {
  const n = sorted.length
  if (!n) return 0
  const pos = (n - 1) * q
  const lo = Math.floor(pos)
  const hi = Math.min(n - 1, lo + 1)
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo)
}

/** Mean of a yield series' raw monthly changes over months 1..M−1. */
function meanDy(y: number[]): number {
  let s = 0
  for (let c = 1; c < y.length; c++) s += y[c] - y[c - 1]
  return y.length > 1 ? s / (y.length - 1) : 0
}

/** Demeaned yield change into calendar month c (0 for c = 0). */
function deltaY(y: number[], c: number, mean: number): number {
  return c === 0 ? 0 : y[c] - y[c - 1] - mean
}

export function referenceIncome(market: MarketData, inputs: RefInputs, monthIdx: Int32Array): RefResult {
  const H = inputs.horizonYears
  const T = H * 12
  const nPaths = monthIdx.length / T
  const state = stateIncomeTaxFor(inputs.homeCityId)
  const status = inputs.filingStatus

  // Outlook-shrunk returns for the four sleeves.
  const prep = prepare(market, SLEEVES.map((symbol) => ({ symbol, weight: 1 })), inputs.outlook)
  const nA = prep.symbols.length
  const r = (sleeve: number, c: number): number => prep.R[c * nA + sleeve]

  // Yield caps and start yields.
  const caps: Record<string, number> = {}
  const means: number[] = []
  const y0: number[] = []
  for (const sym of SLEEVES) {
    const y = market.assets[sym].y!
    const mean = meanDy(y)
    means.push(mean)
    const abs: number[] = []
    for (let c = 1; c < y.length; c++) abs.push(Math.abs(deltaY(y, c, mean)))
    abs.sort((a, b) => a - b)
    caps[sym] = quantileSorted(abs, 0.99)
    y0.push(y[y.length - 1])
  }

  const target = [
    inputs.stockShare,
    (1 - inputs.stockShare) * inputs.muniShare,
    ((1 - inputs.stockShare) * (1 - inputs.muniShare)) / 2,
    ((1 - inputs.stockShare) * (1 - inputs.muniShare)) / 2,
  ]

  const paths: RefPath[] = []
  for (let p = 0; p < nPaths; p++) {
    const V = target.map((w) => w * inputs.portfolio)
    const B = V.map((v) => v * inputs.basisFraction)
    const yld = y0.slice()
    let P = 1
    let failed = false
    let gapEver = false
    let keepsPace = true
    let base = 0
    const rows: RefYearRow[] = []
    const values: number[] = [inputs.portfolio]

    for (let t = 1; t <= H; t++) {
      const Pstart = P // brackets in year t are indexed to the price level at its start (Resolved 11)
      // ---- 12 months ----
      const inc = [0, 0, 0, 0] // nominal income by sleeve: SPY div, muni, treasury (VFITX), taxable (VBMFX)
      for (let k = 0; k < 12; k++) {
        const c = monthIdx[p * T + (t - 1) * 12 + k]
        for (let i = 0; i < 4; i++) {
          if (!failed) {
            inc[i] += (V[i] * yld[i]) / 12
            V[i] = Math.max(0, V[i] * (1 + r(i, c) - yld[i] / 12))
          }
          const cap = caps[SLEEVES[i]]
          const dy = Math.min(cap, Math.max(-cap, deltaY(market.assets[SLEEVES[i]].y!, c, means[i])))
          yld[i] = Math.max(FLOOR, yld[i] + dy)
        }
        P *= 1 + market.cpi[c]
      }

      // ---- settlement ----
      const age = inputs.age + t - 1
      const over65: 0 | 1 | 2 = age >= 65 ? (status === 'mfj' ? 2 : 1) : 0
      const ssReal = age >= inputs.incomeStartAge ? inputs.otherIncome : 0
      const portIncome = inc[0] + inc[1] + inc[2] + inc[3]
      const cashIn = portIncome + ssReal * P
      const need = inputs.spending * P
      const taxNominal = (realisedNominal: number): number =>
        incomeTax(
          {
            qualifiedDividends: inc[0] / P,
            muniInterest: inc[1] / P,
            treasuryInterest: inc[2] / P,
            taxableInterest: inc[3] / P,
            socialSecurity: ssReal,
            longTermGains: Math.max(0, realisedNominal) / P,
          },
          { status, over65, priceLevel: P, indexLevel: Pstart, state, year: 2026 + (t - 1) },
        ).total * P
      const totalV = (): number => V[0] + V[1] + V[2] + V[3]
      const gainOn = (S: number): number => {
        const tv = totalV()
        let g = 0
        for (let i = 0; i < 4; i++) if (V[i] > 0) g += ((S * V[i]) / tv) * (1 - B[i] / V[i])
        return g
      }

      let tax = taxNominal(0)
      let gapSold = 0
      let reinvested = 0
      const wasFailed = failed
      if (!failed && cashIn - tax < need) {
        gapEver = true
        let S = need - (cashIn - tax)
        for (let round = 0; round < 6; round++) {
          const next = need - cashIn + taxNominal(gainOn(S))
          const done = Math.abs(next - S) < 1
          S = next
          if (done) break
        }
        const tv = totalV()
        if (S > tv) {
          failed = true
          tax = taxNominal(gainOn(tv))
          gapSold = tv
          for (let i = 0; i < 4; i++) V[i] = B[i] = 0
        } else {
          tax = cashIn + S - need
          gapSold = S
          for (let i = 0; i < 4; i++) {
            if (V[i] <= 0) continue
            const sale = (S * V[i]) / tv
            B[i] *= 1 - sale / V[i]
            V[i] -= sale
          }
        }
      } else if (!failed) {
        reinvested = cashIn - tax - need
        for (let i = 0; i < 4; i++) {
          V[i] += reinvested * target[i]
          B[i] += reinvested * target[i]
        }
      }

      const afterTax = (portIncome + ssReal * P - tax) / P
      if (t === 1) base = afterTax
      if (failed || wasFailed || afterTax < 0.9 * base) keepsPace = false
      const value = failed ? 0 : totalV() / P
      rows.push({
        year: t,
        age,
        dividends: inc[0] / P,
        muniInterest: inc[1] / P,
        taxableInterest: inc[3] / P,
        treasuryInterest: inc[2] / P,
        otherIncome: ssReal,
        tax: tax / P,
        spending: inputs.spending,
        gapSold: gapSold / P,
        reinvested: reinvested / P,
        value,
        afterTaxIncome: afterTax,
      })
      values.push(value)
    }
    paths.push({ rows, values, lasts: !failed, principalKept: !gapEver, keepsPace })
  }

  return {
    paths,
    startYield: { stocks: y0[0], munis: y0[1], taxable: (y0[2] + y0[3]) / 2 },
    caps,
  }
}
