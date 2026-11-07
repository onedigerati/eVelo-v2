import { describe, expect, it } from 'vitest'
import {
  AUSTIN,
  CITIES,
  FAN,
  FAN_H,
  FAN_W,
  LISBON,
  MAP_LABELS,
  MAP_VIEWBOX,
  MERIDIANS,
  PARALLELS,
  PHONE_LABELS,
  PHONE_LABEL_SIZE,
  type MapLabel,
  bandFor,
  fanLoan,
  fanMargin,
  fanMedian,
  projectX,
  projectY,
} from '../atlasCard'

/** Parse "M0.0 277.5L9.3 276.9…Z" into points. */
function points(d: string): [number, number][] {
  return d
    .replace(/Z$/, '')
    .slice(1)
    .split('L')
    .map((s) => s.trim().split(' ').map(Number) as [number, number])
}

describe('landing atlas card: map', () => {
  it('has the 33 illustrative cities, each once', () => {
    expect(CITIES).toHaveLength(33)
    expect(new Set(CITIES.map((c) => c.name)).size).toBe(33)
  })

  it('places every city by the projection (4 units per degree), inside the viewBox', () => {
    const { x, y, width, height } = MAP_VIEWBOX
    for (const c of CITIES) {
      expect(c.x).toBeCloseTo(projectX(c.lon), 1)
      expect(c.y).toBeCloseTo(projectY(c.lat), 1)
      expect(c.x).toBeGreaterThan(x)
      expect(c.x).toBeLessThan(x + width)
      expect(c.y).toBeGreaterThan(y)
      expect(c.y).toBeLessThan(y + height)
    }
    expect(LISBON).toMatchObject({ x: 683.6, y: 133.2 })
    expect(AUSTIN).toMatchObject({ x: 329.2, y: 166.8 })
  })

  it('classifies on the 80 / 65 / 45 / 35 thresholds', () => {
    expect([100, 80, 79, 65, 64, 45, 44, 35, 34, 0].map(bandFor)).toEqual([4, 4, 3, 3, 2, 2, 1, 1, 0, 0])
    for (const c of CITIES) expect(c.band).toBe(bandFor(c.pct))
    // The drawn spread covers every band.
    expect(new Set(CITIES.map((c) => c.band))).toEqual(new Set([0, 1, 2, 3, 4]))
  })

  it('labels the six drawn cities with their percentages', () => {
    expect(MAP_LABELS.map((l) => [l.name, l.pct, l.anchor])).toEqual([
      ['Lisbon', 88, 'end'],
      ['Tbilisi', 92, 'start'],
      ['Bangkok', 93, 'end'],
      ['Medellín', 92, 'start'],
      ['New York', 38, 'start'],
      ['Austin', 63, 'start'],
    ])
    const lisbon = MAP_LABELS[0]
    expect(lisbon).toMatchObject({ x: 667.6, y: 163.2 })
  })

  it('highlights Lisbon only (88% vs 63% at home in Austin), with a bigger dot', () => {
    expect(CITIES.filter((c) => c.highlighted).map((c) => c.name)).toEqual(['Lisbon'])
    expect(LISBON).toMatchObject({ pct: 88, band: 4, r: 11 })
    expect(AUSTIN).toMatchObject({ pct: 63, band: 2, r: 8 })
  })

  it('draws a graticule of 10 meridians and 6 parallels', () => {
    expect(MERIDIANS).toEqual([240, 360, 480, 600, 720, 840, 960, 1080, 1200, 1320])
    expect(PARALLELS).toEqual([108, 168, 228, 288, 348, 408])
  })
})

/** Approximate glyph box of a label at `size` units (Geist ~0.56em per character, cap-height ~0.75em). */
function box(l: MapLabel, size: number) {
  const w = `${l.name} ${l.pct}%`.length * 0.56 * size
  const x0 = l.anchor === 'start' ? l.x : l.x - w
  return { x0, x1: x0 + w, y0: l.y - 0.75 * size, y1: l.y }
}
const overlaps = (a: ReturnType<typeof box>, b: ReturnType<typeof box>) => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1

