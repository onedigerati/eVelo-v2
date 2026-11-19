// The living-on-income mode's own state, kept apart from eVelo's store under `evelo:v2:income`.
// Every stored value is a user-input boundary, so load parses like share.ts's sanitizeInputs: a
// typed merge over INCOME_DEFAULTS (own keys only), numbers finite and clamped to INCOME_LIMITS,
// whole-number fields rounded, enumerations and the home city checked; bad JSON or the wrong shape
// is the defaults. The error boundary's Reset removes the key (resetPlan.ts). No share links.
// Imported only by the lazy mode chunk.

import { create } from 'zustand'
import { CITY_BY_ID } from '../data/cities'
import { INCOME_DEFAULTS, INCOME_LIMITS } from '../engine/income'
import type { IncomeInputs } from '../engine/incomeTypes'
import type { PlanInputs } from '../engine/types'
import {
  makeSyncRecord,
  sanitizeSyncRecord,
  snapshotFromEvelo,
  applySync as applySyncTo,
  type SyncField,
  type SyncRecord,
} from './incomeSync'
import { parsePersisted } from './persisted'
import { INCOME_KEY } from './resetPlan'
import { PATH_OPTIONS, sanitizeInputs } from './share'

export { INCOME_KEY }
export const SAVE_DEBOUNCE_MS = 250

type Store = Pick<Storage, 'getItem' | 'setItem'>

const WHOLE = new Set<keyof IncomeInputs>(['age', 'horizonYears', 'incomeStartAge', 'blockMonths', 'seed'])
const ENUMS: Partial<Record<keyof IncomeInputs, readonly string[]>> = {
  filingStatus: ['single', 'mfj'],
  method: ['bootstrap', 'fat-tail'],
  outlook: ['historical', 'balanced', 'conservative'],
}

export function sanitizeIncomeInputs(raw: unknown): IncomeInputs {
  const base: IncomeInputs = { ...INCOME_DEFAULTS }
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return base
  const src = raw as Record<string, unknown>
  const out = base as unknown as Record<string, unknown>
  for (const k of Object.keys(INCOME_DEFAULTS) as (keyof IncomeInputs)[]) {
    if (!Object.hasOwn(src, k)) continue
    const v = src[k]
    const dv = INCOME_DEFAULTS[k]
    if (typeof dv === 'number') {
      if (typeof v === 'number' && Number.isFinite(v)) out[k] = v
    } else if (typeof dv === 'string') {
      const allowed = ENUMS[k]
      if (typeof v !== 'string' || v.length >= 200) continue
      if (allowed ? allowed.includes(v) : k === 'homeCityId' ? Object.hasOwn(CITY_BY_ID, v) : true) out[k] = v
    }
  }
  const nums = base as unknown as Record<string, number>
  for (const [k, [lo, hi]] of Object.entries(INCOME_LIMITS)) {
    const x = Math.min(hi, Math.max(lo, nums[k]))
    nums[k] = WHOLE.has(k as keyof IncomeInputs) ? Math.round(x) : x
  }
  // The path count is one of eVelo's own choices, so the futures match a plan's.
  if (!PATH_OPTIONS.includes(base.paths)) base.paths = INCOME_DEFAULTS.paths
  return base
}

/** Where the six questions stand: the question on screen (1–6), and whether they were finished (a
 *  returning visitor then lands on the results). Stored beside the inputs, under the same key. */
export interface IncomeFlow {
  step: number
  done: boolean
}
export const INCOME_STEPS = 6
export const FLOW_DEFAULTS: IncomeFlow = { step: 1, done: false }

export function sanitizeIncomeFlow(raw: unknown): IncomeFlow {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return { ...FLOW_DEFAULTS }
  const src = raw as Record<string, unknown>
  const st = Object.hasOwn(src, 'step') ? src.step : undefined
  const step = typeof st === 'number' && Number.isFinite(st) ? Math.min(INCOME_STEPS, Math.max(1, Math.round(st))) : FLOW_DEFAULTS.step
  const done = Object.hasOwn(src, 'done') && src.done === true
  return { step, done }
}

function readStored(storage: Pick<Storage, 'getItem'> | null): unknown {
  try {
    const s = storage?.getItem(INCOME_KEY)
    return s == null ? null : JSON.parse(s)
  } catch {
    return null
  }
}

export function loadIncomeFlow(storage: Pick<Storage, 'getItem'> | null): IncomeFlow {
  return sanitizeIncomeFlow(readStored(storage))
}

