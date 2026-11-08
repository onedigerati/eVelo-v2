import { useState, type ReactNode } from 'react'
import type { SimulationResult } from '../../engine/types'
import { useStore } from '../../state/store'
import { currencyCompact, percent } from '../format'
import { useBreakpoint } from '../hooks'
import { SegmentedControl } from '../primitives'
import { cityName, startNetWorth } from './cards'
import { ChartFrame } from './ChartFrame'
import { FAN_METRICS, FanChart, bandsFor, type FanMarker, type FanMetric } from './FanChart'
import { BROKEN_AT_START, openingBrokenOf, openingSaleOf } from './openingSale'

const EYEBROW: Record<FanMetric, string> = {
  networth: 'Net worth · today’s dollars',
  portfolio: 'Portfolio value · today’s dollars',
  loan: 'Loan balance · today’s dollars',
  ltv: 'Loan-to-value',
}

const TITLE: Record<FanMetric, ReactNode> = {
  networth: (
    <>
      The range of <em>futures</em>
    </>
  ),
  portfolio: (
    <>
      The portfolio, <em>untouched</em>
    </>
  ),
  loan: (
    <>
      The loan, <em>compounding</em>
    </>
  ),
  ltv: (
    <>
      How close to the <em>line</em>
    </>
  ),
}

/** The card's title: the portfolio isn't "untouched" when the plan opens with a forced sale or fails at once. */
export function fanTitle(r: SimulationResult | null, m: FanMetric): ReactNode {
  if (r && m === 'portfolio') {
    if (openingBrokenOf(r)) return 'The portfolio'
    if (openingSaleOf(r))
      return (
        <>
          The portfolio, after today’s <em>forced sale</em>
        </>
      )
  }
  return TITLE[m]
}

export function fanCaption(r: SimulationResult, m: FanMetric): string {
  // Broken from the start: every path is liquidated before month 0, so the bands are flat zeros.
  if (openingBrokenOf(r)) return BROKEN_AT_START
  const b = bandsFor(r, m)
  const n = b.p50.length - 1
  const a = r.inputs.age
  const end = a + n
  // Broken paths are recorded as zeros, so a median portfolio that starts above 0 and ends at 0
  // means the median plan was liquidated; say when, not "compounds to $0".
  const lost = medianLiquidatedAt(r)
  if (m === 'networth') {
    const low = b.p5[n]
    const tiny = startNetWorth(r) * 0.02
    // A liquidated median gives the same age as the portfolio and loan captions, not the horizon's end.
    if (lost !== null || b.p50[n] <= tiny)
      return `In the median future the loan consumes everything by ${lost !== null ? `about ${a + lost}` : end}: net worth falls from ${currencyCompact(b.p50[0])} to ${currencyCompact(b.p50[n])}${b.p95[n] > tiny ? `, and only the luckiest 5% end above ${currencyCompact(b.p95[n])}` : ''}.`
    if (b.p50[n] < b.p50[0])
      return `In the median future net worth shrinks from ${currencyCompact(b.p50[0])} to ${currencyCompact(b.p50[n])} by ${end}; the unluckiest 5% end ${low <= tiny ? 'with almost nothing' : `near ${currencyCompact(low)}`}.`
    return `In the median future net worth grows from ${currencyCompact(b.p50[0])} to ${currencyCompact(b.p50[n])} by ${end}; the unluckiest 5% end ${low <= tiny ? 'with almost nothing' : `near ${currencyCompact(low)}`}.`
  }
  const sale = openingSaleOf(r)
  if (m === 'portfolio') {
    if (lost !== null) {
      const by = `the lender liquidates the portfolio by about ${a + lost}`
      return sale
        ? `The plan opens with a forced sale of ${currencyCompact(sale.sold)} today, paying ${currencyCompact(sale.taxPaid)} in tax; in the median future ${by}.`
        : `In the median future ${by}.`
    }
    const grows = `the median portfolio compounds to ${currencyCompact(b.p50[n])} by ${end}, carrying the loan on top.`
    if (sale)
      return `The plan opens with a forced sale of ${currencyCompact(sale.sold)} today, paying ${currencyCompact(sale.taxPaid)} in tax; after that, nothing more is sold to fund your life, and ${grows}`
    return `Nothing is sold to fund your life: ${grows}`
  }
  if (m === 'loan') {
    const bal = r.inputs.existingLoan ?? 0
    const from = bal > 0 ? `from your existing ${currencyCompact(bal)} balance, ${sale ? `cut to ${currencyCompact(b.p50[0])} by the opening sale, ` : ''}` : ''
    // No "costliest 5%" once the median is liquidated: broken paths record a loan of 0, so the top
    // band then comes from the lucky paths that survive, not the costly ones.
    if (lost !== null) return `Borrowing compounds: ${from}the median plan is liquidated by about ${a + lost}.`
    return `Borrowing compounds: ${from}the median loan reaches ${currencyCompact(b.p50[n])} by ${end}, and ${currencyCompact(b.p95[n])} in the costliest 5% of futures.`
  }
  return ltvCaption(r, b.p50, b.p95, sale !== null)
}

