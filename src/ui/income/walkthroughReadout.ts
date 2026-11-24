// The walkthrough chart's hover readout (WalkthroughChart.tsx): which year row a pointer x is over,
// and the figures the floating readout box shows for it, all read off the walkthrough's year rows.
// The chart plots year ends, so row i is read at the end of age `age`: each plan's net worth, the gap
// between them, eVelo's portfolio, loan and loan-to-value, and Living on income's shares sold. A plan
// not lived that year (no row, or it ended or broke earlier) has no figures.

import { currencyCompact, percent } from '../format'
import type { WalkYear } from './walkthrough'

/** The row under a pixel x, for a plot running x0..x1 over `n` rows: clamped to 0..n − 1. */
export function rowAtX(x: number, x0: number, x1: number, n: number): number {
  if (n <= 0) return 0
  const span = x1 - x0
  const r = span > 0 ? Math.floor(((x - x0) / span) * n) : 0
  return Math.max(0, Math.min(n - 1, r))
}

const fin = (v: number | undefined): v is number => v !== undefined && Number.isFinite(v)

export interface WalkReadout {
  /** The row read (index into the years). */
  index: number
  /** The age whose end the figures are at. */
  age: number
  /** "year N": years lived by this year end. */
  note: string
  /** Living on income at the year end, or null when it isn't lived that year. */
  income: { netWorth: number; sold: number; text: { netWorth: string; sold: string } } | null
  /** eVelo at the year end, or null when it isn't lived that year. */
  evelo: {
    netWorth: number
    portfolio: number
    loan: number
    ltv: number
    text: { netWorth: string; portfolio: string; loan: string; ltv: string }
  } | null
  /** eVelo's net worth less Living on income's, when both are lived. */
  gap: { ahead: 'income' | 'evelo' | null; amount: number; text: string; value: string } | null
}

/** The readout for row `index` (clamped), or null when there are no rows. */
export function walkReadout(years: readonly WalkYear[], index: number): WalkReadout | null {
  const n = years.length
  if (n <= 0) return null
  const i = Math.max(0, Math.min(n - 1, Math.round(index)))
  const row = years[i]
  const inc = row.income && fin(row.income.netWorth) ? row.income : null
  const ev = row.evelo && fin(row.evelo.netWorth) ? row.evelo : null
  const income = inc
    ? {
        netWorth: inc.netWorth,
        sold: fin(inc.sold) ? Math.max(0, inc.sold) : 0,
        text: { netWorth: currencyCompact(inc.netWorth), sold: currencyCompact(fin(inc.sold) ? Math.max(0, inc.sold) : 0) },
      }
    : null
  const evelo = ev
    ? {
        netWorth: ev.netWorth,
        portfolio: ev.portfolio,
        loan: ev.loan,
        ltv: ev.ltv,
        text: { netWorth: currencyCompact(ev.netWorth), portfolio: currencyCompact(ev.portfolio), loan: currencyCompact(ev.loan), ltv: percent(ev.ltv) },
      }
    : null
  let gap: WalkReadout['gap'] = null
  if (income && evelo) {
    const d = evelo.netWorth - income.netWorth
    gap =
      d > 0
        ? { ahead: 'evelo', amount: d, text: 'eVelo ahead by', value: currencyCompact(d) }
        : d < 0
          ? { ahead: 'income', amount: d, text: 'Living on income ahead by', value: currencyCompact(-d) }
          : { ahead: null, amount: 0, text: 'Gap', value: currencyCompact(0) }
  }
  return { index: i, age: row.age, note: `year ${i + 1}`, income, evelo, gap }
}

/** The readout for the row under pixel x in a plot running x0..x1. */
export function walkReadoutAt(years: readonly WalkYear[], x: number, x0: number, x1: number): WalkReadout | null {
  return walkReadout(years, rowAtX(x, x0, x1, years.length))
}
