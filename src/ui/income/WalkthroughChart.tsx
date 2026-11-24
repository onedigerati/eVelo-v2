// The walkthrough's overview net-worth chart: both plans' median real net worth at every year end,
// faint across the horizon and bold within the chapter, the chapter's span lit, a dashed marker at
// the year shown with each plan's value (docs/PLAN.md stage 2). It's the walkthrough's only year
// control, a slider to assistive tech: tap or click anywhere picks the year under it; on touch a
// mostly sideways drag scrubs the year while a vertical drag scrolls the page (chartScrub.ts); arrows
// step a year, PageUp/PageDown a few, Home/End jump to the ends. The section moves to that chapter.
//
// The x axis runs over year ends: position k is the end of row k − 1 (k = 0 the start of row 0), so
// row i spans k = i .. i + 1 and the domain is 0 .. years.length.
//
// Hover readout: a mouse over the plot previews the year under it (a crosshair at its year end and
// the mode's ChartReadout box, figures from walkthroughReadout.ts) without picking it; leaving hides
// it. Keyboard focus shows the readout for the picked year.

import { useId, useRef, useState, type FocusEvent, type KeyboardEvent, type MouseEvent, type PointerEvent } from 'react'
import { scaleLinear } from 'd3-scale'
import { line } from 'd3-shape'
import { currencyCompact } from '../format'
import { moneyTick, useSize } from '../outlook/chartKit'
import type { EveloYear, IncomeYear, WalkthroughChartProps, WalkYear } from './walkthrough'
import { ChartReadout, ReadoutHead, ReadoutRow } from './ChartReadout'
import { gestureOf, rowForKey, yearValueText, type Gesture } from './chartScrub'
import { rowAtX, walkReadout } from './walkthroughReadout'
import './walkthroughChart.css'

export { rowAtX, rowForKey }

type PlanKey = 'income' | 'evelo'
const PLANS: { key: PlanKey; label: string }[] = [
  { key: 'income', label: 'Living on income' },
  { key: 'evelo', label: 'eVelo' },
]

/** A plan's net worth at each year end k = 0..n, null where the plan isn't lived (a gap). */
export function netWorthPoints(years: readonly WalkYear[], key: PlanKey): (number | null)[] {
  const plan = (r: WalkYear | undefined): IncomeYear | EveloYear | null => (r ? r[key] : null)
  const out: (number | null)[] = []
  for (let k = 0; k <= years.length; k++) {
    const end = plan(years[k - 1])?.netWorth
    const start = plan(years[k])?.netWorthStart
    const v = end ?? start
    out.push(v !== undefined && Number.isFinite(v) ? v : null)
  }
  return out
}

/** Age ticks at year ends: the two ends and round ages (every 5 or 10) between them. */
function ageTicks(a0: number, a1: number, phone: boolean): number[] {
  const step = a1 - a0 > 30 || phone ? 10 : 5
  const out = [a0]
  for (let a = Math.ceil((a0 + 1) / step) * step; a < a1; a += step) if (a - a0 >= step / 2 && a1 - a >= step / 2) out.push(a)
  if (a1 > a0) out.push(a1)
  return out
}

