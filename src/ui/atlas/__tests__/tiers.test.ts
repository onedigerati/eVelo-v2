import { describe, expect, it } from 'vitest'
import { CITIES } from '../../../data/cities'
import { percent } from '../../format'
import { VERDICT_BANDS, defaultOpen, groupTiers, letterOf, oddsBands, type TierRow, type TierSort } from '../tiers'

const row = (cityId: string, name: string, successRate: number, costRatio: number): TierRow => ({
  cityId,
  successRate,
  costRatio,
  city: { name },
})

// All 133 cities with odds spread 22%–99% and cost 40%–190% of home, deterministic.
const ALL: TierRow[] = CITIES.map((c, i) => row(c.id, c.name, 0.22 + ((i * 37) % 78) / 100, 0.4 + ((i * 53) % 151) / 100))
const HOME = ALL[17].cityId

const sorted = (rows: TierRow[], sort: TierSort) =>
  sort === 'odds'
    ? [...rows].sort((a, b) => b.successRate - a.successRate)
    : sort === 'cost'
      ? [...rows].sort((a, b) => a.costRatio - b.costRatio)
      : [...rows].sort((a, b) => a.city.name.localeCompare(b.city.name))

describe('groupTiers', () => {
  for (const sort of ['odds', 'cost', 'name'] as TierSort[]) {
    it(`${sort}: every city in exactly one tier, in sort order, no empty tiers`, () => {
      const rows = sorted(ALL, sort)
      const tiers = groupTiers(rows, sort, HOME, sort === 'odds' ? oddsBands(ALL) : undefined)
      expect(tiers.flatMap((t) => t.rows)).toEqual(rows)
      expect(new Set(tiers.map((t) => t.key)).size).toBe(tiers.length)
      for (const t of tiers) expect(t.rows.length).toBeGreaterThan(0)
    })
  }

  it('odds tiers follow the verdict cuts on the displayed whole percent', () => {
    const rates = [0.995, 0.8, 0.7951, 0.7949, 0.65, 0.6449, 0.45, 0.4449, 0.1]
    const rows = rates.map((s, i) => row(`c${i}`, `C${i}`, s, 1))
    const tiers = groupTiers(rows, 'odds', 'none')
    const tierOf = (id: string) => tiers.find((t) => t.rows.some((r) => r.cityId === id))!
    expect(tiers.map((t) => [t.label, t.range])).toEqual([
      ['Holds', '80%+'],
      ['Mostly holds', '65–79%'],
      ['Fragile', '45–64%'],
      ['Breaks', 'under 45%'],
    ])
    // 79.51% shows as "80%" in the list, so it holds; 79.49% shows "79%".
    expect(percent(0.7951)).toBe('80%')
    expect(tierOf('c2').label).toBe('Holds')
    expect(tierOf('c3').label).toBe('Mostly holds')
    expect(tierOf('c4').label).toBe('Mostly holds')
    expect(tierOf('c5').label).toBe('Fragile')
    expect(tierOf('c6').label).toBe('Fragile')
    expect(tierOf('c7').label).toBe('Breaks')
  })

  it('drops empty odds tiers', () => {
    const tiers = groupTiers([row('a', 'A', 0.9, 1), row('b', 'B', 0.3, 1)], 'odds', 'none')
    expect(tiers.map((t) => t.label)).toEqual(['Holds', 'Breaks'])
  })

  it('cheapest bands by cost vs home on the displayed percent', () => {
    const ratios = [0.3, 0.4951, 0.5, 0.6949, 0.7, 0.8949, 0.9, 1, 1.1049, 1.1051, 2]
    const rows = ratios.map((c, i) => row(`c${i}`, `C${i}`, 0.5, c))
    const tiers = groupTiers(rows, 'cost', 'none')
    expect(tiers.map((t) => [t.label, t.rows.map((r) => r.costRatio)])).toEqual([
      ['Under 50% of home', [0.3]],
      ['50–70% of home', [0.4951, 0.5, 0.6949]],
      ['70–90% of home', [0.7, 0.8949]],
      ['90–110% of home', [0.9, 1, 1.1049]],
      ['Over 110% of home', [1.1051, 2]],
    ])
  })

  it('A–Z groups by first letter, accents folded', () => {
    const rows = sorted([row('a', 'Évora', 0.5, 1), row('b', 'Austin', 0.5, 1), row('c', 'Eugene', 0.5, 1), row('d', 'Zurich', 0.5, 1)], 'name')
    const tiers = groupTiers(rows, 'name', 'none')
    expect(tiers.map((t) => [t.label, t.rows.map((r) => r.city.name)])).toEqual([
      ['A', ['Austin']],
      ['E', ['Eugene', 'Évora']],
      ['Z', ['Zurich']],
    ])
    expect(letterOf('Ōita')).toBe('O')
    expect(letterOf('1st')).toBe('#')
  })

  it('flags only the tier that holds home', () => {
    for (const sort of ['odds', 'cost', 'name'] as TierSort[]) {
      const tiers = groupTiers(sorted(ALL, sort), sort, HOME)
      const flagged = tiers.filter((t) => t.hasHome)
      expect(flagged).toHaveLength(1)
      expect(flagged[0].rows.some((r) => r.cityId === HOME)).toBe(true)
    }
  })

  it('a search returns only tiers with hits, all open', () => {
    const hits = sorted(ALL, 'odds').filter((r) => r.city.name.toLowerCase().includes('an'))
    const bands = oddsBands(ALL)
    const all = groupTiers(sorted(ALL, 'odds'), 'odds', HOME, bands)
    const tiers = groupTiers(hits, 'odds', HOME, bands)
    expect(tiers.length).toBeGreaterThan(0)
    expect(tiers.length).toBeLessThanOrEqual(all.length)
    for (const t of tiers) expect(t.rows.length).toBeGreaterThan(0)
    expect(tiers.flatMap((t) => t.rows)).toEqual(hits)
    expect([...defaultOpen(tiers, true)]).toEqual(tiers.map((t) => t.key))
    // No search: only the first tier is open.
    expect([...defaultOpen(all, false)]).toEqual([all[0].key])
    expect(defaultOpen([], false).size).toBe(0)
  })
})

