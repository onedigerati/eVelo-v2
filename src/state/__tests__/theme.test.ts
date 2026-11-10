import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import { describe, expect, it } from 'vitest'
import { themeFromSaved, withThemeVersion, type ThemePref } from '../theme'

/** [saved evelo:v2 value (raw string, or null for nothing saved), starting theme]. */
const CASES: [string | null, ThemePref][] = [
  [null, 'dark'],
  ['{}', 'dark'],
  ['null', 'dark'],
  ['not json', 'dark'],
  ['{"inputs":{}}', 'dark'],
  ['{"theme":"system"}', 'dark'],
  ['{"theme":"system","themeV":1}', 'dark'],
  ['{"theme":"system","themeV":2}', 'system'],
  ['{"theme":"light"}', 'light'],
  ['{"theme":"light","themeV":2}', 'light'],
  ['{"theme":"dark"}', 'dark'],
  ['{"theme":"dark","themeV":2}', 'dark'],
  ['{"theme":"purple","themeV":2}', 'dark'],
]

function parse(raw: string | null) {
  try {
    return (JSON.parse(raw ?? '{}') ?? {}) as object
  } catch {
    return {}
  }
}

describe('starting theme (themeFromSaved)', () => {
  it.each(CASES)('saved %s starts as %s', (raw, want) => {
    expect(themeFromSaved(parse(raw))).toBe(want)
  })

  it('keeps a System chosen after the switch, once saved', () => {
    const saved = JSON.parse(JSON.stringify(withThemeVersion({ inputs: {}, theme: 'system' })))
    expect(saved.themeV).toBe(2)
    expect(themeFromSaved(saved)).toBe('system')
  })
})

describe('index.html pre-paint script', () => {
  const html = readFileSync(new URL('../../../index.html', import.meta.url), 'utf8')
  const script = html.match(/<script>([\s\S]*?)<\/script>/)![1]
  const htmlDefault = html.match(/<html[^>]*data-theme="(\w+)"/)![1]

  function run(raw: string | null | 'blocked') {
    const metas = [{ content: '#F5F2EA' }, { content: '#0A0D0C' }]
    const doc = { documentElement: { dataset: { theme: htmlDefault } }, querySelectorAll: () => metas }
    const localStorage = {
      getItem: () => {
        if (raw === 'blocked') throw new Error('SecurityError')
        return raw
      },
    }
    runInNewContext(script, { document: doc, localStorage, JSON })
    return { theme: doc.documentElement.dataset.theme, metas: metas.map((m) => m.content) }
  }

  it.each(CASES)('saved %s paints as %s, like the app', (raw, want) => {
    expect(run(raw).theme).toBe(want)
  })

  it('paints dark when storage is blocked', () => {
    expect(run('blocked').theme).toBe('dark')
  })

  it('sets the browser chrome color for an explicit theme, and leaves it to the OS for System', () => {
    expect(run(null).metas).toEqual(['#0A0D0C', '#0A0D0C'])
    expect(run('{"theme":"light"}').metas).toEqual(['#F5F2EA', '#F5F2EA'])
    expect(run('{"theme":"system","themeV":2}').metas).toEqual(['#F5F2EA', '#0A0D0C'])
  })
})
