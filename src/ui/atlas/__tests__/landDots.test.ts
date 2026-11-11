import { describe, expect, it } from 'vitest'
import { loadLandDots } from '../landDots'

describe('loadLandDots', () => {
  it('retries after a failed load instead of caching the failure', async () => {
    // No `document` under node, so sampling fails: a stand-in for a network or chunk-load error.
    const first = loadLandDots()
    await expect(first).rejects.toThrow()
    const second = loadLandDots()
    expect(second).not.toBe(first)
    await expect(second).rejects.toThrow()
  })
})
