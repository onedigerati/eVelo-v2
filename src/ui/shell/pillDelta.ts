import { useEffect, useState } from 'react'

/** How long the "+6 pts" flash stays on the pill after the verdict changes. */
export const DELTA_SHOW_MS = 2400

const MINUS = '−'

const pct = (v: number | null | undefined): number | null =>
  v == null || !Number.isFinite(v) ? null : Math.round(v * 100)

/**
 * The change between two verdicts in whole percentage points, or null when there is nothing
 * worth flashing (no previous verdict, either value not finite, or it rounds to 0 pts).
 * Rounds each verdict to a whole percent first, so the flash matches the numbers on screen.
 */
export function verdictDelta(prev: number | null, next: number | null): number | null {
  const a = pct(prev)
  const b = pct(next)
  if (a === null || b === null || a === b) return null
  return b - a
}

/** "+6 pts" / "−3 pts" (true minus sign), from verdictDelta's whole points. */
export function deltaLabel(pts: number): string {
  return `${pts > 0 ? '+' : ''}${String(pts).replace(/-/g, MINUS)} pts`
}

export interface PillDeltaState {
  /** Verdict settled before the current flash began: what deltas are measured from. */
  base: number | null
  /** Latest non-null verdict seen. */
  last: number | null
  /** Change in points on show, or null. */
  delta: number | null
  /** Bumped each time a flash starts or restarts, so the hook can restart its timer. */
  seq: number
}

export const PILL_DELTA_INIT: PillDeltaState = { base: null, last: null, delta: null, seq: 0 }

/**
 * A new verdict arrived. Null (recomputing, no result) changes nothing, so the reference survives
 * a gap and the right delta flashes when a result returns. The first value only sets the
 * reference. A change is measured from `base`, the value settled before any flash in progress,
 * so quick successive edits accumulate (+4 then +2 shows "+6 pts") and restart the flash; if
 * they net to 0 points the flash ends and the new value becomes the reference.
 */
export function pillDeltaOnValue(s: PillDeltaState, value: number | null): PillDeltaState {
  if (value == null || !Number.isFinite(value) || value === s.last) return s
  if (s.last === null) return { ...s, base: value, last: value }
  const delta = verdictDelta(s.base, value)
  if (delta === null) return { base: value, last: value, delta: null, seq: s.seq }
  return { base: s.base, last: value, delta, seq: s.seq + 1 }
}

/** The flash started as `seq` timed out: settle on the latest value. Stale timers are ignored. */
export function pillDeltaOnExpire(s: PillDeltaState, seq: number): PillDeltaState {
  if (seq !== s.seq || s.delta === null) return s
  return { ...s, base: s.last, delta: null }
}

/**
 * Live delta for a pill: the points change from the last settled verdict, shown for
 * DELTA_SHOW_MS after `success` changes, then null. `success` is null while there is no result.
 * A thin wrapper over pillDeltaOnValue / pillDeltaOnExpire; timers are cleared on unmount.
 */
export function usePillDelta(success: number | null): number | null {
  const [state, setState] = useState(PILL_DELTA_INIT)

  useEffect(() => {
    setState((s) => pillDeltaOnValue(s, success))
  }, [success])

  const { delta, seq } = state
  useEffect(() => {
    if (delta === null) return
    const t = setTimeout(() => setState((s) => pillDeltaOnExpire(s, seq)), DELTA_SHOW_MS)
    return () => clearTimeout(t)
  }, [delta, seq])

  return delta
}
