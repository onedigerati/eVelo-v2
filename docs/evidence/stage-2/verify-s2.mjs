// Stage 2 verify: chart as scrubber. Run from repo root: node verify-s2.mjs <outdir> [phone|desktop|all]
import { chromium } from '/home/jonah/src/repos/eVelo-v2/node_modules/playwright/index.mjs'
import { withPreview } from '/home/jonah/src/repos/eVelo-v2/scripts/serve-preview.mjs'
const OUT = process.argv[2]
const WHICH = process.argv[3] ?? 'all'
const fails = []
const check = (ok, msg) => { console.log(`${ok ? 'ok  ' : 'FAIL'} ${msg}`); if (!ok) fails.push(msg) }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const EVELO = { portfolio: 2_000_000, age: 60, horizonYears: 20, homeCityId: 'new-york', otherIncome: 30_000, incomeStartAge: 62, paths: 300, seed: 11 }
const MODE = { portfolio: 2_000_000, basisFraction: 0.5, age: 60, horizonYears: 20, spending: 90_000, otherIncome: 30_000, incomeStartAge: 62, stockShare: 0.6, muniShare: 0.5, filingStatus: 'mfj', homeCityId: 'new-york', seed: 11, paths: 300, blockMonths: 36, outlook: 'balanced', step: 6, done: true }
const CH = '[data-testid="wt-chart-svg"]'
const RO = '[data-testid="wt-chart"] [data-testid="chart-readout"]'

async function open(browser, { theme = 'light', phone = false, reduced = false } = {}) {
  const ctx = await browser.newContext(phone
    ? { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2, reducedMotion: reduced ? 'reduce' : 'no-preference' }
    : { viewport: { width: 1280, height: 900 }, reducedMotion: reduced ? 'reduce' : 'no-preference' })
  await ctx.addInitScript(([e, m, t]) => {
    try {
      if (!localStorage.getItem('evelo:v2')) localStorage.setItem('evelo:v2', JSON.stringify({ inputs: e, theme: t, themeV: 2 }))
      if (!localStorage.getItem('evelo:v2:income')) localStorage.setItem('evelo:v2:income', JSON.stringify(m))
    } catch {}
  }, [EVELO, MODE, theme])
  const p = await ctx.newPage()
  const errs = []
  p.on('pageerror', (e) => errs.push(e.message))
  p.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text()) })
  await p.goto(globalThis.BASE + '#income')
  await p.locator('[data-testid="income-results"]').waitFor({ timeout: 20000 })
  await p.getByRole('button', { name: 'Sync with my eVelo plan' }).click()
  await p.locator('.isync__copy').click()
  await p.locator(CH).waitFor({ timeout: 30000 })
  await sleep(1500)
  await p.locator('[data-testid="wt-chart"]').scrollIntoViewIfNeeded()
  await sleep(500)
  const dt = await p.evaluate(() => document.documentElement.dataset.theme)
  const rm = await p.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)
  console.log(`open theme=${theme} (data-theme=${dt}) phone=${phone} reducedMotion=${rm}`)
  return { ctx, p, errs }
}

const state = (p) => p.evaluate(([ch, ro]) => {
  const wt = document.querySelector('[data-testid="walkthrough"]')
  const svg = document.querySelector(ch)
  const r = document.querySelector(ro)
  const cross = document.querySelector('[data-testid="wt-crosshair"]')
  const clone = wt.cloneNode(true); clone.querySelector('[data-testid="wt-chart"]')?.remove()
  return {
    year: wt.dataset.year, now: svg.getAttribute('aria-valuenow'), text: svg.getAttribute('aria-valuetext'),
    body: clone.textContent.replace(/\s+/g, ' '),
    readoutOn: !!r && r.classList.contains('is-on'), readoutText: r ? r.innerText.replace(/\n+/g, ' | ') : null,
    cross: cross ? cross.dataset.row : null, focused: document.activeElement === svg, scrollY: window.scrollY,
    labels: svg.querySelectorAll('.wtchart__value').length,
  }
}, [CH, RO])

