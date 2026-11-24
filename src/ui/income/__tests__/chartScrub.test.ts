import { describe, expect, it } from 'vitest'
import { gestureOf, LOCK_PX, PAGE_ROWS, rowForKey, yearValueText } from '../chartScrub'

describe('rowForKey', () => {
  it('arrows step a year, either axis, clamped to the rows', () => {
    expect(rowForKey('ArrowLeft', 5, 10)).toBe(4)
    expect(rowForKey('ArrowDown', 5, 10)).toBe(4)
    expect(rowForKey('ArrowRight', 5, 10)).toBe(6)
    expect(rowForKey('ArrowUp', 5, 10)).toBe(6)
    expect(rowForKey('ArrowLeft', 0, 10)).toBe(0)
    expect(rowForKey('ArrowUp', 9, 10)).toBe(9)
  })
  it('PageUp / PageDown move a few years, clamped', () => {
    expect(PAGE_ROWS).toBe(5)
    expect(rowForKey('PageUp', 2, 30)).toBe(7)
    expect(rowForKey('PageDown', 12, 30)).toBe(7)
    expect(rowForKey('PageDown', 3, 30)).toBe(0)
    expect(rowForKey('PageUp', 27, 30)).toBe(29)
  })
  it('Home and End jump to the ends; other keys and no rows are not taken', () => {
    expect(rowForKey('Home', 5, 10)).toBe(0)
    expect(rowForKey('End', 5, 10)).toBe(9)
    expect(rowForKey('Enter', 5, 10)).toBeNull()
    expect(rowForKey(' ', 5, 10)).toBeNull()
    expect(rowForKey('Home', 0, 0)).toBeNull()
  })
})

describe('gestureOf', () => {
  it('stays a tap until the touch moves the lock distance along either axis', () => {
    expect(LOCK_PX).toBe(8)
    expect(gestureOf(0, 0)).toBe('tap')
    expect(gestureOf(7, 7)).toBe('tap')
    expect(gestureOf(-7.9, 3)).toBe('tap')
  })
  it('then mostly sideways scrubs and mostly vertical (or a tie) scrolls, either direction', () => {
    expect(gestureOf(8, 0)).toBe('scrub')
    expect(gestureOf(-12, 9)).toBe('scrub')
    expect(gestureOf(3, 8)).toBe('scroll')
    expect(gestureOf(-9, -10)).toBe('scroll')
    expect(gestureOf(9, 9)).toBe('scroll')
  })
  it('locks: a scrub stays a scrub and a scroll a scroll whatever the later moves', () => {
    expect(gestureOf(0, 40, 'scrub')).toBe('scrub')
    expect(gestureOf(40, 0, 'scroll')).toBe('scroll')
    expect(gestureOf(0, 0, 'scrub')).toBe('scrub')
  })
  it('takes another lock distance', () => {
    expect(gestureOf(10, 0, 'tap', 12)).toBe('tap')
    expect(gestureOf(12, 0, 'tap', 12)).toBe('scrub')
  })
  it('a non-finite move stays a tap', () => {
    expect(gestureOf(Number.NaN, Number.NaN)).toBe('tap')
  })
})

describe('yearValueText', () => {
  it('names the age whose end is shown and the year of the horizon', () => {
    expect(yearValueText(63, 3, 30)).toBe('End of age 63, year 4 of 30')
    expect(yearValueText(58, 0, 1)).toBe('End of age 58, year 1 of 1')
  })
})
