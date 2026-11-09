import { open, state, EV } from './common.mjs'
import fs from 'node:fs'
const BEAT = { 'Buy, and hold.': 'buy', 'Borrow for living money.': 'borrow', 'Spend it where life costs less.': 'live', 'Gains never taxed. Loan repaid. The rest is theirs.': 'die' }
const TITLE = { Buy: 'buy', Borrow: 'borrow', 'Live anywhere': 'live', Die: 'die' }
const NAMES = ['Buy', 'Borrow', 'Live anywhere', 'Die']
const out = []
const log = (s) => { out.push(s); console.log(s) }
let fails = 0
const expect = (c, m) => { log(`${c ? 'OK  ' : 'FAIL'} ${m}`); if (!c) fails++ }
const short = (s) => `card=${BEAT[s.lead]} current=${TITLE[s.current]} n=${s.nCurrent} btn="${s.btn}"`
const svgSig = (page) => page.evaluate(() => document.querySelector('.story__svg').innerHTML.length + ':' + (document.querySelector('.story__loan')?.getAttribute('d') ?? '').length + ':' + document.querySelector('.story__heirs')?.getAttribute('opacity'))
const step = (page, name) => page.locator('.landing__step', { has: page.locator('.landing__step-title', { hasText: new RegExp(`^${name}$`) }) })

// ---------- A. 1280, playing: a step goes to the beat's start and keeps playing ----------
{
  const { browser, page, logs } = await open({ width: 1280, height: 900 })
  log('== A. 1280 playing: click each step')
  await page.clock.runFor(1000)
  for (const n of ['Live anywhere', 'Borrow', 'Die', 'Buy']) {
    await step(page, n).click()
    const s = await state(page)
    expect(BEAT[s.lead] === TITLE[n] && TITLE[s.current] === TITLE[n] && s.nCurrent === 1 && s.btn.startsWith('Pause'), `click "${n}": ${short(s)} live="${s.live.slice(0, 40)}…"`)
    await page.clock.runFor(1500)
    const s2 = await state(page)
    expect(BEAT[s2.lead] === TITLE[n], `  +1.5s still ${TITLE[n]} and moving (${short(s2)})`)
  }
  // agreement through a pass after a jump
  await step(page, 'Borrow').click()
  let dis = 0, seen = new Set()
  for (let i = 0; i < 80; i++) { await page.clock.runFor(200); const s = await state(page); seen.add(BEAT[s.lead]); if (BEAT[s.lead] !== TITLE[s.current] || s.nCurrent !== 1) dis++ }
  expect(dis === 0, `after jumping to Borrow, 80 samples over 16s: card/caption and aria-current agree (beats seen: ${[...seen]})`)
  log(`console: ${JSON.stringify(logs)}`)
  await browser.close()
}

// ---------- B. Paused: a step shows the beat's finished frame ----------
{
  const { browser, page, logs } = await open({ width: 1280, height: 900 })
  log('\n== B. 1280 paused: steps show finished frames, keyboard Enter/Space')
  await page.clock.runFor(2000)
  await page.click('.story__ctrl .story__btn >> nth=0') // pause
  for (const n of NAMES) {
    await step(page, n).click()
    const sig1 = await svgSig(page)
    await page.clock.runFor(3000)
    const sig2 = await svgSig(page)
    const s = await state(page)
    expect(BEAT[s.lead] === TITLE[n] && TITLE[s.current] === TITLE[n] && sig1 === sig2 && s.btn.startsWith('Play'), `paused, click "${n}": ${short(s)}; frame unchanged after 3s: ${sig1 === sig2}`)
    await page.locator('.story').screenshot({ path: `${EV}/jump-paused-${TITLE[n]}-1280-light.png` })
  }
  // keyboard on the steps
  await step(page, 'Buy').focus()
  await page.keyboard.press('Enter')
  let s = await state(page)
  expect(BEAT[s.lead] === 'buy' && TITLE[s.current] === 'buy', `focus "01 Buy", Enter: ${short(s)}`)
  await page.keyboard.press('Tab')
  await page.keyboard.press('Space')
  s = await state(page)
  expect(BEAT[s.lead] === 'borrow' && TITLE[s.current] === 'borrow', `Tab, Space on "02 Borrow": ${short(s)}`)
  // play from a jumped beat continues from there
  await page.click('.story__ctrl .story__btn >> nth=0')
  await page.clock.runFor(1000)
  s = await state(page)
  log(`play after paused jump to Borrow, +1s: ${short(s)}`)
  log(`console: ${JSON.stringify(logs)}`)
  await browser.close()
}

// ---------- C. 390 phone: steps change the card; where is the card? ----------
{
  const { browser, page, logs } = await open({ width: 390, height: 844 })
  log('\n== C. 390x844: press steps from the steps section')
  await step(page, 'Buy').scrollIntoViewIfNeeded()
  await page.waitForTimeout(200)
  for (const n of NAMES) {
    await step(page, n).click()
    await page.waitForTimeout(150)
    await page.clock.runFor(500)
    const s = await state(page)
    const r = await page.evaluate(() => { const r = document.querySelector('.story').getBoundingClientRect(); const c = document.querySelector('.story__cap').getBoundingClientRect(); return { cardTop: Math.round(r.top), cardBottom: Math.round(r.bottom), capBottom: Math.round(c.bottom), vh: innerHeight, scrollY: Math.round(scrollY) } })
    expect(BEAT[s.lead] === TITLE[n] && TITLE[s.current] === TITLE[n], `click "${n}": ${short(s)}; card ${r.cardTop}..${r.cardBottom} (caption bottom ${r.capBottom}) in a ${r.vh}px viewport, scrollY ${r.scrollY}`)
  }
  await page.screenshot({ path: `${EV}/steps-390-light-after-press.png` })
  log(`console: ${JSON.stringify(logs)}`)
  await browser.close()
}
log(`\n${fails} failures`)
fs.writeFileSync(`${EV}/steps.txt`, `$ node steps.mjs (Playwright 1.57 Chromium, http://localhost:4330/#home, page.clock paused and advanced with runFor)\n` + out.join('\n') + '\n')
