// The two-retirements walkthrough's data and chapter rules (docs/PLAN.md, stage 2). Pure: no DOM,
// no React. Walkthrough.tsx owns the section; its three leaves (WalkthroughChart, TwinLedgers and
// walkthroughStory's chapterStory) code against the types exported here.
//
// Years. One `WalkYear` per lived year, aligned by age the way the comparison chart aligns its two
// series (compareChart.ts ageDomain): the rows run over every age either plan lives, and a plan is
// null in a row outside its own years (a different age or horizon that wasn't synced). Row `index`
// is the position in the array (0 = the first year lived). For a plan starting at age A, the row for
// age a is its year y = a − A + 1: the income result's `median[y − 1]` and eVelo's `yearly[*][y − 1]`
// cover it, and both plans' bands at index y are its year-end values (index y − 1 its start).
//
// Chapters. `from` and `to` are inclusive ROW INDICES into the years array (not ages; the ages are
// `years[from].age` .. `years[to].age`). The rules (docs/PLAN.md decision "Chapter rules"):
//   before   the years before the income plan's Social Security start (absent when it starts in the
//            first year, was already being paid, or never starts in the horizon)
//   arrives  the year it starts. A start in the horizon's very last year is left to the estate (no
//            before or arrives chapter then), so the estate can stay last.
//   bad      the first year where either plan's median real portfolio falls 5% or more, plus the
//            next year when either also falls. When that first bad year lands inside before, arrives
//            or the estate, that chapter keeps it (`badYear`) and there is no bad chapter.
//   early    the years between Social Security's arrival (or the start) and the bad market, when a
//            bad chapter comes later than that. (Not named in the decision: it keeps the long middle
//            after the bad market, as in the mockup, and is what a short plan splits into.)
//   middle   the rest.
//   estate   the last five years (a third of the horizon, at least one, below 15 years; it starts
//            after Social Security's arrival when that is late).
// Empty chapters are dropped. Fewer than three (only possible with no arrives chapter): the long
// middle splits in two (early + middle), or a two-year bad market gives its second year to the
// middle. More than six (not reachable from these rules, kept as a guard): adjacent chapters merge.
// Fewer than three rows can't make three chapters; those get one chapter per row at most.

import type { IncomeInputs, IncomeResult } from '../../engine/incomeTypes'
import type { PlanInputs, SimulationResult } from '../../engine/types'

/** Living on income in one year: per-field medians, real (today's USD). */
export interface IncomeYear {
  /** Net worth (= portfolio, no loan) at the start and end of the year. */
  netWorthStart: number
  netWorth: number
  /** Dividends + muni, taxable and treasury interest. */
  dividendsInterest: number
  socialSecurity: number
  /** Shares sold to cover the gap. */
  sold: number
  tax: number
  /** Surplus put back in. */
  reinvested: number
  spending: number
  /** Portfolio at the start and end of the year. */
  portfolioStart: number
  portfolio: number
}

/** eVelo in one year: its yearly tallies and year-end band medians, real (today's USD). */
export interface EveloYear {
  /** Net worth (portfolio − loan) at the start and end of the year. */
  netWorthStart: number
  netWorth: number
  /** The plan's own Social Security for the year (an input, not a median): from its start age and
   *  not before retirement. */
  socialSecurity: number
  borrowed: number
  interest: number
  repaid: number
  /** Shares a margin call sold (0 in most years). */
  forcedSaleSold: number
  wealthTax: number
  /** Loan, portfolio and loan-to-value at the end of the year (each its own median). */
  loan: number
  portfolioStart: number
  portfolio: number
  ltv: number
}

/** One lived year, both plans side by side. */
export interface WalkYear {
  /** Position in the years array (0 = the first year lived). */
  index: number
  /** Age during the year. */
  age: number
  income: IncomeYear | null
  evelo: EveloYear | null
}

export type ChapterKey = 'before' | 'arrives' | 'early' | 'bad' | 'middle' | 'estate'

export interface Chapter {
  key: ChapterKey
  name: string
  /** First and last row index, inclusive. */
  from: number
  to: number
  /** A bad-market year (row index) this chapter kept instead of a bad chapter of its own. */
  badYear?: number
}

export const CHAPTER_NAMES: Record<ChapterKey, string> = {
  before: 'Before Social Security',
  arrives: 'Social Security arrives',
  early: 'The early years',
  bad: 'The bad market',
  middle: 'The long middle',
  estate: 'The estate',
}

