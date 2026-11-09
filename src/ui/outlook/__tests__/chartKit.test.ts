import { describe, expect, it } from 'vitest'
import { massWindow, moneyTick, resample, seriesAt } from '../chartKit'

describe('massWindow', () => {
  it('finds the shortest window holding the share of mass', () => {
    expect(massWindow([0.5, 0.3, 0.1, 0.05, 0.05], 0.6)).toEqual([0, 1])
    expect(massWindow([0, 0, 0.1, 0.4, 0.4, 0.1], 0.6)).toEqual([3, 4])
  })
  it('returns null for an empty or zero series', () => {
    expect(massWindow([], 0.6)).toBeNull()
    expect(massWindow([0, 0, 0], 0.6)).toBeNull()
  })
})

describe('resample', () => {
  it('keeps endpoints and interpolates linearly', () => {
    expect(resample([0, 10], 3)).toEqual([0, 5, 10])
    expect(resample([1, 2, 3], 3)).toEqual([1, 2, 3])
    const r = resample([0, 10, 20, 30], 2)
    expect(r[0]).toBe(0)
    expect(r[1]).toBe(30)
  })
})

describe('moneyTick', () => {
  it('formats compact axis labels', () => {
    expect(moneyTick(0)).toBe('$0')
    expect(moneyTick(500_000)).toBe('$500K')
    expect(moneyTick(2_500_000)).toBe('$2.5M')
    expect(moneyTick(35_000_000)).toBe('$35M')
    expect(moneyTick(-1_000_000)).toBe('−$1M')
  })
})

describe('seriesAt', () => {
  it('reads in-range values', () => {
    expect(seriesAt([0.1, 0.2, 0.3], 1)).toBe(0.2)
  })
  it('clamps to the last value when the series lags a longer horizon', () => {
    // A tweened 15-year series still on screen while the horizon is already 30.
    const stale = Array.from({ length: 15 }, (_, i) => i / 100)
    expect(seriesAt(stale, 29)).toBe(0.14)
    expect(seriesAt(stale, -1)).toBe(0)
  })
  it('falls back for empty or non-finite series', () => {
    expect(seriesAt([], 3)).toBe(0)
    expect(seriesAt([NaN], 0, 0.5)).toBe(0.5)
  })
})
