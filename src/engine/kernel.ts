// The monthly BBD path loop, shared by simulate (full recording), atlas and solve (success only).
//
// Month t, in order:
//   1. portfolio *= 1 + r_t - dividendTaxDrag/12;  price level *= 1 + cpi_t;  FX walk steps.
//   2. loan accrues interest (loanRate/12, capitalized).
//   3. need = spending_t - otherIncome_t (both inflated by the path's CPI; destination spending
//      also × exp(X_t)). need > 0 is borrowed; a surplus repays the loan, and any leftover is
//      reinvested in the portfolio (cost basis += leftover).
//   4. Insolvent if portfolio <= loan (or <= 0): the path is "broken" for good — the lender
//      liquidates, so portfolio/loan/net worth are 0 and LTV is recorded as 1 thereafter.
//   5. If loan/portfolio > maxLtv: forced sale of S so that (L - S(1 - g·tax)) / (V - S) = target,
//      g = max(0, 1 - basis/V) the embedded-gain fraction; tax comes out of the proceeds; basis
//      falls pro rata. If that is impossible (S >= V) the path is broken.
// The sell strategy (recording mode only) runs on the same returns: spending net of income is
// funded by selling shares (gross S = need / (1 - g·tax)), surplus is reinvested, no loan.

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
  cagr: Float64Array
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
    cagr: new Float64Array(paths),
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
  const paths = sc.paths
  let clean = 0
  for (let p = 0; p < paths; p++) {
    const o = p * sc.T
    let V = cfg.portfolio
    let B = V * cfg.basisFraction
    let L = 0
    let P = 1
    let X = 0
    let called = -1
    let broken = false
    // sell strategy
    let Vs = V
    let Bs = B
    let taxReal = 0
    let growth = 1
    if (rec) {
      rec.port[p] = V
      rec.nw[p] = V
      rec.loan[p] = 0
      rec.ltv[p] = 0
    }
    for (let t = 0; t < T; t++) {
      const r = sc.ret[o + t] - dragM
      P *= 1 + sc.infl[o + t]
      if (fxSigmaM > 0) X += fxDrift + fxSigmaM * sc.fxz[o + t]
      const spend =
        t >= moveMonth ? cfg.destMonthly * P * (fxSigmaM > 0 ? Math.exp(X) : 1) : cfg.homeMonthly * P
      const need = spend - (t >= cfg.incomeStartMonth ? cfg.incomeMonthly * P : 0)

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
        if (V <= 0 || V <= L) broken = true
        else if (L > maxLtv * V) {
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
      rec.bbdEstate[p] = broken ? 0 : (V - L) / P
      rec.sellEstate[p] = Vs / P
      rec.sellTax[p] = taxReal
      rec.cagr[p] = Math.pow(Math.max(growth, 0), 12 / T) - 1
    }
  }
  return clean
}
