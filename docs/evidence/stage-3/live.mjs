// Live check: open Lisbon's profile on the deployed site at 2560x1440, measure columns and the banner before/after scrolling.
import { chromium } from 'playwright'
const base = 'https://onedigerati.github.io/eVelo-v2/'
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 2560, height: 1440 }, colorScheme: 'dark' })
await p.goto(base + '#atlas', { waitUntil: 'networkidle' })
await p.locator('.pick').nth(1).click()
await p.waitForSelector('.prof-sheet .prof'); await p.waitForTimeout(1500)
const m = () => p.evaluate(() => {
  const r = (s) => document.querySelector(s)?.getBoundingClientRect()
  const cols = getComputedStyle(document.querySelector('.prof')).gridTemplateColumns
  return { sheet: r('.prof-sheet').width, cols, banner: Math.round(r('.pgal__mosaic').height), compact: !!document.querySelector('.pgal.is-compact'), sw: document.documentElement.scrollWidth }
})
const top = await m()
await p.mouse.move(1280, 900)
for (let i = 0; i < 20; i++) { await p.mouse.wheel(0, 40); await p.waitForTimeout(30) }
await p.waitForTimeout(800)
const down = await m()
await p.evaluate(() => { document.querySelector('.prof-sheet .sheet__body').scrollTop = 0 }); await p.waitForTimeout(800)
const back = await m()
console.log(JSON.stringify({ top, down, back }, null, 1))
await b.close()
