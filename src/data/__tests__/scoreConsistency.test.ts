import { describe, expect, it } from 'vitest'
import { CITIES } from '../cities'
import { EXPAT_PROFILES, type ExpatScoreKey } from '../expatPicks'

// Scores on one scale (fact-check plan, stage 8). Tax, estate, lending and residency are country-level
// rules, so every profiled city in a country scores them alike; in the United States, tax and estate are
// state rules, so cities in one state share those two instead. A city may differ only through an
// exception listed below, which names the region or city rule behind it and the words in the city's own
// fact that say so.

/** State of each profiled US city (cities.ts has no state field). */
const US_STATE: Record<string, string> = {
  asheville: 'NC', atlanta: 'GA', austin: 'TX', boise: 'ID', boston: 'MA', charlotte: 'NC', chicago: 'IL',
  dallas: 'TX', denver: 'CO', honolulu: 'HI', houston: 'TX', 'kansas-city': 'MO', 'las-vegas': 'NV',
  'los-angeles': 'CA', miami: 'FL', minneapolis: 'MN', nashville: 'TN', 'new-york': 'NY', orlando: 'FL',
  philadelphia: 'PA', phoenix: 'AZ', pittsburgh: 'PA', portland: 'OR', raleigh: 'NC', 'salt-lake-city': 'UT',
  'san-diego': 'CA', 'san-francisco': 'CA', sarasota: 'FL', scottsdale: 'AZ', seattle: 'WA', 'st-louis': 'MO',
  tampa: 'FL', 'washington-dc': 'DC',
}

type Fact = Extract<ExpatScoreKey, 'tax' | 'estate' | 'lending' | 'visa'>

interface Exception {
  fact: Fact
  /** The cities that score apart from the rest of their country or state, as one group. */
  cities: string[]
  /** Why: the region or city rule. */
  why: string
  /** Words each of those cities' own fact must contain, so the profile says why. */
  says: string
}

const SCORE_EXCEPTIONS: Exception[] = [
  {
    fact: 'tax',
    cities: ['barcelona', 'tarragona'],
    why: "Catalonia's own wealth tax from €500k (1), against the Valencian €2M exemption and the Madrid and Andalusia reliefs (2)",
    says: 'Catalonia',
  },
  {
    fact: 'visa',
    cities: ['montreal'],
    why: "Quebec's Investor Program, open but for CAD 2M, French and management experience (2), is a route only for people who settle in Quebec; Toronto and Vancouver have none (1)",
    says: "Quebec's Investor Program",
  },
  {
    fact: 'tax',
    cities: ['philadelphia'],
    why: "Philadelphia's School Income Tax (3.735%) on residents' dividends takes them to about 6.8% (4); Pittsburgh's earned-income tax does not reach investment income (5)",
    says: 'School Income Tax',
  },
]

const COUNTRY_FACTS: Fact[] = ['tax', 'estate', 'lending', 'visa']
const US_COUNTRY_FACTS: Fact[] = ['lending', 'visa']
const US_STATE_FACTS: Fact[] = ['tax', 'estate']

const profiled = CITIES.filter((c) => EXPAT_PROFILES[c.id])

/** The group a city's score must agree with: its country (or US state), split off by any listed exception. */
function groupOf(cityId: string, scope: string, fact: Fact): string {
  const ex = SCORE_EXCEPTIONS.find((e) => e.fact === fact && e.cities.includes(cityId))
  return ex ? `${scope} / ${ex.cities.join('+')}` : scope
}

function disagreements(facts: Fact[], scopeOf: (cityId: string) => string | undefined): string[] {
  const out: string[] = []
  for (const fact of facts) {
    const groups = new Map<string, { id: string; score: number }[]>()
    for (const c of profiled) {
      const scope = scopeOf(c.id)
      if (!scope) continue
      const key = groupOf(c.id, scope, fact)
      groups.set(key, [...(groups.get(key) ?? []), { id: c.id, score: EXPAT_PROFILES[c.id].scores[fact] }])
    }
    for (const [key, members] of groups) {
      if (new Set(members.map((m) => m.score)).size > 1) {
        out.push(`${key}: ${fact} scores differ (${members.map((m) => `${m.id} ${m.score}`).join(', ')}); align them or list an exception`)
      }
    }
  }
  return out
}

const expectNone = (problems: string[]): void => expect(problems, `\n${problems.join('\n')}\n`).toEqual([])

describe('scores on one scale across profiles', () => {
  it('knows the state of every profiled US city', () => {
    const us = profiled.filter((c) => c.country === 'United States').map((c) => c.id).sort()
    expect(Object.keys(US_STATE).sort()).toEqual(us)
  })

  it('gives cities in one country the same tax, estate, lending and residency scores, unless an exception is listed', () => {
    expectNone(disagreements(COUNTRY_FACTS, (id) => {
      const c = profiled.find((x) => x.id === id)!
      return c.country === 'United States' ? undefined : c.country
    }))
  })

  it('gives every US city the same lending and residency scores', () => {
    expectNone(disagreements(US_COUNTRY_FACTS, (id) => (US_STATE[id] ? 'United States' : undefined)))
  })

  it('gives cities in one US state the same tax and estate scores, unless an exception is listed', () => {
    expectNone(disagreements(US_STATE_FACTS, (id) => (US_STATE[id] ? `US ${US_STATE[id]}` : undefined)))
  })

  it('lists only exceptions that are still needed, and each excepted city says why in its own fact', () => {
    const problems: string[] = []
    for (const ex of SCORE_EXCEPTIONS) {
      const first = profiled.find((c) => c.id === ex.cities[0])
      if (!first) {
        problems.push(`${ex.cities.join('+')}: not a profiled city`)
        continue
      }
      const peers = profiled.filter((c) =>
        first.country === 'United States'
          ? US_STATE[c.id] === US_STATE[first.id] && !ex.cities.includes(c.id)
          : c.country === first.country && !ex.cities.includes(c.id),
      )
      if (peers.length === 0) problems.push(`${ex.cities.join('+')} ${ex.fact}: no other city in its country or state to differ from`)
      const own = new Set(ex.cities.map((id) => EXPAT_PROFILES[id]?.scores[ex.fact]))
      const theirs = new Set<number>(peers.map((c) => EXPAT_PROFILES[c.id].scores[ex.fact]))
      if ([...own].some((s) => s !== undefined && theirs.has(s))) {
        problems.push(`${ex.cities.join('+')} ${ex.fact}: scores the same as the rest, so the exception is no longer needed`)
      }
      for (const id of ex.cities) {
        const text = EXPAT_PROFILES[id]?.facts[ex.fact] ?? ''
        if (!text.includes(ex.says)) problems.push(`${id} ${ex.fact}: the fact does not say "${ex.says}"`)
      }
      if (ex.why.trim().length === 0) problems.push(`${ex.cities.join('+')} ${ex.fact}: no reason given`)
    }
    expectNone(problems)
  })
})
