// Atlas "Top picks" view model: expat picks joined to the ranking rows, score and
// verification labels, and a pick's per-category cost vs home. Pure (no store, no DOM).

import { CITY_BY_ID } from '../../data/cities'
import {
  EXPAT_PICKS,
  EXPAT_SCORE_LABELS,
  type ExpatPick,
  type ExpatProfile,
  type ExpatScoreKey,
} from '../../data/expatPicks'
import { BUDGET_CATEGORIES, categoryRatios } from '../../engine/cost'
import type { AtlasEntry, BudgetCategory, City, PlanInputs } from '../../engine/types'
import { percent } from '../format'

/** Score keys in display order. */
export const SCORE_KEYS: ExpatScoreKey[] = ['cost', 'healthcare', 'safety', 'visa', 'climate', 'community']

/** Minimal row shape the picks need from the Atlas ranking (Ranked satisfies it). */
export type PickRow = AtlasEntry & { city: City; rank: number }

export interface PickView<R extends PickRow = PickRow> {
  pick: ExpatPick
  city: City
  /** The city's ranking row; undefined while the Atlas is still ranking. */
  row?: R
}

export type ProfiledPickView<R extends PickRow = PickRow> = PickView<R> & { pick: ExpatPick & { profile: ExpatProfile } }

/** Picks joined to their city and ranking row, in pick order. Picks whose city is missing are dropped. */
export function pickViews<R extends PickRow>(rows: R[], picks: ExpatPick[] = EXPAT_PICKS): PickView<R>[] {
  const byId = new Map(rows.map((r) => [r.cityId, r]))
  const out: PickView<R>[] = []
  for (const pick of picks) {
    const city = CITY_BY_ID[pick.cityId]
    if (city) out.push({ pick, city, row: byId.get(pick.cityId) })
  }
  return out
}

export const isProfiled = <R extends PickRow>(v: PickView<R>): v is ProfiledPickView<R> => v.pick.profile !== undefined

/** How many picks get a full card in the Top picks grid; the rest are compact rows. */
export const CARD_PICKS = 15

/**
 * Splits pick views into the card grid (ranks 1–CARD_PICKS, profiled) and the compact
 * "Also worth a look" rows (every later rank). Every pick now has a profile, so the split
 * goes by rank, not by whether a profile exists.
 */
export function splitPicks<R extends PickRow>(views: PickView<R>[]): { cards: ProfiledPickView<R>[]; rest: PickView<R>[] } {
  const cards: ProfiledPickView<R>[] = []
  const rest: PickView<R>[] = []
  for (const v of views) {
    if (v.pick.rank <= CARD_PICKS && isProfiled(v)) cards.push(v)
    else if (v.pick.rank > CARD_PICKS) rest.push(v)
  }
  return { cards, rest }
}

/** "Cost 3 of 5, Healthcare 4 of 5, …" for the score glyph's accessible label. */
export function scoreLabel(scores: Record<ExpatScoreKey, number>): string {
  return `Scores out of 5: ${SCORE_KEYS.map((k) => `${EXPAT_SCORE_LABELS[k]} ${scores[k]}`).join(', ')}`
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MONTHS_LONG = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

/** "2026-11-06" -> "Nov 2026" (no time-zone shift: parsed as text). */
export function monthYear(iso: string): string {
  const m = /^(\d{4})-(\d{2})/.exec(iso)
  if (!m) return iso
  const mi = Number(m[2]) - 1
  return MONTHS[mi] ? `${MONTHS[mi]} ${m[1]}` : iso
}

/** "2026-11-06" -> "November 6, 2026". */
export function longDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso)
  if (!m) return iso
  const mi = Number(m[2]) - 1
  return MONTHS_LONG[mi] ? `${MONTHS_LONG[mi]} ${Number(m[3])}, ${m[1]}` : iso
}

export interface VerifiedLabel {
  kind: 'verified' | 'low' | 'estimate'
  /** Short visible text: "Verified Nov 2026" or "Estimate". */
  text: string
  /** Tooltip / title: the source and caveats. */
  title: string
  /** Screen-reader phrase for row labels. */
  spoken: string
}

/** How a city's cost data is labelled: verified against a source (with date), or a rough estimate. */
export function verifiedLabel(city: City): VerifiedLabel {
  const v = city.verified
  if (!v) {
    return {
      kind: 'estimate',
      text: 'Estimate',
      title: 'Rough estimate: cost indices modeled on published indexes, not checked against a current source.',
      spoken: 'cost data is a rough estimate',
    }
  }
  const when = monthYear(v.asOf)
  const low = v.confidence === 'low'
  return {
    kind: low ? 'low' : 'verified',
    text: `Verified ${when}`,
    title: `Cost indices checked against ${v.source} on ${longDate(v.asOf)}.${low ? ' Low confidence: thin data.' : ''}${v.note ? ` ${v.note}` : ''}`,
    spoken: `cost data verified ${when} from ${v.source}${low ? ', low confidence' : ''}`,
  }
}

/** "+12 pts" / "−4 pts" / "same" — odds here vs home, on displayed whole percents. */
export function oddsVsHome(here: number, home: number): string {
  const d = Math.round(here * 100) - Math.round(home * 100)
  if (d === 0) return 'same'
  return `${d > 0 ? '+' : '−'}${Math.abs(d)} pts`
}

export interface CategoryCompare {
  cat: BudgetCategory
  home: number
  here: number
  ratio: number
}

/**
 * First-year spend per budget category at home vs in `city` (today's USD), using the plan's
 * expat factor and overrides, the same inputs the Atlas ranking uses. Categories with no home
 * budget are left out.
 */
export function categoryCompare(inputs: PlanInputs, city: City): CategoryCompare[] {
  const home = CITY_BY_ID[inputs.homeCityId]
  const r =
    home && home.id !== city.id
      ? categoryRatios(home, city, inputs.expatFactor, inputs.ratioOverrides)
      : (Object.fromEntries(BUDGET_CATEGORIES.map((c) => [c, 1])) as Record<BudgetCategory, number>)
  return BUDGET_CATEGORIES.filter((c) => (inputs.budget[c] || 0) > 0).map((c) => {
    const h = inputs.budget[c] || 0
    return { cat: c, home: h, here: h * r[c], ratio: r[c] }
  })
}

/** Data line under a profile: when and where its cost indices were checked. */
export function costDataLine(city: City): string {
  const v = city.verified
  if (!v) return `Cost indices for ${city.name} are rough estimates, not checked against a current source.`
  const base = `Cost indices verified ${longDate(v.asOf)} from ${v.source}.`
  if (v.confidence !== 'low') return base
  const note = v.note ? `: ${v.note.charAt(0).toLowerCase()}${v.note.slice(1)}` : '.'
  return `${base} Low confidence${note}`
}

/** Plain odds text for a row ("82%"), or a dash while ranking. */
export const oddsText = (row?: PickRow) => (row ? percent(row.successRate) : '—')
