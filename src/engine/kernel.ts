// The monthly BBD path loop, shared by simulate (full recording), atlas and solve (success only).
//
// Start: the BBD path opens with the plan's existing line-of-credit balance as its loan
// (L = initialLoan, already borrowed to live), and year 0 records portfolio V, loan L, LTV L/V and
// net worth V - L. A balance at or above the portfolio breaks the path at once (forced sale in
// month 0, year 0 recorded as broken). A balance above maxLtv · V but below V is handled by month
// 0's margin check (step 5), so it counts as a forced sale in month 0.
//
// Month t, in order:
//   1. portfolio *= 1 + r_t - dividendTaxDrag/12;  price level *= 1 + cpi_t;  FX walk steps.
//   2. loan accrues interest (loanRate/12, capitalized).
//   3. need = spending_t - otherIncome_t (both inflated by the path's CPI; destination spending
//      also × exp(X_t)). need > 0 is borrowed; a surplus repays the loan, and any leftover is
//      reinvested in the portfolio (cost basis += leftover).
//   3b. Local wealth tax (destinations that have one): at each year-end month ((t+1) % 12 === 0)
//      with t >= moveMonth, tax = bands(real base), base = (V - L)/P (net) or V/P (gross). The
//      bands are today's USD, so thresholds stay constant in real terms. The tax is borrowed:
//      L += tax · P, before this month's solvency and margin checks.
//   4. Insolvent if portfolio <= loan (or <= 0): the path is "broken" for good — the lender
//      liquidates, so portfolio/loan/net worth are 0 and LTV is recorded as 1 thereafter.
//   5. If loan/portfolio > maxLtv: forced sale of S so that (L - S(1 - g·tax)) / (V - S) = target,
//      g = max(0, 1 - basis/V) the embedded-gain fraction; tax comes out of the proceeds; basis
//      falls pro rata. A call that cannot reach the target LTV even by liquidating the whole
//      portfolio (S >= V, or a non-positive denominator) counts as broken, not bruised.
//   An insolvency is itself a forced liquidation, so the month a path breaks is recorded as its
//   first forced-sale month if no earlier margin call happened (feeds marginCallByYear).
// The sell strategy (recording mode only) runs on the same returns. It starts with no debt at
// max(0, V - initialLoan) — the balance repaid by selling up front — with cost basis scaled pro
// rata (B · Vs/V), so the embedded-gain fraction is unchanged. Spending net of income is
// funded by selling shares (gross S = need / (1 - g·tax)), surplus is reinvested, no loan. It pays
// the same year-end wealth tax by selling shares with the same capital-gains gross-up.
// Inheritance tax (recording mode only) is applied at the horizon to both real estates: each of
// `heirs` equal shares, less the per-heir allowance, runs through the bands.

/** Marginal tax bands as parallel arrays sorted by `from` (built by packBands in localTax.ts). Plain
 *  number arrays, defined here next to the loop: typed arrays, or a band function imported from
 *  another module, slowed the whole loop by up to ~35% in a vitest benchmark. */
export interface PackedBands {
  from: number[]
  rate: number[]
}

/** Marginal-band tax on `amount` (no allocation). */
export function bandTaxPacked(amount: number, b: PackedBands): number {
  let x = amount
  let tax = 0
  for (let i = b.from.length - 1; i >= 0; i--) {
    const f = b.from[i]
    if (x > f) {
      tax += (x - f) * b.rate[i]
      x = f
    }
  }
  return tax
}

export interface KernelConfig {
  T: number
  portfolio: number
  basisFraction: number
  dragM: number
  loanRateM: number
  maxLtv: number
  targetLtv: number
  tax: number
  /** Monthly spending, today's USD, before and after the move. */
  homeMonthly: number
  destMonthly: number
  /** First month (0-based) of destination spending; >= T means never. */
  moveMonth: number
  /** Monthly real-FX sigma (0 = none). */
  fxSigmaM: number
  incomeMonthly: number
  incomeStartMonth: number
  /** Existing loan balance at month 0 (USD, already borrowed); absent = 0. The sell strategy
   *  starts at portfolio - initialLoan with no debt. */
  initialLoan?: number
  /** Annual wealth tax from moveMonth on (bands in real today's USD); null/absent = none. */
  wealthTax?: { gross: boolean; bands: PackedBands } | null
  /** Inheritance tax at the horizon (real today's USD); null/absent = none. */
  inheritance?: { heirs: number; perHeirAllowance: number; bands: PackedBands } | null
}

