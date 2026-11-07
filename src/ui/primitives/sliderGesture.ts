/**
 * Pointer-to-value and touch-intent helpers for `Slider`.
 *
 * A native range input changes its value the instant a finger lands on it, before the browser
 * knows whether the user meant to scroll. On a phone that turns every scroll that starts on a
 * slider into an accidental edit. `Slider` therefore handles pointers itself: mice move the
 * value at once (as before), while touch waits until the first few pixels of movement show a
 * horizontal drag, and a plain tap commits on lift.
 */

/** Movement (px) before a touch is classified as a drag or a scroll. */
export const TOUCH_SLOP = 8

export type TouchIntent = 'pending' | 'drag' | 'scroll'

/**
 * Classify a touch from its displacement since touch-down. Horizontal-dominant movement past
 * the slop is a drag; anything else past the slop (vertical, or a 45° diagonal) is a scroll.
 */
export function classifyTouch(dx: number, dy: number, slop = TOUCH_SLOP): TouchIntent {
  const ax = Math.abs(dx)
  const ay = Math.abs(dy)
  if (Math.max(ax, ay) < slop) return 'pending'
  return ax > ay ? 'drag' : 'scroll'
}

function decimals(n: number): number {
  const s = String(n)
  const e = s.indexOf('e-')
  if (e >= 0) return Number(s.slice(e + 2))
  const dot = s.indexOf('.')
  return dot < 0 ? 0 : s.length - dot - 1
}

/** Snap to the step grid anchored at `min`, clamped to [min, max] (like a native range). */
export function snapToStep(v: number, min: number, max: number, step: number): number {
  if (!(max > min)) return min
  const clamped = Math.min(max, Math.max(min, v))
  if (!(step > 0)) return clamped
  const places = Math.max(decimals(step), decimals(min))
  const round = (x: number) => Number(x.toFixed(places))
  let snapped = round(min + Math.round((clamped - min) / step) * step)
  // A max off the step grid: the highest reachable value is the last step below it.
  if (snapped > max) snapped = round(min + Math.floor((max - min) / step) * step)
  return snapped
}

/**
 * Value under a pointer at `x` (client px) on a track starting at `left` with width `width`.
 * Matches the native thumb geometry: the thumb's centre runs from thumb/2 to width − thumb/2.
 */
export function valueAtPointer(
  x: number,
  left: number,
  width: number,
  thumb: number,
  min: number,
  max: number,
  step: number,
): number {
  const run = width - thumb
  const pct = run > 0 ? (x - left - thumb / 2) / run : 0
  return snapToStep(min + Math.min(1, Math.max(0, pct)) * (max - min), min, max, step)
}
