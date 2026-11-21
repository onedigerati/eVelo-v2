// Same storm's chart, the pure part: the points both plans trace through one future, the tween
// between two futures, the shared scales' domains, the age ticks and the chart's text alternative.
// SameStormChart.tsx draws them.

import { currencyCompact, percent } from '../format'
import type { StormFuture } from './sameStorm'

/** The plans' values before the first year (the same for every future): each plan's start. */
export interface StormStart {
  income: number
  evelo: number
  ltv: number
}

/** A future's values at each year end k = 0..n (k = 0 the start, k = y + 1 the end of year y). */
export interface StormPoints {
  income: number[]
  evelo: number[]
  ltv: number[]
}

const fin = (v: number | undefined | null, or: number) => (typeof v === 'number' && Number.isFinite(v) ? v : or)

/** The points for one future. A missing or non-finite start falls back to the first year's value. */
export function stormPoints(f: StormFuture, start: Partial<StormStart> | null): StormPoints {
  const first = f.years[0]
  const out: StormPoints = {
    income: [fin(start?.income, fin(first?.income.portfolio, 0))],
    evelo: [fin(start?.evelo, fin(first?.evelo.netWorth, 0))],
    ltv: [fin(start?.ltv, fin(first?.evelo.ltv, 0))],
  }
  for (const y of f.years) {
    out.income.push(fin(y.income.portfolio, 0))
    out.evelo.push(fin(y.evelo.netWorth, 0))
    out.ltv.push(fin(y.evelo.ltv, 0))
  }
  return out
}

/** Ease-out cubic, 0..1 → 0..1. */
export const easeOut = (u: number) => 1 - Math.pow(1 - Math.max(0, Math.min(1, u)), 3)

/** `from` moved a share `e` of the way to `to`; a length mismatch snaps to `to`. */
export function tweenPoints(from: StormPoints, to: StormPoints, e: number): StormPoints {
  if (e >= 1 || from.income.length !== to.income.length) return to
  const mix = (a: number[], b: number[]) => b.map((v, i) => a[i] + (v - a[i]) * e)
  return { income: mix(from.income, to.income), evelo: mix(from.evelo, to.evelo), ltv: mix(from.ltv, to.ltv) }
}

/** Net worth domain over every future, so switching keeps the scale: always includes 0. */
export function worthDomain(all: readonly StormPoints[]): [number, number] {
  let lo = 0
  let hi = 1
  for (const p of all)
    for (const v of [...p.income, ...p.evelo]) {
      if (v < lo) lo = v
      if (v > hi) hi = v
    }
  return [lo, hi]
}

/** Loan-to-value domain: 0 to a little past the margin call, or to the highest LTV seen (at most 100%). */
export function ltvDomain(all: readonly StormPoints[], callLtv: number): [number, number] {
  let hi = Math.max(0.1, fin(callLtv, 0.5) * 1.25)
  for (const p of all) for (const v of p.ltv) if (v > hi) hi = v
  return [0, Math.min(1, hi)]
}

/** Year indices (0-based) with a margin-call forced sale. */
export function forcedSaleYears(f: StormFuture): number[] {
  const out: number[] = []
  f.years.forEach((y, i) => {
    if (y.evelo.forcedSaleSold > 0) out.push(i)
  })
  return out
}

/** Age ticks over a0..a1: the ends and round ages (every 5 or 10) between them. */
export function stormAgeTicks(a0: number, a1: number, phone: boolean): number[] {
  const step = a1 - a0 > 30 || phone ? 10 : 5
  const out = [a0]
  for (let a = Math.ceil((a0 + 1) / step) * step; a < a1; a += step) if (a - a0 >= step / 2 && a1 - a >= step / 2) out.push(a)
  if (a1 > a0) out.push(a1)
  return out
}

/** The chart's text alternative: the future, each plan's end value, the peak loan-to-value and the forced sales. */
export function stormChartLabel(f: StormFuture): string {
  const last = f.years[f.years.length - 1]
  if (!last) return `Both plans through the ${f.label.toLowerCase()} future: no years to show.`
  const end = last.age + 1
  const peak = Math.max(...f.years.map((y) => y.evelo.ltv))
  const sales = forcedSaleYears(f)
  const sold = sales.reduce((s, i) => s + f.years[i].evelo.forcedSaleSold, 0)
  const salesText =
    sales.length === 0
      ? 'no forced sale'
      : `forced sales of ${currencyCompact(sold)} in ${sales.length === 1 ? 'one year' : `${sales.length} years`} (${sales.length === 1 ? 'age' : 'ages'} ${sales.map((i) => f.years[i].age).join(', ')})`
  return (
    `Both plans’ net worth through the ${f.label.toLowerCase()} future, today’s dollars. ` +
    `At ${end}: living on income ${currencyCompact(last.income.portfolio)}, eVelo ${currencyCompact(last.evelo.netWorth)} after its loan. ` +
    `eVelo’s loan-to-value peaks at ${percent(peak)} against a ${percent(f.callLtv)} margin call; ${salesText}.`
  )
}
