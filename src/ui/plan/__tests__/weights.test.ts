import { describe, expect, it } from 'vitest'
import type { Holding } from '../../../engine/types'
import { addHolding, evenOut, MAX_HOLDINGS, normalize, removeHolding, roundWeights, setWeight } from '../weights'

const H = (pairs: [string, number][]): Holding[] => pairs.map(([symbol, weight]) => ({ symbol, weight }))
const total = (hs: Holding[]) => hs.reduce((s, h) => s + h.weight, 0)
const w = (hs: Holding[], s: string) => hs.find((h) => h.symbol === s)!.weight

const base = H([
  ['VTI', 0.5],
  ['QQQ', 0.2],
  ['SCHD', 0.15],
  ['BND', 0.1],
  ['GLD', 0.05],
])

describe('setWeight', () => {
  it('rescales the other holdings proportionally and keeps the sum at 1', () => {
    const out = setWeight(base, 0, 0.3)
    expect(total(out)).toBeCloseTo(1, 12)
    expect(w(out, 'VTI')).toBeCloseTo(0.3)
    // Others grow by 0.7/0.5 = 1.4×
    expect(w(out, 'QQQ')).toBeCloseTo(0.28)
    expect(w(out, 'GLD')).toBeCloseTo(0.07)
  })

  it('never moves locked holdings', () => {
    const locked = new Set(['QQQ', 'BND'])
    const out = setWeight(base, 0, 0.6, locked)
    expect(total(out)).toBeCloseTo(1, 12)
    expect(w(out, 'QQQ')).toBe(0.2)
    expect(w(out, 'BND')).toBe(0.1)
    expect(w(out, 'VTI')).toBeCloseTo(0.6)
    // SCHD:GLD keep their 3:1 ratio in the 0.1 that is left
    expect(w(out, 'SCHD')).toBeCloseTo(0.075)
    expect(w(out, 'GLD')).toBeCloseTo(0.025)
  })

  it('clamps the target to what unlocked holdings can give up', () => {
    const locked = new Set(['QQQ', 'SCHD', 'BND'])
    const out = setWeight(base, 0, 0.95, locked)
    expect(w(out, 'VTI')).toBeCloseTo(0.55)
    expect(w(out, 'GLD')).toBeCloseTo(0)
    expect(total(out)).toBeCloseTo(1, 12)
  })

  it('is a no-op when every other holding is locked', () => {
    const locked = new Set(['QQQ', 'SCHD', 'BND', 'GLD'])
    const out = setWeight(base, 0, 0.9, locked)
    expect(out.map((h) => h.weight)).toEqual(base.map((h) => h.weight))
  })

  it('refills zero-weight unlocked holdings evenly', () => {
    const hs = H([
      ['A', 1],
      ['B', 0],
      ['C', 0],
    ])
    const out = setWeight(hs, 0, 0.4)
    expect(w(out, 'B')).toBeCloseTo(0.3)
    expect(w(out, 'C')).toBeCloseTo(0.3)
  })

  it('clamps out-of-range targets', () => {
    expect(w(setWeight(base, 1, -0.5), 'QQQ')).toBe(0)
    expect(w(setWeight(base, 1, 2), 'QQQ')).toBeCloseTo(1)
    expect(total(setWeight(base, 1, 2))).toBeCloseTo(1, 12)
  })
})

describe('helpers', () => {
  it('evenOut splits the unlocked remainder equally', () => {
    const out = evenOut(base, new Set(['VTI']))
    expect(w(out, 'VTI')).toBe(0.5)
    for (const s of ['QQQ', 'SCHD', 'BND', 'GLD']) expect(w(out, s)).toBeCloseTo(0.125)
  })

  it('normalize and roundWeights produce whole percents summing to 100', () => {
    const thirds = H([
      ['A', 1],
      ['B', 1],
      ['C', 1],
    ])
    expect(total(normalize(thirds))).toBeCloseTo(1, 12)
    const r = roundWeights(thirds)
    expect(r.map((h) => Math.round(h.weight * 100)).reduce((a, b) => a + b)).toBe(100)
    expect(r.every((h) => Number.isInteger(Math.round(h.weight * 1e6) / 1e4))).toBe(true)
  })

  it('addHolding gives an equal share taken from unlocked holdings', () => {
    const out = addHolding(base, 'NVDA', new Set(['VTI']))
    expect(out).toHaveLength(6)
    expect(w(out, 'NVDA')).toBeCloseTo(1 / 6)
    expect(w(out, 'VTI')).toBe(0.5)
    expect(total(out)).toBeCloseTo(1, 12)
    expect(addHolding(out, 'NVDA')).toBe(out) // duplicate
  })

  it('addHolding respects the cap', () => {
    let hs: Holding[] = []
    for (let i = 0; i < 12; i++) hs = addHolding(hs, `S${i}`)
    expect(hs).toHaveLength(MAX_HOLDINGS)
    expect(total(hs)).toBeCloseTo(1, 12)
  })

  it('removeHolding hands the weight to unlocked holdings', () => {
    const out = removeHolding(base, 'VTI', new Set(['QQQ']))
    expect(out).toHaveLength(4)
    expect(w(out, 'QQQ')).toBe(0.2)
    expect(total(out)).toBeCloseTo(1, 12)
    expect(removeHolding(H([['A', 1]]), 'A')).toHaveLength(1)
  })
})
