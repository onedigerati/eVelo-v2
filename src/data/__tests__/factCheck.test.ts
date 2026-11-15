import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { CITIES } from '../cities'
import { EXPAT_PROFILES, hasProfile } from '../expatPicks'
import {
  HEDGE_REMOVED,
  PLAN_START,
  SHARED_TOPICS,
  claimProblems,
  coverageProblems,
  fileProblems,
  isIsoDate,
  ledgerFileName,
  profileText,
  sharedRefProblems,
  sharedTopicProblems,
  wordingProblems,
  type LedgerClaim,
  type LedgerFile,
  type LedgerVerdict,
} from './factCheckLedger'

// The fact-check ledger (docs/research/fact-check-2026-11/, method in its README.md).
// Countries whose profiles have been checked. Each stage adds its countries here, spelled as in cities.ts.
const CHECKED_COUNTRIES: string[] = ['Portugal', 'Spain', 'France', 'Italy', 'Ireland', 'United Kingdom', 'Netherlands', 'Germany', 'Switzerland', 'Austria', 'Malta', 'Greece', 'Cyprus', 'Croatia', 'Bulgaria', 'Hungary', 'Czech Republic', 'Turkey', 'Georgia', 'Montenegro', 'Albania', 'United Arab Emirates', 'South Africa', 'Mauritius']

const LEDGER_DIR = fileURLToPath(new URL('../../../docs/research/fact-check-2026-11/', import.meta.url))
const SHARED_FILE = 'shared.json'

function readJson(name: string): { file?: unknown; error?: string } {
  try {
    return { file: JSON.parse(readFileSync(join(LEDGER_DIR, name), 'utf8')) }
  } catch (e) {
    return { error: `${name}: not valid JSON (${(e as Error).message})` }
  }
}

const LEDGER_NAMES = existsSync(LEDGER_DIR) ? readdirSync(LEDGER_DIR).filter((n) => n.endsWith('.json')).sort() : []
const COUNTRY_NAMES = LEDGER_NAMES.filter((n) => n !== SHARED_FILE)

/** A ledger file typed for the later checks. A file that is not valid JSON, or has no claims list, loads
 *  as an empty one: the shape test reports it, and the later tests don't crash on it. */
const load = (name: string): LedgerFile => {
  const file = readJson(name).file as Partial<LedgerFile> | undefined
  if (!file || typeof file !== 'object' || !Array.isArray(file.claims)) return { country: '', claims: [] }
  return { ...file, country: String(file.country ?? ''), claims: file.claims.filter((c) => typeof c === 'object' && c !== null) }
}

const sharedVerdicts = (): Map<string, LedgerVerdict> => new Map(load(SHARED_FILE).claims.map((c) => [c.id, c.verdict]))

const profiledCitiesOf = (country: string): string[] => CITIES.filter((c) => c.country === country && hasProfile(c.id)).map((c) => c.id)

/** Fails with every problem on its own line, so a builder sees the whole list at once. */
const expectNone = (problems: string[]): void => expect(problems, `\n${problems.join('\n')}\n`).toEqual([])

const textOf = (cityId: string): string | undefined => {
  const profile = EXPAT_PROFILES[cityId]
  return profile ? profileText(profile) : undefined
}

