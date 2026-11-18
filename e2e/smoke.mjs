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
  } finally {
    await browser.close()
  }
})

if (fails.length) { console.error(`\n${fails.length} e2e check(s) failed`); process.exit(1) }
console.log('\ne2e smoke passed')
