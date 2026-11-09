// Share links: inputs -> compact base64url string in `#p=...` (legacy `#/?p=...` still opens).
//
// Encoding: JSON of only the fields that differ from DEFAULT_INPUTS (deep-compared), wrapped
// as { v: 1, d: diff }, UTF-8 encoded, base64url without padding. Decoding merges the diff
// back onto DEFAULT_INPUTS, ignoring unknown keys and values of the wrong type, so a
// malformed or hostile link can never put the store into an invalid shape.

import { CITY_BY_ID } from '../data/cities'
import { BUDGET_CATEGORIES } from '../engine/cost'
import { DEFAULT_INPUTS } from '../engine/defaults'
import type { BudgetCategory, Holding, PlanInputs } from '../engine/types'
import { clampExistingLoan } from '../ui/plan/existingLoan'
import { assetMeta } from '../ui/plan/marketIndex'

const VERSION = 1

function toBase64Url(bytes: Uint8Array): string {
  let bin = ''
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i])
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
function fromBase64Url(s: string): Uint8Array {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4)
  const bin = atob(b64)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)

export function encodeInputs(inputs: PlanInputs): string {
  const diff: Record<string, unknown> = {}
  for (const k of Object.keys(inputs) as (keyof PlanInputs)[]) {
    if (!same(inputs[k], DEFAULT_INPUTS[k])) diff[k] = inputs[k]
  }
  return toBase64Url(new TextEncoder().encode(JSON.stringify({ v: VERSION, d: diff })))
}

/** Shallow-typed merge: keeps a key only if its JSON type matches the default's. */
/** Well-formed holdings for tickers in the bundled data only (max 50); anything else is dropped. */
export function sanitizeHoldings(v: unknown): Holding[] {
  if (!Array.isArray(v)) return []
  return v
    .filter(
      (h): h is { symbol: string; weight: number } =>
        !!h &&
        typeof h === 'object' &&
        typeof (h as { symbol?: unknown }).symbol === 'string' &&
        typeof (h as { weight?: unknown }).weight === 'number' &&
        Number.isFinite((h as { weight: number }).weight),
    )
    .filter((h) => !!assetMeta(h.symbol))
    .slice(0, 50)
    .map((h) => ({ symbol: h.symbol, weight: h.weight }))
}

/** The engine's MAX_RETIRE_IN_YEARS / MAX_SAVINGS_WHILE_WORKING (engine/simulate.ts), restated so the
 *  main bundle doesn't pull in the simulation module; a test keeps them equal. */
export const MAX_RETIRE_IN_YEARS = 15
export const MAX_SAVINGS_WHILE_WORKING = 1_000_000

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

/** Numeric ranges the plan UI itself allows (the sliders and fields in src/ui/plan), so a plan made
 *  in the app is never altered and a hostile link cannot feed the engine nonsense (e.g. a
 *  capital-gains rate of 5 makes the sell gross-up 1/(1 − g·tax) negative). */
export const INPUT_LIMITS = {
  portfolio: [0, 1e10],
  basisFraction: [0, 1],
  age: [30, 85],
  horizonYears: [10, 40],
  moveInYears: [0, 40],
  retireInYears: [0, MAX_RETIRE_IN_YEARS], // whole years, and below the horizon
  savingsWhileWorking: [0, MAX_SAVINGS_WHILE_WORKING],
  expatFactor: [0, 1],
  otherIncome: [0, 1_000_000],
  incomeStartAge: [50, 80],
  existingLoan: [0, 1e10 - 1], // and below the portfolio (maxExistingLoan)
  loanRate: [0.02, 0.12],
  maxLtv: [0.3, 0.8],
  targetLtvAfterCall: [0.1, 0.75], // and at most maxLtv − 0.05 (BorrowingSection's GAP)
  capGainsRate: [0, 0.6],
  dividendTaxDrag: [0, 0.015],
  blockMonths: [6, 60],
  seed: [0, 2 ** 31 - 1],
} as const satisfies Partial<Record<keyof PlanInputs, readonly [number, number]>>

/** Path counts the model section offers. */
export const PATH_OPTIONS = [1000, 4000, 10000]
const LTV_GAP = 0.05
const BUDGET_MAX = 1e9
const RATIO_LIMITS = [0.05, 5] as const
/** Own keys only: `'constructor' in {}` is true, so `in` would let prototype names through. */
const isCategory = (k: string): k is BudgetCategory => (BUDGET_CATEGORIES as string[]).includes(k)
const isCityId = (k: string) => Object.hasOwn(CITY_BY_ID, k)