describe('fact-check ledger files', () => {
  it('has shared.json', () => {
    expect(LEDGER_NAMES).toContain(SHARED_FILE)
  })

  it('every file parses, and every claim has a known fact, one of the three verdicts and a source read during the plan', () => {
    const problems: string[] = []
    for (const name of LEDGER_NAMES) {
      const { file, error } = readJson(name)
      if (error) problems.push(error)
      else problems.push(...fileProblems(file, name === SHARED_FILE ? 'shared' : 'country', name))
    }
    expectNone(problems)
  })

  it('uses each claim id once across the whole ledger', () => {
    const seen = new Map<string, string>()
    const problems: string[] = []
    for (const name of LEDGER_NAMES) {
      for (const claim of load(name).claims) {
        const first = seen.get(claim.id)
        if (first && first !== name) problems.push(`claim id "${claim.id}" is in both ${first} and ${name}`)
        seen.set(claim.id, name)
      }
    }
    expectNone(problems)
  })

  it('shared.json covers the US estate exemption, the US estate-treaty list, IBKR, Schwab International and EU PRIIPs', () => {
    expectNone(sharedTopicProblems(load(SHARED_FILE)))
  })

  it('lists every country file in CHECKED_COUNTRIES, so none escapes the coverage check', () => {
    const expected = CHECKED_COUNTRIES.map(ledgerFileName)
    expect(COUNTRY_NAMES.filter((n) => !expected.includes(n))).toEqual([])
  })

  it('CHECKED_COUNTRIES names countries that have profiled cities', () => {
    expect(CHECKED_COUNTRIES.filter((c) => profiledCitiesOf(c).length === 0)).toEqual([])
    expect(new Set(CHECKED_COUNTRIES).size).toBe(CHECKED_COUNTRIES.length)
  })

  it.each(CHECKED_COUNTRIES)('%s: a ledger file covers every profiled city and each of the five facts', (country) => {
    const name = ledgerFileName(country)
    expect(LEDGER_NAMES, `docs/research/fact-check-2026-11/${name} is missing: ${country} is in CHECKED_COUNTRIES but has no ledger file`).toContain(name)
    const file = load(name)
    expect(file.country).toBe(country)
    expectNone(coverageProblems(file, profiledCitiesOf(country)))
  })

  it('profiles carry the new wording of every corrected claim and none of the old, and the hedge of every kept cant-confirm claim', () => {
    const problems = COUNTRY_NAMES.flatMap((name) => load(name).claims.flatMap((claim) => wordingProblems(claim, textOf).map((p) => `${name}: ${p}`)))
    expectNone(problems)
  })

  it('every shared reference points at a shared.json claim', () => {
    const shared = sharedVerdicts()
    const problems = COUNTRY_NAMES.flatMap((name) => sharedRefProblems(load(name), shared).map((p) => `${name}: ${p}`))
    expectNone(problems)
  })
})

