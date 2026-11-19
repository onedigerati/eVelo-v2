// The income client rejects a run when its worker can't be made (CSP, no module workers), so the
// mode shows its error instead of spinning on "Working it out".

import { afterEach, describe, expect, it, vi } from 'vitest'
import type { IncomeInputs } from '../../../engine/incomeTypes'
import { IncomeClient } from '../incomeClient'

afterEach(() => vi.unstubAllGlobals())

describe('IncomeClient', () => {
  it('rejects the run when the worker throws on construction', async () => {
    vi.stubGlobal(
      'Worker',
      class {
        constructor() {
          throw new Error('Module workers are not supported')
        }
      },
    )
    const client = new IncomeClient()
    await expect(client.run({} as IncomeInputs)).rejects.toThrow('Module workers are not supported')
    // A later run tries again and rejects the same way, rather than hanging.
    await expect(client.run({} as IncomeInputs)).rejects.toThrow('Module workers are not supported')
  })

  it('rejects with a generic message when the throw carries none', async () => {
    vi.stubGlobal(
      'Worker',
      class {
        constructor() {
          throw 'blocked'
        }
      },
    )
    await expect(new IncomeClient().run({} as IncomeInputs)).rejects.toThrow('Income worker failed')
  })

  it("a second run while one is pending doesn't spawn a new worker, and the stale reply is dropped", async () => {
    const made: FakeWorker[] = []
    class FakeWorker {
      onmessage: ((ev: { data: unknown }) => void) | null = null
      onerror: unknown = null
      posted: { id: number }[] = []
      terminated = 0
      constructor() {
        made.push(this)
      }
      postMessage(m: { id: number }) {
        this.posted.push(m)
      }
      terminate() {
        this.terminated++
      }
    }
    vi.stubGlobal('Worker', FakeWorker)
    const client = new IncomeClient()
    const first = client.run({} as IncomeInputs)
    const second = client.run({} as IncomeInputs)
    await expect(first).rejects.toThrow('cancelled')
    expect(made).toHaveLength(1)
    const w = made[0]
    expect(w.terminated).toBe(0)
    expect(w.posted.map((m) => m.id)).toEqual([1, 2])
    // The first run's reply arrives late and is ignored; the second's resolves the run.
    const settled = vi.fn()
    second.then(settled, settled)
    w.onmessage!({ data: { id: 1, kind: 'income', result: { tag: 'stale' } } })
    await Promise.resolve()
    expect(settled).not.toHaveBeenCalled()
    w.onmessage!({ data: { id: 2, kind: 'income', result: { tag: 'fresh' } } })
    await expect(second).resolves.toEqual({ tag: 'fresh' })
    // Leaving the mode is what terminates it.
    client.stop()
    expect(w.terminated).toBe(1)
  })
})
