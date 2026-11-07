import { animate, AnimatePresence, m as motion, useReducedMotion } from 'framer-motion'
import { geoGraticule10, geoPath } from 'd3-geo'
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as RMouseEvent,
  type PointerEvent as RPointerEvent,
} from 'react'
import { CITIES } from '../../data/cities'
import type { City } from '../../engine/types'
import { rate } from '../../state/fx'
import { currency, currencyCompact, percent } from '../format'
import { useResolvedTheme } from '../hooks'
import { ease } from '../motion'
import { cx } from '../primitives'
import { outcomeRgb } from '../outcomeScale'
import { costDelta, localCompact, inRegion, successColor, successTextColor, type Ranked, type RegionChip } from './atlasData'
import { CodeChip } from './CodeChip'
import { LEVELS, loadLandDots, projection, S0, toWorld, WORLD_W, type LandDots } from './landDots'
import { clampView, panBy, pinchView, sameView, wheelFactor, zoomAt, type Limits, type View } from './mapView'
import { classifyTouch } from '../primitives/sliderGesture'

/* ---------------------------------------------------------------- Geometry */

const CITY_WORLD = new Map<string, [number, number]>(CITIES.map((c) => [c.id, toWorld(c.lon, c.lat)]))
const CITY_INDEX = new Map<string, number>(CITIES.map((c, i) => [c.id, i]))
const Y_TOP = toWorld(0, 79)[1]
const Y_BOT = toWorld(0, -57)[1]
const HALO_R = 30

function fit([x0, y0, x1, y1]: [number, number, number, number], W: number, H: number, pad = 0.94): View {
  const k = Math.min(W / (x1 - x0), H / (y1 - y0)) * pad
  return { k, tx: W / 2 - k * ((x0 + x1) / 2), ty: H / 2 - k * ((y0 + y1) / 2) }
}

function regionFit(region: RegionChip, W: number, H: number): View {
  return fit(regionBox(region, W, H), W, H, region === 'All' ? 0.99 : 0.94)
}

/** Pan bounds: the inhabited band (Hawaii to the dateline, 79°N to 57°S), not the sphere's empty corners. */
const PAN_BOX: [number, number, number, number] = [toWorld(-165, 0)[0], Y_TOP, WORLD_W, Y_BOT]

/**
 * Zoom range and pan bounds: zoom out to the whole world, in to ~16× that, never pan off it.
 * The bounds also take in the region's own fit, so a fit near the edge never jumps on first drag.
 */
function limits(W: number, H: number, region: RegionChip): Limits {
  const kMin = Math.min(W / WORLD_W, H / (Y_BOT - Y_TOP)) * 0.95
  const f = regionFit(region, W, H)
  const box: [number, number, number, number] = [
    Math.min(PAN_BOX[0], -f.tx / f.k),
    Math.min(PAN_BOX[1], -f.ty / f.k),
    Math.max(PAN_BOX[2], (W - f.tx) / f.k),
    Math.max(PAN_BOX[3], (H - f.ty) / f.k),
  ]
  return { kMin, kMax: Math.max(kMin * 16, f.k * 4), box }
}

const IS_MAC = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)

type Gesture =
  | { mode: 'none' }
  | { mode: 'pending' | 'pan'; id: number; x0: number; y0: number; v0: View }
  | { mode: 'scroll' }
  | { mode: 'pinch'; ids: [number, number]; p0: [[number, number], [number, number]]; v0: View }

function regionBox(region: RegionChip, W: number, H: number): [number, number, number, number] {
  if (region === 'All')
    return W < 560 ? [toWorld(-132, 0)[0], toWorld(0, 66)[1], toWorld(180, 0)[0], toWorld(0, -48)[1]] : [0, Y_TOP, WORLD_W, Y_BOT]
  const pts = CITIES.filter((c) => inRegion(c, region)).map((c) => CITY_WORLD.get(c.id)!)
  let x0 = Infinity
  let y0 = Infinity
  let x1 = -Infinity
  let y1 = -Infinity
  for (const [x, y] of pts) ((x0 = Math.min(x0, x)), (y0 = Math.min(y0, y)), (x1 = Math.max(x1, x)), (y1 = Math.max(y1, y)))
  // Pad, enforce a minimum span (Oceania has three cities) and match the container aspect so
  // the fit centers the cities rather than a sliver.
  const cx = (x0 + x1) / 2
  const cy = (y0 + y1) / 2
  let w = Math.max(110, (x1 - x0) * 1.3)
  let h = Math.max(60, (y1 - y0) * 1.35)
  const aspect = W / H
  if (w / h < aspect) w = h * aspect
  else h = w / aspect
  return [cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2]
}

/* ---------------------------------------------------------------- Colors */

