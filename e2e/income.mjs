// End-to-end check of the hidden living-on-income mode (#income) on the built app, in headless
// Chromium. Run after `npm run build`: `node e2e/income.mjs`. Exits non-zero on any failure.
// Screenshots go to e2e/screenshots/ (git-ignored).
import { mkdirSync } from 'node:fs'
import { chromium } from 'playwright'
import { withPreview } from '../scripts/serve-preview.mjs'

const SHOTS = new URL('./screenshots/', import.meta.url).pathname
mkdirSync(SHOTS, { recursive: true })

const fails = []
const check = (ok, msg) => { console.log(`${ok ? 'ok  ' : 'FAIL'} ${msg}`); if (!ok) fails.push(msg) }
const isModeChunk = (url) => /\/assets\/IncomeMode-[^/]+\.(js|css)$/.test(url)
const KEY = 'evelo:v2:income'
const CHART = '[data-testid="income-chart"]'
const RESULTS = '[data-testid="income-results"]'
const PROGRESS = '[data-testid="income-progress"]'
const field = (k) => `[data-field="${k}"]`

// Records every income answer the worker sends, so the page's numbers can be checked against it.
function captureWorker() {
  const W = window.Worker
  window.__income = []
  window.Worker = class extends W {
    constructor(...a) {
      super(...a)
      this.addEventListener('message', (e) => { if (e.data && e.data.kind === 'income') window.__income.push(e.data.result) })
    }
  }
}

const phoneCtx = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }
const deskCtx = { viewport: { width: 1280, height: 860 } }

/** Waits until the chart draws `n` layers and nothing is being worked out. */
async function layersAre(page, n) {
  try {
    await page.waitForFunction(
      ([sel, n]) => { const el = document.querySelector(sel); return el && el.dataset.layers === String(n) && el.getAttribute('aria-busy') !== 'true' },
      [CHART, n],
      { timeout: 60000 },
    )
    return true
  } catch {
    return false
  }
}
const layersNow = (page) => page.locator(CHART).getAttribute('data-layers')
const overflow = (page) => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
const stored = (page) => page.evaluate((k) => JSON.parse(localStorage.getItem(k) ?? 'null'), KEY)
const focused = (page) => page.evaluate(() => document.activeElement?.dataset?.field ?? document.activeElement?.id ?? document.activeElement?.tagName)
const pct = (r) => `${Math.round(r * 100)}%`

/** The six questions, each with what to type and the layer count it should draw. */
const QUESTIONS = [
  { first: 'portfolio', fill: { portfolio: '2.4M', basisFraction: '60', spending: '96k' }, layers: 0 },
  { first: 'age', fill: { age: '62', horizonYears: '30' }, layers: 0 },
  { first: 'stockShare', fill: { stockShare: '55%' }, layers: 1, added: /dividends, \$[\d,]+ a year/ },
  { first: 'muniShare', fill: { muniShare: '70' }, layers: 2, added: /muni coupons, \$[\d,]+ a year/ },
  { first: 'if-home', select: { 'if-home': 'new-york', 'if-filing': 'mfj' }, layers: 3, added: /tax, \$[\d,]+ a year/ },
  { first: 'otherIncome', fill: { otherIncome: '$40,000', incomeStartAge: '67' }, layers: 4, added: /spending, \$96,000 a year/ },
]
const EXPECT = { portfolio: 2_400_000, basisFraction: 0.6, spending: 96_000, age: 62, horizonYears: 30, stockShare: 0.55, muniShare: 0.7, homeCityId: 'new-york', filingStatus: 'mfj', otherIncome: 40_000, incomeStartAge: 67, step: 6, done: true }

