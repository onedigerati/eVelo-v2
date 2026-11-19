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
import { INCOME_KEY } from './resetPlan'
import { PATH_OPTIONS } from './share'

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

export function loadIncomeInputs(storage: Pick<Storage, 'getItem'> | null): IncomeInputs {
  try {
    const s = storage?.getItem(INCOME_KEY)
    return sanitizeIncomeInputs(s == null ? null : JSON.parse(s))
  } catch {
    return sanitizeIncomeInputs(null)
  }
}

export function saveIncomeInputs(storage: Pick<Storage, 'setItem'> | null, inputs: IncomeInputs): void {
  try {
    storage?.setItem(INCOME_KEY, JSON.stringify(inputs))
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
  /** Merge a change; it is sanitized like a stored value, then saved (debounced). */
  setInputs: (patch: Partial<IncomeInputs>) => void
}

export const useIncomeStore = create<IncomeState>((set, get) => ({
  inputs: loadIncomeInputs(browserStorage()),
  setInputs: (patch) => set({ inputs: sanitizeIncomeInputs({ ...get().inputs, ...patch }) }),
}))

let saveTimer: ReturnType<typeof setTimeout> | undefined
useIncomeStore.subscribe((s, prev) => {
  if (s.inputs === prev.inputs) return
  clearTimeout(saveTimer)
  saveTimer = setTimeout(() => saveIncomeInputs(browserStorage(), useIncomeStore.getState().inputs), SAVE_DEBOUNCE_MS)
})