type RGB = [number, number, number]
interface Palette {
  ink: RGB
  dotA: number
  ramp: RGB[]
  sphere: string
  grid: string
}

function parseColor(ctx: CanvasRenderingContext2D, css: string): RGB {
  ctx.fillStyle = '#000'
  ctx.fillStyle = css.trim() || '#000'
  const v = String(ctx.fillStyle)
  if (v.startsWith('#')) return [parseInt(v.slice(1, 3), 16), parseInt(v.slice(3, 5), 16), parseInt(v.slice(5, 7), 16)]
  const m = v.match(/[\d.]+/g)
  return m ? [Number(m[0]), Number(m[1]), Number(m[2])] : [0, 0, 0]
}

function readPalette(el: HTMLElement, ctx: CanvasRenderingContext2D, dark: boolean): Palette {
  const cs = getComputedStyle(el)
  const v = (n: string) => cs.getPropertyValue(n)
  return {
    ink: parseColor(ctx, v('--ink')),
    dotA: dark ? 0.17 : 0.14,
    ramp: [0, 1, 2, 3, 4].map((i) => parseColor(ctx, v(`--ramp-${i}`))),
    sphere: v('--surface-3').trim() || 'transparent',
    grid: v('--chart-grid').trim() || 'transparent',
  }
}

const mix = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
/** Color for a quantized success bucket (40 buckets; the bucket's midpoint keeps the 65% step crisp). */
const rampRGB = (p: Palette, bucket: number): RGB => outcomeRgb(p.ramp, (bucket + 0.5) / 40)
const rgba = ([r, g, b]: RGB, a: number) => `rgba(${r | 0},${g | 0},${b | 0},${a.toFixed(3)})`

/* ---------------------------------------------------------------- Canvas paint */

interface Near {
  idx: Int16Array
  w: Float32Array
}

function nearestCities(d: LandDots): Near {
  const idx = new Int16Array(d.n).fill(-1)
  const w = new Float32Array(d.n)
  const pts = CITIES.map((c) => CITY_WORLD.get(c.id)!)
  for (let i = 0; i < d.n; i++) {
    const x = d.x[i]
    const y = d.y[i]
    let best = HALO_R * HALO_R
    let bi = -1
    for (let c = 0; c < pts.length; c++) {
      const dx = pts[c][0] - x
      const dy = pts[c][1] - y
      const dd = dx * dx + dy * dy
      if (dd < best) ((best = dd), (bi = c))
    }
    if (bi >= 0) {
      idx[i] = bi
      const t = 1 - Math.sqrt(best) / HALO_R
      w[i] = Math.pow(t, 1.35)
    }
  }
  return { idx, w }
}

const sphere = { type: 'Sphere' } as const
const graticule = geoGraticule10()

function paint(
  ctx: CanvasRenderingContext2D,
  dots: LandDots | null,
  near: Near | null,
  tone: Float32Array,
  pal: Palette,
  view: View,
  W: number,
  H: number,
  dpr: number,
) {
  const { k, tx, ty } = view
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, W, H)

  // Sphere + graticule, in world space.
  ctx.save()
  ctx.setTransform(dpr * k, 0, 0, dpr * k, dpr * tx, dpr * ty)
  const path = geoPath(projection, ctx)
  ctx.beginPath()
  path(sphere)
  ctx.fillStyle = pal.sphere
  ctx.fill()
  ctx.beginPath()
  path(graticule)
  ctx.lineWidth = 0.75 / k
  ctx.strokeStyle = pal.grid
  ctx.stroke()
  ctx.restore()
  if (!dots) return

  // Level alphas: a level is fully shown once its on-screen spacing clears MIN px.
  const MIN = 4.4
  const alpha = new Float32Array(LEVELS)
  let finest = S0 * (1 << (LEVELS - 1)) * k
  for (let l = LEVELS - 1; l >= 0; l--) {
    const sp = S0 * (1 << l) * k
    alpha[l] = l === LEVELS - 1 ? 1 : Math.min(1, Math.max(0, (sp - MIN) / (0.25 * MIN)))
    if (alpha[l] >= 1) finest = sp
  }
  const r = Math.min(2.4, Math.max(0.7, finest * 0.3))

  const buckets = new Map<number, { style: string; pts: number[] }>()
  const pad = r + 1
  for (let i = 0; i < dots.n; i++) {
    const a = alpha[dots.lvl[i]]
    if (a <= 0.02) continue
    const x = dots.x[i] * k + tx
    if (x < -pad || x > W + pad) continue
    const y = dots.y[i] * k + ty
    if (y < -pad || y > H + pad) continue
    const aq = Math.ceil(a * 4) // 1..4
    let key = aq
    const ci = near ? near.idx[i] : -1
    const t = ci >= 0 ? tone[ci] : -1
    let wq = 0
    let tq = 0
    if (t >= 0 && near) {
      wq = Math.round(near.w[i] * 5) // 0..5
      tq = Math.min(39, Math.floor(t * 40)) // success bucket 0..39
      if (wq > 0) key = aq + 10 * (1 + tq * 6 + wq)
    }
    let b = buckets.get(key)
    if (!b) {
      const aa = aq / 4
      const style =
        wq > 0
          ? rgba(mix(pal.ink, rampRGB(pal, tq), Math.min(1, 0.5 + wq * 0.1)), aa * (pal.dotA + (0.62 - pal.dotA) * (wq / 5)))
          : rgba(pal.ink, aa * pal.dotA)
      b = { style, pts: [] }
      buckets.set(key, b)
    }
    b.pts.push(x, y)
  }
  const TAU = Math.PI * 2
  for (const b of buckets.values()) {
    ctx.beginPath()
    const p = b.pts
    for (let j = 0; j < p.length; j += 2) {
      ctx.moveTo(p[j] + r, p[j + 1])
      ctx.arc(p[j], p[j + 1], r, 0, TAU)
    }
    ctx.fillStyle = b.style
    ctx.fill()
  }
}

