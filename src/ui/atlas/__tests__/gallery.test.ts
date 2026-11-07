import { describe, expect, it } from 'vitest'
import { photosFor } from '../../../data/photos'
import { percent } from '../../format'
import { outcomeColor, outcomeTextColor } from '../../outcomeScale'
import { licenseFamily, oddsBadge, photoCredit, sourceLabel } from '../gallery'
import { oddsVsHome } from '../picks'

const lisbon = { cityId: 'lisbon', successRate: 0.82 }
const austin = { cityId: 'austin', successRate: 0.76, name: 'Austin' }

describe('oddsBadge', () => {
  it('is a skeleton (no number) while the Atlas is ranking', () => {
    const m = oddsBadge(undefined, austin, 'Lisbon')
    expect(m.ready).toBe(false)
    expect(m).not.toHaveProperty('pct')
    expect(m.label).toMatch(/ranking/i)
    expect(m.label).not.toMatch(/\d/)
  })

  it('shows the odds and the home comparison with the card’s numbers and colours', () => {
    const m = oddsBadge(lisbon, austin, 'Lisbon')
    if (!m.ready) throw new Error('expected ready')
    expect(m.pct).toBe(82)
    expect(m.rate).toBe(0.82)
    expect(m.tone).toBe(outcomeTextColor(0.82))
    expect(m.fill).toBe(outcomeColor(0.82))
    expect(m.home).toEqual({
      rate: 0.76,
      delta: '+6 pts',
      deltaClass: 'is-down',
      text: 'vs 76% in Austin',
    })
    expect(`${m.home?.delta} ${m.home?.text}`).toBe('+6 pts vs 76% in Austin')
    // The card renders `oddsVsHome(...)` and `percent(home)`; the badge must agree.
    expect(m.home?.delta).toBe(oddsVsHome(lisbon.successRate, austin.successRate))
    expect(m.home?.text).toContain(percent(austin.successRate))
    expect(m.label).toBe('Your plan in Lisbon holds in 82% of simulated futures, +6 pts vs 76% in Austin')
  })

  it('marks a worse city with the card’s is-up class and a minus sign', () => {
    const m = oddsBadge({ cityId: 'x', successRate: 0.6 }, austin, 'X')
    if (!m.ready) throw new Error('expected ready')
    expect(m.home?.delta).toBe('−16 pts')
    expect(m.home?.deltaClass).toBe('is-up')
  })

  it('says "same" with no tone class when the odds round equal', () => {
    const m = oddsBadge({ cityId: 'x', successRate: 0.762 }, austin, 'X')
    if (!m.ready) throw new Error('expected ready')
    expect(m.pct).toBe(76)
    expect(m.home?.delta).toBe('same')
    expect(m.home?.deltaClass).toBeUndefined()
    expect(m.label).toMatch(/the same as 76% in Austin/)
  })

  it('omits the comparison when there is no home row or the city is home', () => {
    for (const m of [oddsBadge(lisbon, undefined, 'Lisbon'), oddsBadge({ ...austin }, austin, 'Austin')]) {
      if (!m.ready) throw new Error('expected ready')
      expect(m.home).toBeUndefined()
      expect(m.label).not.toMatch(/ vs /)
    }
  })

  it('clamps the bar to 0..1', () => {
    const m = oddsBadge({ cityId: 'x', successRate: 1.2 }, { cityId: 'h', successRate: -0.1, name: 'H' }, 'X')
    if (!m.ready) throw new Error('expected ready')
    expect(m.rate).toBe(1)
    expect(m.home?.rate).toBe(0)
  })
})

describe('photoCredit', () => {
  it('lists each author once, licence families once, and Commons', () => {
    const c = 'https://commons.wikimedia.org/wiki/File:X.jpg'
    expect(
      photoCredit([
        { author: 'Dale Cruse', license: 'CC BY 4.0', source: c },
        { author: 'Jakub Hałun', license: 'CC BY 4.0', source: c },
        { author: 'Jakub Hałun', license: 'CC BY-SA 3.0', source: c },
        { author: 'Paul Arps', license: 'CC BY 2.0', source: c },
        { author: 'Ann', license: 'CC0', source: c },
      ]),
    ).toBe('Photos: Dale Cruse, Jakub Hałun, Paul Arps, Ann · CC BY / CC BY-SA / CC0 · Wikimedia Commons')
  })

  it('names each source by its host, and is empty without photos', () => {
    expect(photoCredit([{ author: 'A', license: 'Public domain', source: 'https://example.com/a' }])).toBe('Photos: A · Public domain · example.com')
    expect(
      photoCredit([
        { author: 'A', license: 'CC BY 4.0', source: 'https://commons.wikimedia.org/wiki/File:A.jpg' },
        { author: 'B', license: 'Unsplash License', source: 'https://unsplash.com/photos/abc' },
      ]),
    ).toBe('Photos: A, B · CC BY / Unsplash License · Wikimedia Commons · Unsplash')
    expect(photoCredit([])).toBe('')
  })

  it('labels a photo source by its host', () => {
    expect(sourceLabel('https://commons.wikimedia.org/wiki/File:X.jpg')).toBe('Wikimedia Commons')
    expect(sourceLabel('https://unsplash.com/photos/abc')).toBe('Unsplash')
    expect(sourceLabel('https://www.unsplash.com/photos/abc')).toBe('Unsplash')
    expect(sourceLabel('https://www.example.org/p/1')).toBe('example.org')
    expect(sourceLabel('not a url')).toBe('Source')
  })

  it('maps licence names to families', () => {
    expect(licenseFamily('CC BY-SA 3.0 IGO')).toBe('CC BY-SA')
    expect(licenseFamily('CC BY 2.5')).toBe('CC BY')
    expect(licenseFamily('CC0')).toBe('CC0')
    expect(licenseFamily('Public domain')).toBe('Public domain')
  })

  it('credits Lisbon’s real photos', () => {
    const line = photoCredit(photosFor('lisbon'))
    expect(line).toMatch(/^Photos: Dale Cruse, /)
    expect(line).toMatch(/ · Wikimedia Commons$/)
  })
})
