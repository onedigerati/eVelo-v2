// Independent stage 5 verification. Run from the repo root after `npm run build`:
//   node <scratch>/verify.mjs <evidence-dir>
import { readFileSync, writeFileSync } from 'node:fs'
import { chromium } from '/home/jonah/src/repos/eVelo-v2/node_modules/playwright/index.mjs'
import { withPreview } from '/home/jonah/src/repos/eVelo-v2/scripts/serve-preview.mjs'

const HERE = new URL('.', import.meta.url).pathname
const EV = process.argv[2]
const X = JSON.parse(readFileSync(HERE + 'expected.json', 'utf8'))
const AXE = readFileSync('/home/jonah/src/repos/eVelo-v2/node_modules/axe-core/axe.min.js', 'utf8')
const log = []
const fails = []
const check = (ok, msg) => { const l = `${ok ? 'ok  ' : 'FAIL'} ${msg}`; console.log(l); log.push(l); if (!ok) fails.push(msg) }
const note = (msg) => { console.log('     ' + msg); log.push('     ' + msg) }

const KEY = 'evelo:v2:income'
const CHART = '[data-testid="income-chart"]'
const RESULTS = '[data-testid="income-results"]'
const r100 = (v) => '$' + (Math.round(Math.max(0, v) / 100) * 100).toLocaleString('en-US')
const dollars = (s) => Number(String(s).replace(/[^\d.-]/g, ''))
const pct = (r) => `${Math.round(r * 100)}%`
const taxable = (r) => r.taxableInterest + r.treasuryInterest

function workerHooks() {
  const W = window.Worker
  window.__income = []
  window.__block = false
  window.__delay = 0
  window.Worker = class extends W {
    constructor(...a) {
      super(...a)
      this.addEventListener('message', (e) => { if (e.data && e.data.kind === 'income') window.__income.push(e.data.result) })
    }
    postMessage(m, ...rest) {
      if (m && m.kind === 'income') {
        if (window.__block) { setTimeout(() => this.dispatchEvent(new ErrorEvent('error', { message: 'blocked by verifier' }))); return }
        if (window.__delay) { setTimeout(() => super.postMessage(m, ...rest), window.__delay); return }
      }
      return super.postMessage(m, ...rest)
    }
  }
}

const focusedId = (p) => p.evaluate(() => document.activeElement?.dataset?.field ?? document.activeElement?.id ?? document.activeElement?.className ?? document.activeElement?.tagName)
const overflow = (p) => p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
const progress = (p) => p.locator('[data-testid="income-progress"]').innerText().then((t) => t.replace(/\s+/g, ' ').trim())
async function settled(p, sel, layers) {
  return p.waitForFunction(([sel, n]) => {
    const el = document.querySelector(sel)
    return el && (n == null || el.dataset.layers === String(n)) && el.getAttribute('aria-busy') !== 'true' && el.dataset.status === 'current'
  }, [sel, layers], { timeout: 60000 }).then(() => true, () => false)
}
async function axe(p, label) {
  await p.addScriptTag({ content: AXE })
  const r = await p.evaluate(async () => {
    const res = await window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'] })
    return res.violations.map((v) => `${v.id} (${v.impact}) x${v.nodes.length}: ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`)
  })
  check(r.filter((v) => !v.startsWith('color-contrast')).length === 0, `${label}: axe finds no violations other than contrast (${r.length ? r.join(' ; ') : 'none'})`)
  return r
}
async function roleAudit(p, label) {
  const a = await p.evaluate(() => {
    const out = []
    for (const el of document.querySelectorAll('.iask input, .iask select, .iask button')) {
      const lab = el.labels?.[0]?.textContent.trim() || el.getAttribute('aria-label') || (el.tagName === 'BUTTON' ? el.textContent.trim() : '')
      out.push(`${el.tagName.toLowerCase()}#${el.id || ''} "${lab}"`)
    }
    return out
  })
  check(a.every((s) => !/""$/.test(s)), `${label}: role/name audit: ${a.join(', ')}`)
}
async function brassOf(p) {
  return p.evaluate(() => { const s = document.createElement('span'); s.style.color = 'var(--bruised-text)'; document.querySelector('.income').append(s); const c = getComputedStyle(s).color; s.remove(); return c })
}

