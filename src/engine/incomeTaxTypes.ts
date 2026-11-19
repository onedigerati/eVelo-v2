// Contract for the living-on-income tax module (stage 2). Pure types, no logic.
// All amounts are real, today's (2026) USD, the engine's unit.

import type { TaxBand } from './types'

export type FilingStatus = 'single' | 'mfj'

/** One year's income, by type, in real 2026 USD. Every field defaults to 0; a non-finite or negative value is treated as 0. */
export interface IncomeYear {
  /** Qualified dividends (e.g. SPY's). */
  qualifiedDividends?: number
  /** Taxable interest and non-qualified distributions, other than Treasury interest (e.g. VBMFX). */
  taxableInterest?: number
  /** US Treasury interest: federally taxed, state-exempt (e.g. VFITX). */
  treasuryInterest?: number
  /** Muni interest from a national muni fund (e.g. VWITX): federally exempt. */
  muniInterest?: number
  /**
   * Net long-term capital gains realised by sales in the year. The caller nets the year's realised
   * gains and losses; a net loss is passed as 0 (or is treated as 0). No loss carry-forward and no
   * $3,000 offset against ordinary income are modelled.
   */
  longTermGains?: number
  /** Social Security benefits received (gross). */
  socialSecurity?: number
  /** Pension and other ordinary income (left out of the state base where `taxesPensions` is false). */
  otherOrdinary?: number
}

/** How a state taxes muni interest from a national fund held by its residents. */
export type MuniRule =
  /** In-state munis exempt, other states' taxed: a national fund's income is (taken as) all taxed. */
  | 'in-state-exempt'
  /** All muni interest taxed, in-state too (e.g. Illinois). */
  | 'all-taxed'
  /** All muni interest exempt (none of the home cities' states since DC began taxing other states' munis in 2025). */
  | 'all-exempt'
  /** Other states' munis exempt only if the issuing state reciprocates (e.g. Utah): taken as taxed. */
  | 'reciprocal'

/** A US home city's state (and, where it reaches investment income, local) income tax. */
export interface StateIncomeTax {
  /** Two-letter state code ('DC' for Washington, DC). */
  state: string
  /** False for a state with no broad personal income tax on interest and dividends. */
  taxesInvestmentIncome: boolean
  muni: MuniRule
  /** Marginal bands on state taxable income (real 2026 USD), per filing status. Empty when untaxed. */
  bands: Record<FilingStatus, TaxBand[]>
  /** Standard deduction plus personal exemptions, per filing status (real 2026 USD). */
  deduction: Record<FilingStatus, number>
  /**
   * False when the state excludes pensions and other retirement income, so `otherOrdinary` is left out
   * of the state (and local) base (IL, PA, HI). A partial exclusion stays true and is described in `note`.
   */
  taxesPensions: boolean
  /** True when the state taxes Social Security benefits (the module then includes the federally taxable part). */
  taxesSocialSecurity: boolean
  /** Retirement-income exclusion per filer aged 65+, off the state base (real 2026 USD; e.g. Georgia's $65,000, which covers interest and dividends). */
  retirementExclusionPer65?: number
  /** Share of long-term gains the state subtracts from its base (e.g. Missouri's 100% from 2025 = 1). */
  gainsExclusion?: number
  /** A local income tax that reaches interest and dividends, as a flat rate on the same base (e.g. NYC, Philadelphia). */
  localRate?: number
  /**
   * The local tax skips long-term gains (e.g. Philadelphia's School Income Tax exempts gains on property
   * held over six months). Treasury interest is already outside the state base, so the local base too.
   */
  localExcludesLongTermGains?: boolean
  /** Sources read, with dates; and anything simplified. */
  sources: string[]
  note?: string
}

export interface IncomeTaxOptions {
  status: FilingStatus
  /** People on the return aged 65 or over (capped at 1 for a single filer). */
  over65: 0 | 1 | 2
  /** Cumulative US inflation since 2026 (1 = 2026). Finite and > 0, else a RangeError. */
  priceLevel: number
  /** The price level the inflation-indexed amounts (brackets, deductions, 0/15/20 breakpoints,
   *  state bands) were last indexed to; in real terms they scale by indexLevel ÷ priceLevel.
   *  Finite and > 0, else a RangeError. Defaults to `priceLevel` (no lag). */
  indexLevel?: number
  /** The home state's income tax; omitted means federal only (a foreign home). */
  state?: StateIncomeTax
  /** Tax year (an integer), required so the OBBBA senior deduction's 2029 sunset is never skipped. */
  year: number
}

export interface IncomeTaxResult {
  federal: number
  /** Of which NIIT. */
  niit: number
  state: number
  total: number
  /** Social Security benefits counted as federally taxable. */
  taxableSocialSecurity: number
}
