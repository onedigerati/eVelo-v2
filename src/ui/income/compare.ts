// The comparison's pure logic (IncomeCompare.tsx): the measure switch's mapping onto both results,
// the two columns' figures, and the like-for-like lines. No DOM, no React.
//
// eVelo's three measures are read from its own result (docs/PLAN.md, 2026-11-18, unattended):
//   the money lasts      = 1 − brokenRate  (solvent at the horizon, the same test the mode uses)
//   principal never sold = successRate     (no forced sale, and solvent)
//   income keeps pace    = 1 − brokenRate  (eVelo funds the full inflation-indexed spending every
//                                           year until a plan breaks, so it's the same as lasts)

import { CITY_BY_ID } from '../../data/cities'
import { normalizeIncomeInputs } from '../../engine/income'
import type { IncomeInputs, IncomeResult } from '../../engine/incomeTypes'
import type { City, PlanInputs, SimulationResult } from '../../engine/types'
import { fieldMatches, snapshotFromEvelo, SYNC_FIELDS, type SyncField, type SyncSnapshot } from '../../state/incomeSync'
import { deathTaxWord, taxStatus } from '../atlas/taxLines'
import { currencyCompact, number, percent } from '../format'

export type MeasureKey = 'lasts' | 'principal' | 'pace'

export const MEASURES: readonly { key: MeasureKey; tab: string; short: string }[] = [
  { key: 'lasts', tab: 'Money lasts', short: 'Lasts' },
  { key: 'principal', tab: 'Principal kept', short: 'Principal' },
  { key: 'pace', tab: 'Income keeps pace', short: 'Keeps pace' },
]

/** What each measure means for eVelo, said under the columns. */
export const EVELO_MEANING: Record<MeasureKey, string> = {
  lasts: 'For eVelo, the money lasts means solvent at the horizon: the loan never overtakes the portfolio.',
  principal: 'For eVelo, principal kept means no forced sale: no margin call ever sold shares, and the plan stays solvent.',
  pace: 'For eVelo, income keeps pace is the same as the money lasts: it borrows the full inflation-indexed spending every year until a plan breaks.',
}

export interface CompareStat {
  key: 'estate' | 'tax' | 'sold' | 'loan'
  label: string
  value: number | null
  /** Shown in place of a figure the result doesn't have. */
  note?: string
}

export interface CompareColumn {
  key: 'income' | 'evelo'
  name: string
  how: string
  rate: number
  rateNote: string
  stats: CompareStat[]
}

const last = (a: readonly number[]) => (a.length ? a[a.length - 1] : NaN)

export function incomeRate(r: Pick<IncomeResult, 'lastsRate' | 'principalKeptRate' | 'keepsPaceRate'>, m: MeasureKey): number {
  return m === 'lasts' ? r.lastsRate : m === 'principal' ? r.principalKeptRate : r.keepsPaceRate
}

export function eveloRate(r: Pick<SimulationResult, 'successRate' | 'brokenRate'>, m: MeasureKey): number {
  return m === 'principal' ? r.successRate : 1 - r.brokenRate
}

const RATE_NOTE: Record<MeasureKey, [string, string]> = {
  lasts: ['of futures, the money lasts', 'of futures, the money lasts'],
  principal: ['of futures, no share ever sold', 'of futures, no forced sale'],
  pace: ['of futures, income keeps pace', 'of futures, spending met every year'],
}

/** The mode's column for a measure, from its result's fields. */
export function incomeColumn(m: MeasureKey, income: IncomeResult): CompareColumn {
  return {
    key: 'income',
    name: 'Living on income',
    how: 'dividends, coupons, sell for the gap',
    rate: incomeRate(income, m),
    rateNote: RATE_NOTE[m][0],
    stats: [
      // Before any local inheritance tax (the mode models US federal tax only), unlike eVelo's.
      { key: 'estate', label: 'Median estate, before inheritance tax', value: last(income.value.p50) },
      { key: 'tax', label: 'Tax paid, lifetime', value: income.totalTaxMedian },
      { key: 'sold', label: 'Shares sold', value: income.totalSoldMedian },
    ],
  }
}

/** eVelo's column for a measure, from its result's fields. Its estate is `estate.bbdMedian`: the
 *  borrow plan's estate at the horizon, net of the loan (and of local inheritance tax where that
 *  applies). eVelo doesn't tally the borrow plan's tax in dollars, so that figure is a note. */
export function eveloColumn(m: MeasureKey, evelo: SimulationResult): CompareColumn {
  const drag = evelo.inputs.dividendTaxDrag
  return {
    key: 'evelo',
    name: 'eVelo',
    how: 'buy, borrow, never sell',
    rate: eveloRate(evelo, m),
    rateNote: RATE_NOTE[m][1],
    stats: [
      { key: 'estate', label: evelo.localTax?.inheritanceApplies ? 'Median estate, after loan and inheritance tax' : 'Median estate, after loan', value: evelo.estate.bbdMedian },
      {
        key: 'tax',
        label: 'Tax paid, lifetime',
        value: null,
        note: drag > 0 ? `Not tallied: a ${percent(drag, { digits: 1 })} yearly dividend-tax drag` : 'Not tallied',
      },
      { key: 'loan', label: 'Loan at the end', value: last(evelo.loan.p50) },
    ],
  }
}

