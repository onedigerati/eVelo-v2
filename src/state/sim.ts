// Simulation client: one Web Worker, request ids, debounced input sync, stale-response dropping.
//
// On every inputs change (debounced): simulate → (destination set) home-baseline simulate → solve,
// then the "When could you retire?" comparison: the same plan at each compared retire-in, through the
// same simulate/solve caches, so a card's figures are the main runs' results for that date.
// Lower-priority work never blocks a fresh simulate: if the worker is still busy with anything
// from an older generation when new inputs arrive, it is terminated and respawned.

import { useEffect, useMemo, useState } from 'react'
import type { AtlasEntry, PlanInputs, SimulationResult, SolveResult, WorkerRequest, WorkerResponse } from '../engine/types'
import { compareYears, withRetireIn, type CompareEntry } from './retireCompare'
import { useStore } from './store'

export const DEBOUNCE_MS = 180
export const SOLVE_TARGET = 0.9
const CACHE_MAX = 32

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

/** A plan needs at least one holding with weight before there is anything to simulate. */
export const hasHoldings = (i: PlanInputs) => i.holdings.some((h) => h.weight > 0)

/** Same plan, staying home: destination settings neutralised so the key ignores them. */
export function homeVariant(i: PlanInputs): PlanInputs {
  return { ...i, destCityId: null, moveInYears: 0, expatFactor: 0, ratioOverrides: undefined, amountOverrides: undefined }
}

class SimClient {
  private worker: Worker | null = null
  private nextId = 1
  private pending = new Map<number, Pending>()
  private gen = 0
  private simCache = new Lru<SimulationResult>()
  private solveCache = new Lru<SolveResult>()
  private compareFailed = new Set<string>()
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

  /** Cached result for these exact inputs, if the main pipeline already ran them. */
  peek(inputs: PlanInputs): SimulationResult | undefined {
    return this.simCache.get(inputsKey(inputs))
  }

  async simulate(inputs: PlanInputs): Promise<SimulationResult> {
    const k = inputsKey(inputs)
    const hit = this.simCache.get(k)
    if (hit) return hit
    const r = await this.request({ kind: 'simulate', inputs })
    this.simCache.set(k, r)
    return r
  }

  /** Cached safe-spending solve for these exact inputs, if one ran. */
  peekSolve(inputs: PlanInputs, target = SOLVE_TARGET): SolveResult | undefined {
    return this.solveCache.get(solveKey(inputs, target))
  }

  /** The comparison cards' figures for these plans, from whatever the caches hold now. */
  compareEntries(plans: PlanInputs[]): Record<string, CompareEntry> {
    const out: Record<string, CompareEntry> = {}
    for (const p of plans) {
      const k = inputsKey(p)
      out[k] = {
        successRate: this.peek(p)?.successRate ?? null,
        maxSpend: this.peekSolve(p)?.maxSpendHome ?? null,
        ...(this.compareFailed.has(k) && { failed: true }),
      }
    }
    return out
  }

  async solve(inputs: PlanInputs, target = SOLVE_TARGET): Promise<SolveResult> {
    const k = solveKey(inputs, target)
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
    // The plan at each compared retire-in (the plan's own date is `inputs` itself).
    const plans = compareYears(inputs).map((y) => withRetireIn(inputs, y))
    const publish = () => live() && st.setCompare(this.compareEntries(plans))
    if (!hasHoldings(inputs)) {
      st.setCompare({})
      // Nothing to simulate: the UI shows an "add a holding" prompt instead of a verdict.
      st.setResult(null)
      st.setBaseline(null)
      st.setSolve(null)
      st.setSolving(false)
      st.setStatus('idle')
      return
    }
    st.setStatus('running')
    st.setSolving(true)
    publish()
    try {
      const result = await this.simulate(inputs)
      if (!live()) return
      st.setResult(result)
      st.setStatus('idle')
      publish()

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
      publish()

      await this.runCompare(inputs, plans, live, publish)
    } catch (e) {
      if (e instanceof Cancelled || !live()) return
      st.setStatus('error', e instanceof Error ? e.message : String(e))
      st.setSolving(false)
    }
  }

  /**
   * After the main runs: each compared plan's simulate (odds first, so every card's number lands
   * soon), then each solve, then (with a destination) each stay-home baseline, so tapping a card
   * finds all three of the main pipeline's runs cached. Lowest priority: new inputs cancel it.
   */
  private async runCompare(inputs: PlanInputs, plans: PlanInputs[], live: () => boolean, publish: () => void) {
    try {
      for (const p of plans) {
        if (this.peek(p)) continue
        await this.simulate(p)
        if (!live()) return
        publish()
      }
      for (const p of plans) {
        if (this.peekSolve(p)) continue
        await this.solve(p)
        if (!live()) return
        publish()
      }
      if (inputs.destCityId) {
        for (const p of plans) {
          await this.simulate(homeVariant(p))
          if (!live()) return
        }
      }
    } catch (e) {
      if (e instanceof Cancelled || !live()) return
      // The main verdict stands; only the cards still computing say they couldn't.
      for (const p of plans) {
        const k = inputsKey(p)
        if (!this.peek(p) || !this.peekSolve(p)) this.compareFailed.add(k)
      }
      publish()
      for (const p of plans) this.compareFailed.delete(inputsKey(p))
    }
  }
}

const solveKey = (inputs: PlanInputs, target: number) => `${target}|${inputsKey(inputs)}`

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

