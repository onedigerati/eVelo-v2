import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

// The fact check's final report (docs/research/fact-check-2026-11/what-changed.md) must list every corrected
// claim and every claim with a rank flag. Its city-by-city lists are written from the ledger by scripts/fact-check-report.mjs; run it
// again after a ledger change.

const LEDGER_DIR = fileURLToPath(new URL('../../../docs/research/fact-check-2026-11/', import.meta.url))
const REPORT = join(LEDGER_DIR, 'what-changed.md')

interface Claim {
  id: string
  verdict: string
  rankFlag?: string
}

const claims = (): Claim[] =>
  readdirSync(LEDGER_DIR)
    .filter((n) => n.endsWith('.json'))
    .flatMap((n) => (JSON.parse(readFileSync(join(LEDGER_DIR, n), 'utf8')) as { claims: Claim[] }).claims)

describe('fact-check report', () => {
  it('exists', () => {
    expect(existsSync(REPORT)).toBe(true)
  })

  it('names every corrected claim by its ledger id', () => {
    const report = readFileSync(REPORT, 'utf8')
    const corrected = claims().filter((c) => c.verdict === 'corrected')
    expect(corrected.length).toBeGreaterThan(0)
    const missing = corrected.map((c) => c.id).filter((id) => !report.includes(`\`${id}\``))
    expect(missing, `\nmissing from what-changed.md (run node scripts/fact-check-report.mjs):\n${missing.join('\n')}\n`).toEqual([])
  })

  it('names every claim with a rank flag by its ledger id', () => {
    const report = readFileSync(REPORT, 'utf8')
    const flagged = claims().filter((c) => c.rankFlag)
    expect(flagged.length).toBeGreaterThan(0)
    const missing = flagged.map((c) => c.id).filter((id) => !report.includes(`\`${id}\``))
    expect(missing, `\nrank-flagged claims missing from what-changed.md (run node scripts/fact-check-report.mjs):\n${missing.join('\n')}\n`).toEqual([])
  })
})
