import { describe, expect, it } from 'vitest'
import { PLAN_KEY, resetPlan, urlWithoutShare } from '../resetPlan'

function fakeStorage(init: Record<string, string>) {
  const map = new Map(Object.entries(init))
  return {
    map,
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
  }
}

function run(hash: string, storage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> | null = fakeStorage({})) {
  const calls: string[] = []
  let url: string | null = null
  resetPlan({
    storage,
    location: { pathname: '/app/', search: '?x=1', hash },
    replaceUrl: (u) => {
      url = u
      calls.push('replace')
    },
    reload: () => calls.push('reload'),
  })
  return { url, calls }
}

describe('resetPlan', () => {
  it('clears the stored plan and keeps saved portfolios and other keys', () => {
    const s = fakeStorage({ [PLAN_KEY]: '{"inputs":{}}', 'evelo:v2:portfolios': '[1]', other: 'y' })
    run('', s)
    expect(PLAN_KEY).toBe('evelo:v2')
    expect(s.map.has('evelo:v2')).toBe(false)
    expect(s.map.get('evelo:v2:portfolios')).toBe('[1]')
    expect(s.map.get('other')).toBe('y')
  })

  it('keeps the theme stored beside the plan and drops the inputs', () => {
    const s = fakeStorage({ [PLAN_KEY]: JSON.stringify({ inputs: { portfolio: 5 }, theme: 'light', themeV: 2 }) })
    run('', s)
    expect(JSON.parse(s.map.get(PLAN_KEY)!)).toEqual({ theme: 'light', themeV: 2 })
  })

  it('removes a stored value with no theme, or a corrupt one', () => {
    for (const bad of ['{"inputs":{"portfolio":5}}', 'null', '[1]', '"x"', '5', '{not json']) {
      const s = fakeStorage({ [PLAN_KEY]: bad, 'evelo:v2:portfolios': '[1]' })
      run('', s)
      expect(s.map.has(PLAN_KEY)).toBe(false)
      expect(s.map.get('evelo:v2:portfolios')).toBe('[1]')
    }
  })

  it('strips a #p= share hash, then reloads', () => {
    expect(run('#p=abc')).toEqual({ url: '/app/?x=1', calls: ['replace', 'reload'] })
  })

  it('strips a legacy #/?p= and a routed #plan?p= share hash', () => {
    expect(run('#/?p=abc').url).toBe('/app/?x=1')
    expect(run('#plan?p=abc').url).toBe('/app/?x=1')
  })

  it('keeps a plain route hash', () => {
    expect(urlWithoutShare({ pathname: '/', search: '', hash: '#atlas' })).toBe('/#atlas')
    expect(urlWithoutShare({ pathname: '/', search: '', hash: '' })).toBe('/')
  })

  it('still reloads when storage is missing or throws', () => {
    expect(run('#p=abc', null).calls).toEqual(['replace', 'reload'])
    const bad = {
      getItem: () => {
        throw new Error('blocked')
      },
      setItem: () => {
        throw new Error('blocked')
      },
      removeItem: () => {
        throw new Error('blocked')
      },
    }
    expect(run('#p=abc', bad).calls).toEqual(['replace', 'reload'])
  })
})
