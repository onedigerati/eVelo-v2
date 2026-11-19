// Pure geometry for the layered income chart (IncomeChart.tsx): per-year stacks in dollars, the y
// max, the "Just added" line and the text summary. No DOM, no React.
//
// Layers, one per answered question (the engine's per-year medians):
//   1 dividends · 2 muni coupons + taxable interest (taxable + Treasury) · 3 tax ·
//   4 Social Security, the spending line and the gap sold to cover · 5 everything (results).
//
// A bar, bottom to top: dividends, muni coupons, taxable interest, Social Security (the gross
// income), cut back to after-tax income; then the gap sold to cover; then the tax, hatched, on
// top. So everything under the hatch is what the year pays out. Each income segment is clipped
// from the top, so the tax is carved off the top of the income, never added on.
//
// Every layer is its own median across the futures, as the engine reports it. "Sold to cover" is
// the engine's median gapSold, the same number the ledger and the summary use, so it sits on top of
// after-tax income up toward the dashed spending line. Medians of parts don't add up to the median
// of the whole, so its top can land a little off the line; that small mismatch is accepted rather
// than inventing a number (docs/PLAN.md, 2026-11-18).

import { scaleLinear } from 'd3-scale'
import type { IncomeYearRow } from '../../engine/incomeTypes'
import { currency } from '../format'

export type IncomeLayers = 0 | 1 | 2 | 3 | 4 | 5

/** [bottom, top] in dollars; bottom === top when the segment isn't drawn. */
export type Span = [number, number]

export interface IncomeStack {
  age: number
  dividends: Span
  muni: Span
  taxable: Span
  social: Span
  gap: Span
  tax: Span
  /** Gross income drawn (the layers shown). */
  gross: number
  /** Gross less tax. */
  afterTax: number
  /** Top of the bar: after-tax income + gap + tax. */
  top: number
}

const pos = (v: number) => (Number.isFinite(v) && v > 0 ? v : 0)

/** Taxable bond income the chart shows as one segment: taxable funds plus Treasuries. */
export const taxableOf = (r: IncomeYearRow) => pos(r.taxableInterest) + pos(r.treasuryInterest)

/** The note that goes with the chart wherever the layers are read together. */
export const MEDIAN_NOTE = 'Each layer is its own median across the futures, so together they can land a little off the spending line.'

export function stackRow(r: IncomeYearRow, layers: IncomeLayers): IncomeStack {
  const parts = [
    layers >= 1 ? pos(r.dividends) : 0,
    layers >= 2 ? pos(r.muniInterest) : 0,
    layers >= 2 ? taxableOf(r) : 0,
    layers >= 4 ? pos(r.otherIncome) : 0,
  ]
  const gross = parts[0] + parts[1] + parts[2] + parts[3]
  const tax = layers >= 3 ? Math.min(pos(r.tax), gross) : 0
  const afterTax = gross - tax
  const spans: Span[] = []
  let cum = 0
  for (const p of parts) {
    spans.push([Math.min(cum, afterTax), Math.min(cum + p, afterTax)])
    cum += p
  }
  const gap = layers >= 4 ? pos(r.gapSold) : 0
  const top = afterTax + gap + tax
  return {
    age: r.age,
    dividends: spans[0],
    muni: spans[1],
    taxable: spans[2],
    social: spans[3],
    gap: [afterTax, afterTax + gap],
    tax: [afterTax + gap, top],
    gross,
    afterTax,
    top,
  }
}

export const stackRows = (rows: IncomeYearRow[], layers: IncomeLayers) => rows.map((r) => stackRow(r, layers))

/** Nice y max over the whole series with every layer and the spending line, whatever is drawn now:
 *  the scale never moves as layers are added. Positive even for an empty or all-zero series. */
export function yMaxFor(rows: IncomeYearRow[], spending: number): number {
  let m = pos(spending)
  for (const r of rows) m = Math.max(m, stackRow(r, 5).top)
  if (!(m > 0)) return 1000
  return scaleLinear().domain([0, m]).nice(5).domain()[1]
}

/** Bar positions by age across [x0, x0 + w], `pad` of each step left between bars (a band scale,
 *  by hand: d3-scale's scaleBand would pull its module into the main chunk). */
export function bandX(rows: IncomeYearRow[], x0: number, w: number, pad: number) {
  const n = rows.length
  const step = n > 0 ? w / (n - (n > 1 ? pad : 0)) : w
  const bw = n > 1 ? step * (1 - pad) : step
  const at = new Map(rows.map((r, i) => [r.age, x0 + i * step]))
  const x = (age: number) => at.get(age)
  x.bandwidth = () => bw
  x.step = () => step
  return x
}

/** The bar nearest plot-x `px` (its band with padding around its centre), clamped to 0..n-1; the
 *  crosshair's indexAt. `x0`, `step`, `bw` as bandX lays them out. */
export function bandIndexAt(px: number, n: number, x0: number, step: number, bw: number): number {
  if (n <= 0 || !(step > 0) || !Number.isFinite(px)) return 0
  const i = Math.round((px - x0 - bw / 2) / step)
  return Math.max(0, Math.min(n - 1, i))
}

