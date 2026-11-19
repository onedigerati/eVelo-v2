// Income tax on one year's income by character (pure, no DOM). Stage 2, living on income.
//
// All amounts are real 2026 USD. `priceLevel` is cumulative US inflation since 2026 (1 = 2026).
// Federal brackets, the standard deduction (and its 65+ additions) and the 0/15/20% breakpoints are
// inflation-indexed, so they are constant in real terms. Thresholds fixed in nominal dollars by
// statute (NIIT, Social Security provisional income, the OBBBA senior deduction and its phase-out)
// are divided by `priceLevel` to get their real value.
//
// Figures: docs/research/conventional-income-taxes.md §1 (Rev. Proc. 2025-32 for 2026; IRS Topic
// 559; Pub 915; IRS newsroom on the OBBBA senior deduction).
//
// Assumptions:
// - Qualified dividends and long-term gains are the only preferential income; everything else in
//   AGI is ordinary. Muni interest is federally exempt and outside AGI/MAGI, but counts in Social
//   Security provisional income.
// - The standard deduction is always taken (no itemising) and offsets ordinary income first.
// - OBBBA senior deduction: $6,000 per person 65+, for tax years 2025-2028 only (dropped from 2029;
//   the TCJA standard deduction itself stays, OBBBA made it permanent). Each person's $6,000 is
//   reduced by 6% of MAGI above $75,000 single / $150,000 joint. The 6% rate is commonly cited but
//   not verified. The $6,000 and the thresholds are taken as unindexed (nominal), so real = ÷ priceLevel.
//   MAGI here is AGI (no foreign-earned-income exclusions in this model).
// - For a single filer `over65` is capped at 1.
// - NIIT: net investment income = taxable interest + Treasury interest + qualified dividends +
//   long-term gains. `otherOrdinary` (pension) and Social Security are not NII. MAGI = AGI.
// - No AMT, no IRMAA, no SALT deduction (the standard deduction is assumed).
// - State: the gains exclusion and the per-65+ retirement exclusion (counted with the capped
//   `over65`) come off the state base before the state deduction; `otherOrdinary` is left out where
//   the state excludes pensions. The local rate uses the same base, less long-term gains where the
//   local tax skips them (Philadelphia).
// - Inputs: `priceLevel` finite and > 0 and `year` an integer, else a RangeError; a non-finite or
//   negative income field counts as 0.

import { bandTaxPacked, packBands, type PackedBands } from './localTax'
import type {
  FilingStatus,
  IncomeTaxOptions,
  IncomeTaxResult,
  IncomeYear,
} from './incomeTaxTypes'
import type { TaxBand } from './types'

export type { IncomeTaxOptions }

/** 2026 ordinary brackets, taxable income (Rev. Proc. 2025-32 §4.01). */
export const FEDERAL_BANDS: Record<FilingStatus, TaxBand[]> = {
  single: [
    { from: 0, rate: 0.1 },
    { from: 12_400, rate: 0.12 },
    { from: 50_400, rate: 0.22 },
    { from: 105_700, rate: 0.24 },
    { from: 201_775, rate: 0.32 },
    { from: 256_225, rate: 0.35 },
    { from: 640_600, rate: 0.37 },
  ],
  mfj: [
    { from: 0, rate: 0.1 },
    { from: 24_800, rate: 0.12 },
    { from: 100_800, rate: 0.22 },
    { from: 211_400, rate: 0.24 },
    { from: 403_550, rate: 0.32 },
    { from: 512_450, rate: 0.35 },
    { from: 768_700, rate: 0.37 },
  ],
}

// Bands packed once (federal at load, state on first use) so the yearly hot loop never re-sorts them.
const FEDERAL_PACKED: Record<FilingStatus, PackedBands> = {
  single: packBands(FEDERAL_BANDS.single),
  mfj: packBands(FEDERAL_BANDS.mfj),
}
const statePacked = new WeakMap<readonly TaxBand[], PackedBands>()
function packedState(bands: readonly TaxBand[]): PackedBands {
  let p = statePacked.get(bands)
  if (!p) statePacked.set(bands, (p = packBands(bands)))
  return p
}

/** An income field: missing, non-finite or negative counts as 0. */
const amt = (x: number | undefined): number => (x !== undefined && x > 0 && x < Infinity ? x : 0)

/** 2026 standard deduction and the 65+ addition per person (Rev. Proc. 2025-32 §4.14). */
export const STANDARD_DEDUCTION: Record<FilingStatus, number> = { single: 16_100, mfj: 32_200 }
export const AGED_ADDITION: Record<FilingStatus, number> = { single: 2_050, mfj: 1_650 }

/** 0/15/20% breakpoints on taxable income for qualified dividends and LTCG (Rev. Proc. 2025-32 §4.03). */
export const PREF_BREAKS: Record<FilingStatus, { zeroTo: number; fifteenTo: number }> = {
  single: { zeroTo: 49_450, fifteenTo: 545_500 },
  mfj: { zeroTo: 98_900, fifteenTo: 613_700 },
}

