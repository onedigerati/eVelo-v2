// Turn bundled MarketData + holdings + outlook into a complete joint monthly return matrix.
//
// 1. Factor backfill: months before an asset's `first` are filled with
//    alpha + beta * SPY + a residual resampled from the asset's own regression residuals.
//    The residual draw is seeded by the symbol only, so the backfill is a fixed property of
//    the dataset (identical across simulation seeds).
// 2. Mean shrinkage by outlook: the real-window monthly mean is blended toward a prior with
//    history weight w = min(wMax, n / (n + k)) (n = years of real history; k and the per-class cap
//    wMax depend on the outlook — see SHRINK); the whole series is then shifted so its mean equals
//    the blend, keeping its shape and volatility. The cap stops long-lived winners (NVDA) from
//    projecting their history forever. Equity prior = rf + clamp(beta, 0.5, 2) * ERP.

import { createRng, hashString } from './rng'
import type { AssetClass, Holding, MarketData, Outlook } from './types'

export const RF_ANNUAL = 0.035
export const CRYPTO_PREMIUM = 0.06
const ERP: Record<Outlook, number> = { historical: 0, balanced: 0.05, conservative: 0.035 }
/** Prior-strength k and maximum history weight wMax per outlook (w = min(wMax, n / (n + k))). */
const SHRINK: Record<'balanced' | 'conservative', { k: number; wMax: Partial<Record<AssetClass, number>> }> = {
  balanced: { k: 20, wMax: { stock: 0.35, 'etf-equity': 0.5, crypto: 0.25 } },
  conservative: { k: 40, wMax: { stock: 0.15, 'etf-equity': 0.25, crypto: 0.1 } },
}
/** Bonds / real estate / commodities keep the original n / (n + k) weights (no cap). */
const SHRINK_K_OTHER: Record<'balanced' | 'conservative', number> = { balanced: 10, conservative: 20 }
/** Beta used in the CAPM prior is clamped so a noisy estimate can't inflate (or zero) it. */
export const PRIOR_BETA_MIN = 0.5
export const PRIOR_BETA_MAX = 2.0

/** History weight for an asset with n years of real data. */
export function shrinkWeight(cls: AssetClass, realYears: number, outlook: Outlook): number {
  if (outlook === 'historical') return 1
  const cfg = SHRINK[outlook]
  const wMax = cfg.wMax[cls]
  if (wMax == null) return realYears / (realYears + SHRINK_K_OTHER[outlook])
  return Math.min(wMax, realYears / (realYears + cfg.k))
}

export interface AssetInfo {
  symbol: string
  cls: AssetClass
  alpha: number
  beta: number
  /** Years of real (non-backfilled) history. */
  realYears: number
  /** Monthly arithmetic mean of the real window. */
  muReal: number
  /** Monthly mean of the final (backfilled + shifted) series. */
  muFinal: number
}

export interface Prepared {
  symbols: string[]
  weights: Float64Array
  months: number
  /** Asset returns, month-major: R[m * nAssets + i]. */
  R: Float64Array
  cpi: Float64Array
  /** Monthly-rebalanced portfolio return per calendar month (before dividend drag). */
  port: Float64Array
  assets: AssetInfo[]
  /** Annualized expected return ((1 + mean)^12 - 1) and volatility (sd * sqrt 12) of the portfolio. */
  expReturn: number
  volatility: number
  correlation: number[][]
}

function mean(a: ArrayLike<number>, from = 0, to = a.length): number {
  let s = 0
  for (let i = from; i < to; i++) s += a[i]
  return s / (to - from)
}

/** Complete (backfilled) series for one symbol, before shrinkage. */
export function backfillSeries(
  market: MarketData,
  symbol: string,
): { r: Float64Array; alpha: number; beta: number; first: number } {
  const a = market.assets[symbol]
  if (!a) throw new Error(`Unknown symbol ${symbol}`)
  const spy = market.assets.SPY
  if (!spy) throw new Error('Market data has no SPY series')
  const M = market.months
  const r = new Float64Array(M)
  const first = a.first
  for (let m = first; m < M; m++) r[m] = a.r[m] ?? 0
  if (symbol === 'SPY') return { r, alpha: 0, beta: 1, first }

  // OLS on SPY over the asset's real window.
  const n = M - first
  let sx = 0, sy = 0
  for (let m = first; m < M; m++) {
    sx += spy.r[m] ?? 0
    sy += r[m]
  }
  const mx = sx / n, my = sy / n
  let sxy = 0, sxx = 0
  for (let m = first; m < M; m++) {
    const dx = (spy.r[m] ?? 0) - mx
    sxy += dx * (r[m] - my)
    sxx += dx * dx
  }
  const beta = sxx > 0 ? sxy / sxx : 0
  const alpha = my - beta * mx
  if (first > 0) {
    const resid = new Float64Array(n)
    for (let m = first; m < M; m++) resid[m - first] = r[m] - alpha - beta * (spy.r[m] ?? 0)
    const rng = createRng(hashString(symbol))
    for (let m = 0; m < first; m++) {
      const v = alpha + beta * (spy.r[m] ?? 0) + resid[rng.int(n)]
      r[m] = Math.max(-0.95, v)
    }
  }
  return { r, alpha, beta, first }
}

