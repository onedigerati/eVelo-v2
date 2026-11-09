import { scaleLinear } from 'd3-scale'
import { area, curveMonotoneX, line } from 'd3-shape'
import { useId, useMemo, useRef } from 'react'
import type { Bands, SimulationResult } from '../../engine/types'
import { currencyCompact, percent } from '../format'
import { cx } from '../primitives'
import { markerLabelWidth, markerRows, moneyTick, useCrosshair, useSize, useTweenedSeries, workingYears, workingYearsSentence } from './chartKit'

export type FanMetric = 'networth' | 'portfolio' | 'loan' | 'ltv'

export const FAN_METRICS: { value: FanMetric; label: string; short: string }[] = [
  { value: 'networth', label: 'Net worth', short: 'Net worth' },
  { value: 'portfolio', label: 'Portfolio', short: 'Portfolio' },
  { value: 'loan', label: 'Loan', short: 'Loan' },
  { value: 'ltv', label: 'Loan-to-value', short: 'LTV' },
]

export function bandsFor(r: SimulationResult, m: FanMetric): Bands {
  return m === 'networth' ? r.netWorth : m === 'portfolio' ? r.portfolioValue : m === 'loan' ? r.loan : r.ltv
}

const KEYS = ['p5', 'p25', 'p50', 'p75', 'p95'] as const
const isRatio = (m: FanMetric) => m === 'ltv'

export interface FanMarker {
  age: number
  label: string
  /** 'retire' draws the retirement line (dashed, in the holds colour). */
  kind?: 'retire'
  /** A shorter label for when `label` doesn't fit beside its line (phone widths). */
  short?: string
}

function targetDomain(b: Bands, m: FanMetric, maxLtv: number): { lo: number; hi: number; clipped: boolean; rawHi: number } {
  const max = (a: number[]) => a.reduce((x, y) => (y > x ? y : x), -Infinity)
  const min = (a: number[]) => a.reduce((x, y) => (y < x ? y : x), Infinity)
  const rawHi = max(b.p95)
  let lo: number
  let hi: number
  if (isRatio(m)) {
    lo = 0
    hi = Math.min(Math.max(rawHi, maxLtv * 1.25), maxLtv * 1.6)
  } else {
    lo = Math.min(0, min(b.p5))
    // Keep the median readable: the top 5% tail is allowed to run off the top.
    hi = Math.min(rawHi, Math.max(max(b.p75) * 1.45, max(b.p50) * 2))
  }
  if (!(hi > lo)) hi = lo + (isRatio(m) ? 1 : 1)
  const [nlo, nhi] = scaleLinear().domain([lo, hi]).nice(5).domain()
  return { lo: nlo, hi: nhi, clipped: rawHi > nhi * 1.001, rawHi }
}

