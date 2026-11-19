// Contract for stage 6 (sync and compare). Types and the field list only; the sync builder adds the
// logic (snapshot, apply, diff, sanitize, persist) below this line, the compare builder reads it.
import type { PlanInputs } from '../engine/types'
import type { IncomeInputs } from '../engine/incomeTypes'
import { CITY_BY_ID } from '../data/cities'
import { budgetTotal } from '../engine/cost'
import { INCOME_LIMITS } from '../engine/income'
import { PATH_OPTIONS } from './share'

/** The values the mode can copy from the eVelo plan, one tick each in the sync sheet. */
export type SyncField =
  | 'portfolio'
  | 'basisFraction'
  | 'age'
  | 'horizonYears'
  /** The eVelo plan's home-city budget total, today's USD/yr (the mode stays home). */
  | 'spending'
  /** Social Security amount and its start age, copied together. */
  | 'otherIncome'
  | 'homeCityId'
  /** seed, paths, blockMonths and outlook, copied together, so both run on the same futures. */
  | 'futures'

export const SYNC_FIELDS: readonly SyncField[] = [
  'portfolio',
  'basisFraction',
  'age',
  'horizonYears',
  'spending',
  'otherIncome',
  'homeCityId',
  'futures',
]

/** What the eVelo plan held for each field when it was copied: the mode-side values it maps to. */
export type SyncSnapshot = Partial<
  Pick<
    IncomeInputs,
    | 'portfolio'
    | 'basisFraction'
    | 'age'
    | 'horizonYears'
    | 'spending'
    | 'otherIncome'
    | 'incomeStartAge'
    | 'homeCityId'
    | 'seed'
    | 'paths'
    | 'blockMonths'
    | 'outlook'
  >
>

/** Stored beside the mode's inputs under `evelo:v2:income` (sanitized on load like everything there). */
export interface SyncRecord {
  /** ISO date-time of the last copy. */
  at: string
  /** The fields ticked and copied. */
  fields: SyncField[]
  /** The eVelo plan's values for those fields at the copy. */
  snapshot: SyncSnapshot
}

/** The eVelo plan as the mode reads it (never written). */
export type EveloPlan = PlanInputs

// ---------------------------------------------------------------------------------------------------
// Logic: snapshot, apply, diff, sanitize. Pure (no store, no DOM), so the store and the tests share it.
// The eVelo plan is only ever read: a snapshot copies its values into the mode's terms.

type SnapKey = keyof Required<SyncSnapshot>

/** The mode-side input keys each field copies. */
export const SYNC_KEYS: Readonly<Record<SyncField, readonly SnapKey[]>> = {
  portfolio: ['portfolio'],
  basisFraction: ['basisFraction'],
  age: ['age'],
  horizonYears: ['horizonYears'],
  spending: ['spending'],
  otherIncome: ['otherIncome', 'incomeStartAge'],
  homeCityId: ['homeCityId'],
  futures: ['seed', 'paths', 'blockMonths', 'outlook'],
}

const SNAP_KEYS = SYNC_FIELDS.flatMap((f) => SYNC_KEYS[f])
const WHOLE_KEYS = new Set<SnapKey>(['age', 'horizonYears', 'incomeStartAge', 'blockMonths', 'seed'])
const OUTLOOKS = ['historical', 'balanced', 'conservative'] as const

/** One snapshot value cleaned like the mode's inputs (clamped to INCOME_LIMITS, whole numbers
 *  rounded, the outlook and home city known, the path count one of eVelo's); `undefined` if unfit. */
function cleanValue(k: SnapKey, v: unknown): SyncSnapshot[SnapKey] | undefined {
  if (k === 'homeCityId') return typeof v === 'string' && v.length < 200 && Object.hasOwn(CITY_BY_ID, v) ? v : undefined
  if (k === 'outlook')
    return typeof v === 'string' && (OUTLOOKS as readonly string[]).includes(v) ? (v as (typeof OUTLOOKS)[number]) : undefined
  if (typeof v !== 'number' || !Number.isFinite(v)) return undefined
  if (k === 'paths') return PATH_OPTIONS.includes(v) ? v : undefined
  const [lo, hi] = INCOME_LIMITS[k as keyof typeof INCOME_LIMITS]
  const x = Math.min(hi, Math.max(lo, v))
  return WHOLE_KEYS.has(k) ? Math.round(x) : x
}

