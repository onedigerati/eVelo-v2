import { describe, expect, it } from 'vitest'
import { clearRow, hasAnyOverride, parseAmount, parseChange, resetAll, rowOverride, setAmount, setRatio } from '../spendOverrides'

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
  it('caps at 1e9', () => expect(parseAmount('5b')).toBe(1e9))
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
