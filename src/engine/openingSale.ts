// The opening forced sale: what the lender does today, before the first month runs, when the
// plan starts with an existing loan above the margin-call LTV. Shared by the kernel and the
// Borrowing input's warning, so the two always agree.

export type OpeningSale =
  | null
  | { broken: true }
  | {
      broken: false
      /** Shares sold (gross, USD). */
      sold: number
      /** Capital-gains tax paid out of the proceeds (USD). */
      taxPaid: number
      /** Position after the sale: portfolio, loan and cost basis (USD). */
      port: number
      loan: number
      basis: number
    }

/**
 * Opening position for portfolio V, cost basis B and loan L.
 * - Broken when L > 0 and the loan is at or above the portfolio (checked first, so maxLtv >= 1
 *   can't hide it), or when even selling everything can't bring the loan to targetLtv after tax.
 * - null when L <= maxLtv · V: no sale.
 * - Otherwise the kernel's forced-sale formula: S = (L − target·V) / (1 − g·tax − target), with
 *   g = max(0, 1 − B/V) the embedded-gain fraction; the tax comes out of the proceeds and the
 *   basis falls pro rata. The result lands at exactly targetLtv.
 */
export function openingSale(V: number, B: number, L: number, maxLtv: number, targetLtv: number, tax: number): OpeningSale {
  if (L > 0 && (V <= 0 || L >= V)) return { broken: true }
  if (!(L > maxLtv * V)) return null
  const g = B < V ? 1 - B / V : 0
  const S = (L - targetLtv * V) / (1 - g * tax - targetLtv)
  if (S >= V || !(S > 0)) return { broken: true }
  return {
    broken: false,
    sold: S,
    taxPaid: S * g * tax,
    port: V - S,
    loan: L - S * (1 - g * tax),
    basis: B * (1 - S / V),
  }
}
