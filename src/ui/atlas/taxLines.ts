// Local wealth/inheritance tax wording for the Atlas (pure: no store, no DOM).
//
// Three cases, kept apart so "not researched" never reads as "untaxed":
//   - taxed:      the city has a wealth and/or inheritance component (Spain, France, Italy…, and
//                 US cities in states with an estate or inheritance tax). It applies from the move
//                 to a destination, and from year 0 to the home city when staying home.
//   - none:       researched, and nothing reaches a US portfolio (Cyprus, Portugal…)
//   - unmodelled: no entry for the country (Canada and Australia tax gains at death; New Zealand
//                 taxes foreign shares yearly on a deemed return): the simulation applies no local
//                 tax there, which is not the same as there being none. UNMODELLED_REASON says why.
//   - us:         a US city whose state has no estate or inheritance tax. The federal estate tax is
//                 not modelled anywhere.

import type { City, PlanInputs, SimulationResult } from '../../engine/types'
import { currencyCompact } from '../format'

export type TaxStatus = 'taxed' | 'none' | 'unmodelled' | 'us'

export function taxStatus(city: City): TaxStatus {
  const lt = city.localTax
  if (city.countryCode === 'US') return lt?.wealth || lt?.inheritance ? 'taxed' : 'us'
  if (!lt) return 'unmodelled'
  return lt.wealth || lt.inheritance ? 'taxed' : 'none'
}

/** Short label for list rows and the compare sheet. */
export const TAX_STATUS_SHORT: Record<TaxStatus, string> = {
  taxed: 'Wealth or inheritance tax',
  none: 'None on a US portfolio',
  unmodelled: 'Tax not modelled',
  us: 'No state estate tax',
}

/** Why a country with no local-tax entry isn't modelled (src/data/localTaxes.ts header): a short
 *  form for list tooltips and a long one for the profile notice. A test checks every unmodelled
 *  country in the dataset has one. */
export const UNMODELLED_REASON: Record<string, { short: string; long: string }> = {
  CA: {
    short: 'it taxes gains at death',
    long: 'death counts as a sale, taxing the gains made since you arrived (plus provincial probate)',
  },
  AU: {
    short: 'it taxes gains at death',
    long: 'shares left to a non-resident heir are taxed on their gain at death',
  },
  NZ: {
    short: 'it taxes foreign shares yearly on a deemed return',
    long: 'foreign shares above NZD 50,000 are taxed every year on a deemed return (the FIF rules), with exemptions and alternative methods',
  },
}

const FALLBACK_REASON = { short: 'its rules need data eVelo doesn’t carry', long: 'its rules need data eVelo doesn’t carry' }

/** The reason `city`'s country isn't modelled. */
export function unmodelledReason(city: City): { short: string; long: string } {
  return UNMODELLED_REASON[city.countryCode] ?? FALLBACK_REASON
}

/** The profile's InfoTip label for a city's tax note: a US city's tax is its state's. */
export function taxInfoLabel(city: City): string {
  if (city.countryCode !== 'US') return `How ${city.country}’s local taxes are modelled`
  const m = /^(.+?) (estate|inheritance) tax/.exec(city.localTax?.note ?? '')
  if (!m) return 'How this state’s estate tax is modelled'
  const name = m[1].startsWith('District') ? `the ${m[1]}` : m[1]
  return `How ${name}’s ${m[2]} tax is modelled`
}

/** One-line notice for the cases with nothing to quantify; null when the city is taxed. */
export function taxNotice(city: City): string | null {
  switch (taxStatus(city)) {
    case 'none':
      return `No wealth or inheritance tax modelled for ${city.country}: none reaches a US portfolio.`
    case 'unmodelled':
      return `Local wealth and inheritance tax not modelled for ${city.country}: ${unmodelledReason(city).long}, which eVelo can’t model, so the odds and estate here assume none. Check before you count on that.`
    case 'us':
      return 'No state estate or inheritance tax here. The federal estate tax (above $15M, 2026) is not modelled for any city.'
    default:
      return null
  }
}

/** What the compare sheet shows for a city's local taxes. */
export function taxCompareText(city: City): { main: string; sub: string } {
  const s = taxStatus(city)
  const lt = city.localTax
  if (s === 'taxed' && lt) {
    const parts = [lt.wealth && 'wealth tax', lt.inheritance && deathTaxWord(city).toLowerCase()].filter(Boolean) as string[]
    const main = parts.join(' + ')
    return { main: main.charAt(0).toUpperCase() + main.slice(1), sub: 'Included in the odds and estate' }
  }
  if (s === 'none') return { main: 'None', sub: `None reaches a US portfolio in ${city.country}` }
  if (s === 'unmodelled') return { main: 'Not modelled', sub: `Not modelled for ${city.country}: not the same as none` }
  return { main: '—', sub: 'Home country' }
}

/** What the tax at death is called: a US state's estate tax (Pennsylvania's is an inheritance tax),
 *  else inheritance tax. */
export function deathTaxWord(city: City): string {
  if (city.countryCode !== 'US') return 'Inheritance tax'
  return /^Pennsylvania inheritance/.test(city.localTax?.note ?? '') ? 'State inheritance tax' : 'State estate tax'
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
 * The profile's tax lines for `city`, from the run with it as the destination (`result.localTax`).
 * Only for taxed cities (empty otherwise: use taxNotice). The plan's age, horizon and move year
 * set the horizon age and whether the move happens at all within the plan. When `city` is home
 * (`isHome`), its tax applies from year 0 with no move, so the move year doesn't matter.
 */
export function taxLines(
  city: City,
  lt: NonNullable<SimulationResult['localTax']>,
  inputs: Pick<PlanInputs, 'age' | 'horizonYears' | 'moveInYears'>,
  isHome = false,
): TaxLine[] {
  const t = city.localTax
  if (!t || (!t.wealth && !t.inheritance)) return []
  if (!isHome && !movesWithinPlan(inputs))
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
      label: `${deathTaxWord(city)} at ${endAge}`,
      value: currencyCompact(lt.inheritanceTaxMedian),
      sub: lt.inheritanceTaxMedian > 0 ? 'median, two US-resident children as heirs' : 'in the median future: shares stay under the allowance',
      muted: lt.inheritanceTaxMedian <= 0,
    })
  } else if (inh) {
    const yrs = inh.afterYearsResident
    out.push({
      key: 'inheritance',
      label: deathTaxWord(city),
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
