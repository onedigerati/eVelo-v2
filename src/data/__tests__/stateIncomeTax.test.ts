import { describe, expect, it } from 'vitest'
import { CITIES } from '../cities'
import { STATE_INCOME_TAX, stateIncomeTaxFor } from '../stateIncomeTax'
import { incomeTax } from '../../engine/incomeTax'
import type { IncomeYear } from '../../engine/incomeTaxTypes'

const US = CITIES.filter((c) => c.countryCode === 'US')
const NON_US = CITIES.filter((c) => c.countryCode !== 'US')
const RECORDS = Object.entries(STATE_INCOME_TAX)

describe('state income tax data', () => {
  it('has a record for every US city and none for other cities', () => {
    expect(US.length).toBe(33)
    for (const c of US) expect(stateIncomeTaxFor(c.id), c.id).toBeDefined()
    for (const c of NON_US) expect(stateIncomeTaxFor(c.id), c.id).toBeUndefined()
    expect(Object.keys(STATE_INCOME_TAX).sort()).toEqual(US.map((c) => c.id).sort())
    expect(stateIncomeTaxFor('toString')).toBeUndefined()
  })

  it('maps cities to the right states', () => {
    expect(stateIncomeTaxFor('kansas-city')?.state).toBe('MO')
    expect(stateIncomeTaxFor('washington-dc')?.state).toBe('DC')
    expect(stateIncomeTaxFor('portland')?.state).toBe('OR')
    expect(new Set(RECORDS.map(([, r]) => r.state)).size).toBe(21)
  })

  it('gives no-tax states empty bands and no tax on investment income', () => {
    for (const st of ['FL', 'TX', 'NV', 'TN', 'WA']) {
      const recs = RECORDS.filter(([, r]) => r.state === st)
      expect(recs.length, st).toBeGreaterThan(0)
      for (const [id, r] of recs) {
        expect(r.taxesInvestmentIncome, id).toBe(false)
        expect(r.bands.single, id).toEqual([])
        expect(r.bands.mfj, id).toEqual([])
        expect(r.taxesSocialSecurity, id).toBe(false)
        expect(r.localRate, id).toBeUndefined()
      }
    }
    for (const [id, r] of RECORDS) if (!r.taxesInvestmentIncome) expect(['FL', 'TX', 'NV', 'TN', 'WA'], id).toContain(r.state)
  })

  it('records the muni exceptions: Illinois all-taxed, Utah reciprocal, DC in-state-exempt from 2025', () => {
    expect(stateIncomeTaxFor('chicago')?.muni).toBe('all-taxed')
    expect(stateIncomeTaxFor('salt-lake-city')?.muni).toBe('reciprocal')
    // DC exempted every state's munis until 2024, but taxes out-of-state munis from tax year 2025
    // (D.C. Code § 47-1803.02(a)(1)(B)(ii)); see docs/research/state-muni-rules.md.
    expect(stateIncomeTaxFor('washington-dc')?.muni).toBe('in-state-exempt')
    for (const id of ['new-york', 'san-francisco', 'boston', 'philadelphia', 'denver']) {
      expect(stateIncomeTaxFor(id)?.muni, id).toBe('in-state-exempt')
    }
  })

  it('has sorted bands from zero with rates between 0 and 15%', () => {
    for (const [id, r] of RECORDS) {
      for (const status of ['single', 'mfj'] as const) {
        const b = r.bands[status]
        if (r.taxesInvestmentIncome) {
          expect(b.length, `${id} ${status}`).toBeGreaterThan(0)
          expect(b[0].from, `${id} ${status}`).toBe(0)
        }
        for (let i = 0; i < b.length; i++) {
          expect(b[i].rate, `${id} ${status}`).toBeGreaterThanOrEqual(0)
          expect(b[i].rate, `${id} ${status}`).toBeLessThanOrEqual(0.15)
          if (i > 0) expect(b[i].from, `${id} ${status}`).toBeGreaterThan(b[i - 1].from)
        }
        expect(r.deduction[status], `${id} ${status}`).toBeGreaterThanOrEqual(0)
      }
      if (r.localRate !== undefined) expect(r.localRate, id).toBeGreaterThan(0)
      if (r.localRate !== undefined) expect(r.localRate, id).toBeLessThan(0.05)
    }
  })

  it('records the local taxes that reach investment income', () => {
    expect(stateIncomeTaxFor('new-york')?.localRate).toBeCloseTo(0.03876, 5)
    expect(stateIncomeTaxFor('philadelphia')?.localRate).toBeCloseTo(0.0374, 4)
    for (const id of ['pittsburgh', 'kansas-city', 'st-louis', 'portland']) expect(stateIncomeTaxFor(id)?.localRate, id).toBeUndefined()
  })

  it('taxes Social Security only in Minnesota and Utah among these states', () => {
    const taxing = [...new Set(RECORDS.filter(([, r]) => r.taxesSocialSecurity).map(([, r]) => r.state))].sort()
    expect(taxing).toEqual(['MN', 'UT'])
  })

  it('models Georgia\'s 65+ retirement exclusion and Missouri\'s capital-gains subtraction, and nothing else uses them', () => {
    expect(stateIncomeTaxFor('atlanta')?.retirementExclusionPer65).toBe(65_000)
    expect(stateIncomeTaxFor('kansas-city')?.gainsExclusion).toBe(1)
    expect(stateIncomeTaxFor('st-louis')?.gainsExclusion).toBe(1)
    for (const [id, r] of RECORDS) {
      if (r.state !== 'GA') expect(r.retirementExclusionPer65, id).toBeUndefined()
      if (r.state !== 'MO') expect(r.gainsExclusion, id).toBeUndefined()
    }
    // Missouri: gains add no state tax. Georgia: one 65+ filer pays nothing on 60k of dividends.
    const mo = stateIncomeTaxFor('kansas-city')
    const opts = { status: 'single' as const, over65: 1 as const, priceLevel: 1, year: 2026 }
    expect(incomeTax({ longTermGains: 500_000 }, { ...opts, state: mo }).state).toBe(0)
    expect(incomeTax({ qualifiedDividends: 60_000 }, { ...opts, state: stateIncomeTaxFor('atlanta') }).state).toBe(0)
  })

  it('end to end: Chicago and DC tax muni interest, Miami charges no state tax', () => {
    const inc: IncomeYear = { muniInterest: 100_000, qualifiedDividends: 20_000 }
    const opts = { status: 'single' as const, over65: 0 as const, priceLevel: 1, year: 2026 }
    const chicago = incomeTax(inc, { ...opts, state: stateIncomeTaxFor('chicago') })
    const dc = incomeTax(inc, { ...opts, state: stateIncomeTaxFor('washington-dc') })
    const miami = incomeTax(inc, { ...opts, state: stateIncomeTaxFor('miami') })
    // IL: (120,000 - 2,925) x 4.95% = 5,795.2125
    expect(chicago.state).toBeCloseTo(5_795.2125, 6)
    // DC: 120,000 - 16,100 = 103,900: 400 + 1,800 + 1,300 + 8.5% x 43,900 = 3,731.5 -> 7,231.5
    expect(dc.state).toBeCloseTo(7_231.5, 6)
    expect(miami.state).toBe(0)
    // the muni interest is what they tax
    const noMuni = { qualifiedDividends: 20_000 }
    expect(chicago.state - incomeTax(noMuni, { ...opts, state: stateIncomeTaxFor('chicago') }).state).toBeCloseTo(4_950, 6)
    expect(dc.state).toBeGreaterThan(incomeTax(noMuni, { ...opts, state: stateIncomeTaxFor('washington-dc') }).state + 6_000)
    // federal is the same everywhere
    expect(dc.federal).toBeCloseTo(chicago.federal, 9)
    expect(miami.total).toBeCloseTo(miami.federal, 9)
  })

  it('excludes pensions from the state base only in Illinois, Pennsylvania and Hawaii', () => {
    const excluding = [...new Set(RECORDS.filter(([, r]) => r.taxesInvestmentIncome && !r.taxesPensions).map(([, r]) => r.state))].sort()
    expect(excluding).toEqual(['HI', 'IL', 'PA'])
    for (const id of ['philadelphia', 'pittsburgh', 'chicago', 'honolulu']) expect(stateIncomeTaxFor(id)?.taxesPensions, id).toBe(false)
    // a $60k pension adds no Chicago state tax, but does in Denver
    const opts = { status: 'single' as const, over65: 0 as const, priceLevel: 1, year: 2026 }
    const add = (id: string) =>
      incomeTax({ otherOrdinary: 60_000, qualifiedDividends: 20_000 }, { ...opts, state: stateIncomeTaxFor(id) }).state -
      incomeTax({ qualifiedDividends: 20_000 }, { ...opts, state: stateIncomeTaxFor(id) }).state
    expect(add('chicago')).toBe(0)
    expect(add('philadelphia')).toBe(0)
    expect(add('denver')).toBeCloseTo(0.044 * 60_000, 6)
  })

  it('Philadelphia: the School Income Tax skips Treasury interest and long-term gains but reaches a national muni fund', () => {
    const phl = stateIncomeTaxFor('philadelphia')!
    expect(phl.localExcludesLongTermGains).toBe(true)
    const opts = { status: 'single' as const, over65: 0 as const, priceLevel: 1, year: 2026, state: phl }
    const base = incomeTax({ qualifiedDividends: 10_000 }, opts).state
    // dividends: (3.07% + 3.74%) x 10,000
    expect(base).toBeCloseTo(681, 6)
    // Treasury interest: neither state nor local
    expect(incomeTax({ qualifiedDividends: 10_000, treasuryInterest: 50_000 }, opts).state).toBeCloseTo(base, 6)
    // long-term gains: state 3.07% only
    expect(incomeTax({ qualifiedDividends: 10_000, longTermGains: 50_000 }, opts).state - base).toBeCloseTo(0.0307 * 50_000, 6)
    // national muni fund: only its Pennsylvania share is exempt (SIT regs §206(b)(3)), taken as none
    expect(incomeTax({ qualifiedDividends: 10_000, muniInterest: 50_000 }, opts).state - base).toBeCloseTo(0.0681 * 50_000, 6)
  })

  it('cites at least one dated source per record', () => {
    for (const [id, r] of RECORDS) {
      expect(r.sources.length, id).toBeGreaterThan(0)
      expect(r.sources.some((s) => /https?:\/\//.test(s) && /\d{4}-\d{2}-\d{2}/.test(s)), id).toBe(true)
    }
  })
})
