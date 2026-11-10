import { describe, expect, it, vi } from 'vitest'

// atlasData imports the store and the sim client, which touch `window` on load.
vi.mock('../../../state/store', () => ({ useStore: () => undefined }))
vi.mock('../../../state/sim', () => ({}))
import { CITY_BY_ID } from '../../../data/cities'
import { DEFAULT_INPUTS } from '../../../engine/defaults'
import type { BudgetCategory, PlanInputs } from '../../../engine/types'
import { categoryCompare } from '../picks'
import { spendNote, spendRowSpoken } from '../profileSpend'

const HOME = DEFAULT_INPUTS.homeCityId
const inputs: PlanInputs = {
  ...DEFAULT_INPUTS,
  ratioOverrides: { dining: 0.6 },
  amountOverrides: { lisbon: { housing: 12_000 }, bangkok: { groceries: 3_000 } },
}
const marks = (i: PlanInputs, cityId: string) =>
  Object.fromEntries(categoryCompare(i, CITY_BY_ID[cityId]).map((c) => [c.cat, c.override])) as Record<BudgetCategory, string | null>

describe('categoryCompare override marks', () => {
  it('marks this city’s typed $ as amount and a typed % as ratio, nothing else', () => {
    const m = marks(inputs, 'lisbon')
    expect(m.housing).toBe('amount')
    expect(m.dining).toBe('ratio')
    // Bangkok's groceries $ is not Lisbon's
    expect(m.groceries).toBeNull()
    for (const c of ['transport', 'utilities', 'healthcare', 'travel', 'other'] as const) expect(m[c] ?? null).toBeNull()
  })

  it('marks the typed % on every non-home city, and each city’s own $ only there', () => {
    const m = marks(inputs, 'bangkok')
    expect(m.dining).toBe('ratio')
    expect(m.groceries).toBe('amount')
    expect(m.housing).toBeNull()
    expect(marks(inputs, 'algarve').dining).toBe('ratio')
  })

  it('a typed $ wins over a typed % in the same category', () => {
    const i = { ...inputs, ratioOverrides: { housing: 2, dining: 0.6 } }
    expect(marks(i, 'lisbon').housing).toBe('amount')
    expect(marks(i, 'bangkok').housing).toBe('ratio')
  })

  it('the home profile carries no mark, even with a $ keyed by the home city', () => {
    const i = { ...inputs, amountOverrides: { [HOME]: { housing: 1 } } }
    expect(Object.values(marks(i, HOME)).every((v) => v === null)).toBe(true)
  })

  it('no overrides, no marks', () => {
    expect(Object.values(marks(DEFAULT_INPUTS, 'lisbon')).every((v) => v === null)).toBe(true)
  })
})

describe('spendNote', () => {
  const note = (i: PlanInputs, cityId: string) => spendNote(categoryCompare(i, CITY_BY_ID[cityId]), 'St. Louis', i.expatFactor, cityId === HOME)

  it('names the categories with a typed $ and a typed %', () => {
    expect(note(inputs, 'lisbon')).toBe(
      'Your St. Louis budget at local prices, with your expat price premium (35%), your own amount for Housing and your change for Dining out.',
    )
  })

  it('lists several categories of one kind', () => {
    const i = { ...DEFAULT_INPUTS, ratioOverrides: { dining: 0.6, travel: 1.2, other: 0.9 } }
    expect(note(i, 'lisbon')).toBe(
      'Your St. Louis budget at local prices, with your expat price premium (35%) and your changes for Dining out, Travel and Other.',
    )
    const j = { ...DEFAULT_INPUTS, amountOverrides: { lisbon: { housing: 12_000, groceries: 4_000 } } }
    expect(note(j, 'lisbon')).toContain('and your own amounts for Housing and Groceries.')
  })

  it('says nothing about overrides when none apply here', () => {
    const n = note(DEFAULT_INPUTS, 'lisbon')
    expect(n).toBe('Your St. Louis budget at local prices, with your expat price premium (35%).')
    // another city's $ does not count on Algarve
    expect(note({ ...DEFAULT_INPUTS, amountOverrides: { lisbon: { housing: 1 } } }, 'algarve')).toBe(n)
    expect(note(inputs, HOME)).toBe('Your budget at St. Louis prices, as you set it in the plan.')
    expect(note(inputs, HOME)).not.toMatch(/your (own amount|change)/)
  })
})

describe('spendRowSpoken', () => {
  const rows = categoryCompare(inputs, CITY_BY_ID.lisbon)
  const row = (c: BudgetCategory) => rows.find((r) => r.cat === c)!

  it('ends a typed $ row with "your amount" and a typed % row with "your change"', () => {
    expect(spendRowSpoken(row('housing'), 'St. Louis', false)).toMatch(/^Housing: \$12K here vs .+ in St\. Louis, .+, your amount\.$/)
    expect(spendRowSpoken(row('dining'), 'St. Louis', false)).toMatch(/^Dining out: .+, −40%, your change\.$/)
  })

  it('leaves other rows and the home profile unmarked', () => {
    const s = spendRowSpoken(row('groceries'), 'St. Louis', false)
    expect(s).not.toMatch(/your (amount|change)/)
    for (const r of categoryCompare(inputs, CITY_BY_ID[HOME])) expect(spendRowSpoken(r, 'St. Louis', true)).not.toMatch(/your (amount|change)/)
  })
})
