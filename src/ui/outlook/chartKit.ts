// Shared chart plumbing: element size, array tweening, crosshair state, compact axis labels.
import { useReducedMotion } from 'framer-motion'
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type RefObject } from 'react'

/** Content-box size of an element, tracked with ResizeObserver. */
export function useSize<T extends HTMLElement>(): [RefObject<T | null>, { width: number; height: number }] {
  const ref = useRef<T>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => {
      const r = el.getBoundingClientRect()
      setSize((s) => (Math.abs(s.width - r.width) < 0.5 && Math.abs(s.height - r.height) < 0.5 ? s : { width: r.width, height: r.height }))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return [ref, size]
}

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

/** Linear resample of `a` to length n (by normalized position). */
export function resample(a: number[], n: number): number[] {
  if (a.length === n) return a
  if (a.length === 0) return new Array(n).fill(0)
  if (a.length === 1 || n === 1) return new Array(n).fill(a[0])
  const out = new Array<number>(n)
  for (let i = 0; i < n; i++) {
    const p = (i * (a.length - 1)) / (n - 1)
    const lo = Math.floor(p)
    const hi = Math.min(a.length - 1, lo + 1)
    out[i] = a[lo] + (a[hi] - a[lo]) * (p - lo)
  }
  return out
}

/**
 * Tweens a list of numeric series toward `target` whenever its identity changes.
 * `from` (optional) overrides the starting point for a transition (e.g. grow from the axis).
 */
export function useTweenedSeries(target: number[][] | null, opts: { duration?: number; from?: (target: number[][]) => number[][] | null } = {}): number[][] | null {
  const { duration = 520 } = opts
  const reduce = useReducedMotion()
  const [shown, setShown] = useState<number[][] | null>(target)
  const shownRef = useRef<number[][] | null>(target)
  const fromRef = useRef(opts.from)
  fromRef.current = opts.from

  useEffect(() => {
    if (!target) return
    const start = fromRef.current?.(target) ?? shownRef.current
    if (!start || reduce) {
      shownRef.current = target
      setShown(target)
      return
    }
    const a = target.map((s, i) => resample(start[i] ?? s, s.length))
    let raf = 0
    const t0 = performance.now()
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / duration)
      const k = easeInOut(t)
      const frame = target.map((s, i) => s.map((v, j) => a[i][j] + (v - a[i][j]) * k))
      shownRef.current = frame
      setShown(frame)
      if (t < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [target, reduce, duration])

  return shown
}

/** Index-based crosshair driven by pointer (mouse + touch) and keyboard. */
export function useCrosshair(count: number, indexAt: (clientX: number, rect: DOMRect) => number) {
  const [index, setIndex] = useState<number | null>(null)
  const [mode, setMode] = useState<'pointer' | 'key' | null>(null)
  const clamp = useCallback((i: number) => Math.max(0, Math.min(count - 1, i)), [count])

  useEffect(() => {
    setIndex((i) => (i === null ? null : Math.min(i, count - 1)))
  }, [count])

  const fromPointer = (e: PointerEvent<Element>) => {
    const rect = (e.currentTarget as Element).getBoundingClientRect()
    setIndex(clamp(indexAt(e.clientX, rect)))
    setMode('pointer')
  }

  const handlers = {
    onPointerMove: fromPointer,
    onPointerDown: fromPointer,
    onPointerLeave: (e: PointerEvent<Element>) => {
      if (e.pointerType === 'mouse') {
        setIndex(null)
        setMode(null)
      }
    },
    onKeyDown: (e: KeyboardEvent<Element>) => {
      const big = Math.max(1, Math.round(count / 6))
      let next: number | null = null
      const cur = index ?? -1
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') next = cur < 0 ? 0 : cur + 1
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') next = cur < 0 ? count - 1 : cur - 1
      else if (e.key === 'PageUp') next = cur + big
      else if (e.key === 'PageDown') next = cur - big
      else if (e.key === 'Home') next = 0
      else if (e.key === 'End') next = count - 1
      else if (e.key === 'Escape') {
        setIndex(null)
        setMode(null)
        return
      }
      if (next !== null) {
        e.preventDefault()
        setIndex(clamp(next))
        setMode('key')
      }
    },
    onBlur: () => {
      if (mode === 'key') {
        setIndex(null)
        setMode(null)
      }
    },
  }
  return { index, handlers, clear: () => setIndex(null) }
}

/** Compact $ for axis ticks: $0, $500K, $1M, $2.5M, $10M. */
export function moneyTick(v: number): string {
  const a = Math.abs(v)
  const sign = v < 0 ? '−' : ''
  if (a === 0) return '$0'
  if (a >= 1e9) return `${sign}$${trim(a / 1e9)}B`
  if (a >= 1e6) return `${sign}$${trim(a / 1e6)}M`
  if (a >= 1e3) return `${sign}$${trim(a / 1e3)}K`
  return `${sign}$${Math.round(a)}`
}
const trim = (x: number) => (x >= 10 ? String(Math.round(x)) : String(Math.round(x * 10) / 10))

/**
 * Smallest contiguous window of `w` holding at least `share` of its total mass.
 * Returns [start, end] inclusive, or null if the series is empty.
 */
export function massWindow(w: number[], share = 0.6): [number, number] | null {
  const total = w.reduce((a, b) => a + b, 0)
  if (!(total > 0)) return null
  let best: [number, number] | null = null
  let lo = 0
  let sum = 0
  for (let hi = 0; hi < w.length; hi++) {
    sum += w[hi]
    while (lo < hi && sum - w[lo] >= share * total) sum -= w[lo++]
    if (sum >= share * total && (!best || hi - lo < best[1] - best[0])) best = [lo, hi]
  }
  return best
}
