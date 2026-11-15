import { describe, expect, it } from 'vitest'
import { CITIES, CITY_BY_ID } from '../../../data/cities'
import { EXPAT_PICKS } from '../../../data/expatPicks'
import type { City, SimulationResult } from '../../../engine/types'
import {
  estateVsHome,
  movesWithinPlan,
  taxCompareText,
  taxInfoLabel,
  taxLines,
  taxNotice,
  taxStatus,
  UNMODELLED_REASON,
  unmodelledReason,
} from '../taxLines'

type Lt = NonNullable<SimulationResult['localTax']>
const lt = (o: Partial<Lt> = {}): Lt => ({
  wealthTaxMedian: 0,
  inheritanceTaxMedian: 0,
  bbdEstateBeforeTaxMedian: 0,
  inheritanceApplies: true,
  ...o,
})
const plan = (age: number, horizonYears = 25, moveInYears = 0) => ({ age: age - horizonYears, horizonYears, moveInYears })
const city = (id: string): City => {
  const c = CITY_BY_ID[id]
  if (!c) throw new Error(`no city ${id}`)
  return c
}

describe('taxStatus', () => {
  it('separates taxed, none, not modelled and US', () => {
    expect(taxStatus(city('tarragona'))).toBe('taxed')
    expect(taxStatus(city('nice'))).toBe('taxed')
    expect(taxStatus(city('paphos'))).toBe('none')
    expect(taxStatus(city('zurich'))).toBe('taxed') // modelled since the November 2026 fact check
    expect(taxStatus(city('toronto'))).toBe('unmodelled')
    expect(taxStatus(city('miami'))).toBe('us')
    expect(taxStatus(city('seattle'))).toBe('taxed') // Washington estate tax
    expect(taxStatus(city('philadelphia'))).toBe('taxed')
  })

  it('every top pick is in a researched country', () => {
    for (const p of EXPAT_PICKS) expect(taxStatus(city(p.cityId)), p.cityId).not.toBe('unmodelled')
  })
})

describe('taxNotice', () => {
  it('says "none" only for researched countries and "not modelled" otherwise', () => {
    expect(taxNotice(city('paphos'))).toMatch(/^No wealth or inheritance tax modelled for Cyprus/)
    const z = taxNotice(city('toronto'))!
    expect(z).toMatch(/^Local wealth and inheritance tax not modelled for Canada/)
    expect(z).not.toMatch(/^No /)
    expect(taxNotice(city('tarragona'))).toBeNull()
    expect(taxNotice(city('miami'))).toMatch(/^No state estate or inheritance tax here.*federal estate tax.*not modelled/)
    expect(taxNotice(city('chicago'))).toBeNull()
  })

  it('gives each unmodelled country its own reason: gains at death (Canada, Australia), a yearly deemed return (New Zealand)', () => {
    expect(taxNotice(city('toronto'))).toMatch(/death counts as a sale/)
    expect(taxNotice(city('sydney'))).toMatch(/non-resident heir.*at death/)
    const nz = taxNotice(city('auckland'))!
    expect(nz).toMatch(/every year on a deemed return/)
    expect(nz).not.toMatch(/at death|on leaving/)
    expect(unmodelledReason(city('auckland')).short).toMatch(/yearly/)
    expect(unmodelledReason(city('toronto')).short).toMatch(/gains at death/)
  })

  it('every unmodelled country in the dataset has a reason', () => {
    const codes = new Set(CITIES.filter((c) => taxStatus(c) === 'unmodelled').map((c) => c.countryCode))
    expect([...codes].sort()).toEqual(Object.keys(UNMODELLED_REASON).sort())
  })
})

describe('taxInfoLabel', () => {
  it('names the state for US cities and the country elsewhere', () => {
    expect(taxInfoLabel(city('seattle'))).toBe('How Washington’s estate tax is modelled')
    expect(taxInfoLabel(city('pittsburgh'))).toBe('How Pennsylvania’s inheritance tax is modelled')
    expect(taxInfoLabel(city('washington-dc'))).toBe('How the District of Columbia’s estate tax is modelled')
    expect(taxInfoLabel(city('tarragona'))).toBe('How Spain’s local taxes are modelled')
    for (const c of CITIES.filter((x) => x.countryCode === 'US' && x.localTax)) {
      expect(taxInfoLabel(c), c.id).not.toMatch(/United States|this state/)
    }
  })
})

