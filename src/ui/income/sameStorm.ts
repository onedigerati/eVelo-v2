// Same storm: both plans through the same sampled futures (stage 4 of the walkthrough plan).
// Contract shared by the logic builder (this file's bodies + tests) and the view builder
// (SameStorm.tsx). Pure, no React.

import type { IncomeInputs, IncomeResult, IncomeSampleYear } from '../../engine/incomeTypes'
import { SAMPLE_KEYS, type SampleFuture, type SampleKey } from '../../engine/sampleFutures'
import type { EveloSampleYear, PlanInputs, SimulationResult } from '../../engine/types'
import { currencyCompact, percent } from '../format'
import { blockFractionText, drawDiff, drawSettings } from './compare'
import { runOutAt } from './sameStormChart'

/** Why Same storm is hidden, or 'shown'. */
export type StormGate = 'shown' | 'fat-tail' | 'different-futures' | 'block-fraction' | 'different-years' | 'no-samples'

/** One chip: a future both plans lived through. `keys` holds every sample key that picked this
 *  path (repeats merged), `label` names it ("Typical", "Typical · Lucky"). */
export interface StormFuture {
  keys: SampleKey[]
  label: string
  path: number
  /** Per year, index y = year y (length = the shorter plan's horizon). Year-end values. */
  years: StormYear[]
  /** eVelo's margin-call loan-to-value (PlanInputs.maxLtv). */
  callLtv: number
  caption: string
}

export interface StormYear {
  /** Age during the year, the income plan's (the x axis and living on income's events). */
  age: number
  /** eVelo's own age during the year (its events: forced sales, running out). Equal to `age` once
   *  synced; start ages may differ while the futures match. */
  eveloAge: number
  income: IncomeSampleYear
  evelo: EveloSampleYear
}

/** Both results' samples by key, or null when either has none. */
function samplesOf(eveloResult: SimulationResult, incomeResult: IncomeResult) {
  const es = eveloResult.samples
  const is = incomeResult.samples
  if (!es?.length || !is?.length) return null
  const byKey = <R,>(list: SampleFuture<R>[]) => new Map(list.map((s) => [s.key, s] as const))
  return { e: byKey(es), i: byKey(is) }
}

/** Why Same storm is hidden, checked in this order: 'fat-tail' when either plan's method isn't the
 *  historical replay (no matched months exist); then compare.ts's drawDiff, the same test the
 *  comparison's like-for-like lines use: 'different-futures' when the seed, path count, block length
 *  or outlook differ as each engine uses them, 'block-fraction' when only eVelo's non-whole block
 *  length differs, 'different-years' when the horizons differ; 'no-samples' when either result has no samples or the two disagree key by key
 *  (a key in one and not the other, or a different path) — the final proof they drew the same
 *  months, which also catches a stale result. Start ages aren't compared: they don't change the
 *  months drawn, so rows align by year index and the ages shown are the income plan's. */
export function stormGate(evelo: PlanInputs, eveloResult: SimulationResult, income: IncomeInputs, incomeResult: IncomeResult): StormGate {
  const { e, i } = drawSettings(evelo, income)
  if (e.method !== 'bootstrap' || i.method !== 'bootstrap') return 'fat-tail'
  const d = drawDiff(evelo, income)
  if (d === 'futures') return 'different-futures'
  if (d === 'block-fraction') return 'block-fraction'
  if (d === 'years') return 'different-years'
  const s = samplesOf(eveloResult, incomeResult)
  if (!s) return 'no-samples'
  for (const k of SAMPLE_KEYS) {
    const a = s.e.get(k)
    const b = s.i.get(k)
    if (!a !== !b || (a && b && a.path !== b.path)) return 'no-samples'
  }
  return 'shown'
}

/** The line shown in Same storm's place when the gate isn't 'shown'. */
export function stormHiddenText(gate: Exclude<StormGate, 'shown'>, eveloBlockMonths = NaN): string {
  switch (gate) {
    case 'block-fraction':
      return `Same storm needs both plans on the same futures: ${blockFractionText(eveloBlockMonths)}`
    case 'fat-tail':
      return 'Same storm needs both plans on the same futures: eVelo uses fat tails, so its months aren’t replayed history.'
    case 'different-futures':
      return 'Same storm needs both plans on the same futures; sync ‘Futures’ to match.'
    case 'different-years':
      return 'Same storm needs both plans over the same years; sync ‘Years’ to match.'
    case 'no-samples':
      return 'Same storm needs both runs’ sample futures, and these runs didn’t return matching ones.'
  }
}

const KEY_LABEL: Record<SampleKey, string> = { earlyCrash: 'Early crash', typical: 'Typical', lateCrash: 'Late crash', lucky: 'Lucky' }
const COUNT_WORD = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven']
/** Years of living on income's selling the caption sums. */
const FIRST_YEARS = 7

