import { chromium } from 'playwright'
import { state, EV } from './common.mjs'
import fs from 'node:fs'
const out = []
const log = (s) => { out.push(s); console.log(s) }
let fails = 0
const expect = (c, m) => { log(`${c ? 'OK  ' : 'FAIL'} ${m}`); if (!c) fails++ }
const BEAT = { 'Buy, and hold.': 'buy', 'Borrow for living money.': 'borrow', 'Spend it where life costs less.': 'live', 'Gains never taxed. Loan repaid. The rest is theirs.': 'die' }

// Record every aria-live change from the first DOM node on, via an init script
const REC = () => {
  window.__live = []
  const mo = new MutationObserver(() => {
    const el = document.querySelector('.story [aria-live]')
    if (!el) return
    if (!window.__liveEl) {
      window.__liveEl = el
      window.__live.push(`[first seen] "${el.textContent}"`)
      new MutationObserver(() => window.__live.push(el.textContent)).observe(el, { childList: true, characterData: true, subtree: true })
    }
  })
  mo.observe(document, { childList: true, subtree: true })
}

for (const [url, label] of [['http://localhost:4331/#home', 'npm run dev (React StrictMode, dev build)'], ['http://localhost:4330/#home', 'vite preview (production build)']]) {
  for (const [w, h, reduced] of [[1280, 900, false], [390, 844, false], [1280, 900, true]]) {
    const browser = await chromium.launch()
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, reducedMotion: reduced ? 'reduce' : 'no-preference' })
    const page = await ctx.newPage()
    const logs = []
    page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') logs.push(m.text()) })
    await page.addInitScript(REC)
    await page.clock.install({ time: new Date('2026-11-09T12:00:00Z') })
    await page.goto(url)
    await page.waitForSelector('.story')
    await page.waitForTimeout(800)
    await page.clock.pauseAt(new Date('2026-11-09T12:01:00Z'))
    const atLoad = await page.evaluate(() => window.__live.slice())
    const strict = await page.evaluate(() => !!document.querySelector('script[src*="@vite/client"]'))
    await page.clock.runFor(45000)
    const all = await page.evaluate(() => window.__live.slice())
    const steps = all.map((l) => l.replace(/^\[first seen\] "|"$/g, '')).filter((l) => /^Step \d/.test(l))
    log(`== ${label}, ${w}x${h}${reduced ? ', reduced motion' : ''} (dev client: ${strict})`)
    log(`  live changes in the first 800 ms: ${JSON.stringify(atLoad.map((l) => l.slice(0, 40)))}`)
    log(`  all live changes over 45 s: ${JSON.stringify(all.map((l) => l.slice(0, 32)))}`)
    expect(!atLoad.some((l) => l.includes('Step 4 of 4')), `no "Step 4 of 4" at load`)
    if (w === 1280 && !reduced) expect(steps.length === 4 && steps.every((l, i) => l.startsWith(`Step ${i + 1} of 4`)), `each beat announced once over two passes (${steps.length})`)
    else expect(steps.length === 0, `nothing announced (${w === 390 ? 'card below the fold' : 'reduced motion: no autoplay'})`)
    if (logs.length) log(`  console: ${JSON.stringify(logs)}`)
    await browser.close()
  }
}

// Play pressed with the card under 35% on screen counts as in view
{
  const browser = await chromium.launch()
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } })
  const page = await ctx.newPage()
  await page.clock.install({ time: new Date('2026-11-09T12:00:00Z') })
  await page.goto('http://localhost:4330/#home')
  await page.waitForSelector('.story')
  await page.waitForTimeout(500)
  await page.clock.pauseAt(new Date('2026-11-09T12:01:00Z'))
  // scroll so only the foot of the card (the controls) shows, then press Play without Playwright's auto-scroll
  await page.evaluate(() => { const c = document.querySelector('.story').getBoundingClientRect(); window.scrollTo({ top: scrollY + c.bottom - 200, behavior: 'instant' }) })
  await page.waitForTimeout(400)
  const vis = await page.evaluate(() => { const c = document.querySelector('.story').getBoundingClientRect(); return +((Math.min(innerHeight, c.bottom) - Math.max(0, c.top)) / c.height).toFixed(2) })
  await page.locator('.story__ctrl .story__btn').first().dispatchEvent('click')
  await page.clock.runFor(2000)
  let s = await state(page)
  expect(vis < 0.35 && BEAT[s.lead] === 'buy' && s.btn.startsWith('Pause'), `390, card ${Math.round(vis * 100)}% on screen, Play pressed: plays (after 2 s: ${BEAT[s.lead]}, "${s.btn}")`)
  const d1 = await page.locator('.story__loan').count()
  await page.clock.runFor(3000)
  s = await state(page)
  log(`  +3 s more: ${BEAT[s.lead]}`)
  await browser.close()
}
log(`\n${fails} failures`)
fs.writeFileSync(`${EV}/live-strictmode.txt`, `$ node strict.mjs (Playwright 1.57 Chromium; aria-live changes recorded from the first DOM node by an init script; npm run dev on :4331 (StrictMode) and vite preview on :4330; page clock advanced 45 s)\n` + out.join('\n') + '\n')