/** Both plans' inputs, for the story text. */
export interface WalkInputs {
  income: IncomeInputs
  evelo: PlanInputs
}

// ---------- Contracts for the leaf components ----------

/** WalkthroughChart.tsx: the overview net-worth chart, the chapter's span lit. */
export interface WalkthroughChartProps {
  years: readonly WalkYear[]
  chapters: readonly Chapter[]
  /** Index into `chapters` of the chapter shown. */
  chapter: number
  /** Row index of the year shown. */
  year: number
  /** Tap, click or keyboard pick of a year (row index); the section moves to its chapter. */
  onPickYear: (year: number) => void
  phone: boolean
}

/** TwinLedgers.tsx: the two ledgers for one year. */
export interface TwinLedgersProps {
  row: WalkYear
  phone: boolean
}

/** One plan's paragraph for a chapter. */
export interface StoryPart {
  /** Short serif title ("Sells to fill the gap"). */
  title: string
  /** One figure line ("$412K sold over 7 years"). */
  figure: string
  text: string
}

export interface ChapterStory {
  income: StoryPart
  evelo: StoryPart
}

/** walkthroughStory.ts's chapterStory. */
export type ChapterStoryFn = (chapter: Chapter, years: readonly WalkYear[], inputs: WalkInputs) => ChapterStory

// ---------- Years ----------

const fin = (v: number | undefined) => (typeof v === 'number' && Number.isFinite(v) ? v : 0)

/** One row per age either plan lives (see the file comment). */
export function buildYears(income: IncomeResult, incomeInputs: IncomeInputs, evelo: SimulationResult): WalkYear[] {
  const iAge = incomeInputs.age
  const iN = income.median.length
  const e = evelo.inputs
  const eN = Math.max(0, evelo.netWorth.p50.length - 1)
  const lo = Math.min(iN > 0 ? iAge : Infinity, eN > 0 ? e.age : Infinity)
  const hi = Math.max(iN > 0 ? iAge + iN - 1 : -Infinity, eN > 0 ? e.age + eN - 1 : -Infinity)
  if (!Number.isFinite(lo) || !Number.isFinite(hi)) return []

  const y = evelo.yearly
  const rows: WalkYear[] = []
  for (let age = lo; age <= hi; age++) {
    const iy = age - iAge + 1
    const ey = age - e.age + 1
    let inc: IncomeYear | null = null
    if (iy >= 1 && iy <= iN) {
      const m = income.median[iy - 1]
      inc = {
        netWorthStart: fin(income.value.p50[iy - 1]),
        netWorth: fin(income.value.p50[iy]),
        dividendsInterest: fin(m.dividends) + fin(m.muniInterest) + fin(m.taxableInterest) + fin(m.treasuryInterest),
        socialSecurity: fin(m.otherIncome),
        sold: fin(m.gapSold),
        tax: fin(m.tax),
        reinvested: fin(m.reinvested),
        spending: fin(m.spending),
        portfolioStart: fin(income.value.p50[iy - 1]),
        portfolio: fin(income.value.p50[iy]),
      }
    }
    let ev: EveloYear | null = null
    if (ey >= 1 && ey <= eN) {
      const k = ey - 1
      const paid = age >= e.incomeStartAge && k >= (e.retireInYears ?? 0)
      ev = {
        netWorthStart: fin(evelo.netWorth.p50[k]),
        netWorth: fin(evelo.netWorth.p50[ey]),
        socialSecurity: paid ? fin(e.otherIncome) : 0,
        borrowed: fin(y?.borrowed[k]),
        interest: fin(y?.interest[k]),
        repaid: fin(y?.repaid[k]),
        forcedSaleSold: fin(y?.forcedSaleSold[k]),
        wealthTax: fin(y?.wealthTax[k]),
        loan: fin(evelo.loan.p50[ey]),
        portfolioStart: fin(evelo.portfolioValue.p50[k]),
        portfolio: fin(evelo.portfolioValue.p50[ey]),
        ltv: fin(evelo.ltv.p50[ey]),
      }
    }
    rows.push({ index: rows.length, age, income: inc, evelo: ev })
  }
  return rows
}

// ---------- Chapters ----------

/** A median real portfolio falling by at least `by` (0.05 = 5%) over the year. */
const fell = (p: { portfolioStart: number; portfolio: number } | null, by: number) =>
  !!p && p.portfolioStart > 0 && p.portfolio <= p.portfolioStart * (1 - by)

