import { describe, expect, it, vi } from 'vitest'

// cards.tsx imports the store, which reads `window` on load.
vi.mock('../../../state/store', () => ({ useStore: () => undefined }))
vi.mock('../../../state/fx', () => ({ useFx: () => undefined, useRate: () => 1 }))
import { DEFAULT_INPUTS } from '../../../engine/defaults'
import { resolveDestination } from '../../../engine/simulate'
import type { PlanInputs, SimulationResult } from '../../../engine/types'
import { CITIES_FIX } from '../../../engine/__tests__/fixtures'
import { costCaption, costRows } from '../cards'

const [STL, BKK] = CITIES_FIX

/** The cost fields of a result, as the engine fills them for these inputs. */
function fake(inputs: PlanInputs): SimulationResult {
  const d = resolveDestination(inputs, STL, inputs.destCityId === BKK.id ? BKK : null)
  return { inputs, categoryRatios: d.ratios, categoryAmounts: d.amounts } as unknown as SimulationResult
}

describe('costRows', () => {
  const base = { ...DEFAULT_INPUTS, homeCityId: STL.id, destCityId: BKK.id }

  it('prices each category as the engine does, and a fixed amount for the destination wins', () => {
    const plain = costRows(fake(base), base.budget)
    for (const x of plain) expect(x.dest).toBeCloseTo(x.home * x.ratio!, 6)
    const inputs = { ...base, amountOverrides: { [BKK.id]: { housing: base.budget.housing / 4 } } }
    const rows = costRows(fake(inputs), inputs.budget)
    const h = rows.find((x) => x.c === 'housing')!
    expect(h.dest).toBe(base.budget.housing / 4)
    expect(h.ratio).toBeCloseTo(0.25)
    // other categories are untouched
    expect(rows.filter((x) => x.c !== 'housing')).toEqual(plain.filter((x) => x.c !== 'housing'))
  })

  it('ignores a fixed amount keyed by another city', () => {
    const inputs = { ...base, amountOverrides: { zurich: { housing: 1 } } }
    expect(costRows(fake(inputs), inputs.budget)).toEqual(costRows(fake(base), base.budget))
  })

  it('gives no ratio (not Infinity) for a fixed amount on a $0 home category', () => {
    const inputs = { ...base, budget: { ...base.budget, travel: 0 }, amountOverrides: { [BKK.id]: { travel: 6_000 } } }
    const t = costRows(fake(inputs), inputs.budget).find((x) => x.c === 'travel')!
    expect(t).toMatchObject({ home: 0, dest: 6_000, ratio: null })
  })

  it('keeps the caption finite when the whole home budget is $0', () => {
    const zero = Object.fromEntries(Object.keys(base.budget).map((k) => [k, 0])) as unknown as PlanInputs['budget']
    const inputs = { ...base, budget: zero, amountOverrides: { [BKK.id]: { housing: 10_000 } } }
    const cap = costCaption(fake(inputs), inputs.budget)
    expect(cap).not.toMatch(/Infinity|NaN/)
    expect(cap).toContain('$10,000')
  })
})
