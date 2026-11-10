import { describe, expect, it } from 'vitest'
import { changeLabel, clearRow, hasAnyOverride, parseAmount, parseChange, resetAll, rowOverride, setAmount, setRatio } from '../spendOverrides'

describe('parseAmount', () => {
  it.each([
    ['18000', 18000],
    ['18,000', 18000],
    ['$18,000', 18000],
    ['$18k', 18000],
    ['18K', 18000],
    ['18.5k', 18500],
    [' 1.2m ', 1_200_000],
    ['0', 0],
    ['$0', 0],
  ])('%s -> %d', (raw, v) => expect(parseAmount(raw)).toBe(v))
  it.each(['', 'abc', '-500', '18%', '1.2.3', 'k'])('rejects %j', (raw) => expect(parseAmount(raw)).toBeNull())
  it.each(['1b', '5b', '10000001', '$10.5m', '1e12', 'abc', '-5'])('rejects out-of-range or junk %j', (raw) => expect(parseAmount(raw)).toBeNull())
  it('accepts up to $10M', () => expect(parseAmount('10m')).toBe(10_000_000))
})

describe('parseChange', () => {
  it('reads signed and unicode-minus percentages', () => {
    expect(parseChange('-33')).toBeCloseTo(0.67)
    expect(parseChange('−33%')).toBeCloseTo(0.67)
    expect(parseChange('+20')).toBeCloseTo(1.2)
  })
  it('clamps to 0.05..5 and rejects junk', () => {
    expect(parseChange('-100')).toBe(0.05)
    expect(parseChange('900')).toBe(5)
    expect(parseChange('x')).toBeNull()
    expect(parseChange('12abc')).toBeNull()
    expect(parseChange('')).toBeNull()
  })
})

describe('override set/clear', () => {
  it('setting $ removes the % for that category, keeps others', () => {
    const o = setAmount({ ratioOverrides: { housing: 0.5, dining: 0.8 } }, 'bangkok', 'housing', 18000)
    expect(o.ratioOverrides).toEqual({ dining: 0.8 })
    expect(o.amountOverrides).toEqual({ bangkok: { housing: 18000 } })
    expect(rowOverride(o, 'bangkok', 'housing')).toBe('amount')
    expect(rowOverride(o, 'bangkok', 'dining')).toBe('ratio')
  })
  it('setting $ when the only % was that category prunes ratioOverrides to undefined', () => {
    const o = setAmount({ ratioOverrides: { housing: 0.5 } }, 'bangkok', 'housing', 18000)
    expect(o.ratioOverrides).toBeUndefined()
  })
  it('setting % removes this city’s $ only, pruning empty maps', () => {
    const start = {
      amountOverrides: {
        bangkok: { housing: 18000 },
        lisbon: { housing: 20000 },
      },
    }
    const o = setRatio(start, 'bangkok', 'housing', 0.6)
    expect(o.ratioOverrides).toEqual({ housing: 0.6 })
    expect(o.amountOverrides).toEqual({ lisbon: { housing: 20000 } })
    expect(setRatio({ amountOverrides: { bangkok: { housing: 1 } } }, 'bangkok', 'housing', 1).amountOverrides).toBeUndefined()
  })
  it('setRatio clamps', () =>
    expect(setRatio({}, 'b', 'housing', 99).ratioOverrides).toEqual({
      housing: 5,
    }))
  it('clearRow clears either kind and prunes to undefined', () => {
    expect(clearRow({ ratioOverrides: { housing: 0.5 } }, 'bangkok', 'housing')).toEqual({
      ratioOverrides: undefined,
      amountOverrides: undefined,
    })
    const o = clearRow({ amountOverrides: { bangkok: { housing: 1, dining: 2 } } }, 'bangkok', 'housing')
    expect(o.amountOverrides).toEqual({ bangkok: { dining: 2 } })
    expect(rowOverride(o, 'bangkok', 'housing')).toBeNull()
  })
  it('resetAll clears every % and this city’s $, keeps other cities', () => {
    const start = {
      ratioOverrides: { dining: 0.8 },
      amountOverrides: { bangkok: { housing: 1 }, lisbon: { housing: 2 } },
    }
    expect(hasAnyOverride(start, 'bangkok')).toBe(true)
    const o = resetAll(start, 'bangkok')
    expect(o).toEqual({
      ratioOverrides: undefined,
      amountOverrides: { lisbon: { housing: 2 } },
    })
    expect(hasAnyOverride(o, 'bangkok')).toBe(false)
    expect(resetAll({ amountOverrides: { bangkok: { housing: 1 } } }, 'bangkok').amountOverrides).toBeUndefined()
  })
  it('does not mutate its input', () => {
    const start = {
      ratioOverrides: { housing: 0.5 },
      amountOverrides: { bangkok: { dining: 3 } },
    }
    const copy = structuredClone(start)
    setAmount(start, 'bangkok', 'housing', 9)
    setRatio(start, 'bangkok', 'dining', 2)
    clearRow(start, 'bangkok', 'dining')
    resetAll(start, 'bangkok')
    expect(start).toEqual(copy)
  })
})

