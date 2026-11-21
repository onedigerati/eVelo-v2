// End-to-end smoke test: the built app in headless Chromium.
// `npm run e2e` (builds first). Exits non-zero on any failure.
import { chromium } from 'playwright'
import { withPreview } from '../scripts/serve-preview.mjs'

const fails = []
const check = (ok, msg) => { console.log(`${ok ? 'ok  ' : 'FAIL'} ${msg}`); if (!ok) fails.push(msg) }
/** A `#p=` payload as share.ts encodeInputs builds it: base64url (no padding) of {v:1, d:diff}. */
const encode = (d) => Buffer.from(JSON.stringify({ v: 1, d })).toString('base64url')

await withPreview(async (base) => {
  const browser = await chromium.launch()
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
    const errors = []
    page.on('pageerror', (e) => errors.push(e.message))
    await page.goto(base)
    await page.waitForLoadState('networkidle')
    check((await page.locator('body').innerText()).trim().length > 0, 'landing renders text')
    await page.goto(base + '#atlas')
    await page.waitForLoadState('networkidle')
    check((await page.locator('#root').innerHTML()).length > 1000, 'Atlas route renders')
    check(errors.length === 0, `no uncaught page errors${errors.length ? ': ' + errors.join(' | ') : ''}`)

    // Hostile and edge-case share links: each must draw the app (not the recovery screen, not blank),
    // with no uncaught errors, and again after a reload (which loads the plan the link stored).
    const LINKS = [
      ['home "constructor"', { homeCityId: 'constructor' }],
      ['destination "__proto__"', { destCityId: '__proto__' }],
      ['holding "constructor"', { holdings: [{ symbol: 'constructor', weight: 1 }] }],
      ['stay home', { destCityId: null }],
    ]
    for (const [name, d] of LINKS) {
      const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
      const p = await ctx.newPage()
      const errs = []
      p.on('pageerror', (e) => errs.push(e.message))
      await p.goto(base + '#plan?p=' + encode(d))
      for (const when of ['link', 'reload']) {
        if (when === 'reload') await p.reload()
        await p.waitForLoadState('networkidle')
        const text = await p.locator('#root').innerText()
        check(text.includes('Where you live') && !text.includes('Something went wrong'), `${name} (${when}): plan renders, no recovery screen`)
        if (name === 'stay home') {
          // Plan sections start collapsed (and remember being opened): open "Where you live" if shut.
          const place = p.locator('.section__head', { hasText: 'Where you live' }).first()
          if ((await place.getAttribute('aria-expanded')) === 'false') await place.click()
          await p.getByText('Retire to').first().waitFor()
          const text = await p.locator('#root').innerText()
          // The "Retire to" select shows its value on the next line; Bangkok is the default destination.
          const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)
          const shown = lines[lines.indexOf('Retire to') + 1]
          check(shown === 'Stay home' && !text.includes('Bangkok'), `${name} (${when}): "Retire to" shows Stay home, no Bangkok (got ${shown})`)
        }
      }
      check(errs.length === 0, `${name}: no uncaught page errors${errs.length ? ': ' + errs.join(' | ') : ''}`)
      await ctx.close()
    }

    // The two-retirements walkthrough on #income: absent before a sync, under the comparison after
    // one; Next chapter, the slider spanning just the chapter, and Play stopping at its end (a
    // two-year first chapter: Social Security at 62 from 60, so Play takes one step). Then Same
    // storm on the same page.
    {
      const EVELO = { portfolio: 2_000_000, age: 60, horizonYears: 20, homeCityId: 'new-york', otherIncome: 30_000, incomeStartAge: 62, paths: 300, seed: 11 }
      const MODE = { portfolio: 2_000_000, basisFraction: 0.5, age: 60, horizonYears: 20, spending: 90_000, otherIncome: 30_000, incomeStartAge: 62, stockShare: 0.6, muniShare: 0.5, filingStatus: 'mfj', homeCityId: 'new-york', seed: 11, paths: 300, blockMonths: 36, outlook: 'balanced', step: 6, done: true }
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } })
      await ctx.addInitScript(([e, m]) => {
        try {
          if (!localStorage.getItem('evelo:v2')) localStorage.setItem('evelo:v2', JSON.stringify({ inputs: e, theme: 'light', themeV: 2 }))
          if (!localStorage.getItem('evelo:v2:income')) localStorage.setItem('evelo:v2:income', JSON.stringify(m))
        } catch {}
      }, [EVELO, MODE])
      const p = await ctx.newPage()
      const errs = []
      p.on('pageerror', (e) => errs.push(e.message))
      await p.goto(base + '#income')
      await p.locator('[data-testid="income-results"]').waitFor({ timeout: 20000 })
      const WT = '[data-testid="walkthrough"]'
      check((await p.locator(WT).count()) === 0, 'walkthrough: absent before sync')
      await p.getByRole('button', { name: 'Sync with my eVelo plan' }).click()
      await p.locator('.isync__copy').click()
      await p.locator(WT).waitFor({ timeout: 30000 })
      const below = await p.evaluate((sel) => {
        const cmp = document.querySelector('[data-testid="income-compare"]')
        const wt = document.querySelector(sel)
        return !!cmp && !!wt && !!(cmp.compareDocumentPosition(wt) & Node.DOCUMENT_POSITION_FOLLOWING)
      }, WT)
      check(below, 'walkthrough: shows under the comparison after sync')
      const st = () => p.locator(WT).evaluate((el) => ({ ch: el.dataset.chapter, year: Number(el.dataset.year) }))
      const slider = () => p.locator('[data-testid="wt-year"]').evaluate((el) => ({ min: Number(el.min), max: Number(el.max), value: Number(el.value) }))
      const tabAges = async (key) => (await p.locator(`[data-testid="wt-tab-${key}"] .wt__tab-ages`).innerText()).split('–').map(Number)
      // The slider spans exactly the chapter: as many steps as the tab's ages.
      const spans = async () => {
        const { ch } = await st()
        const [a, b = a] = await tabAges(ch)
        const s = await slider()
        return s.max - s.min === b - a && s.value === s.min
      }
      const first = await st()
      check(first.ch === 'before' && (await spans()), `walkthrough: first chapter is before-Social-Security and the slider spans it (${first.ch})`)
      await p.locator('[data-testid="wt-play"]').click()
      await p.waitForFunction(() => document.querySelector('[data-testid="wt-play"]').getAttribute('aria-pressed') === 'false', null, { timeout: 5000 })
      const played = await st()
      const s1 = await slider()
      check(played.ch === 'before' && played.year === s1.max, `walkthrough: Play stops at the chapter's last year (${JSON.stringify(played)})`)
      await p.locator('[data-testid="wt-next"]').click()
      const next = await st()
      check(next.ch !== 'before' && next.year === s1.max + 1 && (await spans()), `walkthrough: Next chapter carries on, slider spans the new chapter (${next.ch})`)

      // Same storm, on the same synced page: chips switch the caption; a different seed on the mode's
      // side (stored, then reloaded) hides it with its reason.
      const SS = '[data-testid="same-storm"]'
      await p.locator(`${SS}[data-gate="shown"]`).waitFor({ timeout: 10000 })
      const chips = p.locator(`${SS} [role="tab"]`)
      const n = await chips.count()
      check(n >= 2, `same storm: shown after sync with ${n} future chips`)
      const caption = () => p.locator('[data-testid="storm-caption"]').innerText()
      const cap0 = await caption()
      const other = (await chips.nth(0).getAttribute('aria-selected')) === 'true' ? 1 : 0
      await chips.nth(other).click()
      check((await caption()) !== cap0, 'same storm: picking another future changes the caption')
      await p.evaluate(() => {
        const s = JSON.parse(localStorage.getItem('evelo:v2:income'))
        localStorage.setItem('evelo:v2:income', JSON.stringify({ ...s, seed: s.seed + 1 }))
      })
      await p.reload()
      await p.locator(SS).waitFor({ timeout: 30000 })
      const hidden = await p.locator(SS).getAttribute('data-gate')
      const why = await p.locator('[data-testid="storm-hidden"]').innerText().catch(() => '')
      check(hidden === 'different-futures' && why.includes('Futures'), `same storm: hidden with its reason when the futures differ (${hidden})`)
      check(errs.length === 0, `walkthrough and same storm: no uncaught page errors${errs.length ? ': ' + errs.join(' | ') : ''}`)
      await ctx.close()
    }
  } finally {
    await browser.close()
  }
})

if (fails.length) { console.error(`\n${fails.length} e2e check(s) failed`); process.exit(1) }
console.log('\ne2e smoke passed')
