// The mode's own worker client. It spawns the same bundled worker as eVelo's sim client (the same
// hashed URL) but its own instance: eVelo's client keeps running on every route and terminates its
// worker when the plan changes, which would cancel an income run sharing it. This one lives only
// while the mode is open. One worker serves every run: a newer run supersedes the pending one (its
// promise settles as cancelled) and the older reply, when it comes, is dropped by id. The worker is
// terminated only when the mode closes or the worker fails, never per keystroke.

import { useEffect, useState } from 'react'
import type { IncomeInputs, IncomeResult, IncomeWorkerRequest, IncomeWorkerResponse } from '../../engine/incomeTypes'
import type { PlanInputs, SimulationResult, WorkerRequest, WorkerResponse } from '../../engine/types'
import WORKER_URL from '../../engine/worker.ts?worker&url'

export const INCOME_DEBOUNCE_MS = 180

type Reply = IncomeWorkerResponse | Extract<WorkerResponse, { kind: 'simulate' }> | { id: number; kind: 'error'; message: string }

/** A result with the answers it was worked out for, so nothing on screen mixes the two. */
export interface IncomeComputed {
  inputs: IncomeInputs
  result: IncomeResult
}

export type IncomeRun = { status: 'loading' } | ({ status: 'done' } & IncomeComputed) | { status: 'error'; message: string }

type Pending = { resolve: (r: never) => void; reject: (e: Error) => void }

export class IncomeClient {
  private worker: Worker | null = null
  private nextId = 1
  /** Every request in flight, by id. */
  private pending = new Map<number, Pending>()
  /** The latest request of each kind: a newer one of the same kind supersedes it. An income run
   *  and the comparison's eVelo run don't cancel each other. */
  private latest: Partial<Record<'income' | 'simulate', number>> = {}

  private spawn(): Worker {
    if (this.worker) return this.worker
    const w = new Worker(WORKER_URL, { type: 'module' })
    w.onmessage = (ev: MessageEvent<Reply>) => {
      const p = this.pending.get(ev.data.id)
      if (!p) return
      this.pending.delete(ev.data.id)
      if (ev.data.kind === 'error') p.reject(new Error(ev.data.message))
      else p.resolve(ev.data.result as never)
    }
    w.onerror = (ev) => {
      ev.preventDefault()
      for (const p of this.pending.values()) p.reject(new Error(ev.message || 'Income worker failed'))
      this.pending.clear()
      this.stop()
    }
    this.worker = w
    return w
  }

  private send<R>(kind: 'income' | 'simulate', body: IncomeWorkerRequest | Extract<WorkerRequest, { kind: 'simulate' }>): Promise<R> {
    // A request still in flight of the same kind belongs to older inputs: settle it as cancelled
    // and let its reply be dropped by id when it arrives. The worker itself stays.
    const prev = this.latest[kind]
    const old = prev === undefined ? undefined : this.pending.get(prev)
    if (old && prev !== undefined) {
      this.pending.delete(prev)
      old.reject(new Error('cancelled'))
    }
    this.latest[kind] = body.id
    // Spawning and posting inside the executor: a worker that can't be made (CSP, no module
    // workers) rejects the run, so the mode shows its error instead of waiting forever.
    return new Promise<R>((resolve, reject) => {
      try {
        const w = this.spawn()
        this.pending.set(body.id, { resolve: resolve as (r: never) => void, reject })
        w.postMessage(body)
      } catch (e) {
        this.pending.delete(body.id)
        this.stop()
        reject(e instanceof Error && e.message && e.message !== 'cancelled' ? e : new Error('Income worker failed'))
      }
    })
  }

  run(inputs: IncomeInputs): Promise<IncomeResult> {
    return this.send<IncomeResult>('income', { id: this.nextId++, kind: 'income', inputs } satisfies IncomeWorkerRequest)
  }

  /** eVelo's own run of a plan (the comparison's, when the app's cached result isn't for it). */
  simulate(inputs: PlanInputs): Promise<SimulationResult> {
    return this.send<SimulationResult>('simulate', { id: this.nextId++, kind: 'simulate', inputs })
  }

  stop() {
    this.worker?.terminate()
    this.worker = null
    for (const p of this.pending.values()) p.reject(new Error('cancelled'))
    this.pending.clear()
  }
}

/** Runs the income request on these inputs (debounced), and stops the worker when the mode closes. */
export function useIncomeRun(inputs: IncomeInputs): IncomeRun {
  const [client] = useState(() => new IncomeClient())
  const [run, setRun] = useState<IncomeRun>({ status: 'loading' })

  useEffect(() => () => client.stop(), [client])

  useEffect(() => {
    let live = true
    setRun((r) => (r.status === 'loading' ? r : { status: 'loading' }))
    const t = setTimeout(() => {
      client.run(inputs).then(
        (result) => live && setRun({ status: 'done', inputs, result }),
        (e: Error) => live && e.message !== 'cancelled' && setRun({ status: 'error', message: e.message }),
      )
    }, INCOME_DEBOUNCE_MS)
    return () => {
      live = false
      clearTimeout(t)
    }
  }, [client, inputs])

  return run
}
