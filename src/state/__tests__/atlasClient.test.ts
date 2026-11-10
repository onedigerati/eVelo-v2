// The Atlas client splits a ranking across workers and merges it into the single-run order;
// the same request joins the one in flight, a newer one cancels it, a worker or engine error
// rejects, and the latest ranking is saved in (and read back from) browser storage.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_INPUTS } from '../../engine/defaults'
import type { AtlasEntry, PlanInputs, WorkerRequest } from '../../engine/types'

vi.mock('../store', () => {
  const st = { inputs: null, setAtlas() {}, setAtlasRunning() {} }
  return { useStore: Object.assign(() => undefined, { getState: () => st, subscribe: () => () => {} }) }
})

/** Deterministic stub rates per city, so the merged order is known. */
const rate = (id: string) => (id.charCodeAt(0) % 7) / 10
const stub = (cityId: string): AtlasEntry => ({ cityId, successRate: rate(cityId), spendUsd: cityId.length, costRatio: 1 })
const posted: { w: FakeWorker; req: WorkerRequest }[] = []
let auto = true
class FakeWorker {
  terminated = false
  onmessage: ((ev: { data: unknown }) => void) | null = null
  onerror: ((ev: { message: string; preventDefault(): void }) => void) | null = null
  onmessageerror: (() => void) | null = null
  postMessage(req: WorkerRequest) {
    posted.push({ w: this, req: structuredClone(req) })
    if (auto) queueMicrotask(() => this.answer(req))
  }
  answer(req: WorkerRequest) {
    if (req.kind !== 'atlas') return
    this.onmessage?.({ data: { id: req.id, kind: 'atlas', result: req.cityIds.map(stub) } })
  }
  terminate() {
    this.terminated = true
  }
}

const { AtlasClient, atlasClient, atlasWorkerCount } = await import('../sim')
const { compareAtlas } = await import('../../engine/atlas')

const IDS = ['lisbon', 'bangkok', 'zurich', 'porto', 'tbilisi', 'medellin', 'valencia', 'hanoi']
const SINGLE = IDS.map(stub).sort(compareAtlas)
const plan = (seed: number): PlanInputs => ({ ...structuredClone(DEFAULT_INPUTS), seed })
/** Answer every post from `from` on whose worker is still alive (answers queue the next chunks). */
const pump = (from: number) => {
  for (let i = from; i < posted.length; i++) if (!posted[i].w.terminated) posted[i].w.answer(posted[i].req)
}
// 8 cities over 4 workers: chunks of 1, so 8 chunk requests, two queued on each worker.
const CHUNKS = 8

beforeEach(() => {
  vi.stubGlobal('Worker', FakeWorker)
  // 5 cores → 4 shards, whatever machine runs the test.
  vi.stubGlobal('navigator', { hardwareConcurrency: 5 })
  posted.length = 0
  auto = true
})
afterEach(() => vi.unstubAllGlobals())

describe('atlas worker count', () => {
  it('is cores − 1, at most 6, at least 1', () => {
    expect([1, 2, 3, 4, 5, 6, 7, 12, 64].map((c) => atlasWorkerCount(c))).toEqual([1, 1, 2, 3, 4, 5, 6, 6, 6])
    expect(atlasWorkerCount(0)).toBe(1)
    expect(atlasWorkerCount(NaN)).toBe(1)
    expect(atlasWorkerCount()).toBe(4) // from the stubbed navigator
  })
})

