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
  PROFILED_CITY_IDS,
  buildProfileIndex,
  expatPickFor,
  hasProfile,
  profileFor,
  topProfiles,
  unknownProfileIds,
  type ExpatScoreKey,
} from '../expatPicks'

const SCORE_KEYS: ExpatScoreKey[] = ['cost', 'healthcare', 'safety', 'visa', 'climate', 'community', 'tax', 'estate', 'lending']
const FACT_KEYS = ['healthcare', 'safety', 'visa', 'tax', 'estate', 'lending', 'climate', 'community', 'access'] as const
const BBD = 'eVelo BBD destinations research'
const N = 75
const HTTP = /^https?:\/\/\S+$/

describe('EXPAT_PICKS', () => {
  it('has 75 unique picks ranked 1..75 in order', () => {
    expect(EXPAT_PICKS).toHaveLength(N)
    expect(EXPAT_PICKS.map((p) => p.rank)).toEqual(Array.from({ length: N }, (_, i) => i + 1))
    expect(new Set(EXPAT_PICKS.map((p) => p.cityId)).size).toBe(N)
  })

  it('follows the research doc\'s draft top 75 at the ends and the inserted picks', () => {
    expect(EXPAT_PICKS.slice(0, 5).map((p) => p.cityId)).toEqual(['algarve', 'lisbon', 'paphos', 'panama-city', 'boquete'])
    expect(EXPAT_PICKS[N - 1].cityId).toBe('vienna')
    // Stage 7 cities inserted among the old 50, and the old 50th.
    expect(expatPickFor('tavira')?.rank).toBe(14)
    expect(expatPickFor('grand-baie')?.rank).toBe(20)
    expect(expatPickFor('torrevieja')?.rank).toBe(33)
    expect(expatPickFor('la-paz')?.rank).toBe(37)
    expect(expatPickFor('hopkins')?.rank).toBe(40)
    expect(expatPickFor('nice')?.rank).toBe(58)
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

  it('has a profile file for every pick', () => {
    const missing = EXPAT_PICKS.filter((p) => !p.profile).map((p) => p.cityId)
    expect(missing, `no profile yet: ${missing.join(', ')}`).toEqual([])
  })

  it('names every profile file after a city id in cities.ts', () => {
    expect(unknownProfileIds(PROFILED_CITY_IDS, (id) => id in CITY_BY_ID), 'profile files with no city').toEqual([])
  })

  it('gives every profile, pick or not, a full profile', () => {
    for (const [cityId, pr] of Object.entries(EXPAT_PROFILES)) {
      expect(pr.tagline.trim(), cityId).not.toBe('')
      expect(pr.summary.trim(), cityId).not.toBe('')
      expect(Object.keys(pr.scores).sort()).toEqual([...SCORE_KEYS].sort())
      for (const k of SCORE_KEYS) {
        const s = pr.scores[k]
        expect(Number.isInteger(s), `${cityId}.${k}`).toBe(true)
        expect(s, `${cityId}.${k}`).toBeGreaterThanOrEqual(1)
        expect(s, `${cityId}.${k}`).toBeLessThanOrEqual(5)
      }
      expect(Object.keys(pr.facts).sort(), cityId).toEqual([...FACT_KEYS].sort())
      for (const k of FACT_KEYS) {
        expect(pr.facts[k]?.trim(), `${cityId}.${k}`).toBeTruthy()
        expect(pr.facts[k], `${cityId}.${k}`).not.toMatch(/\n/)
      }
      expect(pr.drawbacks.length, cityId).toBeGreaterThanOrEqual(2)
      expect(pr.drawbacks.length, cityId).toBeLessThanOrEqual(3)
      for (const d of pr.drawbacks) expect(d.trim(), cityId).not.toBe('')
      expect(pr.sources.length, cityId).toBeGreaterThanOrEqual(3)
      // Sources are keyed by url in the profile sheet.
      expect(new Set(pr.sources.map((s) => s.url)).size, cityId).toBe(pr.sources.length)
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
    const text = JSON.stringify([EXPAT_PICKS, EXPAT_PROFILES])
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
    for (const [id, pr] of Object.entries(EXPAT_PROFILES)) for (const s of pr.sources) expect(s.url, `${id}: ${s.name}`).toMatch(HTTP)
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
    expect(expatPickFor('vienna')?.rank).toBe(75)
    expect(expatPickFor('da-nang')).toBeUndefined()
    expect(expatPickFor('st-louis')).toBeUndefined()
  })

  it('returns all 75 profiled picks in rank order', () => {
    const top = topProfiles()
    expect(top).toHaveLength(N)
    expect(top.map((p) => p.rank)).toEqual(Array.from({ length: N }, (_, i) => i + 1))
  })

  it('looks up a profile for any profiled city, pick or not', () => {
    expect(profileFor('algarve')).toBe(expatPickFor('algarve')?.profile)
    expect(hasProfile('algarve')).toBe(true)
    expect(profileFor('no-such-city')).toBeUndefined()
    expect(hasProfile('no-such-city')).toBe(false)
    expect(profileFor('toString')).toBeUndefined()
    expect(PROFILED_CITY_IDS).toEqual(Object.keys(EXPAT_PROFILES).sort())
    for (const p of EXPAT_PICKS) expect(PROFILED_CITY_IDS, p.cityId).toContain(p.cityId)
    // Unranked profiles never become picks: the ranked list stays at 75.
    for (const id of PROFILED_CITY_IDS) if (!expatPickFor(id)) expect(EXPAT_PICKS.some((p) => p.cityId === id), id).toBe(false)
  })
})

describe('profile files (buildProfileIndex + unknownProfileIds)', () => {
  const isCity = (id: string) => id in CITY_BY_ID
  const fake = { tagline: 'x' }

  it('keys profiles by file name', () => {
    expect(Object.keys(buildProfileIndex({ './profiles/algarve.ts': fake, './profiles/san-jose-cr.ts': fake }))).toEqual(['algarve', 'san-jose-cr'])
  })

  it('accepts a profile file named after any city id, picks or not', () => {
    const nonPicks = Object.keys(CITY_BY_ID).filter((id) => !expatPickFor(id))
    expect(nonPicks.length).toBeGreaterThan(0)
    expect(nonPicks).toContain('tokyo')
    expect(nonPicks).toContain('austin')
    const modules = Object.fromEntries(Object.keys(CITY_BY_ID).map((id) => [`./profiles/${id}.ts`, fake]))
    expect(unknownProfileIds(Object.keys(buildProfileIndex(modules)), isCity)).toEqual([])
  })

  it('fails a profile file named after an id that is not in cities.ts', () => {
    const index = buildProfileIndex({ './profiles/tokyo.ts': fake, './profiles/atlantis.ts': fake, './profiles/Lisbon.ts': fake })
    expect(unknownProfileIds(Object.keys(index), isCity)).toEqual(['Lisbon', 'atlantis'])
  })
})
