// The living-on-income engine (docs/specs/income-engine.md): three sleeves (stocks, munis, taxable
// bonds) held as four funds, run on the same drawn months as eVelo, settled once a year.
//
// Futures: generateScenarios draws each path's calendar months with eVelo's method, block length,
// path count, horizon and seed, so the months are eVelo's. Every month each fund takes that month's
// real history: total return r (prepare's R after its outlook shrinkage, double precision), yield
// change Δy = y[m] − y[m−1] − mean(Δy) (demeaned, so history's 1993-2026 fall in yields isn't
// carried into every future; 0 for the calendar's first month) and CPI (market.cpi, double).
// Under 'fat-tail' the funds still use the drawn (CPI) months, so the engine is always historical
// bootstrap.
//
// Yields start at each fund's latest value and move by the drawn month's demeaned change, capped
// at the fund's 99th-percentile demeaned |Δy| and floored at 0.25%; levels are never replayed.
//
// Month t (nominal), per fund, with y the yield at the start of the month: income V·y/12 goes to
// its type's bucket (SPY qualified dividends, VWITX muni, VFITX Treasury, VBMFX taxable interest);
// V ← max(0, V·(1 + r − y/12)); then, at the month's end, y ← max(FLOOR, y + clamp(Δy)) and the
// price level P ← P·(1 + cpi). So month 1 pays exactly the latest yield.
//
// Year k's end (k = 1..H; age during the year = age + k − 1, tax year 2026 + k − 1):
//   cash in = the year's fund income + otherIncome·P (from incomeStartAge); need = spending·P;
//   tax = incomeTax(amounts ÷ P, priceLevel P, indexLevel P at the year's start)·P (bracket lag,
//   Resolved point 11: brackets are indexed to last year's prices, 1 in year 1).
//   Gap (cash in − tax < need): sell S pro rata to fund values, realised gain S·(1 − ΣB/ΣV) over
//   the funds still held (average cost; a net loss counts as 0). S = need − cash in + tax(gain), solved by fixed point: S₀ from tax with no
//   gain, then up to 6 rounds S ← need − cash in + tax(S·g), stopping once a round moves S by
//   under $1. The tax charged is the one that set the final S. If S reaches the portfolio, the
//   path fails (strictly S > ΣV): everything is sold (taxed on its whole gain), value 0, and this and every later
//   year are not met.
//   Surplus: reinvested after tax at the target weights, basis += at cost.
// After a failure the loop keeps going with nothing invested (otherIncome still arrives and is
// taxed, and shows in the after-tax income), but every later year counts as not met and not
// keeping pace.

import { stateIncomeTaxFor } from '../data/stateIncomeTax'
import { budgetTotal } from './cost'
import { DEFAULT_INPUTS } from './defaults'
import { incomeTax } from './incomeTax'
import type { IncomeTaxOptions, IncomeYear } from './incomeTaxTypes'
import type { IncomeInputs, IncomeResult, IncomeSampleYear, IncomeYearRow } from './incomeTypes'
import { prepare, type Prepared } from './prepare'
import { median50 } from './select'
import { SAMPLE_KEYS, pickSampleFutures, realStockMonthly, type SampleFuture, type SamplePicks } from './sampleFutures'
import { generateScenarios } from './scenarios'
import { bands, quantile } from './simulate'
import type { MarketData, Outlook } from './types'

export { median50 } from './select'

/** The funds, in sleeve order: stocks, munis, then taxable bonds (Treasury, aggregate). */
export const INCOME_FUNDS = ['SPY', 'VWITX', 'VFITX', 'VBMFX'] as const
const NF = 4
// Bound once so the yearly loop calls it directly (a test runner may reach imports through getters).
const taxOf = incomeTax
export const YIELD_FLOOR = 0.0025
export const YIELD_CAP_QUANTILE = 0.99
export const GAP_MAX_ROUNDS = 6
/** The gap iteration stops once a round moves the sale by less than this (nominal USD). */
export const GAP_TOLERANCE = 1
/** Year one's after-tax income × this is the keeps-pace floor. */
export const KEEPS_PACE = 0.9
export const TAX_BASE_YEAR = 2026

