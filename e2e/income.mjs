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
const RATE = '[data-testid="income-lasts-rate"]'

/** The headline and the sentence under it (which names the inputs' spending, age and path count). */
const shown = async (page) => `${await headline(page)} | ${(await page.locator('.income__measure-note').innerText()).trim()}`

/** Waits for the headline rate to read as a percentage; returns it (or null on timeout). */
async function headline(page) {
  try {
    await page.waitForFunction((sel) => /^\d{1,3}%$/.test(document.querySelector(sel)?.textContent?.trim() ?? ''), RATE, { timeout: 60000 })
    return (await page.locator(RATE).innerText()).trim()
  } catch {
    return null
  }
}

// A port of its own, so this can run beside other previews.
await withPreview(async (base) => {
  const browser = await chromium.launch()
  try {
    // 1. Lazy loading: no mode chunk on the landing or #plan (even after the idle prefetch); then
    //    #income fetches it and renders the mode with its headline.
    {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 860 } })
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
      await page.locator('.income').waitFor({ timeout: 15000 })
      check(requested.some(isModeChunk), '#income: mode chunk requested')
      const rate = await headline(page)
      check(rate !== null, `#income: headline "the money lasts" rate appears once the worker answers (${rate})`)
      check((await page.locator('.topnav, .tabbar').count()) === 0, "#income: eVelo's nav isn't drawn in the mode")
      const color = await page.locator(RATE).evaluate((el) => getComputedStyle(el).color)
      const brass = await page.evaluate(() => {
        const probe = document.createElement('span')
        probe.style.color = 'var(--bruised-text)'
        document.body.append(probe)
        const c = getComputedStyle(probe).color
        probe.remove()
        return c
      })
      check(color === brass, `#income: the rate is brass (${color})`)
      await page.screenshot({ path: SHOTS + 'income-1280.png', fullPage: true })

      await page.getByRole('link', { name: /back to evelo/i }).click()
      await page.waitForFunction(() => location.hash === '#plan')
      await page.locator('.topnav').waitFor()
      check(true, '#income: "Back to eVelo" returns to the plan')
      check(errors.length === 0, `no uncaught page errors${errors.length ? ': ' + errors.join(' | ') : ''}`)
      await ctx.close()
    }

    // 2. Phone width: the mode, and the tab bar on #plan without it.
    {
      const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
      const page = await ctx.newPage()
      await page.goto(base + '#plan')
      await page.waitForLoadState('networkidle')
      const tabs = await page.locator('.tabbar').innerText()
      check(tabs.length > 0 && !/income/i.test(tabs), `390 #plan: tab bar doesn't show the mode (${tabs.replace(/\s+/g, ' ')})`)
      await page.goto(base + '#income')
      const rate = await headline(page)
      check(rate !== null, `390 #income: headline rate appears (${rate})`)
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
      check(overflow <= 0, `390 #income: no horizontal scroll (${overflow}px)`)
      await page.screenshot({ path: SHOTS + 'income-390.png', fullPage: true })
      await ctx.close()
    }

    // 3. Corrupt or hostile stored state still opens the mode on the defaults.
    const DEFAULT_RATE = await (async () => {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 860 } })
      const page = await ctx.newPage()
      await page.goto(base + '#income')
      const r = await shown(page)
      await ctx.close()
      return r
    })()
    check(/^\d{1,3}% \| In /.test(DEFAULT_RATE), `defaults: ${DEFAULT_RATE}`)
    // A valid stored value is read (so the checks below aren't passing on an ignored key).
    {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 860 } })
      await ctx.addInitScript(() => { try { localStorage.setItem('evelo:v2:income', '{"spending":60000}') } catch {} })
      const page = await ctx.newPage()
      await page.goto(base + '#income')
      const r = await shown(page)
      check(r.includes('$60,000 a year'), `stored state: the mode runs on the saved inputs (${r})`)
      await ctx.close()
    }
    for (const [name, raw] of [
      ['bad JSON', '{not json'],
      ['wrong shape', '[1,2,3]'],
      ['hostile keys and values', '{"__proto__":{"portfolio":1},"constructor":{"prototype":{"x":1}},"portfolio":"lots","age":null,"filingStatus":"bogus","method":"magic","paths":7,"homeCityId":"__proto__"}'],
    ]) {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 860 } })
      await ctx.addInitScript((v) => { try { localStorage.setItem('evelo:v2:income', v) } catch {} }, raw)
      const page = await ctx.newPage()
      const errs = []
      page.on('pageerror', (e) => errs.push(e.message))
      await page.goto(base + '#income')
      const r = await shown(page)
      const text = await page.locator('#root').innerText()
      check(r === DEFAULT_RATE && !text.includes('Something went wrong'), `corrupt state (${name}): mode opens on the defaults`)
      check(errs.length === 0, `corrupt state (${name}): no uncaught page errors${errs.length ? ': ' + errs.join(' | ') : ''}`)
      await ctx.close()
    }
  } finally {
    await browser.close()
  }
}, 4183)

if (fails.length) { console.error(`\n${fails.length} income e2e check(s) failed`); process.exit(1) }
console.log(`\nincome e2e passed — screenshots in ${SHOTS}`)
