// Monthly income yield from a fund's distribution events (pure; used by refresh-data.mjs).
//
// Yahoo's distribution events for mutual funds contain lumps (misrecorded capital gains several
// times the usual monthly income), so a plain trailing-12-month sum would spike. Instead:
//
//   y(m) = perYear × median(non-zero monthly payouts in the 12 months ending m) / close(m)
//
// perYear is the asset's payment frequency (12 for the monthly bond funds, 4 for SPY). The median
// rejects lumps as long as fewer than half the paying months in the window are lumps. Months where
// a payment slipped across a month boundary (two in one month, none in the next) are also absorbed:
// the empty month is ignored and the doubled one is an outlier. `close` is the raw (split-adjusted,
// not dividend-adjusted) month-end price, the price the distribution was paid against.
//
// Yahoo's distribution events thin out in recent years (VFITX has none from 2025-08, VBMFX lacks
// most of its last 15 months). A monthly payer's month with no event therefore takes the payout
// implied by the adjusted close against the raw close (impliedPayouts). Where both exist the two
// agree to a median 0.3-0.4% over ~400 months per fund, so events stay the source wherever they
// exist and the history they gave is unchanged. Quarterly payers (SPY) are not filled: their
// non-paying months imply ~0 plus rounding noise, and their events are complete.
//
// Warm-up: a month whose 12-month window reaches back before the asset's first price (SPY in 1993,
// whose first payment covered a partial quarter) is back-filled from the first month with a full
// window, so the start holds no one-off jump. Later months with no payment in the window or no
// close are copied forward from the previous month. The result is rounded to 5 dp.

const prevYm = (s) => {
  let [y, m] = s.split('-').map(Number)
  m--
  if (m < 1) (m = 12), y--
  return `${y}-${String(m).padStart(2, '0')}`
}

export function median(xs) {
  const s = [...xs].sort((a, b) => a - b)
  const n = s.length
  return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2
}

/** A month's implied payout counts as a payment only above this fraction of the previous close
 *  (0.01%, i.e. 0.12%/yr for a monthly payer): below it, it is rounding noise. */
export const IMPLIED_MIN_FRAC = 1e-4

/**
 * Payout implied by the adjusted close against the raw close, per month:
 *   implied(m) = close(m-1) × adj(m) / adj(m-1) − close(m), floored at 0.
 * Yahoo's adjclose reinvests each distribution, so the extra adjusted growth over the raw close
 * is the month's payout (in price units of the previous close).
 * @param {Map<string, number>} adj month -> adjusted close
 * @param {Map<string, number>} raw month -> raw close
 * @returns {Map<string, number>} month -> implied payout (months with both closes for m-1 and m)
 */
export function impliedPayouts(adj, raw) {
  const out = new Map()
  for (const [m, a] of adj) {
    const p = prevYm(m)
    const a0 = adj.get(p)
    const c0 = raw.get(p)
    const c = raw.get(m)
    if (!(a > 0 && a0 > 0 && c0 > 0 && c > 0)) continue
    out.set(m, Math.max(0, c0 * (a / a0) - c))
  }
  return out
}

/**
 * Per-month detail of the income yield.
 * @param {string[]} cal calendar months "YYYY-MM"
 * @param {Map<string, number>} dists month -> total distribution events paid in that month
 * @param {Map<string, number>} closes month -> raw month-end close
 * @param {number} perYear payments per year (12 monthly, 4 quarterly)
 * @param {Map<string, number>} [implied] month -> implied payout; fills event-less months of a
 *   monthly payer (perYear 12)
 * @returns {{ y: number[], src: string, paid: number[], implied: string[], copied: string[], backfilled: string[] }}
 *   src has one code per calendar month: E = window from events only, I = window uses an implied
 *   payout, C = copied forward, B = back-filled warm-up. paid = payments in each month's window.
 */
export function incomeYieldDetail(cal, dists, closes, perYear, implied) {
  const fill = perYear === 12 && implied
  const payout = (k) => {
    const d = dists.get(k)
    if (d > 0) return [d, false]
    if (!fill) return [0, false]
    const v = implied.get(k)
    const c0 = closes.get(prevYm(k))
    return v > 0 && c0 > 0 && v > IMPLIED_MIN_FRAC * c0 ? [v, true] : [0, false]
  }
  const firstClose = [...closes.keys()].filter((k) => closes.get(k) > 0).sort()[0]
  const usedImplied = new Set()
  const src = []
  const paidN = []
  const y = cal.map((m) => {
    const close = closes.get(m)
    const paid = []
    let anyImplied = false
    let k = m
    for (let j = 0; j < 12; j++, k = prevYm(k)) {
      const [d, imp] = payout(k)
      if (d > 0) {
        paid.push(d)
        if (imp) (anyImplied = true), usedImplied.add(k)
      }
    }
    paidN.push(paid.length)
    // k is now the month before the window: the window is full if the asset had a price by then.
    const full = firstClose != null && firstClose <= k
    if (!(close > 0) || !paid.length) return src.push('C'), null
    if (!full) return src.push('B'), null
    src.push(anyImplied ? 'I' : 'E')
    return Math.round(((perYear * median(paid)) / close) * 1e5) / 1e5
  })
  const firstIdx = y.findIndex((v) => v != null)
  if (firstIdx < 0) throw new Error('no income yield computable')
  for (let i = 0; i < firstIdx; i++) (y[i] = y[firstIdx]), (src[i] = 'B')
  for (let i = firstIdx + 1; i < y.length; i++) if (y[i] == null) (y[i] = y[i - 1]), (src[i] = 'C')
  return {
    y,
    src: src.join(''),
    paid: paidN,
    implied: [...usedImplied].sort(),
    copied: cal.filter((_, i) => src[i] === 'C'),
    backfilled: cal.filter((_, i) => src[i] === 'B'),
  }
}

/** Annualised income yield (decimal) per calendar month; see incomeYieldDetail. */
export function incomeYield(cal, dists, closes, perYear, implied) {
  return incomeYieldDetail(cal, dists, closes, perYear, implied).y
}

/** Yahoo chart `events.dividends` -> Map<"YYYY-MM", total amount>, keyed by the event's UTC date
 *  (events are stamped during the US trading day, so UTC date = exchange date). */
export function monthlyDistributions(dividends) {
  const out = new Map()
  for (const e of Object.values(dividends || {})) {
    if (typeof e?.amount !== 'number' || !Number.isFinite(e.amount) || !(e.amount > 0) || !e.date) continue
    const d = new Date(e.date * 1000)
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
    out.set(key, (out.get(key) || 0) + e.amount)
  }
  return out
}
