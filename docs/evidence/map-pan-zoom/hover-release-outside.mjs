import { createRequire } from 'module'
const require = createRequire('/home/jonah/.npm/_npx/e41f203b7505f1fb/node_modules/')
const { chromium } = require('playwright')
const URL = process.argv[2]
const browser = await chromium.launch()
const page = await (await browser.newContext({ viewport: { width: 1400, height: 900 } })).newPage()
const errs = []; page.on('pageerror', e => errs.push(String(e))); page.on('console', m => m.type() === 'error' && errs.push(m.text()))
await page.goto(URL + '#atlas', { waitUntil: 'networkidle' })
await page.waitForFunction(() => document.querySelector('.wmap') && !document.querySelector('.wmap.is-loading'), null, { timeout: 60000 })
await page.locator('.wmap__stage').evaluate(e => e.scrollIntoView({ block: 'center' }))
await page.waitForTimeout(1500)
const st = await page.locator('.wmap__stage').boundingBox()
const pos = id => page.evaluate(id => { const g = document.querySelector(`.wmap__stage svg g[data-id="${id}"]`); const m = g.getAttribute('transform').match(/translate\(([-\d.]+),([-\d.]+)\)/); return [+m[1], +m[2]] }, id)
const hover = async (id, label) => {
  await page.mouse.move(5, 5); await page.waitForTimeout(500)
  const p = await pos(id)
  // approach gradually like a real mouse
  for (let k = 5; k >= 0; k--) await page.mouse.move(st.x + p[0] + k * 6, st.y + p[1] + k * 3)
  await page.waitForTimeout(500)
  const card = await page.locator('.city-card b').first().textContent().catch(() => null)
  console.log(`${card ? 'BUBBLE' : 'NO BUBBLE'} ${label}: ${card}`)
}
await hover('lisbon', 'fresh load, hover Lisbon')
// press on the map, leave it in one jump, release outside
await page.mouse.move(st.x + 300, st.y + st.height * 0.7); await page.mouse.down()
await page.mouse.move(st.x + 300, st.y + st.height + 200); await page.mouse.up()
const l0 = await pos('lisbon')
await hover('lisbon', 'after press on map + release outside, hover Lisbon')
console.log('map moved without a button held:', JSON.stringify(l0), '→', JSON.stringify(await pos('lisbon')))
console.log('errors:', errs.join(' | ') || 'none')
await browser.close()
