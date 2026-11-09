import { describe, expect, it } from 'vitest'
import { BEATS, COPY, DEST, YEARS } from '../story'
import { chartGeometry, frameCopy, NARROW, REST_FRAME, VMAX, WIDE } from '../storyLayout'

describe('story card geometry', () => {
  for (const L of [WIDE, NARROW]) {
    it(`${L.id}: the resting frame draws the Die state inside the viewBox`, () => {
      const g = chartGeometry(L)
      const y = (v: number) => L.YB - (v / VMAX) * (L.YB - L.YT)
      expect(g.bars).toHaveLength(YEARS + 1)
      // Every bar fully grown; the last one reaches the end portfolio.
      expect(g.bars[YEARS].gains.y).toBeCloseTo(y(DEST.atEnd.portfolio), 6)
      // The loan ends at Bangkok's loan; the heirs' column tops out at what heirs keep.
      expect(g.loanHead?.y).toBeCloseTo(y(DEST.atEnd.loan), 1)
      expect(g.estate.heirs.y).toBeCloseTo(y(DEST.atEnd.heirs), 6)
      expect(g.estate.slice.height).toBeCloseTo(y(DEST.atEnd.heirs) - y(DEST.atEnd.portfolio), 6)
      // The slice has lifted clear of the heirs' column and stays inside the viewBox.
      expect(g.estate.slice.x).toBeGreaterThanOrEqual(L.EX + L.EW)
      expect(g.estate.slice.x + g.estate.slice.width).toBeLessThanOrEqual(L.width)
      expect(g.baselineX[1]).toBeLessThanOrEqual(L.width)
      expect(g.yTicks.map((t) => t.label)).toEqual(COPY.axis.yTicks.map((t) => t.label))
    })
  }

  it('the resting frame copy is the Die beat in Bangkok, after the step-up', () => {
    const c = frameCopy(REST_FRAME)
    expect(c.lead).toBe(BEATS[3].lead)
    expect(c.detail).toBe(BEATS[3].detail)
    expect(c.odds).toBe(DEST.odds)
    expect(c.oddsCity).toBe(DEST)
    expect(c.gains).toBe(COPY.key.gainsStepped)
    expect(c.loan).toBe(COPY.key.loanDest)
  })
})