// The checks themselves, proven on small fixtures: each must pass good input and fail bad input.
describe('ledger checks on fixtures', () => {
  const source = { name: 'PwC: Testland, other taxes', url: 'https://example.org/testland/other-taxes', read: PLAN_START, says: 'There is no net wealth tax in Testland.' }
  const good: LedgerClaim = { id: 'tl-tax-wealth', fact: 'tax', cities: ['alpha', 'beta'], claim: 'No wealth tax', verdict: 'confirmed', sources: [source] }
  const CITIES_TL = ['alpha', 'beta']
  const country = (claims: unknown[], extra: Record<string, unknown> = {}) => ({ country: 'Testland', cities: CITIES_TL, claims, ...extra })
  const problemsOf = (claim: unknown) => claimProblems(claim, 'country', CITIES_TL)

  describe('check 1: claim shape', () => {
    it('passes a well-formed confirmed, corrected and cant-confirm claim', () => {
      expect(problemsOf(good)).toEqual([])
      expect(problemsOf({ ...good, verdict: 'corrected', oldWording: 'a 28% flat rate', newWording: 'a 30% flat rate', also: ['scores.tax 3→2'] })).toEqual([])
      expect(problemsOf({ ...good, verdict: 'cant-confirm', hedge: 'reportedly', wording: 'IBKR reportedly accepts Testland residents' })).toEqual([])
      expect(problemsOf({ ...good, verdict: 'cant-confirm', hedge: HEDGE_REMOVED, oldWording: 'a clause that was taken out' })).toEqual([])
      expect(fileProblems(country([good]), 'country', 'testland.json')).toEqual([])
    })

    it('rejects a pending or unknown verdict', () => {
      for (const verdict of ['pending', 'unchecked', 'Confirmed', '', undefined]) {
        expect(problemsOf({ ...good, verdict }).join('\n'), String(verdict)).toMatch(/verdict must be one of confirmed, corrected, cant-confirm/)
      }
    })

    it('rejects an unknown fact', () => {
      for (const fact of ['safety', 'climate', 'residency', undefined]) {
        expect(problemsOf({ ...good, fact }).join('\n'), String(fact)).toMatch(/fact must be one of tax, estate, lending, visa, healthcare/)
      }
    })

    it('rejects a claim with no source', () => {
      expect(problemsOf({ ...good, sources: [] }).join('\n')).toMatch(/needs at least one source/)
      expect(problemsOf({ ...good, sources: undefined }).join('\n')).toMatch(/needs at least one source/)
    })

    it('rejects a source without an http(s) url, a read date within the plan, or what the page says', () => {
      const withSource = (patch: Record<string, unknown>) => problemsOf({ ...good, sources: [{ ...source, ...patch }] }).join('\n')
      expect(withSource({ url: 'taxsummaries.pwc.com/testland' })).toMatch(/url must start with http/)
      expect(withSource({ url: 'ftp://example.org/x' })).toMatch(/url must start with http/)
      expect(withSource({ read: '2026-11-14' })).toMatch(/before the plan began/)
      expect(withSource({ read: '2026-11-06' })).toMatch(/before the plan began/)
      expect(withSource({ read: '15 Nov 2026' })).toMatch(/real ISO date/)
      expect(withSource({ read: '2026-13-01' })).toMatch(/real ISO date/)
      expect(withSource({ read: undefined })).toMatch(/real ISO date/)
      expect(withSource({ says: '  ' })).toMatch(/has no "says"/)
      expect(withSource({ name: '' })).toMatch(/has no name/)
      expect(withSource({ read: '2026-11-15' })).toBe('')
    })

    it('rejects a corrected claim without both wordings, and one whose new wording contains the old', () => {
      expect(problemsOf({ ...good, verdict: 'corrected', newWording: 'a 30% flat rate' }).join('\n')).toMatch(/needs oldWording/)
      expect(problemsOf({ ...good, verdict: 'corrected', oldWording: 'a 28% flat rate' }).join('\n')).toMatch(/needs newWording/)
      expect(problemsOf({ ...good, verdict: 'corrected', oldWording: 'flat rate', newWording: 'a 30% flat rate' }).join('\n')).toMatch(/newWording contains oldWording/)
    })

    it('rejects a cant-confirm claim without a hedge, without its wording, or whose wording lacks the hedge', () => {
      expect(problemsOf({ ...good, verdict: 'cant-confirm' }).join('\n')).toMatch(/needs hedge/)
      expect(problemsOf({ ...good, verdict: 'cant-confirm', hedge: 'reportedly' }).join('\n')).toMatch(/needs wording/)
      expect(problemsOf({ ...good, verdict: 'cant-confirm', hedge: 'reportedly', wording: 'IBKR accepts Testland residents' }).join('\n')).toMatch(/does not contain the hedge/)
      expect(problemsOf({ ...good, verdict: 'cant-confirm', hedge: HEDGE_REMOVED }).join('\n')).toMatch(/removed claim needs oldWording/)
    })

    it('rejects cities outside the file, misspelt fields and a wrong file name', () => {
      expect(problemsOf({ ...good, cities: ['alpha', 'gamma'] }).join('\n')).toMatch(/city "gamma" is not in this file's cities/)
      expect(problemsOf({ ...good, cities: [] }).join('\n')).toMatch(/cities must list/)
      expect(problemsOf({ ...good, oldwording: 'x' }).join('\n')).toMatch(/unknown field "oldwording"/)
      expect(problemsOf({ ...good, oldWording: 'x' }).join('\n')).toMatch(/oldWording does not belong on a confirmed claim/)
      expect(fileProblems(country([good]), 'country', 'test-land.json').join('\n')).toMatch(/must be named testland\.json/)
      expect(fileProblems(country([good, good]), 'country', 'testland.json').join('\n')).toMatch(/used twice/)
      expect(fileProblems(country([]), 'country', 'testland.json').join('\n')).toMatch(/claims is empty/)
    })

    it('holds shared.json to its own shape: a topic, appliesTo and no cities', () => {
      const shared = { id: 'us-estate-exemption-2026', topic: 'us-estate-exemption', fact: 'estate', appliesTo: 'every estate fact', claim: 'x', verdict: 'confirmed', sources: [source] }
      expect(claimProblems(shared, 'shared')).toEqual([])
      expect(claimProblems({ ...shared, topic: 'brokers' }, 'shared').join('\n')).toMatch(/topic must be one of/)
      expect(claimProblems({ ...shared, appliesTo: undefined }, 'shared').join('\n')).toMatch(/appliesTo is empty/)
      expect(claimProblems({ ...shared, cities: ['alpha'] }, 'shared').join('\n')).toMatch(/unknown field "cities"/)
      expect(claimProblems({ ...shared, verdict: 'corrected' }, 'shared').join('\n')).toMatch(/needs oldWording/)
      expect(fileProblems({ country: 'shared', claims: [shared] }, 'shared', 'shared.json')).toEqual([])
      expect(fileProblems({ country: 'Shared', claims: [shared] }, 'shared', 'shared.json').join('\n')).toMatch(/country must be "shared"/)
    })

    it('knows a real ISO date from a look-alike', () => {
      expect(isIsoDate('2026-11-15')).toBe(true)
      expect(isIsoDate('2026-02-30')).toBe(false)
      expect(isIsoDate('2026-11-5')).toBe(false)
      expect(isIsoDate(20261115)).toBe(false)
    })
  })

  describe('check 2: shared topics', () => {
    it('names each missing topic', () => {
      const claim = (topic: string) => ({ ...good, cities: undefined, topic }) as unknown as LedgerClaim
      expect(sharedTopicProblems({ country: 'shared', claims: SHARED_TOPICS.map(claim) })).toEqual([])
      expect(sharedTopicProblems({ country: 'shared', claims: [claim('ibkr'), claim('priips')] })).toEqual([
        'shared.json has no claim with topic "us-estate-exemption"',
        'shared.json has no claim with topic "us-estate-treaty"',
        'shared.json has no claim with topic "schwab"',
      ])
    })
  })

  describe('check 3: coverage', () => {
    const all = (['tax', 'estate', 'lending', 'visa', 'healthcare'] as const).map((fact) => ({ ...good, id: `tl-${fact}`, fact }))

    it('passes when every city × fact has a claim', () => {
      expect(coverageProblems(country(all) as LedgerFile, CITIES_TL)).toEqual([])
    })

    it('names the missing city × fact, a missing city and a city that is not the country\'s', () => {
      const thin = all.map((c) => (c.fact === 'visa' ? { ...c, cities: ['alpha'] } : c))
      expect(coverageProblems(country(thin) as LedgerFile, CITIES_TL)).toEqual(['Testland: no claim for beta × visa'])
      expect(coverageProblems(country(all.slice(1)) as LedgerFile, CITIES_TL)).toEqual(['Testland: no claim for alpha × tax', 'Testland: no claim for beta × tax'])
      expect(coverageProblems(country(all) as LedgerFile, ['alpha', 'beta', 'gamma']).join('\n')).toMatch(/profiled city "gamma" is missing from cities/)
      expect(coverageProblems(country(all) as LedgerFile, ['alpha']).join('\n')).toMatch(/"beta" is not a profiled city of Testland/)
    })
  })

  describe('check 4: profile wording', () => {
    const texts: Record<string, string> = {
      alpha: 'No wealth tax; dividends pay a 30% flat rate; IBKR reportedly accepts Testland residents.',
      beta: 'No wealth tax; dividends pay a 28% flat rate.',
    }
    const lookup = (id: string): string | undefined => texts[id]
    const corrected: LedgerClaim = { ...good, id: 'tl-tax-dividends', verdict: 'corrected', oldWording: 'a 28% flat rate', newWording: 'a 30% flat rate' }

    it('passes when the old wording is gone and the new is in every listed city', () => {
      expect(wordingProblems({ ...corrected, cities: ['alpha'] }, lookup)).toEqual([])
    })

    it('fails when a listed city still carries the old wording or lacks the new', () => {
      expect(wordingProblems(corrected, lookup)).toEqual([
        'tl-tax-dividends: beta still carries the old wording "a 28% flat rate"',
        'tl-tax-dividends: beta does not carry the new wording "a 30% flat rate"',
      ])
    })

    it('fails when a kept cant-confirm claim\'s hedged wording is not in a listed city, and passes a removed one', () => {
      const kept: LedgerClaim = { ...good, id: 'tl-lending-ibkr', fact: 'lending', verdict: 'cant-confirm', hedge: 'reportedly', wording: 'IBKR reportedly accepts Testland residents' }
      expect(wordingProblems({ ...kept, cities: ['alpha'] }, lookup)).toEqual([])
      expect(wordingProblems(kept, lookup)).toEqual(['tl-lending-ibkr: beta does not carry the hedged wording "IBKR reportedly accepts Testland residents"'])
      const removed: LedgerClaim = { ...good, id: 'tl-lending-margin', fact: 'lending', verdict: 'cant-confirm', hedge: HEDGE_REMOVED, oldWording: 'margin is offered to residents' }
      expect(wordingProblems(removed, lookup)).toEqual([])
      expect(wordingProblems({ ...removed, oldWording: 'a 28% flat rate' }, lookup)).toEqual(['tl-lending-margin: beta still carries the old wording "a 28% flat rate"'])
    })

    it('fails when a listed city has no profile', () => {
      expect(wordingProblems({ ...corrected, cities: ['gamma'] }, lookup)).toEqual(['tl-tax-dividends: no profile found for "gamma"'])
    })

    it('matches the text a reader sees, apostrophes unescaped', () => {
      const profile = EXPAT_PROFILES.algarve
      expect(profileText(profile)).toContain(profile.facts.tax)
      expect(profileText(profile)).toContain("IBKR's EU entity reportedly lends on margin only to buy securities")
    })
  })

  describe('check 5: shared references', () => {
    const shared = new Map<string, LedgerVerdict>([
      ['us-estate-exemption-2026', 'confirmed'],
      ['schwab-accepts-residents', 'cant-confirm'],
    ])
    const file = (claim: Partial<LedgerClaim>) => country([{ ...good, ...claim }]) as LedgerFile

    it('passes a reference to an existing shared claim', () => {
      expect(sharedRefProblems(file({ shared: 'us-estate-exemption-2026' }), shared)).toEqual([])
      expect(sharedRefProblems(file({}), shared)).toEqual([])
    })

    it('fails a reference to an id that is not in shared.json', () => {
      expect(sharedRefProblems(file({ shared: 'us-estate-exemption' }), shared)).toEqual(['tl-tax-wealth: shared "us-estate-exemption" is not a claim id in shared.json'])
    })

    it('fails a confirmed instance resting on a shared claim that is not confirmed', () => {
      expect(sharedRefProblems(file({ shared: 'schwab-accepts-residents' }), shared)).toEqual([
        'tl-tax-wealth: marked confirmed, but shared claim "schwab-accepts-residents" is cant-confirm',
      ])
      expect(sharedRefProblems(file({ shared: 'schwab-accepts-residents', verdict: 'cant-confirm' }), shared)).toEqual([])
    })
  })
})
