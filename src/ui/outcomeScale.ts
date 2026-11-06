// The one outcome color scale: success rate -> color. Used by the Atlas (list, map, tiles,
// compare), the Outlook verdict and anywhere a success rate is colored.
//
// Piecewise between theme tokens --ramp-0..4 (tokens.css). Adjacent stops are hue-neighbours
// (coral -> ember -> brass, jade -> verdigris), so mixing never passes through the muddy
// olive a brass -> green blend makes. The scale steps from brass to jade at 65%, the line
// between "fragile" and "mostly holds" (see verdict.ts).

/** [success, stop index]. Two entries at the same success = a hard step. */
const STOPS: [number, number][] = [
  [0.3, 0],
  [0.45, 1],
  [0.6, 2],
  [0.65, 2],
  [0.65, 3],
  [0.8, 4],
]

export const RAMP_MIN = STOPS[0][0]
export const RAMP_MAX = STOPS[STOPS.length - 1][0]

/** Segment for a success rate: mix `f` (0..1) of stop `b` into stop `a`. */
export function rampSegment(success: number): { a: number; b: number; f: number } {
  const s = Number.isFinite(success) ? success : 0
  if (s <= STOPS[0][0]) return { a: STOPS[0][1], b: STOPS[0][1], f: 0 }
  for (let i = 1; i < STOPS.length; i++) {
    const [s1, b] = STOPS[i]
    const [s0, a] = STOPS[i - 1]
    // Strictly below the next stop (so a value exactly on a step takes the upper color).
    if (s < s1) return { a, b, f: s1 > s0 ? (s - s0) / (s1 - s0) : 1 }
  }
  const last = STOPS[STOPS.length - 1][1]
  return { a: last, b: last, f: 0 }
}

function css(success: number, suffix: '' | '-text'): string {
  const { a, b, f } = rampSegment(success)
  if (a === b || f <= 0) return `var(--ramp-${a}${suffix})`
  if (f >= 1) return `var(--ramp-${b}${suffix})`
  return `color-mix(in oklch, var(--ramp-${b}${suffix}) ${(f * 100).toFixed(1)}%, var(--ramp-${a}${suffix}))`
}

/** Fill / stroke color for a success rate (theme-aware CSS). */
export const outcomeColor = (success: number) => css(success, '')
/** Text-safe color for a success rate (uses the *-text stops). */
export const outcomeTextColor = (success: number) => css(success, '-text')

/** CSS linear-gradient of the scale from RAMP_MIN to RAMP_MAX, for legends. */
export function outcomeGradient(dir = '90deg'): string {
  const span = RAMP_MAX - RAMP_MIN
  const parts = STOPS.map(([s, i]) => `var(--ramp-${i}) ${(((s - RAMP_MIN) / span) * 100).toFixed(1)}%`)
  return `linear-gradient(${dir}, ${parts.join(', ')})`
}

type RGB = [number, number, number]
/** Canvas helper: interpolate parsed stop colors (index 0..4) for a success rate. */
export function outcomeRgb(stops: RGB[], success: number): RGB {
  const { a, b, f } = rampSegment(success)
  const A = stops[a]
  const B = stops[b]
  return [A[0] + (B[0] - A[0]) * f, A[1] + (B[1] - A[1]) * f, A[2] + (B[2] - A[2]) * f]
}
