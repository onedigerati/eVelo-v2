import { open, state, EV } from './common.mjs'
import fs from 'node:fs'

const BEAT = { 'Buy, and hold.': 'buy', 'Borrow for living money.': 'borrow', 'Spend it where life costs less.': 'live', 'Gains never taxed. Loan repaid. The rest is theirs.': 'die' }
const TITLE = { Buy: 'buy', Borrow: 'borrow', 'Live anywhere': 'live', Die: 'die' }
const out = []
const log = (s) => { out.push(s); console.log(s) }
let fails = 0
const expect = (cond, msg) => { log(`${cond ? 'OK  ' : 'FAIL'} ${msg}`); if (!cond) fails++ }
const short = (s) => `${BEAT[s.lead]}/${TITLE[s.current]}/n=${s.nCurrent}/btn="${s.btn}"`

// ---------- A. Autoplay at 1280: two passes then rest, card/caption/aria-current agree ----------
{
  const { browser, page, logs } = await open({ width: 1280, height: 900 })
  log('== A. 1280x900, card in view at load; clock paused, advanced with page.clock.runFor')
  const s0 = await state(page)
  log(`t0 (clock paused, before any rAF): ${short(s0)} live="${s0.live}"`)
  const seq = []
  let disagree = 0
  const STEP = 250
  for (let ms = 0; ms <= 45000; ms += STEP) {
    if (ms) await page.clock.runFor(STEP)
    const s = await state(page)
    const b = BEAT[s.lead], c = TITLE[s.current]
    if (b !== c || s.nCurrent !== 1) { disagree++; log(`  disagree at ${ms}ms: ${short(s)}`) }
    const last = seq[seq.length - 1]
    const key = `${b}|${s.btn}`
    if (!last || last.key !== key) seq.push({ key, ms, b, btn: s.btn })
  }
  log('beat/button transitions (ms since clock paused):')
  for (const x of seq) log(`  ${String(x.ms).padStart(6)}ms  ${x.b.padEnd(6)} ${x.btn}`)
  const beats = seq.map((x) => x.b).join(',')
  expect(beats.startsWith('buy,borrow,live,die,buy,borrow,live,die'), `two passes in order (${beats})`)
  expect(seq.filter((x) => x.b === 'buy').length === 2, 'Buy starts exactly twice (no third pass)')
  const lastT = seq[seq.length - 1]
  expect(lastT.b === 'die' && lastT.btn.startsWith('Play'), `rests on Die with Play shown (last: ${lastT.b} "${lastT.btn}" from ${lastT.ms}ms)`)
  expect(disagree === 0, `card caption and aria-current agree at all ${45000 / STEP + 1} samples, exactly one aria-current`)
  const fin = await page.evaluate(() => [...document.querySelectorAll('.story__heirs')].map((e) => getComputedStyle(e).opacity))
  log(`rest frame heirs opacity: ${fin}`)
  log(`console: ${JSON.stringify(logs)}`)
  await browser.close()
}

