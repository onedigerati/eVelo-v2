import type { Tone } from './primitives/Badge'

/**
 * Verdict levels for a success rate (P(no forced sale and solvent)):
 *   >= 80%  holds · 65–80% mostly holds · 45–65% fragile · < 45% breaks in most futures.
 */
export type VerdictLevel = 'holds' | 'mostly' | 'fragile' | 'breaks'

export const VERDICT_THRESHOLDS = { holds: 0.8, mostly: 0.65, fragile: 0.45 } as const

export function verdictLevel(rate: number): VerdictLevel {
  // Classify the whole percent the user sees, so "80%" never reads "mostly holds".
  const success = Math.round(rate * 100) / 100
  return success >= VERDICT_THRESHOLDS.holds
    ? 'holds'
    : success >= VERDICT_THRESHOLDS.mostly
      ? 'mostly'
      : success >= VERDICT_THRESHOLDS.fragile
        ? 'fragile'
        : 'breaks'
}

/** Discrete semantic tone (badges, classes). "Mostly holds" still reads as holding. */
export function toneFor(success: number): Exclude<Tone, 'neutral'> {
  const l = verdictLevel(success)
  return l === 'holds' || l === 'mostly' ? 'holds' : l === 'fragile' ? 'bruised' : 'broken'
}

/** Short label for the level, e.g. for badges. */
export function toneLabel(success: number): string {
  return { holds: 'Holds', mostly: 'Mostly holds', fragile: 'Fragile', breaks: 'Breaks' }[verdictLevel(success)]
}
