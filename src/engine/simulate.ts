import { amountsTotal, budgetTotal, destinationSpend } from './cost'
import { createRecorder, kernelOpeningSale, runPaths, type KernelConfig } from './kernel'
import { HEIRS, packBands } from './localTax'
import { prepare, type Prepared } from './prepare'
import { generateScenarios, type Scenarios } from './scenarios'
import type { Bands, BudgetCategory, City, MarketData, PlanInputs, SimulationResult } from './types'

const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now())

export interface Destination {
  city: City | null
  ratios: Record<BudgetCategory, number> | null
  /** Destination annual spend per category, today's USD: fixed amounts for this city where set,
   *  else home budget × ratio (null when staying home). */
  amounts: Record<BudgetCategory, number> | null
  /** Annual destination spend, today's USD (null when staying home). */
  annual: number | null
}

export function findCity(cities: City[], id: string | null): City | null {
  if (!id) return null
  return cities.find((c) => c.id === id) ?? null
}

/** Resolve the destination's ratios and annual spend for a given dest city via `destinationSpend`:
 *  typed overrides scale with the expat premium from their anchors. Fixed amounts come only from
 *  `inputs.amountOverrides[dest.id]`, so each city sees only its own. */
export function resolveDestination(inputs: PlanInputs, home: City | null, dest: City | null): Destination {
  if (!dest || !home || dest.id === home.id) return { city: null, ratios: null, amounts: null, annual: null }
  const { ratios, amounts } = destinationSpend(inputs, home, dest)
  return { city: dest, ratios, amounts, annual: amountsTotal(amounts) }
}

export function kernelConfig(inputs: PlanInputs, dest: Destination, budgetMultiplier = 1): KernelConfig {
  const T = Math.max(1, Math.round(inputs.horizonYears * 12))
  const homeAnnual = budgetTotal(inputs.budget) * budgetMultiplier
  const hasDest = dest.city != null && dest.annual != null
  const fxVol = hasDest && dest.city!.currency !== 'USD' ? dest.city!.fxVol || 0 : 0
  // Working months before retirement: whole months, within the horizon (non-finite = retire now).
  const retireRaw = Math.round(inputs.retireInYears * 12)
  const retireMonth = Number.isFinite(retireRaw) ? Math.min(T, Math.max(0, retireRaw)) : 0
  // The move can't come before retirement, so the wealth tax and the residence test start no earlier.
  const moveMonth = hasDest ? Math.max(0, Math.round(inputs.moveInYears * 12), retireMonth) : T
  const lt = hasDest ? dest.city!.localTax : undefined
  const wealth = lt?.wealth && lt.wealth.bands.length ? lt.wealth : null
  const inh = lt?.inheritance && lt.inheritance.bands.length ? lt.inheritance : null
  // A regime that reaches the worldwide estate only after N years' residence applies if the years
  // lived there by the horizon (T - moveMonth months) are strictly more than N (Ireland: after 5
  // years; Japan: more than 10 of 15).
  const inhApplies = inh != null && moveMonth < T && T - moveMonth > 12 * (inh.afterYearsResident ?? 0)
  return {
    T,
    portfolio: inputs.portfolio,
    basisFraction: Math.min(1, Math.max(0, inputs.basisFraction)),
    dragM: inputs.dividendTaxDrag / 12,
    loanRateM: inputs.loanRate / 12,
    maxLtv: inputs.maxLtv,
    targetLtv: Math.min(inputs.targetLtvAfterCall, inputs.maxLtv),
    tax: inputs.capGainsRate,
    homeMonthly: homeAnnual / 12,
    destMonthly: hasDest ? (dest.annual! * budgetMultiplier) / 12 : homeAnnual / 12,
    moveMonth,
    fxSigmaM: fxVol / Math.sqrt(12),
    incomeMonthly: inputs.otherIncome / 12,
    incomeStartMonth: Math.max(0, Math.ceil((inputs.incomeStartAge - inputs.age) * 12 - 1e-9)),
    retireMonth,
    // Savings while working, today's USD/month: never scaled by budgetMultiplier (the solver scales
    // retirement spending only). Finite and > 0, else 0.
    savingsMonthly:
      Number.isFinite(inputs.savingsWhileWorking) && inputs.savingsWhileWorking > 0 ? inputs.savingsWhileWorking / 12 : 0,
    // finite and > 0, else 0 (Math.max would pass Infinity through)
    initialLoan: Number.isFinite(inputs.existingLoan) && inputs.existingLoan > 0 ? inputs.existingLoan : 0,
    wealthTax: wealth && moveMonth < T ? { gross: wealth.base === 'gross', bands: packBands(wealth.bands) } : null,
    inheritance: inhApplies ? { heirs: HEIRS, perHeirAllowance: inh.perHeirAllowance, bands: packBands(inh.bands) } : null,
  }
}

export function makeScenarios(prep: Prepared, inputs: PlanInputs, paths: number): Scenarios {
  const T = Math.max(1, Math.round(inputs.horizonYears * 12))
  return generateScenarios(prep, inputs.method, inputs.blockMonths, Math.max(1, Math.floor(paths)), T, inputs.seed)
}

function quantile(sorted: ArrayLike<number>, q: number): number {
  const n = sorted.length
  if (!n) return 0
  const pos = (n - 1) * q
  const lo = Math.floor(pos)
  const hi = Math.min(n - 1, lo + 1)
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo)
}

function median(a: Float64Array): number {
  return quantile(Float64Array.from(a).sort(), 0.5)
}

