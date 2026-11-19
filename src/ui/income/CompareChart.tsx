// The comparison's one chart: real net worth by age, eVelo (green, its netWorth: portfolio less
// loan) and living on income (brass, its portfolio value), each a median line over its middle-half
// band, on one scale. Geometry in compareChart.ts; the figures are also in a hidden table.
// Hover, tap/drag or the arrow keys pick an age: a guide line, a dot per median and a readout.

import { useId } from 'react'
import { currency } from '../format'
import { moneyTick, useCrosshair, useSize } from '../outlook/chartKit'
import { ChartReadout, useClearOnOutsideTap, ReadoutHead, ReadoutRow } from './ChartReadout'
import { chartGeom, compareReadout, compareRows, compareSummary, type CompareSeries } from './compareChart'

export interface CompareChartProps {
  series: CompareSeries[]
  phone: boolean
}

const range = (v: [number, number, number] | null) => (v ? `${currency(v[1])} (${currency(v[0])} to ${currency(v[2])})` : '—')

export function CompareChart({ series, phone }: CompareChartProps) {
  const [wrap, { width }] = useSize<HTMLDivElement>()
  const height = phone ? 180 : Math.round(Math.min(300, Math.max(220, width * 0.22)))
  const m = { t: 12, r: phone ? 4 : 52, b: 26, l: 4 }
  const g = chartGeom(series, { l: m.l, r: Math.max(m.l + 10, width - m.r), t: m.t, b: height - m.b })
  const [a0, a1] = g.ages
  const xTicks = phone ? [a0, a1] : ticksBetween(a0, a1)
  const rows = compareRows(series)
  const labelOf = (k: CompareSeries['key']) => series.find((s) => s.key === k)?.label ?? k
  const uid = useId().replace(/:/g, '')

  const x0 = m.l, x1 = Math.max(m.l + 10, width - m.r)
  const ch = useCrosshair(a1 - a0 + 1, (cx, rect) => Math.round(((cx - rect.left - x0) / (x1 - x0)) * (a1 - a0)))
  const hi = ch.index
  useClearOnOutsideTap(wrap, hi !== null, ch.clear)
  const hx = hi !== null ? g.x(a0 + hi) : 0
  const read = hi !== null ? compareReadout(series, hi) : null

  return (
    <figure className="cchart" data-testid="compare-chart">
      <div className="cchart__head">
        <span className="cchart__title">Net worth, today’s dollars · line is the median, band the middle half of futures</span>
        <ul className="cchart__legend" aria-hidden="true">
          {series.map((s) => (
            <li key={s.key}>
              <span className={`cchart__key cchart__key--${s.key}`} />
              {s.label}
            </li>
          ))}
        </ul>
      </div>
      <div className="cchart__plot" ref={wrap} style={{ height }}>
        {width > 0 && (
          <svg
            className="cchart__svg"
            width={width}
            height={height}
            role="img"
            aria-label={compareSummary(series)}
            tabIndex={0}
            aria-describedby={`${uid}-read`}
            {...ch.handlers}
          >
            <g className="cchart__grid" aria-hidden="true">
              {g.yTicks.map((v) => (
                <line key={v} x1={m.l} x2={width - m.r} y1={Math.round(g.y(v)) + 0.5} y2={Math.round(g.y(v)) + 0.5} />
              ))}
            </g>
            {g.paths.map((p) => (
              <g key={p.key} className={`cchart__series cchart__series--${p.key}`} aria-hidden="true">
                <path className="cchart__band" d={p.band} />
                <path className="cchart__median" d={p.median} />
                <circle className="cchart__dot" cx={p.end[0]} cy={p.end[1]} r={3.5} />
              </g>
            ))}
            {!phone && (
              <g aria-hidden="true">
                {g.yTicks.map((v) => (
                  <text key={v} x={width} y={Math.round(g.y(v)) + 4} textAnchor="end" className="cchart__tick">
                    {moneyTick(v)}
                  </text>
                ))}
              </g>
            )}
            <g transform={`translate(0, ${height - m.b})`} aria-hidden="true">
              <line x1={m.l} x2={width - m.r} className="cchart__axis" />
              {xTicks.map((a, i) => (
                <text key={a} x={g.x(a)} y={18} textAnchor={i === 0 ? 'start' : a === a1 ? 'end' : 'middle'} className="cchart__tick">
                  {i === 0 || phone ? `age ${a}` : a}
                </text>
              ))}
            </g>
            {read && (
              <g className="cchart__cross" aria-hidden="true">
                <line x1={hx} x2={hx} y1={m.t} y2={height - m.b} />
                {read.rows.map((r) => (
                  <g key={r.key} className={`cchart__series cchart__series--${r.key}`}>
                    <circle cx={hx} cy={g.y(Math.max(0, r.values[0]))} r={2.5} className="cchart__cross-ring" />
                    <circle cx={hx} cy={g.y(Math.max(0, r.values[2]))} r={2.5} className="cchart__cross-ring" />
                    <circle cx={hx} cy={g.y(Math.max(0, r.values[1]))} r={4.5} className="cchart__cross-dot" />
                  </g>
                ))}
              </g>
            )}
          </svg>
        )}
        <ChartReadout id={`${uid}-read`} x={hx} width={width} top={m.t + 6} on={read !== null}>
          {read && (
            <>
              <ReadoutHead age={read.age} note={read.note} />
              {read.rows.map((r) => (
                <div key={r.key}>
                  <ReadoutRow keyClass={`cchart__swatch cchart__swatch--${r.key}`} label={r.label} value={r.median} />
                  {/* a phone plot is 180px tall: medians and the gap only, so the readout fits */}
                  {!phone && <ReadoutRow faint label="middle half" value={r.middle} />}
                </div>
              ))}
              {series
                .filter((s) => !read.rows.some((r) => r.key === s.key))
                .map((s) => (
                  <ReadoutRow key={s.key} faint label={s.label} value="—" />
                ))}
              {read.gap && <ReadoutRow total label={read.gap.text} value={read.gap.value} />}
            </>
          )}
        </ChartReadout>
      </div>
      <div className="sr-only">
        <table>
          <caption>Real net worth by age, today’s dollars: the median, with the middle half of futures in brackets.</caption>
          <thead>
            <tr>
              <th scope="col">Age</th>
              <th scope="col">{labelOf('income')}</th>
              <th scope="col">{labelOf('evelo')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.age}>
                <th scope="row">{r.age}</th>
                <td>{range(r.income)}</td>
                <td>{range(r.evelo)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  )
}

/** Age ticks every 5 or 10 years between the ends, the ends included. */
function ticksBetween(a0: number, a1: number): number[] {
  const step = a1 - a0 > 30 ? 10 : 5
  const out = [a0]
  for (let a = Math.ceil((a0 + 1) / step) * step; a < a1; a += step) if (a - a0 >= step / 2 && a1 - a >= step / 2) out.push(a)
  out.push(a1)
  return out
}
