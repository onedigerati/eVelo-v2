// The saved Atlas ranking: keyed by a hash of the ranking key + data version, strictly validated.
// A changed plan, a changed data version or a corrupt value never yields a saved ranking.

import { describe, expect, it, vi } from 'vitest'
import { DEFAULT_INPUTS } from '../../engine/defaults'
import type { AtlasEntry, PlanInputs } from '../../engine/types'
import { decodeSaved, encodeSaved, savedHash } from '../atlasSaved'

vi.mock('../store', () => ({ useStore: Object.assign(() => undefined, { getState: () => ({}), subscribe: () => () => {} }) }))
const { atlasKey } = await import('../sim')

const IDS = ['lisbon', 'bangkok', 'zurich']
const known = (id: string) => IDS.includes(id)
const V = 'https://example.test/assets/worker-AbC123.js'
const entries: AtlasEntry[] = [
  { cityId: 'bangkok', successRate: 0.93, spendUsd: 41_000, costRatio: 0.41 },
  { cityId: 'lisbon', successRate: 0.88, spendUsd: 62_000, costRatio: 0.62 },
  { cityId: 'zurich', successRate: 0.4, spendUsd: 180_000, costRatio: 1.8 },
]
const plan = { ...structuredClone(DEFAULT_INPUTS) }
const key = atlasKey(plan, IDS)
const raw = encodeSaved(key, V, { entries, at: 1_700_000_000_000 })

/** The stored JSON with a change applied. */
const tamper = (f: (o: Record<string, unknown> & { entries: Record<string, unknown>[] }) => void) => {
  const o = JSON.parse(raw)
  f(o)
  return JSON.stringify(o)
}

describe('saved Atlas ranking', () => {
  it('the same plan and data version read back exactly', () => {
    expect(decodeSaved(raw, key, V, known)).toEqual({ entries, at: 1_700_000_000_000 })
    // the destination never changes a ranking, so it doesn't change the key either
    expect(decodeSaved(raw, atlasKey({ ...plan, destCityId: 'zurich' }, IDS), V, known)).not.toBeNull()
  })

  it('stores a hash, never the plan inputs', () => {
    const o = JSON.parse(raw)
    expect(Object.keys(o).sort()).toEqual(['at', 'entries', 'f', 'h'])
    expect(o.h).toBe(savedHash(key, V))
    expect(raw).not.toContain('holdings')
    expect(raw).not.toContain(String(plan.budget.housing))
  })

  it('a changed plan never shows the saved ranking', () => {
    const changes: Partial<PlanInputs>[] = [
      { seed: plan.seed + 1 },
      { retireInYears: 3 },
      { existingLoan: 100_000 },
      { savingsWhileWorking: 1 },
      { budget: { ...plan.budget, housing: plan.budget.housing + 1 } },
      { holdings: plan.holdings.map((h, i) => (i === 0 ? { ...h, weight: h.weight + 1 } : h)) },
    ]
    for (const c of changes) expect(decodeSaved(raw, atlasKey({ ...plan, ...c }, IDS), V, known), JSON.stringify(c)).toBeNull()
    expect(decodeSaved(raw, atlasKey(plan, ['lisbon', 'bangkok']), V, known)).toBeNull()
  })

  it('a changed data version never shows the saved ranking', () => {
    expect(decodeSaved(raw, key, 'https://example.test/assets/worker-XyZ789.js', known)).toBeNull()
    expect(decodeSaved(raw, key, '', known)).toBeNull()
  })

  it('a corrupt or malformed value never shows a saved ranking', () => {
    const bad: (string | null | undefined)[] = [
      null,
      undefined,
      '',
      '{',
      'null',
      '[]',
      '"x"',
      raw.slice(0, -5),
      tamper((o) => (o.f = 2)),
      tamper((o) => delete o.h),
      tamper((o) => (o.at = 'yesterday')),
      tamper((o) => (o.at = -1)),
      tamper((o) => (o.entries = [])),
      tamper((o) => (o.entries = {} as never)),
      tamper((o) => (o.entries[0] = null as never)),
      tamper((o) => (o.entries[0].cityId = 'atlantis')),
      tamper((o) => (o.entries[0].cityId = 7)),
      tamper((o) => (o.entries[1].cityId = 'bangkok')),
      tamper((o) => (o.entries[0].successRate = 1.2)),
      tamper((o) => (o.entries[0].successRate = -0.1)),
      tamper((o) => (o.entries[0].successRate = '0.9')),
      tamper((o) => (o.entries[0].successRate = null)),
      tamper((o) => (o.entries[0].spendUsd = -5)),
      tamper((o) => delete o.entries[0].spendUsd),
      tamper((o) => (o.entries[0].costRatio = 'cheap')),
    ]
    for (const b of bad) expect(decodeSaved(b, key, V, known), String(b)).toBeNull()
    // Infinity / NaN don't survive JSON, so test them as parsed values via a raw string
    expect(decodeSaved(raw.replace('"successRate":0.93', '"successRate":1e999'), key, V, known)).toBeNull()
  })

  it('drops extra fields on the way in', () => {
    const r = decodeSaved(tamper((o) => (o.entries[0].extra = '<script>')), key, V, known)
    expect(r?.entries[0]).toEqual(entries[0])
  })
})