/* ---------------------------------------------------------------- Component */

export interface WorldMapProps {
  rows: Ranked[]
  homeId: string
  destId: string | null
  region: RegionChip
  compare: string[]
  onToggleCompare: (id: string) => void
  onChoose: (id: string) => void
  homeSpend: number
}

interface Marker {
  row: Ranked | null
  city: City
  x: number
  y: number
  r: number
  cheaper: boolean
}

export function WorldMap({ rows, homeId, destId, region, compare, onToggleCompare, onChoose, homeSpend }: WorldMapProps) {
  const wrap = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const [size, setSize] = useState<{ W: number; H: number } | null>(null)
  const [view, setView] = useState<View | null>(null)
  const viewRef = useRef<View | null>(null)
  const [dots, setDots] = useState<LandDots | null>(null)
  const [hover, setHover] = useState<string | null>(null)
  const [pinned, setPinned] = useState<string | null>(null)
  const pointerType = useRef<string>('mouse')
  const hideTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const reduce = useReducedMotion()
  const theme = useResolvedTheme()

  const near = useMemo(() => (dots ? nearestCities(dots) : null), [dots])
  const byId = useMemo(() => new Map(rows.map((r) => [r.cityId, r])), [rows])
  const tone = useMemo(() => {
    const t = new Float32Array(CITIES.length).fill(-1)
    for (const r of rows) {
      const i = CITY_INDEX.get(r.cityId)
      if (i != null) t[i] = Math.max(0, Math.min(1, r.successRate))
    }
    return t
  }, [rows])

  useEffect(() => {
    let live = true
    loadLandDots()
      .then((d) => live && setDots(d))
      .catch((e) => console.warn('Land shape failed to load', e))
    return () => {
      live = false
    }
  }, [])

  // Size: width from the container; height from a phone/desktop aspect.
  useLayoutEffect(() => {
    const el = wrap.current
    if (!el) return
    const measure = () => {
      const W = Math.round(el.clientWidth)
      if (!W) return
      const H = Math.round(W / (W < 560 ? 1.5 : W < 900 ? 1.75 : 2.15))
      setSize((s) => (s && s.W === W && s.H === H ? s : { W, H }))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Fly the view to a target (log-space scale, linear world centre); jumps when reduced motion.
  const anim = useRef<{ stop: () => void } | null>(null)
  const flyTo = useCallback(
    (target: View, W: number, H: number, duration = 0.95) => {
      anim.current?.stop()
      anim.current = null
      const from = viewRef.current
      if (!from || reduce) {
        viewRef.current = target
        setView(target)
        return
      }
      const c0 = [(W / 2 - from.tx) / from.k, (H / 2 - from.ty) / from.k]
      const c1 = [(W / 2 - target.tx) / target.k, (H / 2 - target.ty) / target.k]
      const l0 = Math.log(from.k)
      const l1 = Math.log(target.k)
      anim.current = animate(0, 1, {
        duration,
        ease,
        onUpdate: (t) => {
          const k = Math.exp(l0 + (l1 - l0) * t)
          const cx = c0[0] + (c1[0] - c0[0]) * t
          const cy = c0[1] + (c1[1] - c0[1]) * t
          const v = { k, tx: W / 2 - k * cx, ty: H / 2 - k * cy }
          viewRef.current = v
          setView(v)
        },
      })
    },
    [reduce],
  )
  useEffect(() => () => anim.current?.stop(), [])

  // Fit: jump on resize, animate on region change.
  const lastRegion = useRef<RegionChip | null>(null)
  useEffect(() => {
    if (!size) return
    const target = regionFit(region, size.W, size.H)
    const regionChanged = lastRegion.current !== null && lastRegion.current !== region
    lastRegion.current = region
    if (!viewRef.current || !regionChanged) {
      anim.current?.stop()
      viewRef.current = target
      setView(target)
      return
    }
    flyTo(target, size.W, size.H)
  }, [region, size, flyTo])

  /** Apply a user pan/zoom: stops any fly-to and keeps the view inside the limits. */
  const setUserView = useCallback(
    (v: View) => {
      if (!size) return
      anim.current?.stop()
      anim.current = null
      const c = clampView(v, size.W, size.H, limits(size.W, size.H, region))
      viewRef.current = c
      setView(c)
    },
    [size, region],
  )
  const zoomBy = (f: number) => {
    const v = viewRef.current
    if (!v || !size) return
    const lim = limits(size.W, size.H, region)
    const k = Math.min(lim.kMax, Math.max(lim.kMin, v.k * f))
    flyTo(clampView(zoomAt(v, k, size.W / 2, size.H / 2), size.W, size.H, lim), size.W, size.H, 0.35)
  }
  const fitTarget = size ? regionFit(region, size.W, size.H) : null
  const canReset = !!(view && fitTarget && !sameView(view, fitTarget))

  // Short hint pill ("Ctrl + scroll to zoom").
  const [hint, setHint] = useState<string | null>(null)
  const hintTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const flashHint = useCallback((text: string) => {
    setHint(text)
    clearTimeout(hintTimer.current)
    hintTimer.current = setTimeout(() => setHint(null), 1400)
  }, [])
  useEffect(() => () => clearTimeout(hintTimer.current), [])

  // Paint.
  const palRef = useRef<Palette | null>(null)
  useEffect(() => {
    palRef.current = null
  }, [theme])
  useEffect(() => {
    const cv = canvas.current
    const el = wrap.current
    if (!cv || !el || !size || !view) return
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    const pw = Math.round(size.W * dpr)
    const ph = Math.round(size.H * dpr)
    if (cv.width !== pw || cv.height !== ph) ((cv.width = pw), (cv.height = ph))
    const ctx = cv.getContext('2d')
    if (!ctx) return
    palRef.current ??= readPalette(el, ctx, theme === 'dark')
    paint(ctx, dots, near, tone, palRef.current, view, size.W, size.H, dpr)
  }, [dots, near, tone, view, size, theme])

  // Markers in screen space.
  const markers = useMemo<Marker[]>(() => {
    if (!view) return []
    const z = Math.min(1.45, Math.max(0.52, Math.sqrt(view.k / 1.15)))
    return CITIES.map((city) => {
      const [wx, wy] = CITY_WORLD.get(city.id)!
      const row = byId.get(city.id) ?? null
      const save = row ? 1 - row.costRatio : 0
      const cheaper = save > 0.005
      const r = (cheaper ? 3 + 8.5 * Math.pow(Math.min(1, save / 0.4), 0.85) : 2.8) * z
      return { row, city, x: wx * view.k + view.tx, y: wy * view.k + view.ty, r, cheaper }
    })
  }, [view, byId])

  const visible = useMemo(
    () => (size ? markers.filter((m) => m.x > -20 && m.x < size.W + 20 && m.y > -20 && m.y < size.H + 20) : []),
    [markers, size],
  )

  // Base layer in a stable order (big under small); home / destination / active get a top layer.
  const base = useMemo(() => [...visible].sort((a, b) => b.r - a.r || a.city.id.localeCompare(b.city.id)), [visible])
  const topIds = useMemo(() => {
    const ids: string[] = []
    if (homeId) ids.push(homeId)
    if (destId && destId !== homeId) ids.push(destId)
    const act = pinned ?? hover
    if (act && !ids.includes(act)) ids.push(act)
    return ids
  }, [homeId, destId, hover, pinned])

  // Greedy label placement, highest priority first.
  const labels = useMemo(() => {
    if (!size || !view) return []
    const placed: [number, number, number, number][] = []
    const out: { id: string; x: number; y: number; anchor: 'start' | 'end'; text: string; pct: string | null; kind: string }[] = []
    const zoomed = view.k > 2.2
    const cands = [...visible]
      .map((m) => {
        const id = m.city.id
        const p =
          id === hover || id === pinned
            ? 0
            : id === destId
              ? 1
              : id === homeId
                ? 2
                : m.row && m.row.rank <= 3
                  ? 3 + m.row.rank
                  : zoomed
                    ? 10 + (m.row?.rank ?? 99)
                    : 999
        return { m, p }
      })
      .filter((c) => c.p < 999)
      .sort((a, b) => a.p - b.p)
    for (const { m, p } of cands) {
      const text = m.city.name
      const pct = m.row && p <= 6 ? percent(m.row.successRate) : null
      const w = text.length * 6.3 + (pct ? pct.length * 6.6 + 6 : 0)
      const h = 14
      for (const side of ['start', 'end'] as const) {
        const x = side === 'start' ? m.x + m.r + 5 : m.x - m.r - 5
        const bx0 = side === 'start' ? x : x - w
        const box: [number, number, number, number] = [bx0, m.y - h / 2, bx0 + w, m.y + h / 2]
        if (box[0] < 2 || box[2] > size.W - 2 || box[1] < 2 || box[3] > size.H - 2) continue
        if (placed.some((b) => !(box[2] < b[0] || box[0] > b[2] || box[3] < b[1] || box[1] > b[3]))) continue
        placed.push(box)
        out.push({
          id: m.city.id,
          x,
          y: m.y,
          anchor: side,
          text,
          pct,
          kind: m.city.id === destId ? 'dest' : m.city.id === homeId ? 'home' : p <= 6 && p >= 4 ? 'top' : 'plain',
        })
        break
      }
    }
    return out
  }, [visible, size, view, hover, pinned, destId, homeId])

  const nearest = useCallback(
    (e: { clientX: number; clientY: number; pointerType?: string }) => {
      const el = wrap.current
      if (!el) return null
      const rect = el.getBoundingClientRect()
      const px = e.clientX - rect.left
      const py = e.clientY - rect.top
      let best: Marker | null = null
      let bd = Infinity
      for (const m of visible) {
        const d = Math.hypot(m.x - px, m.y - py) - m.r
        if (d < bd) ((bd = d), (best = m))
      }
      const reach = e.pointerType === 'touch' ? 22 : 12
      return best && bd < reach ? best.city.id : null
    },
    [visible],
  )

  // Pan / zoom gestures. Mouse: drag pans. Touch: a horizontal drag pans and a vertical swipe
  // scrolls the page (the stage is `touch-action: pan-y`), two fingers pinch and pan.
  const pts = useRef(new Map<number, [number, number]>())
  const gesture = useRef<Gesture>({ mode: 'none' })
  const dragged = useRef(false)
  const [panning, setPanning] = useState(false)
  const local = (e: { clientX: number; clientY: number }): [number, number] => {
    const r = wrap.current!.getBoundingClientRect()
    return [e.clientX - r.left, e.clientY - r.top]
  }
  const startPinch = () => {
    const [[ia, pa], [ib, pb]] = [...pts.current.entries()]
    gesture.current = { mode: 'pinch', ids: [ia, ib], p0: [pa, pb], v0: viewRef.current! }
    setPanning(true)
  }
  const startPan = (id: number, p: [number, number]) => {
    gesture.current = { mode: 'pan', id, x0: p[0], y0: p[1], v0: viewRef.current! }
  }

  const onDown = (e: RPointerEvent) => {
    pointerType.current = e.pointerType
    if (e.pointerType === 'mouse' && e.button !== 0) return
    if (!viewRef.current) return
    if (pts.current.size === 0) dragged.current = false
    const p = local(e)
    pts.current.set(e.pointerId, p)
    if (pts.current.size === 2) startPinch()
    else if (pts.current.size === 1) gesture.current = { mode: 'pending', id: e.pointerId, x0: p[0], y0: p[1], v0: viewRef.current }
  }
  const onMove = (e: RPointerEvent) => {
    // A mouse press released outside the map never reaches onUp; a move with no button held
    // means it is over — drop it, or every later move reads as a drag and hover bubbles stop.
    if (e.pointerType === 'mouse' && e.buttons === 0 && pts.current.has(e.pointerId)) {
      pts.current.delete(e.pointerId)
      if (pts.current.size === 0) {
        gesture.current = { mode: 'none' }
        setPanning(false)
      }
    }
    const g = gesture.current
    if (pts.current.has(e.pointerId)) {
      const p = local(e)
      pts.current.set(e.pointerId, p)
      if (g.mode === 'pinch') {
        const a = pts.current.get(g.ids[0])
        const b = pts.current.get(g.ids[1])
        if (a && b) setUserView(pinchView(g.v0, g.p0[0], g.p0[1], a, b))
        return
      }
      if (g.mode === 'pending' && g.id === e.pointerId) {
        const dx = p[0] - g.x0
        const dy = p[1] - g.y0
        const intent = e.pointerType === 'mouse' ? (Math.hypot(dx, dy) > 4 ? 'drag' : 'pending') : classifyTouch(dx, dy)
        if (intent === 'scroll') gesture.current = { mode: 'scroll' }
        if (intent !== 'drag') return
        gesture.current = { ...g, mode: 'pan' }
        dragged.current = true
        setPanning(true)
        setHover(null)
        wrap.current?.setPointerCapture?.(e.pointerId)
      }
      const cur = gesture.current
      if (cur.mode === 'pan' && cur.id === e.pointerId) {
        setUserView(panBy(cur.v0, p[0] - cur.x0, p[1] - cur.y0))
        return
      }
    }
    if (e.pointerType !== 'mouse' || g.mode === 'pan') return
    const id = nearest(e)
    if (id) {
      clearTimeout(hideTimer.current)
      setHover(id)
    } else scheduleHide()
  }
  const onUp = (e: RPointerEvent) => {
    if (!pts.current.delete(e.pointerId)) return
    const g = gesture.current
    if (g.mode === 'pinch') dragged.current = true
    if (pts.current.size === 1 && g.mode === 'pinch') {
      // Lifting one finger of a pinch carries on as a pan with the other.
      const [[id, p]] = [...pts.current.entries()]
      startPan(id, p)
      return
    }
    if (pts.current.size === 0) {
      gesture.current = { mode: 'none' }
      setPanning(false)
    }
  }
  const scheduleHide = () => {
    clearTimeout(hideTimer.current)
    hideTimer.current = setTimeout(() => setHover(null), 260)
  }
  const onClick = (e: RMouseEvent) => {
    if (dragged.current) {
      dragged.current = false
      return
    }
    const id = nearest({ clientX: e.clientX, clientY: e.clientY, pointerType: pointerType.current })
    if (pointerType.current === 'mouse') {
      if (id) onChoose(id)
      return
    }
    // Touch / pen: first tap opens the card, a second tap on the same city chooses it.
    if (!id) return setPinned(null)
    if (pinned === id) onChoose(id)
    else setPinned(id)
  }
  const onDoubleClick = (e: RMouseEvent) => {
    const v = viewRef.current
    if (!v || !size || nearest({ clientX: e.clientX, clientY: e.clientY })) return
    const [px, py] = local(e)
    const lim = limits(size.W, size.H, region)
    flyTo(clampView(zoomAt(v, Math.min(lim.kMax, v.k * 2), px, py), size.W, size.H, lim), size.W, size.H, 0.35)
  }

  // Native listeners: wheel and touch need `passive: false` to cancel page scroll / zoom.
  useEffect(() => {
    const el = wrap.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      const v = viewRef.current
      if (!v) return
      if (!(e.ctrlKey || e.metaKey)) {
        flashHint(`${IS_MAC ? '⌘' : 'Ctrl'} + scroll to zoom`)
        return
      }
      e.preventDefault()
      const r = el.getBoundingClientRect()
      setUserView(zoomAt(v, v.k * wheelFactor(e.deltaY, e.deltaMode), e.clientX - r.left, e.clientY - r.top))
    }
    const onTouch = (e: TouchEvent) => {
      const m = gesture.current.mode
      if (e.touches.length >= 2 || m === 'pan' || m === 'pinch') e.preventDefault()
    }
    const onGesture = (e: Event) => e.preventDefault() // iOS Safari page pinch-zoom
    el.addEventListener('wheel', onWheel, { passive: false })
    el.addEventListener('touchstart', onTouch, { passive: false })
    el.addEventListener('touchmove', onTouch, { passive: false })
    el.addEventListener('gesturestart', onGesture)
    return () => {
      el.removeEventListener('wheel', onWheel)
      el.removeEventListener('touchstart', onTouch)
      el.removeEventListener('touchmove', onTouch)
      el.removeEventListener('gesturestart', onGesture)
    }
  }, [setUserView, flashHint])
  useEffect(() => () => clearTimeout(hideTimer.current), [])

  const activeId = pinned ?? hover
  const active = activeId ? (markers.find((m) => m.city.id === activeId) ?? null) : null

  const summary = rows.length
    ? `World map of ${rows.length} cities colored by how often your plan holds. Best: ${rows
        .slice(0, 3)
        .map((r) => `${r.city.name} ${percent(r.successRate)}`)
        .join(', ')}. Use the ranked list below to choose a city with the keyboard.`
    : 'World map of cities, loading the ranking.'

  return (
    <div className={cx('wmap', !rows.length && 'is-loading')} role="group" aria-label={summary}>
      <div
        ref={wrap}
        className={cx('wmap__stage', panning && 'is-panning')}
        style={size ? { height: size.H } : undefined}
        onPointerMove={onMove}
        onPointerDown={onDown}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onPointerLeave={(e) => e.pointerType === 'mouse' && !panning && scheduleHide()}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
      >
        <canvas
          ref={canvas}
          className={cx('wmap__canvas', dots && 'is-ready')}
          style={size ? { width: size.W, height: size.H } : undefined}
          aria-hidden="true"
        />
        {size && view && (
          <svg className="wmap__svg" width={size.W} height={size.H} aria-hidden="true">
            {base.map((m, i) =>
              topIds.includes(m.city.id) ? null : (
                <g key={m.city.id} data-id={m.city.id} transform={`translate(${m.x.toFixed(1)},${m.y.toFixed(1)})`}>
                  <g className="wmap__pop" style={{ ['--d' as string]: `${Math.min(i, 90) * 7}ms` }}>
                    <MarkerShape m={m} homeId={homeId} destId={destId} active={false} compared={compare.includes(m.city.id)} />
                  </g>
                </g>
              ),
            )}
            {topIds.map((id) => {
              const m = visible.find((x) => x.city.id === id)
              if (!m) return null
              return (
                <g key={`top-${id}`} data-id={id} transform={`translate(${m.x.toFixed(1)},${m.y.toFixed(1)})`}>
                  <MarkerShape m={m} homeId={homeId} destId={destId} active={id === activeId} compared={compare.includes(id)} />
                </g>
              )
            })}
            {labels.map((l) => (
              <text key={l.id} className={cx('wmap__label', `is-${l.kind}`)} x={l.x} y={l.y} dy="0.35em" textAnchor={l.anchor}>
                {l.text}
                {l.pct && (
                  <tspan className="wmap__label-pct" dx="5" style={{ fill: successTextColor(byId.get(l.id)!.successRate) }}>
                    {l.pct}
                  </tspan>
                )}
              </text>
            ))}
          </svg>
        )}
        {view && (
          <div
            className="wmap__zoom"
            onPointerDown={(e) => e.stopPropagation()}
            onPointerMove={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            onDoubleClick={(e) => e.stopPropagation()}
          >
            <button type="button" className="wmap__zbtn" aria-label="Zoom in" onClick={() => zoomBy(2)}>
              <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
                <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
            <button type="button" className="wmap__zbtn" aria-label="Zoom out" onClick={() => zoomBy(0.5)}>
              <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
                <path d="M3 8h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
            <button
              type="button"
              className="wmap__zbtn"
              aria-label={region === 'All' ? 'Reset map view' : `Fit ${region}`}
              title={region === 'All' ? 'Reset view' : `Fit ${region}`}
              disabled={!canReset}
              onClick={() => fitTarget && size && flyTo(fitTarget, size.W, size.H, 0.6)}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
                <path
                  d="M2.5 6V2.5H6M10 2.5h3.5V6M13.5 10v3.5H10M6 13.5H2.5V10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        )}
        <AnimatePresence>
          {hint && (
            <motion.div
              key="hint"
              className="wmap__hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              {hint}
            </motion.div>
          )}
        </AnimatePresence>
        {!rows.length && (
          <div className="wmap__loading">
            <span className="pulse-dot" /> Ranking {CITIES.length} cities…
          </div>
        )}
      </div>
      <AnimatePresence>
        {active && size && (
          <CityCard
            key={active.city.id}
            m={active}
            W={size.W}
            H={size.H}
            docked={pinned != null}
            homeId={homeId}
            destId={destId}
            homeSpend={homeSpend}
            compared={compare.includes(active.city.id)}
            compareFull={compare.length >= 3}
            onToggleCompare={() => onToggleCompare(active.city.id)}
            onChoose={() => {
              onChoose(active.city.id)
              setPinned(null)
            }}
            onClose={() => setPinned(null)}
            onEnter={() => clearTimeout(hideTimer.current)}
            onLeave={scheduleHide}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function MarkerShape({
  m,
  homeId,
  destId,
  active,
  compared,
}: {
  m: Marker
  homeId: string
  destId: string | null
  active: boolean
  compared: boolean
}) {
  const id = m.city.id
  const isHome = id === homeId
  const isDest = id === destId
  const fill = m.row ? successColor(m.row.successRate) : 'var(--ink-faint)'
  return (
    <>
      {isDest && (
        <>
          <circle className="wmap__pulse" r={m.r + 4} style={{ stroke: fill }} />
          <circle className="wmap__pulse wmap__pulse--2" r={m.r + 4} style={{ stroke: fill }} />
        </>
      )}
      {isHome ? (
        <>
          <circle className="wmap__home-ring" r={Math.max(7.5, m.r + 3.5)} />
          <circle r={Math.max(3, m.r * 0.55)} className="wmap__home-dot" style={{ fill }} />
        </>
      ) : m.cheaper || isDest ? (
        <circle r={Math.max(m.r, isDest ? 4.5 : 0)} className="wmap__dot" style={{ fill }} />
      ) : (
        <circle r={m.r} className="wmap__ring" style={{ stroke: fill }} />
      )}
      {isDest && <circle r={Math.max(m.r, 4.5) + 2.6} className="wmap__dest-ring" style={{ stroke: fill }} />}
      {compared && <circle r={m.r + (isDest ? 6 : isHome ? 7 : 3.2)} className="wmap__cmp-ring" />}
      {active && <circle r={Math.max(m.r, isHome ? 7.5 : 0) + 5.5} className="wmap__hover-ring" />}
    </>
  )
}

/* ---------------------------------------------------------------- Tooltip card */

function CityCard({
  m,
  W,
  H,
  docked,
  homeId,
  destId,
  homeSpend,
  compared,
  compareFull,
  onToggleCompare,
  onChoose,
  onClose,
  onEnter,
  onLeave,
}: {
  m: Marker
  W: number
  H: number
  docked: boolean
  homeId: string
  destId: string | null
  homeSpend: number
  compared: boolean
  compareFull: boolean
  onToggleCompare: () => void
  onChoose: () => void
  onClose: () => void
  onEnter: () => void
  onLeave: () => void
}) {
  const { city, row } = m
  const CW = 264
  const isHome = city.id === homeId
  const isDest = city.id === destId
  const fx = rate(city.currency)
  const spend = row?.spendUsd ?? homeSpend
  let style: CSSProperties | undefined
  if (!docked) {
    const right = m.x + m.r + 16 + CW < W
    const left = right ? m.x + m.r + 14 : Math.max(8, m.x - m.r - 14 - CW)
    const top = Math.min(Math.max(8, m.y - 70), Math.max(8, H - 200))
    style = { left, top, width: CW }
  }
  return (
    <motion.div
      className={cx('city-card', docked && 'is-docked')}
      style={style}
      initial={{ opacity: 0, y: docked ? 12 : 4, scale: docked ? 1 : 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: docked ? 12 : 4, scale: docked ? 1 : 0.97, transition: { duration: 0.14 } }}
      transition={{ duration: 0.22, ease }}
      onPointerEnter={onEnter}
      onPointerLeave={(e) => e.pointerType === 'mouse' && onLeave()}
      onPointerMove={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="city-card__head">
        <CodeChip code={city.countryCode} />
        <div className="city-card__name">
          <b>{city.name}</b>
          <span>{city.country}</span>
        </div>
        {row && (
          <span className="city-card__rank num" title="Rank by odds">
            #{row.rank}
          </span>
        )}
        {docked && (
          <button type="button" className="icon-btn city-card__close" aria-label="Close" onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>
      {row ? (
        <>
          <div className="city-card__odds">
            <span className="city-card__pct" style={{ color: successTextColor(row.successRate) }}>
              {Math.round(row.successRate * 100)}
              <i>%</i>
            </span>
            <span className="city-card__odds-l">of futures hold with no forced sale</span>
          </div>
          <div className="city-card__bar">
            <i style={{ width: `${row.successRate * 100}%`, background: successColor(row.successRate) }} />
          </div>
          <dl className="city-card__facts">
            <div>
              <dt>A year</dt>
              <dd className="num">
                {currency(spend)}
                {fx && city.currency !== 'USD' && <small>≈ {localCompact(spend * fx, city.currency)}</small>}
              </dd>
            </div>
            <div>
              <dt>Vs home</dt>
              <dd className={cx('num', row.costRatio < 0.995 && 'is-down', row.costRatio > 1.005 && 'is-up')}>
                {isHome ? 'home' : costDelta(row.costRatio)}
                <small>
                  {isHome
                    ? currencyCompact(homeSpend)
                    : `${currencyCompact(Math.abs(spend - homeSpend))} ${spend < homeSpend ? 'less' : 'more'}`}
                </small>
              </dd>
            </div>
          </dl>
        </>
      ) : (
        <p className="t-small ink-3">Ranking…</p>
      )}
      <div className="city-card__actions">
        <button
          type="button"
          className={cx('chip-btn', compared && 'is-on')}
          onClick={onToggleCompare}
          disabled={!compared && compareFull}
          aria-pressed={compared}
          title={!compared && compareFull ? 'Compare holds up to 3 cities' : undefined}
        >
          {compared ? '✓ Comparing' : '+ Compare'}
        </button>
        {isHome ? (
          <span className="city-card__tag">Your home{destId ? '' : ' · staying'}</span>
        ) : isDest ? (
          <span className="city-card__tag is-dest">Your destination</span>
        ) : (
          <button type="button" className="btn btn--primary btn--sm" onClick={onChoose}>
            Make destination
          </button>
        )}
      </div>
      {!docked && !isHome && !isDest && <div className="city-card__hint">or click the dot</div>}
    </motion.div>
  )
}
