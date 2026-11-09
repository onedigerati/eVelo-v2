// Geometry for the landing hero's story card (variation A). Pure: a layout (wide or phone viewBox)
// plus a frame (how far each beat has played, from storyTimeline.ts's `frameAt(t)`) in, SVG
// coordinates and paths out. The static parts (axes, ghost and margin lines, map, estate column)
// are computed once per layout; only the animated parts are computed per frame.

import { scaleLinear } from 'd3-scale'
import { line } from 'd3-shape'
import { bandFor, COPY, DEST, HOME, MARGIN_LTV, YEARS, type Band, type StoryCity } from './story'
import { beatIndex, COIN_YEARS, easeOut, REST_FRAME, type StoryFrame } from './storyTimeline'

export { REST_FRAME, type StoryFrame } from './storyTimeline'

/* ---------- Layouts ---------- */

interface Pt {
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
  /** x-tick label baseline (below the strip where the person walks during Borrow). */
  xTickY: number
  /** The person's head (Borrow): it walks along under the baseline at this y; coins fall to it. */
  personY: number
  /** Radius of the falling coins. */
  coinR: number
  /** Estate column x and width; the loan slice moves right by `sliceDx` as it lifts off. */
  EX: number
  EW: number
  sliceDx: number
  /** Baselines (below the heirs' top) of the Heirs label and amount. */
  heirsLabelDy: [number, number]
  /**
   * Baselines (below the heirs' top) of the slice's label lines: "Loan repaid" then the amount, or
   * on the phone "Loan" / "repaid" / amount, so the label stays narrower than the gap beside the heirs.
   */
  sliceLabelDy: number[]
}

/** Desktop and tablet: a 600-unit viewBox (text 13.5+ units, shown from a 490px card so it renders at 11px+). */
export const WIDE: StoryLayout = {
  id: 'wide',
  width: 600,
  height: 418,
  map: { x: 40, y: 4, w: 556, h: 78, home: { x: 150, y: 48 }, dest: { x: 420, y: 54 }, labelY: 74, arcLift: 62, homeCoin: -30, destCoin: 26 },
  X0: 52,
  X1: 388,
  YT: 114,
  YB: 362,
  tickX: 38,
  xTickY: 412,
  personY: 374,
  coinR: 5,
  EX: 414,
  EW: 80,
  sliceDx: 94,
  heirsLabelDy: [26, 47],
  sliceLabelDy: [22, 42],
}

/** Phone: a narrow viewBox drawn near 1:1 at 390px, so 13-unit text renders at 11px or more from a 360px screen. */
export const NARROW: StoryLayout = {
  id: 'narrow',
  width: 336,
  height: 396,
  map: { x: 2, y: 4, w: 332, h: 76, home: { x: 98, y: 44 }, dest: { x: 236, y: 50 }, labelY: 70, arcLift: 50, homeCoin: -24, destCoin: 20 },
  X0: 44,
  X1: 190,
  YT: 116,
  YB: 336,
  tickX: 34,
  xTickY: 386,
  personY: 347,
  coinR: 4,
  EX: 200,
  EW: 56,
  sliceDx: 66,
  heirsLabelDy: [22, 40],
  sliceLabelDy: [20, 36, 54],
}

/* ---------- Geometry ---------- */

/** Value axis top: the highest y tick ($20M). */
export const VMAX = Math.max(...COPY.axis.yTicks.map((t) => t.value))

interface Rect {
  x: number
  y: number
  width: number
  height: number
}

/** The parts that never move: computed once per layout. */
interface StaticGeometry {
  barX: number[]
  barWidth: number
  ghost: string
  margin: string
  yTicks: { y: number; label: string }[]
  xTicks: { x: number; label: string; anchor: 'start' | 'middle' }[]
  gridX: [number, number]
  baselineX: [number, number]
  arc: string
  dots: Pt[]
  /** Each coin's year x and the y it falls from (the home loan that year). */
  coinFrom: Pt[]
  estate: { heirs: Rect; eTop: number; eHeirsTop: number; topLabel: Pt; heirsLabel: [Pt, Pt]; glyphs: Pt[] }
}

