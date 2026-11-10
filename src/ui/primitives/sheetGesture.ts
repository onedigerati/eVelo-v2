/**
 * Swipe-to-close rules for the bottom `Sheet`.
 *
 * Besides the handle, a touch anywhere on a bottom sheet can pull it down — but only when that
 * would not steal a scroll: the finger must move mostly downward and every scroller under it
 * must already be at the top. Upward swipes scroll, horizontal swipes (photo carousels, sliders)
 * belong to the content, and a swipe that becomes a sheet drag stays one until the finger lifts.
 * The release rule is shared with the handle's framer-motion drag.
 */
import { TOUCH_SLOP } from './sliderGesture'

/** Movement (px) before a touch on the sheet is classified. Same slop as the sliders. */
export const SHEET_SLOP = TOUCH_SLOP
/** Release past this downward distance (px) closes the sheet. */
export const CLOSE_DISTANCE = 110
/** Release faster than this downward speed (px/s) closes the sheet. */
export const CLOSE_VELOCITY = 550
/** Only touch samples this recent (ms) count toward the release velocity. */
export const VELOCITY_WINDOW = 100

/** 'sheet' = drag the sheet; 'scroll' = native vertical scroll; 'horizontal' = leave to content. */
export type SheetTouchIntent = 'pending' | 'sheet' | 'scroll' | 'horizontal'

/**
 * Classify a touch on the sheet from its displacement since touch-down (dy > 0 = finger moved
 * down) and whether the content under it is scrolled to the top. Ties (45°) go to vertical.
 */
export function classifySheetTouch(dx: number, dy: number, atTop: boolean, slop = SHEET_SLOP): SheetTouchIntent {
  const ax = Math.abs(dx)
  const ay = Math.abs(dy)
  if (Math.max(ax, ay) < slop) return 'pending'
  if (ax > ay) return 'horizontal'
  return dy > 0 && atTop ? 'sheet' : 'scroll'
}

/** The sheet follows the finger down 1:1 and never rises above its resting place. */
export function sheetOffset(dy: number): number {
  return Math.max(0, dy)
}

/** Same rule as the handle: far enough or fast enough downward closes; otherwise spring back. */
export function shouldCloseSheet(distance: number, velocity: number): boolean {
  return distance > CLOSE_DISTANCE || velocity > CLOSE_VELOCITY
}

export interface TouchSample {
  /** Timestamp, ms. */
  t: number
  /** Finger position on the drag axis, px. */
  y: number
}

/**
 * Release velocity (px/s) from the samples within `VELOCITY_WINDOW` ms of the last one —
 * like framer-motion's PanInfo velocity, so a slow drag that ends in a stop reads ~0.
 */
export function releaseVelocity(samples: readonly TouchSample[], window = VELOCITY_WINDOW): number {
  if (samples.length < 2) return 0
  const last = samples[samples.length - 1]
  let first = last
  for (let i = samples.length - 2; i >= 0; i--) {
    if (last.t - samples[i].t > window) break
    first = samples[i]
  }
  const dt = last.t - first.t
  return dt > 0 ? ((last.y - first.y) / dt) * 1000 : 0
}