async function walk(browser, base, { w, scheme }) {
  const name = `${w}-${scheme}`
  const ctx = await browser.newContext({ ...(w === 390 ? phoneCtx : deskCtx), colorScheme: scheme, reducedMotion: 'reduce' })
  await ctx.addInitScript(captureWorker)
  // eVelo's theme lives in its own key; dark is the default, so light is chosen there.
  await ctx.addInitScript((t) => { try { if (!localStorage.getItem('evelo:v2')) localStorage.setItem('evelo:v2', JSON.stringify({ theme: t, themeV: 2 })) } catch {} }, scheme)
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  await page.goto(base + '#income')
  await page.locator('.iask').waitFor({ timeout: 15000 })
  check((await page.locator('.ichart-panel__empty').innerText()).includes('Your income builds here as you answer'), `${name}: before question 3 the chart frame is empty with its calm line`)

  const seen = []
  for (const [i, q] of QUESTIONS.entries()) {
    const n = i + 1
    check((await page.locator(PROGRESS).innerText()).replace(/\s+/g, ' ').trim() === `Question ${n} of 6`, `${name} q${n}: progress reads ${n} of 6`)
    if (n > 1) check((await focused(page)) === q.first, `${name} q${n}: focus moved to the new sentence's first field (${await focused(page)})`)
    for (const [k, v] of Object.entries(q.fill ?? {})) await page.locator(field(k)).fill(v)
    for (const [id, v] of Object.entries(q.select ?? {})) await page.locator('#' + id).selectOption(v)
    // every field labelled
    const unlabelled = await page.locator('.iask input, .iask select').evaluateAll((els) => els.filter((e) => !e.labels?.length || !e.labels[0].textContent.trim()).length)
    check(unlabelled === 0, `${name} q${n}: every field has a label`)
    const ok = await layersAre(page, q.layers)
    const L = Number(await layersNow(page))
    seen.push(L)
    check(ok, `${name} q${n}: chart draws ${q.layers} layer(s) (${L})`)
    if (q.added) {
      const added = (await page.locator('.ic__added').innerText().catch(() => '')).trim()
      check(q.added.test(added), `${name} q${n}: names what it just added (${added})`)
    }
    check((await overflow(page)) <= 0, `${name} q${n}: no horizontal scroll`)
    await page.screenshot({ path: `${SHOTS}income-${name}-q${n}.png`, fullPage: true })
    if (n === 1) await page.locator(field('basisFraction')).press('Enter')
    else await page.getByRole('button', { name: n === 6 ? 'See the answer' : 'Next' }).click()
  }
  check(seen.every((v, i) => i === 0 || v >= seen[i - 1]) && seen[seen.length - 1] > seen[0], `${name}: the layer count grows step by step (${seen.join(' → ')})`)

  // Results
  await page.locator(RESULTS).waitFor()
  const okResults = await layersAre(page, 5)
  await page.waitForFunction((sel) => document.querySelector(sel)?.getAttribute('aria-busy') === 'false', RESULTS, { timeout: 60000 }).catch(() => {})
  check(okResults, `${name}: results draw every layer (5)`)
  check((await page.locator(PROGRESS).count()) === 0, `${name}: results show no question progress`)
  const last = await page.evaluate(() => window.__income.at(-1))
  const shown = {}
  for (const k of ['lasts', 'principal', 'pace']) shown[k] = (await page.locator(`[data-testid="income-measure-${k}"] .imeasure__rate`).innerText()).trim()
  const want = last ? { lasts: pct(last.lastsRate), principal: pct(last.principalKeptRate), pace: pct(last.keepsPaceRate) } : null
  check(want && JSON.stringify(shown) === JSON.stringify(want), `${name}: the three measures equal the worker's result (${JSON.stringify(shown)} vs ${JSON.stringify(want)})`)
  check(last && last.years === 30 && last.median[0].age === 62, `${name}: the worker ran on the typed answers (${last?.years} years from ${last?.median?.[0]?.age})`)
  check((await page.locator('.imeasure--lasts').innerText()).includes('Same test as eVelo'), `${name}: lasts card says "Same test as eVelo"`)
  check((await page.locator('.ic__legend li').count()) >= 5, `${name}: the results chart has a legend`)
  check((await page.locator('[data-testid="income-summary"]').innerText()).trim().length > 20, `${name}: one-line summary shown`)
  check((await overflow(page)) <= 0, `${name} results: no horizontal scroll`)
  await page.waitForTimeout(400) // past the debounced save
  const st = await stored(page)
  const bad = Object.entries(EXPECT).filter(([k, v]) => (typeof v === 'number' ? Math.abs(st?.[k] - v) > 1e-9 : st?.[k] !== v))
  check(bad.length === 0, `${name}: answers saved to ${KEY}${bad.length ? ' — off: ' + bad.map(([k]) => `${k}=${st?.[k]}`).join(', ') : ''}`)
  await page.screenshot({ path: `${SHOTS}income-${name}-results.png`, fullPage: true })

  // The ledger, in the sheet
  await page.getByRole('button', { name: 'See year by year' }).click()
  const sheet = page.getByRole('dialog')
  await sheet.waitFor()
  const rows = await sheet.locator('tbody tr').count()
  check(rows === 30, `${name}: the ledger lists the 30 median years (${rows})`)
  check((await overflow(page)) <= 0, `${name} ledger: no horizontal page scroll`)
  await page.screenshot({ path: `${SHOTS}income-${name}-ledger.png` })
  await page.keyboard.press('Escape')
  await sheet.waitFor({ state: 'hidden' })

  // How this is worked out
  await page.locator('.ihow__summary').click()
  const howText = await page.locator('.ihow__body').innerText()
  check((await page.locator('.ihow[open]').count()) === 1 && /alternative minimum tax/i.test(howText) && /IRMAA/.test(howText), `${name}: "How this is worked out" opens and names what's left out`)
  await page.locator('.ihow').screenshot({ path: `${SHOTS}income-${name}-how.png` })

  // A returning visitor lands on the results
  await page.reload()
  await page.locator(RESULTS).waitFor({ timeout: 15000 })
  check((await page.locator('.iask').count()) === 0, `${name}: reload lands on the results`)

  // Edit answers returns to question 1 with the answers kept
  await page.getByRole('button', { name: 'Edit answers' }).click()
  await page.locator('.iask').waitFor()
  check((await page.locator(PROGRESS).innerText()).includes('1 of 6'), `${name}: Edit answers returns to question 1`)
  check((await page.locator(field('portfolio')).inputValue()) === '$2,400,000' && (await page.locator(field('spending')).inputValue()) === '$96,000', `${name}: the answers are kept`)
  check((await focused(page)) === 'portfolio', `${name}: Edit answers focuses the first field`)
  await page.getByRole('button', { name: 'Next' }).click()
  await page.getByRole('button', { name: 'Back' }).click()
  check((await page.locator(PROGRESS).innerText()).includes('1 of 6'), `${name}: Back returns to the previous question`)
  check(errors.length === 0, `${name}: no uncaught page errors${errors.length ? ': ' + errors.join(' | ') : ''}`)
  await ctx.close()
}