function bands(data: Float64Array, paths: number, years: number): Bands {
  const b: Bands = { p5: [], p25: [], p50: [], p75: [], p95: [] }
  for (let y = 0; y <= years; y++) {
    const col = data.subarray(y * paths, (y + 1) * paths).sort()
    b.p5.push(quantile(col, 0.05))
    b.p25.push(quantile(col, 0.25))
    b.p50.push(quantile(col, 0.5))
    b.p75.push(quantile(col, 0.75))
    b.p95.push(quantile(col, 0.95))
  }
  return b
}

/** 100 dots proportional to the rates (largest-remainder rounding), sorted clean→bruised→broken. */
export function outcomeDots(rates: [number, number, number]): (0 | 1 | 2)[] {
  const raw = rates.map((r) => Math.max(0, r) * 100)
  const counts = raw.map(Math.floor)
  let left = 100 - counts.reduce((s, c) => s + c, 0)
  const order = [0, 1, 2].sort((a, b) => raw[b] - counts[b] - (raw[a] - counts[a]) || a - b)
  for (let i = 0; left > 0; i = (i + 1) % 3, left--) counts[order[i]]++
  const dots: (0 | 1 | 2)[] = []
  for (const k of [0, 1, 2] as const) for (let i = 0; i < counts[k]; i++) dots.push(k)
  return dots.slice(0, 100)
}

export const MAX_RETIRE_IN_YEARS = 15
export const MAX_SAVINGS_WHILE_WORKING = 1_000_000

/** Horizon is modelled in whole years (bands are yearly). Retire-in is a whole number of years in
 *  [0, 15] and below the horizon; savings are in [0, 1M]; non-finite (or missing) values are 0.
 *  Returns `inputs` itself when nothing changes. */
export function normalizeInputs(inputs: PlanInputs): PlanInputs {
  const horizonYears = Math.max(1, Math.round(inputs.horizonYears))
  const ry = Math.round(inputs.retireInYears)
  const retireInYears = Number.isFinite(ry) ? Math.max(0, Math.min(ry, MAX_RETIRE_IN_YEARS, horizonYears - 1)) : 0
  const sw = inputs.savingsWhileWorking
  const savingsWhileWorking = Number.isFinite(sw) ? Math.min(MAX_SAVINGS_WHILE_WORKING, Math.max(0, sw)) : 0
  return horizonYears === inputs.horizonYears &&
    retireInYears === inputs.retireInYears &&
    savingsWhileWorking === inputs.savingsWhileWorking
    ? inputs
    : { ...inputs, horizonYears, retireInYears, savingsWhileWorking }
}

export function simulate(market: MarketData, cities: City[], rawInputs: PlanInputs): SimulationResult {
  const t0 = now()
  const inputs = normalizeInputs(rawInputs)
  const prep = prepare(market, inputs.holdings, inputs.outlook)
  const home = findCity(cities, inputs.homeCityId)
  const dest = resolveDestination(inputs, home, findCity(cities, inputs.destCityId))
  const cfg = kernelConfig(inputs, dest)
  const sc = makeScenarios(prep, inputs, inputs.paths)
  const paths = sc.paths
  const years = Math.floor(cfg.T / 12)
  const rec = createRecorder(paths, years)
  runPaths(sc, cfg, rec)
  const open = kernelOpeningSale(cfg)

  const counts = [0, 0, 0]
  for (let p = 0; p < paths; p++) counts[rec.outcome[p]]++
  const rates = counts.map((c) => c / paths) as [number, number, number]

  const horizonYears = Math.ceil(cfg.T / 12)
  const byYear = new Array(horizonYears).fill(0)
  for (let p = 0; p < paths; p++) {
    const m = rec.firstCall[p]
    if (m >= 0) byYear[Math.floor(m / 12)] += 1 / paths
  }
  const cumulative: number[] = []
  byYear.reduce((s, x) => (cumulative.push(s + x), s + x), 0)

  let wins = 0
  for (let p = 0; p < paths; p++) if (rec.bbdEstate[p] > rec.sellEstate[p]) wins++

  return {
    inputs,
    successRate: rates[0],
    bruisedRate: rates[1],
    brokenRate: rates[2],
    outcomeDots: outcomeDots(rates),
    netWorth: bands(rec.nw, paths, years),
    portfolioValue: bands(rec.port, paths, years),
    loan: bands(rec.loan, paths, years),
    ltv: bands(rec.ltv, paths, years),
    marginCallByYear: byYear,
    marginCallCumulative: cumulative,
    openingSale: open !== null && !open.broken ? { sold: open.sold, taxPaid: open.taxPaid } : null,
    openingBroken: open !== null && open.broken,
    spendHome: budgetTotal(inputs.budget),
    spendDest: dest.annual,
    categoryRatios: dest.ratios,
    categoryAmounts: dest.amounts,
    estate: {
      bbdMedian: median(rec.bbdEstate),
      sellMedian: median(rec.sellEstate),
      bbdWins: wins / paths,
      sellTaxMedian: median(rec.sellTax),
    },
    localTax:
      dest.city?.localTax
        ? {
            wealthTaxMedian: median(rec.wealthTax),
            inheritanceTaxMedian: median(rec.inheritanceTax),
            bbdEstateBeforeTaxMedian: median(rec.bbdEstateBeforeTax),
            inheritanceApplies: cfg.inheritance != null,
          }
        : null,
    stats: {
      expReturn: prep.expReturn,
      volatility: prep.volatility,
      cagrMedian: median(rec.cagr),
      expReturnReal: prep.expReturnReal,
      cagrMedianReal: median(rec.cagrReal),
    },
    correlation: prep.correlation,
    elapsedMs: now() - t0,
  }
}
