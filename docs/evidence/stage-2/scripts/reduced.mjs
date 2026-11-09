import { open, state, EV } from './common.mjs'
import fs from 'node:fs'
const BEAT = { 'Buy, and hold.': 'buy', 'Borrow for living money.': 'borrow', 'Spend it where life costs less.': 'live', 'Gains never taxed. Loan repaid. The rest is theirs.': 'die' }
const TITLE = { Buy: 'buy', Borrow: 'borrow', 'Live anywhere': 'live', Die: 'die' }
const out = []
const log = (s) => { out.push(s); console.log(s) }
let fails = 0
const expect = (c, m) => { log(`${c ? 'OK  ' : 'FAIL'} ${m}`); if (!c) fails++ }
const short = (s) => `card=${BEAT[s.lead]} current=${TITLE[s.current]} n=${s.nCurrent} btn="${s.btn}"`
const sig = (page) => page.evaluate(() => document.querySelector('.story').innerHTML)
const step = (page, name) => page.locator('.landing__step', { has: page.locator('.landing__step-title', { hasText: new RegExp(`^${name}$`) }) })

for (const w of [1280, 390]) {
  const { browser, page, logs } = await open({ width: w, height: w === 390 ? 844 : 900, reduced: true })
  log(`== ${w}, prefers-reduced-motion: reduce`)
  log(`matchMedia reduce: ${await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)}`)
  await page.evaluate(() => document.querySelector('.story').scrollIntoView({ block: 'center', behavior: 'instant' }))
  await page.waitForTimeout(200)
  const rest = await sig(page)
  let s = await state(page)
  // count distinct card states over 20s with nothing pressed
  const seen = new Set([rest])
  for (let i = 0; i < 100; i++) { await page.clock.runFor(200); seen.add(await sig(page)) }
  s = await state(page)
  expect(seen.size === 1 && BEAT[s.lead] === 'die' && s.btn.startsWith('Play'), `in view 20s, nothing pressed: no autoplay, ${seen.size} distinct card state (rests on Die: ${short(s)})`)
  const anims = await page.evaluate(() => document.getAnimations().length)
  log(`document.getAnimations(): ${anims}`)
  // Play: steps through finished frames only
  await page.click('.story__ctrl .story__btn >> nth=0')
  const states = []
  for (let i = 0; i <= 100; i++) {
    if (i) await page.clock.runFor(200)
    const h = await sig(page)
    const st = await state(page)
    const last = states[states.length - 1]
    if (!last || last.h !== h) states.push({ h, ms: i * 200, beat: BEAT[st.lead], cur: TITLE[st.current], btn: st.btn })
  }
  log('play pressed; card changes (ms since press):')
  for (const x of states) log(`  ${String(x.ms).padStart(6)}ms  card=${x.beat} current=${x.cur} btn="${x.btn}"`)
  const distinctFrames = new Set(states.map((x) => x.h.replace(/aria-label="(Play|Pause) the four beats"/, '').replace(/<svg class="story__ic"[^]*?<\/svg>/, ''))).size
  expect(states.map((x) => x.beat).join(',').replace(/(\w+)(,\1)+/g, '$1') === 'buy,borrow,live,die', `play shows Buy, Borrow, Live anywhere, Die in turn: ${distinctFrames} distinct card renders (one per beat, plus the button flip)`)
  expect(states[states.length - 1].btn.startsWith('Play'), 'then rests with Play shown')
  // Each beat's frame is its finished frame: compare to paused-jump finished frames
  for (const n of ['Buy', 'Borrow', 'Live anywhere', 'Die']) {
    await step(page, n).click()
    const a = await sig(page)
    await page.clock.runFor(3000)
    const b = await sig(page)
    const st = await state(page)
    const loan = await page.evaluate(() => (document.querySelector('.story__loan')?.getAttribute('d') ?? '').length)
    const heirs = await page.evaluate(() => document.querySelector('.story__heirs').getAttribute('opacity'))
    expect(a === b && BEAT[st.lead] === TITLE[n] && TITLE[st.current] === TITLE[n], `step "${n}": card=${BEAT[st.lead]} current=${TITLE[st.current]}, still after 3s: ${a === b} (loan d ${loan} chars, heirs opacity ${heirs})`)
    await page.locator('.story').screenshot({ path: `${EV}/reduced-${TITLE[n]}-${w}-light.png` })
  }
  // replay -> Buy finished
  await page.click('.story__ctrl .story__btn >> nth=1')
  s = await state(page)
  const grown = await page.evaluate(() => document.querySelectorAll('.story__bar-paid').length)
  expect(BEAT[s.lead] === 'buy', `replay: ${short(s)}, ${grown} bars drawn (Buy's finished frame)`)
  // keyboard
  await page.locator('.story__ctrl .story__btn').first().focus()
  await page.keyboard.press('Space')
  s = await state(page)
  log(`Space on play/pause: ${short(s)}`)
  // CSS transitions on the card's SVG parts?
  const tr = await page.evaluate(() => [...document.querySelectorAll('.story *')].filter((e) => { const cs = getComputedStyle(e); return cs.transitionDuration.split(',').some((d) => parseFloat(d) * (d.endsWith('ms') ? 0.001 : 1) > 0.02) || cs.animationName !== 'none' }).map((e) => e.className.baseVal ?? e.className))
  log(`card elements with a CSS transition over 20ms or a CSS animation: ${JSON.stringify(tr)}`)
  log(`console: ${JSON.stringify(logs)}`)
  await browser.close()
}
log(`\n${fails} failures`)
fs.writeFileSync(`${EV}/reduced-motion.txt`, `$ node reduced.mjs (Playwright 1.57 Chromium, context reducedMotion: 'reduce', page.clock paused and advanced with runFor; a card "state" is the .story innerHTML)\n` + out.join('\n') + '\n')
