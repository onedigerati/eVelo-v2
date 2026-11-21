// Same storm's chart (docs/PLAN.md stage 4): for the chosen future, both plans' net worth by age on
// top (living on income's portfolio, eVelo's net worth after its loan) and eVelo's loan-to-value
// below against its dashed margin-call line, a dot mid-year on each forced sale. Each future has its
// own net-worth scale (loan-to-value is a fixed 0–100%); a switch tweens the lines and the scale
// together (~600 ms ease-out on requestAnimationFrame) and, under reduced motion, jumps. The wrapper carries the text alternative (role="img").

import { useEffect, useMemo, useRef, useState } from 'react'
import { scaleLinear } from 'd3-scale'
import { line } from 'd3-shape'
import { percent } from '../format'
import { moneyTick, useSize } from '../outlook/chartKit'
import { useReducedMotion } from './reducedMotion'
import type { StormFuture } from './sameStorm'
import { easeOut, eveloRunOut, forcedSaleMarks, futureDomain, ltvTicks, stormAgeTicks, stormChartLabel, stormPoints, tweenDomain, tweenPoints, type StormPoints, type StormStart } from './sameStormChart'
import './sameStormChart.css'

export const STORM_ANIM_MS = 600

export interface SameStormChartProps {
  futures: readonly StormFuture[]
  index: number
  start: Partial<StormStart> | null
  phone: boolean
}

