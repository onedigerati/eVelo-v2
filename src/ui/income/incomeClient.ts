// The mode's own worker client. It spawns the same bundled worker as eVelo's sim client (the same
// hashed URL) but its own instance: eVelo's client keeps running on every route and terminates its
// worker when the plan changes, which would cancel an income run sharing it. This one lives only
// while the mode is open, keeps one request in flight (a newer one replaces it) and drops stale
// answers.

import { useEffect, useState } from 'react'
import type { IncomeInputs, IncomeResult, IncomeWorkerRequest, IncomeWorkerResponse } from '../../engine/incomeTypes'
import WORKER_URL from '../../engine/worker.ts?worker&url'

export const INCOME_DEBOUNCE_MS = 180

type Reply = IncomeWorkerResponse | { id: number; kind: 'error'; message: string }

export type IncomeRun = { status: 'loading' } | { status: 'done'; result: IncomeResult } | { status: 'error'; message: string }

class IncomeClient {
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
    // A run still in flight belongs to older inputs: drop the worker rather than wait for it.
    if (this.pending) this.stop()
    const w = this.spawn()
    const id = this.nextId++
    return new Promise((resolve, reject) => {
      this.pending = { id, resolve, reject }
      w.postMessage({ id, kind: 'income', inputs } satisfies IncomeWorkerRequest)
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
        (result) => live && setRun({ status: 'done', result }),
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
