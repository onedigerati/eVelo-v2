// Pure portfolio-weight arithmetic. Every function returns weights summing to exactly 1
// (up to float error) and never touches a locked holding unless there is no other way.

import type { Holding } from '../../engine/types'

export const MAX_HOLDINGS = 10
const EPS = 1e-9

const sum = (hs: Holding[]) => hs.reduce((s, h) => s + h.weight, 0)
const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

/** Spread `amount` over the holdings at `idxs` in proportion to their weights (evenly if all zero). */
function spread(ws: number[], idxs: number[], amount: number): void {
  const base = idxs.reduce((s, i) => s + ws[i], 0)
  for (const i of idxs) ws[i] = base > EPS ? ws[i] + (amount * ws[i]) / base : ws[i] + amount / idxs.length
}

/** Scale to sum 1. All-zero (or empty) input becomes equal weights. */
export function normalize(hs: Holding[]): Holding[] {
  const s = sum(hs)
  if (!hs.length) return hs
  return hs.map((h) => ({ ...h, weight: s > EPS ? Math.max(0, h.weight) / s : 1 / hs.length }))
}

/**
 * Set holding `index` to `target`; the other unlocked holdings absorb the difference in
 * proportion to their current weights. Locked holdings never move, so the target is clamped
 * to what the unlocked others can give up. With no unlocked others, nothing changes.
 */
export function setWeight(hs: Holding[], index: number, target: number, locked: ReadonlySet<string> = new Set()): Holding[] {
  const base = normalize(hs)
  const ws = base.map((h) => h.weight)
  const free: number[] = []
  let lockedSum = 0
  base.forEach((h, i) => {
    if (i === index) return
    if (locked.has(h.symbol)) lockedSum += ws[i]
    else free.push(i)
  })
  if (!free.length) return base
  const t = Math.min(clamp01(target), 1 - lockedSum)
  const remaining = 1 - lockedSum - t
  const freeSum = free.reduce((s, i) => s + ws[i], 0)
  for (const i of free) ws[i] = freeSum > EPS ? (ws[i] / freeSum) * remaining : remaining / free.length
  ws[index] = t
  return base.map((h, i) => ({ ...h, weight: Math.max(0, ws[i]) }))
}

/** Unlocked holdings share whatever the locked ones leave, equally. */
export function evenOut(hs: Holding[], locked: ReadonlySet<string> = new Set()): Holding[] {
  const base = normalize(hs)
  const free = base.filter((h) => !locked.has(h.symbol))
  if (!free.length) return base
  const lockedSum = base.reduce((s, h) => s + (locked.has(h.symbol) ? h.weight : 0), 0)
  const each = Math.max(0, 1 - lockedSum) / free.length
  return base.map((h) => (locked.has(h.symbol) ? h : { ...h, weight: each }))
}

/** Normalize and round to whole percents (largest remainder), so the list reads cleanly. */
export function roundWeights(hs: Holding[]): Holding[] {
  const base = normalize(hs)
  const raw = base.map((h) => h.weight * 100)
  const floors = raw.map(Math.floor)
  let left = 100 - floors.reduce((a, b) => a + b, 0)
  const order = raw.map((v, i) => ({ i, r: v - floors[i] })).sort((a, b) => b.r - a.r)
  for (const { i } of order) {
    if (left <= 0) break
    floors[i] += 1
    left -= 1
  }
  return base.map((h, i) => ({ ...h, weight: floors[i] / 100 }))
}

/**
 * Add a symbol with an equal share (1/(n+1)), taken from unlocked holdings in proportion. If
 * everything is locked, it is taken from all holdings. Duplicates and the cap are no-ops.
 */
export function addHolding(hs: Holding[], symbol: string, locked: ReadonlySet<string> = new Set()): Holding[] {
  if (hs.some((h) => h.symbol === symbol) || hs.length >= MAX_HOLDINGS) return hs
  if (!hs.length) return [{ symbol, weight: 1 }]
  const base = normalize(hs)
  const ws = base.map((h) => h.weight)
  let free = base.map((_, i) => i).filter((i) => !locked.has(base[i].symbol))
  if (!free.length || free.reduce((s, i) => s + ws[i], 0) < EPS) free = base.map((_, i) => i)
  const freeSum = free.reduce((s, i) => s + ws[i], 0)
  const share = Math.min(1 / (hs.length + 1), freeSum)
  spread(ws, free, -share)
  return [...base.map((h, i) => ({ ...h, weight: Math.max(0, ws[i]) })), { symbol, weight: share }]
}

/** Remove a holding; its weight goes to unlocked holdings (or all, if every other is locked). */
export function removeHolding(hs: Holding[], symbol: string, locked: ReadonlySet<string> = new Set()): Holding[] {
  const at = hs.findIndex((h) => h.symbol === symbol)
  if (at < 0 || hs.length <= 1) return hs
  const base = normalize(hs)
  const w = base[at].weight
  const rest = base.filter((_, i) => i !== at)
  const ws = rest.map((h) => h.weight)
  let free = rest.map((_, i) => i).filter((i) => !locked.has(rest[i].symbol))
  if (!free.length) free = rest.map((_, i) => i)
  spread(ws, free, w)
  return rest.map((h, i) => ({ ...h, weight: ws[i] }))
}

/** Equal-weight a symbol list. */
export const equalWeights = (symbols: string[]): Holding[] => symbols.map((symbol) => ({ symbol, weight: 1 / symbols.length }))
