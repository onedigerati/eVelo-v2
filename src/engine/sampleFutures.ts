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
  void market
  throw new Error('realStockMonthly: not built yet')
}

/** Choose the sample paths. `idx` holds paths × T calendar month indices (index p·T + t). */
export function pickSampleFutures(idx: Int32Array, T: number, realStock: ArrayLike<number>): SamplePicks {
  void idx
  void T
  void realStock
  throw new Error('pickSampleFutures: not built yet')
}