describe('changeLabel', () => {
  const pct = (v: number) => `${v > 0 ? '+' : ''}${Math.round(v * 100)}%`
  it('formats, flattens near zero and caps huge changes', () => {
    expect(changeLabel(0.2, pct)).toBe('+20%')
    expect(changeLabel(-0.33, pct)).toBe('-33%')
    expect(changeLabel(0.001, pct)).toBe('±0%')
    expect(changeLabel(9.99, pct)).toBe('+999%')
    expect(changeLabel(181817, pct)).toBe('>+999%')
  })
})

describe('override anchors', () => {
  it('typing a $ anchors it at the current premium and drops the % and its anchor', () => {
    const o = setAmount({ ratioOverrides: { housing: 0.5, dining: 0.8 }, ratioOverrideAt: { housing: 0.1, dining: 0.2 } }, 'bangkok', 'housing', 18000, 0.4)
    expect(o).toEqual({
      ratioOverrides: { dining: 0.8 },
      ratioOverrideAt: { dining: 0.2 },
      amountOverrides: { bangkok: { housing: 18000 } },
      amountOverrideAt: { bangkok: { housing: 0.4 } },
    })
  })
  it('typing a % anchors it at the current premium and drops this city’s $ and its anchor', () => {
    const o = setRatio(
      { amountOverrides: { bangkok: { housing: 1 }, lisbon: { housing: 2 } }, amountOverrideAt: { bangkok: { housing: 0.1 }, lisbon: { housing: 0.2 } } },
      'bangkok',
      'housing',
      0.6,
      0.35,
    )
    expect(o).toEqual({
      ratioOverrides: { housing: 0.6 },
      ratioOverrideAt: { housing: 0.35 },
      amountOverrides: { lisbon: { housing: 2 } },
      amountOverrideAt: { lisbon: { housing: 0.2 } },
    })
    expect(setRatio({ amountOverrides: { bangkok: { housing: 1 } }, amountOverrideAt: { bangkok: { housing: 0.1 } } }, 'bangkok', 'housing', 1, 0).amountOverrideAt).toBeUndefined()
  })
  it('typing again re-anchors at the new premium', () => {
    const a = setAmount(setAmount({}, 'bangkok', 'housing', 1000, 0.2), 'bangkok', 'housing', 1200, 0.7)
    expect(a.amountOverrideAt).toEqual({ bangkok: { housing: 0.7 } })
    const r = setRatio(setRatio({}, 'bangkok', 'dining', 0.5, 0.2), 'bangkok', 'dining', 0.6, 0.9)
    expect(r.ratioOverrideAt).toEqual({ dining: 0.9 })
  })
  it('clamps the anchor to 0..1; without a finite premium the row is left unanchored', () => {
    expect(setAmount({}, 'b', 'housing', 1, 3).amountOverrideAt).toEqual({ b: { housing: 1 } })
    expect(setRatio({}, 'b', 'housing', 1, -0.5).ratioOverrideAt).toEqual({ housing: 0 })
    const stale = { amountOverrides: { b: { housing: 1 } }, amountOverrideAt: { b: { housing: 0.3 } }, ratioOverrides: { dining: 1 }, ratioOverrideAt: { dining: 0.3 } }
    expect(setAmount(stale, 'b', 'housing', 5).amountOverrideAt).toBeUndefined()
    expect(setRatio(stale, 'b', 'dining', 2, NaN).ratioOverrideAt).toBeUndefined()
  })
  it('× drops the row’s anchor with its override, pruning empty maps', () => {
    const start = {
      ratioOverrides: { dining: 0.8, groceries: 1.1 },
      ratioOverrideAt: { dining: 0.1, groceries: 0.2 },
      amountOverrides: { bangkok: { housing: 1 } },
      amountOverrideAt: { bangkok: { housing: 0.3 } },
    }
    expect(clearRow(start, 'bangkok', 'housing')).toEqual({
      ratioOverrides: start.ratioOverrides,
      ratioOverrideAt: start.ratioOverrideAt,
      amountOverrides: undefined,
      amountOverrideAt: undefined,
    })
    const o = clearRow(start, 'bangkok', 'dining')
    expect(o.ratioOverrideAt).toEqual({ groceries: 0.2 })
    expect(clearRow(o, 'bangkok', 'groceries').ratioOverrideAt).toBeUndefined()
  })
  it('Reset all drops every % anchor and this city’s $ anchors, keeping other cities’', () => {
    const start = {
      ratioOverrides: { dining: 0.8 },
      ratioOverrideAt: { dining: 0.1 },
      amountOverrides: { bangkok: { housing: 1 }, lisbon: { housing: 2 } },
      amountOverrideAt: { bangkok: { housing: 0.3 }, lisbon: { housing: 0.4 } },
    }
    const copy = structuredClone(start)
    expect(resetAll(start, 'bangkok')).toEqual({
      ratioOverrides: undefined,
      ratioOverrideAt: undefined,
      amountOverrides: { lisbon: { housing: 2 } },
      amountOverrideAt: { lisbon: { housing: 0.4 } },
    })
    expect(resetAll({ amountOverrides: { bangkok: { housing: 1 } }, amountOverrideAt: { bangkok: { housing: 0.3 } } }, 'bangkok').amountOverrideAt).toBeUndefined()
    setAmount(start, 'bangkok', 'dining', 5, 0.5)
    setRatio(start, 'bangkok', 'housing', 2, 0.5)
    clearRow(start, 'lisbon', 'housing')
    expect(start).toEqual(copy)
  })
})