export const INCOME_DEFAULTS: IncomeInputs = {
  portfolio: DEFAULT_INPUTS.portfolio,
  basisFraction: DEFAULT_INPUTS.basisFraction,
  age: DEFAULT_INPUTS.age,
  horizonYears: DEFAULT_INPUTS.horizonYears,
  spending: budgetTotal(DEFAULT_INPUTS.budget),
  otherIncome: DEFAULT_INPUTS.otherIncome,
  incomeStartAge: DEFAULT_INPUTS.incomeStartAge,
  stockShare: 0.6,
  muniShare: 0.5,
  filingStatus: 'single',
  homeCityId: DEFAULT_INPUTS.homeCityId,
  method: DEFAULT_INPUTS.method,
  outlook: DEFAULT_INPUTS.outlook,
  blockMonths: DEFAULT_INPUTS.blockMonths,
  paths: DEFAULT_INPUTS.paths,
  seed: DEFAULT_INPUTS.seed,
}

/** The funds' monthly history, ready for the loop. Arrays are month-major: [m * 4 + fund]. */
export interface IncomeSeries {
  months: number
  /** Total return after the outlook's shrinkage. */
  R: Float64Array
  /** Demeaned yield change from the previous month, already capped (0 for month 0). */
  dy: Float64Array
  cpi: Float64Array
  /** Starting yield per fund (its latest). */
  y0: Float64Array
  /** Cap on a month's demeaned |Δy| per fund. */
  cap: Float64Array
  prep: Prepared
}

/** A yield series' monthly changes without drift: d[m] = y[m] − y[m−1] − mean over months
 *  1..M−1 (d[0] = 0). The mean of the changes is (y[M−1] − y[0]) / (M − 1). */
export function demeanedDy(y: ArrayLike<number>): Float64Array {
  const M = y.length
  const d = new Float64Array(M)
  if (M < 2) return d
  let sum = 0
  for (let m = 1; m < M; m++) sum += y[m] - y[m - 1]
  const mean = sum / (M - 1)
  for (let m = 1; m < M; m++) d[m] = y[m] - y[m - 1] - mean
  return d
}

/** The 99th percentile of a yield series' demeaned monthly |Δy| (months 1..M−1). */
export function yieldCap(y: ArrayLike<number>): number {
  const d = demeanedDy(y)
  const a = new Float64Array(Math.max(0, y.length - 1))
  for (let m = 1; m < y.length; m++) a[m - 1] = Math.abs(d[m])
  return quantile(a.sort(), YIELD_CAP_QUANTILE)
}

export function incomeSeries(market: MarketData, outlook: Outlook): IncomeSeries {
  const prep = prepare(market, INCOME_FUNDS.map((symbol) => ({ symbol, weight: 1 })), outlook)
  const M = prep.months
  const dy = new Float64Array(M * NF)
  const y0 = new Float64Array(NF)
  const cap = new Float64Array(NF)
  for (let i = 0; i < NF; i++) {
    const y = market.assets[INCOME_FUNDS[i]].y
    if (!y || y.length !== M) throw new Error(`Market data has no income yield for ${INCOME_FUNDS[i]}`)
    const c = yieldCap(y)
    const d = demeanedDy(y)
    cap[i] = c
    y0[i] = y[M - 1]
    for (let m = 1; m < M; m++) dy[m * NF + i] = Math.min(c, Math.max(-c, d[m]))
  }
  return { months: M, R: prep.R, dy, cpi: prep.cpi, y0, cap, prep }
}

/** Input limits for the `income` request, copied from eVelo's sanitizer (src/state/share.ts:
 *  INPUT_LIMITS, PATH_OPTIONS and BUDGET_MAX); the engine doesn't import UI state. Two deliberate
 *  differences: the horizon may go down to 1 year (the hand-worked tests run 1-5 year plans), and
 *  any whole path count up to eVelo's largest option is allowed. */
export const INCOME_LIMITS = {
  portfolio: [0, 1e10],
  basisFraction: [0, 1],
  age: [30, 85],
  horizonYears: [1, 40],
  spending: [0, 1e9],
  otherIncome: [0, 1_000_000],
  incomeStartAge: [50, 80],
  stockShare: [0, 1],
  muniShare: [0, 1],
  blockMonths: [6, 60],
  paths: [1, 10_000],
  seed: [0, 2 ** 31 - 1],
} as const satisfies Partial<Record<keyof IncomeInputs, readonly [number, number]>>

/** A finite number clamped to [lo, hi]; anything else (NaN, ±Infinity, a non-number) is `dflt`. */
const lim = (x: unknown, [lo, hi]: readonly [number, number], dflt: number): number =>
  typeof x === 'number' && Number.isFinite(x) ? Math.min(hi, Math.max(lo, x)) : dflt
const oneOf = <T extends string>(x: unknown, allowed: readonly T[], dflt: T): T =>
  allowed.includes(x as T) ? (x as T) : dflt

/** Every field within eVelo's limits: amounts finite and clamped (non-finite → 0), shares and basis
 *  in 0..1, whole ages, horizon, block length, path count and seed, and known enumerations (else
 *  the default). */