export type ReadoutKey = 'dividends' | 'muni' | 'taxable' | 'social' | 'tax' | 'spending' | 'gap' | 'reinvested'

export interface ReadoutLine {
  key: ReadoutKey
  label: string
  /** Today's dollars, the row's median figure (the year-by-year ledger's number). */
  value: number
}

/** The chart readout's rows for one year, for the layers shown: the income lines unlocked so far,
 *  tax (layer 3), then from layer 4 spending and how it was met: the shares sold to cover it, or
 *  the surplus reinvested. Each figure is the engine's own median for the year (as the ledger), not
 *  a difference of medians, so the rows never contradict the ledger. */
export function readoutRows(r: IncomeYearRow, layers: IncomeLayers, hasSocial: boolean): ReadoutLine[] {
  const out: ReadoutLine[] = []
  if (layers >= 1) out.push({ key: 'dividends', label: 'Dividends', value: pos(r.dividends) })
  if (layers >= 2)
    out.push({ key: 'muni', label: 'Muni coupons', value: pos(r.muniInterest) }, { key: 'taxable', label: 'Taxable interest', value: taxableOf(r) })
  if (layers >= 4 && (hasSocial || pos(r.otherIncome) > 0)) out.push({ key: 'social', label: 'Social Security', value: pos(r.otherIncome) })
  if (layers >= 3) out.push({ key: 'tax', label: 'Tax', value: pos(r.tax) })
  if (layers >= 4) {
    out.push({ key: 'spending', label: 'Spending', value: pos(r.spending) })
    if (pos(r.gapSold) > 0) out.push({ key: 'gap', label: 'Sold to cover', value: pos(r.gapSold) })
    else if (pos(r.reinvested) > 0) out.push({ key: 'reinvested', label: 'Reinvested', value: pos(r.reinvested) })
  }
  return out
}

/** Age ticks: the first age, then each multiple of `step` years after it, through the last. */
export function ageTicks(rows: IncomeYearRow[], step: number): number[] {
  if (rows.length === 0) return []
  const a0 = rows[0].age
  const a1 = rows[rows.length - 1].age
  const out: number[] = []
  for (let a = a0; a <= a1; a += step) out.push(a)
  return out
}

const r100 = (v: number) => currency(Math.round(pos(v) / 100) * 100)

/** First year Social Security is paid, or null. */
function socialStart(rows: IncomeYearRow[]): IncomeYearRow | null {
  return rows.find((r) => pos(r.otherIncome) > 0) ?? null
}

/** What a layer adds, in year one's medians rounded to $100: "Just added: muni coupons, $24,200 a
 *  year, tax-free · taxable interest, $8,600". Empty for layer 0, 5 or an empty series. */
export function justAddedLine(rows: IncomeYearRow[], layer: number): string {
  const r = rows[0]
  if (!r) return ''
  const pre = 'Just added: '
  switch (layer) {
    case 1:
      return `${pre}dividends, ${r100(r.dividends)} a year`
    case 2:
      return `${pre}muni coupons, ${r100(r.muniInterest)} a year, tax-free · taxable interest, ${r100(taxableOf(r))}`
    case 3:
      return `${pre}tax, ${r100(r.tax)} a year`
    case 4: {
      const ss = socialStart(rows)
      const parts = [`spending, ${r100(r.spending)} a year`, `sold to cover, ${r100(r.gapSold)}`]
      if (ss) parts.push(`Social Security, ${r100(ss.otherIncome)}${ss === r ? '' : ` from age ${ss.age}`}`)
      return pre + parts.join(' · ')
    }
    default:
      return ''
  }
}

/** One year in words, for the layers shown. */
function yearWords(r: IncomeYearRow, layers: IncomeLayers, spending: number): string {
  const s = stackRow(r, layers)
  const w: string[] = []
  if (layers >= 1) w.push(`dividends ${r100(r.dividends)}`)
  if (layers >= 2) w.push(`muni coupons ${r100(r.muniInterest)}`, `taxable interest ${r100(taxableOf(r))}`)
  if (layers >= 4 && pos(r.otherIncome) > 0) w.push(`Social Security ${r100(r.otherIncome)}`)
  if (layers >= 3) w.push(`tax ${r100(s.tax[1] - s.tax[0])}`, `after tax ${r100(s.afterTax)}`)
  if (layers >= 4) w.push(`spending ${r100(spending)}`, `sold to cover ${r100(r.gapSold)}`)
  return w.join(', ')
}

/** The chart's aria-label: what it is, then year one and the final year. */
export function chartSummary(rows: IncomeYearRow[], layers: IncomeLayers, spending: number): string {
  if (rows.length === 0) return 'Income each year, median future: no years to show.'
  const a = rows[0]
  const z = rows[rows.length - 1]
  const head = `Income each year, median future, in today's dollars, age ${a.age} to ${z.age}.`
  if (layers === 0) return `${head} Nothing answered yet.`
  const note = layers >= 4 ? ` ${MEDIAN_NOTE}` : ''
  return `${head} Year 1, age ${a.age}: ${yearWords(a, layers, spending)}. Final year, age ${z.age}: ${yearWords(z, layers, spending)}.${note}`
}
