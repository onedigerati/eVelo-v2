// Writes the mechanical parts of docs/research/fact-check-2026-11/what-changed.md from the ledger.
//
//   node scripts/fact-check-report.mjs
//
// Everything between the report's `<!-- generated:<name> -->` and `<!-- /generated:<name> -->`
// markers is replaced; the prose around them is left alone. Sources: the ledger's country files and
// shared.json, src/data/cities.ts (city names, regions) and each profile's scores now and at the
// commit before the fact check began (BASE), read with `git show`.

import { execFileSync } from 'node:child_process'
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const LEDGER = join(ROOT, 'docs/research/fact-check-2026-11')
const REPORT = join(LEDGER, 'what-changed.md')
/** The commit that started the fact-check plan, before any profile was checked. */
const BASE = '7f833cf'
const FACTS = ['tax', 'estate', 'lending', 'visa', 'healthcare']
const FACT_LABEL = { tax: 'Tax', estate: 'Estate', lending: 'Lending', visa: 'Residency', healthcare: 'Healthcare' }
const VERDICTS = ['confirmed', 'corrected', 'cant-confirm']
const REGION_ORDER = ['Europe', 'Middle East', 'Africa', 'Latin America', 'North America', 'Asia', 'Oceania']

const readJson = (p) => JSON.parse(readFileSync(p, 'utf8'))
const files = readdirSync(LEDGER).filter((n) => n.endsWith('.json')).sort()
const shared = readJson(join(LEDGER, 'shared.json'))
const countries = files.filter((n) => n !== 'shared.json').map((n) => readJson(join(LEDGER, n)))

// ------------------------------------------------------------------ cities.ts: names and regions
const citiesSrc = readFileSync(join(ROOT, 'src/data/cities.ts'), 'utf8')
const regionOf = new Map()
for (const m of citiesSrc.matchAll(/country: '([^']+)',\s*countryCode: '[A-Z]+',\s*region: '([^']+)'/g)) regionOf.set(m[1], m[2])
const nameOf = new Map()
for (const m of citiesSrc.matchAll(/mk\(\w+, '([a-z-]+)', (?:'([^']+)'|"([^"]+)")/g)) nameOf.set(m[1], m[2] ?? m[3])
const cityName = (id) => nameOf.get(id) ?? id

// ------------------------------------------------------------------ scores, before and now
const SCORE_RE = /scores: \{([^}]*)\}/
const parseScores = (src) => {
  const m = SCORE_RE.exec(src ?? '')
  if (!m) return undefined
  return Object.fromEntries([...m[1].matchAll(/(\w+): (\d)/g)].map((x) => [x[1], Number(x[2])]))
}
const profilePath = (id) => `src/data/profiles/${id}.ts`
const scoresNow = (id) => parseScores(readFileSync(join(ROOT, profilePath(id)), 'utf8'))
const scoresBase = (id) => {
  try {
    return parseScores(execFileSync('git', ['show', `${BASE}:${profilePath(id)}`], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }))
  } catch {
    return undefined
  }
}

/** Ledger notes on a city that mention a score, so each change carries the builder's reason. */
const scoreNotes = (file, id) =>
  file.claims
    .filter((c) => c.cities.includes(id))
    .flatMap((c) => (c.also ?? []).filter((a) => /scores?\b|scores\./i.test(a)).map((a) => `${a} (\`${c.id}\`)`))

const scoreChanges = []
for (const file of countries) {
  for (const id of file.cities) {
    const before = scoresBase(id)
    const now = scoresNow(id)
    if (!before || !now) continue
    for (const fact of FACTS) {
      if (before[fact] !== now[fact]) scoreChanges.push({ country: file.country, id, fact, before: before[fact], now: now[fact] })
    }
  }
}

// ------------------------------------------------------------------ helpers
const md = (s) => String(s).replace(/\s+/g, ' ').trim()
const quote = (s) => `“${md(s)}”`
const src = (c) => {
  const s = c.sources[0]
  const more = c.sources.length > 1 ? ` (+${c.sources.length - 1} more)` : ''
  return `[${md(s.name)}](${s.url}), read ${s.read}${more}`
}
const regionRank = (country) => {
  const r = REGION_ORDER.indexOf(regionOf.get(country) ?? '')
  return r < 0 ? REGION_ORDER.length : r
}
const byRegion = [...countries].sort((a, b) => regionRank(a.country) - regionRank(b.country) || a.country.localeCompare(b.country))
const allClaims = countries.flatMap((f) => f.claims.map((c) => ({ ...c, country: f.country })))
const table = (head, rows) => [`| ${head.join(' | ')} |`, `|${head.map(() => '---').join('|')}|`, ...rows.map((r) => `| ${r.join(' | ')} |`)].join('\n')

