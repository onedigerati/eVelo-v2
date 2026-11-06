import { describe, expect, it } from 'vitest'
import { CITY_BY_ID } from '../cities'
import {
  EXPAT_AS_OF,
  EXPAT_PICKS,
  EXPAT_RANKING_METHOD,
  EXPAT_RANKING_SOURCES,
  EXPAT_SCORE_LABELS,
  expatPickFor,
  topProfiles,
  type ExpatScoreKey,
} from '../expatPicks'

const SCORE_KEYS: ExpatScoreKey[] = ['cost', 'healthcare', 'safety', 'visa', 'climate', 'community']
const FACT_KEYS = ['healthcare', 'safety', 'visa', 'tax', 'climate', 'community', 'access'] as const
const HTTP = /^https?:\/\/\S+$/

describe('EXPAT_PICKS', () => {
  it('has 25 unique picks ranked 1..25 in order', () => {
    expect(EXPAT_PICKS).toHaveLength(25)
    expect(EXPAT_PICKS.map((p) => p.rank)).toEqual(Array.from({ length: 25 }, (_, i) => i + 1))
    expect(new Set(EXPAT_PICKS.map((p) => p.cityId)).size).toBe(25)
  })

  it('points at verified cities in the dataset', () => {
    for (const p of EXPAT_PICKS) {
      const city = CITY_BY_ID[p.cityId]
      expect(city, p.cityId).toBeDefined()
      expect(city.verified, p.cityId).toBeDefined()
    }
  })

  it('gives every pick a one-sentence reason and known source refs', () => {
    const names = new Set(EXPAT_RANKING_SOURCES.map((s) => s.name))
    for (const p of EXPAT_PICKS) {
      expect(p.why.trim().length, p.cityId).toBeGreaterThan(20)
      expect(p.why, p.cityId).toMatch(/\.$/)
      expect(p.sourceRefs.length, p.cityId).toBeGreaterThan(0)
      for (const ref of p.sourceRefs) expect(names.has(ref), `${p.cityId}: ${ref}`).toBe(true)
    }
  })

  it('gives all 25 picks a full profile', () => {
    for (const p of EXPAT_PICKS) {
      const pr = p.profile
      expect(pr, p.cityId).toBeDefined()
      if (!pr) continue
      expect(pr.tagline.trim(), p.cityId).not.toBe('')
      expect(pr.summary.trim(), p.cityId).not.toBe('')
      expect(Object.keys(pr.scores).sort()).toEqual([...SCORE_KEYS].sort())
      for (const k of SCORE_KEYS) {
        const s = pr.scores[k]
        expect(Number.isInteger(s), `${p.cityId}.${k}`).toBe(true)
        expect(s, `${p.cityId}.${k}`).toBeGreaterThanOrEqual(1)
        expect(s, `${p.cityId}.${k}`).toBeLessThanOrEqual(5)
      }
      for (const k of FACT_KEYS) {
        expect(pr.facts[k]?.trim(), `${p.cityId}.${k}`).toBeTruthy()
        expect(pr.facts[k], `${p.cityId}.${k}`).not.toMatch(/\n/)
      }
      expect(pr.drawbacks.length, p.cityId).toBeGreaterThanOrEqual(2)
      expect(pr.drawbacks.length, p.cityId).toBeLessThanOrEqual(3)
      for (const d of pr.drawbacks) expect(d.trim(), p.cityId).not.toBe('')
      expect(pr.sources.length, p.cityId).toBeGreaterThanOrEqual(2)
      // Sources are keyed by url in the profile sheet.
      expect(new Set(pr.sources.map((s) => s.url)).size, p.cityId).toBe(pr.sources.length)
    }
  })

  it('keeps every pick\'s scores on one 1–5 scale, using the whole range', () => {
    const all = EXPAT_PICKS.flatMap((p) => SCORE_KEYS.map((k) => p.profile!.scores[k]))
    expect(Math.min(...all)).toBe(1)
    expect(Math.max(...all)).toBe(5)
  })

  it('has no internal research markers in the prose', () => {
    const text = JSON.stringify(EXPAT_PICKS)
    expect(text).not.toMatch(/\(unconfirmed\)|paradise/i)
    expect(text).not.toMatch(/\bNOT\b/)
  })
})

describe('sources and method', () => {
  it('uses http(s) urls everywhere', () => {
    for (const s of EXPAT_RANKING_SOURCES) {
      expect(s.url, s.name).toMatch(HTTP)
      for (const u of s.moreUrls ?? []) expect(u, s.name).toMatch(HTTP)
      expect(s.edition.trim(), s.name).not.toBe('')
      expect(s.whatItRanks.trim(), s.name).not.toBe('')
    }
    for (const p of EXPAT_PICKS) for (const s of p.profile?.sources ?? []) expect(s.url, `${p.cityId}: ${s.name}`).toMatch(HTTP)
  })

  it('has unique ranking source names', () => {
    const names = EXPAT_RANKING_SOURCES.map((s) => s.name)
    expect(new Set(names).size).toBe(names.length)
  })

  it('exports the method, date and labels', () => {
    expect(EXPAT_RANKING_METHOD.length).toBeGreaterThan(100)
    expect(EXPAT_AS_OF).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(Object.keys(EXPAT_SCORE_LABELS).sort()).toEqual([...SCORE_KEYS].sort())
  })
})

describe('helpers', () => {
  it('finds a pick by city id', () => {
    expect(expatPickFor('algarve')?.rank).toBe(1)
    expect(expatPickFor('bali')?.rank).toBe(25)
    expect(expatPickFor('st-louis')).toBeUndefined()
  })

  it('returns all 25 profiled picks in rank order', () => {
    const top = topProfiles()
    expect(top).toHaveLength(25)
    expect(top.map((p) => p.rank)).toEqual(Array.from({ length: 25 }, (_, i) => i + 1))
  })
})
