import { open, state, EV } from './common.mjs'
import fs from 'node:fs'
const out = []
for (const [w, h] of [[390, 844], [360, 740], [1000, 900]]) {
  const { browser, page } = await open({ width: w, height: h })
  // scroll so the card's bottom 45% and the first step are on screen
  await page.evaluate(() => { const r = document.querySelector('.story').getBoundingClientRect(); window.scrollTo(0, scrollY + r.top + r.height * 0.55) })
  await page.waitForTimeout(200)
  const rows = []
  for (const t of [2, 6, 10, 14.5]) {
    await page.locator('.story__ctrl .story__btn').nth(1).click().catch(() => {})
    await page.evaluate(() => 0)
    await page.clock.runFor(t * 1000)
    const m = await page.evaluate(() => { const c = document.querySelector('.story').getBoundingClientRect(); const s = document.querySelector('.landing__step').getBoundingClientRect(); return { cardVis: +((Math.min(innerHeight, c.bottom) - Math.max(0, c.top)) / c.height).toFixed(2), cardH: Math.round(c.height), stepTop: Math.round(s.top), lead: document.querySelector('.story__cap-beat:not([aria-hidden]) .story__cap-lead').textContent.slice(0, 16), btn: document.querySelector('.story__btn').getAttribute('aria-label').slice(0, 5) } })
    rows.push(`t=${t}: ${JSON.stringify(m)}`)
  }
  out.push(`== ${w}x${h} (scrolled so the card is ~45% visible and the steps below it are on screen; replay then clock.runFor(t))\n` + rows.join('\n'))
  await browser.close()
}
console.log(out.join('\n'))
fs.writeFileSync(`${EV}/layout-shift.txt`, '$ node shift.mjs (Playwright 1.57 Chromium; card height and first step\'s top per beat, mid-beat)\n' + out.join('\n') + '\n')
