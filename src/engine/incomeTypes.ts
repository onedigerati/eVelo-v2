// Contract for the living-on-income engine (stage 3, docs/specs/income-engine.md). Plain data, so it
// crosses the Web Worker boundary.

import type { FilingStatus } from './incomeTaxTypes'
import type { SampleFuture } from './sampleFutures'
import type { Bands, ModelMethod, Outlook } from './types'

export interface IncomeInputs {
  /** Starting value, today's USD. */
  portfolio: number
  /** Cost basis ÷ value at the start, 0..1, the same for every sleeve. */
  basisFraction: number
  /** Whole years; for MFJ the spouse is taken as the same age. */
  age: number
  /** Whole years. */
  horizonYears: number
  /** After-tax spending, today's USD/yr (constant in real terms). */
  spending: number
  /** Social Security, today's USD/yr, from incomeStartAge; taxed as Social Security. */
  otherIncome: number
  incomeStartAge: number
  /** 0..1 of the portfolio in stocks (SPY); the rest is bonds. */
  stockShare: number
  /** 0..1 of the bonds in munis (VWITX); the rest is taxable, split half VFITX, half VBMFX. */
  muniShare: number
  filingStatus: FilingStatus
  /** State tax from stateIncomeTaxFor(); a non-US city is federal only. */
  homeCityId: string
  // Shared with eVelo so the futures match:
  method: ModelMethod
  outlook: Outlook
  blockMonths: number
  paths: number
  seed: number
}

export interface IncomeYearRow {
  year: number
  /** Age during the year: start age + years elapsed before it. */
  age: number
  dividends: number
  muniInterest: number
  taxableInterest: number
  treasuryInterest: number
  otherIncome: number
  tax: number
  spending: number
  /** Sold to cover the gap (0 if income covered spending). */
  gapSold: number
  /** Surplus reinvested. */
  reinvested: number
  /** End-of-year real portfolio value. */
  value: number
}

/** One year of one sample future (src/engine/sampleFutures.ts), real (today's USD): the portfolio at
 *  the end of year y, the flows over year y. */
export interface IncomeSampleYear {
  portfolio: number
  /** Dividends + muni + taxable + Treasury interest, as IncomeYearRow's four fields add. */
  dividendsInterest: number
  /** The other income (otherIncome, Social Security) that arrived in the year. */
  socialSecurity: number
  /** Sold to cover the gap (IncomeYearRow.gapSold). */
  sold: number
  tax: number
  reinvested: number
}

export interface IncomeResult {
  paths: number
  years: number
  /** Share of paths where spending is met every year to the horizon. */
  lastsRate: number
  /** Share of paths with no gap sale in any year. */
  principalKeptRate: number
  /** Share of paths whose real after-tax income never falls below 90% of year one's. */
  keepsPaceRate: number
  /** Real portfolio value, years 0..horizon. */
  value: Bands
  /** Real after-tax income (portfolio income + otherIncome − tax), years 1..horizon (index 0 = year 1). */
  afterTaxIncome: Bands
  /** Per year 1..horizon, the per-year medians of each field. */
  median: IncomeYearRow[]
  /** Median over paths of each path's lifetime tax (sum of its yearly real tax), real USD. */
  totalTaxMedian: number
  /** Median over paths of each path's lifetime gap sales (sum of its yearly real gapSold), real USD. */
  totalSoldMedian: number
  /** The yields the paths start from (each fund's latest; taxable = mean of VFITX and VBMFX). */
  startYield: { stocks: number; munis: number; taxable: number }
  /** The picked sample futures' own per-year rows, one per non-null pick in SAMPLE_KEYS order;
   *  null under fat-tail (no replayed months to match). */
  samples: SampleFuture<IncomeSampleYear>[] | null
}

/** Worker protocol for the mode, alongside types.ts's WorkerRequest/WorkerResponse (kept apart so
 *  eVelo's own request handling doesn't widen). */
export type IncomeWorkerRequest = { id: number; kind: 'income'; inputs: IncomeInputs }
export type IncomeWorkerResponse = { id: number; kind: 'income'; result: IncomeResult }