// A port of its own, so this can run beside other previews.
await withPreview(async (base) => {
  const browser = await chromium.launch()
  try {
    // 1. Lazy loading: no mode chunk on the landing or #plan (even after the idle prefetch); then
    //    #income fetches it and renders the first question.
    {
      const ctx = await browser.newContext(deskCtx)
      const page = await ctx.newPage()
      const errors = []
      page.on('pageerror', (e) => errors.push(e.message))
      const requested = []
      page.on('request', (r) => requested.push(r.url()))

      await page.goto(base)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(2000) // past the idle prefetch of other views
      check(!requested.some(isModeChunk), 'landing: mode chunk not requested')
      check((await page.locator('a[href*="income" i]').count()) === 0, 'landing: no link to the mode')

      await page.goto(base + '#plan')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(2000)
      check(!requested.some(isModeChunk), '#plan: mode chunk not requested')
      const nav = await page.locator('.topnav').innerText()
      check(nav.length > 0 && !/income/i.test(nav), `#plan: top nav doesn't show the mode (${nav.replace(/\s+/g, ' ')})`)
      check((await page.locator('a[href*="income" i]').count()) === 0, '#plan: no link to the mode')

      await page.goto(base + '#method')
      await page.waitForLoadState('networkidle')
      check((await page.locator('a[href*="income" i]').count()) === 0, '#method: no link to the mode')
      check(!requested.some(isModeChunk), '#method: mode chunk not requested')

      await page.goto(base + '#income')
      await page.locator('.income .iask').waitFor({ timeout: 15000 })
      check(requested.some(isModeChunk), '#income: mode chunk requested')
      check((await page.locator('.topnav, .tabbar').count()) === 0, "#income: eVelo's nav isn't drawn in the mode")
      const color = await page.locator(field('portfolio')).evaluate((el) => getComputedStyle(el).color)
      const brass = await page.evaluate(() => {
        const probe = document.createElement('span')
        probe.style.color = 'var(--bruised-text)'
        document.body.append(probe)
        const c = getComputedStyle(probe).color
        probe.remove()
        return c
      })
      check(color === brass, `#income: the fields are brass (${color})`)
      const font = await page.locator('.iask__sentence').evaluate((el) => getComputedStyle(el).fontFamily)
      check(/Instrument Serif/.test(font), `#income: the sentence is set in Instrument Serif`)

      await page.getByRole('link', { name: /back to evelo/i }).click()
      await page.waitForFunction(() => location.hash === '#plan')
      await page.locator('.topnav').waitFor()
      check(true, '#income: "Back to eVelo" returns to the plan')
      check(errors.length === 0, `no uncaught page errors${errors.length ? ': ' + errors.join(' | ') : ''}`)
      await ctx.close()
    }

    // 2. The six questions, the results, the ledger, the notes, reload and Edit answers — at 1280
    //    and 390, light and dark.
    for (const w of [1280, 390]) for (const scheme of ['light', 'dark']) await walk(browser, base, { w, scheme })

    // 3. Keyboard only: Tab to the first field, type, Tab, Enter through all six.
    {
      const ctx = await browser.newContext({ ...deskCtx, reducedMotion: 'reduce' })
      await ctx.addInitScript(captureWorker)
      const page = await ctx.newPage()
      await page.goto(base + '#income')
      await page.locator('.iask').waitFor()
      let tabs = 0
      while ((await focused(page)) !== 'portfolio' && tabs < 12) { await page.keyboard.press('Tab'); tabs++ }
      check((await focused(page)) === 'portfolio', `keyboard: Tab reaches the first field (${tabs} presses)`)
      const type = async (...vals) => {
        for (const [i, v] of vals.entries()) {
          if (i) await page.keyboard.press('Tab')
          await page.keyboard.type(v)
        }
        await page.keyboard.press('Enter')
      }
      await type('3M', '50', '120k')
      check((await focused(page)) === 'age', 'keyboard: Enter moves to question 2, focus on age')
      await type('60', '35')
      await type('50')
      await type('40')
      check((await focused(page)) === 'if-home', 'keyboard: question 5 focuses the home city')
      await page.keyboard.press('ArrowDown')
      await page.keyboard.press('Tab')
      await page.keyboard.press('ArrowDown')
      await page.keyboard.press('Enter')
      check((await focused(page)) === 'otherIncome', 'keyboard: Enter on a select moves on')
      await type('30k', '70')
      await page.locator(RESULTS).waitFor({ timeout: 5000 }).catch(() => {})
      check((await page.locator(RESULTS).count()) === 1, 'keyboard: Enter on question 6 shows the results')
      check((await page.evaluate(() => document.activeElement?.classList.contains('ires__head'))), 'keyboard: focus moves to the results heading')
      await page.waitForTimeout(400)
      const st = await stored(page)
      check(st.portfolio === 3e6 && st.basisFraction === 0.5 && st.spending === 120_000 && st.age === 60 && st.horizonYears === 35 && st.stockShare === 0.5 && st.muniShare === 0.4 && st.filingStatus === 'mfj' && st.otherIncome === 30_000 && st.incomeStartAge === 70 && st.done === true,
        `keyboard: every answer typed was saved (${JSON.stringify({ p: st.portfolio, s: st.spending, a: st.age, h: st.horizonYears, city: st.homeCityId, f: st.filingStatus, ss: st.otherIncome, done: st.done })})`)
      await ctx.close()
    }

    // 4. Stored state: a valid value is read; out-of-range answers are clamped; corrupt or hostile
    //    values open the mode on the defaults at question 1.
    const openWith = async (raw) => {
      const ctx = await browser.newContext(deskCtx)
      await ctx.addInitScript((v) => { try { if (v !== null) localStorage.setItem('evelo:v2:income', v) } catch {} }, raw)
      const page = await ctx.newPage()
      const errs = []
      page.on('pageerror', (e) => errs.push(e.message))
      await page.goto(base + '#income')
      await page.locator('.iask, ' + RESULTS).first().waitFor({ timeout: 15000 })
      const state = {
        results: await page.locator(RESULTS).count(),
        progress: (await page.locator(PROGRESS).innerText().catch(() => '')).replace(/\s+/g, ' ').trim(),
        portfolio: await page.locator(field('portfolio')).inputValue().catch(() => null),
        spending: await page.locator(field('spending')).inputValue().catch(() => null),
        text: await page.locator('#root').innerText(),
        errs,
      }
      await ctx.close()
      return state
    }
    const D = await openWith(null)
    check(D.progress === 'Question 1 of 6' && D.portfolio && D.spending, `defaults: question 1 with ${D.portfolio}, ${D.spending}`)
    const S = await openWith('{"spending":60000,"step":3}')
    check(S.progress === 'Question 3 of 6', `stored state: resumes at the saved question (${S.progress})`)
    const S1 = await openWith('{"spending":60000}')
    check(S1.spending === '$60,000', `stored state: the mode reads the saved answers (${S1.spending})`)
    const R = await openWith('{"done":true}')
    check(R.results === 1, 'stored state: a finished flow lands on the results')
    const C = await openWith('{"step":42,"portfolio":-5,"done":"yes"}')
    check(C.progress === 'Question 6 of 6' && C.results === 0, `stored state: out-of-range step clamps and done needs true (${C.progress})`)
    for (const [name, raw] of [
      ['bad JSON', '{not json'],
      ['wrong shape', '[1,2,3]'],
      ['hostile keys and values', '{"__proto__":{"portfolio":1,"done":true},"constructor":{"prototype":{"x":1}},"portfolio":"lots","age":null,"filingStatus":"bogus","method":"magic","paths":7,"homeCityId":"__proto__","step":"6"}'],
    ]) {
      const r = await openWith(raw)
      check(r.progress === D.progress && r.portfolio === D.portfolio && r.spending === D.spending && !r.text.includes('Something went wrong'), `corrupt state (${name}): mode opens on the defaults`)
      check(r.errs.length === 0, `corrupt state (${name}): no uncaught page errors${r.errs.length ? ': ' + r.errs.join(' | ') : ''}`)
    }

    // 5. Out-of-date figures: changing an answer dims the figures with "Updating…" until the new
    //    result lands (at 1280 and on phone); a run that fails leaves the old figures dimmed and
    //    labelled as being for the earlier answers, on the questions and on the results.
    for (const w of [1280, 390]) {
      const name = `stale-${w}`
      const ctx = await browser.newContext({ ...(w === 390 ? phoneCtx : deskCtx), reducedMotion: 'reduce' })
      await ctx.addInitScript(() => { try { localStorage.setItem('evelo:v2:income', JSON.stringify({ step: 6 })) } catch {} })
      // A switch that makes the mode's worker fail its next request, as a crashed or blocked worker would.
      await ctx.addInitScript(() => {
        const W = window.Worker
        window.__blockIncome = false
        window.Worker = class extends W {
          postMessage(m, ...rest) {
            if (window.__blockIncome && m && m.kind === 'income') { setTimeout(() => this.dispatchEvent(new ErrorEvent('error', { message: 'blocked' }))); return }
            return super.postMessage(m, ...rest)
          }
        }
      })
      const page = await ctx.newPage()
      const errors = []
      page.on('pageerror', (e) => errors.push(e.message))
      await page.goto(base + '#income')
      check(await layersAre(page, 4), `${name}: question 6 draws its four layers`)
      const status = () => page.locator(CHART).getAttribute('data-status')
      check((await status()) === 'current', `${name}: the figures start current`)
      // Watch every status the chart passes through.
      await page.evaluate((sel) => {
        window.__statuses = []
        const el = document.querySelector(sel)
        new MutationObserver(() => window.__statuses.push(el.dataset.status)).observe(el, { attributes: true, attributeFilter: ['data-status'] })
      }, CHART)
      await page.locator(field('otherIncome')).fill('$35,000')
      const updatingText = (await page.locator('.ichart-panel__busy').innerText().catch(() => '')).trim()
      const dimmed = await page.locator('.ichart-panel__figure').evaluate((el) => Number(getComputedStyle(el).opacity))
      check(updatingText === 'Updating…' && dimmed < 1, `${name}: changing an answer dims the chart and says "Updating…" (${updatingText}, opacity ${dimmed})`)
      check(await page.locator('.ichart-panel__busy').isVisible(), `${name}: "Updating…" is visible`)
      if (w === 390) await page.screenshot({ path: `${SHOTS}income-${name}-updating.png` })
      const cleared = await page.waitForFunction((sel) => document.querySelector(sel)?.dataset.status === 'current', CHART, { timeout: 60000 }).then(() => true, () => false)
      const seenStatuses = await page.evaluate(() => window.__statuses)
      check(cleared && seenStatuses.includes('updating'), `${name}: "Updating" appears and clears (${seenStatuses.join(' → ')})`)
      check((await page.locator('.ichart-panel__busy').innerText()).trim() === '' && (await page.locator('.ichart-panel__figure').evaluate((el) => getComputedStyle(el).opacity)) === '1', `${name}: the chart is back to full strength`)

      // The worker fails the next run.
      await page.evaluate(() => { window.__blockIncome = true })
      await page.locator(field('otherIncome')).fill('$30,000')
      const stale = await page.waitForFunction((sel) => document.querySelector(sel)?.dataset.status === 'stale', CHART, { timeout: 15000 }).then(() => true, () => false)
      const label = (await page.locator('.ichart-panel__busy').innerText().catch(() => '')).trim()
      check(stale && label === 'These figures are for your earlier answers' && (await page.locator('.ichart-panel__busy').isVisible()), `${name}: after a failed run the label says the figures are for earlier answers (${label})`)
      const alert = (await page.getByRole('alert').innerText().catch(() => '')).trim()
      check(alert === 'This couldn’t be worked out. Change an answer to try again, or reload.', `${name}: the alert says how to try again (${alert})`)
      check((await page.locator('.ichart-panel__figure').evaluate((el) => Number(getComputedStyle(el).opacity))) < 1, `${name}: the earlier figures are dimmed`)
      await page.screenshot({ path: `${SHOTS}income-${name}-stale-ask.png`, fullPage: true })

      // The results say so too, and dim the summary and measures.
      await page.getByRole('button', { name: 'See the answer' }).click()
      await page.locator(RESULTS).waitFor()
      const rLabel = (await page.getByTestId('income-status').innerText()).trim()
      const rDim = await page.locator('.imeasures').evaluate((el) => Number(getComputedStyle(el).opacity))
      check(rLabel === 'These figures are for your earlier answers' && rDim < 1 && (await page.locator(RESULTS).getAttribute('data-status')) === 'stale', `${name}: the results are dimmed and labelled out of date (${rLabel}, opacity ${rDim})`)
      check((await overflow(page)) <= 0, `${name}: no horizontal scroll`)
      await page.screenshot({ path: `${SHOTS}income-${name}-stale-results.png`, fullPage: true })

      // Unblocked, the next change works it out again and the labels go.
      await page.evaluate(() => { window.__blockIncome = false })
      await page.getByRole('button', { name: 'Edit answers' }).click()
      await page.locator(field('spending')).fill('90k')
      const back = await page.waitForFunction((sel) => document.querySelector(sel)?.dataset.status === 'current', CHART, { timeout: 60000 }).then(() => true, () => false)
      check(back && (await page.getByRole('alert').count()) === 0, `${name}: changing an answer tries again and clears the error`)
      check(errors.length === 0, `${name}: no uncaught page errors${errors.length ? ': ' + errors.join(' | ') : ''}`)
      await ctx.close()
    }
  } finally {
    await browser.close()
  }
}, 4183)

if (fails.length) { console.error(`\n${fails.length} income e2e check(s) failed`); process.exit(1) }
console.log(`\nincome e2e passed — screenshots in ${SHOTS}`)
