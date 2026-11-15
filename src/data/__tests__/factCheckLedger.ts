// Checks for the fact-check ledger in docs/research/fact-check-2026-11/ (method: its README.md).
// Pure functions, so factCheck.test.ts can run them on the real ledger and on small bad fixtures.
// Each returns a list of problems in plain words; an empty list means the check passes.

export const LEDGER_FACTS = ['tax', 'estate', 'lending', 'visa', 'healthcare'] as const
export type LedgerFact = (typeof LEDGER_FACTS)[number]

export const LEDGER_VERDICTS = ['confirmed', 'corrected', 'cant-confirm'] as const
export type LedgerVerdict = (typeof LEDGER_VERDICTS)[number]

/** Topics shared.json must cover, one claim or more each. */
export const SHARED_TOPICS = ['us-estate-exemption', 'us-estate-treaty', 'ibkr', 'schwab', 'priips'] as const
export type SharedTopic = (typeof SHARED_TOPICS)[number]

/** First day of the plan: a source read before it does not count. */
export const PLAN_START = '2026-11-15'

/** `hedge` value for a can't-confirm claim that was taken out of the profile. */
export const HEDGE_REMOVED = 'removed'

export interface LedgerSource {
  name: string
  url: string
  /** ISO date the page was read, on or after PLAN_START. */
  read: string
  /** What the page says on this point, close to its words. */
  says: string
}

export interface LedgerClaim {
  id: string
  fact: LedgerFact
  /** Country files only: which of the file's cities make this claim. */
  cities?: string[]
  claim: string
  verdict: LedgerVerdict
  /** Country files only: id of the shared.json claim this instance rests on. */
  shared?: string
  /** shared.json only. */
  topic?: SharedTopic
  /** shared.json only: which profiles carry the claim. */
  appliesTo?: string
  oldWording?: string
  newWording?: string
  hedge?: string
  wording?: string
  sources: LedgerSource[]
  also?: string[]
  modelMismatch?: string
  rankFlag?: string
  note?: string
}

export interface LedgerFile {
  /** A country name as in src/data/cities.ts, or "shared". */
  country: string
  /** Country files only: the city ids this file covers. */
  cities?: string[]
  claims: LedgerClaim[]
}

export type LedgerKind = 'country' | 'shared'

const COUNTRY_CLAIM_KEYS = [
  'id', 'fact', 'cities', 'claim', 'verdict', 'shared', 'oldWording', 'newWording', 'hedge', 'wording',
  'sources', 'also', 'modelMismatch', 'rankFlag', 'note',
]
const SHARED_CLAIM_KEYS = [
  'id', 'topic', 'fact', 'appliesTo', 'claim', 'verdict', 'oldWording', 'newWording', 'hedge', 'wording',
  'sources', 'also', 'modelMismatch', 'rankFlag', 'note',
]
const SOURCE_KEYS = ['name', 'url', 'read', 'says']

const ID = /^[a-z0-9]+(-[a-z0-9]+)*$/
const HTTP = /^https?:\/\/\S+$/
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)
const isText = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0
const isTextList = (v: unknown): v is string[] => Array.isArray(v) && v.length > 0 && v.every(isText)
const oneOf = (list: readonly string[], v: unknown): boolean => typeof v === 'string' && list.includes(v)

/** True for a real calendar date written YYYY-MM-DD. */
export function isIsoDate(v: unknown): v is string {
  if (typeof v !== 'string' || !ISO_DATE.test(v)) return false
  const d = new Date(`${v}T00:00:00Z`)
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v
}

/** File name for a country's ledger: "Czech Republic" → "czech-republic.json". */
export function ledgerFileName(country: string): string {
  return `${country.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}.json`
}

/** The text a wording is matched against: every string a reader sees in the profile, plus its sources.
 *  Matching the loaded profile rather than the .ts file means apostrophes are written plainly. */
export function profileText(profile: {
  tagline: string
  summary: string
  facts: object
  drawbacks: string[]
  sources: { name: string; url: string }[]
}): string {
  const facts = Object.values(profile.facts).filter((v): v is string => typeof v === 'string')
  return [profile.tagline, profile.summary, ...facts, ...profile.drawbacks, ...profile.sources.map((s) => `${s.name} ${s.url}`)].join('\n')
}

