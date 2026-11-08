import { scaleLinear } from 'd3-scale'
import { curveMonotoneX, line } from 'd3-shape'
import { useId, useMemo } from 'react'
import type { SimulationResult } from '../../engine/types'
import { percent } from '../format'
import { cx } from '../primitives'
import { massWindow, useCrosshair, useSize, useTweenedSeries } from './chartKit'
import { openingSaleOf } from './openingSale'

/** Why early forced sales happen, by how the plan starts. */
function earlyReason(r: SimulationResult, opening: boolean): string {
  if (opening) return 'while the loan is still near the call line after the opening sale'
  const startLtv = r.inputs.portfolio > 0 ? (r.inputs.existingLoan ?? 0) / r.inputs.portfolio : 0
  if (startLtv >= 0.5 * r.inputs.maxLtv) return 'while your existing balance still sits near the call line'
  return 'before the portfolio has grown past the loan'
}

/** One-sentence reading of when forced sales happen. The opening sale, if any, isn't one of them. */
export function marginCallCaption(r: SimulationResult): string {
  const byYear = r.marginCallByYear
  const total = r.marginCallCumulative[r.marginCallCumulative.length - 1] ?? 0
  const a = r.inputs.age
  const opening = openingSaleOf(r) !== null
  if (total < 0.005)
    return opening
      ? 'Beyond the opening sale, not one simulated future in two hundred forces another: the loan never climbs back to the call line.'
      : 'Not one simulated future in two hundred forces a sale: the loan never gets near the call line.'
  const t = marginCallTiming(r, byYear, total, a, opening)
  return t && opening ? `${t} The opening sale today isn’t counted.` : t
}

function marginCallTiming(r: SimulationResult, byYear: number[], total: number, a: number, opening: boolean): string {
  const n = byYear.length
  const firstHalf = byYear.slice(0, Math.ceil(n / 2)).reduce((x, y) => x + y, 0)
  // Shortest span holding 80% of first forced sales: if it covers under ~half the horizon,
  // the risk is concentrated there, which is the thing worth saying.
  const w80 = massWindow(byYear, 0.8)
  if (w80 && w80[1] - w80[0] + 1 <= Math.ceil(n / 2)) {
    const [s, e] = w80
    if (s <= 1)
      return `Risk is concentrated early: 80% of forced sales happen in ${e === 0 ? 'the first year' : `the first ${e + 1} years`} (ages ${a} to ${a + e + 1}), when a crash can hit ${earlyReason(r, opening)}.`
    return `Risk is concentrated: 80% of forced sales fall between ages ${a + s} and ${a + e + 1}${firstHalf < total * 0.35 ? ', as the loan compounds faster than the portfolio' : ''}. Outside that window forced sales are rare.`
  }
  const w = massWindow(byYear, 0.6)
  if (!w) return ''
  const [s, e] = w
  if (firstHalf < total * 0.35)
    return `Risk arrives late: most forced sales fall between ages ${a + s} and ${a + e + 1}, as the loan compounds faster than the portfolio.`
  return `Risk is spread out: most forced sales fall between ages ${a + s} and ${a + e + 1}; ${percent(total)} of futures face one by ${a + n}.`
}

