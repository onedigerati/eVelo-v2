import { describe, expect, it } from 'vitest'
import { CITY_BY_ID } from '../cities'
import {
  EXPAT_AS_OF,
  EXPAT_PICKS,
  EXPAT_PROFILES,
  EXPAT_RANKING_METHOD,
  EXPAT_RANKING_SOURCES,
  EXPAT_SCORE_LABELS,
  EXPAT_SCORE_RUBRIC,
  expatPickFor,
  topProfiles,
  type ExpatScoreKey,
} from '../expatPicks'

const SCORE_KEYS: ExpatScoreKey[] = ['cost', 'healthcare', 'safety', 'visa', 'climate', 'community', 'tax', 'estate', 'lending']
const FACT_KEYS = ['healthcare', 'safety', 'visa', 'tax', 'estate', 'lending', 'climate', 'community', 'access'] as const
const BBD = 'eVelo BBD destinations research'
const N = 50
const HTTP = /^https?:\/\/\S+$/

describe('EXPAT_PICKS', () => {
  it('has 50 unique picks ranked 1..50 in order', () => {
    expect(EXPAT_PICKS).toHaveLength(N)
    expect(EXPAT_PICKS.map((p) => p.rank)).toEqual(Array.from({ length: N }, (_, i) => i + 1))
    expect(new Set(EXPAT_PICKS.map((p) => p.cityId)).size).toBe(N)
  })

  it('follows the research doc\'s draft top 50 at the ends', () => {
    expect(EXPAT_PICKS.slice(0, 5).map((p) => p.cityId)).toEqual(['algarve', 'lisbon', 'paphos', 'panama-city', 'boquete'])
    expect(EXPAT_PICKS[N - 1].cityId).toBe('nice')
  })

  it('cites the BBD research for every pick', () => {
    for (const p of EXPAT_PICKS) expect(p.sourceRefs, p.cityId).toContain(BBD)
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

  it('has a profile file for every pick, and no profile without a pick', () => {
    const missing = EXPAT_PICKS.filter((p) => !p.profile).map((p) => p.cityId)
    expect(missing, `no profile yet: ${missing.join(', ')}`).toEqual([])
    const orphans = Object.keys(EXPAT_PROFILES).filter((id) => !expatPickFor(id))
    expect(orphans, 'profile files with no pick').toEqual([])
  })

  it('gives every profiled pick a full profile', () => {
    for (const p of EXPAT_PICKS) {
      const pr = p.profile
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
      expect(Object.keys(pr.facts).sort(), p.cityId).toEqual([...FACT_KEYS].sort())
      for (const k of FACT_KEYS) {
        expect(pr.facts[k]?.trim(), `${p.cityId}.${k}`).toBeTruthy()
        expect(pr.facts[k], `${p.cityId}.${k}`).not.toMatch(/\n/)
      }
      expect(pr.drawbacks.length, p.cityId).toBeGreaterThanOrEqual(2)
      expect(pr.drawbacks.length, p.cityId).toBeLessThanOrEqual(3)
      for (const d of pr.drawbacks) expect(d.trim(), p.cityId).not.toBe('')
      expect(pr.sources.length, p.cityId).toBeGreaterThanOrEqual(3)
      // Sources are keyed by url in the profile sheet.
      expect(new Set(pr.sources.map((s) => s.url)).size, p.cityId).toBe(pr.sources.length)
    }
  })

  it('has no TODO placeholders left in any profile', () => {
    for (const [id, pr] of Object.entries(EXPAT_PROFILES)) expect(JSON.stringify(pr), id).not.toMatch(/TODO/)
  })

  it('keeps every pick\'s scores on one 1–5 scale, using the whole range', () => {
    const all = EXPAT_PICKS.flatMap((p) => (p.profile ? SCORE_KEYS.map((k) => p.profile!.scores[k]) : []))
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
    expect(EXPAT_SCORE_LABELS.visa).toBe('Residency')
  })

  it('has a rubric line for every score key', () => {
    expect(Object.keys(EXPAT_SCORE_RUBRIC).sort()).toEqual([...SCORE_KEYS].sort())
    for (const k of SCORE_KEYS) {
      expect(EXPAT_SCORE_RUBRIC[k], k).toMatch(/5 = /)
      expect(EXPAT_SCORE_RUBRIC[k], k).toMatch(/1 = /)
    }
  })

  it('names the BBD research as a ranking source and in the method', () => {
    const bbd = EXPAT_RANKING_SOURCES.find((s) => s.name === BBD)
    expect(bbd?.url).toContain('docs/research/bbd-ranking-2026-11.md')
    expect(EXPAT_RANKING_METHOD).toMatch(/buy-borrow-die/)
  })
})

describe('helpers', () => {
  it('finds a pick by city id', () => {
    expect(expatPickFor('algarve')?.rank).toBe(1)
    expect(expatPickFor('paphos')?.rank).toBe(3)
    expect(expatPickFor('nice')?.rank).toBe(50)
    expect(expatPickFor('bali')).toBeUndefined()
    expect(expatPickFor('st-louis')).toBeUndefined()
  })

  it('returns all 50 profiled picks in rank order', () => {
    const top = topProfiles()
    expect(top).toHaveLength(N)
    expect(top.map((p) => p.rank)).toEqual(Array.from({ length: N }, (_, i) => i + 1))
  })
})
