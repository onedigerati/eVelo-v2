import { open, state, EV } from './common.mjs'
import fs from 'node:fs'
const out = []
const log = (s) => { out.push(s); console.log(s) }
const vis = (page) => page.evaluate(() => { const r = document.querySelector('.story').getBoundingClientRect(); return { top: Math.round(r.top), ratio: +(Math.max(0, Math.min(innerHeight, r.bottom) - Math.max(0, r.top)) / r.height).toFixed(2), scrollY: scrollY, max: document.documentElement.scrollHeight - innerHeight } })
const loanX = (page) => page.evaluate(() => { const d = document.querySelector('.story__loan')?.getAttribute('d') ?? ''; const n = d.match(/-?[\d.]+/g) ?? []; return n.length ? `${n.length / 2} pts, head x=${n[n.length - 2]}` : 'none' })

for (const [w, h] of [[390, 844], [1280, 700]]) {
  log(`== ${w}x${h}`)
  const { browser, page, logs } = await open({ width: w, height: h })
  log(`load: ${JSON.stringify(await vis(page))} ${JSON.stringify(await state(page)).slice(0, 80)}`)
  await page.clock.runFor(5000)
  if (w === 390) {
    log(`+5s with card ${JSON.stringify(await vis(page))}: caption "${(await state(page)).lead}" (should still be resting Die)`)
    await page.evaluate(() => document.querySelector('.story').scrollIntoView({ block: 'center', behavior: 'instant' }))
    await page.waitForTimeout(200)
    await page.clock.runFor(5500)
  }
  log(`in view ${JSON.stringify(await vis(page))}: "${(await state(page)).lead}" loan ${await loanX(page)}`)
  // scroll the card fully away: to the top-of-page anchor for the steps? scroll to bottom
  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }))
  await page.waitForTimeout(300) // real time for IntersectionObserver; fake clock paused so no rAF runs
  log(`scrolled away ${JSON.stringify(await vis(page))}: loan ${await loanX(page)}`)
  for (let i = 0; i < 4; i++) {
    await page.clock.runFor(2000)
    log(`  +${(i + 1) * 2}s away: "${(await state(page)).lead}" loan ${await loanX(page)}`)
  }
  await page.evaluate(() => document.querySelector('.story').scrollIntoView({ block: 'center', behavior: 'instant' }))
  await page.waitForTimeout(300)
  log(`back ${JSON.stringify(await vis(page))}: "${(await state(page)).lead}" loan ${await loanX(page)}`)
  await page.clock.runFor(1000)
  log(`  +1s back: "${(await state(page)).lead}" loan ${await loanX(page)}`)
  log(`console: ${JSON.stringify(logs)}`)
  await browser.close()
}
fs.writeFileSync(`${EV}/in-view.txt`, `$ node inview.mjs (Playwright 1.57 Chromium, page.clock paused; real 300ms waits let IntersectionObserver fire, clock.runFor advances animation frames)\n` + out.join('\n') + '\n')