// ---------- B. Pause, play, replay by mouse ----------
{
  const { browser, page, logs } = await open({ width: 1280, height: 900 })
  log('\n== B. mouse: pause / play / replay')
  await page.clock.runFor(5000) // Borrow
  let s = await state(page)
  log(`at +5s: ${short(s)}`)
  await page.click('.story__ctrl .story__btn >> nth=0')
  s = await state(page)
  expect(s.btn.startsWith('Play'), `click pause -> button reads "${s.btn}", live="${s.live}"`)
  const d1 = await page.locator('.story__loan').getAttribute('d')
  await page.clock.runFor(4000)
  const d2 = await page.locator('.story__loan').getAttribute('d')
  s = await state(page)
  expect(d1 === d2 && BEAT[s.lead] === 'borrow', `paused 4s: loan path unchanged (${d1 === d2}), still ${BEAT[s.lead]}`)
  await page.screenshot({ path: `${EV}/paused-borrow-1280-light.png` })
  await page.click('.story__ctrl .story__btn >> nth=0')
  s = await state(page)
  expect(s.btn.startsWith('Pause'), `click play -> "${s.btn}", live="${s.live}"`)
  await page.clock.runFor(1000)
  const d3 = await page.locator('.story__loan').getAttribute('d')
  expect(d3 !== d2, 'loan path moves after play')
  await page.clock.runFor(3500) // into Live
  s = await state(page)
  log(`after +3.5s more: ${short(s)}`)
  await page.click('.story__ctrl .story__btn >> nth=1')
  await page.clock.runFor(1500)
  s = await state(page)
  const bars = s.bars
  expect(BEAT[s.lead] === 'buy' && s.btn.startsWith('Pause'), `click replay -> back to Buy and playing (${short(s)}), live="${s.live}"`)
  await page.screenshot({ path: `${EV}/replay-buy-1280-light.png` })
  // Replay plays one pass then rests
  await page.clock.runFor(16000 + 4000)
  s = await state(page)
  expect(BEAT[s.lead] === 'die' && s.btn.startsWith('Play'), `after replay's pass + hold: rests on Die (${short(s)})`)
  await page.clock.runFor(10000)
  s = await state(page)
  expect(BEAT[s.lead] === 'die' && s.btn.startsWith('Play'), `10s later still resting (${short(s)})`)
  // Play from rest starts over
  await page.click('.story__ctrl .story__btn >> nth=0')
  await page.clock.runFor(1000)
  s = await state(page)
  expect(BEAT[s.lead] === 'buy' && s.btn.startsWith('Pause'), `play at rest starts over from Buy (${short(s)})`)
  log(`console: ${JSON.stringify(logs)}`)
  await browser.close()
}

// ---------- C. Keyboard ----------
{
  const { browser, page, logs } = await open({ width: 1280, height: 900 })
  log('\n== C. keyboard: Tab to the controls, Space / Enter')
  await page.clock.runFor(2000)
  // tab from the top until the play button is focused
  let found = false
  const order = []
  for (let i = 0; i < 30; i++) {
    await page.keyboard.press('Tab')
    const a = await page.evaluate(() => document.activeElement?.getAttribute('aria-label') || document.activeElement?.textContent?.slice(0, 30))
    order.push(a)
    if (a && /^(Pause|Play) the four beats/.test(a)) { found = true; break }
  }
  log(`tab order: ${order.join(' | ')}`)
  expect(found, 'play/pause reachable by Tab')
  const fv = await page.evaluate(() => getComputedStyle(document.activeElement).outlineStyle + ' ' + getComputedStyle(document.activeElement).outlineWidth)
  log(`focus outline: ${fv}`)
  await page.keyboard.press('Space')
  let s = await state(page)
  expect(s.btn.startsWith('Play'), `Space pauses (${short(s)}), live="${s.live}"`)
  const focusName = await page.evaluate(() => document.activeElement?.getAttribute('aria-label'))
  expect(focusName === s.btn, `focus stays on the toggle after its label changes ("${focusName}")`)
  await page.screenshot({ path: `${EV}/keyboard-paused-focus-1280-light.png` })
  const before = await page.locator('.story__bar-paid').count()
  await page.clock.runFor(2000)
  expect((await page.locator('.story__bar-paid').count()) === before, 'paused: bar count unchanged over 2s')
  await page.keyboard.press('Enter')
  s = await state(page)
  expect(s.btn.startsWith('Pause'), `Enter plays (${short(s)})`)
  await page.clock.runFor(4000)
  s = await state(page)
  log(`+4s: ${short(s)}`)
  await page.keyboard.press('Tab')
  const rn = await page.evaluate(() => document.activeElement?.getAttribute('aria-label'))
  expect(rn === 'Replay from the start', `Tab -> "${rn}"`)
  await page.keyboard.press('Enter')
  await page.clock.runFor(500)
  s = await state(page)
  expect(BEAT[s.lead] === 'buy' && s.btn.startsWith('Pause'), `Enter on replay -> Buy, playing (${short(s)})`)
  await page.keyboard.press('Space')
  await page.clock.runFor(300)
  s = await state(page)
  expect(BEAT[s.lead] === 'buy', `Space on replay restarts again (${short(s)})`)
  log(`console: ${JSON.stringify(logs)}`)
  await browser.close()
}

