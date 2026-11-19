// Pure geometry for the comparison chart (CompareChart.tsx): real net worth by age for both ways,
// each a median line over its middle-half (p25–p75) band, on one scale. eVelo's series is its
// netWorth bands (portfolio less loan); the mode's is its portfolio value bands (it has no loan).
// No DOM, no React.

import { scaleLinear } from 'd3-scale'
import { area, curveMonotoneX, line } from 'd3-shape'
import type { Bands } from '../../engine/types'
import { currencyCompact } from '../format'

export interface CompareSeries {
  key: 'income' | 'evelo'
  label: string
  /** Age at index 0 (today). */
  age: number
  bands: Pick<Bands, 'p25' | 'p50' | 'p75'>
}

export interface CompareRow {
  age: number
  income: [number, number, number] | null
  evelo: [number, number, number] | null
}

const fin = (v: number) => (Number.isFinite(v) ? v : 0)

/** The age span both series cover together. */
export function ageDomain(series: readonly CompareSeries[]): [number, number] {
  let lo = Infinity, hi = -Infinity
  for (const s of series) {
    lo = Math.min(lo, s.age)
    hi = Math.max(hi, s.age + s.bands.p50.length - 1)
  }
  return Number.isFinite(lo) ? [lo, Math.max(hi, lo + 1)] : [0, 1]
}

/** A nice y max over both series' upper quartiles (and medians), never 0. */
export function yMaxOf(series: readonly CompareSeries[]): number {
  let m = 0
  for (const s of series) for (let i = 0; i < s.bands.p50.length; i++) m = Math.max(m, fin(s.bands.p75[i]), fin(s.bands.p50[i]))
  return scaleLinear().domain([0, m > 0 ? m : 1]).nice(4).domain()[1]
}

export interface ChartGeom {
  x: (age: number) => number
  /** The ages at the two ends. */
  ages: [number, number]
  y: (v: number) => number
  yTicks: number[]
  paths: { key: CompareSeries['key']; band: string; median: string; end: [number, number] }[]
}

export function chartGeom(series: readonly CompareSeries[], box: { l: number; r: number; t: number; b: number }): ChartGeom {
  const [a0, a1] = ageDomain(series)
  const x = scaleLinear().domain([a0, a1]).range([box.l, box.r])
  const y = scaleLinear().domain([0, yMaxOf(series)]).range([box.b, box.t])
  const paths = series.map((s) => {
    const idx = s.bands.p50.map((_, i) => i)
    const band = area<number>()
      .curve(curveMonotoneX)
      .x((i) => x(s.age + i))
      .y0((i) => y(Math.max(0, fin(s.bands.p25[i]))))
      .y1((i) => y(Math.max(0, fin(s.bands.p75[i]))))(idx) ?? ''
    const median = line<number>()
      .curve(curveMonotoneX)
      .x((i) => x(s.age + i))
      .y((i) => y(Math.max(0, fin(s.bands.p50[i]))))(idx) ?? ''
    const n = idx.length - 1
    return { key: s.key, band, median, end: [x(s.age + n), y(Math.max(0, fin(s.bands.p50[n])))] as [number, number] }
  })
  return { x, ages: [a0, a1], y, yTicks: y.ticks(4).filter((v) => v > 0), paths }
}

/** One row per age either series covers: [p25, median, p75], or null outside a series' years. */
export function compareRows(series: readonly CompareSeries[]): CompareRow[] {
  const [a0, a1] = ageDomain(series)
  const rows: CompareRow[] = []
  const at = (s: CompareSeries | undefined, age: number): [number, number, number] | null => {
    if (!s) return null
    const i = age - s.age
    return i >= 0 && i < s.bands.p50.length ? [s.bands.p25[i], s.bands.p50[i], s.bands.p75[i]] : null
  }
  const inc = series.find((s) => s.key === 'income')
  const ev = series.find((s) => s.key === 'evelo')
  for (let a = a0; a <= a1; a++) rows.push({ age: a, income: at(inc, a), evelo: at(ev, a) })
  return rows
}

/** The chart in one sentence, for its aria-label. */
export function compareSummary(series: readonly CompareSeries[]): string {
  const parts = series.map((s) => {
    const n = s.bands.p50.length - 1
    return `${s.label}'s median goes from ${currencyCompact(s.bands.p50[0])} at age ${s.age} to ${currencyCompact(s.bands.p50[n])} at age ${s.age + n}`
  })
  return `Real net worth, today's dollars: ${parts.join('; ')}. The table below lists every year.`
}

export interface ReadoutSeries {
  key: CompareSeries['key']
  label: string
  /** Median and middle half, compact money. */
  median: string
  middle: string
  /** The raw [p25, p50, p75]. */
  values: [number, number, number]
}

export interface CompareReadout {
  age: number
  /** "today" at the first age, else "year n". */
  note: string
  /** The series with a value at this age, in the chart's order. */
  rows: ReadoutSeries[]
  /** The gap between the medians, when both have one. */
  gap: { ahead: CompareSeries['key'] | null; text: string; value: string } | null
}

/** The crosshair readout's figures at chart index `index` (years from the chart's first age). */
export function compareReadout(series: readonly CompareSeries[], index: number): CompareReadout {
  const age = ageDomain(series)[0] + index
  const rows: ReadoutSeries[] = []
  for (const s of series) {
    const i = age - s.age
    if (i < 0 || i >= s.bands.p50.length) continue
    const v: [number, number, number] = [s.bands.p25[i], s.bands.p50[i], s.bands.p75[i]]
    rows.push({ key: s.key, label: s.label, median: currencyCompact(v[1]), middle: `${currencyCompact(v[0])}–${currencyCompact(v[2])}`, values: v })
  }
  const inc = rows.find((r) => r.key === 'income')
  const ev = rows.find((r) => r.key === 'evelo')
  let gap: CompareReadout['gap'] = null
  if (inc && ev) {
    const d = ev.values[1] - inc.values[1]
    const lead = d > 0 ? ev : d < 0 ? inc : null
    gap = lead
      ? { ahead: lead.key, text: `${lead.label} ahead by`, value: currencyCompact(Math.abs(d)) }
      : { ahead: null, text: 'Gap between medians', value: currencyCompact(0) }
  }
  return { age, note: index === 0 ? 'today' : `year ${index}`, rows, gap }
}
