// Scenario generation: per path, T monthly portfolio returns, CPI inflation and FX shocks.
//
// 'bootstrap': stationary block bootstrap (Politis-Romano) of calendar months with mean block
//   length `blockMonths`, wrapping circularly. The same month index is used for every asset and
//   CPI, so cross-asset correlation and the inflation/return linkage are preserved.
// 'fat-tail': multivariate Student-t (df = 5) of asset returns, scaled to the sample mean and
//   covariance. Because the portfolio is rebalanced to fixed weights every month, the portfolio
//   return of a multivariate t is exactly univariate t with mean w'mu and scale sqrt(w'Σw) (same
//   chi-square mixing variable), so we draw that directly — identical in distribution to a full
//   Cholesky draw, at 1/n the cost. CPI is drawn by an independent stationary block bootstrap of
//   calendar months (keeps inflation persistence; it is not linked to the return shock).
// FX shocks are iid standard normals, generated for every path regardless of destination so all
// cities see common random numbers.

import type { Prepared } from './prepare'
import { createRng } from './rng'
import type { ModelMethod } from './types'

export const T_DF = 5

export interface Scenarios {
  paths: number
  T: number
  /** Portfolio return (before dividend drag), index p * T + t. */
  ret: Float32Array
  infl: Float32Array
  fxz: Float32Array
  /** Calendar month index of each drawn month, index p * T + t; only when asked for (`indices`).
   *  Under 'fat-tail' these are the CPI months (the return is a t-draw). */
  idx?: Int32Array
}

/** Fill `out` with a stationary-block-bootstrap sequence of calendar month indices. */
export function drawBlockIndices(
  rng: { next(): number; int(n: number): number },
  months: number,
  blockMonths: number,
  out: Int32Array,
): void {
  const pNew = 1 / Math.max(1, blockMonths)
  let idx = rng.int(months)
  for (let t = 0; t < out.length; t++) {
    if (t > 0) idx = rng.next() < pNew ? rng.int(months) : idx + 1 === months ? 0 : idx + 1
    out[t] = idx
  }
}

export function generateScenarios(
  prep: Prepared,
  method: ModelMethod,
  blockMonths: number,
  paths: number,
  T: number,
  seed: number,
  opts: { indices?: boolean; indicesOnly?: boolean } = {},
): Scenarios {
  const rng = createRng(seed)
  // indicesOnly: just the month indices (ret, infl and fxz come back empty). The normals are still
  // drawn, in the same order, so the indices are the ones a full call returns; only the arithmetic
  // that turns them into values is skipped.
  const only = !!opts.indicesOnly
  const N = only ? 0 : paths * T
  const ret = new Float32Array(N)
  const infl = new Float32Array(N)
  const fxz = new Float32Array(N)
  const M = prep.months
  const idx = new Int32Array(T)
  // Copying the drawn indices out takes no random numbers, so the rng sequence is unchanged.
  const allIdx = opts.indices || only ? new Int32Array(paths * T) : undefined

  let mu = 0, scale = 0
  if (method === 'fat-tail') {
    for (let m = 0; m < M; m++) mu += prep.port[m]
    mu /= M
    let v = 0
    for (let m = 0; m < M; m++) v += (prep.port[m] - mu) ** 2
    v /= M - 1
    // Student-t with df has variance df/(df-2); rescale so the draw's variance equals v.
    scale = Math.sqrt((v * (T_DF - 2)) / T_DF)
  }

  for (let p = 0; p < paths; p++) {
    const o = p * T
    drawBlockIndices(rng, M, blockMonths, idx)
    if (allIdx) allIdx.set(idx, o)
    if (only) {
      // The fat-tail t-draws (T_DF + 1 normals a month), then the fx normals (one a month).
      for (let k = (method === 'bootstrap' ? 1 : T_DF + 2) * T; k > 0; k--) rng.skipNormal()
      continue
    }
    if (method === 'bootstrap') {
      for (let t = 0; t < T; t++) {
        ret[o + t] = prep.port[idx[t]]
        infl[o + t] = prep.cpi[idx[t]]
      }
    } else {
      for (let t = 0; t < T; t++) {
        let chi = 0
        for (let k = 0; k < T_DF; k++) {
          const z = rng.normal()
          chi += z * z
        }
        const x = mu + (scale * rng.normal()) / Math.sqrt(chi / T_DF)
        ret[o + t] = Math.max(-0.95, x)
        infl[o + t] = prep.cpi[idx[t]]
      }
    }
    for (let t = 0; t < T; t++) fxz[o + t] = rng.normal()
  }
  return allIdx ? { paths, T, ret, infl, fxz, idx: allIdx } : { paths, T, ret, infl, fxz }
}
