import { describe, expect, it } from 'vitest'
import { massWindow, moneyTick, resample } from '../chartKit'

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
