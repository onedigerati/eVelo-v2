import { describe, expect, it } from 'vitest'
import { CITY_BY_ID } from '../../../data/cities'
import { pillCity, pillLabel } from '../pillCity'

// Same resolution as outlook/cards `cityName` (kept local: cards.tsx pulls in UI modules).
const nameOf = (id: string) => CITY_BY_ID[id]?.name ?? id
const home = Object.keys(CITY_BY_ID)[0]
const dest = 'la-paz'

describe('pillCity', () => {
  it('names the destination when one is set', () => {
    expect(pillCity({ homeCityId: home, destCityId: dest }, nameOf)).toBe(CITY_BY_ID[dest].name)
  })
  it('names the home city when staying home', () => {
    expect(pillCity({ homeCityId: home, destCityId: null }, nameOf)).toBe(CITY_BY_ID[home].name)
  })
  it('returns null when no name resolves', () => {
    expect(pillCity({ homeCityId: '', destCityId: null }, nameOf)).toBeNull()
    expect(pillCity({ homeCityId: 'x', destCityId: null }, () => '')).toBeNull()
  })
})

describe('pillLabel', () => {
  it('speaks the city with each action', () => {
    expect(pillLabel(0.684, 'Bangkok', 'outlook')).toBe('Holds in 68% of futures in Bangkok. See the outlook.')
    expect(pillLabel(0.684, 'Bangkok', 'verdict')).toBe('Holds in 68% of futures in Bangkok. Back to the verdict.')
    expect(pillLabel(0.684, 'Bangkok', 'drawer')).toBe('Holds in 68% of futures in Bangkok. Close the plan and go to the verdict.')
  })
  it('keeps the old label without a city', () => {
    expect(pillLabel(0.684, null, 'outlook')).toBe('Holds in 68% of futures. See the outlook.')
    expect(pillLabel(0.5, null, 'verdict')).toBe('Holds in 50% of futures. Back to the verdict.')
    expect(pillLabel(0.5, null, 'drawer')).toBe('Holds in 50% of futures. Close the plan and go to the verdict.')
  })
})
