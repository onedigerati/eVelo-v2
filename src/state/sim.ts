// Simulation client: one Web Worker, request ids, debounced input sync, stale-response dropping.
//
// On every inputs change (debounced): simulate → (destination set) home-baseline simulate → solve.
// Lower-priority work never blocks a fresh simulate: if the worker is still busy with anything
// from an older generation when new inputs arrive, it is terminated and respawned.

import { useEffect } from 'react'
import type { AtlasEntry, PlanInputs, SimulationResult, SolveResult, WorkerRequest, WorkerResponse } from '../engine/types'
import { useStore } from './store'

export const DEBOUNCE_MS = 180
export const SOLVE_TARGET = 0.9
const CACHE_MAX = 24

type Kind = WorkerRequest['kind']
type ResultOf<K extends Kind> = K extends 'simulate' ? SimulationResult : K extends 'solve' ? SolveResult : AtlasEntry[]
type Body = { kind: 'simulate'; inputs: PlanInputs } | { kind: 'solve'; inputs: PlanInputs; target: number } | { kind: 'atlas'; inputs: PlanInputs; cityIds: string[] }

interface Pending {
  resolve: (v: unknown) => void
  reject: (e: Error) => void
}

class Cancelled extends Error {
  constructor() {
    super('cancelled')
  }
}

/** Small insertion-ordered LRU. */
class Lru<V> {
  private m = new Map<string, V>()
  get(k: string): V | undefined {
    const v = this.m.get(k)
    if (v !== undefined) {
      this.m.delete(k)
      this.m.set(k, v)
    }
    return v
  }
  set(k: string, v: V) {
    this.m.delete(k)
    this.m.set(k, v)
    if (this.m.size > CACHE_MAX) this.m.delete(this.m.keys().next().value as string)
  }
}

export const inputsKey = (i: PlanInputs) => JSON.stringify(i)

/** Same plan, staying home: destination settings neutralised so the key ignores them. */
export function homeVariant(i: PlanInputs): PlanInputs {
  return { ...i, destCityId: null, moveInYears: 0, expatFactor: 0, ratioOverrides: undefined }
}

class SimClient {
  private worker: Worker | null = null
  private nextId = 1
  private pending = new Map<number, Pending>()
  private gen = 0
  private simCache = new Lru<SimulationResult>()
  private solveCache = new Lru<SolveResult>()
  private timer: ReturnType<typeof setTimeout> | undefined

  private spawn(): Worker {
    if (this.worker) return this.worker
    const w = new Worker(new URL('../engine/worker.ts', import.meta.url), { type: 'module' })
    w.onmessage = (ev: MessageEvent<WorkerResponse>) => {
      const res = ev.data
      const p = this.pending.get(res.id)
      if (!p) return // stale: its worker generation was cancelled
      this.pending.delete(res.id)
      if (res.kind === 'error') p.reject(new Error(res.message))
      else p.resolve(res.result)
    }
    w.onerror = (ev) => {
      ev.preventDefault()
      const err = new Error(ev.message || 'Simulation worker failed')
      for (const p of this.pending.values()) p.reject(err)
      this.pending.clear()
      this.worker?.terminate()
      this.worker = null
    }
    this.worker = w
    return w
  }

  /** Kill in-flight work (used when it belongs to stale inputs). */
  private cancelAll() {
    if (!this.worker || this.pending.size === 0) return
    this.worker.terminate()
    this.worker = null
    for (const p of this.pending.values()) p.reject(new Cancelled())
    this.pending.clear()
  }

  request<K extends Kind>(body: Body & { kind: K }): Promise<ResultOf<K>> {
    const w = this.spawn()
    const id = this.nextId++
    return new Promise<ResultOf<K>>((resolve, reject) => {
      this.pending.set(id, { resolve: resolve as (v: unknown) => void, reject })
      w.postMessage({ id, ...body } as WorkerRequest)
    })
  }

  async simulate(inputs: PlanInputs): Promise<SimulationResult> {
    const k = inputsKey(inputs)
    const hit = this.simCache.get(k)
    if (hit) return hit
    const r = await this.request({ kind: 'simulate', inputs })
    this.simCache.set(k, r)
    return r
  }

  async solve(inputs: PlanInputs, target = SOLVE_TARGET): Promise<SolveResult> {
    const k = `${target}|${inputsKey(inputs)}`
    const hit = this.solveCache.get(k)
    if (hit) return hit
    const r = await this.request({ kind: 'solve', inputs, target })
    this.solveCache.set(k, r)
    return r
  }

  /** Debounced entry point for input changes. */
  schedule(immediate = false) {
    clearTimeout(this.timer)
    if (immediate) void this.run()
    else this.timer = setTimeout(() => void this.run(), DEBOUNCE_MS)
  }