// ---------- D. Plays only in view ----------
{
  log('\n== D. in view only')
  const { browser, page, logs } = await open({ width: 1280, height: 900 })
  // Scroll the card out of view at once, before any frame runs
  await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }))
  await page.clock.runFor(300)
  const vis = await page.evaluate(() => { const r = document.querySelector('.story').getBoundingClientRect(); return [r.top, r.bottom, innerHeight] })
  log(`card rect after scrolling down: top ${vis[0].toFixed(0)} bottom ${vis[1].toFixed(0)} viewport ${vis[2]}`)
  let s = await state(page)
  log(`first sample: ${short(s)}`)
  await page.clock.runFor(10000)
  const s2 = await state(page)
  log(`+10s out of view: ${short(s2)}`)
  await browser.close()

  // Phone: card below the fold at load
  const p = await open({ width: 390, height: 844 })
  const r = await p.page.evaluate(() => { const r = document.querySelector('.story').getBoundingClientRect(); const h = r.height; return { top: r.top, h, vis: Math.max(0, Math.min(innerHeight, r.bottom) - Math.max(0, r.top)) / h } })
  log(`390x844: card top ${r.top.toFixed(0)}, height ${r.h.toFixed(0)}, ${(r.vis * 100).toFixed(0)}% visible at load`)
  await p.page.clock.runFor(10000)
  s = await state(p.page)
  expect(BEAT[s.lead] === 'die' && s.btn.startsWith('Play'), `390: 10s with card below the fold -> still resting on Die (${short(s)})`)
  await p.page.evaluate(() => document.querySelector('.story').scrollIntoView({ block: 'center', behavior: 'instant' }))
  await p.page.waitForTimeout(400)
  await p.page.clock.runFor(2000)
  s = await state(p.page)
  expect(BEAT[s.lead] === 'buy' && s.btn.startsWith('Pause'), `scrolled into view -> autoplay starts (${short(s)})`)
  await p.page.clock.runFor(3500) // ~5.5s Borrow
  const dIn = await p.page.locator('.story__loan').getAttribute('d')
  s = await state(p.page)
  log(`at ~5.5s: ${short(s)}`)
  await p.page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }))
  await p.page.waitForTimeout(400)
  await p.page.clock.runFor(8000)
  const dOut = await p.page.locator('.story__loan').getAttribute('d')
  const sOut = await state(p.page)
  await p.page.evaluate(() => document.querySelector('.story').scrollIntoView({ block: 'center', behavior: 'instant' }))
  await p.page.waitForTimeout(400)
  const sBack = await state(p.page)
  const dBack = await p.page.locator('.story__loan').getAttribute('d')
  // allow for a frame or two between the scroll and the observer firing
  expect(BEAT[sBack.lead] === 'borrow' && Math.abs((dBack?.length ?? 0) - (dIn?.length ?? 0)) < 40, `8s scrolled away -> back in view still in Borrow where it left (${short(sBack)}; loan d length ${dIn?.length} -> ${dBack?.length})`)
  await p.page.clock.runFor(1000)
  const dGo = await p.page.locator('.story__loan').getAttribute('d')
  expect(dGo !== dBack, 'resumes moving once back in view')
  log(`console: ${JSON.stringify([...logs, ...p.logs])}`)
  await p.browser.close()
}

log(`\n${fails} failures`)
fs.writeFileSync(`${EV}/playback.txt`, `$ node playback.mjs (Playwright 1.57 Chromium, http://localhost:4330/#home, vite preview of npm run build; page.clock installed and paused, advanced with clock.runFor)\n` + out.join('\n') + '\n')
