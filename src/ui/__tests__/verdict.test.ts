import { describe, expect, it } from 'vitest'
import { rampSegment } from '../outcomeScale'
import { toneLabel, verdictLevel } from '../verdict'

describe('verdict levels', () => {
  it('uses the 80 / 65 / 45 thresholds on the displayed percent', () => {
    expect(verdictLevel(0.85)).toBe('holds')
    expect(verdictLevel(0.7996)).toBe('holds')
    expect(verdictLevel(0.79)).toBe('mostly')
    expect(verdictLevel(0.65)).toBe('mostly')
    expect(verdictLevel(0.64)).toBe('fragile')
    expect(verdictLevel(0.45)).toBe('fragile')
    expect(verdictLevel(0.44)).toBe('breaks')
    expect(toneLabel(0.79)).toBe('Mostly holds')
  })
})

describe('outcome scale', () => {
  it('only mixes hue-adjacent stops and steps brass -> jade at 65%', () => {
    for (let s = 0; s <= 1.0001; s += 0.005) {
      const { a, b } = rampSegment(s)
      expect(Math.abs(b - a)).toBeLessThanOrEqual(1)
      expect(a === 2 && b === 3).toBe(false) // never blend brass into green
    }
    expect(rampSegment(0.64).a).toBe(2)
    expect(rampSegment(0.65).a).toBe(3)
    expect(rampSegment(0.9)).toEqual({ a: 4, b: 4, f: 0 })
  })
})