/** Keyboard: type into the focused field (it selects on focus), Tab, next, …; optionally Enter. */
async function type(p, values, enter = true) {
  for (const [i, v] of values.entries()) {
    if (i > 0) await p.keyboard.press('Tab')
    await p.keyboard.type(v)
  }
  if (enter) await p.keyboard.press('Enter')
}

async function walk(browser, base, w, scheme) {
  const name = `${w}-${scheme}`
  const phone = w < 900
  const ctx = await browser.newContext(phone ? { viewport: { width: w, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, colorScheme: scheme } : { viewport: { width: w, height: 860 }, colorScheme: scheme })
  await ctx.addInitScript(workerHooks)
  await ctx.addInitScript((t) => { try { if (!localStorage.getItem('evelo:v2')) localStorage.setItem('evelo:v2', JSON.stringify({ theme: t, themeV: 2 })) } catch {} }, scheme)
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()) })
  await page.goto(base + '#income')
  await page.locator('.iask').waitFor({ timeout: 15000 })
  const shot = (n) => page.screenshot({ path: `${EV}/v-${name}-${n}.png`, fullPage: true })

  // Layout: question left / chart right on desktop; small chart above sentence on phone.
  const lay = await page.evaluate(() => { const a = document.querySelector('.iask__ask').getBoundingClientRect(); const c = document.querySelector('[data-testid="income-chart"]').getBoundingClientRect(); return { a: [a.x, a.y, a.width], c: [c.x, c.y, c.width, c.height] } })
  check(phone ? lay.c[1] < lay.a[1] && lay.c[3] < 300 : lay.a[0] < lay.c[0] && Math.abs(lay.a[1] - lay.c[1]) < 200, `${name}: ${phone ? 'small chart above the sentence' : 'question left, chart right'} (ask ${lay.a.map(Math.round)}, chart ${lay.c.map(Math.round)})`)

  // Q1 — keyboard: Tab to the first field.
  check((await progress(page)) === 'Question 1 of 6', `${name} q1: progress 1 of 6`)
  for (let i = 0; i < 20 && (await focusedId(page)) !== 'portfolio'; i++) await page.keyboard.press('Tab')
  check((await focusedId(page)) === 'portfolio', `${name} q1: Tab reaches the first field`)
  if (w === 1280 && scheme === 'light') { await roleAudit(page, `${name} q1`); await axe(page, `${name} q1`) }
  await type(page, ['1.5M', '40', '70k'], false)
  await shot('q1')
  check((await page.locator(CHART).getAttribute('data-layers')) === '0', `${name} q1: chart draws 0 layers`)
  await page.keyboard.press('Enter')
  // Q2
  check((await progress(page)) === 'Question 2 of 6' && (await focusedId(page)) === 'age', `${name} q2: Enter moves on, progress 2 of 6, focus on age (${await focusedId(page)})`)
  // Back via keyboard (Tab past horizon → Back)
  await page.keyboard.press('Tab'); await page.keyboard.press('Tab')
  const onBack = await page.evaluate(() => document.activeElement?.textContent)
  await page.keyboard.press('Enter')
  check(onBack === 'Back' && (await progress(page)) === 'Question 1 of 6' && (await page.locator('[data-field="portfolio"]').inputValue()) === '$1,500,000' && (await page.locator('[data-field="basisFraction"]').inputValue()) === '40%' && (await page.locator('[data-field="spending"]').inputValue()) === '$70,000', `${name}: Back (keyboard) returns to q1 with answers kept`)
  // Next via the button
  await page.getByRole('button', { name: 'Next' }).click()
  check((await progress(page)) === 'Question 2 of 6', `${name}: Next button moves to q2`)
  await page.locator('[data-field="age"]').focus()
  if (w === 1280 && scheme === 'light') { await roleAudit(page, `${name} q2`); await axe(page, `${name} q2`) }
  await type(page, ['66', '25'], false)
  check((await page.locator(CHART).getAttribute('data-layers')) === '0', `${name} q2: chart draws 0 layers`)
  await shot('q2')
  // Next via Tab to the Next button + Enter
  await page.keyboard.press('Tab'); await page.keyboard.press('Tab')
  const onNext = await page.evaluate(() => document.activeElement?.textContent)
  await page.keyboard.press('Enter')
  check(onNext === 'Next' && (await progress(page)) === 'Question 3 of 6' && (await focusedId(page)) === 'stockShare', `${name} q3: Next via keyboard, focus on stocks`)

  const stepCheck = async (n, layers, want, key) => {
    const ok = await settled(page, CHART, layers)
    const L = await page.locator(CHART).getAttribute('data-layers')
    const added = (await page.locator('.ic__added').innerText().catch(() => '')).trim()
    check(ok && L === String(layers), `${name} q${n}: data-layers=${L} (want ${layers})`)
    check(added === want, `${name} q${n}: "${added}" (want "${want}")`)
    const last = await page.evaluate(() => window.__income.at(-1))
    check(last && Math.abs(last.median[0].dividends - X[key].median[0].dividends) < 1e-6 && Math.abs(last.median[0].tax - X[key].median[0].tax) < 1e-6 && Math.abs(last.median[0].gapSold - X[key].median[0].gapSold) < 1e-6, `${name} q${n}: worker's year 1 equals my node runIncomePaths year 1`)
    check((await overflow(page)) <= 0, `${name} q${n}: no horizontal scroll`)
    if (w === 1280 && scheme === 'light') { await roleAudit(page, `${name} q${n}`); await axe(page, `${name} q${n}`) }
    await shot(`q${n}`)
  }
  await type(page, ['40'], false)
  const r3 = X.s3.median[0]
  await stepCheck(3, 1, `Just added: dividends, ${r100(r3.dividends)} a year`, 's3')
  if (w === 1280 && scheme === 'light') {
    await page.waitForTimeout(400)
    await page.reload()
    await page.locator('.iask').waitFor()
    check((await progress(page)) === 'Question 3 of 6' && (await page.locator('[data-field="stockShare"]').inputValue()) === '40%', `${name}: reload mid-flow resumes at q3 with 40%`)
    await settled(page, CHART, 1)
    await page.locator('[data-field="stockShare"]').focus()
  }
  await page.keyboard.press('Enter')
  check((await focusedId(page)) === 'muniShare', `${name} q4: focus on muni share`)
  await type(page, ['80'], false)
  const r4 = X.s4.median[0]
  await stepCheck(4, 2, `Just added: muni coupons, ${r100(r4.muniInterest)} a year, tax-free · taxable interest, ${r100(taxable(r4))}`, 's4')
  await page.keyboard.press('Enter')
  check((await focusedId(page)) === 'if-home', `${name} q5: focus on home city`)
  await page.keyboard.type('Chicago')
  await page.keyboard.press('Tab')
  await page.keyboard.type('jointly')
  const sel = await page.evaluate(() => [document.querySelector('#if-home').value, document.querySelector('#if-filing').value])
  check(sel[0] === 'chicago' && sel[1] === 'mfj', `${name} q5: keyboard typed selects read ${sel.join(', ')}`)
  const r5 = X.s5.median[0]
  await stepCheck(5, 3, `Just added: tax, ${r100(r5.tax)} a year`, 's5')
  await page.keyboard.press('Enter')
  check((await focusedId(page)) === 'otherIncome', `${name} q6: Enter on a select moves on; focus on Social Security`)
  await type(page, ['36k', '70'], false)
  const m6 = X.s6.median
  const ss = m6.find((r) => r.otherIncome > 0)
  await stepCheck(6, 4, `Just added: spending, ${r100(m6[0].spending)} a year · sold to cover, ${r100(m6[0].gapSold)} · Social Security, ${r100(ss.otherIncome)} from age ${ss.age}`, 's6')
  const nextLabel = await page.locator('.iask__next').innerText()
  check(nextLabel === 'See the answer', `${name} q6: the button reads "${nextLabel}"`)
  await page.keyboard.press('Enter')

  // Results
  await page.locator(RESULTS).waitFor()
  await settled(page, CHART, 5)
  const head = await page.evaluate(() => document.activeElement?.className)
  check(/ires__head/.test(head), `${name} results: focus on the results heading (${head})`)
  check((await page.locator('[data-testid="income-progress"]').count()) === 0, `${name} results: no progress mark`)
  const shown = {}
  for (const k of ['lasts', 'principal', 'pace']) shown[k] = (await page.locator(`[data-testid="income-measure-${k}"] .imeasure__rate`).innerText()).trim()
  const want = { lasts: pct(X.s6.lastsRate), principal: pct(X.s6.principalKeptRate), pace: pct(X.s6.keepsPaceRate) }
  check(JSON.stringify(shown) === JSON.stringify(want), `${name} results: measures ${JSON.stringify(shown)} = my node result ${JSON.stringify(want)} (raw ${X.s6.lastsRate}, ${X.s6.principalKeptRate}, ${X.s6.keepsPaceRate})`)
  const lastsTxt = await page.locator('.imeasure--lasts').innerText()
  const lastsColor = await page.locator('.imeasure--lasts .imeasure__rate').evaluate((e) => getComputedStyle(e).color)
  const brass = await brassOf(page)
  check(/Same test as eVelo/.test(lastsTxt) && lastsColor === brass, `${name} results: lasts card says "Same test as eVelo", rate colour ${lastsColor} (brass ${brass})`)
  const summary = (await page.locator('[data-testid="income-summary"]').innerText()).trim()
  const ratio = X.s6.afterTax0 / X.s6.inputs.spending
  check(/about half/.test(summary), `${name} results: summary "${summary}" — year-1 median after-tax ${Math.round(X.s6.afterTax0)} / ${X.s6.inputs.spending} = ${ratio.toFixed(3)} → "about half"`)
  const legend = await page.locator('.ic__legend li').allInnerTexts()
  check(legend.length >= 5, `${name} results: legend ${legend.map((s) => s.trim()).join(' / ')}`)
  // Hidden table: the last column is Sold to cover
  const hidden = await page.locator(`${CHART} .sr-only table`).evaluate((t) => ({ head: [...t.querySelectorAll('thead th')].map((h) => h.textContent), rows: [...t.querySelectorAll('tbody tr')].map((r) => [...r.children].map((c) => c.textContent)) }))
  const gi = hidden.head.indexOf('Sold to cover')
  const gapBad = hidden.rows.filter((r, i) => Math.abs(dollars(r[gi]) - m6[i].gapSold) > 0.5)
  check(gi > 0 && hidden.rows.length === 25 && gapBad.length === 0, `${name} results: chart's Sold to cover equals gapSold in all ${hidden.rows.length} rows (yr1 ${hidden.rows[0]?.[gi]} vs ${m6[0].gapSold.toFixed(2)}; yr25 ${hidden.rows[24]?.[gi]} vs ${m6[24].gapSold.toFixed(2)})`)
  const aria = await page.locator(`${CHART} svg[role="img"]`).getAttribute('aria-label')
  check(aria && aria.includes(`sold to cover ${r100(m6[0].gapSold)}`), `${name} results: chart text equivalent: "${aria?.slice(0, 160)}…"`)
  check((await overflow(page)) <= 0, `${name} results: no horizontal scroll`)
  if (w === 1280 && scheme === 'light') await axe(page, `${name} results`)
  await shot('results')
  await page.waitForTimeout(400)
  const st = await page.evaluate((k) => JSON.parse(localStorage.getItem(k)), KEY)
  const exp = { portfolio: 1.5e6, basisFraction: 0.4, spending: 70000, age: 66, horizonYears: 25, stockShare: 0.4, muniShare: 0.8, homeCityId: 'chicago', filingStatus: 'mfj', otherIncome: 36000, incomeStartAge: 70, done: true }
  const off = Object.entries(exp).filter(([k, v]) => st?.[k] !== v)
  check(off.length === 0, `${name}: saved under ${KEY}: ${JSON.stringify(st)}`)

  // Ledger
  await page.getByRole('button', { name: 'See year by year' }).focus()
  await page.keyboard.press('Enter')
  const dlg = page.getByRole('dialog')
  await dlg.waitFor()
  const rows = await dlg.locator('tbody tr').evaluateAll((trs) => trs.map((tr) => [...tr.children].map((c) => c.textContent.trim())))
  const cols = ['dividends', 'muniInterest', 'taxableInterest', 'treasuryInterest', 'otherIncome', 'tax', 'gapSold']
  for (const y of [1, 9, 25]) {
    const got = rows[y - 1].slice(1, 8)
    const exp2 = cols.map((c) => r100(m6[y - 1][c]))
    check(JSON.stringify(got) === JSON.stringify(exp2), `${name} ledger year ${y} (${rows[y - 1][0]}): ${got.join(' ')} vs mine ${exp2.join(' ')}; value ${rows[y - 1][8]} vs ${Math.round(m6[y - 1].value)}`)
  }
  check(rows.length === 25, `${name} ledger: ${rows.length} rows`)
  const box = await page.locator('.iledger__scroll').evaluate((e) => ({ sw: e.scrollWidth, cw: e.clientWidth, ox: getComputedStyle(e).overflowX }))
  if (phone) {
    await page.locator('.iledger__scroll').evaluate((e) => { e.scrollLeft = 200 })
    const sl = await page.locator('.iledger__scroll').evaluate((e) => e.scrollLeft)
    check(box.sw > box.cw && /auto|scroll/.test(box.ox) && sl > 0 && (await overflow(page)) <= 0, `${name} ledger: scrolls inside its box (scrollWidth ${box.sw} > ${box.cw}, scrolled ${sl}), page overflow ${await overflow(page)}`)
  } else check((await overflow(page)) <= 0, `${name} ledger: no page scroll (box ${box.sw}/${box.cw})`)
  await page.screenshot({ path: `${EV}/v-${name}-ledger.png` })
  await page.keyboard.press('Escape')
  await dlg.waitFor({ state: 'hidden' })

  // How it's worked out
  await page.locator('.ihow__summary').focus()
  await page.keyboard.press('Enter')
  const how = await page.locator('.ihow__body').innerText()
  const topics = { AMT: /alternative minimum tax/i, IRMAA: /IRMAA/, perState: /State retirement-income exclusions.*Portland.*Washington.*Massachusetts.*Hawaii/s, foreign: /outside the US gets US federal tax only/, historical: /always drawn from historical months/ }
  const miss = Object.entries(topics).filter(([, re]) => !re.test(how)).map(([k]) => k)
  check(miss.length === 0, `${name} how: covers ${Object.keys(topics).join(', ')}${miss.length ? ' — missing ' + miss : ''}`)
  await page.locator('.ihow').screenshot({ path: `${EV}/v-${name}-how.png` })

  // Reload resumes on results; Edit answers reopens with values
  await page.reload()
  await page.locator(RESULTS).waitFor({ timeout: 15000 })
  check((await page.locator('.iask').count()) === 0, `${name}: reload resumes on the results`)
  await settled(page, CHART, 5)
  await page.getByRole('button', { name: 'Edit answers' }).focus()
  await page.keyboard.press('Enter')
  await page.locator('.iask').waitFor()
  check((await progress(page)) === 'Question 1 of 6' && (await page.locator('[data-field="portfolio"]').inputValue()) === '$1,500,000' && (await focusedId(page)) === 'portfolio', `${name}: Edit answers reopens q1 with $1,500,000, focus on it`)

  // Change an answer → Updating… shows and clears (worker delayed 1.5 s so the label can be seen)
  await page.evaluate(() => { window.__delay = 1500 })
  await page.keyboard.press('Tab'); await page.keyboard.press('Tab')
  await page.keyboard.type('75k')
  for (let i = 0; i < 4; i++) await page.keyboard.press('Enter')
  await page.keyboard.press('Enter') // q5 select
  await page.keyboard.press('Enter') // q6 → results
  await page.locator(RESULTS).waitFor()
  const upd = await page.waitForFunction(() => document.querySelector('[data-testid="income-status"]')?.textContent === 'Updating…', null, { timeout: 5000 }).then(() => true, () => false)
  const dim = await page.locator(RESULTS).evaluate((e) => getComputedStyle(e.querySelector('[data-testid="income-chart"]')).opacity)
  await page.screenshot({ path: `${EV}/v-${name}-updating.png`, fullPage: true })
  const cleared = await page.waitForFunction(() => document.querySelector('[data-testid="income-status"]')?.textContent === '' && document.querySelector('[data-testid="income-results"]').dataset.status === 'current', null, { timeout: 30000 }).then(() => true, () => false)
  const pace2 = (await page.locator('[data-testid="income-measure-pace"] .imeasure__rate').innerText()).trim()
  check(upd && cleared && pace2 === pct(X.s6b.keepsPaceRate), `${name}: change on results: "Updating…" shown (chart opacity ${dim}) then cleared; pace now ${pace2} = mine ${pct(X.s6b.keepsPaceRate)} at $75k`)
  await page.evaluate(() => { window.__delay = 0 })

  // Block the worker, change an answer → out-of-date label
  await page.evaluate(() => { window.__block = true })
  await page.getByRole('button', { name: 'Edit answers' }).click()
  await page.locator('[data-field="spending"]').focus()
  await page.keyboard.type('80k')
  const staleAsk = await page.waitForFunction(() => document.querySelector('[data-testid="income-chart"]')?.dataset.status === 'stale', null, { timeout: 15000 }).then(() => true, () => false)
  const askLabel = (await page.locator('.ichart-panel__busy').innerText().catch(() => '')).trim()
  await page.screenshot({ path: `${EV}/v-${name}-stale-ask.png`, fullPage: true })
  for (let i = 0; i < 6; i++) await page.keyboard.press('Enter')
  await page.locator(RESULTS).waitFor()
  await page.waitForFunction(() => document.querySelector('[data-testid="income-results"]')?.dataset.status === 'stale', null, { timeout: 15000 }).catch(() => {})
  const lab = page.locator('[data-testid="income-status"]')
  const rl = (await lab.innerText()).trim()
  const lc = await lab.evaluate((e) => getComputedStyle(e).color)
  const op = await page.locator(CHART).evaluate((e) => getComputedStyle(e).opacity)
  const brass2 = await brassOf(page)
  check(staleAsk && askLabel === 'These figures are for your earlier answers' && rl === askLabel && Number(op) < 1, `${name}: blocked worker → "${rl}" (ask: "${askLabel}"), chart opacity ${op}, label colour ${lc} vs brass ${brass2}${lc === brass2 ? ' (brass)' : ' (NOT brass)'}`)
  const alert = await page.locator('[role="alert"]').innerText().catch(() => '')
  note(`${name}: error alert: "${alert.trim()}"`)
  await page.screenshot({ path: `${EV}/v-${name}-stale-results.png`, fullPage: true })
  const realErrors = errors.filter((e) => !/blocked by verifier/.test(e))
  check(realErrors.length === 0, `${name}: no console/page errors${realErrors.length ? ': ' + realErrors.join(' | ') : ''}`)
  await ctx.close()
  return { brass: brass2, staleColor: lc }
}

