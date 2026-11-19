// Where a chart readout sits beside its crosshair: to the right of the hovered x when it fits, else
// to the left, else clamped inside the plot. Shared by the mode's two charts (IncomeChart,
// CompareChart) so a readout never leaves the plot, and so the page never scrolls sideways on a phone.

/** Space between the crosshair and the readout's near edge, px. */
export const READOUT_GAP = 14

/**
 * The readout's left edge, px from the plot's left, for a crosshair at `x` in a plot `width` wide
 * and a readout `box` wide. Right of x if it fits, else left of x if that fits, else clamped to
 * [0, width − box] (pinned at 0 when the readout is wider than the plot).
 */
export function readoutLeft(x: number, width: number, box: number, gap = READOUT_GAP): number {
  if (!(width > 0) || !(box > 0)) return 0
  const right = x + gap
  if (right + box <= width) return right
  const left = x - gap - box
  if (left >= 0) return left
  return Math.max(0, Math.min(width - box, x - box / 2))
}
