/// <reference lib="webworker" />
// Simulation Web Worker. Usage from the UI:
//   new Worker(new URL('./engine/worker.ts', import.meta.url), { type: 'module' })
import marketJson from '../data/market.json'
import { CITIES } from '../data/cities'
import { runAtlas, type ScenarioMemo } from './atlas'
import { simulate } from './simulate'
import { solveSpending } from './solve'
import type { MarketData, WorkerRequest, WorkerResponse } from './types'

const market = marketJson as unknown as MarketData
const ctx = self as unknown as DedicatedWorkerGlobalScope

// A ranking arrives here as several chunks of the same plan: keep its scenarios between chunks
// (~17 MB at 4000 paths × 30 years), and drop them once the worker has been quiet for a while.
const atlasMemo: ScenarioMemo = { current: null }
let memoTimer: ReturnType<typeof setTimeout> | undefined
const MEMO_IDLE_MS = 3000

ctx.onmessage = (ev: MessageEvent<WorkerRequest>) => {
  const req = ev.data
  let res: WorkerResponse
  try {
    switch (req.kind) {
      case 'simulate':
        res = { id: req.id, kind: 'simulate', result: simulate(market, CITIES, req.inputs) }
        break
      case 'atlas':
        res = { id: req.id, kind: 'atlas', result: runAtlas(market, CITIES, req.inputs, req.cityIds, atlasMemo) }
        clearTimeout(memoTimer)
        memoTimer = setTimeout(() => (atlasMemo.current = null), MEMO_IDLE_MS)
        break
      case 'solve':
        res = { id: req.id, kind: 'solve', result: solveSpending(market, CITIES, req.inputs, req.target) }
        break
      default:
        throw new Error(`Unknown request ${(req as { kind: string }).kind}`)
    }
  } catch (e) {
    res = { id: req.id, kind: 'error', message: e instanceof Error ? e.message : String(e) }
  }
  ctx.postMessage(res)
}