describe('taxLines', () => {
  it('Tarragona: a wealth-tax amount, inheritance none for US heirs', () => {
    const lines = taxLines(city('tarragona'), lt({ wealthTaxMedian: 1_234_000, inheritanceApplies: false }), plan(90))
    expect(lines.map((l) => l.key)).toEqual(['wealth', 'inheritance'])
    expect(lines[0]).toMatchObject({ value: '$1.2M', muted: false })
    expect(lines[1]).toMatchObject({ value: null, muted: true })
    expect(lines[1].sub).toMatch(/US-resident heirs/)
  })

  it('Nice: no wealth tax on a portfolio, inheritance tax at the horizon age', () => {
    const lines = taxLines(city('nice'), lt({ inheritanceTaxMedian: 2_500_000 }), plan(95))
    expect(lines[0]).toMatchObject({ key: 'wealth', value: null, muted: true })
    expect(lines[1]).toMatchObject({ label: 'Inheritance tax at 95', value: '$2.5M', muted: false })
  })

  it('a zero median reads as under the threshold, muted', () => {
    const [w] = taxLines(city('tarragona'), lt(), plan(90))
    expect(w).toMatchObject({ value: '$0', muted: true })
    expect(w.sub).toMatch(/threshold/)
  })

  it('a residence-gated inheritance tax not reached says when it would apply', () => {
    const c = CITIES.find((x) => x.localTax?.inheritance?.afterYearsResident != null)!
    const lines = taxLines(c, lt({ inheritanceApplies: false }), plan(90))
    expect(lines[1].sub).toMatch(/after more than \d+ years/)
  })

  it('a move at or after the horizon: one line saying no local tax applies', () => {
    expect(movesWithinPlan({ horizonYears: 25, moveInYears: 24.9 })).toBe(true)
    expect(movesWithinPlan({ horizonYears: 25, moveInYears: 25 })).toBe(false)
    expect(movesWithinPlan({ horizonYears: 25, moveInYears: 30 })).toBe(false)
    const lines = taxLines(city('tarragona'), lt(), plan(90, 25, 25))
    expect(lines).toHaveLength(1)
    expect(lines[0]).toMatchObject({ key: 'move', value: null, muted: true })
    expect(lines[0].sub).toMatch(/don’t move within the plan/)
    expect(lines[0].sub).not.toMatch(/threshold/)
  })

  it('a taxed home city: lines from year 0, whatever the move year', () => {
    const lines = taxLines(city('chicago'), lt({ inheritanceTaxMedian: 700_000 }), plan(90, 25, 25), true)
    expect(lines.map((l) => l.key)).toEqual(['wealth', 'inheritance'])
    expect(lines[1]).toMatchObject({ label: 'State estate tax at 90', value: '$700K', muted: false })
    // The same plan with Chicago as a destination never moves there, so nothing applies.
    expect(taxLines(city('chicago'), lt(), plan(90, 25, 25))[0].key).toBe('move')
  })

  it('is empty for untaxed and unmodelled cities', () => {
    expect(taxLines(city('paphos'), lt(), plan(90))).toEqual([])
    expect(taxLines(city('toronto'), lt(), plan(90))).toEqual([])
    expect(taxLines(city('miami'), lt(), plan(90))).toEqual([])
  })

  it('US state taxes read as state estate (or Pennsylvania inheritance) tax', () => {
    const wa = taxLines(city('seattle'), lt({ inheritanceTaxMedian: 900_000 }), plan(90))
    expect(wa[0]).toMatchObject({ key: 'wealth', value: null, muted: true })
    expect(wa[1]).toMatchObject({ label: 'State estate tax at 90', value: '$900K', muted: false })
    expect(taxLines(city('pittsburgh'), lt({ inheritanceTaxMedian: 1 }), plan(90))[1].label).toBe('State inheritance tax at 90')
  })
})

describe('taxCompareText and estateVsHome', () => {
  it('compare text', () => {
    expect(taxCompareText(city('tarragona')).main).toBe('Wealth tax')
    expect(taxCompareText(city('nice')).main).toBe('Inheritance tax')
    expect(taxCompareText(city('paphos')).main).toBe('None')
    expect(taxCompareText(city('toronto')).main).toBe('Not modelled')
    expect(taxCompareText(city('zurich')).main).toBe('Wealth tax')
    expect(taxCompareText(city('boston')).main).toBe('State estate tax')
  })
  it('estate delta', () => {
    expect(estateVsHome(5_000_000, 5_010_000)).toBe('same')
    expect(estateVsHome(6_200_000, 5_000_000)).toBe('+$1.2M')
    expect(estateVsHome(4_000_000, 5_000_000)).toBe('−$1.0M')
  })
})
