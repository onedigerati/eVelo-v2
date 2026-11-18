import { describe, expect, it } from 'vitest'
import { sanitizeOpenSections } from '../openSections'

describe('sanitizeOpenSections', () => {
  it('keeps known sections with boolean flags', () => {
    expect(sanitizeOpenSections({ portfolio: true, model: false })).toEqual({ portfolio: true, model: false })
  })

  it('drops unknown ids, non-boolean values and inherited keys', () => {
    const raw = JSON.parse('{"life":"yes","place":1,"borrowing":null,"__proto__":{"portfolio":true},"constructor":true,"extra":true}')
    expect(sanitizeOpenSections(raw)).toEqual({})
  })

  it('returns nothing for values that are not plain objects', () => {
    for (const raw of [null, undefined, 'portfolio', 42, true, ['portfolio']]) expect(sanitizeOpenSections(raw)).toEqual({})
  })
})
