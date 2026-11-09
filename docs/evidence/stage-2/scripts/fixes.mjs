import { open, state, EV } from './common.mjs'
import fs from 'node:fs'
const BEAT = { 'Buy, and hold.': 'buy', 'Borrow for living money.': 'borrow', 'Spend it where life costs less.': 'live', 'Gains never taxed. Loan repaid. The rest is theirs.': 'die' }
const out = []
const log = (s) => { out.push(s); console.log(s) }
let fails = 0
const expect = (c, m) => { log(`${c ? 'OK  ' : 'FAIL'} ${m}`); if (!c) fails++ }
const step = (page, name) => page.locator('.landing__step', { has: page.locator('.landing__step-title', { hasText: new RegExp(`^${name}$`) }) })
const geo = (page) => page.evaluate(() => {
  const c = document.querySelector('.story').getBoundingClientRect()
  const p = document.querySelector('.story__plot').getBoundingClientRect()
  const s = document.querySelector('.landing__step').getBoundingClientRect()
  return { cardH: Math.round(c.height * 10) / 10, stepTop: Math.round(s.top * 10) / 10, scrollY: Math.round(scrollY), chartSeen: +((Math.max(0, Math.min(innerHeight, p.bottom) - Math.max(0, p.top))) / p.height).toFixed(2), focus: document.activeElement?.querySelector?.('.landing__step-title')?.textContent ?? document.activeElement?.tagName }
})

// ---------- 1. Card height constant across beats, steps not moving ----------
log('== 1. card height and first step position per beat (mid-beat, replay + clock.runFor; card scrolled ~45% visible so the steps are on screen)')
for (const [w, h] of [[360, 740], [390, 844], [480, 900], [1000, 900], [1280, 900]]) {
  const { browser, page, logs } = await open({ width: w, height: h })
  await page.evaluate(() => { const r = document.querySelector('.story').getBoundingClientRect(); window.scrollTo(0, scrollY + r.top + r.height * 0.55) })
  await page.waitForTimeout(200)
  const rows = []
  for (const t of [2, 6, 10, 14.5, 16]) {
    await page.locator('.story__ctrl .story__btn').nth(1).click()
    await page.clock.runFor(t * 1000)
    await page.waitForTimeout(50)
    const s = await state(page)
    rows.push({ t, beat: BEAT[s.lead], ...(await geo(page)) })
  }
  for (const r of rows) log(`  ${w}x${h} t=${r.t} ${r.beat.padEnd(6)} card ${r.cardH}px, first step top ${r.stepTop}, scrollY ${r.scrollY}`)
  const hs = new Set(rows.map((r) => r.cardH)), ts = new Set(rows.map((r) => r.stepTop))
  expect(hs.size === 1 && ts.size === 1, `${w}: card height constant (${[...hs]}) and steps still (${[...ts]}) across all four beats`)
  if (logs.length) log(`console: ${JSON.stringify(logs)}`)
  await browser.close()
}

// (section 2, the step-press scroll, moved to stepscroll.mjs -> step-scroll.txt)
// ---------- 3. pause -> Borrow -> Play animates Borrow ----------
log('\n== 3. pause, press Borrow, press Play')
{
  const { browser, page } = await open({ width: 1280, height: 900 })
  await page.clock.runFor(1000)
  await page.locator('.story__ctrl .story__btn').first().click() // pause
  await step(page, 'Borrow').click()
  const loanLen = () => page.evaluate(() => (document.querySelector('.story__loan')?.getAttribute('d')?.match(/[\d.]+,[\d.]+/g) ?? []).length)
  const finished = await loanLen()
  await page.locator('.story__ctrl .story__btn').first().click() // play
  const samples = []
  for (const ms of [0, 300, 1000, 2000, 3000, 4500]) {
    if (ms) await page.clock.runFor(ms - (samples.at(-1)?.ms ?? 0))
    const s = await state(page)
    samples.push({ ms, beat: BEAT[s.lead], pts: await loanLen(), live: s.live.slice(0, 30) })
  }
  for (const x of samples) log(`  +${x.ms}ms: card ${x.beat}, loan ${x.pts} points, live "${x.live}"`)
  expect(finished === 31 && samples[0].pts < 5 && samples[2].pts > samples[1].pts && samples[3].beat === 'borrow' && samples[5].beat === 'live', `paused Borrow showed the finished loan (${finished} pts); Play restarts Borrow (loan ${samples[0].pts} -> ${samples[3].pts} pts over 2s, still Borrow), then Live anywhere`)
  await browser.close()
}
log(`\n${fails} failures`)
fs.writeFileSync(`${EV}/fixes.txt`, `$ node fixes.mjs (Playwright 1.57 Chromium, http://localhost:4330/#home; page.clock paused and advanced with runFor; smooth scroll waited in real time)\n` + out.join('\n') + '\n')
