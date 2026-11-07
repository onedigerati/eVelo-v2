// Local wealth and inheritance tax math (pure). Amounts are real, today's USD.
//
// Bands are marginal: band i's rate applies to the part of the amount between its `from` and the
// next band's `from`. Below the first band's `from` nothing is due.

import { bandTaxPacked, type PackedBands } from './kernel'
import type { LocalTax, TaxBand } from './types'

export { bandTaxPacked, type PackedBands }

/** Assumed heirs: two US-resident adult children, sharing the estate equally. */
export const HEIRS = 2

export function packBands(bands: readonly TaxBand[]): PackedBands {
  const s = [...bands].sort((a, b) => a.from - b.from)
  return { from: s.map((b) => b.from), rate: s.map((b) => b.rate) }
}

export function bandTax(amount: number, bands: readonly TaxBand[]): number {
  return bandTaxPacked(amount, packBands(bands))
}

/** Annual wealth tax on a real base (net worth or gross portfolio, per the regime). */
export function wealthTax(base: number, w: NonNullable<LocalTax['wealth']>): number {
  return base > 0 ? bandTax(base, w.bands) : 0
}

/** Inheritance tax on a real estate split equally among `heirs`. */
export function inheritanceTax(
  estate: number,
  inh: NonNullable<LocalTax['inheritance']>,
  heirs: number = HEIRS,
): number {
  if (!(estate > 0) || heirs < 1) return 0
  const share = estate / heirs
  return heirs * bandTax(Math.max(0, share - inh.perHeirAllowance), inh.bands)
}
