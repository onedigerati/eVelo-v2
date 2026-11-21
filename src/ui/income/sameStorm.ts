// Same storm: both plans through the same sampled futures (stage 4 of the walkthrough plan).
// Contract shared by the logic builder (this file's bodies + tests) and the view builder
// (SameStorm.tsx). Pure, no React.

import { normalizeIncomeInputs } from '../../engine/income'
import type { IncomeInputs, IncomeResult, IncomeSampleYear } from '../../engine/incomeTypes'
import { SAMPLE_KEYS, type SampleFuture, type SampleKey } from '../../engine/sampleFutures'
import type { EveloSampleYear, PlanInputs, SimulationResult } from '../../engine/types'
import { currencyCompact, percent } from '../format'

/** Why Same storm is hidden, or 'shown'. */
export type StormGate = 'shown' | 'fat-tail' | 'different-futures' | 'different-years' | 'no-samples'

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
  /** Age during the year. */
  age: number
  income: IncomeSampleYear
  evelo: EveloSampleYear
}

/** The draw settings each engine actually uses, after its own normalisation. eVelo (simulate):
 *  horizon = max(1, round(h)) as normalizeInputs does (mirrored here so the UI doesn't bundle
 *  simulate), paths floored to at least 1 (makeScenarios), blockMonths used as given (the block
 *  draw reads 1/max(1, b), so a fractional share-link value stays fractional), seed read as
 *  seed >>> 0 by the RNG. Income: normalizeIncomeInputs, which rounds blockMonths and the seed. */
function drawn(evelo: PlanInputs, income: IncomeInputs) {
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

/** Both results' samples by key, or null when either has none. */
function samplesOf(eveloResult: SimulationResult, incomeResult: IncomeResult) {
  const es = eveloResult.samples
  const is = incomeResult.samples
  if (!es?.length || !is?.length) return null
  const byKey = <R,>(list: SampleFuture<R>[]) => new Map(list.map((s) => [s.key, s] as const))
  return { e: byKey(es), i: byKey(is) }
}

/** Why Same storm is hidden, checked in this order: 'fat-tail' when either plan's method isn't the
 *  historical replay (no matched months exist); 'different-futures' when the seed, path count, block
 *  length or outlook differ as each engine normalises them (checked before the horizon, as the
 *  comparison's like-for-like lines are, so the two lines agree); 'different-years' when the
 *  horizons differ; 'no-samples' when either result has no samples or the two disagree key by key
 *  (a key in one and not the other, or a different path) — the final proof they drew the same
 *  months, which also catches a stale result. Start ages aren't compared: they don't change the
 *  months drawn, so rows align by year index and the ages shown are the income plan's. */
export function stormGate(evelo: PlanInputs, eveloResult: SimulationResult, income: IncomeInputs, incomeResult: IncomeResult): StormGate {
  const { e, i } = drawn(evelo, income)
  if (e.method !== 'bootstrap' || i.method !== 'bootstrap') return 'fat-tail'
  if (e.seed !== i.seed || e.paths !== i.paths || e.block !== i.block || e.outlook !== i.outlook) return 'different-futures'
  if (e.horizon !== i.horizon) return 'different-years'
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
export function stormHiddenText(gate: Exclude<StormGate, 'shown'>): string {
  switch (gate) {
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
  const { age, portfolio } = drawn(evelo, income)
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
    const years: StormYear[] = Array.from({ length: n }, (_, y) => ({ age: age + y, income: b.years[y], evelo: a.years[y] }))
    out.push({ keys: [k], label: KEY_LABEL[k], path: a.path, years, callLtv: evelo.maxLtv, caption: '' })
  }
  for (const f of out) f.caption = stormCaption(f, portfolio)
  return out
}

/** Two short sentences from this future's rows only: the fall (crash chips) and who ends ahead
 *  (eVelo's net worth after its loan against living on income's portfolio); then eVelo's forced
 *  sales (first age, total sold) and what living on income sold in its first seven years. */
function stormCaption(f: StormFuture, startPortfolio: number): string {
  const ys = f.years
  if (!ys.length) return ''
  const last = ys[ys.length - 1]
  const diff = last.evelo.netWorth - last.income.portfolio
  const ahead =
    Math.abs(diff) < 1
      ? `both plans end level at ${currencyCompact(last.income.portfolio)}`
      : diff > 0
        ? `eVelo ends ${currencyCompact(diff)} ahead`
        : `living on income ends ${currencyCompact(-diff)} ahead`
  let first: string
  if (f.keys.some((k) => k === 'earlyCrash' || k === 'lateCrash')) {
    // The fall as the year-end rows show it: living on income's worst one-year portfolio drop (no
    // loan, so it is the market less its own spending), year 0 against the starting portfolio.
    let worst = 0
    let at = -1
    for (let y = 0; y < ys.length; y++) {
      const prev = y ? ys[y - 1].income.portfolio : startPortfolio
      const drop = prev > 0 ? 1 - ys[y].income.portfolio / prev : 0
      if (drop > worst) [worst, at] = [drop, y]
    }
    const fall =
      at >= 0 && worst >= 0.005
        ? `At ${ys[at].age} living on income’s portfolio falls ${percent(worst)} in a year`
        : 'Through the fall living on income’s portfolio never ends a year lower'
    first = `${fall}, and ${ahead}.`
  } else first = `${ahead.startsWith('eVelo') ? ahead : ahead[0].toUpperCase() + ahead.slice(1)}.`
  const forcedAt = ys.findIndex((y) => y.evelo.forcedSaleSold > 0)
  const forcedSum = ys.reduce((t, y) => t + Math.max(0, y.evelo.forcedSaleSold), 0)
  const forced =
    forcedAt >= 0 ? `eVelo hits a forced sale at ${ys[forcedAt].age} (${currencyCompact(forcedSum)} sold in all)` : 'eVelo never hits a forced sale'
  const m = Math.min(FIRST_YEARS, ys.length)
  const sold = ys.slice(0, m).reduce((t, y) => t + Math.max(0, y.income.sold), 0)
  const span = m === 1 ? 'its first year' : `its first ${COUNT_WORD[m]} years`
  const sells = sold >= 1 ? `living on income sells ${currencyCompact(sold)} in ${span}` : `living on income sells nothing in ${span}`
  return `${first} ${forced}; ${sells}.`
}