export function normalizeIncomeInputs(inputs: IncomeInputs): IncomeInputs {
  const L = INCOME_LIMITS
  const D = INCOME_DEFAULTS
  const whole = (x: unknown, l: readonly [number, number], dflt: number) => Math.round(lim(x, l, dflt))
  return {
    ...inputs,
    portfolio: lim(inputs.portfolio, L.portfolio, 0),
    basisFraction: lim(inputs.basisFraction, L.basisFraction, 0),
    age: whole(inputs.age, L.age, D.age),
    horizonYears: whole(inputs.horizonYears, L.horizonYears, D.horizonYears),
    spending: lim(inputs.spending, L.spending, 0),
    otherIncome: lim(inputs.otherIncome, L.otherIncome, 0),
    incomeStartAge: whole(inputs.incomeStartAge, L.incomeStartAge, D.incomeStartAge),
    stockShare: lim(inputs.stockShare, L.stockShare, 0),
    muniShare: lim(inputs.muniShare, L.muniShare, 0),
    filingStatus: oneOf(inputs.filingStatus, ['single', 'mfj'], D.filingStatus),
    homeCityId: typeof inputs.homeCityId === 'string' ? inputs.homeCityId : D.homeCityId,
    method: oneOf(inputs.method, ['bootstrap', 'fat-tail'], D.method),
    outlook: oneOf(inputs.outlook, ['historical', 'balanced', 'conservative'], D.outlook),
    blockMonths: whole(inputs.blockMonths, L.blockMonths, D.blockMonths),
    paths: Math.floor(lim(inputs.paths, L.paths, D.paths)),
    seed: whole(inputs.seed, L.seed, D.seed),
  }
}

/** Run every path of `runIncomePaths` on given months: `idx` holds paths × (horizonYears·12)
 *  calendar month indices, index p·T + t. The seam tests and the reference drive. `picks` chooses
 *  the sample futures recorded (omitted: picked from `idx` as runIncomePaths does; null: none);
 *  under fat-tail there are none either way. */
export function runIncomeOnMonths(market: MarketData, inputs: IncomeInputs, idx: Int32Array, picks?: SamplePicks | null): IncomeResult {
  const n = normalizeIncomeInputs(inputs)
  return settle(incomeSeries(market, n.outlook), n, idx, picks === undefined ? picksFor(market, n, idx) : picks)
}

/** The sample futures for these months: the picker's plan-neutral rule over the drawn months, as
 *  simulate applies it to the same draw; none under fat-tail. */
function picksFor(market: MarketData, n: IncomeInputs, idx: Int32Array): SamplePicks | null {
  return n.method === 'fat-tail' ? null : pickSampleFutures(idx, n.horizonYears * 12, realStockMonthly(market))
}

export function runIncomePaths(market: MarketData, inputs: IncomeInputs): IncomeResult {
  const n = normalizeIncomeInputs(inputs)
  const s = incomeSeries(market, n.outlook)
  // The same call simulate makes (makeScenarios), so the drawn months are eVelo's.
  const sc = generateScenarios(s.prep, n.method, n.blockMonths, n.paths, n.horizonYears * 12, n.seed, { indicesOnly: true })
  return settle(s, n, sc.idx!, picksFor(market, n, sc.idx!))
}

// Recorded per path-year, fields of IncomeYearRow other than year, age, spending and value.
const F_DIV = 0, F_MUNI = 1, F_TAXABLE = 2, F_TREASURY = 3, F_OTHER = 4, F_TAX = 5, F_GAP = 6, F_REINV = 7
const NFIELDS = 8

