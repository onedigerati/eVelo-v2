import { describe, expect, it } from 'vitest'
import { classifyTouch, snapToStep, TOUCH_SLOP, valueAtPointer } from '../sliderGesture'

describe('classifyTouch', () => {
  it('stays pending inside the slop', () => {
    expect(classifyTouch(0, 0)).toBe('pending')
    expect(classifyTouch(TOUCH_SLOP - 1, -(TOUCH_SLOP - 1))).toBe('pending')
  })
  it('treats vertical movement as a scroll, even with some sideways drift', () => {
    expect(classifyTouch(0, 12)).toBe('scroll')
    expect(classifyTouch(5, -20)).toBe('scroll')
    expect(classifyTouch(-9, 10)).toBe('scroll')
  })
  it('treats an exact diagonal as a scroll (the page wins ties)', () => {
    expect(classifyTouch(10, 10)).toBe('scroll')
  })
  it('treats horizontal movement as a drag', () => {
    expect(classifyTouch(9, 0)).toBe('drag')
    expect(classifyTouch(-14, 6)).toBe('drag')
  })
})

describe('snapToStep', () => {
  it('snaps to the grid anchored at min and clamps', () => {
    expect(snapToStep(7.4, 0, 100, 5)).toBe(5)
    expect(snapToStep(7.6, 0, 100, 5)).toBe(10)
    expect(snapToStep(-3, 0, 100, 5)).toBe(0)
    expect(snapToStep(140, 0, 100, 5)).toBe(100)
    expect(snapToStep(54, 2, 100, 5)).toBe(52)
  })
  it('avoids float noise on decimal steps', () => {
    expect(snapToStep(0.30000000004, 0, 1, 0.1)).toBe(0.3)
    expect(snapToStep(3.14159, 0, 10, 0.25)).toBe(3.25)
    expect(snapToStep(0.0123, 0, 0.1, 0.005)).toBe(0.01)
  })
  it('caps at the last step below an off-grid max', () => {
    expect(snapToStep(99, 0, 99, 10)).toBe(90)
  })
  it('handles degenerate ranges', () => {
    expect(snapToStep(5, 3, 3, 1)).toBe(3)
  })
})

describe('valueAtPointer', () => {
  // Track at x = 100, 222px wide, 22px thumb → thumb centre runs 111..311 (200px run).
  const at = (x: number, step = 1) => valueAtPointer(x, 100, 222, 22, 0, 100, step)
  it('maps the thumb-centre run linearly onto the range', () => {
    expect(at(111)).toBe(0)
    expect(at(211)).toBe(50)
    expect(at(311)).toBe(100)
    expect(at(161, 5)).toBe(25)
  })
  it('clamps past either end of the track', () => {
    expect(at(0)).toBe(0)
    expect(at(105)).toBe(0)
    expect(at(320)).toBe(100)
    expect(at(1000)).toBe(100)
  })
})