function sourceProblems(source: unknown, where: string): string[] {
  if (!isRecord(source)) return [`${where}: a source must be an object with name, url, read and says`]
  const out: string[] = []
  for (const key of Object.keys(source)) if (!SOURCE_KEYS.includes(key)) out.push(`${where}: unknown source field "${key}"`)
  if (!isText(source.name)) out.push(`${where}: source has no name`)
  if (typeof source.url !== 'string' || !HTTP.test(source.url)) out.push(`${where}: source url must start with http:// or https:// (got ${JSON.stringify(source.url)})`)
  if (!isIsoDate(source.read)) out.push(`${where}: source read date must be a real ISO date, YYYY-MM-DD (got ${JSON.stringify(source.read)})`)
  else if (source.read < PLAN_START) out.push(`${where}: source was read on ${source.read}, before the plan began (${PLAN_START}); re-read the page`)
  if (!isText(source.says)) out.push(`${where}: source has no "says" (what the page says on this point)`)
  return out
}

/** Check 1: one claim's shape. `fileCities` is the country file's `cities` (ignored for shared.json). */
export function claimProblems(claim: unknown, kind: LedgerKind, fileCities: readonly string[] = []): string[] {
  if (!isRecord(claim)) return ['a claim must be an object']
  const where = isText(claim.id) ? claim.id : '(claim without id)'
  const out: string[] = []
  const add = (msg: string) => out.push(`${where}: ${msg}`)

  const allowed = kind === 'shared' ? SHARED_CLAIM_KEYS : COUNTRY_CLAIM_KEYS
  for (const key of Object.keys(claim)) if (!allowed.includes(key)) add(`unknown field "${key}" in a ${kind} claim`)

  if (!isText(claim.id) || !ID.test(claim.id)) add(`id must be lower-case words joined by hyphens (got ${JSON.stringify(claim.id)})`)
  if (!oneOf(LEDGER_FACTS, claim.fact)) add(`fact must be one of ${LEDGER_FACTS.join(', ')} (got ${JSON.stringify(claim.fact)})`)
  if (!isText(claim.claim)) add('claim text is empty')
  if (!oneOf(LEDGER_VERDICTS, claim.verdict)) add(`verdict must be one of ${LEDGER_VERDICTS.join(', ')} (got ${JSON.stringify(claim.verdict)})`)

  if (!Array.isArray(claim.sources) || claim.sources.length === 0) add('needs at least one source that was read during the plan')
  else claim.sources.forEach((s, i) => out.push(...sourceProblems(s, `${where} source ${i + 1}`)))

  if (kind === 'country') {
    if (!isTextList(claim.cities)) add('cities must list the city ids that make this claim')
    else {
      for (const id of claim.cities) if (!fileCities.includes(id)) add(`city "${id}" is not in this file's cities`)
      if (new Set(claim.cities).size !== claim.cities.length) add('cities lists a city twice')
    }
    if (claim.shared !== undefined && !isText(claim.shared)) add('shared must be the id of a shared.json claim')
  } else {
    if (!oneOf(SHARED_TOPICS, claim.topic)) add(`topic must be one of ${SHARED_TOPICS.join(', ')} (got ${JSON.stringify(claim.topic)})`)
    if (!isText(claim.appliesTo)) add('appliesTo is empty (say which profiles carry the claim)')
  }

  const { verdict } = claim
  if (verdict === 'corrected') {
    if (!isText(claim.oldWording)) add('a corrected claim needs oldWording (the exact text that was in the profile)')
    if (!isText(claim.newWording)) add('a corrected claim needs newWording (the exact text now in the profile)')
    if (isText(claim.oldWording) && isText(claim.newWording) && claim.newWording.includes(claim.oldWording)) {
      add('newWording contains oldWording, so the old text can never be gone; quote a longer oldWording')
    }
    if (claim.hedge !== undefined || claim.wording !== undefined) add('hedge and wording belong to cant-confirm claims only')
  } else if (verdict === 'cant-confirm') {
    if (!isText(claim.hedge)) add(`a cant-confirm claim needs hedge: the hedging words the profile carries, or "${HEDGE_REMOVED}"`)
    if (claim.newWording !== undefined) add('newWording belongs to corrected claims only')
    if (kind === 'country' && isText(claim.hedge)) {
      if (claim.hedge === HEDGE_REMOVED) {
        if (!isText(claim.oldWording)) add('a removed claim needs oldWording (the exact text taken out), so the test can see it is gone')
        if (claim.wording !== undefined) add('a removed claim has no wording')
      } else {
        if (!isText(claim.wording)) add('a kept cant-confirm claim needs wording (the exact profile text that carries the hedge)')
        else if (!claim.wording.toLowerCase().includes(claim.hedge.toLowerCase())) add(`wording does not contain the hedge "${claim.hedge}"`)
      }
    }
  } else if (verdict === 'confirmed') {
    for (const key of ['oldWording', 'newWording', 'hedge', 'wording']) {
      if (claim[key] !== undefined) add(`${key} does not belong on a confirmed claim`)
    }
  }

  if (claim.also !== undefined && !isTextList(claim.also)) add('also must be a list of short notes')
  for (const key of ['modelMismatch', 'rankFlag', 'note']) {
    if (claim[key] !== undefined && !isText(claim[key])) add(`${key} must be text when present`)
  }
  return out
}