async function narrow(browser, base, w) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 700 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
  const ans = { portfolio: 1.5e6, basisFraction: 0.4, spending: 70000, age: 66, horizonYears: 25, stockShare: 0.4, muniShare: 0.8, homeCityId: 'chicago', filingStatus: 'mfj', otherIncome: 36000, incomeStartAge: 70 }
  const res = []
  for (const s of [1, 2, 3, 4, 5, 6, 'done']) {
    const page = await ctx.newPage()
    await page.addInitScript(([k, v]) => localStorage.setItem(k, v), [KEY, JSON.stringify({ ...ans, step: s === 'done' ? 6 : s, done: s === 'done' })])
    await page.goto(base + '#income')
    await page.locator('.iask, ' + RESULTS).first().waitFor()
    await settled(page, CHART, null)
    res.push(`${s}:${await overflow(page)}`)
    if (s === 6 || s === 'done') await page.screenshot({ path: `${EV}/v-${w}-${s}.png`, fullPage: true })
    if (s === 'done') {
      await page.getByRole('button', { name: 'See year by year' }).click()
      await page.getByRole('dialog').waitFor()
      res.push(`ledger:${await overflow(page)}`)
      await page.screenshot({ path: `${EV}/v-${w}-ledger.png` })
    }
    await page.close()
  }
  check(res.every((r) => Number(r.split(':')[1]) <= 0), `${w}px: horizontal overflow per step ${res.join(' ')}`)
  await ctx.close()
}

await withPreview(async (base) => {
  const browser = await chromium.launch()
  try {
    for (const w of [1280, 390]) for (const s of ['light', 'dark']) await walk(browser, base, w, s)
    await narrow(browser, base, 390)
    await narrow(browser, base, 320)
  } finally {
    await browser.close()
  }
}, 4191)
writeFileSync(`${EV}/verify-own.txt`, `$ node ${HERE}verify.mjs ${EV}\n` + log.join('\n') + `\n\n${fails.length} failed\n`)
console.log(`\n${fails.length} failed`)
process.exit(fails.length ? 1 : 0)