function settle(s: IncomeSeries, n: IncomeInputs, idx: Int32Array, picks: SamplePicks | null): IncomeResult {
  const H = n.horizonYears
  const T = H * 12
  if (idx.length === 0 || idx.length % T !== 0) throw new Error(`Month indices must be paths × ${T}`)
  const paths = idx.length / T
  const { R, dy, cpi, y0 } = s
  const M = s.months
  for (let k = 0; k < idx.length; k++) if (!(idx[k] >= 0 && idx[k] < M)) throw new Error('Month index out of range')

  const bondShare = 1 - n.stockShare
  const w = Float64Array.of(n.stockShare, bondShare * n.muniShare, (bondShare * (1 - n.muniShare)) / 2, (bondShare * (1 - n.muniShare)) / 2)
  const state = stateIncomeTaxFor(n.homeCityId)
  const mfj = n.filingStatus === 'mfj'

  // Reused tax arguments: the yearly loop allocates only incomeTax's result.
  const ty: Required<Pick<IncomeYear, 'qualifiedDividends' | 'muniInterest' | 'treasuryInterest' | 'taxableInterest' | 'socialSecurity' | 'longTermGains'>> = {
    qualifiedDividends: 0, muniInterest: 0, treasuryInterest: 0, taxableInterest: 0, socialSecurity: 0, longTermGains: 0,
  }
  const to: IncomeTaxOptions = { status: n.filingStatus, over65: 0, priceLevel: 1, indexLevel: 1, state, year: TAX_BASE_YEAR }
  /** Nominal tax for the year's income in `ty` (real) with nominal realised gains `gains`. */
  const taxOn = (gains: number, P: number): number => {
    ty.longTermGains = gains / P
    return taxOf(ty, to).total * P
  }

  const valueRec = new Float64Array((H + 1) * paths) // [year * paths + p], real
  const incRec = new Float64Array(H * paths) // after-tax income, [(year − 1) * paths + p], real
  const rec = new Float64Array(NFIELDS * H * paths) // [(f * H + year − 1) * paths + p], real
  const V = new Float64Array(NF)
  const B = new Float64Array(NF)
  const Y = new Float64Array(NF)
  const inc = new Float64Array(NF)
  const taxTot = new Float64Array(paths) // per path, lifetime real tax
  const soldTot = new Float64Array(paths) // per path, lifetime real gap sold
  let lasts = 0, kept = 0, pace = 0

  // Sample futures: the picked paths' own rows, recorded only on those paths (one lookup per path).
  // Two keys may pick the same path, so rows are kept per distinct path.
  const slotOf = new Map<number, number>()
  const sampleSlots: [SampleFuture<IncomeSampleYear>['key'], number, number][] = [] // key, path, slot
  if (n.method !== 'fat-tail' && picks) {
    for (const key of SAMPLE_KEYS) {
      const path = picks[key]
      if (path === null || path === undefined) continue
      if (!(Number.isInteger(path) && path >= 0 && path < paths)) throw new Error(`Sample path out of range: ${key} ${path}`)
      let slot = slotOf.get(path)
      if (slot === undefined) {
        slot = slotOf.size
        slotOf.set(path, slot)
      }
      sampleSlots.push([key, path, slot])
    }
  }
  const slotRows: IncomeSampleYear[][] = Array.from({ length: slotOf.size }, () => [])
  const pathSlot = new Int32Array(slotOf.size > 0 ? paths : 0).fill(-1)
  for (const [path, slot] of slotOf) pathSlot[path] = slot

  for (let p = 0; p < paths; p++) {
    for (let i = 0; i < NF; i++) {
      V[i] = n.portfolio * w[i]
      B[i] = V[i] * n.basisFraction
      Y[i] = y0[i]
      inc[i] = 0
    }
    valueRec[p] = n.portfolio
    let P = 1
    let P0 = 1 // the price level at the start of the year
    let failed = false, sold = false, keepsPace = true
    let base = 0
    let taxSum = 0, soldSum = 0
    const sampleRows = pathSlot.length > 0 && pathSlot[p] >= 0 ? slotRows[pathSlot[p]] : null
    const o = p * T
    for (let t = 0; t < T; t++) {
      if (t % 12 === 0) P0 = P
      const mo = idx[o + t] * NF
      for (let i = 0; i < NF; i++) {
        // Pay and grow on the yield at the start of the month, then move it at the month's end.
        const y = Y[i]
        const v = V[i]
        inc[i] += (v * y) / 12
        const nv = v * (1 + R[mo + i] - y / 12)
        V[i] = nv > 0 ? nv : 0
        const ny = y + dy[mo + i]
        Y[i] = ny > YIELD_FLOOR ? ny : YIELD_FLOOR
      }
      P *= 1 + cpi[idx[o + t]]
      if ((t + 1) % 12 !== 0) continue

      // Year-end settlement.
      const k = (t + 1) / 12
      const age = n.age + k - 1
      const other = age >= n.incomeStartAge ? n.otherIncome * P : 0
      const cashIn = inc[0] + inc[1] + inc[2] + inc[3] + other
      const need = n.spending * P
      ty.qualifiedDividends = inc[0] / P
      ty.muniInterest = inc[1] / P
      ty.treasuryInterest = inc[2] / P
      ty.taxableInterest = inc[3] / P
      ty.socialSecurity = other / P
      to.over65 = age >= 65 ? (mfj ? 2 : 1) : 0
      to.priceLevel = P
      to.indexLevel = P0
      to.year = TAX_BASE_YEAR + k - 1
      let tax = taxOn(0, P)
      let gap = 0, reinv = 0
      if (failed) {
        // Nothing left to sell or reinvest into; the year counts as not met.
      } else if (cashIn - tax >= need) {
        reinv = cashIn - tax - need
        for (let i = 0; i < NF; i++) {
          V[i] += reinv * w[i]
          B[i] += reinv * w[i]
        }
      } else {
        const Vt = V[0] + V[1] + V[2] + V[3]
        // Gain per dollar sold, netted over the funds still held; a net loss counts as 0.
        let Bt = 0
        for (let i = 0; i < NF; i++) if (V[i] > 0) Bt += B[i]
        const g = Vt > 0 && Bt < Vt ? 1 - Bt / Vt : 0
        let S = need - cashIn + tax
        // The rounds rise monotonically, so once S passes the portfolio it stays past it.
        for (let round = 0; round < GAP_MAX_ROUNDS && S <= Vt; round++) {
          tax = taxOn(S * g, P)
          const next = need - cashIn + tax
          const done = Math.abs(next - S) < GAP_TOLERANCE
          S = next
          if (done) break
        }
        if (S > Vt) {
          // The portfolio can't cover the year: sell it all; the path has failed.
          if (Vt > 0) tax = taxOn(Vt * g, P)
          gap = Vt
          for (let i = 0; i < NF; i++) V[i] = B[i] = 0
          failed = true
        } else {
          gap = S
          const f = 1 - S / Vt
          for (let i = 0; i < NF; i++) {
            V[i] *= f
            B[i] *= f
          }
        }
        sold = true
      }

      const j = (k - 1) * paths + p
      const after = (cashIn - tax) / P
      if (k === 1) base = after
      if (failed || after < KEEPS_PACE * base) keepsPace = false
      valueRec[k * paths + p] = (V[0] + V[1] + V[2] + V[3]) / P
      incRec[j] = after
      rec[F_DIV * H * paths + j] = inc[0] / P
      rec[F_MUNI * H * paths + j] = inc[1] / P
      rec[F_TREASURY * H * paths + j] = inc[2] / P
      rec[F_TAXABLE * H * paths + j] = inc[3] / P
      rec[F_OTHER * H * paths + j] = other / P
      rec[F_TAX * H * paths + j] = tax / P
      rec[F_GAP * H * paths + j] = gap / P
      taxSum += tax / P
      soldSum += gap / P
      rec[F_REINV * H * paths + j] = reinv / P
      if (sampleRows !== null)
        sampleRows.push({
          portfolio: valueRec[k * paths + p],
          // Divided and added as IncomeYearRow's dividends, muni, taxable and Treasury fields are.
          dividendsInterest: inc[0] / P + inc[1] / P + inc[3] / P + inc[2] / P,
          socialSecurity: other / P,
          sold: gap / P,
          tax: tax / P,
          reinvested: reinv / P,
        })
      for (let i = 0; i < NF; i++) inc[i] = 0
    }
    taxTot[p] = taxSum
    soldTot[p] = soldSum
    if (!failed) lasts++
    if (!sold) kept++
    if (keepsPace) pace++
  }

  const value = bands(valueRec, paths, H)
  const afterTaxIncome = bands(incRec, paths, H - 1)
  const med = (f: number, k: number) => median50(rec.subarray((f * H + k - 1) * paths, (f * H + k) * paths))
  const median: IncomeYearRow[] = []
  for (let k = 1; k <= H; k++)
    median.push({
      year: k,
      age: n.age + k - 1,
      dividends: med(F_DIV, k),
      muniInterest: med(F_MUNI, k),
      taxableInterest: med(F_TAXABLE, k),
      treasuryInterest: med(F_TREASURY, k),
      otherIncome: med(F_OTHER, k),
      tax: med(F_TAX, k),
      spending: n.spending,
      gapSold: med(F_GAP, k),
      reinvested: med(F_REINV, k),
      value: value.p50[k],
    })

  return {
    paths,
    years: H,
    lastsRate: lasts / paths,
    principalKeptRate: kept / paths,
    keepsPaceRate: pace / paths,
    value,
    afterTaxIncome,
    median,
    totalTaxMedian: median50(taxTot),
    totalSoldMedian: median50(soldTot),
    startYield: { stocks: y0[0], munis: y0[1], taxable: (y0[2] + y0[3]) / 2 },
    samples:
      n.method === 'fat-tail' || picks === null
        ? null
        : sampleSlots.map(([key, path, slot]) => ({ key, path, years: slotRows[slot].map((r) => ({ ...r })) })),
  }
}
