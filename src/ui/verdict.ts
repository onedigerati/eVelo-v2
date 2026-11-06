import type { Tone } from './primitives/Badge'

/** Headline tone for a success rate. */
export function toneFor(success: number): Exclude<Tone, 'neutral'> {
  return success >= 0.8 ? 'holds' : success >= 0.6 ? 'bruised' : 'broken'
}

/** Short label for the tone, e.g. for badges. */
export function toneLabel(success: number): string {
  return success >= 0.8 ? 'Holds' : success >= 0.6 ? 'Fragile' : 'At risk'
}
