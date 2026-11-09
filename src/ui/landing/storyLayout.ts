// Geometry for the landing hero's story card (variation A). Pure: a layout (wide or phone viewBox)
// plus a frame (how far each beat has played) in, SVG coordinates and paths out. Stage 1 draws only
// the resting frame (the Die state); stage 2's timeline will hand `chartGeometry` other frames.

import { scaleLinear } from 'd3-scale'
import { line } from 'd3-shape'
import { BEATS, COPY, DEST, HOME, MARGIN_LTV, YEARS, type StoryCity } from './story'

/* ---------- Frame: how far the four beats have played ---------- */

export interface StoryFrame {
  /** Beat shown in the caption, 0..3 (Buy, Borrow, Live anywhere, Die). */
  beat: 0 | 1 | 2 | 3
  /** Portfolio bars filled: bar k is drawn at clamp(grow − k, 0, 1) of its height. */
  grow: number
  /** Years of loan drawn, 0..YEARS (fractional). */
  loanYears: number
  /** 0 = living in the home city, 1 = moved to the destination (loan, odds, pins blend). */
  move: number
  /** The flight arc drawn, 0..1. */
  flight: number
  /** Step-up in basis: hatched gains give way to the plain stepped-up fill, 0..1. */
  stepUp: number
  /** The estate column appears, 0..1 (the bars fade behind it). */
  estate: number
  /** The loan slice lifts off the top of the estate, 0..1. */
  slice: number
  /** The heirs' share fills in, 0..1. */
  heirs: number
}

/** The finished frame: every beat played to its end (the Die state). */
export const REST_FRAME: StoryFrame = {
  beat: 3,
  grow: YEARS + 1,
  loanYears: YEARS,
  move: 1,
  flight: 1,
  stepUp: 1,
  estate: 1,
  slice: 1,
  heirs: 1,
}

/* ---------- Layouts ---------- */

export interface Pt {
  x: number
  y: number
}

export interface StoryLayout {
  id: 'wide' | 'narrow'
  width: number
  height: number
  /** The map strip: its box, the two pins, the pin-label baseline, the arc's lift and chip offsets. */
  map: { x: number; y: number; w: number; h: number; home: Pt; dest: Pt; labelY: number; arcLift: number; homeCoin: number; destCoin: number }
  /** Bars run X0..X1; values 0..VMAX map YB..YT. */
  X0: number
  X1: number
  YT: number
  YB: number
  /** y-tick labels end here (text-anchor end). */
  tickX: number
  /** x-tick label baseline. */
  xTickY: number
  /** Estate column x and width; the loan slice moves right by `sliceDx` as it lifts off. */
  EX: number
  EW: number
  sliceDx: number
  /** Baselines (below the heirs' top) of the Heirs label and amount, and of the slice labels. */
  heirsLabelDy: [number, number]
  sliceLabelDy: [number, number]
}

/** Desktop and tablet: a 600-unit viewBox (text 12+ units). */
export const WIDE: StoryLayout = {
  id: 'wide',
  width: 600,
  height: 394,
  map: { x: 40, y: 4, w: 556, h: 78, home: { x: 150, y: 48 }, dest: { x: 420, y: 54 }, labelY: 74, arcLift: 62, homeCoin: -30, destCoin: 26 },
  X0: 52,
  X1: 388,
  YT: 114,
  YB: 362,
  tickX: 38,
  xTickY: 388,
  EX: 414,
  EW: 80,
  sliceDx: 94,
  heirsLabelDy: [26, 47],
  sliceLabelDy: [22, 42],
}

/** Phone: a narrow viewBox drawn near 1:1 at 390px, so 12-unit text renders at 11px or more. */
export const NARROW: StoryLayout = {
  id: 'narrow',
  width: 336,
  height: 372,
  map: { x: 2, y: 4, w: 332, h: 76, home: { x: 98, y: 44 }, dest: { x: 236, y: 50 }, labelY: 70, arcLift: 50, homeCoin: -24, destCoin: 20 },
  X0: 40,
  X1: 190,
  YT: 116,
  YB: 336,
  tickX: 32,
  xTickY: 362,
  EX: 200,
  EW: 56,
  sliceDx: 66,
  heirsLabelDy: [22, 40],
  sliceLabelDy: [20, 38],
}

/* ---------- Geometry ---------- */

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)
/** Value axis top: the highest y tick ($20M). */
export const VMAX = Math.max(...COPY.axis.yTicks.map((t) => t.value))

export interface Rect {
  x: number
  y: number
  width: number
  height: number
}

export interface ChartGeometry {
  bars: { k: number; paid: Rect; gains: Rect }[]
  loan: string
  loanArea: string
  loanHead: Pt | null
  ghost: string
  margin: string
  yTicks: { y: number; label: string }[]
  xTicks: { x: number; label: string; anchor: 'start' | 'middle' }[]
  gridX: [number, number]
  baselineX: [number, number]
  estate: { heirs: Rect; slice: Rect; topLabel: Pt; heirsLabel: [Pt, Pt]; sliceLabel: [Pt, Pt]; glyphs: Pt[] }
  arc: string
}

const rect = (x: number, y0: number, width: number, y1: number): Rect => ({ x, y: y0, width, height: Math.max(0, y1 - y0) })

/** The loan at year k, blending home and destination by `move`. */
export const loanAt = (k: number, move: number) => HOME.series.loan[k] * (1 - move) + DEST.series.loan[k] * move

