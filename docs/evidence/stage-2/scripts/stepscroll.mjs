import { open, state, EV } from './common.mjs'
import fs from 'node:fs'
const out = []
const log = (s) => { out.push(s); console.log(s) }
let fails = 0
const expect = (c, m) => { log(`${c ? 'OK  ' : 'FAIL'} ${m}`); if (!c) fails++ }
const BEAT = { 'Buy, and hold.': 'buy', 'Borrow for living money.': 'borrow', 'Spend it where life costs less.': 'live', 'Gains never taxed. Loan repaid. The rest is theirs.': 'die' }
const NAMES = ['Buy', 'Borrow', 'Live anywhere', 'Die']
const step = (page, name) => page.locator('.landing__step', { has: page.locator('.landing__step-title', { hasText: new RegExp(`^${name}$`) }) })
const geo = (page, name) => page.evaluate((name) => {
  const p = document.querySelector('.story__plot').getBoundingClientRect()
  const st = [...document.querySelectorAll('.landing__step')].find((b) => b.querySelector('.landing__step-title').textContent === name).getBoundingClientRect()
  const vh = innerHeight
  const seen = (r) => Math.max(0, Math.min(vh, r.bottom) - Math.max(0, r.top)) / r.height
  return { y: Math.round(scrollY), chart: Math.round(100 * seen(p)), step: Math.round(100 * seen(st)), stepTop: Math.round(st.top), stepBottom: Math.round(st.bottom), vh, focus: document.activeElement?.querySelector?.('.landing__step-title')?.textContent ?? document.activeElement?.tagName }
}, name)
const settle = (page) => page.waitForTimeout(1300) // smooth scroll runs on real time

const CASES = [[1280, 900], [1000, 900], [390, 844]]
for (const [w, h] of CASES) for (const startAt of ['steps at the foot', 'steps at the top']) {
  for (const mode of ['mouse', 'tab+enter 0ms', 'tab+enter 100ms', 'tab+enter 1000ms']) {
    const { browser, page, logs } = await open({ width: w, height: h })
    // start with the steps in view: the last step's foot at the viewport's foot
    await page.evaluate((startAt) => {
      if (startAt === 'steps at the foot') { const l = [...document.querySelectorAll('.landing__step')].at(-1).getBoundingClientRect(); window.scrollTo({ top: scrollY + l.bottom - innerHeight + 24, behavior: 'instant' }) }
      else { const f = document.querySelector('.landing__step').getBoundingClientRect(); window.scrollTo({ top: scrollY + f.top - 12, behavior: 'instant' }) }
    }, startAt)
    await page.waitForTimeout(300)
    const start = await geo(page, 'Buy')
    log(`\n== ${w}x${h}, ${mode}, start with ${startAt}; start scrollY ${start.y}, chart ${start.chart}% on screen`)
    const ys = []
    const seq = mode === 'mouse' ? [...NAMES, 'Borrow'] : NAMES
    for (const [i, n] of seq.entries()) {
      let before
      if (mode === 'mouse') {
        before = await geo(page, n)
        await step(page, n).click() // Playwright scrolls the step into view first if it is off screen, as a visitor would
      } else {
        if (i === 0) { await step(page, n).focus(); await settle(page) }
        else { await page.keyboard.press('Tab'); const gap = +mode.match(/(\d+)ms/)[1]; if (gap) await page.waitForTimeout(gap) }
        before = await geo(page, n)
        await page.keyboard.press('Enter')
      }
      await settle(page)
      const g = await geo(page, n)
      const s = await state(page)
      ys.push(g.y)
      log(`  ${n.padEnd(13)} before: y ${before.y} chart ${before.chart}% step ${before.step}% | after: y ${g.y}, chart ${g.chart}% on screen, pressed step ${g.step}% on screen (top ${g.stepTop}, bottom ${g.stepBottom} of ${g.vh}), focus "${g.focus}", card ${BEAT[s.lead]}`)
      const agrees = BEAT[s.lead] === { Buy: 'buy', Borrow: 'borrow', 'Live anywhere': 'live', Die: 'die' }[n]
      if (w === 390) expect(((g.chart >= 50 && g.step >= 99) || g.chart >= 99) && g.focus === n && agrees, `  ${w} ${mode} "${n}": the step whole with >= half the chart (tier 2) or the whole chart (tier 3), focus kept, card agrees`)
      else expect(g.chart >= 50 && g.step >= 99 && g.focus === n && agrees, `  ${w} ${mode} "${n}": chart >= half (${g.chart}%) and the pressed step fully on screen (${g.step}%), focus kept`)
    }
    const moves = ys.slice(1).map((y, i) => y - ys[i])
    log(`  scrollY after each press: ${ys.join(' -> ')}`)
    if (w !== 390) expect(moves.every((d) => d === 0) && (mode !== 'mouse' || true), `  ${w} ${mode}: no bounce between presses (moves ${JSON.stringify(moves)})`)
    else log(`  (phone, tier 3: the step is off screen after each reveal by design; ${mode === 'mouse' ? 'each click first scrolls back down to the step' : 'each Tab scrolls back down to the next step'})`)
    if (logs.length) log(`console: ${JSON.stringify(logs)}`)
    if (mode === 'mouse') await page.screenshot({ path: `${EV}/stepscroll-${w}-${startAt === 'steps at the top' ? 'from-top' : 'from-foot'}-mouse-after.png` })
    await browser.close()
  }
}
log(`\n${fails} failures`)
fs.writeFileSync(`${EV}/step-scroll.txt`, `$ node stepscroll.mjs (Playwright 1.57 Chromium, vite preview :4330; steps scrolled into view first; each press waited 1.3 s real time for the smooth scroll; "tab+enter Nms" = Tab, wait N ms, Enter)\n` + out.join('\n') + '\n')
