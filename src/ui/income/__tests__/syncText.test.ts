import { describe, expect, it } from 'vitest'
import { INCOME_DEFAULTS } from '../../../engine/income'
import { SYNC_FIELDS, type SyncRecord } from '../../../state/incomeSync'
import { chipText, copyLabel, FIELD_TEXT, NEVER_SHARED, syncDate, valueText } from '../syncText'

const rec: SyncRecord = {
  at: '2026-11-18T15:00:00.000Z',
  fields: ['portfolio', 'age', 'spending', 'homeCityId', 'futures'],
  snapshot: {},
}

describe('sync words', () => {
  it('labels every field', () => {
    for (const f of SYNC_FIELDS) expect(FIELD_TEXT[f].label.length).toBeGreaterThan(2)
    expect(FIELD_TEXT.spending.note).toMatch(/home-city budget/)
  })
  it('names what is never shared', () => {
    for (const w of ['holdings mix', 'muni share', 'filing status', 'loan settings', 'destination']) expect(NEVER_SHARED).toContain(w)
  })
  it('writes dates month first, like the site', () => {
    expect(syncDate(rec.at)).toBe('Nov 18')
  })
  it('chip: synced, or what changed', () => {
    expect(chipText(rec, [])).toBe('Synced Nov 18 · 5 values')
    expect(chipText({ ...rec, fields: ['age'] }, [])).toBe('Synced Nov 18 · 1 value')
    expect(chipText(rec, ['age', 'spending'])).toBe('eVelo changed since · age, spending')
  })
  it('copy button counts the ticks', () => {
    expect(copyLabel(5)).toBe('Copy 5 values')
    expect(copyLabel(1)).toBe('Copy 1 value')
    expect(copyLabel(0)).toBe('Copy')
  })
  it('shows each side’s value, a dash when missing', () => {
    const i = {
      ...INCOME_DEFAULTS,
      portfolio: 2_400_000,
      otherIncome: 38_000,
      incomeStartAge: 67,
      homeCityId: 'st-louis',
    }
    expect(valueText('portfolio', i)).toEqual(['$2,400,000'])
    expect(valueText('otherIncome', i)).toEqual(['$38,000 at 67'])
    expect(valueText('otherIncome', { ...i, otherIncome: 0 })).toEqual(['none'])
    expect(valueText('homeCityId', i)).toEqual(['St. Louis'])
    expect(valueText('basisFraction', { ...i, basisFraction: 0.6 })).toEqual(['60%'])
    expect(valueText('futures', i)[0]).toMatch(/paths/)
    expect(valueText('spending', {})).toEqual(['—'])
  })
})
