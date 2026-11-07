// App state. One zustand store; inputs + theme persist to localStorage.
// Slots for engine output (result / atlas / solve / status) are filled by later stages.

import { create } from 'zustand'
import { DEFAULT_INPUTS } from '../engine/defaults'
import type { AtlasEntry, PlanInputs, SimulationResult, SolveResult } from '../engine/types'
import { markEntered, readEntered } from './entered'
import { parseHash, resolveRoute, type Route } from './router'
import { decodeInputs, sanitizeInputs } from './share'

export type ThemePref = 'system' | 'light' | 'dark'
export type Status = 'idle' | 'running' | 'error'

/** Shown in the verdict until the engine produces a result. */
export const PLACEHOLDER_SUCCESS = 0.87

export interface AppState {
  inputs: PlanInputs
  theme: ThemePref
  route: Route

  result: SimulationResult | null
  atlas: AtlasEntry[] | null
  /** When the current atlas ranking was computed (ms epoch). */
  atlasAt: number | null
  /** True while a city ranking is computing. */
  atlasRunning: boolean
  solve: SolveResult | null
  status: Status
  error: string | null
  /** Success rate of the same plan staying in the home city (only when a destination is set). */
  baseline: Baseline | null
  /** True while the safe-spend solver is running for the current inputs. */
  solving: boolean

  setInput: <K extends keyof PlanInputs>(key: K, value: PlanInputs[K]) => void
  patchInputs: (patch: Partial<PlanInputs>) => void
  replaceInputs: (inputs: PlanInputs) => void
  resetInputs: () => void
  setTheme: (t: ThemePref) => void
  setRoute: (r: Route) => void
  setResult: (r: SimulationResult | null) => void
  setAtlas: (a: AtlasEntry[] | null, at?: number) => void
  setAtlasRunning: (v: boolean) => void
  /** Set (or clear) the destination city. */
  setDestination: (cityId: string | null) => void
  setSolve: (s: SolveResult | null) => void
  setStatus: (s: Status, error?: string | null) => void
  setBaseline: (b: Baseline | null) => void
  setSolving: (v: boolean) => void
}

export interface Baseline {
  homeCityId: string
  /** inputsKey of the plan this baseline belongs to (the with-destination inputs). */
  key?: string
  successRate: number
}

const LS_KEY = 'evelo:v2'

interface Persisted {
  inputs?: unknown
  theme?: unknown
}

function readPersisted(): Persisted {
  try {
    const raw = window.localStorage.getItem(LS_KEY)
    return raw ? (JSON.parse(raw) as Persisted) : {}
  } catch {
    return {}
  }
}
function writePersisted(p: { inputs: PlanInputs; theme: ThemePref }) {
  try {
    window.localStorage.setItem(LS_KEY, JSON.stringify(p))
  } catch {
    /* storage blocked or full — the app works without it */
  }
}

const isTheme = (t: unknown): t is ThemePref => t === 'system' || t === 'light' || t === 'dark'

/**
 * What the bare URL means for the rest of this page load: settled at load, so pressing Back from
 * the planner to the bare entry still shows the landing the visitor started on.
 */
let bareEntered = false

/** The route for a hash during this page load (see resolveRoute for the rule). */
export function routeFromHash(hash: string): Route {
  return resolveRoute(hash, bareEntered).route
}

/** Initial state: shared link (#p=, or legacy #/?p=) wins over localStorage, which wins over defaults. */
function initial(): { inputs: PlanInputs; theme: ThemePref; route: Route; fromLink: boolean } {
  const persisted = readPersisted()
  const { params } = parseHash(window.location.hash)
  const { route, entered } = resolveRoute(window.location.hash, readEntered())
  bareEntered = entered
  if (entered) markEntered()
  const p = params.get('p')
  const shared = p ? decodeInputs(p) : null
  return {
    inputs: shared ?? (persisted.inputs ? sanitizeInputs(persisted.inputs) : structuredClone(DEFAULT_INPUTS)),
    theme: isTheme(persisted.theme) ? persisted.theme : 'system',
    route,
    fromLink: !!shared,
  }
}

const init = initial()
/** True when this session started from a shared link. */
export const OPENED_FROM_LINK = init.fromLink
// A shared plan becomes this device's plan straight away (the URL payload is then dropped).
if (init.fromLink) writePersisted({ inputs: init.inputs, theme: init.theme })

export const useStore = create<AppState>()((set) => ({
  inputs: init.inputs,
  theme: init.theme,
  route: init.route,
  result: null,
  atlas: null,
  atlasAt: null,
  atlasRunning: false,
  solve: null,
  status: 'idle',
  error: null,
  baseline: null,
  solving: false,

  setInput: (key, value) =>
    set((s) => {
      const inputs = { ...s.inputs, [key]: value }
      // A destination equal to home means staying home.
      if (inputs.destCityId && inputs.destCityId === inputs.homeCityId) inputs.destCityId = null
      return { inputs }
    }),
  patchInputs: (patch) => set((s) => ({ inputs: { ...s.inputs, ...patch } })),
  replaceInputs: (inputs) => set({ inputs }),
  resetInputs: () => set({ inputs: structuredClone(DEFAULT_INPUTS) }),
  setTheme: (theme) => set({ theme }),
  setRoute: (route) => {
    // Any navigation into the app counts as having entered it.
    if (route !== 'home') markEntered()
    set({ route })
  },
  setResult: (result) => set({ result }),
  setAtlas: (atlas, at = Date.now()) => set({ atlas, atlasAt: atlas ? at : null }),
  setAtlasRunning: (atlasRunning) => set({ atlasRunning }),
  setDestination: (cityId) =>
    set((s) => ({ inputs: { ...s.inputs, destCityId: cityId && cityId !== s.inputs.homeCityId ? cityId : null } })),
  setSolve: (solve) => set({ solve }),
  setStatus: (status, error = null) => set({ status, error }),
  setBaseline: (baseline) => set({ baseline }),
  setSolving: (solving) => set({ solving }),
}))

// Persist inputs + theme (debounced so slider drags don't thrash storage).
let t: ReturnType<typeof setTimeout> | undefined
useStore.subscribe((s, prev) => {
  if (s.inputs === prev.inputs && s.theme === prev.theme) return
  clearTimeout(t)
  t = setTimeout(() => writePersisted({ inputs: s.inputs, theme: s.theme }), 250)
})

/** Headline success rate: the engine's, or the placeholder for the instant before the first run lands. */
export const selectSuccess = (s: AppState) => s.result?.successRate ?? PLACEHOLDER_SUCCESS
