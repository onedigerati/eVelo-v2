// The mode's own worker client. It spawns the same bundled worker as eVelo's sim client (the same
// hashed URL) but its own instance: eVelo's client keeps running on every route and terminates its
// worker when the plan changes, which would cancel an income run sharing it. This one lives only
// while the mode is open. One worker serves every run: a newer run supersedes the pending one (its
// promise settles as cancelled) and the older reply, when it comes, is dropped by id. The worker is
// terminated only when the mode closes or the worker fails, never per keystroke.

import { useEffect, useState } from 'react'
import type { IncomeInputs, IncomeResult, IncomeWorkerRequest, IncomeWorkerResponse } from '../../engine/incomeTypes'
import WORKER_URL from '../../engine/worker.ts?worker&url'

export const INCOME_DEBOUNCE_MS = 180

type Reply = IncomeWorkerResponse | { id: number; kind: 'error'; message: string }

/** A result with the answers it was worked out for, so nothing on screen mixes the two. */
export interface IncomeComputed {
  inputs: IncomeInputs
  result: IncomeResult
}

export type IncomeRun = { status: 'loading' } | ({ status: 'done' } & IncomeComputed) | { status: 'error'; message: string }

export class IncomeClient {
  private worker: Worker | null = null
  private nextId = 1
  private pending: { id: number; resolve: (r: IncomeResult) => void; reject: (e: Error) => void } | null = null

  private spawn(): Worker {
    if (this.worker) return this.worker
    const w = new Worker(WORKER_URL, { type: 'module' })
    w.onmessage = (ev: MessageEvent<Reply>) => {
      const p = this.pending
      if (!p || ev.data.id !== p.id) return
      this.pending = null
      if (ev.data.kind === 'error') p.reject(new Error(ev.data.message))
      else p.resolve(ev.data.result)
    }
    w.onerror = (ev) => {
      ev.preventDefault()
      this.pending?.reject(new Error(ev.message || 'Income worker failed'))
      this.pending = null
      this.stop()
    }
    this.worker = w
    return w
  }

  run(inputs: IncomeInputs): Promise<IncomeResult> {
    // A run still in flight belongs to older inputs: settle it as cancelled and let its reply be
    // dropped by id when it arrives. The worker itself stays.
    if (this.pending) {
      this.pending.reject(new Error('cancelled'))
      this.pending = null
    }
    const id = this.nextId++
    // Spawning and posting inside the executor: a worker that can't be made (CSP, no module
    // workers) rejects the run, so the mode shows its error instead of waiting forever.
    return new Promise((resolve, reject) => {
      try {
        const w = this.spawn()
        this.pending = { id, resolve, reject }
        w.postMessage({ id, kind: 'income', inputs } satisfies IncomeWorkerRequest)
      } catch (e) {
        this.pending = null
        this.stop()
        reject(e instanceof Error && e.message && e.message !== 'cancelled' ? e : new Error('Income worker failed'))
      }
    })
  }

  stop() {
    this.worker?.terminate()
    this.worker = null
    if (this.pending) this.pending.reject(new Error('cancelled'))
    this.pending = null
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