export function MarginCallChart({ result }: { result: SimulationResult }) {
  const uid = useId().replace(/:/g, '')
  const [wrap, { width }] = useSize<HTMLDivElement>()
  const by = result.marginCallByYear
  const cum = result.marginCallCumulative
  const n = by.length
  const age0 = result.inputs.age
  const total = cum[n - 1] ?? 0

  const yMaxBar = useMemo(() => {
    const mx = Math.max(0.005, ...by)
    return scaleLinear().domain([0, mx]).nice(4).domain()[1]
  }, [by])
  const yMaxCum = Math.max(0.05, Math.ceil((total * 1.15) / 0.05) * 0.05)
  const target = useMemo(() => [by, cum, [yMaxBar, yMaxCum]], [by, cum, yMaxBar, yMaxCum])
  const tw = useTweenedSeries(target) ?? target
  const [bars, cline, [dBar, dCum]] = tw

  const win = useMemo(() => massWindow(by, 0.6), [by])

  const phone = width > 0 && width < 420
  const height = phone ? 220 : 250
  const m = { t: 22, r: 44, b: 28, l: 2 }
  const iw = Math.max(10, width - m.l - m.r)
  const ih = height - m.t - m.b
  const x = scaleLinear().domain([0, n]).range([m.l, m.l + iw])
  const yb = scaleLinear().domain([0, dBar]).range([m.t + ih, m.t])
  const yc = scaleLinear().domain([0, dCum]).range([m.t + ih, m.t])
  const bw = Math.max(1.5, (iw / n) * 0.62)
  const stepX = phone ? 10 : n > 20 ? 5 : 5

  const cumFull =
    line<number>()
      .x((_, i) => x(i))
      .y((v) => yc(v))
      .curve(curveMonotoneX)([0, ...cline]) ?? ''

  const ch = useCrosshair(n, (cx, rect) => Math.floor(((cx - rect.left - m.l) / iw) * n))
  const hi = ch.index
  const xs: number[] = []
  for (let a = Math.ceil(age0 / stepX) * stepX; a <= age0 + n; a += stepX) xs.push(a)

  const peak = by.reduce((b, v, i) => (v > by[b] ? i : b), 0)
  const aria = `Margin-call timing, age ${age0} to ${age0 + n}. ${percent(total)} of futures face a forced sale; the riskiest single year is age ${age0 + peak} at ${percent(by[peak] ?? 0, { digits: 1 })}.`

  return (
    <div className="mc">
      <div ref={wrap} style={{ height }}>
      {width > 0 && (
        <svg width={width} height={height} role="img" aria-label={aria} tabIndex={0} aria-describedby={`${uid}-read`} {...ch.handlers} className="mc__svg">
          {yb.ticks(3).map((v) => (
            <g key={v} transform={`translate(0, ${Math.round(yb(v)) + 0.5})`}>
              <line x1={m.l} x2={m.l + iw} stroke={v === 0 ? 'var(--chart-grid-strong)' : 'var(--chart-grid)'} />
              {v > 0 && (
                <text x={m.l} y={-5} className="chart-tick">
                  {percent(v, { digits: v < 0.01 ? 1 : 0 })}
                </text>
              )}
            </g>
          ))}
          {bars.map((v, i) => {
            const inWin = win ? i >= win[0] && i <= win[1] : false
            const h = Math.max(0, m.t + ih - yb(v))
            return (
              <rect
                key={i}
                x={x(i + 0.5) - bw / 2}
                y={m.t + ih - h}
                width={bw}
                height={h}
                rx={Math.min(2, bw / 2)}
                className={cx('mc__bar', inWin && 'is-core', hi === i && 'is-hot')}
              />
            )
          })}
          <path d={cumFull} className="mc__cum" />
          {cline.length > 0 && (
            <g transform={`translate(${x(n)}, ${yc(cline[n - 1])})`}>
              <circle r={3.5} className="mc__cum-dot" />
              <text x={7} y={4} className="mc__cum-label">
                {percent(cum[n - 1] ?? 0)}
              </text>
            </g>
          )}
          <g transform={`translate(0, ${m.t + ih})`}>
            {xs.map((a) => (
              <text key={a} x={x(a - age0)} y={19} textAnchor={a === age0 ? 'start' : 'middle'} className="chart-tick">
                {a}
              </text>
            ))}
          </g>
          {hi !== null && (
            <g transform={`translate(${x(hi + 0.5)}, 0)`} className="mc__cross">
              <line y1={m.t} y2={m.t + ih} />
              <circle cy={yc(cline[hi])} r={3.5} />
            </g>
          )}
        </svg>
      )}
      </div>
      <div id={`${uid}-read`} className={cx('mc__legend', hi !== null && 'is-reading')} aria-live="polite">
        {hi === null ? (
          <>
            <span>
              <i className="mc__key mc__key--bar" /> First forced sale, by year
            </span>
            <span>
              <i className="mc__key mc__key--cum" /> Cumulative
            </span>
          </>
        ) : (
          <>
            <span>
              Age <b>{age0 + hi}</b>
            </span>
            <span>
              <i className="mc__key mc__key--bar" /> <b>{percent(by[hi], { digits: 1 })}</b> first sale
            </span>
            <span>
              <i className="mc__key mc__key--cum" /> <b>{percent(cum[hi], { digits: 1 })}</b> by then
            </span>
          </>
        )}
      </div>
    </div>
  )
}
