import { describe, expect, it } from 'vitest'
import { READOUT_GAP, readoutLeft } from '../chartReadout'

describe('readoutLeft', () => {
  it('sits right of the crosshair when it fits', () => {
    expect(readoutLeft(100, 800, 200)).toBe(100 + READOUT_GAP)
  })
  it('flips left near the right edge', () => {
    expect(readoutLeft(700, 800, 200)).toBe(700 - READOUT_GAP - 200)
  })
  it('stays inside a 390px phone plot at both ends and in the middle', () => {
    for (const x of [0, 60, 175, 195, 250, 358]) {
      const l = readoutLeft(x, 358, 220)
      expect(l).toBeGreaterThanOrEqual(0)
      expect(l + 220).toBeLessThanOrEqual(358)
    }
  })
  it('pins at 0 when the readout is wider than the plot', () => {
    expect(readoutLeft(50, 150, 200)).toBe(0)
  })
  it('is 0 before it has been measured', () => {
    expect(readoutLeft(100, 800, 0)).toBe(0)
    expect(readoutLeft(100, 0, 200)).toBe(0)
  })
})
