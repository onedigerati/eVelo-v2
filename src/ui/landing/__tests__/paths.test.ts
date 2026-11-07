import { describe, expect, it } from 'vitest'
import { FIELD, FIELD_H, FIELD_W, makeField } from '../paths'

/** Parse "M0 720L12.0 715.3..." into points. */
function points(d: string): [number, number][] {
  return d
    .slice(1)
    .split('L')
    .map((s) => s.trim().split(' ').map(Number) as [number, number])
}

describe('landing path field', () => {
  it('is deterministic: the same seed gives identical paths', () => {
    expect(makeField()).toEqual(makeField())
    expect(makeField(FIELD_W)).toEqual(makeField(FIELD_W))
    expect(FIELD).toEqual(makeField())
    // and the seed matters
    expect(makeField(1).paths.map((p) => p.d)).not.toEqual(FIELD.paths.map((p) => p.d))
  })

  it('has 64 paths with mostly holds, some bruised and a few broken', () => {
    const count = { holds: 0, bruised: 0, broken: 0 }
    for (const p of FIELD.paths) count[p.kind]++
    expect(FIELD.paths).toHaveLength(64)
    expect(count.broken).toBeGreaterThanOrEqual(2)
    expect(count.broken).toBeLessThanOrEqual(6)
    expect(count.bruised).toBeGreaterThanOrEqual(4)
    expect(count.holds).toBeGreaterThan(count.bruised + count.broken)
  })

  it('every path starts at the start dot and stays inside the field', () => {
    for (const p of FIELD.paths) {
      const pts = points(p.d)
      expect(pts[0]).toEqual([0, FIELD.startY])
      for (const [x, y] of pts) {
        expect(x).toBeGreaterThanOrEqual(0)
        expect(x).toBeLessThanOrEqual(FIELD_W)
        expect(y).toBeGreaterThan(0)
        expect(y).toBeLessThan(FIELD_H)
      }
    }
  })

  it('broken paths stop where they cross the margin-call line and end on their dot', () => {
    const broken = FIELD.paths.filter((p) => p.kind === 'broken')
    for (const p of broken) {
      const pts = points(p.d)
      const last = pts[pts.length - 1]
      expect(last).toEqual([p.end.x, p.end.y])
      expect(p.end.y).toBeGreaterThan(FIELD.thresholdY) // below the line (svg y grows down)
      expect(p.end.x).toBeLessThan(FIELD_W) // stopped early
      // every earlier point is above the line: it ends at the crossing
      for (const [, y] of pts.slice(0, -1)) expect(y).toBeLessThanOrEqual(FIELD.thresholdY)
    }
  })

  it('surviving paths run the full width and never cross the line', () => {
    for (const p of FIELD.paths.filter((q) => q.kind !== 'broken')) {
      const pts = points(p.d)
      expect(pts[pts.length - 1][0]).toBe(FIELD_W)
      for (const [, y] of pts) expect(y).toBeLessThanOrEqual(FIELD.thresholdY)
    }
  })

  it('bruised paths dip lower than any path that holds', () => {
    const lowest = (d: string) => Math.max(...points(d).map(([, y]) => y))
    const holdsLow = Math.max(...FIELD.paths.filter((p) => p.kind === 'holds').map((p) => lowest(p.d)))
    for (const p of FIELD.paths.filter((q) => q.kind === 'bruised')) expect(lowest(p.d)).toBeGreaterThan(holdsLow)
  })

  it('staggers the draw-in by index', () => {
    FIELD.paths.forEach((p, i) => expect(p.delay).toBeCloseTo(i * 0.025, 6))
  })
})