describe('AtlasClient', () => {
  it('queues chunks over 4 workers and merges into the single-run order', async () => {
    const { entries } = await atlasClient.rank(plan(1), IDS)
    // every chunk once, plus at most one spare copy each
    const sent = posted.flatMap((p) => (p.req.kind === 'atlas' ? p.req.cityIds : []))
    expect(sent.slice(0, CHUNKS)).toEqual(IDS)
    expect(posted.length).toBeLessThanOrEqual(2 * CHUNKS)
    expect(new Set(posted.map((p) => p.w)).size).toBe(4)
    expect(entries).toEqual(SINGLE)
    // cached: no new posts, and peek sees it
    const n = posted.length
    await atlasClient.rank(plan(1), IDS)
    expect(posted.length).toBe(n)
    expect(atlasClient.peek(plan(1), IDS)?.entries).toEqual(SINGLE)
  })

  it('a free worker re-runs the slow ones: a slow worker never holds the ranking', async () => {
    auto = false
    const r = atlasClient.rank(plan(15), IDS)
    // two chunks queued on each worker up front
    expect(posted.length).toBe(CHUNKS)
    expect(new Set(posted.map((p) => p.w)).size).toBe(4)
    const fast = posted[0].w
    // only the fast worker ever answers: once its own two are done it re-runs, one at a time, the
    // six chunks the slow workers still hold, and the ranking completes without them
    for (let i = 0; i < posted.length; i++) if (posted[i].w === fast) fast.answer(posted[i].req)
    expect((await r).entries).toEqual(SINGLE)
    expect(posted.filter((p) => p.w === fast).length).toBe(CHUNKS)
    expect(posted.length).toBe(CHUNKS + 6)
    // the slow workers' late answers change nothing
    for (const p of posted) if (p.w !== fast) p.w.answer(p.req)
    expect(atlasClient.peek(plan(15), IDS)?.entries).toEqual(SINGLE)
  })

  it('the same request joins the one in flight; a newer one cancels it', async () => {
    auto = false
    const a = atlasClient.rank(plan(2), IDS)
    expect(atlasClient.rank(plan(2), IDS)).toBe(a)
    expect(posted.length).toBe(CHUNKS)
    expect(atlasClient.running(plan(2), IDS)).toBe(true)
    const b = atlasClient.rank(plan(3), IDS)
    await expect(a).rejects.toThrow('cancelled')
    expect(posted.slice(0, CHUNKS).every((p) => p.w.terminated)).toBe(true)
    pump(CHUNKS)
    expect((await b).entries).toEqual(SINGLE)
    expect(atlasClient.peek(plan(2), IDS)).toBeNull()
  })

  it('a partly answered request cancelled by a newer one rejects, and late answers are ignored', async () => {
    auto = false
    const a = atlasClient.rank(plan(5), IDS)
    posted[0].w.answer(posted[0].req) // one chunk done (its worker still has one queued)
    const old = posted.slice()
    expect(old.length).toBe(CHUNKS)
    const b = atlasClient.rank(plan(6), IDS)
    await expect(a).rejects.toThrow('cancelled')
    expect(old.every((p) => p.w.terminated)).toBe(true)
    // the terminated workers answer late: nothing is published or queued for the old plan
    for (const p of old.slice(1)) p.w.answer(p.req)
    expect(posted.length).toBe(old.length + CHUNKS)
    expect(atlasClient.peek(plan(5), IDS)).toBeNull()
    expect(atlasClient.running(plan(6), IDS)).toBe(true)
    pump(old.length)
    expect((await b).entries).toEqual(SINGLE)
  })

  it('a worker error rejects, and the next request still runs', async () => {
    auto = false
    const r = atlasClient.rank(plan(4), IDS)
    posted[0].w.onerror?.({ message: 'boom', preventDefault() {} })
    await expect(r).rejects.toThrow('boom')
    expect(atlasClient.running(plan(4), IDS)).toBe(false)
    auto = true
    expect((await atlasClient.rank(plan(4), IDS)).entries).toEqual(SINGLE)
  })

  it('an unreadable reply (messageerror) rejects instead of hanging', async () => {
    auto = false
    const r = atlasClient.rank(plan(16), IDS)
    posted[2].w.onmessageerror?.()
    await expect(r).rejects.toThrow('could not be read')
    expect(atlasClient.running(plan(16), IDS)).toBe(false)
  })

  it("an engine error reply rejects", async () => {
    auto = false
    const r = atlasClient.rank(plan(7), IDS)
    const p = posted[1]
    p.w.onmessage?.({ data: { id: p.req.id, kind: 'error', message: 'engine failed' } })
    await expect(r).rejects.toThrow('engine failed')
    expect(atlasClient.running(plan(7), IDS)).toBe(false)
    expect(atlasClient.peek(plan(7), IDS)).toBeNull()
  })

  it('a synchronous postMessage throw rejects and leaves nothing in flight', async () => {
    const c = new AtlasClient(null)
    vi.stubGlobal(
      'Worker',
      class extends FakeWorker {
        postMessage(): void {
          throw new Error('DataCloneError')
        }
      },
    )
    await expect(c.rank(plan(8), IDS)).rejects.toThrow('DataCloneError')
    expect(c.running(plan(8), IDS)).toBe(false)
    vi.stubGlobal('Worker', FakeWorker)
    expect((await c.rank(plan(8), IDS)).entries).toEqual(SINGLE)
  })

  it('no cities: answers at once, posts nothing, is never running', async () => {
    const c = new AtlasClient(null)
    const r = c.rank(plan(9), [])
    expect(c.running(plan(9), [])).toBe(false)
    expect((await r).entries).toEqual([])
    expect(posted.length).toBe(0)
  })
})

