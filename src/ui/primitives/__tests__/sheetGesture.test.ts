import { describe, expect, it } from 'vitest'
import {
  CLOSE_DISTANCE,
  CLOSE_VELOCITY,
  SHEET_SLOP,
  classifySheetTouch,
  releaseVelocity,
  sheetOffset,
  shouldCloseSheet,
} from '../sheetGesture'

describe('classifySheetTouch', () => {
  it('stays pending inside the slop', () => {
    expect(classifySheetTouch(0, 0, true)).toBe('pending')
    expect(classifySheetTouch(SHEET_SLOP - 1, SHEET_SLOP - 1, true)).toBe('pending')
    expect(classifySheetTouch(0, -(SHEET_SLOP - 1), false)).toBe('pending')
  })
  it('drags the sheet on a downward swipe when the content is at the top', () => {
    expect(classifySheetTouch(0, 12, true)).toBe('sheet')
    expect(classifySheetTouch(-6, 10, true)).toBe('sheet')
    expect(classifySheetTouch(10, 10, true)).toBe('sheet') // a 45° tie goes vertical
  })
  it('scrolls on a downward swipe when the content is scrolled down', () => {
    expect(classifySheetTouch(0, 12, false)).toBe('scroll')
    expect(classifySheetTouch(3, 40, false)).toBe('scroll')
  })
  it('always scrolls on an upward swipe', () => {
    expect(classifySheetTouch(0, -12, true)).toBe('scroll')
    expect(classifySheetTouch(4, -20, false)).toBe('scroll')
  })
  it('leaves mostly-horizontal swipes to the content (carousels, sliders)', () => {
    expect(classifySheetTouch(12, 0, true)).toBe('horizontal')
    expect(classifySheetTouch(-14, 9, true)).toBe('horizontal')
    expect(classifySheetTouch(20, -5, false)).toBe('horizontal')
  })
})

describe('sheetOffset', () => {
  it('follows the finger down 1:1 and clamps at the resting place', () => {
    expect(sheetOffset(0)).toBe(0)
    expect(sheetOffset(73)).toBe(73)
    expect(sheetOffset(-40)).toBe(0)
  })
})

describe('shouldCloseSheet', () => {
  it('uses the handle thresholds: 110px or 550px/s', () => {
    expect(CLOSE_DISTANCE).toBe(110)
    expect(CLOSE_VELOCITY).toBe(550)
  })
  it('closes past the distance or on a flick', () => {
    expect(shouldCloseSheet(111, 0)).toBe(true)
    expect(shouldCloseSheet(30, 551)).toBe(true)
  })
  it('springs back on a short, slow swipe or an upward flick', () => {
    expect(shouldCloseSheet(110, 550)).toBe(false)
    expect(shouldCloseSheet(40, 120)).toBe(false)
    expect(shouldCloseSheet(80, -900)).toBe(false)
  })
})

describe('releaseVelocity', () => {
  it('is zero without movement history', () => {
    expect(releaseVelocity([])).toBe(0)
    expect(releaseVelocity([{ t: 0, y: 10 }])).toBe(0)
    expect(releaseVelocity([{ t: 5, y: 10 }, { t: 5, y: 30 }])).toBe(0)
  })
  it('measures px/s over the recent samples', () => {
    const s = [
      { t: 0, y: 0 },
      { t: 16, y: 16 },
      { t: 32, y: 32 },
      { t: 48, y: 48 },
    ]
    expect(releaseVelocity(s)).toBeCloseTo(1000)
  })
  it('ignores samples older than the window, so a drag that stops reads ~0', () => {
    const s = [
      { t: 0, y: 0 },
      { t: 50, y: 150 },
      { t: 300, y: 150 },
    ]
    expect(releaseVelocity(s)).toBe(0)
    // Only the last 100ms count: 20px in 40ms = 500px/s, not the earlier fast part.
    const t = [
      { t: 0, y: 0 },
      { t: 20, y: 200 },
      { t: 200, y: 200 },
      { t: 240, y: 220 },
    ]
    expect(releaseVelocity(t)).toBeCloseTo(500)
  })
})
