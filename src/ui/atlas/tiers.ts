import { VERDICT_THRESHOLDS, toneLabel } from '../verdict'

/**
 * Folding the Atlas city list into tiers that follow its sort:
 *   odds → verdict bands (Holds ≥80 · Mostly holds ≥65 · Fragile ≥45 · Breaks), on the displayed whole percent;
 *   cost → bands of cost vs home (under 50%, 50–70%, 70–90%, 90–110%, over 110%), on the displayed whole percent;
 *   name → first-letter groups.
 * A verdict band holding more than MAX_TIER cities of the full list is split at its 10-point lines, top first.
 */

export type TierSort = 'odds' | 'cost' | 'name'

/** The fields grouping needs; `Ranked` satisfies it. */
export interface TierRow {
  cityId: string
  successRate: number
  costRatio: number
  city: { name: string }
}

export interface Tier<R extends TierRow = TierRow> {
  key: string
  label: string
  /** Secondary text, e.g. the odds range "70–79%". */
  range?: string
  rows: R[]
  hasHome: boolean
}

/** An odds band on whole percents: lo ≤ p < hi. */
export interface OddsBand {
  lo: number
  hi: number
}

export const MAX_TIER = 40

/** Whole percent as the list displays it (Intl percent rounding = Math.round for these positive values). */
export const wholePct = (v: number) => Math.round(v * 100)

const CUTS = [VERDICT_THRESHOLDS.holds, VERDICT_THRESHOLDS.mostly, VERDICT_THRESHOLDS.fragile].map((c) => Math.round(c * 100))

/** The verdict bands, high to low: [80,101) [65,80) [45,65) [0,45). */
export const VERDICT_BANDS: OddsBand[] = [101, ...CUTS].map((hi, i, a) => ({ lo: a[i + 1] ?? 0, hi }))

/**
 * Bands for the odds sort, split from the full (unfiltered) list so tiers don't shift while searching:
 * a band with more than `max` cities splits at its highest 10-point line inside it, repeatedly.
 */
export function oddsBands(rows: readonly TierRow[], max = MAX_TIER): OddsBand[] {
  const pcts = rows.map((r) => wholePct(r.successRate))
  const count = (b: OddsBand) => pcts.filter((p) => p >= b.lo && p < b.hi).length
  const split = (b: OddsBand): OddsBand[] => {
    if (count(b) <= max) return [b]
    const line = Math.ceil(Math.min(b.hi, 100) / 10) * 10 - 10 // highest 10-point line below the band's top
    if (line <= b.lo) return [b]
    return [...split({ lo: line, hi: b.hi }), ...split({ lo: b.lo, hi: line })]
  }
  return VERDICT_BANDS.flatMap(split)
}

function rangeText({ lo, hi }: OddsBand): string {
  if (hi > 100) return `${lo}%+`
  if (lo <= 0) return `under ${hi}%`
  return `${lo}–${hi - 1}%`
}

const COST_BANDS: { key: string; label: string; test: (p: number) => boolean }[] = [
  { key: 'cost-lt50', label: 'Under 50% of home', test: (p) => p < 50 },
  { key: 'cost-50', label: '50–70% of home', test: (p) => p < 70 },
  { key: 'cost-70', label: '70–90% of home', test: (p) => p < 90 },
  { key: 'cost-90', label: '90–110% of home', test: (p) => p <= 110 },
  { key: 'cost-gt110', label: 'Over 110% of home', test: () => true },
]

/** First letter for A–Z groups, accents folded ("Évora" → E); anything else groups under "#". */
export function letterOf(name: string): string {
  const c = name.normalize('NFD').replace(/[̀-ͯ]/g, '').charAt(0).toUpperCase()
  return /[A-Z]/.test(c) ? c : '#'
}

/**
 * Group already sorted (and filtered) rows into tiers. Every row lands in exactly one tier; tiers come out in
 * sort order with rows in their given order; empty tiers are dropped.
 */
export function groupTiers<R extends TierRow>(
  rows: readonly R[],
  sort: TierSort,
  homeId: string,
  bands: readonly OddsBand[] = VERDICT_BANDS,
): Tier<R>[] {
  const tiers: Tier<R>[] = []
  const byKey = new Map<string, Tier<R>>()
  const add = (key: string, make: () => Omit<Tier<R>, 'key' | 'rows' | 'hasHome'>, r: R) => {
    let t = byKey.get(key)
    if (!t) {
      t = { key, ...make(), rows: [], hasHome: false }
      byKey.set(key, t)
      tiers.push(t)
    }
    t.rows.push(r)
    if (r.cityId === homeId) t.hasHome = true
  }
  for (const r of rows) {
    if (sort === 'odds') {
      const p = wholePct(r.successRate)
      const b = bands.find((x) => p >= x.lo && p < x.hi) ?? bands[bands.length - 1]
      add(`odds-${b.lo}-${b.hi}`, () => ({ label: toneLabel(b.lo / 100), range: rangeText(b) }), r)
    } else if (sort === 'cost') {
      const p = wholePct(r.costRatio)
      const b = COST_BANDS.find((x) => x.test(p))!
      add(b.key, () => ({ label: b.label }), r)
    } else {
      const l = letterOf(r.city.name)
      add(`name-${l}`, () => ({ label: l }), r)
    }
  }
  // Sorted input gives tiers in band order already; order by band anyway so a stray row can't reorder them.
  if (sort === 'odds') tiers.sort((a, b) => bandIndex(bands, a.key) - bandIndex(bands, b.key))
  if (sort === 'cost') tiers.sort((a, b) => COST_BANDS.findIndex((x) => x.key === a.key) - COST_BANDS.findIndex((x) => x.key === b.key))
  return tiers
}

const bandIndex = (bands: readonly OddsBand[], key: string) => bands.findIndex((b) => `odds-${b.lo}-${b.hi}` === key)

/** Tiers open by default: every tier while searching (only tiers with hits exist), else just the first. */
export function defaultOpen(tiers: readonly Tier[], searching: boolean): Set<string> {
  return new Set(searching ? tiers.map((t) => t.key) : tiers.slice(0, 1).map((t) => t.key))
}