// ------------------------------------------------------------------ sections
function summary() {
  const count = (list) => VERDICTS.map((v) => list.filter((c) => c.verdict === v).length)
  const total = (list) => list.length
  const out = []
  const sharedCount = count(shared.claims)
  out.push(`${allClaims.length} claims in ${countries.length} country files, plus ${shared.claims.length} claims in \`shared.json\` that many profiles repeat (US estate exemption and treaties, IBKR, Schwab, the EU PRIIPs rule): ${sharedCount[0]} confirmed, ${sharedCount[1]} corrected, ${sharedCount[2]} can't confirm.`)
  out.push('')
  out.push('**By verdict** (country files)')
  out.push('')
  const all = count(allClaims)
  out.push(table(['Confirmed', 'Corrected', "Can't confirm", 'Total'], [[...all, total(allClaims)]]))
  out.push('')
  out.push('**By fact**')
  out.push('')
  out.push(table(['Fact', 'Confirmed', 'Corrected', "Can't confirm", 'Total'], FACTS.map((f) => {
    const list = allClaims.filter((c) => c.fact === f)
    return [FACT_LABEL[f], ...count(list), total(list)]
  })))
  out.push('')
  out.push('**By region** (as `src/data/cities.ts` groups countries)')
  out.push('')
  const regions = [...new Set(byRegion.map((f) => regionOf.get(f.country) ?? '?'))]
  out.push(table(['Region', 'Countries', 'Cities', 'Confirmed', 'Corrected', "Can't confirm", 'Total'], regions.map((r) => {
    const fs = countries.filter((f) => (regionOf.get(f.country) ?? '?') === r)
    const list = fs.flatMap((f) => f.claims)
    return [r, fs.length, fs.reduce((n, f) => n + f.cities.length, 0), ...count(list), total(list)]
  })))
  out.push('')
  const mm = [...allClaims, ...shared.claims].filter((c) => c.modelMismatch)
  out.push(`**Scores:** ${scoreChanges.length} of the 133 profiles' tax, estate, lending, residency and healthcare scores changed between the start of the plan (commit \`${BASE}\`) and now, on ${new Set(scoreChanges.map((s) => s.id)).size} profiles; every one is listed under "Every score change". **Model:** ${mm.length} claims recorded a difference from \`src/data/localTaxes.ts\` (\`modelMismatch\`); ${mm.filter((c) => c.modelled).length} are now modelled and ${mm.filter((c) => c.notModelled).length} are named as not modelled. **Rank flags:** ${[...allClaims, ...shared.claims].filter((c) => c.rankFlag).length}.`)
  return out.join('\n')
}

function scoreTable() {
  const rows = [...scoreChanges]
    .sort((a, b) => regionRank(a.country) - regionRank(b.country) || a.country.localeCompare(b.country) || a.id.localeCompare(b.id) || FACTS.indexOf(a.fact) - FACTS.indexOf(b.fact))
    .map((s) => {
      const file = countries.find((f) => f.country === s.country)
      const notes = scoreNotes(file, s.id).filter((n) => new RegExp(`\\b${s.fact === 'visa' ? '(visa|residency)' : s.fact}\\b`, 'i').test(n))
      return [s.country, cityName(s.id), FACT_LABEL[s.fact], `${s.before} → ${s.now}`, notes.length ? notes.map(md).join('<br>') : '(see the city\'s corrected claims below)']
    })
  return table(['Country', 'City', 'Score', 'Change', 'Ledger note'], rows)
}

function rankFlags() {
  const out = []
  for (const c of [...shared.claims.map((c) => ({ ...c, country: 'Shared' })), ...byRegion.flatMap((f) => f.claims.map((c) => ({ ...c, country: f.country })))]) {
    if (!c.rankFlag) continue
    const where = c.cities ? c.cities.map(cityName).join(', ') : md(c.appliesTo)
    out.push(`- **${c.country}** — ${where} (\`${c.id}\`): ${md(c.rankFlag)}`)
  }
  return out.join('\n')
}