export function WalkthroughChart({ years, chapters, chapter, year, onPickYear, phone }: WalkthroughChartProps) {
  const [wrap, { width }] = useSize<HTMLDivElement>()
  const [hover, setHover] = useState<number | null>(null)
  const [keyed, setKeyed] = useState(false)
  const uid = useId().replace(/:/g, '')
  // A touch pointer in progress: where it went down and its gesture so far.
  const touch = useRef<{ id: number; x: number; y: number; g: Gesture } | null>(null)
  const n = years.length
  const height = phone ? 200 : Math.round(Math.min(300, Math.max(210, width * 0.3)))
  const m = { t: 22, r: 8, b: 24, l: phone ? 42 : 48 }
  const x0 = m.l, x1 = Math.max(m.l + 10, width - m.r)
  const x = scaleLinear().domain([0, Math.max(1, n)]).range([x0, x1])

  const pts = { income: netWorthPoints(years, 'income'), evelo: netWorthPoints(years, 'evelo') }
  const all = [...pts.income, ...pts.evelo].filter((v): v is number => v !== null)
  const lo = Math.min(0, ...all), hi = Math.max(1, ...all)
  const y = scaleLinear().domain([lo, hi]).nice(phone ? 3 : 4).range([height - m.b, m.t])
  const yTicks = y.ticks(phone ? 3 : 4)

  const path = (vals: (number | null)[], from = 0, to = vals.length - 1) =>
    line<number>()
      .defined((k) => vals[k] !== null)
      .x((k) => x(k))
      .y((k) => y(vals[k] as number))(range(from, to)) ?? ''

  const c = chapters[chapter]
  const row = years[year]
  const a0 = years[0]?.age ?? 0
  const mx = x(year + 1)
  const flip = mx > x1 - (phone ? 90 : 110)
  const marks = PLANS.flatMap((p) => {
    const v = row?.[p.key]?.netWorth
    return v !== undefined && Number.isFinite(v) ? [{ ...p, v }] : []
  })
  // the higher value's label sits above its dot, the lower's below
  const top = marks.length === 2 ? (marks[0].v >= marks[1].v ? marks[0].key : marks[1].key) : marks[0]?.key

  // Each value label goes where neither line runs through it: its default side (right, or left near
  // the right edge), else the other side, else a little further from its dot.
  const fs = phone ? 13 : 12
  const lineAt = (vals: (number | null)[], px: number) => {
    const k = Math.max(0, Math.min(n, x.invert(px)))
    const i = Math.min(Math.floor(k), Math.max(0, n - 1))
    const va = vals[i], vb = vals[i + 1] ?? va
    return va === null || vb === null || va === undefined ? null : y(va + (vb - va) * (k - i))
  }
  const hits = (l: number, r: number, base: number) => {
    let h = 0
    for (let px = l; px <= r; px += 2)
      for (const pl of PLANS) {
        const ly = lineAt(pts[pl.key], px)
        if (ly !== null && ly >= base - fs * 0.85 - 2 && ly <= base + 3) h++
      }
    return h
  }
  const place = (key: PlanKey, v: number) => {
    const w = currencyCompact(v).length * fs * 0.62
    const up = key === top
    const sides: ('start' | 'end')[] = flip ? ['end', 'start'] : ['start', 'end']
    let best: { x: number; y: number; anchor: 'start' | 'end'; h: number } | null = null
    for (const extra of [0, 8, 16])
      for (const anchor of sides) {
        const lx = mx + (anchor === 'start' ? 8 : -8)
        const [l, r] = anchor === 'start' ? [lx, lx + w] : [lx - w, lx]
        if (l < x0 - 4 || r > x1 + 4) continue
        const base = y(v) + (up ? -8 - extra : (phone ? 18 : 16) + extra)
        if (base - fs < m.t - 14 || base > height - m.b) continue
        const h = hits(l, r, base)
        if (!best || h < best.h) best = { x: lx, y: base, anchor, h }
        if (h === 0) return best
      }
    return best ?? { x: mx + (flip ? -8 : 8), y: y(v) + (up ? -8 : phone ? 18 : 16), anchor: flip ? ('end' as const) : ('start' as const), h: 0 }
  }

  const pickAt = (el: SVGSVGElement, clientX: number) => {
    if (n <= 0) return
    const r = rowAtX(clientX - el.getBoundingClientRect().left, x0, x1, n)
    if (r !== year) onPickYear(r)
  }
  const pick = (e: MouseEvent<SVGSVGElement>) => pickAt(e.currentTarget, e.clientX)
  const key = (e: KeyboardEvent<SVGSVGElement>) => {
    const r = rowForKey(e.key, year, n)
    if (r === null) return
    e.preventDefault()
    setKeyed(true)
    if (r !== year) onPickYear(r)
  }
  // Hover previews (a mouse or pen, not touch); keyboard focus reads the picked year. On touch a tap
  // picks, a mostly sideways drag scrubs the picked year (the pointer captured), and a vertical drag is
  // left to the page (touch-action: pan-y; the browser then cancels the pointer).
  const down = (e: PointerEvent<SVGSVGElement>) => {
    if (e.pointerType !== 'touch' || !e.isPrimary) return
    touch.current = { id: e.pointerId, x: e.clientX, y: e.clientY, g: 'tap' }
  }
  const move = (e: PointerEvent<SVGSVGElement>) => {
    if (n <= 0) return
    if (e.pointerType !== 'touch') {
      const rect = e.currentTarget.getBoundingClientRect()
      setHover(rowAtX(e.clientX - rect.left, x0, x1, n))
      return
    }
    const t = touch.current
    if (!t || t.id !== e.pointerId) return
    const g = gestureOf(e.clientX - t.x, e.clientY - t.y, t.g)
    if (g === 'scrub' && t.g !== 'scrub') {
      try {
        e.currentTarget.setPointerCapture(e.pointerId)
      } catch {}
    }
    t.g = g
    if (g === 'scrub') pickAt(e.currentTarget, e.clientX)
  }
  const end = (e: PointerEvent<SVGSVGElement>, lifted: boolean) => {
    const t = touch.current
    if (!t || t.id !== e.pointerId) return
    if (lifted && t.g === 'tap') pickAt(e.currentTarget, e.clientX)
    touch.current = null
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {}
  }
  const focus = (e: FocusEvent<SVGSVGElement>) => {
    let visible = true
    try {
      visible = e.currentTarget.matches(':focus-visible')
    } catch {}
    setKeyed(visible)
  }
  const shown = hover ?? (keyed ? Math.min(year, n - 1) : null)
  const read = shown !== null ? walkReadout(years, shown) : null
  const hx = read ? x(read.index + 1) : 0

  return (
    <div className={`wtchart${phone ? ' wtchart--phone' : ''}`} ref={wrap} style={{ height }} data-testid="wt-chart">
      {width > 0 && n > 0 && (
        <svg
          className="wtchart__svg"
          width={width}
          height={height}
          role="slider"
          aria-label="Year in the walkthrough"
          aria-valuemin={0}
          aria-valuemax={n - 1}
          aria-valuenow={Math.min(year, n - 1)}
          aria-valuetext={row ? yearValueText(row.age, year, n) : undefined}
          aria-orientation="horizontal"
          tabIndex={0}
          data-testid="wt-chart-svg"
          onClick={pick}
          onKeyDown={key}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={(e) => end(e, true)}
          onPointerCancel={(e) => end(e, false)}
          onPointerLeave={() => setHover(null)}
          onFocus={focus}
          onBlur={() => setKeyed(false)}
        >
          <g aria-hidden="true">
            <text x={x0} y={12} className="wtchart__title">
              Net worth, today’s dollars
            </text>
            {yTicks.map((v) => (
              <g key={v}>
                <line className="wtchart__grid" x1={x0} x2={x1} y1={Math.round(y(v)) + 0.5} y2={Math.round(y(v)) + 0.5} />
                <text x={x0 - 6} y={y(v) + 4} textAnchor="end" className="wtchart__tick">
                  {moneyTick(v)}
                </text>
              </g>
            ))}
            {c && <rect className="wtchart__lit" x={x(c.from)} y={m.t} width={Math.max(1, x(c.to + 1) - x(c.from))} height={height - m.b - m.t} rx={4} />}
            {chapters.slice(1).map((ch) => (
              <line key={ch.key + ch.from} className="wtchart__divider" x1={x(ch.from)} x2={x(ch.from)} y1={m.t} y2={height - m.b} />
            ))}
            {PLANS.map((p) => (
              <g key={p.key} className={`wtchart__series wtchart__series--${p.key}`}>
                <path className="wtchart__faint" d={path(pts[p.key])} />
                {c && <path className="wtchart__bold" d={path(pts[p.key], c.from, c.to + 1)} />}
              </g>
            ))}
            {row && (
              <g className="wtchart__mark">
                <line x1={mx} x2={mx} y1={m.t} y2={height - m.b} />
                {marks.map((p) => {
                  // while the readout is on it carries the figures, so the labels go (no peeking past the box)
                  const at = read ? null : place(p.key, p.v)
                  return (
                  <g key={p.key} className={`wtchart__series wtchart__series--${p.key}`}>
                    <circle cx={mx} cy={y(p.v)} r={4.5} className="wtchart__dot" />
                    {at && (
                    <text
                      x={at.x}
                      y={at.y}
                      textAnchor={at.anchor}
                      className="wtchart__value"
                    >
                      {currencyCompact(p.v)}
                    </text>
                    )}
                  </g>
                  )
                })}
              </g>
            )}
            {read && (
              <g className="wtchart__cross" data-testid="wt-crosshair" data-row={read.index}>
                <line x1={hx} x2={hx} y1={m.t} y2={height - m.b} />
                {read.income && (
                  <circle cx={hx} cy={y(read.income.netWorth)} r={3.5} className="wtchart__cross-dot wtchart__series--income" />
                )}
                {read.evelo && <circle cx={hx} cy={y(read.evelo.netWorth)} r={3.5} className="wtchart__cross-dot wtchart__series--evelo" />}
              </g>
            )}
            <g transform={`translate(0, ${height - m.b})`}>
              {ageTicks(a0, a0 + n, phone).map((a, i, all) => (
                <text
                  key={a}
                  x={x(a - a0)}
                  y={18}
                  textAnchor={i === 0 ? 'start' : i === all.length - 1 ? 'end' : 'middle'}
                  className="wtchart__tick"
                >
                  {i === 0 ? `age ${a}` : a}
                </text>
              ))}
            </g>
          </g>
        </svg>
      )}
      <ChartReadout id={`${uid}-read`} x={hx} width={width} top={m.t + 6} on={read !== null}>
        {read && (
          <>
            <ReadoutHead lead="End of age" age={read.age} note={read.note} />
            <ReadoutRow keyClass="wtchart__swatch wtchart__swatch--income" label="Living on income" value={read.income?.text.netWorth ?? '—'} faint={!read.income} />
            <ReadoutRow keyClass="wtchart__swatch wtchart__swatch--evelo" label="eVelo" value={read.evelo?.text.netWorth ?? '—'} faint={!read.evelo} />
            {read.gap && <ReadoutRow total label={read.gap.text} value={read.gap.value} />}
            <ReadoutRow faint label="eVelo portfolio" value={read.evelo?.text.portfolio ?? '—'} />
            <ReadoutRow faint label="eVelo loan" value={read.evelo?.text.loan ?? '—'} />
            <ReadoutRow faint label="Loan-to-value" value={read.evelo?.text.ltv ?? '—'} />
            <ReadoutRow faint label="Income’s shares sold" value={read.income?.text.sold ?? '—'} />
          </>
        )}
      </ChartReadout>
    </div>
  )
}

const range = (from: number, to: number) => Array.from({ length: Math.max(0, to - from + 1) }, (_, i) => from + i)
