/**
 * Pan/zoom math for the Atlas world map. A view maps world coordinates to screen pixels as
 * `screen = world × k + t`. Pure functions so the gestures in `WorldMap` stay thin and tested.
 */

export interface View {
  k: number
  tx: number
  ty: number
}

export type Box = [number, number, number, number]

export interface Limits {
  kMin: number
  kMax: number
  /** World-space box the user can't pan away from. */
  box: Box
}

/** Scale to `k2` keeping the world point under screen point (px, py) fixed. */
export function zoomAt(v: View, k2: number, px: number, py: number): View {
  const wx = (px - v.tx) / v.k
  const wy = (py - v.ty) / v.k
  return { k: k2, tx: px - k2 * wx, ty: py - k2 * wy }
}

export function panBy(v: View, dx: number, dy: number): View {
  return { k: v.k, tx: v.tx + dx, ty: v.ty + dy }
}

/**
 * Two-finger gesture: from the view at gesture start and the two finger positions then and
 * now, the view that keeps the world point under the start midpoint under the current midpoint,
 * scaled by how far the fingers spread.
 */
export function pinchView(
  start: View,
  a0: [number, number],
  b0: [number, number],
  a1: [number, number],
  b1: [number, number],
): View {
  const d0 = Math.hypot(b0[0] - a0[0], b0[1] - a0[1])
  const d1 = Math.hypot(b1[0] - a1[0], b1[1] - a1[1])
  const k = d0 > 1 ? start.k * (d1 / d0) : start.k
  const m0x = (a0[0] + b0[0]) / 2
  const m0y = (a0[1] + b0[1]) / 2
  const wx = (m0x - start.tx) / start.k
  const wy = (m0y - start.ty) / start.k
  return { k, tx: (a1[0] + b1[0]) / 2 - k * wx, ty: (a1[1] + b1[1]) / 2 - k * wy }
}

function clampAxis(t: number, k: number, lo: number, hi: number, size: number): number {
  const span = (hi - lo) * k
  // Larger than the viewport: no gap at either edge. Smaller: keep it wholly inside.
  const a = span >= size ? size - hi * k : -lo * k
  const b = span >= size ? -lo * k : size - hi * k
  return Math.min(Math.max(t, Math.min(a, b)), Math.max(a, b)) + 0 // + 0 folds -0 to 0
}

/** Clamp scale to [kMin, kMax] (about the viewport centre) and keep the world box on screen. */
export function clampView(v: View, W: number, H: number, { kMin, kMax, box }: Limits): View {
  let out = v
  const k = Math.min(kMax, Math.max(kMin, v.k))
  if (k !== v.k) out = zoomAt(v, k, W / 2, H / 2)
  return {
    k,
    tx: clampAxis(out.tx, k, box[0], box[2], W),
    ty: clampAxis(out.ty, k, box[1], box[3], H),
  }
}

/** Zoom factor for one wheel event (Ctrl/⌘+wheel or a trackpad pinch). */
export function wheelFactor(deltaY: number, deltaMode: number): number {
  const px = deltaMode === 1 ? deltaY * 16 : deltaMode === 2 ? deltaY * 400 : deltaY
  return Math.pow(2, -Math.max(-50, Math.min(50, px)) * 0.01)
}

/** Views equal to within a pixel and a fraction of a percent of scale. */
export function sameView(a: View, b: View): boolean {
  return Math.abs(a.k / b.k - 1) < 0.01 && Math.abs(a.tx - b.tx) < 1 && Math.abs(a.ty - b.ty) < 1
}

/**
 * Where the city card goes for a marker at (x, y) with radius r on a W×H map: beside the dot
 * when there's room on either side; otherwise (phones) centred over it, below the dot if the
 * card fits there, else above, else on the roomier side, so it never covers the dot it describes. `top` may be negative or run past H — the card overhangs the map.
 */
export function cardPlacement(
  x: number,
  y: number,
  r: number,
  W: number,
  H: number,
  CW: number,
  CH: number,
): { left: number; top: number } {
  const gap = 14
  if (x + r + gap + CW <= W - 2) return { left: x + r + gap, top: sideTop(y, H, CH) }
  if (x - r - gap - CW >= 2) return { left: x - r - gap - CW, top: sideTop(y, H, CH) }
  const left = Math.min(Math.max(8, x - CW / 2), Math.max(8, W - CW - 8))
  const below = y + r + gap
  const above = y - r - gap - CH
  // Below if it fits inside the map, else above if that fits, else whichever side has more room.
  if (below + CH <= H) return { left, top: below }
  if (above >= 0) return { left, top: above }
  return { left, top: H - y > y ? below : above }
}

function sideTop(y: number, H: number, CH: number): number {
  return Math.min(Math.max(8, y - 70), Math.max(8, H - CH - 8))
}