/** The two columns for a measure, straight from the two results' fields. */
export function compareColumns(m: MeasureKey, income: IncomeResult, evelo: SimulationResult): [CompareColumn, CompareColumn] {
  return [incomeColumn(m, income), eveloColumn(m, evelo)]
}

/** A stat as shown: compact dollars, or its note. */
export const statText = (s: CompareStat) => (s.value == null ? (s.note ?? '—') : currencyCompact(s.value))

/** The fields that describe the person (and the money), as opposed to the futures and the years. */
export const PERSON_FIELDS: readonly SyncField[] = SYNC_FIELDS.filter((f) => f !== 'futures' && f !== 'horizonYears')

const FIELD_NAME: Partial<Record<SyncField, string>> = {
  portfolio: 'Portfolio',
  basisFraction: 'Cost basis',
  age: 'Age',
  spending: 'Spending',
  otherIncome: 'Social Security',
  homeCityId: 'Home city',
}

/** One field's value as said in a like-for-like line, from a snapshot or the mode's inputs. */
function fieldText(f: SyncField, v: SyncSnapshot): string {
  switch (f) {
    case 'portfolio':
      return currencyCompact(v.portfolio ?? NaN)
    case 'basisFraction':
      return percent(v.basisFraction ?? NaN)
    case 'age':
      return number(v.age ?? NaN)
    case 'spending':
      return `${currencyCompact(v.spending ?? NaN)} a year`
    case 'otherIncome':
      return v.otherIncome ? `${currencyCompact(v.otherIncome)} from ${v.incomeStartAge}` : 'none'
    case 'homeCityId':
      return (v.homeCityId && CITY_BY_ID[v.homeCityId]?.name) ?? '—'
    default:
      return ''
  }
}

/** The local taxes a city charges, as words ("wealth tax", "state inheritance tax"); null if none. */
export function localTaxWords(city: City | undefined): string | null {
  if (!city || taxStatus(city) !== 'taxed' || !city.localTax) return null
  const lt = city.localTax
  const parts = [lt.wealth && 'wealth tax', lt.inheritance && deathTaxWord(city).toLowerCase()].filter(Boolean) as string[]
  return parts.length ? parts.join(' and ') : null
}

export type LikeKey = 'differs' | `differs-${SyncField}` | 'move' | 'tax' | 'retire' | 'method' | 'loan' | 'futures' | 'horizon' | 'same'

export interface LikeLine {
  key: LikeKey
  text: string
}

/** The person fields where the mode's inputs differ from the eVelo plan. */
export function personDiffs(evelo: PlanInputs, income: IncomeInputs): SyncField[] {
  const snap = snapshotFromEvelo(evelo)
  return PERSON_FIELDS.filter((f) => !fieldMatches(f, income, snap))
}

/** The draw settings each engine actually uses, after its own normalisation. eVelo (simulate):
 *  horizon = max(1, round(h)) as normalizeInputs does (mirrored here so the UI doesn't bundle
 *  simulate), paths floored to at least 1 (makeScenarios), blockMonths used as given (the block
 *  draw reads 1/max(1, b), so a fractional share-link value stays fractional), seed read as
 *  seed >>> 0 by the RNG. Income: normalizeIncomeInputs, which rounds blockMonths and the seed. */
export function drawSettings(evelo: PlanInputs, income: IncomeInputs) {
  const i = normalizeIncomeInputs(income)
  return {
    e: {
      method: evelo.method,
      horizon: Math.max(1, Math.round(evelo.horizonYears)),
      paths: Math.max(1, Math.floor(evelo.paths)),
      block: Math.max(1, evelo.blockMonths),
      seed: evelo.seed >>> 0,
      outlook: evelo.outlook,
    },
    i: { method: i.method, horizon: i.horizonYears, paths: i.paths, block: i.blockMonths, seed: i.seed >>> 0, outlook: i.outlook },
    age: i.age,
    portfolio: i.portfolio,
  }
}

/** Whether both plans draw the same futures, the one test the comparison's lines and Same storm's
 *  gate share (method aside: fat tails are reported on their own). 'futures' when the seed, path
 *  count, block length or outlook differ as each engine uses them (a different outlook is different
 *  returns); 'block-fraction' when the only difference is eVelo's non-whole block length, which
 *  syncing can't match (the mode only takes whole months); 'years' when the horizons differ;
 *  otherwise 'same'. */
