import { describe, expect, it } from 'vitest'
import {
  PILL_DELTA_INIT,
  deltaLabel,
  pillDeltaOnExpire,
  pillDeltaOnValue,
  verdictDelta,
  type PillDeltaState,
} from '../pillDelta'

const feed = (values: (number | null)[], s: PillDeltaState = PILL_DELTA_INIT) =>
  values.reduce(pillDeltaOnValue, s)

describe('verdictDelta', () => {
  it('returns the whole-point change', () => {
    expect(verdictDelta(0.72, 0.78)).toBe(6)
    expect(verdictDelta(0.78, 0.75)).toBe(-3)
  })

  it('rounds each verdict to a whole percent before subtracting', () => {
    expect(verdictDelta(0.724, 0.776)).toBe(6) // 72 -> 78, not 5.2
    expect(verdictDelta(0.704, 0.716)).toBe(2) // 70 -> 72, not 1.2
  })

  it('is null when the rounded change is 0', () => {
    expect(verdictDelta(0.701, 0.704)).toBeNull()
    expect(verdictDelta(0.5, 0.5)).toBeNull()
  })

  it('is null when either side is missing or non-finite', () => {
    expect(verdictDelta(null, 0.5)).toBeNull()
    expect(verdictDelta(0.5, null)).toBeNull()
    expect(verdictDelta(NaN, 0.5)).toBeNull()
    expect(verdictDelta(0.5, Infinity)).toBeNull()
  })
})

describe('deltaLabel', () => {
  it('signs gains with a plus', () => {
    expect(deltaLabel(6)).toBe('+6 pts')
  })

  it('uses a true minus sign (U+2212) for losses', () => {
    expect(deltaLabel(-3)).toBe('−3 pts')
    expect(deltaLabel(-3)).not.toContain('-')
  })
})

describe('pill delta state', () => {
  it('does not flash for the first result', () => {
    const s = feed([0.72])
    expect(s.delta).toBeNull()
    expect(s.base).toBe(0.72)
  })

  it('flashes the change, then settles on expiry', () => {
    const s = feed([0.72, 0.78])
    expect(s.delta).toBe(6)
    const done = pillDeltaOnExpire(s, s.seq)
    expect(done.delta).toBeNull()
    expect(done.base).toBe(0.78)
  })

  it('does not flash when the rounded percent is unchanged', () => {
    const s = feed([0.721, 0.723])
    expect(s.delta).toBeNull()
    expect(s.seq).toBe(0)
  })

  it('accumulates quick successive changes from the value settled before the flash', () => {
    const first = feed([0.72, 0.76])
    expect(first.delta).toBe(4)
    const second = pillDeltaOnValue(first, 0.78)
    expect(second.delta).toBe(6)
    expect(second.seq).toBeGreaterThan(first.seq) // timer restarts
  })

  it('measures from the new value once a flash has expired', () => {
    let s = feed([0.72, 0.76])
    s = pillDeltaOnExpire(s, s.seq)
    s = pillDeltaOnValue(s, 0.78)
    expect(s.delta).toBe(2)
  })

  it('ends the flash when quick changes net to 0 points', () => {
    const s = feed([0.72, 0.76, 0.72])
    expect(s.delta).toBeNull()
    expect(s.base).toBe(0.72)
  })

  it('keeps the reference through a null result and flashes when it returns', () => {
    const s = feed([0.72, null, 0.78])
    expect(s.delta).toBe(6)
  })

  it('keeps an in-progress flash through a null result', () => {
    const s = feed([0.72, 0.76])
    expect(pillDeltaOnValue(s, null)).toBe(s)
    expect(pillDeltaOnValue(s, NaN)).toBe(s)
  })

  it('ignores a repeat of the latest value', () => {
    const s = feed([0.72, 0.78])
    expect(pillDeltaOnValue(s, 0.78)).toBe(s)
  })

  it('ignores a timer from a flash that has since restarted', () => {
    const first = feed([0.72, 0.76])
    const second = pillDeltaOnValue(first, 0.78)
    expect(pillDeltaOnExpire(second, first.seq)).toBe(second)
  })
})