/** OBBBA senior deduction (nominal, unindexed), tax years 2025-2028. Phase-out rate not verified. */
export const SENIOR_DEDUCTION = 6_000
export const SENIOR_PHASEOUT_FROM: Record<FilingStatus, number> = { single: 75_000, mfj: 150_000 }
export const SENIOR_PHASEOUT_RATE = 0.06
export const SENIOR_LAST_YEAR = 2028

/** NIIT (IRS Topic 559): nominal, unindexed thresholds. */
export const NIIT_RATE = 0.038
export const NIIT_THRESHOLD: Record<FilingStatus, number> = { single: 200_000, mfj: 250_000 }

/** Social Security provisional-income base amounts (Pub 915): nominal, unindexed. */
export const SS_BASE: Record<FilingStatus, { first: number; second: number }> = {
  single: { first: 25_000, second: 34_000 },
  mfj: { first: 32_000, second: 44_000 },
}

/** Taxable Social Security per the Pub 915 worksheet, with real (deflated) base amounts. */
export function taxableSocialSecurity(
  benefits: number,
  otherIncome: number,
  status: FilingStatus,
  priceLevel: number,
): number {
  if (benefits <= 0) return 0
  const first = SS_BASE[status].first / priceLevel
  const second = SS_BASE[status].second / priceLevel
  const provisional = otherIncome + benefits / 2
  const over = provisional - first
  if (over <= 0) return 0
  const band = second - first
  const fifty = Math.min(Math.min(over, band) / 2, benefits / 2)
  const eightyFive = 0.85 * Math.max(0, over - band)
  return Math.min(fifty + eightyFive, 0.85 * benefits)
}

export function incomeTax(income: IncomeYear, opts: IncomeTaxOptions): IncomeTaxResult {
  const { status, priceLevel, year } = opts
  if (!(Number.isFinite(priceLevel) && priceLevel > 0))
    throw new RangeError(`incomeTax: priceLevel must be finite and > 0, got ${priceLevel}`)
  if (!Number.isInteger(year)) throw new RangeError(`incomeTax: year must be an integer, got ${year}`)
  const qd = amt(income.qualifiedDividends)
  const interest = amt(income.taxableInterest)
  const treasury = amt(income.treasuryInterest)
  const muni = amt(income.muniInterest)
  const ltcg = amt(income.longTermGains)
  const ss = amt(income.socialSecurity)
  const other = amt(income.otherOrdinary)

  // Social Security: provisional income = other AGI items + muni interest + half the benefits.
  const agiExSS = interest + treasury + other + qd + ltcg
  const taxableSS = taxableSocialSecurity(ss, agiExSS + muni, status, priceLevel)
  const agi = agiExSS + taxableSS

  // Deductions.
  const aged = Math.min(opts.over65, status === 'single' ? 1 : 2)
  let deduction = STANDARD_DEDUCTION[status] + aged * AGED_ADDITION[status]
  if (aged > 0 && year >= 2025 && year <= SENIOR_LAST_YEAR) {
    const excess = Math.max(0, agi - SENIOR_PHASEOUT_FROM[status] / priceLevel)
    const each = Math.max(0, SENIOR_DEDUCTION / priceLevel - SENIOR_PHASEOUT_RATE * excess)
    deduction += aged * each
  }

  // Ordinary first, preferential stacked on top.
  const ordinary = interest + treasury + other + taxableSS
  const pref = qd + ltcg
  const taxable = Math.max(0, ordinary + pref - deduction)
  const prefTaxable = Math.min(pref, taxable)
  const ordTaxable = taxable - prefTaxable
  const ordinaryTax = bandTaxPacked(ordTaxable, FEDERAL_PACKED[status])
  const { zeroTo, fifteenTo } = PREF_BREAKS[status]
  const overlap = (lo: number, hi: number) =>
    Math.max(0, Math.min(taxable, hi) - Math.max(ordTaxable, lo))
  const prefTax = 0.15 * overlap(zeroTo, fifteenTo) + 0.2 * overlap(fifteenTo, Infinity)

  // NIIT on the lesser of NII and MAGI over the (real) threshold.
  const nii = interest + treasury + qd + ltcg
  const niit =
    NIIT_RATE * Math.max(0, Math.min(nii, agi - NIIT_THRESHOLD[status] / priceLevel))

  const federal = ordinaryTax + prefTax + niit

  // State (and local) income tax.
  let state = 0
  const st = opts.state
  if (st && st.taxesInvestmentIncome) {
    const gains = (1 - (st.gainsExclusion ?? 0)) * ltcg
    const base =
      interest +
      qd +
      gains +
      (st.taxesPensions ? other : 0) +
      (st.muni === 'all-exempt' ? 0 : muni) +
      (st.taxesSocialSecurity ? taxableSS : 0)
    const perAged = (st.retirementExclusionPer65 ?? 0) * aged
    const ded = st.deduction[status]
    const taxableOf = (b: number) => Math.max(0, b - Math.min(Math.max(0, b), perAged) - ded)
    const stTaxable = taxableOf(base)
    state = bandTaxPacked(stTaxable, packedState(st.bands[status]))
    if (st.localRate) {
      const localTaxable = st.localExcludesLongTermGains ? taxableOf(base - gains) : stTaxable
      state += st.localRate * localTaxable
    }
  }

  return { federal, niit, state, total: federal + state, taxableSocialSecurity: taxableSS }
}