/** The parts that move: computed per frame. */
interface FrameGeometry {
  bars: { k: number; paid: Rect; gains: Rect }[]
  loan: string
  loanArea: string
  loanHead: Pt | null
  personX: number
  /** Coins in flight (others are not drawn). */
  coins: { k: number; x: number; y: number; opacity: number }[]
  /** The travelling coin on the flight arc, while the flight is under way. */
  travel: (Pt & { r: number }) | null
  slice: Rect
  /** Slice label lines' anchor points (x centred on the slice). */
  sliceLabel: Pt[]
}

type ChartGeometry = StaticGeometry & FrameGeometry

const rect = (x: number, y0: number, width: number, y1: number): Rect => ({ x, y: y0, width, height: Math.max(0, y1 - y0) })

const scales = (L: StoryLayout) => ({
  x: scaleLinear().domain([0, YEARS]).range([L.X0, L.X1]),
  y: scaleLinear().domain([0, VMAX]).range([L.YB, L.YT]),
})

const path = line<[number, number]>()
  .x((d) => +d[0].toFixed(1))
  .y((d) => +d[1].toFixed(1))
const d = (pts: [number, number][]) => path(pts) ?? ''

/** A point on the flight arc (a quadratic Bézier from home to destination) at parameter a. */
function arcPoint(L: StoryLayout, a: number): Pt {
  const { home, dest, arcLift } = L.map
  const c = { x: (home.x + dest.x) / 2, y: Math.min(home.y, dest.y) - arcLift }
  const u = 1 - a
  return { x: u * u * home.x + 2 * u * a * c.x + a * a * dest.x, y: u * u * home.y + 2 * u * a * c.y + a * a * dest.y }
}

const staticCache = new Map<StoryLayout, StaticGeometry>()

/** The static parts of a layout, computed on first use and cached. */
export function staticGeometry(L: StoryLayout): StaticGeometry {
  const hit = staticCache.get(L)
  if (hit) return hit
  const { x, y } = scales(L)
  const barWidth = ((L.X1 - L.X0) / YEARS) * 0.7
  const eTop = y(DEST.atEnd.portfolio)
  const eHeirsTop = y(DEST.atEnd.heirs)
  const heirsCx = L.EX + L.EW / 2
  const { home, dest, arcLift } = L.map
  const g: StaticGeometry = {
    barX: DEST.series.portfolio.map((_, k) => x(k) - barWidth / 2),
    barWidth,
    ghost: d(HOME.series.loan.map((v, i) => [x(i), y(v)])),
    margin: d(DEST.series.portfolio.map((p, i) => [x(i), y(p * MARGIN_LTV)])),
    yTicks: COPY.axis.yTicks.map((t) => ({ y: y(t.value), label: t.label })),
    xTicks: COPY.axis.xTicks.map((t) => ({ x: t.t === 0 ? L.X0 - 6 : x(t.t), label: t.label, anchor: t.t === 0 ? 'start' : 'middle' })),
    gridX: [L.X0 - 6, L.X1 + 6],
    baselineX: [L.X0 - 6, L.EX + L.sliceDx + L.EW + 2],
    arc: `M${home.x},${home.y}Q${(home.x + dest.x) / 2},${Math.min(home.y, dest.y) - arcLift} ${dest.x},${dest.y}`,
    dots: mapDots(L),
    coinFrom: COIN_YEARS.map((yr) => ({ x: x(yr), y: y(HOME.series.loan[yr]) })),
    estate: {
      heirs: rect(L.EX, eHeirsTop, L.EW, L.YB),
      eTop,
      eHeirsTop,
      topLabel: { x: heirsCx, y: eTop - 9 },
      heirsLabel: [
        { x: heirsCx, y: eHeirsTop + L.heirsLabelDy[0] },
        { x: heirsCx, y: eHeirsTop + L.heirsLabelDy[1] },
      ],
      glyphs: [
        { x: heirsCx - 9, y: L.YB - 20 },
        { x: heirsCx + 9, y: L.YB - 17 },
      ],
    },
  }
  staticCache.set(L, g)
  return g
}