export function sanitizeInputs(raw: unknown): PlanInputs {
  const base: PlanInputs = structuredClone(DEFAULT_INPUTS)
  if (!raw || typeof raw !== 'object') return base
  const src = raw as Record<string, unknown>
  const out = base as unknown as Record<string, unknown>
  for (const k of Object.keys(base)) {
    if (!(k in src)) continue
    const dv = out[k]
    const v = src[k]
    if (typeof dv === 'number') {
      if (typeof v === 'number' && Number.isFinite(v)) out[k] = v
    } else if (typeof dv === 'string') {
      if (typeof v === 'string' && v.length < 200) out[k] = v
    } else if (dv === null || k === 'destCityId') {
      if (v === null || typeof v === 'string') out[k] = v
    } else if (Array.isArray(dv)) {
      if (k === 'holdings' && Array.isArray(v)) {
        // An empty list is a valid (empty) plan; the UI prompts to add a holding.
        out[k] = sanitizeHoldings(v)
      }
    } else if (typeof dv === 'object') {
      if (v && typeof v === 'object' && !Array.isArray(v)) {
        const merged: Record<string, unknown> = { ...(dv as object) }
        for (const [ck, cv] of Object.entries(v)) {
          if (typeof cv === 'number' && Number.isFinite(cv) && Object.hasOwn(merged, ck)) merged[ck] = cv
        }
        out[k] = merged
      }
    }
  }
  // Numbers within the UI's own ranges.
  const nums = base as unknown as Record<string, number>
  for (const [k, [lo, hi]] of Object.entries(INPUT_LIMITS)) nums[k] = clamp(nums[k], lo, hi)
  // An existing loan can't reach the portfolio it borrows against (the UI field's own max).
  base.existingLoan = clampExistingLoan(base.existingLoan, base.portfolio)
  base.targetLtvAfterCall = Math.min(base.targetLtvAfterCall, Math.round((base.maxLtv - LTV_GAP) * 100) / 100)
  base.seed = Math.round(base.seed)
  // Retire-in is whole years and ends before the plan does (as the engine's normalizeInputs keeps it).
  base.retireInYears = Math.max(0, Math.min(Math.round(base.retireInYears), Math.round(base.horizonYears) - 1))
  if (!PATH_OPTIONS.includes(base.paths)) base.paths = DEFAULT_INPUTS.paths
  for (const c of Object.keys(base.budget) as (keyof PlanInputs['budget'])[]) base.budget[c] = clamp(base.budget[c], 0, BUDGET_MAX)
  base.holdings = base.holdings.map((h) => ({ ...h, weight: clamp(h.weight, 0, 1) }))
  // Enumerations must be known values.
  if (base.method !== 'bootstrap' && base.method !== 'fat-tail') base.method = DEFAULT_INPUTS.method
  if (!['historical', 'balanced', 'conservative'].includes(base.outlook)) base.outlook = DEFAULT_INPUTS.outlook
  // Optional keys not present in defaults.
  const ro = src.ratioOverrides
  if (ro && typeof ro === 'object' && !Array.isArray(ro)) {
    const clean: Record<string, number> = {}
    for (const [ck, cv] of Object.entries(ro))
      if (isCategory(ck) && typeof cv === 'number' && Number.isFinite(cv)) clean[ck] = clamp(cv, RATIO_LIMITS[0], RATIO_LIMITS[1])
    if (Object.keys(clean).length) base.ratioOverrides = clean
  }
  // Fixed destination amounts: known city ids -> known categories -> finite USD in [0, BUDGET_MAX].
  // Fresh objects with only allowed keys copied, so `__proto__`/`constructor` can't get in.
  const ao = src.amountOverrides
  if (ao && typeof ao === 'object' && !Array.isArray(ao)) {
    const clean: Record<string, Partial<Record<BudgetCategory, number>>> = {}
    for (const [city, cats] of Object.entries(ao)) {
      if (!isCityId(city) || !cats || typeof cats !== 'object' || Array.isArray(cats)) continue
      const row: Partial<Record<BudgetCategory, number>> = {}
      for (const [ck, cv] of Object.entries(cats))
        if (isCategory(ck) && typeof cv === 'number' && Number.isFinite(cv)) row[ck] = clamp(cv, 0, BUDGET_MAX)
      if (Object.keys(row).length) clean[city] = row
    }
    if (Object.keys(clean).length) base.amountOverrides = clean
  }
  // Moving to where you already live is staying home.
  if (base.destCityId === base.homeCityId) base.destCityId = null
  return base
}

export function decodeInputs(s: string): PlanInputs | null {
  try {
    const json = JSON.parse(new TextDecoder().decode(fromBase64Url(s)))
    if (!json || json.v !== VERSION || typeof json.d !== 'object') return null
    return sanitizeInputs({ ...DEFAULT_INPUTS, ...json.d })
  } catch {
    return null
  }
}

/** Page URL without its hash, preferring a real http(s) address (a sandboxed preview frame may not have one). */
export function baseUrl(loc: Pick<Location, 'href' | 'protocol'> = window.location, referrer = document.referrer): string {
  const strip = (u: string) => u.replace(/#.*$/, '')
  if (/^https?:$/.test(loc.protocol)) return strip(loc.href)
  if (/^https?:\/\//.test(referrer)) return strip(referrer)
  return strip(loc.href)
}

export function shareUrl(inputs: PlanInputs, base = baseUrl()): string {
  return `${base}#p=${encodeInputs(inputs)}`
}
