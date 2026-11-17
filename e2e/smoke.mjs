// End-to-end smoke test: the built app in headless Chromium.
// `npm run e2e` (builds first). Exits non-zero on any failure.
import { chromium } from 'playwright'
import { withPreview } from '../scripts/serve-preview.mjs'

const fails = []
const check = (ok, msg) => { console.log(`${ok ? 'ok  ' : 'FAIL'} ${msg}`); if (!ok) fails.push(msg) }

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
  } finally {
    await browser.close()
  }
})

if (fails.length) { console.error(`\n${fails.length} e2e check(s) failed`); process.exit(1) }
console.log('\ne2e smoke passed')