/** Check 1 for a whole file: its header, then every claim. `name` is the file name, for messages. */
export function fileProblems(file: unknown, kind: LedgerKind, name: string): string[] {
  if (!isRecord(file)) return [`${name}: must be a JSON object with country and claims`]
  const out: string[] = []
  for (const key of Object.keys(file)) if (!['country', 'cities', 'claims'].includes(key)) out.push(`${name}: unknown field "${key}"`)

  let cities: string[] = []
  if (kind === 'shared') {
    if (file.country !== 'shared') out.push(`${name}: country must be "shared"`)
    if (file.cities !== undefined) out.push(`${name}: shared.json has no cities`)
  } else {
    if (!isText(file.country)) out.push(`${name}: country is empty`)
    else if (ledgerFileName(file.country) !== name) out.push(`${name}: a file for "${file.country}" must be named ${ledgerFileName(file.country)}`)
    if (!isTextList(file.cities)) out.push(`${name}: cities must list the city ids this file covers`)
    else cities = file.cities
  }

  if (!Array.isArray(file.claims) || file.claims.length === 0) return [...out, `${name}: claims is empty`]
  const seen = new Set<string>()
  for (const claim of file.claims) {
    out.push(...claimProblems(claim, kind, cities).map((p) => `${name}: ${p}`))
    if (isRecord(claim) && isText(claim.id)) {
      if (seen.has(claim.id)) out.push(`${name}: claim id "${claim.id}" is used twice`)
      seen.add(claim.id)
    }
  }
  return out
}

/** Check 2: shared.json holds a claim or more for each shared topic. */
export function sharedTopicProblems(file: LedgerFile): string[] {
  const topics = new Set(file.claims.map((c) => c.topic))
  return SHARED_TOPICS.filter((t) => !topics.has(t)).map((t) => `shared.json has no claim with topic "${t}"`)
}

/** Check 3: the file's cities are exactly the country's profiled cities, and every city × fact has a claim. */
export function coverageProblems(file: LedgerFile, expectedCities: readonly string[]): string[] {
  const out: string[] = []
  const listed = file.cities ?? []
  for (const id of expectedCities) if (!listed.includes(id)) out.push(`${file.country}: profiled city "${id}" is missing from cities`)
  for (const id of listed) if (!expectedCities.includes(id)) out.push(`${file.country}: "${id}" is not a profiled city of ${file.country}`)
  for (const id of expectedCities) {
    for (const fact of LEDGER_FACTS) {
      if (!file.claims.some((c) => c.fact === fact && (c.cities ?? []).includes(id))) out.push(`${file.country}: no claim for ${id} × ${fact}`)
    }
  }
  return out
}

/** Check 4: the profiles carry what the ledger says they carry. `textOf(cityId)` returns the profile's
 *  text (see profileText), or undefined when the city has no profile. */
export function wordingProblems(claim: LedgerClaim, textOf: (cityId: string) => string | undefined): string[] {
  const out: string[] = []
  for (const city of claim.cities ?? []) {
    const text = textOf(city)
    if (text === undefined) {
      out.push(`${claim.id}: no profile found for "${city}"`)
      continue
    }
    if (claim.oldWording && (claim.verdict === 'corrected' || claim.verdict === 'cant-confirm') && text.includes(claim.oldWording)) {
      out.push(`${claim.id}: ${city} still carries the old wording "${claim.oldWording}"`)
    }
    if (claim.verdict === 'corrected' && claim.newWording && !text.includes(claim.newWording)) {
      out.push(`${claim.id}: ${city} does not carry the new wording "${claim.newWording}"`)
    }
    if (claim.verdict === 'cant-confirm' && claim.hedge !== HEDGE_REMOVED && claim.wording && !text.includes(claim.wording)) {
      out.push(`${claim.id}: ${city} does not carry the hedged wording "${claim.wording}"`)
    }
  }
  return out
}

/** Check 5: every `shared` reference points at a shared.json claim, and an instance is not marked
 *  confirmed when the shared claim it rests on is not. */
export function sharedRefProblems(file: LedgerFile, shared: ReadonlyMap<string, LedgerVerdict>): string[] {
  const out: string[] = []
  for (const claim of file.claims) {
    if (claim.shared === undefined) continue
    const verdict = shared.get(claim.shared)
    if (verdict === undefined) out.push(`${claim.id}: shared "${claim.shared}" is not a claim id in shared.json`)
    else if (claim.verdict === 'confirmed' && verdict !== 'confirmed') {
      out.push(`${claim.id}: marked confirmed, but shared claim "${claim.shared}" is ${verdict}`)
    }
  }
  return out
}
