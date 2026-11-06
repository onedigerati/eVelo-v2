import { describe, expect, it } from 'vitest'
import {
  cleanName,
  deletePortfolio,
  findByName,
  MAX_NAME,
  MAX_SAVED,
  renamePortfolio,
  sameMix,
  sanitizeSaved,
  savePortfolio,
  type SavedPortfolio,
} from '../portfolios'

const mixA = [
  { symbol: 'VTI', weight: 0.6 },
  { symbol: 'BND', weight: 0.4 },
]
const mixB = [{ symbol: 'SPY', weight: 1 }]

function saved(list: SavedPortfolio[], name: string, hs = mixA, now = 1): SavedPortfolio[] {
  const r = savePortfolio(list, name, hs, now)
  if (!r.ok) throw new Error(r.reason)
  return r.list
}

describe('saved portfolios', () => {
  it('cleans names: trims, collapses spaces, caps length', () => {
    expect(cleanName('  My   60/40 \n mix ')).toBe('My 60/40 mix')
    expect(cleanName('x'.repeat(100))).toHaveLength(MAX_NAME)
    expect(cleanName('   ')).toBe('')
  })

  it('saves a new mix and copies only valid holdings', () => {
    const r = savePortfolio([], 'Core', [...mixA, { symbol: 'NOTATICKER', weight: 0.1 }], 5)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.list).toHaveLength(1)
    expect(r.saved).toMatchObject({ name: 'Core', holdings: mixA, savedAt: 5 })
  })

  it('refuses an empty name, an empty mix, and a full list', () => {
    expect(savePortfolio([], '  ', mixA)).toEqual({ ok: false, reason: 'empty-name' })
    expect(savePortfolio([], 'Empty', [])).toEqual({ ok: false, reason: 'no-holdings' })
    let list: SavedPortfolio[] = []
    for (let i = 0; i < MAX_SAVED; i++) list = saved(list, `P${i}`)
    expect(savePortfolio(list, 'One more', mixA)).toEqual({ ok: false, reason: 'full' })
    // Overwriting an existing name still works when full.
    expect(savePortfolio(list, 'p3', mixB).ok).toBe(true)
  })

  it('overwrites a same-named mix in place (any case), keeping its id and position', () => {
    let list = saved([], 'Core')
    list = saved(list, 'Growth', mixB)
    const id = list[0].id
    const r = savePortfolio(list, '  core ', mixB, 9)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.list.map((p) => p.name)).toEqual(['core', 'Growth'])
    expect(r.list[0]).toMatchObject({ id, holdings: mixB, savedAt: 9 })
  })

  it('does not share holdings arrays with the caller', () => {
    const hs = structuredClone(mixA)
    const list = saved([], 'Core', hs)
    hs[0].weight = 0.99
    expect(list[0].holdings[0].weight).toBe(0.6)
  })

  it('renames, rejecting blanks, clashes and unknown ids; same name with new case is fine', () => {
    let list = saved([], 'Core')
    list = saved(list, 'Growth', mixB)
    const [a, b] = list
    expect(renamePortfolio(list, a.id, '')).toEqual({ ok: false, reason: 'empty-name' })
    expect(renamePortfolio(list, a.id, 'growth')).toEqual({ ok: false, reason: 'taken' })
    expect(renamePortfolio(list, 'nope', 'X')).toEqual({ ok: false, reason: 'missing' })
    const r = renamePortfolio(list, a.id, 'CORE')
    expect(r.ok && r.list[0].name).toBe('CORE')
    const r2 = renamePortfolio(list, b.id, 'Tech tilt')
    expect(r2.ok && findByName(r2.list, 'tech TILT')?.id).toBe(b.id)
  })

  it('deletes by id', () => {
    let list = saved([], 'Core')
    list = saved(list, 'Growth', mixB)
    expect(deletePortfolio(list, list[0].id).map((p) => p.name)).toEqual(['Growth'])
  })

  it('sanitizes stored data: garbage, unknown tickers, duplicates, bad ids', () => {
    expect(sanitizeSaved(null)).toEqual([])
    expect(sanitizeSaved('[]')).toEqual([])
    const out = sanitizeSaved([
      { id: 'a', name: 'Core', holdings: mixA, savedAt: 3 },
      { id: 'a', name: 'Dup id', holdings: mixB }, // id collision -> fresh id
      { id: 'c', name: 'core', holdings: mixB }, // duplicate name -> dropped
      { id: 'd', name: 'Ghost', holdings: [{ symbol: 'ZZZZ', weight: 1 }] }, // no valid tickers -> dropped
      { id: 'e', name: '', holdings: mixA }, // no name -> dropped
      { id: 7, name: 'No id', holdings: mixB, savedAt: 'yesterday' },
      42,
      null,
    ])
    expect(out.map((p) => p.name)).toEqual(['Core', 'Dup id', 'No id'])
    expect(new Set(out.map((p) => p.id)).size).toBe(3)
    expect(out[0]).toEqual({ id: 'a', name: 'Core', holdings: mixA, savedAt: 3 })
    expect(out[2].savedAt).toBe(0)
  })

  it('caps how many are kept', () => {
    const raw = Array.from({ length: MAX_SAVED + 5 }, (_, i) => ({ id: `i${i}`, name: `P${i}`, holdings: mixB }))
    expect(sanitizeSaved(raw)).toHaveLength(MAX_SAVED)
  })

  it('compares mixes by ticker order and weight', () => {
    expect(sameMix(mixA, [{ symbol: 'VTI', weight: 0.6004 }, { symbol: 'BND', weight: 0.4 }])).toBe(true)
    expect(sameMix(mixA, [...mixA].reverse())).toBe(false)
    expect(sameMix(mixA, mixB)).toBe(false)
  })
})
