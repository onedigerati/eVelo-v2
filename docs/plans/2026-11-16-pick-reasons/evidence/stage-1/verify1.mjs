// Opens the Atlas's Top picks in a production build and prints the "Also worth a look" rows
// for Madeira, Tbilisi and Asunción, desktop and phone.
// Run: node docs/evidence/stage-1/verify1.mjs http://localhost:<port>
import { createRequire } from 'module'
const require = createRequire('/home/jonah/repos/Heel/node_modules/')
const { chromium } = require('playwright')
const OUT = '/home/jonah/repos/eVelo-v2/docs/evidence/stage-1'
const BASE = process.argv[2]
const browser = await chromium.launch()
const errors = []
for (const [w, h, tag] of [[1280, 900, 'desktop'], [390, 844, 'phone']]) {
  const page = await browser.newPage({ viewport: { width: w, height: h } })
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`[${tag}] ${m.text()}`) })
  page.on('pageerror', (e) => errors.push(`[${tag}] pageerror ${e.message}`))
  await page.goto(BASE + '/#atlas')
  const also = page.locator('section.also')
  await also.waitFor({ timeout: 60000 })
  const more = also.getByRole('button', { name: /^Show \d+–\d+/ })
  if (await more.count()) await more.first().click()
  await page.waitForTimeout(600)
  console.log(`\n===== ${tag} =====`)
  for (const city of ['Madeira', 'Tbilisi', 'Asunción']) {
    const row = also.locator('li.also__row', { hasText: city }).first()
    await row.scrollIntoViewIfNeeded()
    console.log(`--- ${city}: ${(await row.innerText()).replace(/\s*\n\s*/g, ' | ')}`)
    if (city === 'Tbilisi') await page.screenshot({ path: `${OUT}/${tag}-also-tbilisi.png` })
  }
  await page.close()
}
console.log('\nconsole errors:', errors.length ? errors : 'none')
await browser.close()
