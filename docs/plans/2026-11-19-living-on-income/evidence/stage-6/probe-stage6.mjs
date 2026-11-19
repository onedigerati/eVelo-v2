// Stage 6 verifier's own probes, against the built app (run `npm run build` first):
//   node docs/evidence/stage-6/probe-stage6.mjs
// Independent of e2e/income-sync.mjs and e2e/income-compare.mjs: different plans, different fields
// unticked, fields changed directly in storage, expected figures from a node run of the engine.
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { chromium } from 'playwright'
import { runnerImport } from 'vite'
import { withPreview } from '../../../scripts/serve-preview.mjs'

const ROOT = new URL('../../../', import.meta.url).pathname
const OUT = new URL('./', import.meta.url).pathname
const fails = []
const check = (ok, msg) => { console.log(`${ok ? 'ok  ' : 'FAIL'} ${msg}`); if (!ok) fails.push(msg) }
const load = async (p) => (await runnerImport(ROOT + p)).module
const [{ runIncomePaths, runIncomeOnMonths, INCOME_DEFAULTS }, { simulate }, { CITIES, CITY_BY_ID }, { DEFAULT_INPUTS }, sync, { sanitizeInputs }, { sanitizeIncomeInputs }, fmt, { generateScenarios }, { prepare }] = await Promise.all([
  load('src/engine/income.ts'), load('src/engine/simulate.ts'), load('src/data/cities.ts'), load('src/engine/defaults.ts'),
  load('src/state/incomeSync.ts'), load('src/state/share.ts'), load('src/state/incomeState.ts'), load('src/ui/format.ts'),
  load('src/engine/scenarios.ts'), load('src/engine/prepare.ts'),
])
const market = JSON.parse(readFileSync(ROOT + 'src/data/market.json', 'utf8'))
const { currencyCompact, currency } = fmt
const pct = (r) => `${Math.round(r * 100)}%`
const last = (a) => a[a.length - 1]
const sha = (s) => createHash('sha256').update(s ?? '').digest('hex').slice(0, 16)
const EVELO = 'evelo:v2', INCOME = 'evelo:v2:income'
const SHEET = '[data-testid="sync-sheet"]', CHIP = '[data-testid="sync-chip"]', RESULTS = '[data-testid="income-results"]', COMPARE = '[data-testid="income-compare"]'
const phone = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }
const desk = { viewport: { width: 1280, height: 900 } }
const norm = (s) => s.replace(/\s+/g, ' ').trim()
const raw = (page, k) => page.evaluate((k) => localStorage.getItem(k), k)
const stored = async (page, k) => JSON.parse(await raw(page, k))
const overflow = (page) => page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }))
const active = (page) => page.evaluate(() => { const a = document.activeElement; return { tag: a?.tagName, id: a?.id, text: a?.textContent?.trim().slice(0, 40) || a?.getAttribute('aria-label'), role: a?.getAttribute('role'), inDialog: !!a?.closest('[role=dialog]') } })

// The verifier's eVelo plan: every shared value away from the e2e's and the defaults.
const PLAN1 = sanitizeInputs({ ...structuredClone(DEFAULT_INPUTS), destCityId: null, portfolio: 1_750_000, basisFraction: 0.42, age: 57, horizonYears: 33, homeCityId: 'denver', otherIncome: 31_000, incomeStartAge: 70, seed: 31337, paths: 1000, blockMonths: 12, outlook: 'historical' })
const MODE1 = { ...INCOME_DEFAULTS, portfolio: 900_000, basisFraction: 0.2, age: 63, horizonYears: 25, spending: 61_000, otherIncome: 12_000, incomeStartAge: 66, stockShare: 0.5, muniShare: 0.3, filingStatus: 'single', homeCityId: 'austin', seed: 5, paths: 1000, blockMonths: 24, outlook: 'balanced', step: 6, done: true }