const plotBox = (p) => p.evaluate((ch) => {
  const g = document.querySelector(`${ch} .wtchart__grid`)
  const sb = document.querySelector(ch).getBoundingClientRect()
  return { x0: Number(g.getAttribute('x1')) + sb.left, x1: Number(g.getAttribute('x2')) + sb.left, top: sb.top, h: sb.height, bottom: sb.bottom }
}, CH)

async function clip(p, sel = '[data-testid="wt-chart"]', pad = 20) {
  const b = await p.locator(sel).boundingBox()
  const vw = p.viewportSize().width
  const x = Math.max(0, b.x - pad)
  return { x, y: Math.max(0, b.y - 40), width: Math.min(vw - x, b.width + 2 * pad), height: b.height + 60 }
}

// one touch gesture via CDP: start, `steps` moves to (x+dx, y+dy) ~16ms apart, end; returns data-year after each move
async function gesture(cdp, p, x, y, dx, dy, steps = 12) {
  const years = []
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, id: 1 }] })
  for (let i = 1; i <= steps; i++) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + (dx * i) / steps, y: y + (dy * i) / steps, id: 1 }] })
    await sleep(16)
    years.push(await p.evaluate(() => document.querySelector('[data-testid="walkthrough"]').dataset.year))
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await sleep(400)
  return years
}

