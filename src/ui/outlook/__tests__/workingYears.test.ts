import { describe, expect, it, vi } from 'vitest'

// fanMarkers is pure, but FanCard imports the store, which reads `window` on load.
vi.mock('../../../state/store', () => ({ useStore: () => undefined }))
vi.mock('../../../state/fx', () => ({ useFx: () => undefined, useRate: () => 1 }))
import { DEFAULT_INPUTS } from '../../../engine/defaults'
import type { PlanInputs, SimulationResult } from '../../../engine/types'
import { CITIES } from '../../../data/cities'
import { markerRows, workingYears, workingYearsSentence } from '../chartKit'
import { fanMarkers } from '../FanCard'

const plan = (o: Partial<PlanInputs>): PlanInputs => ({ ...DEFAULT_INPUTS, age: 60, horizonYears: 35, ...o })
const result = (o: Partial<PlanInputs>) => ({ inputs: plan(o) }) as unknown as SimulationResult
const dest = CITIES.find((c) => c.id !== DEFAULT_INPUTS.homeCityId)!

describe('workingYears', () => {
  it('is null when retiring now', () => {
    expect(workingYears(plan({ retireInYears: 0, savingsWhileWorking: 60_000 }))).toBeNull()
    expect(workingYears({ age: 60, horizonYears: 35 })).toBeNull()
  })
  it('runs from today to retirement, labelled with the savings', () => {
    expect(workingYears(plan({ retireInYears: 4, savingsWhileWorking: 60_000 }))).toEqual({
      from: 60,
      to: 64,
      years: 4,
      savings: 60_000,
      label: 'Working · +$60K/yr',
    })
    expect(workingYears(plan({ retireInYears: 4, savingsWhileWorking: 0 }))?.label).toBe('Working')
  })
  it('stays below the horizon and ignores junk', () => {
    expect(workingYears(plan({ retireInYears: 9, horizonYears: 5 }))?.to).toBe(64)
    expect(workingYears(plan({ retireInYears: Number.NaN }))).toBeNull()
    expect(workingYears(plan({ retireInYears: 2, savingsWhileWorking: Number.NaN }))?.label).toBe('Working')
  })
  it('describes itself for screen readers', () => {
    expect(workingYearsSentence(null)).toBe('')
    expect(workingYearsSentence(workingYears(plan({ retireInYears: 4, savingsWhileWorking: 60_000 })))).toBe(
      ' Working years, age 60 to 64, are shaded, saving $60K a year; a dashed line marks retirement at 64.',
    )
  })
})

describe('markerRows', () => {
  it('keeps apart labels that would collide, and clears a reserved left edge', () => {
    expect(markerRows([{ x0: 0, x1: 100 }, { x0: 200, x1: 300 }])).toEqual([0, 0])
    expect(markerRows([{ x0: 0, x1: 100 }, { x0: 50, x1: 150 }, { x0: 160, x1: 200 }])).toEqual([0, 1, 0])
    expect(markerRows([{ x0: 10, x1: 80 }], 8, 40)).toEqual([1])
  })
})

describe('fanMarkers', () => {
  const labels = (o: Partial<PlanInputs>) => fanMarkers(result(o)).map((m) => [m.age, m.label, m.kind ?? ''])

  it('is unchanged when retiring now', () => {
    expect(labels({ destCityId: dest.id, moveInYears: 5, otherIncome: 0 })).toEqual([[65, `Move to ${dest.name}`, '']])
  })
  it('adds a retire marker, folding a move that happens at retirement into it', () => {
    expect(labels({ retireInYears: 4, destCityId: dest.id, moveInYears: 0, otherIncome: 0 })).toEqual([
      [64, `Retire · move to ${dest.name} · 64`, 'retire'],
    ])
    expect(labels({ retireInYears: 4, destCityId: dest.id, moveInYears: 2, otherIncome: 0 })).toEqual([
      [64, `Retire · move to ${dest.name} · 64`, 'retire'],
    ])
  })
  it('keeps a later move as its own marker', () => {
    expect(labels({ retireInYears: 4, destCityId: dest.id, moveInYears: 10, otherIncome: 0 })).toEqual([
      [70, `Move to ${dest.name}`, ''],
      [64, 'Retire · 64', 'retire'],
    ])
  })
  it('starts income no earlier than retirement', () => {
    expect(labels({ retireInYears: 4, destCityId: null, otherIncome: 20_000, incomeStartAge: 62 })).toEqual([
      [64, 'Retire · income starts · 64', 'retire'],
    ])
    expect(labels({ retireInYears: 4, destCityId: null, otherIncome: 20_000, incomeStartAge: 67 })).toEqual([
      [67, 'Income starts', ''],
      [64, 'Retire · 64', 'retire'],
    ])
  })
})
