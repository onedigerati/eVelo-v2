import { chromium } from 'playwright'
import { open, EV } from './common.mjs'
import fs from 'node:fs'
const S = '/tmp/claude-1000/-home-jonah-repos-eVelo-v2/4130fe38-efcd-4d9a-a365-ba265daed536/scratchpad'
const R = '/home/jonah/repos/eVelo-v2/docs/research/landing-hero'
fs.writeFileSync(`${S}/mock-a.html`, fs.readFileSync(`${R}/shell-head.html`, 'utf8') + fs.readFileSync(`${R}/variation-a.html`, 'utf8'))
const TIMES = [['buy', 2], ['borrow', 6], ['live', 10], ['die', 14.2]]
const out = []

for (const w of [1280, 390]) for (const dark of [false, true]) {
  const theme = dark ? 'dark' : 'light'
  const { browser, page, logs } = await open({ width: w, height: w === 390 ? 844 : 900, dark, dpr: 2 })
  await page.evaluate(() => document.querySelector('.story').scrollIntoView({ block: 'center', behavior: 'instant' }))
  await page.waitForTimeout(150)
  for (const [b, t] of TIMES) {
    await page.locator('.story__ctrl .story__btn').nth(1).click() // replay
    await page.clock.runFor(t * 1000)
    await page.locator('.story__ctrl .story__btn').first().click() // pause
    await page.locator('.story__ctrl .story__btn').first().blur()
    await page.mouse.move(0, 0)
    await page.waitForTimeout(80)
    const f = `mid-${b}-${w}-${theme}.png`
    await page.locator('.story').screenshot({ path: `${EV}/${f}` })
    out.push(f)
  }
  if (w === 390) {
    // whole phone viewport at Borrow mid-beat, to see the card with the steps below
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.waitForTimeout(80)
    await page.screenshot({ path: `${EV}/home-top-390-${theme}.png` })
    out.push(`home-top-390-${theme}.png`)
  }
  out.push(`console ${w} ${theme}: ${JSON.stringify(logs)}`)
  await browser.close()
}

// The mockup, same mid-beat times (its own script: pause, jump via its clock)
for (const w of [1280, 390]) {
  const browser = await chromium.launch()
  const ctx = await browser.newContext({ viewport: { width: w, height: w === 390 ? 844 : 900 }, deviceScaleFactor: 2 })
  const page = await ctx.newPage()
  await page.clock.install({ time: new Date('2026-11-08T12:00:00Z') })
  await page.goto(`file://${S}/mock-a.html`)
  await page.clock.pauseAt(new Date('2026-11-08T12:00:30Z'))
  await page.evaluate(() => document.querySelector('.va-card').scrollIntoView({ block: 'center', behavior: 'instant' }))
  await page.waitForTimeout(150)
  for (const [b, t] of TIMES) {
    await page.click('[data-replay]')
    await page.clock.runFor(t * 1000)
    await page.click('[data-play]') // pause
    await page.mouse.move(0, 0)
    await page.waitForTimeout(80)
    const f = `mockup-mid-${b}-${w}-light.png`
    await page.locator('.va-card').screenshot({ path: `${EV}/${f}` })
    out.push(f)
  }
  await page.locator('.va').screenshot({ path: `${EV}/mockup-whole-${w}-light.png` }).catch(() => {})
  await browser.close()
}
console.log(out.join('\n'))