/** Monthly prior mean for an asset under an outlook. */
function priorMonthly(cls: AssetClass, beta: number, outlook: Outlook, fullMean: number): number {
  if (cls === 'crypto') return (RF_ANNUAL + CRYPTO_PREMIUM) / 12
  if (cls === 'stock' || cls === 'etf-equity') {
    const b = Math.min(PRIOR_BETA_MAX, Math.max(PRIOR_BETA_MIN, beta))
    return (RF_ANNUAL + b * ERP[outlook]) / 12
  }
  // Bonds / real estate / commodities: prior is the asset's own long-run (backfilled, full
  // calendar) mean, blended with the same n/(n+k) weights.
  return fullMean
}

export function prepare(market: MarketData, holdings: Holding[], outlook: Outlook): Prepared {
  if (!holdings.length) throw new Error('No holdings')
  const M = market.months
  const n = holdings.length
  const symbols = holdings.map((h) => h.symbol)
  const wsum = holdings.reduce((s, h) => s + h.weight, 0)
  if (!(wsum > 0)) throw new Error('Holding weights must sum to a positive number')
  const weights = Float64Array.from(holdings, (h) => h.weight / wsum)

  const R = new Float64Array(M * n)
  const assets: AssetInfo[] = []
  for (let i = 0; i < n; i++) {
    const sym = symbols[i]
    const { r, alpha, beta, first } = backfillSeries(market, sym)
    const cls = market.assets[sym].cls
    const realYears = (M - first) / 12
    const muReal = mean(r, first)
    const muFull = mean(r)
    // 'historical' has w = 1, so the series mean is pinned to the REAL-window mean. Without this
    // the backfilled months (alpha + beta * SPY over e.g. the 1990s bull run) would inflate it:
    // NVDA's raw full-calendar series compounds at ~50%/yr vs ~37%/yr over its real history.
    const w = shrinkWeight(cls, realYears, outlook)
    const muBlend = w === 1 ? muReal : w * muReal + (1 - w) * priorMonthly(cls, beta, outlook, muFull)
    const shift = muBlend - muFull
    for (let m = 0; m < M; m++) R[m * n + i] = r[m] + shift
    assets.push({ symbol: sym, cls, alpha, beta, realYears, muReal, muFinal: muFull + shift })
  }

  const cpi = Float64Array.from(market.cpi)
  const port = new Float64Array(M)
  for (let m = 0; m < M; m++) {
    let s = 0
    for (let i = 0; i < n; i++) s += weights[i] * R[m * n + i]
    port[m] = s
  }

  // Covariance / correlation of holdings.
  const mu = assets.map((a) => a.muFinal)
  const cov: number[][] = Array.from({ length: n }, () => new Array(n).fill(0))
  for (let m = 0; m < M; m++)
    for (let i = 0; i < n; i++) {
      const di = R[m * n + i] - mu[i]
      for (let j = i; j < n; j++) cov[i][j] += di * (R[m * n + j] - mu[j])
    }
  for (let i = 0; i < n; i++)
    for (let j = i; j < n; j++) cov[j][i] = cov[i][j] = cov[i][j] / (M - 1)
  const correlation = cov.map((row, i) =>
    row.map((c, j) => (i === j ? 1 : c / Math.sqrt(cov[i][i] * cov[j][j] || 1))),
  )

  const pm = mean(port)
  let pv = 0
  for (let m = 0; m < M; m++) pv += (port[m] - pm) ** 2
  pv /= M - 1

  return {
    symbols,
    weights,
    months: M,
    R,
    cpi,
    port,
    assets,
    expReturn: Math.pow(1 + pm, 12) - 1,
    volatility: Math.sqrt(pv * 12),
    correlation,
  }
}
