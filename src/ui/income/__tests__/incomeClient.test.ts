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
})
