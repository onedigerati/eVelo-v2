import { describe, expect, it } from 'vitest'
import { CITY_AIRPORT } from '../../../data/airports'
import { homeRoute } from '../homeRoute'

describe('homeRoute', () => {
  it('shows no line on the home city’s own profile', () => {
    expect(homeRoute('lisbon', 'lisbon')).toBeNull()
  })

  it('shows no line without a home', () => {
    expect(homeRoute(undefined, 'lisbon')).toBeNull()
    expect(homeRoute(null, 'lisbon')).toBeNull()
    expect(homeRoute('', 'lisbon')).toBeNull()
  })

  it('shows no line when either city has no airport in the data', () => {
    const { lisbon: _, ...noLisbon } = CITY_AIRPORT
    expect(homeRoute('london', 'lisbon', noLisbon)).toBeNull()
    expect(homeRoute('lisbon', 'london', noLisbon)).toBeNull()
    expect(homeRoute('nowhere', 'lisbon')).toBeNull()
  })

  it('depends on home: San Diego → Lisbon is one stop, London → Lisbon is nonstop', () => {
    const sd = homeRoute('san-diego', 'lisbon')
    const lon = homeRoute('london', 'lisbon')
    expect(sd?.route.kind).toBe('one-stop')
    expect(lon?.route.kind).toBe('nonstop')
    expect(sd?.sentence).toMatch(/^From San Diego \(SAN\): no nonstop; one stop via /)
    expect(lon?.sentence).toMatch(/^From London \(LON\): nonstop to Lisbon \(LIS\), about \d+–\d+ h\.$/)
  })
})
