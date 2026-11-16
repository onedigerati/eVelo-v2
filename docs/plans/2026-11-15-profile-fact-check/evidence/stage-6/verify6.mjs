// Opens stage 3 profiles in the production build and prints what the page shows.
// Run: node docs/evidence/stage-6/verify6.mjs http://localhost:<port>
import { createRequire } from 'module'
const require = createRequire('/home/jonah/repos/Heel/node_modules/')
const { chromium } = require('playwright')
const OUT = '/home/jonah/repos/eVelo-v2/docs/evidence/stage-6'
const BASE = process.argv[2]
const browser = await chromium.launch()
const errors = []
async function openProfile(page, city, region) {
  await page.evaluate(() => { location.hash = '#atlas' })
  const btn = page.getByRole('button', { name: new RegExp(`open the ${city}.* profile|^Top pick \\d+: ${city}`, 'i') }).first()
  await page.getByRole('button', { name: /open the .* profile/i }).first().waitFor({ timeout: 30000 })
  await page.waitForFunction(() => !document.querySelector('.atlas.is-running') && document.querySelector('.crow'), null, { timeout: 60000 })
  await page.getByRole('searchbox', { name: 'Search cities' }).or(page.getByLabel('Search cities')).first().fill(city)
  await page.waitForTimeout(800)
  await btn.scrollIntoViewIfNeeded({ timeout: 5000 })
  await btn.click()
  await page.locator('.pfacts dt', { hasText: 'Lending' }).waitFor()
  await page.waitForTimeout(600)
}
for (const [w, h, tag, city, region] of [[1280, 900, 'desktop', 'Bali', ''], [1280, 900, 'desktop', 'Taipei', ''], [390, 844, 'phone', 'Sydney', '']]) {
  const page = await browser.newPage({ viewport: { width: w, height: h } })
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`[${tag} ${city}] ${m.text()}`) })
  page.on('pageerror', (e) => errors.push(`[${tag} ${city}] pageerror ${e.message}`))
  await page.goto(BASE + '/#atlas')
  await openProfile(page, city, region)
  const sheet = page.locator('[role="dialog"]').last()
  console.log(`\n===== ${tag} · ${city} =====`)
  console.log((await sheet.innerText()).replace(/\n{2,}/g, '\n'))
  const dt = page.locator('.pfacts dt', { hasText: 'Lending' })
  await dt.scrollIntoViewIfNeeded()
  await page.waitForTimeout(400)
  await page.screenshot({ path: `${OUT}/${tag}-${city.toLowerCase().split(' ')[0]}-facts.png` })
  await page.close()
}
console.log('\nconsole errors:', errors.length ? errors : 'none')
await browser.close()
