// Contract between the simulation engine and the UI.
// Everything here is plain data so it can cross a Web Worker boundary.

/** Bundled market dataset (src/data/market.json). Monthly total returns. */
export interface MarketData {
  /** ISO date the data was fetched. */
  asOf: string
  /** First month of the common calendar, "YYYY-MM". Index 0 of every series. */
  start: string
  /** Number of months in the common calendar. */
  months: number
  /** Monthly US CPI inflation aligned to the calendar (decimal, e.g. 0.003). */
  cpi: number[]
  assets: Record<string, AssetSeries>
}

export type AssetClass = 'stock' | 'etf-equity' | 'etf-bond' | 'etf-real-estate' | 'commodity' | 'crypto'

export interface AssetSeries {
  symbol: string
  name: string
  cls: AssetClass
  /** Calendar index of the first real return (earlier months are null / backfilled). */
  first: number
  /** Monthly total returns aligned to the calendar; null before `first`. Rounded to 5 dp. */
  r: (number | null)[]
}

export interface Holding {
  symbol: string
  /** Weight 0..1; weights sum to 1. */
  weight: number
}

/** Budget categories in the home city, USD per year, today's dollars. */
export interface Budget {
  housing: number
  groceries: number
  dining: number
  transport: number
  utilities: number
  healthcare: number
  travel: number
  other: number
}
export type BudgetCategory = keyof Budget

/** A city's cost profile. Indices are relative to New York = 100 (Numbeo-style). */
export interface City {
  id: string
  name: string
  country: string
  countryCode: string // ISO-3166 alpha-2
  region: 'North America' | 'Latin America' | 'Europe' | 'Asia' | 'Oceania' | 'Middle East' | 'Africa'
  lat: number
  lon: number
  currency: string // ISO-4217
  /** Annualized real exchange-rate volatility vs USD (0 for USD / hard pegs). */
  fxVol: number
  idx: {
    col: number // cost of living excl. rent
    rent: number
    groceries: number
    restaurants: number
  }
  /** Private/expat healthcare cost relative to US pre-Medicare (US = 1). */
  healthcare: number
  /** Short, hedged notes on tax / banking realities for a US retiree. */
  notes?: string[]
  /**
   * Provenance of `idx` (and the country healthcare factor) when they were
   * checked against a published source. A city without it carries rough
   * estimates only. `confidence: 'low'` marks thin source data (few
   * contributors, derived values); `note` explains mappings or blends.
   */
  verified?: CityVerification
}

export interface CityVerification {
  source: string
  url?: string
  /** ISO date (YYYY-MM-DD) the source was read. */
  asOf: string
  confidence: 'high' | 'low'
  note?: string
}

export type ModelMethod = 'bootstrap' | 'fat-tail'
export type Outlook = 'historical' | 'balanced' | 'conservative'

export interface PlanInputs {
  holdings: Holding[]
  /** Starting portfolio value, USD. */
  portfolio: number
  /** Cost basis as a fraction of portfolio value (0..1). */
  basisFraction: number
  age: number
  horizonYears: number

  /** Lifestyle budget expressed in the HOME city, today's USD/yr. */
  budget: Budget
  homeCityId: string
  /** Destination city id, or null to stay home. */
  destCityId: string | null
  /** Years from now when the move happens (0 = immediately). */
  moveInYears: number
  /** 0 = live like a local, 1 = full home-country lifestyle (no savings on local-price categories). */
  expatFactor: number
  /** Optional per-category ratio overrides (dest cost / home cost). */
  ratioOverrides?: Partial<Record<BudgetCategory, number>>

  /** Other income (Social Security, pension), today's USD/yr, starting at `incomeStartAge`. Inflation-indexed. */
  otherIncome: number
  incomeStartAge: number

  /** SBLOC annual interest rate (decimal). Interest capitalizes monthly. */
  loanRate: number
  /** Margin-call LTV threshold (decimal, e.g. 0.6). */
  maxLtv: number
  /** LTV a forced sale restores the loan to (decimal, < maxLtv). */
  targetLtvAfterCall: number
  /** Long-term capital gains rate used when selling (decimal, e.g. 0.238). */
  capGainsRate: number
  /** Annual drag from taxes on dividends (decimal, e.g. 0.0025). */
  dividendTaxDrag: number

  method: ModelMethod
  outlook: Outlook
  /** Bootstrap block length in months. */
  blockMonths: number
  paths: number
  seed: number
}

/** Percentile bands per year (index 0 = today, length horizonYears + 1). */
export interface Bands {
  p5: number[]
  p25: number[]
  p50: number[]
  p75: number[]
  p95: number[]
}

export interface SimulationResult {
  inputs: PlanInputs
  /** P(no forced sale AND solvent at horizon). Headline. */
  successRate: number
  /** P(at least one forced sale but solvent at horizon). */
  bruisedRate: number
  /** P(insolvent: loan >= portfolio at some point / net worth <= 0). */
  brokenRate: number
  /** 100 outcomes for the dot chart, sorted: 0 clean, 1 bruised, 2 broken. */
  outcomeDots: (0 | 1 | 2)[]

  /** Real (today's USD) net worth = portfolio - loan. */
  netWorth: Bands
  /** Real portfolio value. */
  portfolioValue: Bands
  /** Real loan balance. */
  loan: Bands
  /** Loan-to-value ratio. */
  ltv: Bands

  /** P(first forced sale happens in year y), length horizonYears. */
  marginCallByYear: number[]
  /** Cumulative P(any forced sale by end of year y). */
  marginCallCumulative: number[]

  /** First-year spending in USD after the move (today's dollars), and home spending. */
  spendHome: number
  spendDest: number | null
  /** Effective per-category ratio applied to the destination. */
  categoryRatios: Record<BudgetCategory, number> | null

  /** Estate at horizon (real USD), BBD with step-up vs selling to fund spending. */
  estate: {
    bbdMedian: number
    sellMedian: number
    /** P(BBD estate > sell estate). */
    bbdWins: number
    /** Median cumulative capital-gains tax paid by the sell strategy (real). */
    sellTaxMedian: number
  }

  /** Expected portfolio stats (annualized) under the model. expReturn / cagrMedian are nominal;
   *  the *Real variants are deflated by CPI (calendar CPI for expReturnReal, each path's CPI for
   *  cagrMedianReal). */
  stats: { expReturn: number; volatility: number; cagrMedian: number; expReturnReal: number; cagrMedianReal: number }
  /** Correlation matrix of the holdings (order = inputs.holdings). */
  correlation: number[][]
  elapsedMs: number
}

/** Ranking of cities by success at the user's lifestyle. */
export interface AtlasEntry {
  cityId: string
  successRate: number
  spendUsd: number
  /** spendUsd / home spend. */
  costRatio: number
}

export interface SolveResult {
  /** Max annual spending (home-city, today's USD) that keeps success >= target. */
  maxSpendHome: number
  /** Same lifestyle multiplier expressed at the destination, if any. */
  maxSpendDest: number | null
  target: number
}

// Worker protocol
export type WorkerRequest =
  | { id: number; kind: 'simulate'; inputs: PlanInputs }
  | { id: number; kind: 'atlas'; inputs: PlanInputs; cityIds: string[] }
  | { id: number; kind: 'solve'; inputs: PlanInputs; target: number }

export type WorkerResponse =
  | { id: number; kind: 'simulate'; result: SimulationResult }
  | { id: number; kind: 'atlas'; result: AtlasEntry[] }
  | { id: number; kind: 'solve'; result: SolveResult }
  | { id: number; kind: 'error'; message: string }
