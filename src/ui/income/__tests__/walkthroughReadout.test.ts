import { describe, expect, it } from 'vitest'
import { rowAtX, walkReadout, walkReadoutAt } from '../walkthroughReadout'
import type { EveloYear, IncomeYear, WalkYear } from '../walkthrough'

const inc = (netWorth: number, sold: number) => ({ netWorth, sold }) as IncomeYear
const ev = (netWorth: number, portfolio: number, loan: number, ltv: number) => ({ netWorth, portfolio, loan, ltv }) as EveloYear
const row = (index: number, income: IncomeYear | null, evelo: EveloYear | null): WalkYear => ({ index, age: 60 + index, income, evelo })

// Four years: both lived for three, then Living on income has broken (no row) in the last.
const years: WalkYear[] = [
  row(0, inc(1_900_000, 0), ev(1_950_000, 2_050_000, 100_000, 0.0488)),
  row(1, inc(1_800_000, 45_000), ev(2_100_000, 2_300_000, 200_000, 0.087)),
  row(2, inc(2_200_000, 12_000), ev(2_100_000, 2_400_000, 300_000, 0.125)),
  row(3, null, ev(2_000_000, 2_400_000, 400_000, 0.1667)),
]

describe('walkReadout', () => {
  it('reads each figure off the year row, at the end of its age', () => {
    const r = walkReadout(years, 1)!
    expect(r.index).toBe(1)
    expect(r.age).toBe(61)
    expect(r.note).toBe('year 2')
    expect(r.income).toMatchObject({ netWorth: 1_800_000, sold: 45_000, text: { netWorth: '$1.8M', sold: '$45K' } })
    expect(r.evelo).toMatchObject({ netWorth: 2_100_000, portfolio: 2_300_000, loan: 200_000, ltv: 0.087 })
    expect(r.evelo!.text).toEqual({ netWorth: '$2.1M', portfolio: '$2.3M', loan: '$200K', ltv: '9%' })
    expect(r.gap).toMatchObject({ ahead: 'evelo', amount: 300_000, text: 'eVelo ahead by', value: '$300K' })
  })
  it('names the plan ahead when Living on income leads', () => {
    expect(walkReadout(years, 2)!.gap).toMatchObject({ ahead: 'income', text: 'Living on income ahead by', value: '$100K' })
  })
  it('gives a plan not lived that year no figures, and no gap', () => {
    const r = walkReadout(years, 3)!
    expect(r.income).toBeNull()
    expect(r.gap).toBeNull()
    expect(r.evelo?.netWorth).toBe(2_000_000)
    const both = walkReadout([row(0, null, ev(Number.NaN, 0, 0, 0))], 0)!
    expect(both.income).toBeNull()
    expect(both.evelo).toBeNull()
  })
  it('clamps the row and returns null without rows', () => {
    expect(walkReadout(years, -3)!.index).toBe(0)
    expect(walkReadout(years, 99)!.index).toBe(3)
    expect(walkReadout([], 0)).toBeNull()
  })
})

describe('walkReadoutAt', () => {
  // plot 48..448 over 4 rows: 100px a row
  it('reads the row under a pointer x, both ends included', () => {
    expect(rowAtX(48, 48, 448, 4)).toBe(0)
    expect(walkReadoutAt(years, 48, 48, 448)!.age).toBe(60)
    expect(walkReadoutAt(years, 0, 48, 448)!.index).toBe(0)
    expect(walkReadoutAt(years, 160, 48, 448)!.income?.sold).toBe(45_000)
    expect(walkReadoutAt(years, 447, 48, 448)!.index).toBe(3)
    expect(walkReadoutAt(years, 2000, 48, 448)).toMatchObject({ index: 3, age: 63, income: null })
  })
})
