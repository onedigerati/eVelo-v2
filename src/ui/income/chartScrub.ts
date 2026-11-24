// The walkthrough chart as the year scrubber (WalkthroughChart.tsx): which row a key moves to, what
// a touch pointer is doing (a tap, a sideways scrub or a vertical scroll), and the slider's value
// text. Pure, so the rules are tested apart from the DOM.

/** How many rows PageUp / PageDown move. */
export const PAGE_ROWS = 5

/** The row a key moves to from `year` over `n` rows, or null for a key the chart doesn't take.
 *  Slider keys: Left/Down a year back, Right/Up a year on, PageDown/PageUp a few years, Home/End the
 *  ends. */
export function rowForKey(key: string, year: number, n: number): number | null {
  if (n <= 0) return null
  const to = (r: number) => Math.max(0, Math.min(n - 1, r))
  switch (key) {
    case 'ArrowLeft':
    case 'ArrowDown':
      return to(year - 1)
    case 'ArrowRight':
    case 'ArrowUp':
      return to(year + 1)
    case 'PageDown':
      return to(year - PAGE_ROWS)
    case 'PageUp':
      return to(year + PAGE_ROWS)
    case 'Home':
      return 0
    case 'End':
      return n - 1
    default:
      return null
  }
}

/** A touch pointer's gesture: still a tap, a sideways scrub, or a vertical scroll (the page's). */
export type Gesture = 'tap' | 'scrub' | 'scroll'

/** How far (px, along either axis) a touch moves before its direction locks. */
export const LOCK_PX = 8

/** The gesture after a move of (dx, dy) from the pointer's start. Once locked it stays locked; until
 *  it has moved `lock` px along either axis it's a tap; then mostly sideways (|dx| > |dy|) scrubs and
 *  anything else scrolls. */
export function gestureOf(dx: number, dy: number, was: Gesture = 'tap', lock = LOCK_PX): Gesture {
  if (was !== 'tap') return was
  const ax = Math.abs(dx), ay = Math.abs(dy)
  if (!(Math.max(ax, ay) >= lock)) return 'tap'
  return ax > ay ? 'scrub' : 'scroll'
}

/** The slider's value text for row `i` of `n`, at the end of `age`. */
export const yearValueText = (age: number, i: number, n: number) => `End of age ${age}, year ${i + 1} of ${n}`