export type DrawDiff = 'same' | 'futures' | 'block-fraction' | 'years'
export function drawDiff(evelo: PlanInputs, income: IncomeInputs): DrawDiff {
  const { e, i } = drawSettings(evelo, income)
  const others = e.seed !== i.seed || e.paths !== i.paths || e.outlook !== i.outlook
  if (others) return 'futures'
  if (e.block !== i.block) return Number.isInteger(e.block) ? 'futures' : 'block-fraction'
  if (e.horizon !== i.horizon) return 'years'
  return 'same'
}

/** The line for an eVelo block length that isn't a whole number of months. */
export const blockFractionText = (blockMonths: number) =>
  `eVelo’s block length (${Math.round(blockMonths * 100) / 100} months) isn’t a whole number, so the two can’t draw the same months; set it in eVelo’s settings.`

/** Where the eVelo plan differs from the mode in ways that matter for a like-for-like reading, one
 *  line each, the differing person fields first; "same futures" when both draw the same months. */
export function likeForLike(evelo: PlanInputs, income: IncomeInputs): LikeLine[] {
  const out: LikeLine[] = []
  const diffs = personDiffs(evelo, income)
  if (diffs.length > 2) {
    const names = diffs.map((f, i) => (i && f !== 'otherIncome' ? FIELD_NAME[f]!.toLowerCase() : FIELD_NAME[f]!))
    out.push({ key: 'differs', text: `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]} differ from your eVelo plan.` })
  } else if (diffs.length) {
    const snap = snapshotFromEvelo(evelo)
    for (const f of diffs)
      out.push({ key: `differs-${f}`, text: `${FIELD_NAME[f]} differs: ${fieldText(f, snap)} in eVelo, ${fieldText(f, income)} here.` })
  }
  const moves = !!evelo.destCityId && evelo.destCityId !== evelo.homeCityId
  if (moves) {
    const dest = CITY_BY_ID[evelo.destCityId!]
    const tax = localTaxWords(dest)
    const name = dest?.name ?? 'another city'
    out.push({
      key: 'move',
      text: tax
        ? `Your eVelo plan moves to ${name}, and its figures include ${name}’s ${tax}; living on income stays home and doesn’t model it.`
        : `Your eVelo plan moves to ${name}; living on income stays home.`,
    })
  } else {
    const home = CITY_BY_ID[evelo.homeCityId]
    const tax = localTaxWords(home)
    if (tax) out.push({ key: 'tax', text: `eVelo’s figures include ${home.name}’s ${tax}; living on income doesn’t model it.` })
  }
  if (evelo.retireInYears > 0) {
    const yrs = `${evelo.retireInYears} ${evelo.retireInYears === 1 ? 'year' : 'years'}`
    const saving = evelo.savingsWhileWorking > 0 ? `, adding ${currencyCompact(evelo.savingsWhileWorking)} a year until then` : ''
    out.push({ key: 'retire', text: `eVelo retires in ${yrs}${saving}; this mode retires now.` })
  }
  if (evelo.method === 'fat-tail') out.push({ key: 'method', text: 'eVelo uses fat tails; this mode always replays history.' })
  if (evelo.existingLoan > 0) out.push({ key: 'loan', text: `eVelo starts with a ${currencyCompact(evelo.existingLoan)} loan.` })
  const draw = drawDiff(evelo, income)
  if (draw === 'futures') out.push({ key: 'futures', text: 'These run on different futures; sync ‘Futures’ to match.' })
  else if (draw === 'block-fraction') out.push({ key: 'futures', text: `These run on different futures: ${blockFractionText(evelo.blockMonths)}` })
  else if (draw === 'years')
    out.push({ key: 'horizon', text: `eVelo plans ${evelo.horizonYears} years and this mode ${income.horizonYears}, so the futures differ; sync ‘Years’ to match.` })
  else if (evelo.method === income.method) out.push({ key: 'same', text: `Both run on the same ${number(evelo.paths)} futures.` })
  return out
}

export const SAME_HEADING = 'Same person, same markets, two ways'
export const SIDE_BY_SIDE_HEADING = 'Your two plans, side by side'

/** "Same person, same markets" only when no person field differs and both draw the same futures
 *  (same months, years and method); otherwise a neutral heading. */
export function compareHeading(lines: readonly LikeLine[]): string {
  const personDiffers = lines.some((l) => l.key.startsWith('differs'))
  return !personDiffers && lines.some((l) => l.key === 'same') ? SAME_HEADING : SIDE_BY_SIDE_HEADING
}

/** Whether a line flags a difference the reader should weigh before reading the columns as like for like. */
export const isDiffLine = (l: LikeLine) => l.key.startsWith('differs') || l.key === 'futures' || l.key === 'horizon'

/** JSON with keys sorted, so two plans compare equal whatever order their keys were written in. */
export function stableKey(v: unknown): string {
  return JSON.stringify(v, (_k, x: unknown) =>
    x && typeof x === 'object' && !Array.isArray(x) ? Object.fromEntries(Object.entries(x as Record<string, unknown>).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))) : x,
  )
}
