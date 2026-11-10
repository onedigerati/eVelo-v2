import { describe, expect, it, vi } from 'vitest'

// atlasData imports the store and the sim client, which touch `window` on load.
vi.mock('../../../state/store', () => ({ useStore: () => undefined }))
vi.mock('../../../state/sim', () => ({}))
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { CITY_BY_ID } from '../../../data/cities'
import type { Ranked } from '../atlasData'
import { isProfiled, pickViews, splitPicks } from '../picks'
import { PickCard } from '../TopPicks'

const rows: Ranked[] = Object.values(CITY_BY_ID).map(
  (city, i) => ({ cityId: city.id, successRate: 0.8, spendUsd: 50_000, costRatio: 0.7, city, rank: i + 1 }) as Ranked,
)
const cards = splitPicks(pickViews(rows)).cards.filter(isProfiled)
const render = (v: (typeof cards)[number], homeId = 'none', destId: string | null = null) =>
  renderToStaticMarkup(createElement('ol', null, createElement(PickCard, { v, i: 0, homeId, destId, onOpen: () => {} })))

describe('PickCard', () => {
  it('every top-pick card shows its country beside the city name, hidden from AT because the open button names it', () => {
    expect(cards.length).toBeGreaterThan(0)
    for (const v of cards) {
      const m = render(v)
      const line = m.match(/<div class="pick__city">(.*?)<\/div>/)?.[1] ?? ''
      const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/'/g, '&#x27;')
      const country = line.match(/<span class="pick__country" aria-hidden="true">([^<]*)<\/span>/)
      expect(country?.[1]).toBe(esc(v.city.country))
      // Name and country share the title, the country last.
      expect(line).toContain('<span class="pick__title"><button')
      expect(line).toMatch(/<span class="pick__country" aria-hidden="true">[^<]*<\/span><\/span>/)
      // Right after the open button, whose text stays the city alone and whose label is unchanged.
      expect(line).toMatch(new RegExp(`>${esc(v.city.name).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</button><span class="pick__country"`))
      const label = m.match(/<button[^>]*class="pick__open"[^>]*aria-label="([^"]*)"/)?.[1] ?? m.match(/<button[^>]*aria-label="([^"]*)"[^>]*class="pick__open"/)?.[1]
      expect(label!.startsWith(`Top pick ${v.pick.rank}: ${esc(v.city.name)}, ${esc(v.city.country)}. `)).toBe(true)
      expect(label).toMatch(/ Open profile\.$/)
      expect(m.match(/<button/g)).toHaveLength(1)
    }
  })

  it('keeps the Destination and Home tags after the country', () => {
    const v = cards[0]
    const line = render(v, v.pick.cityId).match(/<div class="pick__city">(.*?)<\/div>/)?.[1] ?? ''
    expect(line.indexOf('pick__country')).toBeLessThan(line.indexOf('crow__tag'))
  })
})
