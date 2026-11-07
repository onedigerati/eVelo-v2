/**
 * The landing's decorative field: seeded random-walk paths, as drawn on study C ("Escape
 * velocity", boards Escape / EscapeLight). Same generator (Park–Miller + Box–Muller) and constants
 * as the study, so the picture has its character and is identical on every load. Decorative only,
 * not engine output.
 *
 * Seed: the study's seed 7 yields no broken walk at all (57 hold, 7 bruised), so the field never
 * showed the margin-call story it is meant to tell. FIELD_SEED was picked from a scan of seeds
 * for 3 broken walks that end right of the text column and a handful of bruised ones.
 *
 * Coordinates are in a 1440 x 1000 viewBox. Each walk starts at (0, Y0) and drifts upward;
 * a walk that falls below BREAK (the margin-call line) stops there and is "broken", one whose
 * low point fell below BRUISE is "bruised", the rest "hold".
 */

export type PathKind = 'holds' | 'bruised' | 'broken'

export interface FieldPath {
  /** SVG path data. */
  d: string
  kind: PathKind
  /** Draw-in delay in seconds (staggered by index). */
  delay: number
  /** Last point (where a broken path gets its dot). */
  end: { x: number; y: number }
}

export interface Field {
  width: number
  height: number
  paths: FieldPath[]
  /** y of the start dot. */
  startY: number
  /** y of the dashed margin-call line. */
  thresholdY: number
}

export const FIELD_W = 1440
export const FIELD_H = 1000
const N = 64
const STEPS = 120
const Y0 = 720
const K = 260
const BREAK = -0.42
const BRUISE = -0.24
const DRIFT = 0.0105
const VOL = 0.05

/** Park–Miller minimal standard generator, as in the study. */
function lcg(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

/** See the header comment. */
export const FIELD_SEED = 2815

export function makeField(seed = FIELD_SEED): Field {
  const rnd = lcg(seed)
  const gauss = () => {
    const u = rnd() || 1e-9
    const v = rnd()
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
  }
  const X = FIELD_W / STEPS
  const paths: FieldPath[] = []
  for (let i = 0; i < N; i++) {
    let v = 0
    let low = 0
    let d = `M0 ${Y0}`
    let broke = false
    let end = { x: 0, y: Y0 }
    for (let s = 1; s <= STEPS; s++) {
      v += DRIFT + VOL * gauss()
      low = Math.min(low, v)
      const x = +(s * X).toFixed(1)
      const y = +(Y0 - v * K).toFixed(1)
      d += `L${x.toFixed(1)} ${y.toFixed(1)}`
      end = { x, y }
      if (v < BREAK) {
        broke = true
        break
      }
    }
    const kind: PathKind = broke ? 'broken' : low < BRUISE ? 'bruised' : 'holds'
    paths.push({ d, kind, delay: +(i * 0.025).toFixed(3), end })
  }
  return { width: FIELD_W, height: FIELD_H, paths, startY: Y0, thresholdY: Y0 - BREAK * K }
}

/** The landing's field, computed once at module load. */
export const FIELD = makeField()
