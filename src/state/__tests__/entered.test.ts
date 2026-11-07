import { afterEach, describe, expect, it, vi } from 'vitest'

function stubStorage(store: Map<string, string> | 'blocked') {
  const localStorage =
    store === 'blocked'
      ? {
          getItem: () => {
            throw new Error('SecurityError')
          },
          setItem: () => {
            throw new Error('SecurityError')
          },
        }
      : { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, v) }
  vi.stubGlobal('window', { localStorage })
}

describe('entered-the-app flag', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.resetModules()
  })

  it('is unset on a first visit and persists under evelo:v2:entered once marked', async () => {
    const store = new Map<string, string>()
    stubStorage(store)
    const { readEntered, markEntered } = await import('../entered')
    expect(readEntered()).toBe(false)
    markEntered()
    expect(store.get('evelo:v2:entered')).toBe('1')
    vi.resetModules()
    const again = await import('../entered')
    expect(again.readEntered()).toBe(true)
  })

  it('counts a saved plan from before the flag existed as having entered', async () => {
    stubStorage(new Map([['evelo:v2', '{}']]))
    const { readEntered } = await import('../entered')
    expect(readEntered()).toBe(true)
  })

  it('does not count a plan saved from the landing after the first visit', async () => {
    const store = new Map<string, string>()
    stubStorage(store)
    const first = await import('../entered')
    expect(first.readEntered()).toBe(false)
    store.set('evelo:v2', '{}') // e.g. the theme toggled on the landing
    vi.resetModules()
    const again = await import('../entered')
    expect(again.readEntered()).toBe(false)
  })

  it('reads as unset when storage is blocked, and marking does not throw', async () => {
    stubStorage('blocked')
    const { readEntered, markEntered } = await import('../entered')
    expect(readEntered()).toBe(false)
    expect(() => markEntered()).not.toThrow()
  })
})