async function phoneRun(browser) {
  const { ctx, p, errs } = await open(browser, { theme: 'light', phone: true })
  const cdp = await ctx.newCDPSession(p)
  // layout where the slider row used to be: the walkthrough controls + chart + below
  check((await p.locator('[data-testid="wt-year"], [data-testid="walkthrough"] input[type="range"], .wt__scrub').count()) === 0, 'phone: no slider row elements in the DOM')
  await p.screenshot({ path: `${OUT}/phone-walkthrough-layout.png`, fullPage: false })
  const wtBox = await p.locator('[data-testid="walkthrough"]').boundingBox()
  await p.screenshot({ path: `${OUT}/phone-walkthrough-full.png`, fullPage: true, clip: { x: 0, y: wtBox.y + (await p.evaluate(() => scrollY)) - 10, width: 390, height: Math.min(wtBox.height + 20, 3000) } })
  // gap between chart and next sibling
  const gap = await p.evaluate(() => {
    const c = document.querySelector('[data-testid="wt-chart"]')
    const b = c.getBoundingClientRect()
    let n = c.nextElementSibling, el = c
    while (!n && el.parentElement) { el = el.parentElement; n = el.nextElementSibling }
    const nb = n?.getBoundingClientRect()
    return { chartBottom: b.bottom, next: n ? (n.dataset.testid || n.className) : null, nextTop: nb?.top, gap: nb ? nb.top - b.bottom : null }
  })
  console.log('phone chart -> next block:', JSON.stringify(gap))
  check(gap.gap === null || (gap.gap >= 0 && gap.gap < 60), `phone: no leftover gap under the chart (${gap.gap?.toFixed?.(0)}px to ${gap.next})`)

  await p.locator('[data-testid="wt-chart"]').scrollIntoViewIfNeeded(); await sleep(500)
  let pb = await plotBox(p)
  const midY = pb.top + pb.h / 2
  const s0 = await state(p)
  console.log('phone start:', JSON.stringify({ year: s0.year, now: s0.now, text: s0.text, scrollY: s0.scrollY }))
  await p.screenshot({ path: `${OUT}/phone-0-start.png`, clip: await clip(p, '[data-testid="wt-chart"]', 0) })

  // tap at ~75% across
  const tapX = pb.x0 + (pb.x1 - pb.x0) * 0.75
  await gesture(cdp, p, tapX, midY, 0, 0, 1)
  const st = await state(p)
  console.log('tap:', JSON.stringify({ year: st.year, now: st.now, text: st.text, readoutOn: st.readoutOn }))
  check(st.year !== s0.year && Number(st.year) >= 12 && st.now === st.year && st.body !== s0.body, `phone: tap at 75% picks that year (${s0.year} -> ${st.year}, valuenow ${st.now})`)
  await p.screenshot({ path: `${OUT}/phone-1-tap.png`, clip: await clip(p, '[data-testid="wt-chart"]', 0) })

  // tap with p.tap too (Playwright touchscreen) at 25%
  await p.touchscreen.tap(pb.x0 + (pb.x1 - pb.x0) * 0.25, midY); await sleep(400)
  const st2 = await state(p)
  check(Number(st2.year) <= 7 && st2.year !== st.year, `phone: touchscreen.tap at 25% picks that year (${st.year} -> ${st2.year})`)

  // sideways drag from 20% to 80%
  pb = await plotBox(p)
  const sy0 = (await state(p)).scrollY
  const yrs = await gesture(cdp, p, pb.x0 + (pb.x1 - pb.x0) * 0.2, midY, (pb.x1 - pb.x0) * 0.6, 6, 12)
  const sd = await state(p)
  const distinct = [...new Set(yrs)]
  console.log('sideways drag years per move:', yrs.join(','), 'scrollY', sy0, '->', sd.scrollY)
  check(distinct.length >= 5 && Number(sd.year) > Number(st2.year) && Math.abs(sd.scrollY - sy0) < 2, `phone: sideways drag scrubs year step by step (${distinct.join('->')}), page not scrolled (${sy0}->${sd.scrollY})`)
  await p.screenshot({ path: `${OUT}/phone-2-scrubbed.png`, clip: await clip(p, '[data-testid="wt-chart"]', 0) })

  // sideways drag back right to left
  const yrsBack = await gesture(cdp, p, pb.x0 + (pb.x1 - pb.x0) * 0.8, midY, -(pb.x1 - pb.x0) * 0.5, -4, 12)
  const sb2 = await state(p)
  console.log('leftward drag years:', yrsBack.join(','))
  check(Number(sb2.year) < Number(sd.year) && new Set(yrsBack).size >= 4, `phone: leftward drag scrubs back (${sd.year} -> ${sb2.year})`)

  // vertical drag (finger up by 250px => page scrolls down)
  const before = await state(p)
  const yrsV = await gesture(cdp, p, pb.x0 + (pb.x1 - pb.x0) * 0.5, midY + 40, 10, -250, 12)
  await sleep(600)
  const sv = await state(p)
  console.log('vertical drag years per move:', yrsV.join(','), 'scrollY', before.scrollY, '->', sv.scrollY)
  check(sv.scrollY - before.scrollY > 100 && sv.year === before.year && yrsV.every((y) => y === before.year), `phone: vertical drag scrolls the page (${before.scrollY}->${sv.scrollY}) and leaves the year (${before.year} -> ${sv.year})`)
  await p.screenshot({ path: `${OUT}/phone-3-after-vertical.png` })
  // vertical drag downward
  await p.locator('[data-testid="wt-chart"]').scrollIntoViewIfNeeded(); await sleep(500)
  pb = await plotBox(p)
  const b2 = await state(p)
  const yrsV2 = await gesture(cdp, p, pb.x0 + (pb.x1 - pb.x0) * 0.3, pb.top + 30, -8, 200, 12)
  await sleep(600)
  const sv2 = await state(p)
  console.log('downward drag scrollY', b2.scrollY, '->', sv2.scrollY, 'year', b2.year, '->', sv2.year)
  check(b2.scrollY - sv2.scrollY > 80 && sv2.year === b2.year && yrsV2.every((y) => y === b2.year), `phone: downward vertical drag scrolls up (${b2.scrollY}->${sv2.scrollY}), year unchanged`)
  check(errs.length === 0, `phone: no page/console errors ${errs.join(' | ')}`)
  // dark phone layout screenshot
  await ctx.close()
  const d = await open(browser, { theme: 'dark', phone: true })
  await d.p.screenshot({ path: `${OUT}/phone-walkthrough-layout-dark.png` })
  check(d.errs.length === 0, `phone dark: no errors ${d.errs.join(' | ')}`)
  await d.ctx.close()
}