/** A snapshot with own, known keys only, each value cleaned; unfit values are dropped. */
export function sanitizeSnapshot(raw: unknown, keys: readonly SnapKey[] = SNAP_KEYS): SyncSnapshot {
  const out: Record<string, unknown> = {}
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return out
  const src = raw as Record<string, unknown>
  for (const k of keys) {
    if (!Object.hasOwn(src, k)) continue
    const v = cleanValue(k, src[k])
    if (v !== undefined) out[k] = v
  }
  return out as SyncSnapshot
}

/** The eVelo plan's values in the mode's terms. Spending is the home budget's total (the mode stays
 *  home, so a destination's cost is never what it copies). */
export function snapshotFromEvelo(plan: EveloPlan): SyncSnapshot {
  return sanitizeSnapshot({
    portfolio: plan.portfolio,
    basisFraction: plan.basisFraction,
    age: plan.age,
    horizonYears: plan.horizonYears,
    spending: budgetTotal(plan.budget),
    otherIncome: plan.otherIncome,
    incomeStartAge: plan.incomeStartAge,
    homeCityId: plan.homeCityId,
    seed: plan.seed,
    paths: plan.paths,
    blockMonths: plan.blockMonths,
    outlook: plan.outlook,
  })
}

/** Known fields only, each once, in SYNC_FIELDS order. */
export function sanitizeFields(raw: unknown): SyncField[] {
  if (!Array.isArray(raw)) return []
  return SYNC_FIELDS.filter((f) => raw.includes(f))
}

/** The snapshot's values for the given fields only. */
export function pickSnapshot(snapshot: SyncSnapshot, fields: readonly SyncField[]): SyncSnapshot {
  return sanitizeSnapshot(
    snapshot,
    sanitizeFields(fields).flatMap((f) => SYNC_KEYS[f]),
  )
}

/** New inputs with the ticked fields copied from the snapshot; everything else (holdings mix, muni
 *  share, filing status, method) stays the mode's own. The snapshot is cleaned first and `inputs`
 *  is already sanitized, so the result is too. */
export function applySync(inputs: IncomeInputs, snapshot: SyncSnapshot, fields: readonly SyncField[]): IncomeInputs {
  return { ...inputs, ...pickSnapshot(snapshot, fields) }
}

/** Whether the mode already holds the eVelo plan's value(s) for a field. */
export function fieldMatches(field: SyncField, inputs: IncomeInputs, snapshot: SyncSnapshot): boolean {
  return SYNC_KEYS[field].every((k) => snapshot[k] === inputs[k])
}

/** The synced fields whose eVelo values have moved on since the copy (never re-synced from here). */
export function changedSince(record: SyncRecord | null, current: SyncSnapshot): SyncField[] {
  if (!record) return []
  return record.fields.filter((f) => SYNC_KEYS[f].some((k) => record.snapshot[k] !== current[k]))
}

/** A copy's record: the ticked fields, merged onto an earlier record (a re-sync of some fields keeps
 *  the others tracked with the values they were copied at). */
export function makeSyncRecord(
  prev: SyncRecord | null,
  snapshot: SyncSnapshot,
  fields: readonly SyncField[],
  at: Date = new Date(),
): SyncRecord | null {
  const ticked = sanitizeFields(fields)
  if (!ticked.length) return prev
  const all = sanitizeFields([...(prev?.fields ?? []), ...ticked])
  return {
    at: at.toISOString(),
    fields: all,
    snapshot: { ...(prev?.snapshot ?? {}), ...pickSnapshot(snapshot, ticked) },
  }
}

const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?Z$/

/** A stored record, or null: own keys only, fields from SYNC_FIELDS (at least one), the snapshot's
 *  values for those fields cleaned like the inputs, `at` a valid ISO date-time. */
export function sanitizeSyncRecord(raw: unknown): SyncRecord | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  const src = raw as Record<string, unknown>
  const at = Object.hasOwn(src, 'at') ? src.at : undefined
  if (typeof at !== 'string' || !ISO.test(at)) return null
  const t = Date.parse(at)
  if (!Number.isFinite(t)) return null
  const fields = sanitizeFields(Object.hasOwn(src, 'fields') ? src.fields : undefined)
  if (!fields.length) return null
  const snapshot = sanitizeSnapshot(
    Object.hasOwn(src, 'snapshot') ? src.snapshot : undefined,
    fields.flatMap((f) => SYNC_KEYS[f]),
  )
  return { at: new Date(t).toISOString(), fields, snapshot }
}
