import { describe, expect, it } from 'vitest'
import { effectiveMoveInYears, placePhraseFor, retireAge, retireInYearsOf } from '../retire'

const base = { age: 55, retireInYears: 0, moveInYears: 0 }

describe('retire ages', () => {
  it('retires at age + working years; junk counts as now', () => {
    expect(retireAge(base)).toBe(55)
    expect(retireAge({ ...base, retireInYears: 4 })).toBe(59)
    expect(retireInYearsOf({ retireInYears: NaN })).toBe(0)
    expect(retireInYearsOf({ retireInYears: -2 })).toBe(0)
  })

  it('moves no earlier than retirement: max(move, retirement)', () => {
    expect(effectiveMoveInYears({ moveInYears: 0, retireInYears: 0 })).toBe(0)
    expect(effectiveMoveInYears({ moveInYears: 6, retireInYears: 0 })).toBe(6)
    expect(effectiveMoveInYears({ moveInYears: 2, retireInYears: 4 })).toBe(4)
    expect(effectiveMoveInYears({ moveInYears: 6, retireInYears: 4 })).toBe(6)
  })
})

describe('placePhraseFor', () => {
  it('keeps the retire-now sentences', () => {
    expect(placePhraseFor(base, 'St. Louis', null)).toBe('staying in St. Louis')
    expect(placePhraseFor(base, 'St. Louis', 'Bangkok')).toBe('living in Bangkok from age 55')
    expect(placePhraseFor({ ...base, moveInYears: 5 }, 'St. Louis', 'Lisbon')).toBe('in St. Louis, moving to Lisbon at 60')
  })

  it('names the retirement age when working first', () => {
    const working = { ...base, retireInYears: 4 }
    expect(placePhraseFor(working, 'St. Louis', null)).toBe('working in St. Louis until 59 and retiring there')
    // a move set at or before retirement happens at retirement
    for (const moveInYears of [0, 2, 4])
      expect(placePhraseFor({ ...working, moveInYears }, 'St. Louis', 'Bangkok')).toBe('working in St. Louis until 59, then living in Bangkok')
    // a later move keeps its own age
    expect(placePhraseFor({ ...working, moveInYears: 6 }, 'St. Louis', 'Bangkok')).toBe('working until 59, then in St. Louis, moving to Bangkok at 61')
  })
})