describe('landing atlas card: labels by card width', () => {
  it('keeps the six drawn labels clear of each other at 24 and 28 units', () => {
    for (const size of [24, 28]) {
      const boxes = MAP_LABELS.map((l) => box(l, size))
      for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) expect(overlaps(boxes[i], boxes[j])).toBe(false)
    }
  })

  it('on narrow cards labels Lisbon and Austin (plus three that fit), drops New York', () => {
    expect(PHONE_LABEL_SIZE).toBeGreaterThanOrEqual(44) // >= 11px rendered on a 360px phone (~0.25px/unit)
    expect(PHONE_LABELS.map((l) => [l.name, l.pct])).toEqual([
      ['Lisbon', 88],
      ['Tbilisi', 92],
      ['Bangkok', 93],
      ['Medellín', 92],
      ['Austin', 63],
    ])
  })

  it('on narrow cards no label overlaps another label, any city dot or the map edge', () => {
    const { x, y, width } = MAP_VIEWBOX
    const boxes = PHONE_LABELS.map((l) => box(l, PHONE_LABEL_SIZE))
    for (let i = 0; i < boxes.length; i++) {
      const b = boxes[i]
      expect(b.x0).toBeGreaterThan(x)
      expect(b.x1).toBeLessThan(x + width)
      expect(b.y0).toBeGreaterThan(y)
      for (let j = i + 1; j < boxes.length; j++) expect(overlaps(b, boxes[j])).toBe(false)
      for (const c of CITIES) {
        const dot = { x0: c.x - c.r, x1: c.x + c.r, y0: c.y - c.r, y1: c.y + c.r }
        expect(overlaps(b, dot), `${PHONE_LABELS[i].name} label vs ${c.name}`).toBe(false)
      }
    }
  })
})

describe('landing atlas card: fan chart', () => {
  const wellFormed = /^M-?\d+(\.\d)? -?\d+(\.\d)?(L-?\d+(\.\d)? -?\d+(\.\d)?)+Z?$/

  it('builds well-formed paths across the chart', () => {
    for (const d of Object.values(FAN)) expect(d).toMatch(wellFormed)
    for (const k of ['median', 'loan', 'margin'] as const) {
      const p = points(FAN[k])
      expect(p).toHaveLength(61)
      expect(p[0][0]).toBe(0)
      expect(p[60][0]).toBe(FAN_W)
      for (const [x, y] of p) {
        expect(Number.isFinite(x) && Number.isFinite(y)).toBe(true)
      }
    }
    // Bands go out along the top and back along the bottom, closed.
    for (const k of ['band1', 'band2'] as const) {
      expect(FAN[k].endsWith('Z')).toBe(true)
      expect(points(FAN[k])).toHaveLength(122)
    }
  })

  it('starts at $2.5M with no loan, inside the chart', () => {
    expect(points(FAN.median)[0]).toEqual([0, 281.3]) // 300 - 2.5/40 × 300 = 281.25
    expect(points(FAN.loan)[0]).toEqual([0, FAN_H])
  })

  it('keeps the median above the margin-call line, and the margin line above the loan', () => {
    const med = points(FAN.median)
    const margin = points(FAN.margin)
    const loan = points(FAN.loan)
    for (let i = 1; i < med.length; i++) {
      // SVG y grows downwards: above = smaller y.
      expect(med[i][1]).toBeLessThan(margin[i][1])
      expect(margin[i][1]).toBeLessThan(loan[i][1])
    }
    for (let t = 0; t <= 30; t += 0.5) expect(fanMedian(t)).toBeGreaterThan(fanMargin(t))
    expect(fanMargin(30)).toBeCloseTo(fanLoan(30) / 0.7, 10)
  })

  it('nests the inner band inside the outer band', () => {
    const outer = points(FAN.band1)
    const inner = points(FAN.band2)
    for (let i = 1; i < 61; i++) {
      expect(outer[i][1]).toBeLessThanOrEqual(inner[i][1]) // top edge
      expect(outer[121 - i][1]).toBeGreaterThanOrEqual(inner[121 - i][1]) // bottom edge
    }
  })
})