async function desktopRun(browser) {
  // hover + click, light
  const { ctx, p, errs } = await open(browser, { theme: 'light' })
  const cdp = await ctx.newCDPSession(p)
  const pb = await plotBox(p)
  const midY = pb.top + pb.h / 2
  const s0 = await state(p)
  check(!s0.readoutOn && s0.cross === null && s0.labels > 0, 'desktop: no readout/crosshair before hover, marker labels shown')
  // screen-reader name/value
  const aria = await p.locator(CH).ariaSnapshot()
  console.log('aria snapshot of chart:', aria.replace(/\n/g, ' / '))
  const { nodes } = await cdp.send('Accessibility.getFullAXTree')
  const sl = nodes.filter((n) => n.role?.value === 'slider')
  const ax = sl.map((n) => ({ name: n.name?.value, value: n.value?.value, props: Object.fromEntries((n.properties ?? []).filter((q) => ['valuemin', 'valuemax', 'valuetext', 'orientation', 'focusable'].includes(q.name)).map((q) => [q.name, q.value.value])) }))
  console.log('AX sliders:', JSON.stringify(ax))
  const chartAx = ax.find((a) => a.name === 'Year in the walkthrough')
  // CDP reports valuetext "" for every slider, an HTML div control included (see probe-ax.txt), so the spoken value text is read from the DOM attribute
  const domVt = await p.locator(CH).getAttribute('aria-valuetext')
  check(!!chartAx && chartAx.value === 0 && chartAx.props.valuemin === 0 && chartAx.props.valuemax === 19 && chartAx.props.focusable && domVt === 'End of age 60, year 1 of 20', `desktop: AX slider name "${chartAx?.name}", value ${chartAx?.value} of ${chartAx?.props.valuemin}..${chartAx?.props.valuemax}, aria-valuetext "${domVt}"`)
  check(sl.length === 1 || !sl.some((n) => n.name?.value?.match(/year/i) && n !== sl.find((m) => m.name?.value === 'Year in the walkthrough')), `desktop: only one year slider in the AX tree (${sl.length} sliders total: ${sl.map((n) => n.name?.value).join('; ')})`)
  const hidden = await p.evaluate((ch) => [...document.querySelector(ch).children].every((c) => c.getAttribute('aria-hidden') === 'true' || c.tagName === 'title' || c.tagName === 'desc'), CH)
  console.log('chart children all aria-hidden:', hidden)
  for (const [name, f] of [['left', 0.01], ['middle', 0.5], ['right', 0.99]]) {
    await p.mouse.move(pb.x0 + (pb.x1 - pb.x0) * f, midY, { steps: 4 }); await sleep(250)
    const s = await state(p)
    console.log(`hover ${name}: cross=${s.cross} readout="${s.readoutText}"`)
    check(s.readoutOn && s.cross !== null && s.labels === 0 && s.year === s0.year && s.body === s0.body, `desktop hover ${name}: readout + crosshair row ${s.cross}, picked year unchanged (${s.year})`)
    await p.screenshot({ path: `${OUT}/desktop-hover-${name}.png`, clip: await clip(p) })
  }
  await p.mouse.move(pb.x1 + 200, pb.top - 150); await sleep(250)
  const sl2 = await state(p)
  check(!sl2.readoutOn && sl2.cross === null && sl2.labels > 0, 'desktop: mouse leave hides readout, labels back')
  await p.mouse.move((pb.x0 + pb.x1) / 2, midY); await sleep(200)
  const hov = await state(p)
  await p.mouse.click((pb.x0 + pb.x1) / 2, midY); await sleep(400)
  const sc = await state(p)
  console.log(`click: hovered ${hov.cross} -> year ${sc.year}, valuenow ${sc.now}, valuetext "${sc.text}"`)
  check(String(hov.cross) === sc.year && sc.now === sc.year && sc.body !== s0.body && /End of age \d+, year \d+ of 20/.test(sc.text), `desktop: click picks hovered year ${sc.year}; aria-valuenow/valuetext follow ("${sc.text}")`)
  await p.screenshot({ path: `${OUT}/desktop-click-picked.png`, clip: await clip(p) })
  // mouse click should not show keyboard readout after moving away
  await p.mouse.move(pb.x1 + 200, pb.top - 150); await sleep(250)
  const sm = await state(p)
  console.log('after click + leave: focused', sm.focused, 'readoutOn', sm.readoutOn)
  check(!sm.readoutOn, 'desktop: after a click and leaving, no stuck readout (mouse focus is not keyboard focus)')
  check(errs.length === 0, `desktop light: no page/console errors ${errs.join(' | ')}`)
  await ctx.close()

  // keyboard, both themes; reduced motion pass
  for (const [theme, reduced] of [['light', false], ['dark', false], ['light', true], ['dark', true]]) {
    const tag = `${theme}${reduced ? '-reduced' : ''}`
    const { ctx, p, errs } = await open(browser, { theme, reduced })
    await p.evaluate((ch) => {
      const svg = document.querySelector(ch)
      const all = [...document.querySelectorAll('a[href],button,input,select,textarea,[tabindex]')].filter((e) => (e.tabIndex >= 0 && !e.disabled && e.offsetParent !== null) || e === svg)
      all[all.indexOf(svg) - 1]?.focus()
    }, CH)
    let got = false
    for (let k = 0; k < 5 && !got; k++) { await p.keyboard.press('Tab'); got = (await state(p)).focused }
    await sleep(250)
    const sf = await state(p)
    check(sf.focused && sf.readoutOn && String(sf.cross) === sf.year, `${tag}: Tab focuses chart, readout for picked year ${sf.year}`)
    await p.screenshot({ path: `${OUT}/desktop-${tag}-focus.png`, clip: await clip(p) })
    await p.keyboard.press('ArrowRight'); await p.keyboard.press('ArrowRight'); await sleep(250)
    const sa = await state(p)
    check(Number(sa.year) === Number(sf.year) + 2 && sa.now === sa.year && String(sa.cross) === sa.year, `${tag}: 2x ArrowRight ${sf.year} -> ${sa.year} ("${sa.text}")`)
    await p.keyboard.press('End'); await sleep(250)
    const se = await state(p)
    check(se.year === '19' && se.text === 'End of age 79, year 20 of 20', `${tag}: End -> ${se.year} ("${se.text}")`)
    await p.screenshot({ path: `${OUT}/desktop-${tag}-end.png`, clip: await clip(p) })
    await p.keyboard.press('Home'); await sleep(250)
    const sh = await state(p)
    check(sh.year === '0' && sh.text === 'End of age 60, year 1 of 20', `${tag}: Home -> ${sh.year} ("${sh.text}")`)
    await p.keyboard.press('ArrowLeft'); await sleep(150)
    check((await state(p)).year === '0', `${tag}: ArrowLeft at the start stays at 0`)
    const box = await p.locator(CH).boundingBox()
    await p.mouse.move(box.x + box.width * 0.7, box.y + box.height / 2); await sleep(250)
    await p.screenshot({ path: `${OUT}/desktop-${tag}-hover.png`, clip: await clip(p) })
    await p.mouse.move(box.x + box.width + 100, box.y - 100)
    await p.keyboard.press('Tab'); await sleep(250)
    check(!(await state(p)).readoutOn, `${tag}: readout hides when focus leaves the chart`)
    if (reduced) {
      const anim = await p.evaluate((ch) => {
        const els = [document.querySelector(ch), ...document.querySelectorAll(`${ch} *`), document.querySelector('[data-testid="chart-readout"]')]
        return els.filter(Boolean).map((e) => getComputedStyle(e)).filter((cs) => cs.transitionDuration.split(',').some((d) => parseFloat(d) > 0.01) || (cs.animationName !== 'none' && parseFloat(cs.animationDuration) > 0.01)).length
      }, CH)
      console.log(`${tag}: elements in chart with transitions/animations > 10ms: ${anim}`)
      check(anim === 0, `${tag}: no transitions/animations in the chart under reduced motion (${anim})`)
    }
    check(errs.length === 0, `${tag}: no page/console errors ${errs.join(' | ')}`)
    await ctx.close()
  }
}

await withPreview(async (base) => {
  globalThis.BASE = base
  const browser = await chromium.launch()
  try {
    if (WHICH !== 'desktop') await phoneRun(browser)
    if (WHICH !== 'phone') await desktopRun(browser)
  } finally { await browser.close() }
})
console.log(fails.length ? `\n${fails.length} FAILED:\n- ${fails.join('\n- ')}` : '\nall ok')
process.exit(fails.length ? 1 : 0)
