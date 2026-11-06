// TEMPORARY STUB (Stage 2). The engine stage owns this file; when it lands, its version
// replaces this one. Only DEFAULT_INPUTS is relied on by the UI shell.
import type { PlanInputs } from './types'

export const DEFAULT_INPUTS: PlanInputs = {
  holdings: [
    { symbol: 'VTI', weight: 0.6 },
    { symbol: 'QQQ', weight: 0.25 },
    { symbol: 'BND', weight: 0.15 },
  ],
  portfolio: 5_000_000,
  basisFraction: 0.3,
  age: 55,
  horizonYears: 30,

  budget: {
    housing: 60_000,
    groceries: 14_000,
    dining: 12_000,
    transport: 10_000,
    utilities: 6_000,
    healthcare: 18_000,
    travel: 20_000,
    other: 10_000,
  },
  homeCityId: 'new-york',
  destCityId: null,
  moveInYears: 0,
  expatFactor: 0.3,

  otherIncome: 40_000,
  incomeStartAge: 67,

  loanRate: 0.065,
  maxLtv: 0.6,
  targetLtvAfterCall: 0.45,
  capGainsRate: 0.238,
  dividendTaxDrag: 0.0025,

  method: 'bootstrap',
  outlook: 'balanced',
  blockMonths: 12,
  paths: 2000,
  seed: 42,
}