export interface Recorder {
  years: number
  /** Year-end snapshots (real), index y * paths + p, y = 0..years. */
  nw: Float64Array
  port: Float64Array
  loan: Float64Array
  ltv: Float64Array
  /** First forced-sale month or -1. */
  firstCall: Int32Array
  /** 0 clean, 1 bruised, 2 broken. */
  outcome: Uint8Array
  bbdEstate: Float64Array
  sellEstate: Float64Array
  sellTax: Float64Array
  /** Cumulative real wealth tax paid (borrowed) on the BBD path. */
  wealthTax: Float64Array
  /** Inheritance tax on the BBD estate (bbdEstate is after it). */
  inheritanceTax: Float64Array
  bbdEstateBeforeTax: Float64Array
  cagr: Float64Array
  cagrReal: Float64Array
}

export function createRecorder(paths: number, years: number): Recorder {
  const n = (years + 1) * paths
  return {
    years,
    nw: new Float64Array(n),
    port: new Float64Array(n),
    loan: new Float64Array(n),
    ltv: new Float64Array(n),
    firstCall: new Int32Array(paths),
    outcome: new Uint8Array(paths),
    bbdEstate: new Float64Array(paths),
    sellEstate: new Float64Array(paths),
    sellTax: new Float64Array(paths),
    wealthTax: new Float64Array(paths),
    inheritanceTax: new Float64Array(paths),
    bbdEstateBeforeTax: new Float64Array(paths),
    cagr: new Float64Array(paths),
    cagrReal: new Float64Array(paths),
  }
}

