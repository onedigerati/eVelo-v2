import { readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { EXPAT_PICKS, EXPAT_SCORE_RUBRIC, expatPickFor, profileFor } from '../expatPicks'
import type { LedgerClaim, LedgerFile } from './factCheckLedger'

// The pick reasons plan (2026-11-15): the fact check's rank flags were resolved by rewriting the
// picks' `why` lines (and Nice's summary), keeping the ranks. See docs/research/fact-check-2026-11/README.md.

const LEDGER_DIR = fileURLToPath(new URL('../../../docs/research/fact-check-2026-11/', import.meta.url))

function flaggedClaims(): LedgerClaim[] {
  return readdirSync(LEDGER_DIR)
    .filter((f) => f.endsWith('.json'))
    .flatMap((f) => (JSON.parse(readFileSync(LEDGER_DIR + f, 'utf8')) as LedgerFile).claims)
    .filter((c) => c.rankFlag !== undefined)
}

/** Every "double-quoted" span in a resolution: the new wording it quotes. */
function quotes(text: string): string[] {
  return [...text.matchAll(/"([^"]+)"/g)].map((m) => m[1])
}

/** The shared phrase every lending-2 pick's `why` carries. */
const BORROW_WARNING = 'borrowing cash against the portfolio is reportedly blocked for residents'

/** The ranked 75 as city ids, pinned from HEAD before this plan: the rewrite must not reorder them. */
const RANKED_IDS = [
  'algarve', 'lisbon', 'paphos', 'panama-city', 'boquete', 'kuala-lumpur', 'porto', 'cascais', 'malaga', 'madrid',
  'athens', 'penang', 'crete', 'tavira', 'valencia', 'madeira', 'montevideo', 'limassol', 'sliema', 'grand-baie',
  'antalya', 'antigua-guatemala', 'tbilisi', 'san-jose-cr', 'lake-chapala', 'chiang-mai', 'bangkok', 'merida', 'hua-hin', 'coronado',
  'atenas', 'alicante', 'torrevieja', 'phuket', 'puerto-vallarta', 'san-miguel-de-allende', 'la-paz', 'kotor', 'cayo', 'hopkins',
  'corozal', 'santiago', 'prague', 'plovdiv', 'istanbul', 'mexico-city', 'budapest', 'chiang-rai', 'taipei', 'asuncion',
  'lima', 'oaxaca', 'las-terrenas', 'medellin', 'florence', 'playa-del-carmen', 'cuenca', 'nice', 'roatan', 'sarande',
  'langkawi', 'volcan', 'panajachel', 'placencia', 'ambergris-caye', 'split', 'batumi', 'gascony', 'rome', 'tarragona',
  'barcelona', 'cartagena', 'mazatlan', 'bali', 'vienna',
]

/** Wording the rank flags found wrong or out of date, by city: none may come back. */
const OLD_PHRASES: Record<string, string[]> = {
  vienna: ['unregistered funds'],
  tbilisi: ['there is no US tax treaty'],
  roatan: ['the island\'s public hospital burned in 2024'],
  sliema: ['only IBKR is known to serve residents'],
  asuncion: ['residency means test are unverified', 'healthcare and the residency means test'],
  tavira: ['30 to 40 minutes away', 'accredited CUF Faro hospital'],
  florence: ['A good elective-residence visa', '26% on dividends rank it low'],
  rome: ['26% on dividends rank it low'],
  'las-terrenas': ['Schwab International is unavailable'],
  santiago: ['foreigners\' assets abroad fall outside inheritance tax'],
  antalya: ['with 1% inheritance tax'],
  split: ['Croatia\'s taxes suit BBD'],
  budapest: ['a €250k fund investment gives residence, but dividends'],
}
/** Old summary wording, by city. */
const OLD_SUMMARY_PHRASES: Record<string, string[]> = {
  nice: ['ranks last of the 50'],
}

describe('pick reasons: rank flags resolved', () => {
  const flagged = flaggedClaims()

  it('finds the flags (25 from the fact check, plus Las Terrenas and Santiago from its question 2)', () => {
    expect(flagged.length).toBe(27)
  })

  it('every rank-flagged claim records how it was resolved', () => {
    const missing = flagged.filter((c) => typeof c.rankResolved !== 'string' || c.rankResolved.trim() === '').map((c) => c.id)
    expect(missing).toEqual([])
  })

  it('the wording each resolution quotes is in the pick\'s why, its summary or the rubric', () => {
    const problems: string[] = []
    for (const c of flagged) {
      const qs = quotes(c.rankResolved ?? '')
      if (qs.length === 0) problems.push(`${c.id}: quotes no new wording`)
      // A country claim is checked against its own cities; a shared claim against every pick.
      const cities = c.cities ?? EXPAT_PICKS.map((p) => p.cityId)
      const corpus = [
        EXPAT_SCORE_RUBRIC.lending,
        ...cities.flatMap((id) => [expatPickFor(id)?.why ?? '', profileFor(id)?.summary ?? '']),
      ]
      for (const q of qs) if (!corpus.some((t) => t.includes(q))) problems.push(`${c.id}: "${q}" not found`)
    }
    expect(problems).toEqual([])
  })

  it('the flagged old wording is gone', () => {
    const left: string[] = []
    for (const [id, phrases] of Object.entries(OLD_PHRASES)) {
      const why = expatPickFor(id)?.why
      expect(why, id).toBeDefined()
      for (const p of phrases) if (why!.includes(p)) left.push(`${id} why: ${p}`)
    }
    for (const [id, phrases] of Object.entries(OLD_SUMMARY_PHRASES)) {
      const summary = profileFor(id)?.summary
      expect(summary, id).toBeDefined()
      for (const p of phrases) if (summary!.includes(p)) left.push(`${id} summary: ${p}`)
    }
    expect(left).toEqual([])
  })

  it('Nice\'s summary gives its real rank', () => {
    expect(profileFor('nice')?.summary).toContain(`${RANKED_IDS.indexOf('nice') + 1}th of the 75`)
  })
})

describe('pick reasons: borrow warning', () => {
  it('every ranked pick that scores lending 2 says the borrow step is in doubt, and no other pick does', () => {
    const lending2 = EXPAT_PICKS.filter((p) => p.profile?.scores.lending === 2)
    expect(lending2.length).toBeGreaterThan(20)
    expect(lending2.filter((p) => !p.why.includes(BORROW_WARNING)).map((p) => p.cityId)).toEqual([])
    const others = EXPAT_PICKS.filter((p) => p.profile?.scores.lending !== 2 && p.why.includes(BORROW_WARNING))
    expect(others.map((p) => p.cityId)).toEqual([])
  })
})

describe('pick reasons: ranks kept', () => {
  it('the ranked 75 keep their order', () => {
    expect(EXPAT_PICKS.map((p) => p.cityId)).toEqual(RANKED_IDS)
    expect(EXPAT_PICKS.map((p) => p.rank)).toEqual(RANKED_IDS.map((_, i) => i + 1))
  })

  it('every why is still one sentence', () => {
    for (const p of EXPAT_PICKS) {
      expect(p.why, p.cityId).toMatch(/\.$/)
      expect(p.why.slice(0, -1), p.cityId).not.toMatch(/\.\s/)
    }
  })
})