async function open(browser, base, plan, mode, { w = 1280, scheme = 'dark' } = {}) {
  const ctx = await browser.newContext({ ...(w === 390 ? phone : desk), colorScheme: scheme, reducedMotion: 'reduce' })
  await ctx.addInitScript(([p, m, theme]) => {
    try {
      if (!localStorage.getItem('evelo:v2')) localStorage.setItem('evelo:v2', JSON.stringify({ inputs: p, theme, themeV: 2 }))
      if (!localStorage.getItem('evelo:v2:income')) localStorage.setItem('evelo:v2:income', JSON.stringify(m))
    } catch {}
  }, [plan, mode, scheme])
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()) })
  await page.goto(base + '#income')
  await page.locator(RESULTS).waitFor({ timeout: 20000 })
  return { ctx, page, errors }
}

function scenario(planPatch, modePatch = {}) {
  const plan = sanitizeInputs({ ...structuredClone(DEFAULT_INPUTS), destCityId: null, paths: 1000, seed: 2718, age: 55, horizonYears: 31, portfolio: 2_200_000, homeCityId: 'austin', ...planPatch })
  const snap = sync.snapshotFromEvelo(plan)
  const inputs = sanitizeIncomeInputs({ ...sync.applySync({ ...INCOME_DEFAULTS, stockShare: 0.65, muniShare: 0.2, filingStatus: 'mfj' }, snap, sync.SYNC_FIELDS), ...modePatch })
  const record = sync.makeSyncRecord(null, snap, sync.SYNC_FIELDS, new Date('2026-11-18T12:00:00Z'))
  return { plan, snap, inputs, stored: { ...inputs, step: 6, done: true, sync: record } }
}
const ready = (page) => page.waitForFunction(() => {
  const el = document.querySelector('[data-testid="income-compare"]'); const r = document.querySelector('[data-testid="income-results"]')
  return el?.dataset.evelo === 'done' && r?.dataset.status === 'current'
}, null, { timeout: 90000 }).then(() => true, () => false)
const tid = (page, id) => page.getByTestId(id).innerText().then(norm)
const linesOf = async (page) => [
  ...(await page.locator('[data-testid="compare-diffs"] li').allInnerTexts()),
  ...(await page.locator('[data-testid="compare-lines"] li').allInnerTexts()),
].map((t) => t.trim())

