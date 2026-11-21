// The twin ledgers' pure parts (TwinLedgers.tsx): the "came from" bar and each plan's event line for
// one year. No DOM. Every figure is that year's median in today's dollars, so the parts needn't add up.

import { currencyCompact, percent } from '../format'
import type { EveloYear, IncomeYear } from './walkthrough'

/** A portfolio falling this much or more over the year (median end vs start) is a bad year. */
export const DROP = 0.05

export type BarKey = 'income' | 'ss' | 'sold' | 'borrowed'

export interface BarPart {
  key: BarKey
  label: string
  value: number
  /** Share of the bar, 0..1; the shares of a non-empty bar sum to 1. */
  share: number
}

const pos = (v: number) => (Number.isFinite(v) && v > 0 ? v : 0)

function parts(list: Array<Omit<BarPart, 'share'>>): BarPart[] {
  const kept = list.map((p) => ({ ...p, value: pos(p.value) })).filter((p) => p.value > 0)
  const total = kept.reduce((s, p) => s + p.value, 0)
  return kept.map((p) => ({ ...p, share: p.value / total }))
}

/** Living on income: dividends and interest (capped at spending), Social Security, shares sold. */
export function incomeBar(y: IncomeYear): BarPart[] {
  return parts([
    { key: 'income', label: 'Dividends and interest', value: Math.min(pos(y.dividendsInterest), pos(y.spending)) },
    { key: 'ss', label: 'Social Security', value: y.socialSecurity },
    { key: 'sold', label: 'Shares sold', value: y.sold },
  ])
}

/** eVelo: Social Security and the year's borrowing. */
export function eveloBar(y: EveloYear): BarPart[] {
  return parts([
    { key: 'ss', label: 'Social Security', value: y.socialSecurity },
    { key: 'borrowed', label: 'Borrowed', value: y.borrowed },
  ])
}

/** What eVelo's year was paid from (it has no spending field of its own): Social Security plus borrowing. */
export function eveloFunded(y: EveloYear): number {
  return pos(y.socialSecurity) + pos(y.borrowed)
}

/** The fall of the median portfolio over the year (0.2 = fell 20%), or 0 when it held or rose. */
export function portfolioFall(start: number, end: number): number {
  if (!(start > 0) || !Number.isFinite(end)) return 0
  return Math.max(0, 1 - end / start)
}

const money = (v: number) => currencyCompact(v)

/** Social Security starting this year, judged against the plan's previous year when there is one. */
function ssStarts(cur: number, prev: number | undefined): boolean {
  return prev !== undefined && !(prev > 0) && cur > 0
}

export function incomeEvent(y: IncomeYear, prev?: IncomeYear | null): string {
  const out: string[] = []
  const fall = portfolioFall(y.portfolioStart, y.portfolio)
  if (fall >= DROP) {
    out.push(`The portfolio falls ${percent(fall)} this year.`)
    if (pos(y.sold) > 0) out.push(`Sells ${money(y.sold)} into the drop.`)
  }
  if (ssStarts(y.socialSecurity, prev?.socialSecurity)) out.push('Social Security starts.')
  if (pos(y.reinvested) > 0) out.push(`Income beats spending; ${money(y.reinvested)} goes back in.`)
  if (out.length) return out.join(' ')
  return pos(y.sold) > 0 ? 'A quiet year: income plus a top-up sale.' : 'A quiet year: income covers it.'
}

export function eveloEvent(y: EveloYear, prev?: EveloYear | null): string {
  const out: string[] = []
  const fall = portfolioFall(y.portfolioStart, y.portfolio)
  if (pos(y.forcedSaleSold) > 0) out.push(`Forced sale: ${money(y.forcedSaleSold)} of shares sold.`)
  else if (fall >= DROP) out.push(`The portfolio falls ${percent(fall)}; loan-to-value jumps to ${percent(y.ltv)}.`)
  if (ssStarts(y.socialSecurity, prev?.socialSecurity)) out.push('Social Security starts.')
  if (pos(y.repaid) > 0) out.push(`Income above spending repays ${money(y.repaid)} of the loan.`)
  return out.length ? out.join(' ') : 'A quiet year: the loan grows, nothing is sold.'
}

/** The one line under both ledgers. */
export const LEDGER_NOTE = "Each line is that year's median in today's dollars, so the lines don't add up."
