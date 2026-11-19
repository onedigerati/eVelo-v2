// Probe: with the mode's age (58) differing from eVelo's (55), where does each median start on the compare chart?
import { chromium } from 'playwright'
import { runnerImport } from 'vite'
import { withPreview } from '../../../scripts/serve-preview.mjs'
const ROOT = new URL('../../../', import.meta.url).pathname
const L = async (p) => (await runnerImport(ROOT + p)).module
const [{ INCOME_DEFAULTS }, { DEFAULT_INPUTS }, sync, { sanitizeInputs }, { sanitizeIncomeInputs }] = await Promise.all([L('src/engine/income.ts'), L('src/engine/defaults.ts'), L('src/state/incomeSync.ts'), L('src/state/share.ts'), L('src/state/incomeState.ts')])
const plan = sanitizeInputs({ ...structuredClone(DEFAULT_INPUTS), destCityId: null, paths: 1000, seed: 2718, age: 55, horizonYears: 31, portfolio: 2_200_000, homeCityId: 'austin' })
const snap = sync.snapshotFromEvelo(plan)
const inputs = sanitizeIncomeInputs({ ...sync.applySync({ ...INCOME_DEFAULTS }, snap, sync.SYNC_FIELDS), age: 58 })
const stored = { ...inputs, step: 6, done: true, sync: sync.makeSyncRecord(null, snap, sync.SYNC_FIELDS, new Date()) }
await withPreview(async (base) => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } })
  await ctx.addInitScript(([p, s]) => { localStorage.setItem('evelo:v2', JSON.stringify({ inputs: p, theme: 'dark', themeV: 2 })); localStorage.setItem('evelo:v2:income', JSON.stringify(s)) }, [plan, stored])
  const page = await ctx.newPage(); await page.goto(base + '#income')
  await page.waitForFunction(() => document.querySelector('[data-testid="income-compare"]')?.dataset.evelo === 'done', null, { timeout: 90000 })
  const r = await page.evaluate(() => {
    const ms = [...document.querySelectorAll('[data-testid="compare-chart"] .cchart__median')].map((p) => p.getAttribute('d').slice(0, 30))
    const rows = [...document.querySelectorAll('[data-testid="compare-chart"] tbody tr')].map((tr) => [...tr.children].map((c) => c.textContent.slice(0, 14)))
    return { ms, first: rows.slice(0, 4), last: rows.slice(-2), n: rows.length, label: document.querySelector('[data-testid="compare-chart"] svg[role=img]').getAttribute('aria-label') }
  })
  console.log(JSON.stringify(r, null, 1))
  await page.locator('[data-testid="income-compare"]').screenshot({ path: new URL('./probe-age-offset-1280.png', import.meta.url).pathname })
  await b.close()
}, 4209)