export function FanChart({ result, metric, markers }: { result: SimulationResult; metric: FanMetric; markers: FanMarker[] }) {
  const uid = useId().replace(/:/g, '')
  const [wrap, { width }] = useSize<HTMLDivElement>()
  const { inputs } = result
  const age0 = inputs.age
  const bands = bandsFor(result, metric)
  const n = bands.p50.length
  const ratio = isRatio(metric)
  const fmt = ratio ? (v: number) => percent(v) : (v: number) => currencyCompact(v)

  const dom = useMemo(() => targetDomain(bands, metric, inputs.maxLtv), [bands, metric, inputs.maxLtv])
  const target = useMemo(() => [...KEYS.map((k) => bands[k]), [dom.lo, dom.hi]], [bands, dom])

  // Morph between results / same-unit metrics; across units ($ ↔ ratio), grow from the axis.
  const prevRatio = useRef(ratio)
  const tw = useTweenedSeries(target, {
    from: (t) => {
      const changed = prevRatio.current !== ratio
      prevRatio.current = ratio
      if (!changed) return null
      const lo = t[5][0]
      return [...t.slice(0, 5).map((s) => s.map(() => lo)), t[5]]
    },
  })
  const series = tw ?? target

  const phone = width > 0 && width < 560
  const height = phone ? 300 : Math.round(Math.min(440, Math.max(300, width * 0.4)))
  const m = { t: 30, r: phone ? 14 : 78, b: 30, l: 2 }
  const iw = Math.max(10, width - m.l - m.r)
  const ih = height - m.t - m.b

  const x = scaleLinear().domain([age0, age0 + n - 1]).range([m.l, m.l + iw])
  const y = scaleLinear().domain([series[5][0], series[5][1]]).range([m.t + ih, m.t])
  const ages = series[0].map((_, i) => age0 + (i * (n - 1)) / Math.max(1, series[0].length - 1))

  const bandPath = (lo: number[], hi: number[]) =>
    area<number>()
      .x((_, i) => x(ages[i]))
      .y0((_, i) => y(lo[i]))
      .y1((_, i) => y(hi[i]))
      .curve(curveMonotoneX)(lo) ?? ''
  const linePath = (s: number[]) =>
    line<number>()
      .x((_, i) => x(ages[i]))
      .y((v) => y(v))
      .curve(curveMonotoneX)(s) ?? ''

  const [p5, p25, p50, p75, p95] = series
  const yTicks = y.ticks(phone ? 4 : 5)
  const span = n - 1
  const step = phone ? (span > 20 ? 10 : 5) : span > 24 ? 5 : span > 12 ? 5 : 2
  const xTicks: number[] = []
  for (let a = Math.ceil(age0 / step) * step; a <= age0 + span; a += step) xTicks.push(a)

  const endX = x(age0 + span)
  const endY = y(p50[p50.length - 1])
  const endVal = bands.p50[n - 1]

  const ch = useCrosshair(n, (cx, rect) => Math.round(((cx - rect.left - m.l) / iw) * span))
  const hi = ch.index
  const hx = hi !== null ? x(age0 + hi) : 0

  const threshold = ratio ? inputs.maxLtv : null
  const thrY = threshold !== null ? y(threshold) : 0

  const work = workingYears(inputs)
  const workX = work ? x(work.to) : 0

  const summary = ratio
    ? `Loan-to-value fan chart, age ${age0} to ${age0 + span}. Median ${percent(bands.p50[Math.round(span / 2)])} at age ${age0 + Math.round(span / 2)} and ${percent(endVal)} at ${age0 + span}; worst 5% reach ${percent(bands.p95[n - 1])}. Margin call at ${percent(inputs.maxLtv)}.${workingYearsSentence(work)}`
    : `${FAN_METRICS.find((f) => f.value === metric)?.label} fan chart in today's dollars, age ${age0} to ${age0 + span}. Median ${currencyCompact(bands.p50[0])} today, ${currencyCompact(endVal)} at ${age0 + span}; middle half ${currencyCompact(bands.p25[n - 1])} to ${currencyCompact(bands.p75[n - 1])}; 90% range ${currencyCompact(bands.p5[n - 1])} to ${currencyCompact(bands.p95[n - 1])}.${workingYearsSentence(work)}`

  // Marker labels sit above the plot; one that would run into its neighbour (or into the top y tick,
  // whose label shares that row) drops to a second row just inside the plot.
  const sorted = markers
    .filter((mk) => mk.age > age0 && mk.age < age0 + span)
    .sort((a, b) => a.age - b.age)
    .map((mk) => {
      const mx = x(mk.age)
      // Right of the line, or left of it near the right edge; a label that fits neither way takes its
      // short form, and failing that is pulled inside the chart.
      const fit = (label: string) => {
        const w = markerLabelWidth(label)
        if (mx + 6 + w <= width && mx <= width - 120) return { label, flip: false, x0: mx + 6, x1: mx + 6 + w }
        if (mx - 6 - w >= 0) return { label, flip: true, x0: mx - 6 - w, x1: mx - 6 }
        return null
      }
      const short = mk.short ?? mk.label
      const f = fit(mk.label) ?? fit(short)
      if (f) return { ...mk, ...f, x: mx, tx: f.flip ? -6 : 6 }
      const w = markerLabelWidth(short)
      const x0 = Math.max(0, Math.min(mx + 6, width - w))
      return { ...mk, label: short, flip: false, x: mx, x0, x1: x0 + w, tx: x0 - mx }
    })
  const topTick = yTicks[yTicks.length - 1]
  const topTickW = topTick !== undefined && y(topTick) < m.t + 18 ? m.l + markerLabelWidth(ratio ? percent(topTick) : moneyTick(topTick)) : -Infinity
  const rows = markerRows(sorted, 10, topTickW)
  const placed = sorted.map((mk, i) => ({ ...mk, row: rows[i] }))

  // The working-years label sits inside the band, under the marker rows. Drawn over the markers with a
  // halo, so when the band is narrower than the label (a short wait, or a phone) it cuts the retire line.
  // The y tick labels share the band's left edge: take the first baseline whose text clears them all.
  const workLabelY = (() => {
    const boxes = yTicks.map((v) => [y(v) - 17, y(v) - 2])
    for (let b = m.t + 20; b < m.t + ih - 4; b += 2) if (!boxes.some(([t, u]) => b - 12 < u && b + 3 > t)) return b
    return m.t + 20
  })()
  // The clip note shares the top-right corner with second-row marker labels: step it down past them.
  const clipNote = `Luckiest 5% reach ${currencyCompact(dom.rawHi)} ↑`
  const clipX0 = m.l + iw - clipNote.length * 6.8
  const workLabelEnd = work ? m.l + 8 + work.label.length * 6.6 : -Infinity
  const workOver = work !== null && workLabelEnd > workX - 4
  let clipY = m.t + 14 + (placed.some((mk) => mk.row === 1 && mk.x1 > clipX0 - 8) ? 16 : 0)
  if (workLabelEnd > clipX0 - 8 && Math.abs(clipY - workLabelY) < 14) clipY = workLabelY + 16

  const readLeft = hi !== null && hx > m.l + iw * 0.58

  return (
    <div className="fan" ref={wrap} style={{ height }}>
      {width > 0 && (
        <svg
          className="fan__svg"
          width={width}
          height={height}
          role="img"
          aria-label={summary}
          tabIndex={0}
          aria-describedby={`${uid}-read`}
          {...ch.handlers}
        >
          <defs>
            <linearGradient id={`${uid}-outer`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" style={{ stopColor: 'var(--chart-line)', stopOpacity: 0.2 }} />
              <stop offset="1" style={{ stopColor: 'var(--chart-line)', stopOpacity: 0.05 }} />
            </linearGradient>
            <linearGradient id={`${uid}-inner`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" style={{ stopColor: 'var(--chart-line)', stopOpacity: 0.36 }} />
              <stop offset="1" style={{ stopColor: 'var(--chart-line)', stopOpacity: 0.14 }} />
            </linearGradient>
            <linearGradient id={`${uid}-danger`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" style={{ stopColor: 'var(--chart-threshold)', stopOpacity: 0.11 }} />
              <stop offset="1" style={{ stopColor: 'var(--chart-threshold)', stopOpacity: 0.02 }} />
            </linearGradient>
            <clipPath id={`${uid}-clip`}>
              <rect x={m.l} y={m.t - 1} width={iw + 12} height={ih + 2} />
            </clipPath>
            <filter id={`${uid}-glow`} x="-20%" y="-50%" width="140%" height="200%">
              <feGaussianBlur stdDeviation="4" />
            </filter>
          </defs>

          {/* grid lines; their labels are drawn later, over the bands and marker lines */}
          <g className="fan__grid">
            {yTicks.map((v) => (
              <line
                key={v}
                x1={m.l}
                x2={m.l + iw}
                y1={Math.round(y(v)) + 0.5}
                y2={Math.round(y(v)) + 0.5}
                stroke={v === 0 ? 'var(--chart-grid-strong)' : 'var(--chart-grid)'}
              />
            ))}
          </g>

          {work && (
            <rect className="fan__working" x={m.l} y={m.t} width={Math.max(0, workX - m.l)} height={ih} aria-hidden="true" />
          )}

          {threshold !== null && thrY > m.t && (
            <rect x={m.l} y={m.t} width={iw} height={Math.max(0, thrY - m.t)} fill={`url(#${uid}-danger)`} />
          )}

          <g clipPath={`url(#${uid}-clip)`}>
            <path d={bandPath(p5, p95)} fill={`url(#${uid}-outer)`} />
            <path d={bandPath(p25, p75)} fill={`url(#${uid}-inner)`} />
            <path d={linePath(p25)} className="fan__edge" />
            <path d={linePath(p75)} className="fan__edge" />
            <path d={linePath(p50)} className="fan__median-glow" filter={`url(#${uid}-glow)`} />
            <path d={linePath(p50)} className="fan__median" />
          </g>

          {threshold !== null && (
            <g className="fan__threshold" transform={`translate(0, ${Math.round(thrY) + 0.5})`}>
              <line x1={m.l} x2={m.l + iw} />
              <text x={m.l + iw} y={-7} textAnchor="end">
                Margin call at {percent(threshold)}
              </text>
            </g>
          )}

          {placed.map((mk) => (
            <g key={mk.label} className={cx('fan__marker', mk.kind === 'retire' && 'is-retire')} transform={`translate(${Math.round(mk.x) + 0.5}, 0)`}>
              <line y1={m.t - 4 + mk.row * 14} y2={m.t + ih} />
              <text y={m.t - 10 + mk.row * 14} x={mk.tx} textAnchor={mk.flip ? 'end' : 'start'}>
                {mk.label}
              </text>
            </g>
          ))}

          {/* y labels sit above their line, inside the plot. Drawn over the working band and the marker
              lines with a halo, so a retire line near the left edge (a short wait on a phone) passes behind them. */}
          <g className="fan__ticks" aria-hidden="true">
            {yTicks.map((v) => (
              <text key={v} x={m.l} y={Math.round(y(v)) + 0.5 - 6} className="chart-tick fan__tick">
                {ratio ? percent(v) : moneyTick(v)}
              </text>
            ))}
          </g>

          {/* x axis */}
          <g transform={`translate(0, ${m.t + ih})`}>
            <line x1={m.l} x2={m.l + iw} stroke="var(--chart-grid-strong)" />
            {xTicks.map((a) => (
              <text key={a} x={x(a)} y={20} textAnchor={a === age0 ? 'start' : 'middle'} className="chart-tick">
                {a}
              </text>
            ))}
          </g>

          {dom.clipped && !ratio && (
            <text x={m.l + iw} y={clipY} textAnchor="end" className="chart-tick fan__clip-note">
              {clipNote}
            </text>
          )}

          {work && (
            <text className={cx('fan__working-label', workOver && 'is-over')} x={m.l + 8} y={workLabelY} aria-hidden="true">
              {work.label}
            </text>
          )}

          {/* glowing endpoint + end label */}
          <g transform={`translate(${endX}, ${endY})`} className="fan__end">
            <circle r={11} className="fan__end-halo" />
            <circle r={4.5} className="fan__end-dot" />
            {phone ? (
              <text x={-10} y={-12} textAnchor="end" className="fan__end-label">
                {fmt(endVal)}
              </text>
            ) : (
              <>
                <text x={14} y={-2} className="fan__end-label">
                  {fmt(endVal)}
                </text>
                <text x={14} y={13} className="fan__end-sub">
                  median
                </text>
              </>
            )}
          </g>

          {hi !== null && (
            <g className="fan__cross" transform={`translate(${hx}, 0)`}>
              <line y1={m.t} y2={m.t + ih} />
              <circle cy={y(p25[Math.min(hi, p25.length - 1)])} r={3} className="fan__cross-ring" />
              <circle cy={y(p75[Math.min(hi, p75.length - 1)])} r={3} className="fan__cross-ring" />
              <circle cy={y(p50[Math.min(hi, p50.length - 1)])} r={5} className="fan__cross-dot" />
            </g>
          )}
        </svg>
      )}

      <div
        id={`${uid}-read`}
        className={cx('fan__readout', hi !== null && 'is-on', readLeft && 'is-left')}
        style={{ transform: readLeft ? `translate(calc(${hx - 14}px - 100%), ${m.t + 6}px)` : `translate(${hi !== null ? hx + 14 : 0}px, ${m.t + 6}px)` }}
        aria-live="polite"
      >
        {hi !== null && (
          <>
            <div className="fan__readout-age">
              Age <b>{age0 + hi}</b>
              <span>
                year {hi}
                {work && hi < work.years ? ' · working' : ''}
              </span>
            </div>
            <div className="fan__readout-row">
              <span className="fan__key fan__key--median" />
              Median <b>{fmt(bands.p50[hi])}</b>
            </div>
            <div className="fan__readout-row">
              <span className="fan__key fan__key--inner" />
              Middle half{' '}
              <b>
                {fmt(bands.p25[hi])}–{fmt(bands.p75[hi])}
              </b>
            </div>
            <div className="fan__readout-row is-faint">
              <span className="fan__key fan__key--outer" />
              90% of futures{' '}
              <b>
                {fmt(bands.p5[hi])}–{fmt(bands.p95[hi])}
              </b>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
