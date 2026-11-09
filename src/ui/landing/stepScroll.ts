// Where to scroll when a step button is pressed, so the visitor sees the beat it chose. Pure: all
// positions are in document coordinates (rect.top + scrollY), so a scroll already in flight (the
// page scrolls smoothly; a Tab moves focus and scrolls too) doesn't change the answer.

interface Span {
  top: number
  bottom: number
}

interface StepScrollInput {
  /** Current scroll position (may be mid-flight). */
  scrollY: number
  /** Viewport height. */
  viewport: number
  /** Largest scroll position the page allows. */
  maxScroll: number
  /** The card's chart and the pressed step, in document coordinates. */
  chart: Span
  step: Span
  /** Space kept between them and the viewport's edges (room for the focus ring). */
  margin?: number
}

interface StepScrollTarget {
  /** Scroll position to go to (equal to scrollY when nothing needs to move). */
  top: number
  /** Whether the pressed step is at least partly on screen there. */
  stepVisible: boolean
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

/** Least share of the chart that must show beside the pressed step when the whole chart can't. */
const CHART_MIN_SHARE = 0.5

/**
 * The smallest scroll from where the page is that shows:
 * 1. the chart and the pressed step together, if they fit;
 * 2. else the whole step and at least half the chart (the chart sits above the steps), as much of
 *    it as the step allows (a short desktop window with the stacked card);
 * 3. else (a phone, where the steps sit far below the chart) the whole chart, or its top if the
 *    chart is taller than the screen; the step is then off screen and `stepVisible` says so.
 */
export function stepScrollTarget({ scrollY, viewport, maxScroll, chart, step, margin = 12 }: StepScrollInput): StepScrollTarget {
  const m = margin
  const nearest = (lo: number, hi: number) => clamp(scrollY, lo, hi)
  const both = { top: Math.min(chart.top, step.top), bottom: Math.max(chart.bottom, step.bottom) }
  let top: number
  if (both.bottom - both.top + 2 * m <= viewport) {
    // Positions where both are fully on screen: their foot at the viewport's foot … their head at its head.
    top = nearest(both.bottom + m - viewport, both.top - m)
  } else {
    // The step fully on screen, and the chart (above it) at least half on screen.
    const lo = step.bottom + m - viewport
    const hi = Math.floor(Math.min(step.top - m, chart.top + (chart.bottom - chart.top) * (1 - CHART_MIN_SHARE) - m))
    if (chart.bottom <= step.top && lo <= hi) top = nearest(lo, hi)
    else {
      const clo = chart.bottom + m - viewport
      const chi = chart.top - m
      top = clo <= chi ? nearest(clo, chi) : chi
    }
  }
  top = Math.round(clamp(top, 0, Math.max(0, maxScroll)))
  return { top, stepVisible: step.bottom > top && step.top < top + viewport }
}