export function chartGeometry(L: StoryLayout, f: StoryFrame = REST_FRAME): ChartGeometry {
  const x = scaleLinear().domain([0, YEARS]).range([L.X0, L.X1])
  const y = scaleLinear().domain([0, VMAX]).range([L.YB, L.YT])
  const path = line<[number, number]>()
    .x((d) => +d[0].toFixed(1))
    .y((d) => +d[1].toFixed(1))
  const d = (pts: [number, number][]) => path(pts) ?? ''

  const barWidth = ((L.X1 - L.X0) / YEARS) * 0.7
  const bars = DEST.series.portfolio.map((p, k) => {
    const v = p * clamp01(f.grow - k)
    const paid = Math.min(v, DEST.series.basis[k])
    const bx = x(k) - barWidth / 2
    return { k, paid: rect(bx, y(paid), barWidth, L.YB), gains: rect(bx, y(v), barWidth, y(paid)) }
  })

  // Loan: whole years drawn, then the partial year interpolated.
  const pts: [number, number][] = []
  const n = Math.floor(f.loanYears)
  for (let i = 0; i <= Math.min(n, YEARS); i++) pts.push([x(i), y(loanAt(i, f.move))])
  if (f.loanYears > n && n < YEARS) {
    const fr = f.loanYears - n
    pts.push([x(n + fr), y(loanAt(n, f.move) * (1 - fr) + loanAt(n + 1, f.move) * fr)])
  }
  const on = f.loanYears > 0
  const last = pts[pts.length - 1]
  const loan = on ? d(pts) : ''
  const loanArea = on ? `${loan}L${last[0].toFixed(1)},${L.YB}L${L.X0},${L.YB}Z` : ''

  const eTop = y(DEST.atEnd.portfolio)
  const eHeirsTop = y(DEST.atEnd.heirs)
  const sx = L.EX + L.sliceDx * f.slice
  const heirsCx = L.EX + L.EW / 2
  const sliceCx = sx + L.EW / 2

  const { home, dest, arcLift } = L.map
  const arc = `M${home.x},${home.y}Q${(home.x + dest.x) / 2},${Math.min(home.y, dest.y) - arcLift} ${dest.x},${dest.y}`

  return {
    bars,
    loan,
    loanArea,
    loanHead: on ? { x: last[0], y: last[1] } : null,
    ghost: d(HOME.series.loan.map((v, i) => [x(i), y(v)])),
    margin: d(DEST.series.portfolio.map((p, i) => [x(i), y(p * MARGIN_LTV)])),
    yTicks: COPY.axis.yTicks.map((t) => ({ y: y(t.value), label: t.label })),
    xTicks: COPY.axis.xTicks.map((t) => ({ x: t.t === 0 ? L.X0 - 6 : x(t.t), label: t.label, anchor: t.t === 0 ? 'start' : 'middle' })),
    gridX: [L.X0 - 6, L.X1 + 6],
    baselineX: [L.X0 - 6, L.EX + L.sliceDx + L.EW + 2],
    estate: {
      heirs: rect(L.EX, eHeirsTop, L.EW, L.YB),
      slice: rect(sx, eTop, L.EW, eHeirsTop),
      topLabel: { x: heirsCx, y: eTop - 9 },
      heirsLabel: [
        { x: heirsCx, y: eHeirsTop + L.heirsLabelDy[0] },
        { x: heirsCx, y: eHeirsTop + L.heirsLabelDy[1] },
      ],
      sliceLabel: [
        { x: sliceCx, y: eHeirsTop + L.sliceLabelDy[0] },
        { x: sliceCx, y: eHeirsTop + L.sliceLabelDy[1] },
      ],
      glyphs: [
        { x: heirsCx - 9, y: L.YB - 20 },
        { x: heirsCx + 9, y: L.YB - 17 },
      ],
    },
    arc,
  }
}

/** A faint dot texture for the map strip: two rough land masses around the two pins. */
export function mapDots(L: StoryLayout): Pt[] {
  const { x, y, w, h, home, dest } = L.map
  const step = L.id === 'wide' ? 16 : 12
  const out: Pt[] = []
  for (let gx = x + 10; gx < x + w - 4; gx += step)
    for (let gy = y + 10; gy < y + h - 4; gy += 13) {
      const nearHome = gx > home.x - 100 && gx < home.x + 80 && gy > y + 16 && gy < y + h - 10
      const nearDest = gx > dest.x - 40 && gx < dest.x + 120 && gy > y + 14 && gy < y + h - 14
      if (nearHome || nearDest) out.push({ x: gx, y: gy })
    }
  return out
}

/** The caption, key text and odds badge at a frame (every string from the model). */
export function frameCopy(f: StoryFrame): {
  odds: number
  oddsCity: StoryCity
  lead: string
  detail: string
  gains: string
  loan: string
} {
  const shownYear = Math.min(YEARS, Math.max(0, Math.ceil(f.grow) - 1))
  return {
    odds: Math.round(HOME.odds + (DEST.odds - HOME.odds) * f.move),
    oddsCity: f.move > 0.5 ? DEST : HOME,
    lead: BEATS[f.beat].lead,
    detail: BEATS[f.beat].detail,
    gains: f.stepUp > 0.5 ? COPY.key.gainsStepped : COPY.key.gains(DEST.series.gains[shownYear]),
    loan: f.move > 0.5 ? COPY.key.loanDest : f.beat < 2 ? COPY.key.loanBorrow : COPY.key.loanHome,
  }
}