/** The chips, in SAMPLE_KEYS order, repeats merged, captions filled. Empty when the gate isn't 'shown'. */
export function stormFutures(evelo: PlanInputs, eveloResult: SimulationResult, income: IncomeInputs, incomeResult: IncomeResult): StormFuture[] {
  if (stormGate(evelo, eveloResult, income, incomeResult) !== 'shown') return []
  const s = samplesOf(eveloResult, incomeResult)!
  const { age, portfolio } = drawSettings(evelo, income)
  const eAge = Math.round(evelo.age)
  const out: StormFuture[] = []
  for (const k of SAMPLE_KEYS) {
    const a = s.e.get(k)
    const b = s.i.get(k)
    if (!a || !b) continue
    const same = out.find((f) => f.path === a.path)
    if (same) {
      same.keys.push(k)
      same.label = same.keys.map((x) => KEY_LABEL[x]).join(' · ')
      continue
    }
    const n = Math.min(a.years.length, b.years.length)
    const years: StormYear[] = Array.from({ length: n }, (_, y) => ({ age: age + y, eveloAge: eAge + y, income: b.years[y], evelo: a.years[y] }))
    out.push({ keys: [k], label: KEY_LABEL[k], path: a.path, years, callLtv: evelo.maxLtv, caption: '' })
  }
  for (const f of out) f.caption = stormCaption(f, portfolio)
  return out
}

/** A fall the crash clause reports: 5% or more in a year. */
const CRASH_FALL = 0.05

/** The years (first, last, inclusive; 0-based) a crash chip's fall is looked for in, from the
 *  sample picker's windows (sampleFutures.ts) over T = years × 12 months: early [0, min(60, ⌊T/2⌋)),
 *  late [max(T − 120, 60), T) for T ≥ 120 or [⌊T/2⌋, T) below; every year the window's months touch.
 *  A chip holding both keys looks over both. */
export function crashWindow(keys: readonly SampleKey[], years: number): [number, number] {
  const T = years * 12
  const spans: [number, number][] = []
  if (keys.includes('earlyCrash')) spans.push([0, Math.min(60, Math.floor(T / 2))])
  if (keys.includes('lateCrash')) spans.push(T >= 120 ? [Math.max(T - 120, 60), T] : [Math.floor(T / 2), T])
  if (!spans.length) return [0, -1]
  const m0 = Math.min(...spans.map((s) => s[0]))
  const m1 = Math.max(...spans.map((s) => s[1]))
  return [Math.floor(m0 / 12), Math.min(years - 1, Math.ceil(m1 / 12) - 1)]
}

/** Two short sentences from this future's rows only: the fall (crash chips) and who ends ahead
 *  (eVelo's net worth after its loan against living on income's portfolio); then eVelo's forced
 *  sales (first age, total sold) and what living on income sold in its first seven years. */
function stormCaption(f: StormFuture, startPortfolio: number): string {
  const ys = f.years
  if (!ys.length) return ''
  const last = ys[ys.length - 1]
  const diff = last.evelo.netWorth - last.income.portfolio
  // Running out (a portfolio, or eVelo's net worth after its loan, at $0 by the end) is said as such,
  // not as a level finish at $0 or a 100% fall.
  const outI = runOutAt(ys, (y) => y.income.portfolio)
  const outE = runOutAt(ys, (y) => y.evelo.netWorth, (y) => y.eveloAge)
  const ahead =
    outI !== null && outE !== null
      ? outI === outE
        ? `both plans run out of money at ${outI}`
        : `both plans run out of money: eVelo at ${outE}, living on income at ${outI}`
      : Math.abs(diff) < 1
        ? `both plans end level at ${currencyCompact(last.income.portfolio)}`
        : diff > 0
          ? `eVelo ends ${currencyCompact(diff)} ahead${outI !== null ? `, after living on income runs out at ${outI}` : ''}`
          : `living on income ends ${currencyCompact(-diff)} ahead${outE !== null ? `, after eVelo runs out at ${outE}` : ''}`
  const cap = (s: string) => (s.startsWith('eVelo') ? s : s[0].toUpperCase() + s.slice(1))
  let first: string
  if (f.keys.some((k) => k === 'earlyCrash' || k === 'lateCrash')) {
    // The fall as the year-end rows show it: living on income's worst one-year portfolio drop (no
    // loan, so it is the market less its own spending), year 0 against the starting portfolio.
    let worst = 0
    let at = -1
    const [w0, w1] = crashWindow(f.keys, ys.length)
    for (let y = w0; y <= w1; y++) {
      const prev = y ? ys[y - 1].income.portfolio : startPortfolio
      // A year that ends under 5% of where it started is the plan running dry, not the market.
      const dry = ys[y].income.portfolio < prev * 0.05
      const drop = prev > 0 && !dry ? 1 - ys[y].income.portfolio / prev : 0
      if (drop > worst) [worst, at] = [drop, y]
    }
    const fall = at >= 0 && worst >= CRASH_FALL ? `At ${ys[at].age} living on income’s portfolio falls ${percent(worst)} in a year` : null
    first = fall ? `${fall}, and ${ahead}.` : `${cap(ahead)}.`
  } else first = `${cap(ahead)}.`
  const forcedAt = ys.findIndex((y) => y.evelo.forcedSaleSold > 0)
  const forcedSum = ys.reduce((t, y) => t + Math.max(0, y.evelo.forcedSaleSold), 0)
  const forced =
    forcedAt >= 0 ? `eVelo hits a forced sale at ${ys[forcedAt].eveloAge} (${currencyCompact(forcedSum)} sold in all)` : 'eVelo never hits a forced sale'
  const m = Math.min(FIRST_YEARS, ys.length)
  const sold = ys.slice(0, m).reduce((t, y) => t + Math.max(0, y.income.sold), 0)
  const span = m === 1 ? 'its first year' : `its first ${COUNT_WORD[m]} years`
  const sells = sold >= 1 ? `living on income sells ${currencyCompact(sold)} in ${span}` : `living on income sells nothing in ${span}`
  return `${first} ${forced}; ${sells}.`
}
