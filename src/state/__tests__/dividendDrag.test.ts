// The default dividend tax drag moved 0.25% → 0.40% (≈1.7% default-portfolio yield × 23.8%). Only
// the default moves: a stored plan or a link that carries its own value keeps it.

import { describe, expect, it, vi } from 'vitest'
import { DEFAULT_INPUTS } from '../../engine/defaults'
import { parsePersisted } from '../persisted'
import { decodeInputs, encodeInputs, sanitizeInputs } from '../share'

const OLD = 0.0025
const link = (d: Record<string, unknown>) => Buffer.from(JSON.stringify({ v: 1, d })).toString('base64url')

describe('dividend tax drag default', () => {
  it('is 0.40% and the Method page reads it', async () => {
    expect(DEFAULT_INPUTS.dividendTaxDrag).toBe(0.004)
    // params.ts reaches the store (via state/sim), which reads window at load.
    vi.stubGlobal('window', { location: { hash: '' }, localStorage: { getItem: () => null } })
    try {
      const { DEF } = await import('../../ui/method/params')
      expect(DEF.dividendDrag).toBe(0.004)
    } finally {
      vi.unstubAllGlobals()
    }
  })

  it('a stored plan with 0.25% keeps 0.25%', () => {
    const raw = JSON.stringify({ inputs: { ...structuredClone(DEFAULT_INPUTS), dividendTaxDrag: OLD }, theme: 'dark', themeV: 2 })
    const saved = parsePersisted(raw)
    expect(sanitizeInputs(saved.inputs).dividendTaxDrag).toBe(OLD)
  })

  it('a link carrying 0.25% explicitly keeps 0.25%', () => {
    expect(decodeInputs(link({ dividendTaxDrag: OLD }))!.dividendTaxDrag).toBe(OLD)
  })

  it('a plan at 0.25% encodes the value, so its link round-trips', () => {
    const enc = encodeInputs({ ...structuredClone(DEFAULT_INPUTS), dividendTaxDrag: OLD })
    expect(JSON.parse(Buffer.from(enc, 'base64url').toString()).d.dividendTaxDrag).toBe(OLD)
    expect(decodeInputs(enc)!.dividendTaxDrag).toBe(OLD)
  })

  it('a link that omits the drag gets the new default', () => {
    expect(decodeInputs(link({}))!.dividendTaxDrag).toBe(0.004)
  })
})
