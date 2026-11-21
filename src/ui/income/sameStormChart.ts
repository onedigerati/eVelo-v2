// Same storm's chart, the pure part: the points both plans trace through one future, the tween
// between two futures, the shared scales' domains, the age ticks and the chart's text alternative.
// SameStormChart.tsx draws them.

import { scaleLinear } from 'd3-scale'
import { currencyCompact, percent } from '../format'
import type { StormFuture, StormYear } from './sameStorm'

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

/** One future's net-worth domain, niced to `ticks` ticks: each future gets its own scale (a lucky
 *  future's $25M would squash the others), tweened between futures with `tweenDomain`. */
export function futureDomain(p: StormPoints, ticks: number): [number, number] {
  const [lo, hi] = scaleLinear().domain(worthDomain([p])).nice(ticks).domain()
  return [lo, hi]
}

/** `from` moved a share `e` of the way to `to`. */
export function tweenDomain(from: readonly [number, number], to: readonly [number, number], e: number): [number, number] {
  if (e >= 1) return [to[0], to[1]]
  return [from[0] + (to[0] - from[0]) * e, from[1] + (to[1] - from[1]) * e]
}

/** Net worth domain over the given futures: always includes 0. */
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

/** Year indices (0-based) with a margin-call forced sale. */
export function forcedSaleYears(f: StormFuture): number[] {
  const out: number[] = []
  f.years.forEach((y, i) => {
    if (y.evelo.forcedSaleSold > 0) out.push(i)
  })
  return out
}

/** Forced-sale markers: x at the middle of the year the sale happened (x domain position k = year
 *  end, so year y spans y..y + 1 and its middle is y + 0.5) and the age the caption names for it
 *  (the age lived during that year), so the dot sits between that age's tick and the next. */
export function forcedSaleMarks(f: StormFuture): { k: number; age: number }[] {
  return forcedSaleYears(f).map((y) => ({ k: y + 0.5, age: f.years[y].eveloAge }))
}

/** (Shared with sameStorm.ts's captions.) The age (during the year) from which a value is at $0 to the end, or null when it ends above. */
export function runOutAt(ys: readonly StormYear[], v: (y: StormYear) => number, age: (y: StormYear) => number = (y) => y.age): number | null {
  if (!ys.length || v(ys[ys.length - 1]) > 1) return null
  let i = ys.length - 1
  while (i > 0 && v(ys[i - 1]) <= 1) i--
  return age(ys[i])
}

/** Where eVelo runs out (its net worth at $0 from there to the end): the year-end position k where
 *  it first reaches 0 and the age the caption names (lived during that year), or null. */
export function eveloRunOut(f: StormFuture): { k: number; age: number } | null {
  const age = runOutAt(f.years, (y) => y.evelo.netWorth, (y) => y.eveloAge)
  if (age === null) return null
  const y = f.years.findIndex((r) => r.eveloAge === age)
  return { k: y + 1, age }
}

/** Loan-to-value tick values: 0, the margin call, then every 20% above it (at least 10 points clear
 *  of it) up to the domain's top, 100% at most. */
export function ltvTicks(callLtv: number, top: number): number[] {
  const out = [0, callLtv]
  for (let p = 20; p <= Math.min(100, Math.round(top * 100)); p += 20) if (p / 100 > callLtv + 0.1 + 1e-9) out.push(p / 100)
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
  // The peak before eVelo runs out (after that the loan is the whole portfolio), as the chart's line stops there.
  const out = eveloRunOut(f)
  const lived = out ? f.years.slice(0, out.k - 1) : f.years
  const peak = lived.length ? Math.max(...lived.map((y) => y.evelo.ltv)) : 0
  const sales = forcedSaleYears(f)
  const sold = sales.reduce((s, i) => s + f.years[i].evelo.forcedSaleSold, 0)
  const salesText =
    sales.length === 0
      ? 'no forced sale'
      : `forced sales of ${currencyCompact(sold)} in ${sales.length === 1 ? 'one year' : `${sales.length} years`} (${sales.length === 1 ? 'age' : 'ages'} ${sales.map((i) => f.years[i].eveloAge).join(', ')})`
  return (
    `Both plans’ net worth through the ${f.label.toLowerCase()} future, today’s dollars. ` +
    `At ${end}: living on income ${currencyCompact(last.income.portfolio)}, eVelo ${currencyCompact(last.evelo.netWorth)} after its loan. ` +
    `eVelo’s loan-to-value peaks at ${percent(peak)} against a ${percent(f.callLtv)} margin call${out ? `, then eVelo runs out at ${out.age}` : ''}; ${salesText}.`
  )
}
