import { describe, expect, it } from 'vitest'
import { cardPlacement, clampView, panBy, pinchView, sameView, wheelFactor, zoomAt, type Limits, type View } from '../mapView'

const toScreen = (v: View, x: number, y: number) => [x * v.k + v.tx, y * v.k + v.ty]

describe('zoomAt', () => {
  it('keeps the world point under the cursor fixed', () => {
    const v: View = { k: 1.2, tx: 30, ty: -10 }
    const px = 210
    const py = 95
    const wx = (px - v.tx) / v.k
    const wy = (py - v.ty) / v.k
    const z = zoomAt(v, 3.7, px, py)
    expect(z.k).toBe(3.7)
    const [sx, sy] = toScreen(z, wx, wy)
    expect(sx).toBeCloseTo(px, 9)
    expect(sy).toBeCloseTo(py, 9)
  })
})

describe('pinchView', () => {
  const start: View = { k: 2, tx: -100, ty: -50 }

  it('scales by finger spread around the midpoint', () => {
    const v = pinchView(start, [100, 100], [200, 100], [50, 100], [250, 100])
    expect(v.k).toBeCloseTo(4, 9)
    // World point under the old midpoint (150,100) stays under the new midpoint (150,100).
    const wx = (150 - start.tx) / start.k
    const wy = (100 - start.ty) / start.k
    const [sx, sy] = toScreen(v, wx, wy)
    expect(sx).toBeCloseTo(150, 9)
    expect(sy).toBeCloseTo(100, 9)
  })

  it('pans when both fingers move together', () => {
    const v = pinchView(start, [100, 100], [200, 100], [130, 80], [230, 80])
    expect(v.k).toBeCloseTo(2, 9)
    expect(v.tx).toBeCloseTo(start.tx + 30, 9)
    expect(v.ty).toBeCloseTo(start.ty - 20, 9)
  })

  it('ignores spread when the fingers start on top of each other', () => {
    expect(pinchView(start, [100, 100], [100, 100], [80, 100], [120, 100]).k).toBe(2)
  })
})

describe('clampView', () => {
  const W = 400
  const H = 200
  const lim: Limits = { kMin: 0.4, kMax: 6, box: [0, 0, 1000, 500] }

  it('clamps scale into range about the viewport centre', () => {
    expect(clampView({ k: 50, tx: 0, ty: 0 }, W, H, lim).k).toBe(6)
    expect(clampView({ k: 0.1, tx: 0, ty: 0 }, W, H, lim).k).toBe(0.4)
  })

  it('stops panning past the world edge when zoomed in', () => {
    // Box spans 2000 px at k=2: tx must lie in [W - 2000, 0].
    expect(clampView({ k: 2, tx: 300, ty: 0 }, W, H, lim).tx).toBe(0)
    expect(clampView({ k: 2, tx: -5000, ty: 0 }, W, H, lim).tx).toBe(W - 2000)
    expect(clampView({ k: 2, tx: -700, ty: -300 }, W, H, lim)).toEqual({ k: 2, tx: -700, ty: -300 })
  })

  it('keeps a world smaller than the viewport wholly inside it', () => {
    // At k=0.4 the box is 400×200 — exactly the viewport — so it is pinned.
    expect(clampView({ k: 0.4, tx: 90, ty: -40 }, W, H, lim)).toEqual({ k: 0.4, tx: 0, ty: 0 })
  })

  it('leaves an in-range view alone', () => {
    const v = { k: 1, tx: -300, ty: -100 }
    expect(clampView(v, W, H, lim)).toEqual(v)
  })
})

describe('wheelFactor', () => {
  it('zooms in on scroll up and out on scroll down', () => {
    expect(wheelFactor(-100, 0)).toBeGreaterThan(1)
    expect(wheelFactor(100, 0)).toBeLessThan(1)
    expect(wheelFactor(0, 0)).toBe(1)
  })
  it('caps a single notch and normalises line/page modes', () => {
    expect(wheelFactor(-10000, 0)).toBeCloseTo(Math.SQRT2, 9)
    expect(wheelFactor(3, 1)).toBeCloseTo(wheelFactor(48, 0), 9)
  })
})

describe('panBy / sameView', () => {
  it('pans in screen pixels', () => {
    expect(panBy({ k: 3, tx: 1, ty: 2 }, 10, -5)).toEqual({ k: 3, tx: 11, ty: -3 })
  })
  it('treats sub-pixel differences as the same view', () => {
    expect(sameView({ k: 2, tx: 10, ty: 10 }, { k: 2.001, tx: 10.4, ty: 9.7 })).toBe(true)
    expect(sameView({ k: 2, tx: 10, ty: 10 }, { k: 2, tx: 14, ty: 10 })).toBe(false)
  })
})

describe('cardPlacement', () => {
  const CW = 264
  const CH = 260
  it('sits right of the dot when there is room, else left', () => {
    expect(cardPlacement(100, 150, 6, 1100, 500, CW, CH).left).toBe(120)
    expect(cardPlacement(1000, 150, 6, 1100, 500, CW, CH).left).toBe(1000 - 6 - 14 - CW)
  })
  it('keeps a side card inside the map vertically', () => {
    expect(cardPlacement(100, 10, 6, 1100, 500, CW, CH).top).toBe(8)
    expect(cardPlacement(100, 490, 6, 1100, 500, CW, CH).top).toBe(500 - CH - 8)
  })
  it('on a narrow map, goes below the dot if it fits, else above, else the roomier side', () => {
    const W = 370
    const H = 246
    const below = cardPlacement(180, 60, 8, W, H, CW, CH)
    expect(below.top).toBe(60 + 8 + 14)
    expect(below.left).toBe(180 - CW / 2)
    const above = cardPlacement(180, 200, 8, W, H, CW, CH)
    expect(above.top + CH).toBe(200 - 8 - 14)
    // A compact 140px card: fits below a dot at y=70 (70+22+140 = 232 ≤ 246)…
    expect(cardPlacement(180, 70, 8, W, H, CW, 140).top).toBe(92)
    // …and above a dot at y=170 (170−22−140 = 8).
    expect(cardPlacement(180, 170, 8, W, H, CW, 140).top).toBe(8)
  })
  it('keeps a centred card on the map when the dot is near an edge (no room either side)', () => {
    // Neither side fits for 82 < x < 288 on a 370px map.
    expect(cardPlacement(90, 60, 8, 370, 246, CW, CH)).toEqual({ left: 8, top: 82 })
    expect(cardPlacement(280, 60, 8, 370, 246, CW, CH).left).toBe(370 - CW - 8)
  })
})