export function SameStormChart({ futures, index, start, phone }: SameStormChartProps) {
  const f = futures[index]
  const all = useMemo(() => futures.map((x) => stormPoints(x, start)), [futures, start])
  const target = all[index]
  const tickCount = phone ? 3 : 4
  // Each future has its own net-worth scale; the domain tweens with the lines.
  const targetDom = useMemo(() => (target ? futureDomain(target, tickCount) : ([0, 1] as [number, number])), [target, tickCount])
  const reduced = useReducedMotion()
  type Frame = { p: StormPoints; d: [number, number] }
  const [shown, setShown] = useState<Frame>({ p: target, d: targetDom })
  const shownRef = useRef<Frame>({ p: target, d: targetDom })

  useEffect(() => {
    if (reduced) {
      shownRef.current = { p: target, d: targetDom }
      return
    }
    const from = shownRef.current
    if (from.p === target && from.d[0] === targetDom[0] && from.d[1] === targetDom[1]) return
    let raf = 0
    const t0 = performance.now()
    const step = (t: number) => {
      const e = easeOut(Math.min(1, (t - t0) / STORM_ANIM_MS))
      const fr = { p: tweenPoints(from.p, target, e), d: tweenDomain(from.d, targetDom, e) }
      shownRef.current = fr
      setShown(fr)
      if (e < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [target, targetDom, reduced])

  const [wrap, { width }] = useSize<HTMLDivElement>()
  if (!f || !target) return null
  const snap = reduced || shown.p.income.length !== target.income.length
  const pts = snap ? target : shown.p
  const dom = snap ? targetDom : shown.d
  const n = f.years.length
  const a0 = f.years[0]?.age ?? 0

  const topH = phone ? 180 : Math.round(Math.min(240, Math.max(180, width * 0.26)))
  const ltvH = phone ? 88 : 104
  const m = { t: 22, r: 8, b: 24, l: phone ? 42 : 48, gap: 34 }
  const height = m.t + topH + m.gap + ltvH + m.b
  const x0 = m.l
  const x1 = Math.max(m.l + 10, width - m.r)
  const x = scaleLinear().domain([0, Math.max(1, n)]).range([x0, x1])

  const topB = m.t + topH
  const y = scaleLinear().domain(dom).range([topB, m.t])
  const yTicks = y.ticks(tickCount)
  const [lo] = y.domain()

  const l0 = topB + m.gap
  const l1 = l0 + ltvH
  // Loan-to-value on a fixed 0–100% scale, ticked at 0, the margin call and every 20% above it.
  const ld: [number, number] = [0, 1]
  const y2 = scaleLinear().domain(ld).range([l1, l0]).clamp(true)
  const callY = y2(f.callLtv)

  const path = (vals: number[]) =>
    line<number>()
      .x((_, k) => x(k))
      .y((v) => y(v))(vals) ?? ''
  // Loan-to-value stops the year eVelo's net worth reaches $0: after that the loan is the portfolio
  // and a flat line at the top would read as a figure.
  const ltvPath =
    line<number>()
      .defined((_, k) => k === 0 || pts.evelo[k - 1] > 0)
      .x((_, k) => x(k))
      .y((v) => y2(v))(pts.ltv) ?? ''
  const sales = forcedSaleMarks(f)
  const out = eveloRunOut(f)
  const lTicks = ltvTicks(f.callLtv, ld[1])

  return (
    <div
      className={`sschart${phone ? ' sschart--phone' : ''}`}
      ref={wrap}
      style={{ height }}
      role="img"
      aria-label={stormChartLabel(f)}
      data-testid="storm-chart"
      data-future={f.keys[0]}
    >
      {width > 0 && n > 0 && (
        <svg className="sschart__svg" width={width} height={height} aria-hidden="true" focusable="false">
          <text x={x0} y={12} className="sschart__title">
            Net worth, today’s dollars
          </text>
          {yTicks.map((v) => (
            <g key={v}>
              <line className="sschart__grid" x1={x0} x2={x1} y1={Math.round(y(v)) + 0.5} y2={Math.round(y(v)) + 0.5} />
              <text x={x0 - 6} y={y(v) + 4} textAnchor="end" className="sschart__tick">
                {moneyTick(v)}
              </text>
            </g>
          ))}
          {lo < 0 && <line className="sschart__zero" x1={x0} x2={x1} y1={Math.round(y(0)) + 0.5} y2={Math.round(y(0)) + 0.5} />}
          <path className="sschart__line sschart__line--income" d={path(pts.income)} />
          <path className="sschart__line sschart__line--evelo" d={path(pts.evelo)} />

          <text x={x0} y={l0 - 10} className="sschart__title">
            eVelo loan-to-value
          </text>
          {lTicks.map((v) => (
            <g key={v}>
              {v !== f.callLtv && <line className="sschart__grid" x1={x0} x2={x1} y1={Math.round(y2(v)) + 0.5} y2={Math.round(y2(v)) + 0.5} />}
              <text x={x0 - 6} y={y2(v) + 4} textAnchor="end" className="sschart__tick">
                {percent(v)}
              </text>
            </g>
          ))}
          <line className="sschart__call" x1={x0} x2={x1} y1={callY} y2={callY} />
          <text x={x1} y={callY - 5} textAnchor="end" className="sschart__call-label">
            margin call
          </text>
          <path className="sschart__line sschart__line--ltv" d={ltvPath} />
          {sales.map((s) => (
            <circle key={s.k} className="sschart__sale" cx={x(s.k)} cy={callY} r={phone ? 5 : 4.5} data-age={s.age} />
          ))}
          {out && (
            <text
              x={x(out.k) + (x(out.k) > x1 - 120 ? -6 : 6)}
              y={y2(Math.min(ld[1], pts.ltv[out.k] ?? ld[1])) - 6}
              textAnchor={x(out.k) > x1 - 120 ? 'end' : 'start'}
              className="sschart__call-label"
              data-testid="storm-runout"
            >
              eVelo runs out at {out.age}
            </text>
          )}

          <g transform={`translate(0, ${l1})`}>
            {stormAgeTicks(a0, a0 + n, phone).map((a, i, ticks) => (
              <text key={a} x={x(a - a0)} y={18} textAnchor={i === 0 ? 'start' : i === ticks.length - 1 ? 'end' : 'middle'} className="sschart__tick">
                {i === 0 ? `age ${a}` : a}
              </text>
            ))}
          </g>
        </svg>
      )}
    </div>
  )
}