/**
 * One-off destination runs for the profile sheet: the plan with a given city as the destination,
 * plus the same plan staying home (for the estate comparison). Own worker, so it never queues
 * behind or cancels the main pipeline or the Atlas ranking. Only the latest request matters: a new
 * one, or cancel(), terminates whatever is in flight.
 */
class DestinationClient {
  private worker: Worker | null = null
  private cache = new Lru<SimulationResult>()
  private pending = new Map<number, Pending>()
  private nextId = 1
  private users = 0
  private idle: ReturnType<typeof setTimeout> | undefined

  /** Cached here, or already run by the main pipeline (its home baseline, or this destination when
   *  it is the plan's). A plan with no destination is the same run as its home variant. */
  peek(inputs: PlanInputs): SimulationResult | undefined {
    const hit = this.cache.get(inputsKey(inputs)) ?? sim.peek(inputs)
    if (hit || inputs.destCityId) return hit
    const st = useStore.getState().inputs
    return !st.destCityId && inputsKey(homeVariant(st)) === inputsKey(inputs) ? sim.peek(st) : undefined
  }

  cancel() {
    if (!this.worker || this.pending.size === 0) return
    this.worker.terminate()
    this.worker = null
    for (const p of this.pending.values()) p.reject(new Cancelled())
    this.pending.clear()
  }

  /** A profile sheet is showing; the worker may stay up while it is. */
  acquire() {
    this.users++
    clearTimeout(this.idle)
  }

  /** The profile sheet closed: drop the worker once nothing uses it. */
  release() {
    this.users = Math.max(0, this.users - 1)
    if (this.users === 0) this.shutdown()
  }

  private shutdown() {
    clearTimeout(this.idle)
    this.cancel()
    this.worker?.terminate()
    this.worker = null
  }

  /** Terminate the worker after a quiet spell even while a sheet stays open. */
  private touch() {
    clearTimeout(this.idle)
    this.idle = setTimeout(() => this.pending.size === 0 && this.shutdown(), DEST_IDLE_MS)
  }

  private spawn(): Worker {
    if (this.worker) return this.worker
    const w = new Worker(new URL('../engine/worker.ts', import.meta.url), { type: 'module' })
    w.onmessage = (ev: MessageEvent<WorkerResponse>) => {
      const res = ev.data
      const p = this.pending.get(res.id)
      if (!p) return
      this.pending.delete(res.id)
      if (res.kind === 'simulate') p.resolve(res.result)
      else p.reject(new Error(res.kind === 'error' ? res.message : 'Unexpected response'))
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

  async simulate(inputs: PlanInputs): Promise<SimulationResult> {
    const hit = this.peek(inputs)
    if (hit) return hit
    const w = this.spawn()
    const id = this.nextId++
    clearTimeout(this.idle)
    try {
      const r = await new Promise<SimulationResult>((resolve, reject) => {
        this.pending.set(id, { resolve: resolve as (v: unknown) => void, reject })
        w.postMessage({ id, kind: 'simulate', inputs } as WorkerRequest)
      })
      this.cache.set(inputsKey(inputs), r)
      return r
    } finally {
      if (this.worker) this.touch()
    }
  }

  /** For tests and checks: whether a destination worker is alive. */
  get alive() {
    return this.worker != null
  }
}

export const destinationClient = new DestinationClient()

/** Delay before a profile's run starts, so flicking through profiles doesn't start a run per open. */
export const DEST_DEBOUNCE_MS = 220
/** The destination worker is terminated after this long with nothing to do. */
const DEST_IDLE_MS = 30_000

export type DestinationSim =
  | { status: 'loading' }
  | { status: 'empty' }
  | { status: 'error'; message: string }
  | { status: 'ready'; dest: SimulationResult; home: SimulationResult }

/**
 * The plan with `cityId` as the destination, and staying home, for the profile sheet. Debounced on
 * open; closing the profile or changing the plan cancels the run in flight. Results are cached.
 */
export function useDestinationSim(inputs: PlanInputs, cityId: string | null): DestinationSim {
  const pair = useMemo(() => (cityId ? { dest: { ...inputs, destCityId: cityId }, home: homeVariant(inputs) } : null), [inputs, cityId])
  const key = pair ? inputsKey(pair.dest) : ''
  const [done, setDone] = useState<{ key: string; sim: DestinationSim } | null>(null)
  const cached = useMemo(() => {
    if (!pair) return null
    const dest = destinationClient.peek(pair.dest)
    const home = destinationClient.peek(pair.home)
    return dest && home ? ({ status: 'ready', dest, home } as const) : null
  }, [pair])

  useEffect(() => {
    destinationClient.acquire()
    return () => destinationClient.release()
  }, [])

  useEffect(() => {
    if (!pair || cached || !hasHoldings(pair.dest)) return
    let alive = true
    const t = setTimeout(() => {
      Promise.all([destinationClient.simulate(pair.dest), destinationClient.simulate(pair.home)]).then(
        ([dest, home]) => alive && setDone({ key, sim: { status: 'ready', dest, home } }),
        (e) => alive && !isCancelled(e) && setDone({ key, sim: { status: 'error', message: e instanceof Error ? e.message : String(e) } }),
      )
    }, DEST_DEBOUNCE_MS)
    return () => {
      alive = false
      clearTimeout(t)
      destinationClient.cancel()
    }
  }, [pair, cached, key])

  if (!pair || !hasHoldings(pair.dest)) return { status: 'empty' }
  if (cached) return cached
  return done?.key === key ? done.sim : { status: 'loading' }
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
