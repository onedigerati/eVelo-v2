import { VERDICT_THRESHOLDS, toneLabel } from '../verdict'

/**
 * Folding the Atlas city list into tiers that follow its sort:
 *   odds → verdict bands (Holds ≥80 · Mostly holds ≥65 · Fragile ≥45 · Breaks), on the displayed whole percent;
 *   cost → bands of cost vs home (under 50%, 50–70%, 70–90%, 90–110%, over 110%), on the displayed whole percent;
 *   name → first-letter groups.
 * An odds or cost band holding more than MAX_TIER cities of the full list is split at its 10-point lines
 * (odds top first, cost low first, following each sort).
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

/** A band on whole percents: lo ≤ p < hi. */
export interface Band {
  lo: number
  hi: number
}
export type OddsBand = Band

export const MAX_TIER = 40

/** Whole percent as the list displays it (Intl percent rounding = Math.round for these positive values). */
export const wholePct = (v: number) => Math.round(v * 100)

const CUTS = [VERDICT_THRESHOLDS.holds, VERDICT_THRESHOLDS.mostly, VERDICT_THRESHOLDS.fragile].map((c) => Math.round(c * 100))

/** The verdict bands, high to low: [80,101) [65,80) [45,65) [0,45). */
export const VERDICT_BANDS: OddsBand[] = [101, ...CUTS].map((hi, i, a) => ({ lo: a[i + 1] ?? 0, hi }))

/**
 * Split each band holding more than `max` of `pcts` at its highest 10-point line below its top shown value
 * (hi − 1), repeatedly, until it fits or no line is left inside it. An open-ended band (hi = ∞) stays whole.
 * `lowFirst` orders the halves for an ascending sort.
 */
export function splitBands(pcts: readonly number[], bands: readonly Band[], max = MAX_TIER, lowFirst = false): Band[] {
  const count = (b: Band) => pcts.filter((p) => p >= b.lo && p < b.hi).length
  const split = (b: Band): Band[] => {
    if (count(b) <= max || !Number.isFinite(b.hi)) return [b]
    const line = Math.floor((b.hi - 2) / 10) * 10 // highest 10-point line below the band's top shown value
    if (line <= b.lo) return [b]
    const top = split({ lo: line, hi: b.hi })
    const bottom = split({ lo: b.lo, hi: line })
    return lowFirst ? [...bottom, ...top] : [...top, ...bottom]
  }
  return bands.flatMap(split)
}

/** Bands for the odds sort, split from the full (unfiltered) list so tiers don't shift while searching. */
export function oddsBands(rows: readonly TierRow[], max = MAX_TIER): Band[] {
  return splitBands(rows.map((r) => wholePct(r.successRate)), VERDICT_BANDS, max)
}

function rangeText({ lo, hi }: OddsBand): string {
  if (hi > 100) return `${lo}%+`
  if (lo <= 0) return `under ${hi}%`
  return `${lo}–${hi - 1}%`
}

/** Cheapest bands of cost vs home, low to high: under 50%, 50–70%, 70–90%, 90–110% (inclusive), over 110%. */
const COST_BASE: (Band & { label: string })[] = [
  { lo: 0, hi: 50, label: 'Under 50% of home' },
  { lo: 50, hi: 70, label: '50–70% of home' },
  { lo: 70, hi: 90, label: '70–90% of home' },
  { lo: 90, hi: 111, label: '90–110% of home' },
  { lo: 111, hi: Infinity, label: 'Over 110% of home' },
]
export const COST_BANDS: Band[] = COST_BASE.map(({ lo, hi }) => ({ lo, hi }))

/** Bands for the Cheapest sort, split by the odds rule from the full list, low first. */
export function costBands(rows: readonly TierRow[], max = MAX_TIER): Band[] {
  return splitBands(rows.map((r) => wholePct(r.costRatio)), COST_BANDS, max, true)
}

function costLabel(b: Band): string {
  const base = COST_BASE.find((x) => x.lo === b.lo && x.hi === b.hi)
  if (base) return base.label
  if (b.lo <= 0) return `Under ${b.hi}% of home`
  return `${b.lo}–${b.hi - 1}% of home`
}

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
  /** Odds or cost bands (from `oddsBands` / `costBands`); defaults to the unsplit bands for the sort. */
  bands: readonly Band[] = sort === 'cost' ? COST_BANDS : VERDICT_BANDS,
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
      const b = bandOf(bands, wholePct(r.successRate))
      add(bandKey(sort, b), () => ({ label: toneLabel(b.lo / 100), range: rangeText(b) }), r)
    } else if (sort === 'cost') {
      const b = bandOf(bands, wholePct(r.costRatio))
      add(bandKey(sort, b), () => ({ label: costLabel(b) }), r)
    } else {
      const l = letterOf(r.city.name)
      add(`name-${l}`, () => ({ label: l }), r)
    }
  }
  // Sorted input gives tiers in band order already; order by band anyway so a stray row can't reorder them.
  if (sort !== 'name') {
    const index = (key: string) => bands.findIndex((b) => bandKey(sort, b) === key)
    tiers.sort((a, b) => index(a.key) - index(b.key))
  }
  return tiers
}

const bandKey = (sort: TierSort, b: Band) => `${sort}-${b.lo}-${b.hi}`
// A value outside every band (never for real odds or cost) falls to the nearest end band.
const bandOf = (bands: readonly Band[], p: number) => {
  const hit = bands.find((x) => p >= x.lo && p < x.hi)
  if (hit) return hit
  const lowest = bands.reduce((a, b) => (b.lo < a.lo ? b : a))
  return p < lowest.lo ? lowest : bands.reduce((a, b) => (b.hi > a.hi ? b : a))
}

/** Tiers open by default: every tier while searching (only tiers with hits exist), else just the first. */
export function defaultOpen(tiers: readonly Tier[], searching: boolean): Set<string> {
  return new Set(searching ? tiers.map((t) => t.key) : tiers.slice(0, 1).map((t) => t.key))
}