/** Years from now until the median portfolio first reaches 0, when the median plan is liquidated
 *  (starts above 0, ends at 0); null when the median survives. */
export function medianLiquidatedAt(r: SimulationResult): number | null {
  const p = r.portfolioValue.p50
  const n = p.length - 1
  if (n < 1 || !(p[0] > 0) || p[n] > 0) return null
  const i = p.findIndex((v, k) => k > 0 && v <= 0)
  return i > 0 ? i : n
}

/** Where a loan-to-value sits against the call line. */
function relToLine(v: number, max: number): string {
  return v < max * 0.6 ? 'well under' : v < max ? 'close to' : 'above'
}

function ltvCaption(r: SimulationResult, p50: number[], p95: number[], opening: boolean): string {
  const a = r.inputs.age
  const n = p50.length - 1
  const max = r.inputs.maxLtv
  const line = `the ${percent(max)} call line`
  let peak = 0
  for (let i = 1; i <= n; i++) if (p50[i] > p50[peak]) peak = i
  const cross = p95.findIndex((v) => v >= max)
  const worst = cross === 0 ? 'the worst 5% start at or past it' : cross > 0 ? `the worst 5% touch it by ${a + cross}` : 'even the worst 5% never reach it'
  const p0 = p50[0]
  const peakAt = `peaks at ${percent(p50[peak])} around ${a + peak}, ${relToLine(p50[peak], max)} ${line}`
  // A peak at year 0 (above zero) means a starting balance the plan then pays down relative to growth,
  // but only if the median actually falls; a year-0 value it never leaves is flat, not a peak.
  const falls = p50.some((v, i) => i > 0 && v < p0)
  const startsAtPeak = peak === 0 && p0 > 0 && falls
  const flat = peak === 0 && p0 > 0 && !falls
  const at0 = `${percent(p0)} (${relToLine(p0, max)} ${line})`
  let head: string
  if (opening)
    head = startsAtPeak
      ? `A forced sale today brings loan-to-value to ${at0}, and the median falls from there`
      : flat
        ? `A forced sale today brings loan-to-value to ${at0}, and the median stays there`
        : `A forced sale today brings loan-to-value to ${percent(p0)}; the median then ${peakAt}`
  else if (startsAtPeak) head = `Median loan-to-value starts at its peak, ${at0}, and falls from there`
  else if (flat) head = `Median loan-to-value stays at ${at0}`
  else head = `Median loan-to-value ${peakAt}`
  return `${head}; ${worst}.`
}

export function fanMarkers(r: SimulationResult): FanMarker[] {
  const i = r.inputs
  const out: FanMarker[] = []
  if (i.destCityId && i.moveInYears > 0) out.push({ age: i.age + i.moveInYears, label: `Move to ${cityName(i.destCityId)}` })
  if (i.otherIncome > 0) out.push({ age: i.incomeStartAge, label: 'Income starts' })
  return out
}

export function FanCard() {
  const result = useStore((s) => s.result)
  const [metric, setMetric] = useState<FanMetric>('networth')
  const bp = useBreakpoint()
  const control = (
    <SegmentedControl
      size="sm"
      aria-label="Metric"
      options={FAN_METRICS.map((f) => ({ value: f.value, label: bp === 'phone' ? f.short : f.label }))}
      value={metric}
      onChange={setMetric}
      block={bp === 'phone'}
    />
  )
  return (
    <ChartFrame
      span="full"
      eyebrow={EYEBROW[metric]}
      title={fanTitle(result, metric)}
      subtitle={result ? fanCaption(result, metric) : 'Median path, with the middle half and 90% of outcomes shaded.'}
      aspect="16 / 6.5"
      className="fan-card"
    >
      {result && (
        <>
          <div className="fan-card__control">{control}</div>
          <FanChart result={result} metric={metric} markers={fanMarkers(result)} />
        </>
      )}
    </ChartFrame>
  )
}