export function loadIncomeInputs(storage: Pick<Storage, 'getItem'> | null): IncomeInputs {
  return sanitizeIncomeInputs(readStored(storage))
}

/** The last sync's record, stored beside the inputs and flow under `sync`; null if none or unfit. */
export function loadIncomeSync(storage: Pick<Storage, 'getItem'> | null): SyncRecord | null {
  const raw = readStored(storage)
  return raw && typeof raw === 'object' && !Array.isArray(raw) && Object.hasOwn(raw, 'sync')
    ? sanitizeSyncRecord((raw as { sync: unknown }).sync)
    : null
}

/** eVelo's own key (store.ts's LS_KEY). Read only, never written from the mode. */
export const EVELO_KEY = 'evelo:v2'

/** The eVelo plan as stored, through eVelo's own sanitizer (its defaults when nothing is stored). */
export function loadEveloPlan(storage: Pick<Storage, 'getItem'> | null): PlanInputs {
  let raw: string | null = null
  try {
    raw = storage?.getItem(EVELO_KEY) ?? null
  } catch {
    /* blocked */
  }
  return sanitizeInputs(parsePersisted(raw).inputs)
}

export function saveIncomeInputs(
  storage: Pick<Storage, 'setItem'> | null,
  inputs: IncomeInputs,
  flow?: IncomeFlow,
  sync?: SyncRecord | null,
): void {
  try {
    const value: Record<string, unknown> = flow ? { ...inputs, step: flow.step, done: flow.done } : { ...inputs }
    if (sync) value.sync = sync
    storage?.setItem(INCOME_KEY, JSON.stringify(value))
  } catch {
    /* storage full or blocked — the mode keeps working for this visit */
  }
}

function browserStorage(): Store | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage
  } catch {
    return null
  }
}

interface IncomeState {
  inputs: IncomeInputs
  flow: IncomeFlow
  /** Merge a change; it is sanitized like a stored value, then saved (debounced). */
  setInputs: (patch: Partial<IncomeInputs>) => void
  /** Move through the questions; sanitized the same way, then saved. */
  setFlow: (patch: Partial<IncomeFlow>) => void
  /** The last sync with the eVelo plan (null until one): when, which fields, and eVelo's values then. */
  sync: SyncRecord | null
  /** The eVelo plan, read only: eVelo's store when the mode refreshes it, else `evelo:v2` sanitized. */
  evelo: PlanInputs
  /** Replace the read copy of the eVelo plan (the mode calls it on mount, focus and storage events). */
  setEvelo: (plan: PlanInputs) => void
  /** Copy the ticked fields from the eVelo plan once, and record the copy. */
  syncFrom: (fields: readonly SyncField[]) => void
}

export const useIncomeStore = create<IncomeState>((set, get) => ({
  inputs: loadIncomeInputs(browserStorage()),
  flow: loadIncomeFlow(browserStorage()),
  setInputs: (patch) => set({ inputs: sanitizeIncomeInputs({ ...get().inputs, ...patch }) }),
  setFlow: (patch) => set({ flow: sanitizeIncomeFlow({ ...get().flow, ...patch }) }),
  sync: loadIncomeSync(browserStorage()),
  evelo: loadEveloPlan(browserStorage()),
  setEvelo: (plan) => {
    const evelo = sanitizeInputs(plan)
    // Same plan, same object: readers re-render only when eVelo really changed.
    if (JSON.stringify(evelo) !== JSON.stringify(get().evelo)) set({ evelo })
  },
  syncFrom: (fields) => {
    const { inputs, evelo, sync } = get()
    const snap = snapshotFromEvelo(evelo)
    const record = makeSyncRecord(sync, snap, fields)
    if (record === sync) return
    set({
      inputs: sanitizeIncomeInputs(applySyncTo(inputs, snap, fields)),
      sync: record,
    })
  },
}))

/** The eVelo plan as the mode reads it (for the comparison and the sync sheet). */
export const selectEvelo = (s: IncomeState) => s.evelo
export const useEveloPlan = () => useIncomeStore(selectEvelo)
/** The last sync record, or null. */
export const selectSync = (s: IncomeState) => s.sync

let saveTimer: ReturnType<typeof setTimeout> | undefined
useIncomeStore.subscribe((s, prev) => {
  if (s.inputs === prev.inputs && s.flow === prev.flow && s.sync === prev.sync) return
  clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    const now = useIncomeStore.getState()
    saveIncomeInputs(browserStorage(), now.inputs, now.flow, now.sync)
  }, SAVE_DEBOUNCE_MS)
})
