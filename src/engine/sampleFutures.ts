// Sample futures: a few path indices chosen by a plan-neutral market rule over the drawn calendar
// months, so the walkthrough's "Same storm" can show both plans living through the same months.
// Contract shared by the picker, simulate (eVelo) and the income engine. The picker reads only the
// drawn month indices and the market's real stock returns, never either plan's outcome.

import type { MarketData } from './types'

export type SampleKey = 'earlyCrash' | 'typical' | 'lateCrash' | 'lucky'
export const SAMPLE_KEYS: readonly SampleKey[] = ['earlyCrash', 'typical', 'lateCrash', 'lucky']

/** Path index per sample, or null when the rule finds no path (e.g. no early drawdown at all). */
export type SamplePicks = Record<SampleKey, number | null>

/** One engine's rows for one picked path: `years[y]` covers year y (length horizonYears), real
 *  (today's USD), year-end values at the end of year y. */
export interface SampleFuture<Row> {
  key: SampleKey
  path: number
  years: Row[]
}

/** Real monthly stock return per calendar month (the market's broad US stock series, less CPI). */
export function realStockMonthly(market: MarketData): Float64Array {
  // The broad US stock fund is SPY (prepare.ts uses it as the factor too). The bundled data has it
  // from calendar month 0; a null or non-finite month (before `first`, or bad hand-built data)
  // counts as a 0 nominal return, a non-finite CPI as 0 inflation, and a non-finite result as 0.
  const spy = market.assets.SPY
  if (!spy) throw new Error('Market data has no SPY series')
  const M = market.months
  const out = new Float64Array(M)
  for (let m = 0; m < M; m++) {
    const r = fin(spy.r[m])
    const c = fin(market.cpi[m])
    out[m] = fin((1 + r) / (1 + c) - 1)
  }
  return out
}

/** x when it is a finite number, else 0 (null, undefined, NaN and ±Infinity). */
const fin = (x: number | null | undefined): number => (typeof x === 'number' && Number.isFinite(x) ? x : 0)

/** Longest window, in months, of the drawdown that defines a crash. */
const CRASH_WINDOW = 24
/** A crash is a worst-window real decline of at least this much. */
const CRASH_DECLINE = 0.2
/** Early crash: the decline starts in months [0, EARLY_MONTHS). */
const EARLY_MONTHS = 60
/** Late crash: the decline starts in the last LATE_MONTHS months. */
const LATE_MONTHS = 120

/** Sort path indices ascending by (cumulative return, path index). */
function sortByCum(paths: number[], cum: Float64Array): number[] {
  return paths.sort((a, b) => cum[a] - cum[b] || a - b)
}

/** The path at position `pos` of a (value, index)-sorted order, moved to the first of its tie run
 *  so ties always go to the lowest path index. */
function pickAt(order: number[], cum: Float64Array, pos: number): number {
  const v = cum[order[pos]]
  let i = pos
  while (i > 0 && cum[order[i - 1]] === v) i--
  return order[i]
}

/** Median (lower middle for an even count) by cumulative return; null for none. */
function medianOf(paths: number[], cum: Float64Array): number | null {
  if (paths.length === 0) return null
  const order = sortByCum(paths, cum)
  return pickAt(order, cum, Math.floor((order.length - 1) / 2))
}

/** Choose the sample paths. `idx` holds paths × T calendar month indices (index p·T + t). */
export function pickSampleFutures(idx: Int32Array, T: number, realStock: ArrayLike<number>): SamplePicks {
  // Per path p, with the real stock index I[0] = 1, I[t+1] = I[t]·(1 + realStock[idx[p·T + t]]):
  //   cumulative return = I[T] − 1;
  //   worst ≤24-month decline = min over s in [0, T), k in [1, 24], s + k ≤ T of I[s+k]/I[s] − 1,
  //   and its start month is that s (month s is the first month of the fall); among equal
  //   declines the earliest start wins.
  // typical = median path by cumulative return (lower middle for an even count); lucky = the 90th
  // percentile (nearest rank: the ⌈0.9·n⌉-th smallest); ties go to the lowest path index.
  // earlyCrash / lateCrash = the median by cumulative return (same conventions) among paths whose
  // worst decline is ≥ 20% and starts in [0, 60) / [max(T − 120, 60), T), so for T ≥ 120 the two
  // never overlap (at T = 120 late is [60, 120)). When T < 120 the late window is the second half,
  // [⌊T/2⌋, T), and the early window is capped to the first half, [0, min(60, ⌊T/2⌋)).
  // A sample with no qualifying path is null.
  const none: SamplePicks = { earlyCrash: null, typical: null, lateCrash: null, lucky: null }
  if (T <= 0) return none
  const n = Math.floor(idx.length / T)
  if (n === 0) return none

  const half = Math.floor(T / 2)
  const lateStart = T >= LATE_MONTHS ? Math.max(T - LATE_MONTHS, EARLY_MONTHS) : half
  const earlyEnd = T >= LATE_MONTHS ? EARLY_MONTHS : Math.min(EARLY_MONTHS, half)

  const cum = new Float64Array(n)
  const I = new Float64Array(T + 1)
  const dq = new Int32Array(T + 1)
  const early: number[] = []
  const late: number[] = []
  for (let p = 0; p < n; p++) {
    const o = p * T
    I[0] = 1
    // A non-finite month counts as a 0 return, so NaN never reaches the sort or the drawdown scan.
    for (let t = 0; t < T; t++) I[t + 1] = I[t] * (1 + fin(realStock[idx[o + t]]))
    cum[p] = I[T] - 1

    // min of I over (s, s + 24] by a sliding-window minimum, scanning s downward: the deque holds
    // month indices e with I increasing from head to tail, so the head is the window's minimum.
    // Each e enters and leaves once: O(T). The minimum is exact (no logs), so results match a
    // direct scan bit for bit; `<=` while scanning down keeps the earliest start on ties.
    let worst = 0
    let worstStart = -1
    let head = 0
    let tail = 0
    for (let s = T - 1; s >= 0; s--) {
      const e = s + 1
      const v = I[e]
      while (tail > head && I[dq[tail - 1]] >= v) tail--
      dq[tail++] = e
      while (dq[head] > s + CRASH_WINDOW) head++
      const d = I[dq[head]] / I[s] - 1
      if (d <= worst && d < 0) {
        worst = d
        worstStart = s
      }
    }
    if (worst <= -CRASH_DECLINE) {
      if (worstStart < earlyEnd) early.push(p)
      if (worstStart >= lateStart) late.push(p)
    }
  }

  const order = sortByCum(Array.from({ length: n }, (_, p) => p), cum)
  return {
    earlyCrash: medianOf(early, cum),
    typical: pickAt(order, cum, Math.floor((n - 1) / 2)),
    lateCrash: medianOf(late, cum),
    lucky: pickAt(order, cum, Math.ceil(0.9 * n) - 1),
  }
}
