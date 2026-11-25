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
          if (when === 'link') {
            // A section opened by click must stop clipping once open, or its Select popovers get cut off.
            await p.waitForTimeout(700)
            await p.locator('.select__button').filter({ hasText: 'Stay home' }).first().click()
            const pop = p.locator('.select__pop').first()
            await pop.waitFor()
            await p.waitForTimeout(400)
            // Scroll only the rail (scrollIntoView would also scroll a clipping wrapper and hide the bug).
            await pop.evaluate((el) => {
              const rail = el.closest('.rail')
              if (rail) rail.scrollTop += Math.max(0, el.getBoundingClientRect().bottom - Math.min(innerHeight, rail.getBoundingClientRect().bottom) + 16)
            })
            await p.waitForTimeout(200)
            const hit = await pop.evaluate((el) => {
              const r = el.getBoundingClientRect()
              const top = document.elementFromPoint(r.left + r.width / 2, r.bottom - 8)
              return el.contains(top)
            })
            check(hit, `${name}: "Retire to" popover shows in full in an opened section (not clipped)`)
            await p.keyboard.press('Escape')
          }
        }
      }
      check(errs.length === 0, `${name}: no uncaught page errors${errs.length ? ': ' + errs.join(' | ') : ''}`)
      await ctx.close()
    }

    // The two-retirements walkthrough on #income: absent before a sync, under the comparison after
    // one; the chart as the only year control (slider semantics, keys, a click), Next chapter, and Play stopping at its end (a
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
      const CH = '[data-testid="wt-chart-svg"]'
      // The chart is the only year control: a slider over every year, its value the shown year.
      const slider = () =>
        p.locator(CH).evaluate((el) => ({
          role: el.getAttribute('role'),
          min: Number(el.getAttribute('aria-valuemin')),
          max: Number(el.getAttribute('aria-valuemax')),
          value: Number(el.getAttribute('aria-valuenow')),
          text: el.getAttribute('aria-valuetext') ?? '',
        }))
      const tabAges = async (key) => (await p.locator(`[data-testid="wt-tab-${key}"] .wt__tab-ages`).innerText()).split('–').map(Number)
      check((await p.locator(`${WT} input[type="range"], [data-testid="wt-year"]`).count()) === 0, 'walkthrough: no year slider row under the chart')
      const first = await st()
      const s0 = await slider()
      const [a0, b0 = a0] = await tabAges('before')
      check(
        first.ch === 'before' && first.year === 0 && s0.role === 'slider' && s0.min === 0 && s0.value === 0 && s0.max >= b0 - a0 && s0.text === `End of age ${a0}, year 1 of ${s0.max + 1}`,
        `walkthrough: first chapter is before-Social-Security and the chart is a slider at its first year (${JSON.stringify(s0)})`,
      )
      await p.locator('[data-testid="wt-play"]').click()
      await p
        .waitForFunction(
          (end) => document.querySelector('[data-testid="wt-play"]').getAttribute('aria-pressed') === 'false' && Number(document.querySelector('[data-testid="walkthrough"]').dataset.year) === end,
          b0 - a0,
          { timeout: 15000 },
        )
        .catch(() => {})
      const played = await st()
      check(played.ch === 'before' && played.year === b0 - a0 && (await slider()).value === played.year, `walkthrough: Play stops at the chapter's last year (${JSON.stringify(played)})`)
      await p.locator('[data-testid="wt-next"]').click()
      const next = await st()
      check(next.ch !== 'before' && next.year === b0 - a0 + 1 && (await slider()).value === next.year, `walkthrough: Next chapter carries on at the new chapter's first year (${next.ch})`)
      // Keys on the chart: End, Home, PageUp, arrows; a click picks the year under it.
      await p.locator(CH).focus()
      await p.keyboard.press('End')
      const atEnd = await st()
      check(atEnd.year === s0.max && atEnd.ch === 'estate', `walkthrough: End on the chart picks the last year (${JSON.stringify(atEnd)})`)
      await p.keyboard.press('Home')
      await p.keyboard.press('PageUp')
      await p.keyboard.press('ArrowRight')
      check((await st()).year === 6 && (await slider()).value === 6, 'walkthrough: Home, PageUp, ArrowRight on the chart go to year 6')
      const box = await p.locator(CH).boundingBox()
      await p.mouse.click(box.x + box.width - 12, box.y + box.height / 2)
      check((await st()).year === s0.max, 'walkthrough: a click at the chart\'s right end picks the last year')
      await p.mouse.move(0, 0)

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