await withPreview(async (base) => {
  const browser = await chromium.launch()
  try {
    // ---------- Check 1: only ticked values copy; evelo:v2 byte-identical ----------
    console.log('\n## Check 1')
    {
      const { ctx, page, errors } = await open(browser, base, PLAN1, MODE1)
      const before = await raw(page, EVELO)
      await page.getByRole('button', { name: 'Sync with my eVelo plan' }).click()
      await page.getByRole('dialog').waitFor()
      const fields = await page.locator(`${SHEET} li[data-field]`).evaluateAll((els) => els.map((e) => e.dataset.field))
      check(fields.join() === 'portfolio,basisFraction,age,horizonYears,spending,otherIncome,homeCityId,futures', `rows: ${fields.join(', ')}`)
      const boxes = await page.locator(`${SHEET} input[type=checkbox]`).evaluateAll((els) => els.map((e) => e.checked))
      check(boxes.length === 8 && boxes.every(Boolean), `all 8 ticked by default (${boxes})`)
      const pairs = {}
      for (const f of fields) pairs[f] = [await tid(page, `sync-ev-${f}`), await tid(page, `sync-cv-${f}`)]
      console.log('     eVelo → mode:', JSON.stringify(pairs))
      check(pairs.portfolio[0] === '$1,750,000' && pairs.portfolio[1] === '$900,000', 'portfolio shows eVelo beside mode')
      check(pairs.age[0] === '57' && pairs.age[1] === '63' && pairs.basisFraction[0] === '42%' && pairs.basisFraction[1] === '20%', 'age and basis beside each other')
      check(pairs.homeCityId[0] === 'Denver' && pairs.homeCityId[1] === 'Austin' && pairs.horizonYears[0] === '33 years' && pairs.horizonYears[1] === '25 years', 'city and horizon beside each other')
      check(/\$31,000 at 70/.test(pairs.otherIncome[0]) && /\$12,000 at 66/.test(pairs.otherIncome[1]), 'Social Security and start age beside each other')
      check(/seed 31337/.test(pairs.futures[0]) && /12 mo/.test(pairs.futures[0]) && /Historical/i.test(pairs.futures[0]) && /1,000 paths/.test(pairs.futures[0]), `futures: seed, paths, block, outlook (${pairs.futures[0]})`)
      // Untick four: portfolio, otherIncome, homeCityId, futures.
      for (const f of ['portfolio', 'otherIncome', 'homeCityId', 'futures']) await page.locator(`${SHEET} li[data-field="${f}"] input`).uncheck()
      check(norm(await page.locator('.isync__copy').innerText()) === 'Copy 4 values', 'reads Copy 4 values')
      await page.screenshot({ path: OUT + 'probe-c1-sheet-unticked-1280-dark.png' })
      await page.locator('.isync__copy').click()
      await page.getByRole('dialog').waitFor({ state: 'hidden' })
      await page.waitForTimeout(600)
      const st = await stored(page, INCOME)
      const spend = sync.snapshotFromEvelo(PLAN1).spending
      check(st.basisFraction === 0.42 && st.age === 57 && st.horizonYears === 33 && Math.round(st.spending) === Math.round(spend), `ticked copied: basis ${st.basisFraction}, age ${st.age}, horizon ${st.horizonYears}, spending ${st.spending} (eVelo ${spend})`)
      check(st.portfolio === 900_000 && st.otherIncome === 12_000 && st.incomeStartAge === 66 && st.homeCityId === 'austin', `unticked kept: portfolio ${st.portfolio}, SS ${st.otherIncome}@${st.incomeStartAge}, city ${st.homeCityId}`)
      check(st.seed === 5 && st.blockMonths === 24 && st.outlook === 'balanced', `futures unticked kept: seed ${st.seed}, block ${st.blockMonths}, outlook ${st.outlook}`)
      check(st.stockShare === 0.5 && st.muniShare === 0.3 && st.filingStatus === 'single', 'never-shared fields untouched')
      const after = await raw(page, EVELO)
      check(after === before, `evelo:v2 byte-identical after copy (sha ${sha(before)} → ${sha(after)}, ${before.length} → ${after.length} bytes)`)
      await page.reload(); await page.locator(RESULTS).waitFor({ timeout: 20000 }); await page.waitForTimeout(1500)
      const after2 = await raw(page, EVELO)
      check(after2 === before, `evelo:v2 still byte-identical after reload (sha ${sha(after2)})`)
      const st2 = await stored(page, INCOME)
      check(st2.portfolio === 900_000 && st2.age === 57, 'copy persists, nothing extra copied on reload')
      check(errors.length === 0, `no page/console errors ${errors.join(' | ')}`)
      await ctx.close()
    }

    // ---------- Check 2: chip names changed fields; no silent re-sync; Re-sync copies ----------
    console.log('\n## Check 2')
    {
      const { ctx, page, errors } = await open(browser, base, PLAN1, MODE1, { w: 390, scheme: 'light' })
      await page.getByRole('button', { name: 'Sync with my eVelo plan' }).click()
      await page.getByRole('dialog').waitFor()
      await page.locator('.isync__copy').click()
      await page.getByRole('dialog').waitFor({ state: 'hidden' })
      await page.waitForTimeout(600)
      const synced = await stored(page, INCOME)
      check(synced.age === 57 && synced.seed === 31337 && synced.homeCityId === 'denver', 'full sync copied')
      // Change age, home city and seed in eVelo's store from another tab (the app's own storage path).
      const other = await ctx.newPage()
      await other.goto(base + '#plan')
      await other.waitForTimeout(800)
      await other.evaluate((k) => { const v = JSON.parse(localStorage.getItem(k)); v.inputs.age = 59; v.inputs.homeCityId = 'seattle'; v.inputs.seed = 4242; localStorage.setItem(k, JSON.stringify(v)) }, EVELO)
      await other.close()
      await page.locator(`${CHIP}.isync-chip--changed`).waitFor({ timeout: 5000 }).catch(() => {})
      const chip = norm(await page.locator(CHIP).innerText())
      console.log('     chip:', chip)
      check(/eVelo changed since/.test(chip) && /age/i.test(chip) && /home city|city/i.test(chip) && /futures/i.test(chip) && !/portfolio|spending/i.test(chip), `chip names age, home city, futures only (${chip})`)
      await page.screenshot({ path: OUT + 'probe-c2-changed-chip-390-light.png' })
      await page.waitForTimeout(3000)
      await page.reload(); await page.locator(RESULTS).waitFor({ timeout: 20000 }); await page.waitForTimeout(2000)
      const st = await stored(page, INCOME)
      check(st.age === 57 && st.homeCityId === 'denver' && st.seed === 31337, `no silent re-sync after waiting and reloading (age ${st.age}, city ${st.homeCityId}, seed ${st.seed})`)
      const chip2 = norm(await page.locator(CHIP).innerText())
      check(/eVelo changed since/.test(chip2), `chip still says changed after reload (${chip2})`)
      await page.getByRole('button', { name: 'Re-sync' }).click()
      await page.getByRole('dialog').waitFor()
      const t = await page.locator(`${SHEET} li[data-field]`).evaluateAll((els) => els.filter((e) => e.querySelector('input').checked).map((e) => e.dataset.field))
      check(t.join() === 'age,homeCityId,futures', `Re-sync ticks the changed fields (${t.join()})`)
      await page.locator('.isync__copy').click()
      await page.getByRole('dialog').waitFor({ state: 'hidden' })
      await page.waitForTimeout(600)
      const st3 = await stored(page, INCOME)
      check(st3.age === 59 && st3.homeCityId === 'seattle' && st3.seed === 4242, `Re-sync copied (age ${st3.age}, city ${st3.homeCityId}, seed ${st3.seed})`)
      const chip3 = norm(await page.locator(CHIP).innerText())
      check(/^Synced /.test(chip3), `chip back to synced (${chip3})`)
      check(errors.length === 0, `no page/console errors ${errors.join(' | ')}`)
      await ctx.close()
    }

    // ---------- Check 3: columns equal the two results; three switch states with meanings ----------
    console.log('\n## Check 3')
    {
      const s = scenario({ seed: 2718, horizonYears: 31, age: 55 })
      const ir = runIncomePaths(market, s.inputs)
      const er = simulate(market, CITIES, s.plan)
      const want = {
        lasts: [pct(ir.lastsRate), pct(1 - er.brokenRate), /solvent at the horizon/],
        principal: [pct(ir.principalKeptRate), pct(er.successRate), /no forced sale/],
        pace: [pct(ir.keepsPaceRate), pct(1 - er.brokenRate), /same as the money lasts/],
      }
      console.log('     node:', JSON.stringify(Object.fromEntries(Object.entries(want).map(([k, v]) => [k, v.slice(0, 2)]))))
      for (const w of [1280, 390]) for (const scheme of ['light', 'dark']) {
        const { ctx, page, errors } = await open(browser, base, s.plan, s.stored, { w, scheme })
        check(await ready(page), `${w}-${scheme}: comparison ready`)
        for (const k of ['lasts', 'principal', 'pace']) {
          await page.getByTestId(`compare-tab-${k}`).click()
          const got = [await tid(page, 'compare-rate-income'), await tid(page, 'compare-rate-evelo')]
          const meaning = await tid(page, 'compare-meaning')
          check(got[0] === want[k][0] && got[1] === want[k][1] && want[k][2].test(meaning), `${w}-${scheme} ${k}: ${got.join(' | ')} (node ${want[k].slice(0, 2).join(' | ')}); meaning "${meaning.slice(0, 70)}…"`)
        }
        const cols = await page.locator(`${COMPARE} [data-testid^="compare-col-"]`).count()
        const stats = {
          'compare-income-estate': currencyCompact(last(ir.value.p50)), 'compare-income-tax': currencyCompact(ir.totalTaxMedian), 'compare-income-sold': currencyCompact(ir.totalSoldMedian),
          'compare-evelo-estate': currencyCompact(er.estate.bbdMedian), 'compare-evelo-loan': currencyCompact(last(er.loan.p50)),
        }
        let statsOk = true
        for (const [id, v] of Object.entries(stats)) { const g = (await tid(page, id)).split(' ').pop(); if (g !== v) { statsOk = false; console.log(`     ${id}: page ${g} node ${v}`) } }
        check(cols === 2 && statsOk, `${w}-${scheme}: 2 columns, stats equal node ${JSON.stringify(stats)}`)
        // Chart: hidden table, first and last age, both medians (mode value p50; eVelo netWorth p50 = portfolio − loan).
        const rows = await page.locator('[data-testid="compare-chart"] table tbody tr').evaluateAll((trs) => trs.map((tr) => [...tr.children].map((c) => c.textContent.trim())))
        const n = s.plan.horizonYears
        const nwCheck = er.netWorth.p50.every((v, i) => Math.abs(v - (er.portfolioValue.p50[i] - er.loan.p50[i])) < 1) // only informative: medians of a difference needn't equal the difference of medians
        const exp0 = [currency(ir.value.p50[0]), currency(er.netWorth.p50[0])], expN = [currency(ir.value.p50[n]), currency(er.netWorth.p50[n])]
        const expBand = `${currency(er.netWorth.p50[n])} (${currency(er.netWorth.p25[n])} to ${currency(er.netWorth.p75[n])})`
        check(rows.length === n + 1 && rows[0][1].startsWith(exp0[0]) && rows[0][2].startsWith(exp0[1]) && rows[n][1].startsWith(expN[0]) && rows[n][2] === expBand,
          `${w}-${scheme}: chart table ${rows.length} ages; age ${rows[n][0]}: mode ${rows[n][1]} / eVelo ${rows[n][2]} (node ${expN[0]} / ${expBand}; p50(netWorth)==p50(port)-p50(loan) on every year: ${nwCheck})`)
        const bands = await page.locator('[data-testid="compare-chart"] svg path').count()
        check(bands >= 4, `${w}-${scheme}: chart draws ${bands} paths (2 bands + 2 medians)`)
        const o = await overflow(page)
        check(o.sw <= o.cw, `${w}-${scheme}: scrollWidth ${o.sw} ≤ clientWidth ${o.cw}`)
        await page.getByTestId('compare-tab-principal').click()
        await page.locator(COMPARE).screenshot({ path: OUT + `probe-c3-compare-${w}-${scheme}.png` })
        check(errors.length === 0, `${w}-${scheme}: no page/console errors ${errors.join(' | ')}`)
        await ctx.close()
      }
    }

    // ---------- Check 4: same month draws (node) and like-for-like lines (UI) ----------
    console.log('\n## Check 4')
    {
      if (generateScenarios && prepare) {
        const p = sanitizeInputs({ ...structuredClone(DEFAULT_INPUTS), seed: 1_234_567, paths: 500, blockMonths: 30, horizonYears: 19, outlook: 'conservative' })
        const inputs = sync.applySync(INCOME_DEFAULTS, sync.snapshotFromEvelo(p), sync.SYNC_FIELDS)
        const ev = generateScenarios(prepare(market, p.holdings, p.outlook), p.method, p.blockMonths, p.paths, p.horizonYears * 12, p.seed, { indices: true })
        const a = runIncomePaths(market, inputs), b = runIncomeOnMonths(market, inputs, ev.idx)
        check(JSON.stringify(a) === JSON.stringify(b), `node: full sync of seed 1234567 / 500 paths / 30-mo blocks / 19 y / conservative → mode result equals the run on eVelo's drawn months`)
        const c = runIncomeOnMonths(market, { ...inputs, seed: inputs.seed + 1 }, ev.idx), d = runIncomePaths(market, { ...inputs, seed: inputs.seed + 1 })
        check(JSON.stringify(c) !== JSON.stringify(d), 'node: with another seed the mode draws other months')
      } else check(false, 'could not load generateScenarios/prepare for the node probe')

      // A: move abroad to a taxed city, retire later (1 year, no savings), fat-tail, loan, two person diffs.
      const A = scenario({ destCityId: 'rome', retireInYears: 1, savingsWhileWorking: 0, method: 'fat-tail', existingLoan: 75_000 }, { age: 58, spending: 40_000 })
      const wantA = [
        'Age differs: 55 in eVelo, 58 here.',
        `Spending differs: ${currencyCompact(A.snap.spending)} a year in eVelo, ${currencyCompact(40_000)} a year here.`,
        'Your eVelo plan moves to Rome, and its figures include Rome’s wealth tax and inheritance tax; living on income stays home and doesn’t model it.',
        'eVelo retires in 1 year; this mode retires now.',
        'eVelo uses fat tails; this mode always replays history.',
        `eVelo starts with a ${currencyCompact(75_000)} loan.`,
      ]
      // B: three person diffs grouped; home city with a state inheritance tax.
      const B = scenario({ homeCityId: 'pittsburgh' }, { portfolio: 1_000_000, basisFraction: 0.9, otherIncome: 0 })
      const wantB = ['Portfolio, cost basis and social Security differ from your eVelo plan.', 'eVelo’s figures include Pittsburgh’s state inheritance tax; living on income doesn’t model it.', 'Both run on the same 1,000 futures.']
      for (const [name, s, want, w] of [['A-away', A, wantA, 1280], ['A-away', A, wantA, 390], ['B-pittsburgh', B, wantB, 390]]) {
        const { ctx, page, errors } = await open(browser, base, s.plan, s.stored, { w, scheme: 'dark' })
        check(await ready(page), `${name}-${w}: comparison ready`)
        const got = await linesOf(page)
        const head = norm(await page.locator(`${COMPARE} h2`).innerText())
        console.log(`     ${name}-${w} lines:`, JSON.stringify(got), '| heading:', head)
        const same = name.startsWith('B') ? got.slice(1).join('\n') === want.slice(1).join('\n') && /Portfolio, cost basis and social security differ/i.test(got[0]) : JSON.stringify(got) === JSON.stringify(want)
        check(same, `${name}-${w}: lines as expected`)
        check(head === 'Your two plans, side by side', `${name}-${w}: neutral heading when anything differs (${head})`)
        const o = await overflow(page)
        check(o.sw <= o.cw, `${name}-${w}: scrollWidth ${o.sw} ≤ clientWidth ${o.cw}`)
        await page.locator(COMPARE).screenshot({ path: OUT + `probe-c4-${name}-${w}.png` })
        check(errors.length === 0, `${name}-${w}: no page/console errors ${errors.join(' | ')}`)
        await ctx.close()
      }
    }

    // ---------- Check 5: layout, keyboard, roles, light/dark ----------
    console.log('\n## Check 5')
    {
      const s = scenario({})
      for (const w of [1280, 390]) for (const scheme of ['light', 'dark']) {
        const { ctx, page, errors } = await open(browser, base, s.plan, s.stored, { w, scheme })
        await ready(page)
        const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)
        let o = await overflow(page)
        check(o.sw <= o.cw, `${w}-${scheme}: page scrollWidth ${o.sw} ≤ clientWidth ${o.cw} (body bg ${bg})`)
        await page.screenshot({ path: OUT + `probe-c5-page-${w}-${scheme}.png`, fullPage: true })
        await page.getByRole('button', { name: 'Re-sync' }).click()
        await page.getByRole('dialog').waitFor(); await page.waitForTimeout(300)
        o = await overflow(page)
        check(o.sw <= o.cw, `${w}-${scheme}: sheet open scrollWidth ${o.sw} ≤ clientWidth ${o.cw}`)
        await page.screenshot({ path: OUT + `probe-c5-sheet-${w}-${scheme}.png` })
        await page.keyboard.press('Escape'); await page.getByRole('dialog').waitFor({ state: 'hidden' })
        check(errors.length === 0, `${w}-${scheme}: no page/console errors ${errors.join(' | ')}`)
        await ctx.close()
      }
      // Keyboard only, desktop: Tab from the top to the sync control, through the sheet, then the switch.
      const { ctx, page, errors } = await open(browser, base, s.plan, s.stored, { w: 1280, scheme: 'dark' })
      await ready(page)
      await page.locator('body').click({ position: { x: 1, y: 1 } })
      let hit = null
      for (let i = 0; i < 80; i++) { await page.keyboard.press('Tab'); const a = await active(page); if (a.text === 'Re-sync') { hit = i + 1; break } }
      check(hit != null, `Tab reaches Re-sync from the top in ${hit} presses`)
      await page.keyboard.press('Enter')
      const dialog = page.getByRole('dialog', { name: 'Bring values from your eVelo plan' })
      await dialog.waitFor(); await page.waitForTimeout(200)
      const modal = await dialog.getAttribute('aria-modal')
      const a0 = await active(page)
      check(a0.id === 'isync-portfolio' && a0.inDialog, `Enter opens the dialog (aria-modal=${modal}); focus on first tick (${JSON.stringify(a0)})`)
      const names = []
      for (const f of ['portfolio', 'basisFraction', 'age', 'horizonYears', 'spending', 'otherIncome', 'homeCityId', 'futures']) {
        const cb = page.locator(`#isync-${f}`)
        names.push(await cb.evaluate((el) => `${el.labels?.[0]?.textContent?.trim()} / desc: ${document.getElementById(el.getAttribute('aria-describedby'))?.textContent?.replace(/\s+/g, ' ').trim()}`))
      }
      console.log('     checkbox name / description:\n       ' + names.join('\n       '))
      check(names.every((n) => !n.startsWith('undefined') && /eVelo: .*this mode:/.test(n)), 'every tick has a label and an eVelo/this-mode description')
      const order = []
      for (let i = 0; i < 12; i++) { await page.keyboard.press('Tab'); const a = await active(page); order.push((a.id || a.text) + (a.inDialog ? '' : ' [OUTSIDE]')); if (!a.inDialog) break }
      console.log('     Tab order in sheet:', order.join(' → '))
      check(order.every((x) => x) && (await active(page)).inDialog, 'Tab cycles within the sheet')
      await page.keyboard.press('Escape'); await dialog.waitFor({ state: 'hidden' })
      check((await active(page)).text === 'Re-sync', 'Escape returns focus to Re-sync')
      const tablist = page.getByRole('tablist', { name: 'Measure' })
      const tabs = tablist.getByRole('tab')
      check((await tabs.count()) === 3, `tablist "Measure" with ${await tabs.count()} tabs: ${(await tabs.allInnerTexts()).join(', ')}`)
      const tabIdx = await tabs.evaluateAll((els) => els.map((e) => e.tabIndex))
      check(tabIdx.filter((t) => t === 0).length === 1, `roving tabindex (${tabIdx})`)
      await page.getByTestId('compare-tab-lasts').focus()
      const seq = []
      for (const key of ['ArrowRight', 'ArrowRight', 'ArrowRight', 'ArrowLeft', 'End', 'Home']) {
        await page.keyboard.press(key)
        seq.push(`${key}→${await page.evaluate(() => document.activeElement?.dataset?.testid?.replace('compare-tab-', ''))}/${await page.locator('[role=tab][aria-selected=true]').getAttribute('data-testid')}`)
      }
      console.log('     switch keys:', seq.join(', '))
      check(seq[0].startsWith('ArrowRight→principal') && seq[1].startsWith('ArrowRight→pace') && seq[2].startsWith('ArrowRight→lasts') && seq[3].startsWith('ArrowLeft→pace'), 'arrows move focus and selection across the switch, wrapping')
      const panel = page.getByRole('tabpanel')
      check((await panel.count()) === 1 && !!(await panel.getAttribute('aria-labelledby')), 'tabpanel labelled by the selected tab')
      const img = page.locator('[data-testid="compare-chart"] svg[role="img"]')
      check((await img.count()) === 1 && ((await img.getAttribute('aria-label')) ?? '').length > 20, `chart role=img with label: "${(await img.getAttribute('aria-label'))?.slice(0, 90)}…"`)
      const region = await page.locator(COMPARE).evaluate((el) => document.getElementById(el.getAttribute('aria-labelledby'))?.textContent)
      check(!!region, `comparison section labelled by "${region}"`)
      check((await page.locator(`${CHIP} [aria-live]`).count()) >= 1, 'chip text is a live region')
      check(errors.length === 0, `keyboard pass: no page/console errors ${errors.join(' | ')}`)
      await ctx.close()
    }
  } finally {
    await browser.close()
  }
}, 4207)

if (fails.length) { console.error(`\n${fails.length} probe check(s) failed:\n- ${fails.join('\n- ')}`); process.exit(1) }
console.log('\nall stage-6 probes passed')