describe('oddsBands', () => {
  it('keeps the verdict bands when none holds more than 40', () => {
    expect(oddsBands(ALL.slice(0, 40))).toEqual(VERDICT_BANDS)
  })

  it('splits a band over 40 at its 10-point lines, top first', () => {
    // 42 at 66–79% (the default plan's shape) and 45 at 47–64%.
    const mostly = Array.from({ length: 42 }, (_, i) => row(`m${i}`, 'M', 0.66 + (i % 14) / 100, 1))
    const fragile = Array.from({ length: 45 }, (_, i) => row(`f${i}`, 'F', 0.47 + (i % 18) / 100, 1))
    const bands = oddsBands([...mostly, ...fragile])
    expect(bands).toEqual([
      { lo: 80, hi: 101 },
      { lo: 70, hi: 80 },
      { lo: 65, hi: 70 },
      { lo: 60, hi: 65 },
      { lo: 45, hi: 60 },
      { lo: 0, hi: 45 },
    ])
    const tiers = groupTiers(sorted([...mostly, ...fragile], 'odds'), 'odds', 'none', bands)
    expect(tiers.map((t) => `${t.label} ${t.range}`)).toEqual(['Mostly holds 70–79%', 'Mostly holds 65–69%', 'Fragile 60–64%', 'Fragile 45–59%'])
  })

  it('keeps splitting a huge band and stops when no 10-point line is left', () => {
    const holds = Array.from({ length: 100 }, (_, i) => row(`h${i}`, 'H', 0.8 + (i % 9) / 100, 1))
    expect(oddsBands(holds).slice(0, 2)).toEqual([
      { lo: 90, hi: 101 },
      { lo: 80, hi: 90 },
    ])
  })
})
