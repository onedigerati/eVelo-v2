// Pure pieces of the six questions (IncomeAsk.tsx): which chart layers a step shows, how the inline
// fields read what's typed, and how each field shows its value. No DOM, no React.
//
// The questions (docs/PLAN.md, 2026-11-18): 1 saved, basis and spending · 2 age and horizon ·
// 3 stocks (draws dividends) · 4 munis (muni coupons and taxable interest) · 5 home city and filing
// (tax) · 6 Social Security (spending and the gap). The chart draws a question's layer while that
// question is on screen, so its "Just added" line names what the answer feeds; the results show all.

import type { IncomeInputs } from '../../engine/incomeTypes'
import { CITIES } from '../../data/cities'
import type { City } from '../../engine/types'
import { currency, parseLoose } from '../format'
import type { IncomeLayers } from './incomeChart'

export const STEPS = 6

/** Chart layers for a step: none on questions 1–2, one more per question from 3, all on the results. */
export function layersFor(step: number, done: boolean): IncomeLayers {
  if (done) return 5
  const s = Number.isFinite(step) ? Math.round(step) : 1
  return Math.min(4, Math.max(0, s - 2)) as IncomeLayers
}

/** A dollar amount as typed: "2.4M", "$96,000", "96k", "1.2 million". Null when it doesn't read as
 *  one, or is negative. */
export function parseMoney(raw: string): number | null {
  const s = raw.trim().toLowerCase().replace(/\s*(million|mil|mm)$/, 'm').replace(/\s*(thousand)$/, 'k').replace(/\s*(billion|bn)$/, 'b')
  if (s.includes('%')) return null
  const v = parseLoose(s, 'currency')
  return v === null || v < 0 ? null : v
}

/** A share as typed, "60", "60%" or "0.6%" → 0.6 / 0.006; null when it doesn't read or is outside 0–100%. */
export function parseShare(raw: string): number | null {
  const v = parseLoose(raw.replace('%', ''), 'percent')
  return v === null || v < 0 || v > 1 ? null : v
}

/** A whole number of years as typed ("62", "62 years"). */
export function parseWhole(raw: string): number | null {
  const m = raw.trim().match(/^(\d{1,3})(\.\d+)?\s*(years?|yrs?)?$/i)
  return m ? Math.round(parseFloat(m[1] + (m[2] ?? ''))) : null
}

/** "$2,400,000" for a field at rest: whole dollars, readable and re-parseable. */
export const moneyText = (v: number) => currency(v)
/** "60%" for a share at rest; below 10%, a share that isn't a whole percent keeps one decimal
 *  ("0.4%", "7.5%"), so a small answer never reads as "0%". */
export function shareText(v: number): string {
  const tenths = Math.round(v * 1000) / 10
  return tenths < 10 && !Number.isInteger(tenths) ? `${tenths.toFixed(1)}%` : `${Math.round(v * 100)}%`
}

export type NumberKey = 'portfolio' | 'basisFraction' | 'spending' | 'age' | 'horizonYears' | 'stockShare' | 'muniShare' | 'otherIncome' | 'incomeStartAge'
export type FieldKind = 'money' | 'share' | 'whole'

export const FIELD_KIND: Record<NumberKey, FieldKind> = {
  portfolio: 'money',
  basisFraction: 'share',
  spending: 'money',
  age: 'whole',
  horizonYears: 'whole',
  stockShare: 'share',
  muniShare: 'share',
  otherIncome: 'money',
  incomeStartAge: 'whole',
}

export function parseField(kind: FieldKind, raw: string): number | null {
  return kind === 'money' ? parseMoney(raw) : kind === 'share' ? parseShare(raw) : parseWhole(raw)
}

export function fieldText(kind: FieldKind, v: number): string {
  return kind === 'money' ? moneyText(v) : kind === 'share' ? shareText(v) : String(v)
}

/** Home cities for the select: eVelo's US cities first (they have a state tax), then the rest by
 *  region, alphabetical within. */
export function cityGroups(cities: readonly City[] = CITIES): { label: string; cities: City[] }[] {
  const by = (a: City, b: City) => a.name.localeCompare(b.name)
  const us = cities.filter((c) => c.countryCode === 'US').sort(by)
  const groups: { label: string; cities: City[] }[] = [{ label: 'United States', cities: us }]
  const regions = [...new Set(cities.filter((c) => c.countryCode !== 'US').map((c) => c.region))]
  for (const r of regions) groups.push({ label: `${r} (federal tax only)`, cities: cities.filter((c) => c.countryCode !== 'US' && c.region === r).sort(by) })
  return groups
}

/** The answers so far in one plain line, shown above the question (the mockup's recap). */
export function recapLine(step: number, i: Pick<IncomeInputs, 'portfolio' | 'spending' | 'age' | 'horizonYears' | 'stockShare' | 'muniShare'>): string {
  const parts: string[] = []
  if (step > 1) parts.push(`${compactMoney(i.portfolio)} saved, ${currency(i.spending)} a year`)
  if (step > 2) parts.push(`age ${i.age}, for ${i.horizonYears} years`)
  if (step > 3) parts.push(`${shareText(i.stockShare)} in stocks`)
  if (step > 4) parts.push(`${shareText(i.muniShare)} of bonds in munis`)
  return parts.length ? parts.join(' · ') : ''
}

function compactMoney(v: number): string {
  if (v >= 1e6) return `$${(Math.round(v / 1e5) / 10).toLocaleString('en-US')}M`
  return currency(v)
}

/** Question 4's hint: the two bond yields the futures start from (the engine's startYield). */
export function muniHint(start: { munis: number; taxable: number } | null): string {
  const base = 'Munis pay no federal tax; taxable bonds and Treasuries pay more but are taxed as income.'
  if (!start || !Number.isFinite(start.munis) || !Number.isFinite(start.taxable)) return base
  const p = (v: number) => `${(Math.round(v * 1000) / 10).toFixed(1)}%`
  return `Today munis yield about ${p(start.munis)}, free of federal tax; taxable bonds about ${p(start.taxable)}, taxed as income. The higher your bracket, the more munis win.`
}