describe('saved ranking', () => {
  const V = 'https://example.test/assets/worker-AbC123.js'
  const memStorage = () => {
    const m = new Map<string, string>()
    return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), m }
  }

  it('a fresh client reads the saved ranking back without posting; a changed plan does not', async () => {
    const s = memStorage()
    await new AtlasClient(V, () => s).rank(plan(10), IDS)
    expect(s.m.get('evelo:atlas')).toBeTruthy()
    const n = posted.length
    const fresh = new AtlasClient(V, () => s)
    expect(fresh.peek(plan(10), IDS)?.entries).toEqual(SINGLE)
    expect((await fresh.rank(plan(10), IDS)).entries).toEqual(SINGLE)
    expect(posted.length).toBe(n)
    expect(fresh.peek(plan(11), IDS)).toBeNull()
    expect(fresh.peek({ ...plan(10), retireInYears: 4 }, IDS)).toBeNull()
    // another data version never reads it
    expect(new AtlasClient('https://example.test/assets/worker-Other.js', () => s).peek(plan(10), IDS)).toBeNull()
  })

  it('a corrupt stored value is ignored and the ranking runs', async () => {
    const s = memStorage()
    s.m.set('evelo:atlas', '{corrupt')
    const c = new AtlasClient(V, () => s)
    expect(c.peek(plan(12), IDS)).toBeNull()
    const n = posted.length
    expect((await c.rank(plan(12), IDS)).entries).toEqual(SINGLE)
    expect(posted.length).toBeGreaterThanOrEqual(n + CHUNKS)
  })

  it('storage that throws on read or write: still ranks and caches', async () => {
    const throwing = [
      { getItem: () => { throw new Error('SecurityError') }, setItem: () => {} },
      { getItem: () => null, setItem: () => { throw new Error('QuotaExceededError') } },
    ]
    for (const st of throwing) {
      const c = new AtlasClient(V, () => st)
      expect(c.peek(plan(13), IDS)).toBeNull()
      expect((await c.rank(plan(13), IDS)).entries).toEqual(SINGLE)
      const n = posted.length
      expect(c.peek(plan(13), IDS)?.entries).toEqual(SINGLE)
      await c.rank(plan(13), IDS)
      expect(posted.length).toBe(n)
    }
    // storage itself unavailable (accessor throws)
    const c = new AtlasClient(V, () => { throw new Error('blocked') })
    expect((await c.rank(plan(14), IDS)).entries).toEqual(SINGLE)
    expect(c.peek(plan(14), IDS)).not.toBeNull()
  })
})
