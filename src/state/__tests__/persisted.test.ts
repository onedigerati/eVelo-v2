import { describe, expect, it } from 'vitest'
import { parsePersisted } from '../persisted'

describe('parsePersisted', () => {
  it('returns {} for anything but a plain object', () => {
    for (const raw of ['null', '5', '[]', '"x"', '{not json', 'true', '', null, undefined]) expect(parsePersisted(raw)).toEqual({})
  })

  it('keeps a valid stored object', () => {
    const v = { inputs: { portfolio: 1 }, theme: 'dark', themeV: 2 }
    expect(parsePersisted(JSON.stringify(v))).toEqual(v)
  })
})
