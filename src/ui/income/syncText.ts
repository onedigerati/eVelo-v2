// Words and values for the sync sheet and chip. Pure, so the tests read them without a DOM.

import { CITY_BY_ID } from '../../data/cities'
import type { IncomeInputs } from '../../engine/incomeTypes'
import { SYNC_KEYS, type SyncField, type SyncRecord, type SyncSnapshot } from '../../state/incomeSync'
import { currency, percent } from '../format'

export const FIELD_TEXT: Record<SyncField, { label: string; note: string; short: string }> = {
  portfolio: { label: 'Portfolio', note: '', short: 'portfolio' },
  basisFraction: {
    label: 'Cost basis',
    note: 'The share of the portfolio that’s basis, for tax on sales',
    short: 'cost basis',
  },
  age: { label: 'Age', note: '', short: 'age' },
  horizonYears: { label: 'Years to plan for', note: '', short: 'years' },
  spending: {
    label: 'Spending',
    note: 'Your home-city budget, before any move',
    short: 'spending',
  },
  otherIncome: {
    label: 'Social Security',
    note: 'The amount and the age it starts',
    short: 'Social Security',
  },
  homeCityId: {
    label: 'Home city',
    note: 'Sets your state tax on bond interest',
    short: 'home city',
  },
  futures: {
    label: 'Simulated futures',
    note: 'Seed, paths, block length and outlook, so both face the same markets',
    short: 'futures',
  },
}

/** What each side never shares, named in the sheet. */
export const NEVER_SHARED = 'holdings mix, muni share, filing status, loan settings, destination'

const OUTLOOK: Record<string, string> = {
  historical: 'Historical',
  balanced: 'Balanced',
  conservative: 'Conservative',
}
const DASH = '—'

/** A field's value as shown, from either side (a snapshot or the mode's inputs); a missing value is a dash. */
export function valueText(field: SyncField, v: SyncSnapshot | IncomeInputs): string[] {
  const has = SYNC_KEYS[field].every((k) => v[k] !== undefined)
  if (!has) return [DASH]
  switch (field) {
    case 'portfolio':
    case 'spending':
      return [currency(v[field]!)]
    case 'basisFraction':
      return [percent(v.basisFraction!)]
    case 'age':
      return [String(v.age)]
    case 'horizonYears':
      return [`${v.horizonYears} years`]
    case 'otherIncome':
      return [v.otherIncome! > 0 ? `${currency(v.otherIncome!)} at ${v.incomeStartAge}` : 'none']
    case 'homeCityId':
      return [CITY_BY_ID[v.homeCityId!]?.name ?? v.homeCityId!]
    case 'futures':
      return [`${v.paths!.toLocaleString('en-US')} paths · ${v.blockMonths} mo`, `${OUTLOOK[v.outlook!] ?? v.outlook} · seed ${v.seed}`]
  }
}

/** "Nov 18": the site writes dates month first (en-US). */
export function syncDate(at: string): string {
  return new Date(at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

/** "spending, age" */
export const fieldList = (fields: readonly SyncField[]) => fields.map((f) => FIELD_TEXT[f].short).join(', ')

/** The chip's words: "Synced Nov 18 · 5 values", or "eVelo changed since · spending, age". */
export function chipText(record: SyncRecord, changed: readonly SyncField[]): string {
  if (changed.length) return `eVelo changed since · ${fieldList(changed)}`
  const n = record.fields.length
  return `Synced ${syncDate(record.at)} · ${n} ${n === 1 ? 'value' : 'values'}`
}

export const copyLabel = (n: number) => (n === 0 ? 'Copy' : `Copy ${n} ${n === 1 ? 'value' : 'values'}`)