/** The loan at year k, blending home and destination by `move` (the line bends flatter as you move). */
const loanAt = (k: number, move: number) => HOME.series.loan[k] * (1 - move) + DEST.series.loan[k] * move

/** The animated parts at a frame. */
export function frameGeometry(L: StoryLayout, f: StoryFrame = REST_FRAME): FrameGeometry {
  const s = staticGeometry(L)
  const { x, y } = scales(L)

  const bars = DEST.series.portfolio.map((p, k) => {
    const v = p * easeOut(f.grow - k)
    const paid = Math.min(v, DEST.series.basis[k])
    return { k, paid: rect(s.barX[k], y(paid), s.barWidth, L.YB), gains: rect(s.barX[k], y(v), s.barWidth, y(paid)) }
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

  // Coins fall (accelerating) from the loan to the person, fading over their last fifth.
  const coins: FrameGeometry['coins'] = []
  f.coins.forEach((q, k) => {
    if (q <= 0 || q >= 1) return
    const from = s.coinFrom[k]
    const to = L.personY + 2
    coins.push({ k, x: from.x, y: +(from.y + (to - from.y) * q * q).toFixed(1), opacity: q < 0.8 ? 1 : (1 - q) / 0.2 })
  })

  const a = f.flight
  const tp = a > 0 && a < 1 ? arcPoint(L, a) : null
  const sx = L.EX + L.sliceDx * f.slice
  const sliceCx = sx + L.EW / 2
  return {
    bars,
    loan,
    loanArea,
    loanHead: on ? { x: last[0], y: last[1] } : null,
    personX: on ? last[0] : L.X0,
    coins,
    travel: tp ? { x: tp.x, y: tp.y - 9, r: (8 - 3 * a) * (L.id === 'wide' ? 1 : 0.8) } : null,
    slice: rect(sx, s.estate.eTop, L.EW, s.estate.eHeirsTop),
    sliceLabel: L.sliceLabelDy.map((dy) => ({ x: sliceCx, y: s.estate.eHeirsTop + dy })),
  }
}

/** Static and animated geometry together (for tests and one-off renders). */
export function chartGeometry(L: StoryLayout, f: StoryFrame = REST_FRAME): ChartGeometry {
  return { ...staticGeometry(L), ...frameGeometry(L, f) }
}

/** A faint dot texture for the map strip: two rough land masses around the two pins. */
function mapDots(L: StoryLayout): Pt[] {
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

/** The slice label's lines for a layout: one line on wide, the label split by word on the phone. */
export function sliceLabelLines(L: StoryLayout): string[] {
  const words = L.sliceLabelDy.length > 2 ? COPY.estate.loanLabel.split(' ') : [COPY.estate.loanLabel]
  return [...words, COPY.estate.loan]
}

/** The key text and odds badge at a frame (every string from the model; the caption is BEATS[beat]). */
export function frameCopy(f: StoryFrame): {
  /** The odds shown: always one endpoint city's own figure, never a blend. */
  odds: number
  oddsCity: StoryCity
  /** The story's outcome band for the odds (the badge's colour). */
  oddsBand: Band
  gains: string
  loan: string
} {
  const i = beatIndex(f.beat)
  const shownYear = Math.min(YEARS, Math.max(0, Math.ceil(f.grow) - 1))
  const oddsCity = f.move > 0.5 ? DEST : HOME
  return {
    odds: oddsCity.odds,
    oddsCity,
    oddsBand: bandFor(oddsCity.odds),
    gains: f.stepUp > 0.5 ? COPY.key.gainsStepped : COPY.key.gains(DEST.series.gains[shownYear]),
    loan: f.move > 0.5 ? COPY.key.loanDest : i < 2 ? COPY.key.loanBorrow : COPY.key.loanHome,
  }
}
