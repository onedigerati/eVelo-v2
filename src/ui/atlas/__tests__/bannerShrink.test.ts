import { describe, expect, it } from 'vitest'
import { COMPACT_AT, EXPAND_AT, compactSpacer, nextCompact, stripHeight } from '../bannerShrink'

describe('nextCompact', () => {
  it('shrinks once scrolled past the threshold, not before', () => {
    expect(nextCompact(false, 0)).toBe(false)
    expect(nextCompact(false, COMPACT_AT)).toBe(false)
    expect(nextCompact(false, COMPACT_AT + 1)).toBe(true)
  })

  it('stays a strip until back at the top (hysteresis)', () => {
    expect(nextCompact(true, COMPACT_AT - 1)).toBe(true)
    expect(nextCompact(true, EXPAND_AT + 1)).toBe(true)
    expect(nextCompact(true, EXPAND_AT)).toBe(false)
    expect(nextCompact(true, 0)).toBe(false)
  })
})

describe('compactSpacer', () => {
  it('is zero when the content still overflows by COMPACT_AT once shrunk', () => {
    expect(compactSpacer(2000, 350)).toBe(0)
    expect(compactSpacer(350 + COMPACT_AT, 350)).toBe(0)
  })

  it('tops a short profile up to COMPACT_AT of scroll', () => {
    // 331px of scroll, the banner gives up 343px: without a spacer the range would vanish.
    const spacer = compactSpacer(331, 343)
    expect(spacer).toBe(72)
    expect(331 - 343 + spacer).toBe(COMPACT_AT)
  })

  it('leaves a shrunk banner shrunk wherever scrollTop clamps (no loop)', () => {
    for (const maxScroll of [COMPACT_AT + 1, 120, 300, 343, 500, 2000]) {
      const saved = 343
      const after = maxScroll - saved + compactSpacer(maxScroll, saved)
      // Shrinking happened at scrollTop > COMPACT_AT; the most it can clamp to is `after`.
      const clamped = Math.min(COMPACT_AT + 1, after)
      expect(nextCompact(true, clamped)).toBe(true)
    }
  })
})

describe('stripHeight', () => {
  it('is 9vw between 170 and 210px', () => {
    expect(stripHeight(1441)).toBe(170)
    expect(stripHeight(2000)).toBe(180)
    expect(stripHeight(2560)).toBe(210)
  })
})