/** Either plan's median real portfolio falls 5% or more this year. */
export const isBadYear = (r: WalkYear) => fell(r.income, 0.05) || fell(r.evelo, 0.05)
/** Either plan's median real portfolio falls at all this year. */
const falls = (r: WalkYear) => fell(r.income, 1e-9) || fell(r.evelo, 1e-9)

/** Estate length: five years, or a third of a horizon under 15 years (at least one). */
export const estateLength = (n: number) => (n >= 15 ? 5 : Math.max(1, Math.floor(n / 3)))

const ch = (key: ChapterKey, from: number, to: number): Chapter => ({ key, name: CHAPTER_NAMES[key], from, to })
const len = (c: Chapter) => c.to - c.from + 1

/** The chapters for these years (see the file comment). `ss` is the income plan's own inputs. */
export function chapters(years: readonly WalkYear[], ss: Pick<IncomeInputs, 'age' | 'otherIncome' | 'incomeStartAge'>): Chapter[] {
  const n = years.length
  if (n === 0) return []

  // Social Security's arrival, as a row index, when it starts inside the horizon before its last year.
  let s: number | null = null
  if (ss.otherIncome > 0 && ss.incomeStartAge >= ss.age) {
    const i = years.findIndex((r) => r.age === ss.incomeStartAge && r.income)
    if (i >= 0 && i <= n - 2) s = i
  }

  const estStart = s == null ? n - estateLength(n) : Math.max(n - estateLength(n), s + 1)
  const headEnd = s ?? -1
  const out: Chapter[] = []
  if (s != null && s > 0) out.push(ch('before', 0, s - 1))
  if (s != null) out.push(ch('arrives', s, s))

  const b = years.findIndex(isBadYear)
  if (b > headEnd && b < estStart) {
    const bEnd = b + 1 < estStart && falls(years[b + 1]) ? b + 1 : b
    if (b > headEnd + 1) out.push(ch('early', headEnd + 1, b - 1))
    out.push(ch('bad', b, bEnd))
    if (bEnd + 1 <= estStart - 1) out.push(ch('middle', bEnd + 1, estStart - 1))
  } else if (headEnd + 1 <= estStart - 1) {
    out.push(ch('middle', headEnd + 1, estStart - 1))
  }
  out.push(ch('estate', estStart, n - 1))

  if (b >= 0) {
    const keeper = out.find((c) => c.key !== 'bad' && b >= c.from && b <= c.to)
    if (keeper && !out.some((c) => c.key === 'bad')) keeper.badYear = b
  }

  return capChapters(atLeastThree(out))
}

/** Splits to reach three chapters when the rows allow it: the long middle into early + middle, or a
 *  two-year bad market into its first year + middle. */
function atLeastThree(list: Chapter[]): Chapter[] {
  const out = [...list]
  while (out.length < 3) {
    const i = out.findIndex((c) => (c.key === 'middle' || c.key === 'bad') && len(c) >= 2)
    if (i < 0) break
    const c = out[i]
    const parts =
      c.key === 'middle'
        ? [ch('early', c.from, c.from + Math.floor(len(c) / 2) - 1), ch('middle', c.from + Math.floor(len(c) / 2), c.to)]
        : [{ ...c, to: c.from }, ch('middle', c.from + 1, c.to)]
    out.splice(i, 1, ...parts)
  }
  return out
}

/** Merges adjacent chapters down to `max`: each time the shortest adjacent pair not including the
 *  last (estate) chapter, keeping the longer one's key and name. */
export function capChapters(list: readonly Chapter[], max = 6): Chapter[] {
  const out = list.map((c) => ({ ...c }))
  while (out.length > max && out.length >= 3) {
    let best = 0
    for (let i = 1; i < out.length - 2; i++) if (len(out[i]) + len(out[i + 1]) < len(out[best]) + len(out[best + 1])) best = i
    const [a, c] = [out[best], out[best + 1]]
    const keep = len(c) > len(a) ? c : a
    const merged: Chapter = { key: keep.key, name: keep.name, from: a.from, to: c.to }
    const lost = keep === a ? c : a
    const bad = a.badYear ?? c.badYear ?? (lost.key === 'bad' ? lost.from : undefined)
    if (bad != null) merged.badYear = bad
    out.splice(best, 2, merged)
  }
  return out
}

/** Index of the chapter holding row `year`, or −1. */
export function chapterOf(list: readonly Chapter[], year: number): number {
  return list.findIndex((c) => year >= c.from && year <= c.to)
}
