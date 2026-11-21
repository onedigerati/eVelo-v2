// Same storm's chart (docs/PLAN.md stage 4): for the chosen future, both plans' net worth by age on
// top (living on income's portfolio, eVelo's net worth after its loan) and eVelo's loan-to-value
// below against its dashed margin-call line, a dot on each year with a forced sale. Scales are
// shared by every future, so a switch tweens the lines (~600 ms ease-out on requestAnimationFrame)
// and, under reduced motion, jumps. The wrapper carries the text alternative (role="img").

import { useEffect, useMemo, useRef, useState } from 'react'
import { scaleLinear } from 'd3-scale'
import { line } from 'd3-shape'
import { useReducedMotion } from 'framer-motion'
import { percent } from '../format'
import { moneyTick, useSize } from '../outlook/chartKit'
import type { StormFuture } from './sameStorm'
import { easeOut, forcedSaleYears, ltvDomain, stormAgeTicks, stormChartLabel, stormPoints, tweenPoints, worthDomain, type StormPoints, type StormStart } from './sameStormChart'
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
  const reduced = useReducedMotion() === true
  const [shown, setShown] = useState<StormPoints>(target)
  const shownRef = useRef<StormPoints>(target)

  useEffect(() => {
    if (reduced) {
      shownRef.current = target
      return
    }
    const from = shownRef.current
    if (from === target) return
    let raf = 0
    const t0 = performance.now()
    const step = (t: number) => {
      const u = Math.min(1, (t - t0) / STORM_ANIM_MS)
      const p = tweenPoints(from, target, easeOut(u))
      shownRef.current = p
      setShown(p)
      if (u < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [target, reduced])

  const [wrap, { width }] = useSize<HTMLDivElement>()
  if (!f || !target) return null
  const pts = reduced || shown.income.length !== target.income.length ? target : shown
  const n = f.years.length
  const a0 = f.years[0]?.age ?? 0

  const topH = phone ? 180 : Math.round(Math.min(240, Math.max(180, width * 0.26)))
  const ltvH = phone ? 72 : 84
  const m = { t: 22, r: 8, b: 24, l: phone ? 42 : 48, gap: 34 }
  const height = m.t + topH + m.gap + ltvH + m.b
  const x0 = m.l
  const x1 = Math.max(m.l + 10, width - m.r)
  const x = scaleLinear().domain([0, Math.max(1, n)]).range([x0, x1])

  const topB = m.t + topH
  const y = scaleLinear().domain(worthDomain(all)).nice(phone ? 3 : 4).range([topB, m.t])
  const yTicks = y.ticks(phone ? 3 : 4)
  const [lo] = y.domain()

  const l0 = topB + m.gap
  const l1 = l0 + ltvH
  const ld = ltvDomain(all, f.callLtv)
  const y2 = scaleLinear().domain(ld).range([l1, l0]).clamp(true)
  const callY = y2(f.callLtv)

  const path = (vals: number[]) =>
    line<number>()
      .x((_, k) => x(k))
      .y((v) => y(v))(vals) ?? ''
  const ltvPath =
    line<number>()
      .x((_, k) => x(k))
      .y((v) => y2(v))(pts.ltv) ?? ''
  const sales = forcedSaleYears(f)

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
          <line className="sschart__grid" x1={x0} x2={x1} y1={Math.round(l1) + 0.5} y2={Math.round(l1) + 0.5} />
          <text x={x0 - 6} y={l1 + 4} textAnchor="end" className="sschart__tick">
            0%
          </text>
          <text x={x0 - 6} y={callY + 4} textAnchor="end" className="sschart__tick">
            {percent(f.callLtv)}
          </text>
          <line className="sschart__call" x1={x0} x2={x1} y1={callY} y2={callY} />
          <text x={x1} y={callY - 5} textAnchor="end" className="sschart__call-label">
            margin call
          </text>
          <path className="sschart__line sschart__line--ltv" d={ltvPath} />
          {sales.map((i) => (
            <circle key={i} className="sschart__sale" cx={x(i + 1)} cy={callY} r={phone ? 5 : 4.5} />
          ))}

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