function claimLine(c) {
  if (c.verdict === 'corrected') {
    return `- \`${c.id}\` (${FACT_LABEL[c.fact]}): ${quote(c.oldWording)} → ${quote(c.newWording)}. Source: ${src(c)}.`
  }
  const kept = c.hedge === 'removed' ? `removed (was ${quote(c.oldWording)})` : `kept on “${md(c.hedge)}”`
  return `- \`${c.id}\` (${FACT_LABEL[c.fact]}): ${md(c.claim)} — ${kept}.`
}

function perCity() {
  const out = []
  const write = (title, scores, claims, alsoOf) => {
    const corrected = claims.filter((c) => c.verdict === 'corrected')
    const cant = claims.filter((c) => c.verdict === 'cant-confirm')
    if (!corrected.length && !cant.length && !scores.length) return
    out.push(`#### ${title}`, '')
    if (scores.length) out.push(`Score changes: ${scores.map((s) => `${FACT_LABEL[s.fact]} ${s.before} → ${s.now}`).join('; ')}.`, '')
    if (corrected.length) out.push('Corrected:', '', ...corrected.map((c) => claimLine(c) + alsoOf(c)), '')
    if (cant.length) out.push("Can't confirm:", '', ...cant.map((c) => claimLine(c) + alsoOf(c)), '')
  }
  for (const f of byRegion) {
    out.push(`### ${f.country}`, '')
    out.push(`${f.cities.map(cityName).join(', ')} · ${regionOf.get(f.country) ?? ''} · \`${f.country.toLowerCase().replace(/\s+/g, '-')}.json\`, ${f.claims.length} claims`, '')
    const open = f.claims.filter((c) => c.verdict !== 'confirmed')
    const changesOf = (id) => scoreChanges.filter((s) => s.id === id)
    if (f.cities.length === 1) {
      write(cityName(f.cities[0]), changesOf(f.cities[0]), open, () => '')
      continue
    }
    // A claim or score change every city shares is shown once, under "All cities"; the rest per city.
    const same = (a, b) => a.fact === b.fact && a.before === b.before && a.now === b.now
    const common = changesOf(f.cities[0]).filter((s) => f.cities.every((id) => changesOf(id).some((t) => same(s, t))))
    write(`All ${f.cities.length} cities`, common, open.filter((c) => c.cities.length === f.cities.length), () => '')
    for (const id of f.cities) {
      const own = open.filter((c) => c.cities.length < f.cities.length && c.cities.includes(id))
      const scores = changesOf(id).filter((s) => !common.some((t) => same(s, t)))
      const alsoOf = (c) => (c.cities.length > 1 ? ` (also ${c.cities.filter((x) => x !== id).map(cityName).join(', ')})` : '')
      write(cityName(id), scores, own, alsoOf)
    }
  }
  return out.join('\n').trimEnd()
}

function sharedClaims() {
  const out = []
  for (const c of shared.claims) {
    if (c.verdict === 'confirmed') continue
    if (c.verdict === 'corrected') out.push(`- \`${c.id}\` (${md(c.appliesTo)}): ${quote(c.oldWording)} → ${quote(c.newWording)}. Source: ${src(c)}.`)
    else out.push(`- \`${c.id}\` (${md(c.appliesTo)}): ${md(c.claim)} — kept on “${md(c.hedge)}”.`)
  }
  return out.join('\n')
}

function modelTable() {
  const rows = [...shared.claims.map((c) => ({ ...c, country: 'Shared' })), ...byRegion.flatMap((f) => f.claims.map((c) => ({ ...c, country: f.country })))]
    .filter((c) => c.modelMismatch)
    .map((c) => [c.country, `\`${c.id}\``, c.modelled ? 'Modelled' : 'Not modelled', md(c.modelled ?? c.notModelled).replace(/\|/g, '\\|')])
  return table(['Country', 'Claim', 'Outcome', 'What was done, or why not'], rows)
}

// ------------------------------------------------------------------ write
const SECTIONS = { summary, scores: scoreTable, 'rank-flags': rankFlags, 'per-city': perCity, shared: sharedClaims, model: modelTable }
let report = readFileSync(REPORT, 'utf8')
for (const [name, fn] of Object.entries(SECTIONS)) {
  const re = new RegExp(`(<!-- generated:${name} -->)[\\s\\S]*?(<!-- /generated:${name} -->)`)
  if (!re.test(report)) throw new Error(`what-changed.md has no generated:${name} markers`)
  report = report.replace(re, (_, a, b) => `${a}\n${fn()}\n${b}`)
}
writeFileSync(REPORT, report)
console.log(`what-changed.md: ${report.length} characters, ${scoreChanges.length} score changes`)
