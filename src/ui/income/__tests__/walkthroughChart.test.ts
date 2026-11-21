import { describe, expect, it } from 'vitest'
import { netWorthPoints, rowAtX, rowForKey } from '../WalkthroughChart'
import type { WalkYear } from '../walkthrough'

describe('rowAtX', () => {
  it('maps x across the plot to rows, each row one equal slice', () => {
    // plot 100..400 over 30 rows: 10px a row
    expect(rowAtX(100, 100, 400, 30)).toBe(0)
    expect(rowAtX(109.9, 100, 400, 30)).toBe(0)
    expect(rowAtX(110, 100, 400, 30)).toBe(1)
    expect(rowAtX(255, 100, 400, 30)).toBe(15)
    expect(rowAtX(399, 100, 400, 30)).toBe(29)
  })
  it('clamps outside the plot and survives degenerate input', () => {
    expect(rowAtX(0, 100, 400, 30)).toBe(0)
    expect(rowAtX(400, 100, 400, 30)).toBe(29)
    expect(rowAtX(9999, 100, 400, 30)).toBe(29)
    expect(rowAtX(50, 100, 100, 30)).toBe(0)
    expect(rowAtX(50, 0, 100, 0)).toBe(0)
  })
})

describe('rowForKey', () => {
  it('steps and jumps within the rows', () => {
    expect(rowForKey('ArrowLeft', 5, 10)).toBe(4)
    expect(rowForKey('ArrowRight', 5, 10)).toBe(6)
    expect(rowForKey('ArrowLeft', 0, 10)).toBe(0)
    expect(rowForKey('ArrowRight', 9, 10)).toBe(9)
    expect(rowForKey('Home', 5, 10)).toBe(0)
    expect(rowForKey('End', 5, 10)).toBe(9)
    expect(rowForKey('Enter', 5, 10)).toBeNull()
  })
})

describe('netWorthPoints', () => {
  const ev = (s: number, e: number) => ({ netWorthStart: s, netWorth: e }) as WalkYear['evelo']
  const row = (index: number, evelo: WalkYear['evelo']): WalkYear => ({ index, age: 60 + index, income: null, evelo })
  it('starts at the first lived year’s start, then year ends; null years are gaps', () => {
    const years = [row(0, null), row(1, ev(10, 11)), row(2, ev(11, 12)), row(3, null)]
    expect(netWorthPoints(years, 'evelo')).toEqual([null, 10, 11, 12, null])
    expect(netWorthPoints(years, 'income')).toEqual([null, null, null, null, null])
  })
})