  private async run() {
    const gen = ++this.gen
    this.cancelAll()
    const st = useStore.getState()
    const inputs = st.inputs
    const live = () => gen === this.gen
    st.setStatus('running')
    st.setSolving(true)
    try {
      const result = await this.simulate(inputs)
      if (!live()) return
      st.setResult(result)
      st.setStatus('idle')

      if (inputs.destCityId) {
        const home = await this.simulate(homeVariant(inputs))
        if (!live()) return
        st.setBaseline({ homeCityId: inputs.homeCityId, successRate: home.successRate, key: inputsKey(inputs) })
      } else {
        st.setBaseline(null)
      }

      const solve = await this.solve(inputs)
      if (!live()) return
      st.setSolve(solve)
      st.setSolving(false)
    } catch (e) {
      if (e instanceof Cancelled || !live()) return
      st.setStatus('error', e instanceof Error ? e.message : String(e))
      st.setSolving(false)
    }
  }
}

export const sim = new SimClient()

/** Cache key for a city ranking: the destination itself doesn't change any city's odds. */
export const atlasKey = (i: PlanInputs, cityIds: string[]) => `${cityIds.join(',')}|${inputsKey({ ...i, destCityId: null })}`

export const isCancelled = (e: unknown) => e instanceof Cancelled

/**
 * City rankings run on their own worker so they never queue behind (or get cancelled by) the
 * main simulate → solve pipeline. A request for new inputs supersedes one in flight.
 */
class AtlasClient {
  private worker: Worker | null = null
  private cache = new Lru<{ entries: AtlasEntry[]; at: number }>()
  private inflight: { key: string; promise: Promise<{ entries: AtlasEntry[]; at: number }>; reject: (e: Error) => void } | null = null
  private nextId = 1

  /** Cached ranking for these inputs, if any. */
  peek(inputs: PlanInputs, cityIds: string[]) {
    return this.cache.get(atlasKey(inputs, cityIds)) ?? null
  }

  rank(inputs: PlanInputs, cityIds: string[]): Promise<{ entries: AtlasEntry[]; at: number }> {
    const key = atlasKey(inputs, cityIds)
    const hit = this.cache.get(key)
    if (hit) return Promise.resolve(hit)
    if (this.inflight?.key === key) return this.inflight.promise
    if (this.inflight) {
      this.inflight.reject(new Cancelled())
      this.inflight = null
      this.worker?.terminate()
      this.worker = null
    }
    const w = (this.worker ??= new Worker(new URL('../engine/worker.ts', import.meta.url), { type: 'module' }))
    const id = this.nextId++
    let reject!: (e: Error) => void
    const promise = new Promise<{ entries: AtlasEntry[]; at: number }>((res, rej) => {
      reject = rej
      w.onmessage = (ev: MessageEvent<WorkerResponse>) => {
        const r = ev.data
        if (r.id !== id) return
        if (this.inflight?.key === key) this.inflight = null
        if (r.kind === 'atlas') {
          const v = { entries: r.result, at: Date.now() }
          this.cache.set(key, v)
          res(v)
        } else rej(new Error(r.kind === 'error' ? r.message : 'Unexpected atlas response'))
      }
      w.onerror = (ev) => {
        ev.preventDefault()
        if (this.inflight?.key === key) this.inflight = null
        this.worker?.terminate()
        this.worker = null
        rej(new Error(ev.message || 'Atlas worker failed'))
      }
      w.postMessage({ id, kind: 'atlas', inputs, cityIds } as WorkerRequest)
    })
    this.inflight = { key, promise, reject }
    return promise
  }
}

export const atlasClient = new AtlasClient()

/** Rank cities at the current lifestyle. Fills store.atlas (+ atlasAt / atlasRunning). */
export async function runAtlas(cityIds: string[]): Promise<AtlasEntry[]> {
  const st = useStore.getState()
  const inputs = st.inputs
  const key = atlasKey(inputs, cityIds)
  st.setAtlasRunning(true)
  try {
    const { entries, at } = await atlasClient.rank(inputs, cityIds)
    // Only publish if inputs haven't moved on to a different ranking meanwhile.
    if (atlasKey(useStore.getState().inputs, cityIds) === key) {
      useStore.getState().setAtlas(entries, at)
      useStore.getState().setAtlasRunning(false)
    }
    return entries
  } catch (e) {
    if (!isCancelled(e)) useStore.getState().setAtlasRunning(false)
    throw e
  }
}

/** Mount once (App): runs the engine now and on every inputs change. */
export function useSimulationSync() {
  useEffect(() => {
    sim.schedule(true)
    return useStore.subscribe((s, prev) => {
      if (s.inputs !== prev.inputs) sim.schedule()
    })
  }, [])
}