/** Runs all paths; returns the number of clean paths. Fills `rec` when given. */
export function runPaths(
  sc: { paths: number; T: number; ret: Float32Array; infl: Float32Array; fxz: Float32Array },
  cfg: KernelConfig,
  rec: Recorder | null,
): number {
  const { T, dragM, loanRateM, maxLtv, targetLtv, tax, moveMonth, fxSigmaM } = cfg
  const fxDrift = -0.5 * fxSigmaM * fxSigmaM
  const wt = cfg.wealthTax ?? null
  const wGross = wt !== null && wt.gross
  // First wealth-tax month: the first year-end month ((t + 1) % 12 === 0) at or after the move;
  // T (never) without a wealth tax, so the untaxed loop does one integer compare a month.
  const firstTaxMonth = wt === null ? T : moveMonth + ((((11 - moveMonth) % 12) + 12) % 12)
  const inh = rec ? (cfg.inheritance ?? null) : null
  const inhTax = (estate: number) =>
    inh === null || !(estate > 0)
      ? 0
      : inh.heirs * bandTaxPacked(Math.max(0, estate / inh.heirs - inh.perHeirAllowance), inh.bands)
  const L0raw = cfg.initialLoan ?? 0
  const L0 = L0raw > 0 ? L0raw : 0 // also maps NaN to 0
  const paths = sc.paths
  let clean = 0
  for (let p = 0; p < paths; p++) {
    const o = p * sc.T
    let V = cfg.portfolio
    let B = V * cfg.basisFraction
    let L = L0
    let P = 1
    let X = 0
    // A balance at or above the portfolio is insolvent from the start: liquidated in month 0.
    let broken = L0 > 0 && L0 >= V
    let called = broken ? 0 : -1
    // sell strategy: repay the balance up front by selling, basis pro rata
    let Vs = Math.max(0, V - L0)
    let Bs = V > 0 ? B * (Vs / V) : 0
    let taxReal = 0
    let wtReal = 0
    let taxMonth = firstTaxMonth
    let growth = 1
    if (rec) {
      if (broken) {
        rec.port[p] = 0
        rec.nw[p] = 0
        rec.loan[p] = 0
        rec.ltv[p] = 1
      } else {
        rec.port[p] = V
        rec.nw[p] = V - L
        rec.loan[p] = L
        rec.ltv[p] = V > 0 ? L / V : 0
      }
    }
    for (let t = 0; t < T; t++) {
      const r = sc.ret[o + t] - dragM
      P *= 1 + sc.infl[o + t]
      if (fxSigmaM > 0) X += fxDrift + fxSigmaM * sc.fxz[o + t]
      const spend =
        t >= moveMonth ? cfg.destMonthly * P * (fxSigmaM > 0 ? Math.exp(X) : 1) : cfg.homeMonthly * P
      const need = spend - (t >= cfg.incomeStartMonth ? cfg.incomeMonthly * P : 0)
      const taxNow = t === taxMonth
      if (taxNow) taxMonth += 12

      if (!broken) {
        V *= 1 + r
        L *= 1 + loanRateM
        if (need > 0) L += need
        else if (need < 0) {
          const surplus = -need
          if (surplus <= L) L -= surplus
          else {
            V += surplus - L
            B += surplus - L
            L = 0
          }
        }
        if (taxNow) {
          const base = (wGross ? V : V - L) / P
          if (base > 0) {
            const w = bandTaxPacked(base, wt!.bands)
            L += w * P
            wtReal += w
          }
        }
        if (V <= 0 || V <= L) {
          broken = true
          if (called < 0) called = t
        } else if (L > maxLtv * V) {
          if (called < 0) called = t
          const g = B < V ? 1 - B / V : 0
          const S = (L - targetLtv * V) / (1 - g * tax - targetLtv)
          if (S >= V || !(S > 0)) broken = true
          else {
            B *= 1 - S / V
            L -= S * (1 - g * tax)
            V -= S
          }
        }
      }

      if (rec) {
        growth *= 1 + r
        if (Vs > 0) {
          Vs *= 1 + r
          if (need > 0) {
            const g = Bs < Vs ? 1 - Bs / Vs : 0
            const S = need / (1 - g * tax)
            if (S >= Vs) {
              Vs = 0
              Bs = 0
            } else {
              taxReal += (S * g * tax) / P
              Bs *= 1 - S / Vs
              Vs -= S
            }
          } else {
            Vs -= need
            Bs -= need
          }
          if (taxNow && Vs > 0) {
            const w = bandTaxPacked(Vs / P, wt!.bands) * P
            if (w > 0) {
              const g = Bs < Vs ? 1 - Bs / Vs : 0
              const S = w / (1 - g * tax)
              if (S >= Vs) {
                Vs = 0
                Bs = 0
              } else {
                taxReal += (S * g * tax) / P
                Bs *= 1 - S / Vs
                Vs -= S
              }
            }
          }
        }
        if ((t + 1) % 12 === 0) {
          const k = ((t + 1) / 12) * paths + p
          if (broken) {
            rec.port[k] = 0
            rec.loan[k] = 0
            rec.nw[k] = 0
            rec.ltv[k] = 1
          } else {
            rec.port[k] = V / P
            rec.loan[k] = L / P
            rec.nw[k] = (V - L) / P
            rec.ltv[k] = L / V
          }
        }
      }
    }
    const outcome = broken ? 2 : called >= 0 ? 1 : 0
    if (outcome === 0) clean++
    if (rec) {
      rec.outcome[p] = outcome
      rec.firstCall[p] = called
      const bbd = broken ? 0 : (V - L) / P
      const bbdInh = inhTax(bbd)
      const sell = Vs / P
      rec.bbdEstate[p] = bbd - bbdInh
      rec.bbdEstateBeforeTax[p] = bbd
      rec.inheritanceTax[p] = bbdInh
      rec.wealthTax[p] = wtReal
      rec.sellEstate[p] = sell - inhTax(sell)
      rec.sellTax[p] = taxReal
      rec.cagr[p] = Math.pow(Math.max(growth, 0), 12 / T) - 1
      rec.cagrReal[p] = Math.pow(Math.max(growth / P, 0), 12 / T) - 1
    }
  }
  return clean
}
