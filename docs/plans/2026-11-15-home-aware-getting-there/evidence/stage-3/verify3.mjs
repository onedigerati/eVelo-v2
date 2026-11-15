import { createRequire } from 'module'
const require = createRequire('/home/jonah/repos/Heel/node_modules/')
const { chromium } = require('playwright')
const OUT = '/home/jonah/repos/eVelo-v2/docs/evidence/stage-3'
const BASE = process.argv[2]
const MODE = process.argv[3] // 'preview' | 'dev'

const browser = await chromium.launch()
const errors = []
async function setup(width, height) {
  const page = await browser.newPage({ viewport: { width, height } })
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`[${width}] ${m.text()}`) })
  page.on('pageerror', (e) => errors.push(`[${width}] pageerror ${e.message}`))
  return page
}
async function setHomeViaPlan(page, name) {
  await page.evaluate(() => { location.hash = '#plan' })
  const btn = page.locator('button[aria-haspopup="listbox"]').filter({ hasText: /./ }).first()
  // The Home city select is the one labelled "Home city".
  const home = page.locator('.select', { has: page.getByText('Home city', { exact: true }) }).locator('button[aria-haspopup="listbox"]').first()
  await home.click()
  await page.getByPlaceholder('Type to filter').fill(name)
  await page.getByRole('option', { name: new RegExp('^' + name) }).first().click()
  await page.waitForTimeout(300)
}
async function openProfile(page, city) {
  await page.evaluate(() => { location.hash = '#atlas' })
  const btn = page.getByRole("button", { name: new RegExp(`open the ${city} profile|^Top pick \\d+: ${city},`, "i") }).first()
  await page.getByRole('button', { name: /open the .* profile/i }).first().waitFor({ timeout: 30000 })
  await page.waitForTimeout(500)
  await page.waitForFunction(() => !document.querySelector('.atlas.is-running') && document.querySelector('.crow'), null, { timeout: 60000 })
  const eu = page.locator('button.rchip', { hasText: 'Europe' }).first()
  if ((await eu.getAttribute('aria-pressed')) !== 'true') await eu.click()
  await page.waitForTimeout(600)
  for (let i = 0; i < 6 && !(await btn.count()); i++) {
    const more = page.getByRole('button', { name: /^Show \d/ }).first()
    if (!(await more.count())) break
    await more.click()
    await page.waitForTimeout(400)
  }
  if (!(await btn.count())) {
    await page.screenshot({ path: OUT + '/fail.png', fullPage: false })
    console.log('hash', await page.evaluate(() => location.hash), 'chips', await page.locator('button.rchip').allInnerTexts())
    console.log('profile btns', await page.$$eval('[aria-label*="profile"]', (e) => e.map((x) => x.getAttribute('aria-label')).filter((l) => /Lisbon|Porto/.test(l))))
  }
  await btn.scrollIntoViewIfNeeded({ timeout: 5000 })
  await btn.click()
  const dt = page.locator('.pfacts dt', { hasText: 'Getting there' })
  await dt.waitFor()
  await dt.scrollIntoViewIfNeeded()
  await page.waitForTimeout(600)
}
const accessText = (page) => page.locator('.pfacts__row', { has: page.locator('dt', { hasText: 'Getting there' }) }).locator('dd').innerText()

if (MODE === 'preview') {
  for (const [w, h, tag] of [[1280, 900, 'desktop'], [390, 844, 'phone']]) {
    const page = await setup(w, h)
    await page.goto(BASE + '/#plan')
    await page.waitForTimeout(800)
    await setHomeViaPlan(page, 'San Diego')
    await openProfile(page, 'Lisbon')
    console.log(tag, 'SD→Lisbon:', JSON.stringify(await accessText(page)))
    await page.screenshot({ path: `${OUT}/${tag}-lisbon-from-sandiego.png` })
    // Change home without a reload: hash nav to plan, pick London, back to atlas.
    await page.keyboard.press('Escape')
    await setHomeViaPlan(page, 'London')
    await openProfile(page, 'Lisbon')
    console.log(tag, 'LON→Lisbon:', JSON.stringify(await accessText(page)))
    await page.screenshot({ path: `${OUT}/${tag}-lisbon-from-london.png` })
    await page.keyboard.press('Escape')
    await openProfile(page, 'London')
    console.log(tag, 'London own:', JSON.stringify(await accessText(page)))
    await page.screenshot({ path: `${OUT}/${tag}-london-home-own.png` })
    await page.close()
  }
} else {
  // Dev server: change home through the app's own store while the profile stays open.
  const page = await setup(1280, 900)
  await page.goto(BASE + '/#plan')
  await page.waitForTimeout(1500)
  await setHomeViaPlan(page, 'San Diego')
  await openProfile(page, 'Lisbon')
  console.log('live before:', JSON.stringify(await accessText(page)))
  await page.screenshot({ path: `${OUT}/live-1-sandiego.png` })
  await page.evaluate(async () => {
    const { useStore } = await import('/src/state/store.ts')
    useStore.getState().setInput('homeCityId', 'london')
  })
  await page.waitForTimeout(800)
  console.log('live after:', JSON.stringify(await accessText(page)))
  console.log('sheet still open:', await page.locator('.prof-sheet').isVisible())
  await page.screenshot({ path: `${OUT}/live-2-london.png` })
}
console.log('console errors:', errors.length ? errors : 'none')
await browser.close()
