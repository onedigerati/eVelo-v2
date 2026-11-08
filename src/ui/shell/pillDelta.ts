import { useEffect, useRef, useState } from 'react'

/** How long the "+6 pts" flash stays on the pill after the verdict changes. */
export const DELTA_SHOW_MS = 2400

/**
 * The change between two verdicts in whole percentage points, or null when there is nothing
 * worth flashing (no previous verdict, either value not finite, or it rounds to 0 pts).
 * Rounds each verdict to a whole percent first, so the flash matches the numbers on screen.
 */
export function verdictDelta(prev: number | null, next: number | null): number | null {
  void prev
  void next
  return null // TODO(pillDelta agent)
}

/** "+6 pts" / "−3 pts" (true minus sign), from verdictDelta's whole points. */
export function deltaLabel(pts: number): string {
  return `${pts > 0 ? '+' : ''}${pts} pts` // TODO(pillDelta agent)
}

/**
 * Live delta for a pill: the points change from the last settled verdict, shown for
 * DELTA_SHOW_MS after `success` changes, then null. `success` is null while there is no result.
 */
export function usePillDelta(success: number | null): number | null {
  const [shown] = useState<number | null>(null)
  const prev = useRef(success)
  useEffect(() => {
    prev.current = success
  }, [success])
  return shown // TODO(pillDelta agent)
}
