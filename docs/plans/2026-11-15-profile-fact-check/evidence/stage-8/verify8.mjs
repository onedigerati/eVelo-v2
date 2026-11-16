// Opens city profiles in a production build and prints the "Local tax & estate" block.
// Run: node docs/evidence/stage-8/verify8.mjs http://localhost:<port> <label> [shots]
import { createRequire } from 'module'
const require = createRequire('/home/jonah/repos/Heel/node_modules/')
const { chromium } = require('playwright')
const OUT = '/home/jonah/repos/eVelo-v2/docs/evidence/stage-8'
const [BASE, LABEL, SHOTS] = process.argv.slice(2)
const browser = await chromium.launch()
const errors = []
for (const city of ['Seattle', 'London', 'Lisbon']) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`[${city}] ${m.text()}`) })
  page.on('pageerror', (e) => errors.push(`[${city}] pageerror ${e.message}`))
  await page.goto(BASE + '/#atlas')
  await page.getByRole('button', { name: /open the .* profile/i }).first().waitFor({ timeout: 30000 })
  await page.waitForFunction(() => !document.querySelector('.atlas.is-running') && document.querySelector('.crow'), null, { timeout: 60000 })
  await page.getByLabel('Search cities').first().fill(city)
  await page.waitForTimeout(800)
  const btn = page.getByRole('button', { name: new RegExp(`open the ${city}.* profile|^Top pick \\d+: ${city}`, 'i') }).first()
  await btn.scrollIntoViewIfNeeded({ timeout: 5000 })
  await btn.click()
  const tax = page.locator('.ptax')
  await tax.locator('.ptax__row--estate').waitFor({ timeout: 60000 })
  await page.waitForTimeout(500)
  console.log(`\n===== ${LABEL} · ${city} =====`)
  console.log((await tax.innerText()).replace(/\n{2,}/g, '\n'))
  const asof = await page.locator('[role="dialog"]').last().innerText()
  const m = asof.match(/Researched[^\n]*/)
  console.log('as-of line:', m ? m[0] : '(none)')
  if (SHOTS) { await tax.scrollIntoViewIfNeeded(); await page.screenshot({ path: `${OUT}/${LABEL}-${city.toLowerCase()}-tax.png` }) }
  await page.close()
}
console.log('\nconsole errors:', errors.length ? errors : 'none')
await browser.close()
