// Local wealth/inheritance tax wording for the Atlas (pure: no store, no DOM).
//
// Three cases, kept apart so "not researched" never reads as "untaxed":
//   - taxed:      the destination has a wealth and/or inheritance component (Spain, France, Italy…)
//   - none:       researched, and nothing reaches a US portfolio (Cyprus, Portugal…)
//   - unmodelled: no researched data for the country (Switzerland, UK, UAE…): the simulation
//                 applies no local tax there, which is not the same as there being none.
// US cities are home ground: the planner models no state or federal estate tax anywhere.

import type { City, PlanInputs, SimulationResult } from '../../engine/types'
import { currencyCompact } from '../format'

export type TaxStatus = 'taxed' | 'none' | 'unmodelled' | 'us'

export function taxStatus(city: City): TaxStatus {
  if (city.countryCode === 'US') return 'us'
  const lt = city.localTax
  if (!lt) return 'unmodelled'
  return lt.wealth || lt.inheritance ? 'taxed' : 'none'
}

/** Short label for list rows and the compare sheet. */
export const TAX_STATUS_SHORT: Record<TaxStatus, string> = {
  taxed: 'Wealth or inheritance tax',
  none: 'None on a US portfolio',
  unmodelled: 'Tax not modelled',
  us: 'US: none modelled',
}

/** One-line notice for the cases with nothing to quantify; null when the city is taxed. */
export function taxNotice(city: City): string | null {
  switch (taxStatus(city)) {
    case 'none':
      return `No wealth or inheritance tax modelled for ${city.country}: none reaches a US portfolio.`
    case 'unmodelled':
      return `Local wealth and inheritance tax not modelled for ${city.country}: eVelo hasn’t researched it, so the odds and estate here assume none. Check before you count on that.`
    case 'us':
      return 'No state or federal estate tax is modelled for US cities.'
    default:
      return null
  }
}

/** What the compare sheet shows for a city's local taxes. */
export function taxCompareText(city: City): { main: string; sub: string } {
  const s = taxStatus(city)
  const lt = city.localTax
  if (s === 'taxed' && lt) {
    const parts = [lt.wealth && 'wealth tax', lt.inheritance && 'inheritance tax'].filter(Boolean) as string[]
    const main = parts.join(' + ')
    return { main: main.charAt(0).toUpperCase() + main.slice(1), sub: 'Included in the odds and estate' }
  }
  if (s === 'none') return { main: 'None', sub: `None reaches a US portfolio in ${city.country}` }
  if (s === 'unmodelled') return { main: 'Not modelled', sub: `${city.country} not researched: not the same as none` }
  return { main: '—', sub: 'Home country' }
}

/** True when the move happens within the plan's horizon (the engine's month rounding), i.e. the
 *  destination's local tax can apply at all. */
export function movesWithinPlan(inputs: Pick<PlanInputs, 'moveInYears' | 'horizonYears'>): boolean {
  const T = Math.max(1, Math.round(Math.max(1, Math.round(inputs.horizonYears)) * 12))
  return Math.max(0, Math.round(inputs.moveInYears * 12)) < T
}

export interface TaxLine {
  key: 'wealth' | 'inheritance' | 'move'
  label: string
  /** Formatted amount, or null when the line is words only. */
  value: string | null
  /** Context under the amount (or the words, when value is null). */
  sub: string
  /** Muted: the tax is absent or not reached. */
  muted: boolean
}

/**
 * The profile's tax lines for `city` as the destination, from that run's `result.localTax`.
 * Only for taxed cities (empty otherwise: use taxNotice). The plan's age, horizon and move year
 * set the horizon age and whether the move happens at all within the plan.
 */
export function taxLines(
  city: City,
  lt: NonNullable<SimulationResult['localTax']>,
  inputs: Pick<PlanInputs, 'age' | 'horizonYears' | 'moveInYears'>,
): TaxLine[] {
  const t = city.localTax
  if (!t || (!t.wealth && !t.inheritance)) return []
  if (!movesWithinPlan(inputs))
    return [{ key: 'move', label: 'Local tax', value: null, sub: 'You don’t move within the plan, so no local tax applies', muted: true }]
  const endAge = Math.round(inputs.age + Math.max(1, Math.round(inputs.horizonYears)))
  const out: TaxLine[] = []
  if (t.wealth) {
    out.push({
      key: 'wealth',
      label: 'Wealth tax, whole plan',
      value: currencyCompact(lt.wealthTaxMedian),
      sub: lt.wealthTaxMedian > 0 ? 'median total, borrowed as it falls due' : 'in the median future: the portfolio stays under the threshold',
      muted: lt.wealthTaxMedian <= 0,
    })
  } else {
    out.push({ key: 'wealth', label: 'Wealth tax', value: null, sub: 'None on a portfolio', muted: true })
  }
  const inh = t.inheritance
  if (inh && lt.inheritanceApplies) {
    out.push({
      key: 'inheritance',
      label: `Inheritance tax at ${endAge}`,
      value: currencyCompact(lt.inheritanceTaxMedian),
      sub: lt.inheritanceTaxMedian > 0 ? 'median, two US-resident children as heirs' : 'in the median future: shares stay under the allowance',
      muted: lt.inheritanceTaxMedian <= 0,
    })
  } else if (inh) {
    const yrs = inh.afterYearsResident
    out.push({
      key: 'inheritance',
      label: 'Inheritance tax',
      value: null,
      sub: yrs != null ? `Not reached: it applies after more than ${yrs} years’ residence` : 'Not reached on this plan',
      muted: true,
    })
  } else {
    out.push({ key: 'inheritance', label: 'Inheritance tax', value: null, sub: 'None on what US-resident heirs inherit', muted: true })
  }
  return out
}

/** "+$1.2M" / "−$310K" / "same" — estate here vs staying home (within 0.5% reads as same). */
export function estateVsHome(here: number, home: number): string {
  const d = here - home
  if (Math.abs(d) <= Math.abs(home) * 0.005) return 'same'
  return currencyCompact(d, { signed: true })
}
