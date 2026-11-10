// Stage 2 verifier's touch run against the production build (vite preview on :5241).
// Usage: node verify-swipe.mjs <outdir>   (needs Playwright; Chromium from ~/.cache/ms-playwright)
import { createRequire } from 'module'
import { readdirSync } from 'fs'
const require = createRequire(process.env.PW_DIR || '/home/jonah/.npm/_npx/e41f203b7505f1fb/node_modules/')
const { chromium } = require('playwright')
const OUT = process.argv[2] || '.'
const BASE = 'http://localhost:5241'
const chromeDir = process.env.HOME + '/.cache/ms-playwright/chromium-1248'
const exe = chromeDir + '/' + readdirSync(chromeDir).find((d) => d.startsWith('chrome-linux')) + '/chrome'
const browser = await chromium.launch({ executablePath: exe })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const results = []
const check = (name, ok, info = '') => {
  results.push(ok)
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${info ? '  -- ' + info : ''}`)
}
const errors = []

// ---------- phone ----------
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 })
const page = await ctx.newPage()
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message))
page.on('console', (m) => m.type() === 'error' && errors.push('console: ' + m.text()))
const cdp = await ctx.newCDPSession(page)
const touch = (type, x, y, timestamp) =>
  cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y, id: 7 }], ...(timestamp ? { timestamp } : {}) })

/** Drag from (x,y) along (dx,dy) in n moves with real waits; `each(i)` runs after each move. */
async function drag(x, y, dx, dy, n, wait, each, { lift = true, pause = 0 } = {}) {
  await touch('touchStart', x, y)
  for (let i = 1; i <= n; i++) {
    await touch('touchMove', x + (dx * i) / n, y + (dy * i) / n)
    await sleep(wait)
    if (each) await each(i)
  }
  if (pause) await sleep(pause)
  if (lift) await touch('touchEnd', x + dx, y + dy)
}
/** Drag with synthetic timestamps (seconds) so speed is exact, independent of CDP latency. */
async function timedDrag(x, y, dy, n, msPerMove, endGapMs = msPerMove) {
  const t0 = Date.now() / 1000 + 0.5
  await touch('touchStart', x, y, t0)
  for (let i = 1; i <= n; i++) await touch('touchMove', x, y + (dy * i) / n, t0 + (i * msPerMove) / 1000)
  await touch('touchEnd', x, y + dy, t0 + (n * msPerMove + endGapMs) / 1000)
}
const sheetSel = '.sheet--bottom'
const sheetY = () =>
  page.evaluate((s) => {
    const el = document.querySelector(s)
    return el ? Math.round(new DOMMatrix(getComputedStyle(el).transform).m42 * 10) / 10 : null
  }, sheetSel)
const isOpen = () => page.evaluate((s) => !!document.querySelector(s), sheetSel)
const bodyTop = () => page.evaluate(() => document.querySelector('.sheet--bottom .sheet__body')?.scrollTop ?? null)
const setBodyTop = (v) => page.evaluate((v) => (document.querySelector('.sheet--bottom .sheet__body').scrollTop = v), v)
// Everything behind the sheet that could scroll: window plus any scrolled element outside the sheet.
const behind = () =>
  page.evaluate(() => {
    const out = { win: Math.round(window.scrollY) }
    for (const el of document.querySelectorAll('*')) {
      if (el.closest('.sheet-root')) continue
      if (el.scrollHeight > el.clientHeight + 4 && getComputedStyle(el).overflowY.match(/auto|scroll/)) out[(el.className || el.tagName).toString().slice(0, 30)] = Math.round(el.scrollTop)
    }
    return JSON.stringify(out)
  })
async function openProfile() {
  if (await isOpen()) return
  const btn = page.locator('.pick__open').first()
  await btn.scrollIntoViewIfNeeded()
  await btn.tap()
  await page.waitForSelector(sheetSel)
  await sleep(900)
}
const pt = async () => {
  const r = await page.locator('.sheet--bottom .sheet__body').boundingBox()
  return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + 260) }
}

await page.goto(BASE + '/#atlas')
await page.waitForSelector('.pick__open', { timeout: 30000 })
await sleep(1000)
await openProfile()
const behind0 = await behind()
let p = await pt()
console.log('sheet open; touch point', JSON.stringify(p), 'body scrollTop', await bodyTop(), 'y', await sheetY())

// 1 slow short swipe at top: follows finger, springs back
await setBodyTop(0)
let mid
await drag(p.x, p.y, 0, 80, 16, 30, async (i) => {
  if (i === 16) {
    mid = await sheetY()
    await page.screenshot({ path: OUT + '/phone-mid-drag.png' })
  }
})
await sleep(800)
check('slow 80px swipe at top drags with finger', mid >= 70 && mid <= 90, `mid-drag y=${mid}`)
check('...and springs back on release', (await isOpen()) && Math.abs(await sheetY()) < 1, `after y=${await sheetY()}`)

// 2 drag then pause springs back (100px < 110 so pause case uses 100; then a 140px-with-pause should still close by distance)
await drag(p.x, p.y, 0, 100, 10, 16, null, { pause: 300 })
await sleep(800)
check('100px drag then 300ms pause springs back', (await isOpen()) && Math.abs(await sheetY()) < 1, `y=${await sheetY()}`)

// 3 swipe up at top scrolls content, sheet stays
await setBodyTop(0)
const ysUp = []
await drag(p.x, p.y, 0, -200, 16, 20, async () => ysUp.push(await sheetY()))
await sleep(900)
const upTop = await bodyTop()
check('upward swipe scrolls content, sheet stays', upTop > 50 && ysUp.every((v) => v === 0) && (await isOpen()), `scrollTop 0->${upTop}, sheet y max ${Math.max(...ysUp)}`)

// 4 content scrolled down: swipe down scrolls content, sheet stays
await setBodyTop(500)
await sleep(150)
const ysDown = []
await drag(p.x, p.y, 0, 160, 16, 20, async () => ysDown.push(await sheetY()))
await sleep(900)
const dTop = await bodyTop()
check('scrolled down: downward swipe scrolls content, sheet never moves', dTop < 500 && ysDown.every((v) => v === 0) && (await isOpen()), `scrollTop 500->${dTop}, sheet y max ${Math.max(...ysDown)}`)

// 5 reaching top mid-gesture: sheet does not move
await setBodyTop(50)
await sleep(150)
const ysReach = []
await drag(p.x, p.y, 0, 300, 30, 20, async () => ysReach.push(await sheetY()))
await sleep(900)
check('scroll reaching top mid-gesture never moves the sheet', ysReach.every((v) => v === 0) && (await isOpen()) && (await bodyTop()) === 0, `scrollTop ->${await bodyTop()}, sheet y max ${Math.max(...ysReach)}`)

// 6 sideways swipe on the photo carousel + dot tap
await setBodyTop(0)
await sleep(200)
const track = page.locator('.sheet--bottom .pgal__track')
if ((await track.count()) && (await track.isVisible())) {
  const r = await track.boundingBox()
  const sl0 = await track.evaluate((t) => t.scrollLeft)
  const ysSide = []
  const x0 = r.x + r.width * 0.85
  const y0 = r.y + r.height / 2
  await drag(x0, y0, -240, 20, 12, 16, async () => ysSide.push(await sheetY()))
  await sleep(1000)
  const sl1 = await track.evaluate((t) => t.scrollLeft)
  check('sideways swipe on carousel changes photo, sheet stays', sl1 > sl0 && ysSide.every((v) => v === 0) && (await isOpen()), `scrollLeft ${sl0}->${sl1}`)
  await page.screenshot({ path: OUT + '/phone-carousel-swiped.png' })
  const dots = page.locator('.sheet--bottom .pgal__dots button')
  const nd = await dots.count()
  if (nd > 1) {
    await dots.nth(nd - 1).tap()
    await sleep(900)
    const sl2 = await track.evaluate((t) => t.scrollLeft)
    await dots.nth(0).tap()
    await sleep(900)
    const sl3 = await track.evaluate((t) => t.scrollLeft)
    check('tapping carousel dots navigates', sl2 > sl1 - 1 && sl3 < sl2 && (await isOpen()), `last dot ->${sl2}, first dot ->${sl3}`)
  } else check('carousel dots present', false, `dots=${nd}`)
} else check('photo carousel visible in profile', false)

// 7 tap on a button in the content works (not swallowed): find a non-close button in the body
{
  const btns = page.locator('.sheet--bottom .sheet__body button:visible')
  const n = await btns.count()
  let tapped = 'none'
  for (let i = 0; i < n; i++) {
    const b = btns.nth(i)
    const txt = ((await b.getAttribute('aria-label')) || (await b.innerText())).trim()
    if (/compare|choose|destination|make/i.test(txt) || i === n - 1) {
      await b.evaluate((el) => el.addEventListener('click', () => (window.__clicked = true), { once: true }))
      await b.scrollIntoViewIfNeeded()
      await page.evaluate(() => (window.__clicked = false))
      await b.tap({ trial: false, noWaitAfter: true }).catch(() => {})
      tapped = txt.slice(0, 40)
      break
    }
  }
  const clicked = await page.evaluate(() => window.__clicked)
  check('tap on a content button fires its click', clicked === true, `button "${tapped}"`)
  await sleep(900)
}
await page.goto(BASE + '/#atlas')
await page.waitForSelector('.pick__open', { timeout: 30000 })
await sleep(800)
await openProfile()
p = await pt()

// 8 long swipe closes
await setBodyTop(0)
await drag(p.x, p.y, 0, 220, 20, 25)
await sleep(800)
check('long 220px swipe at top closes', !(await isOpen()))
await page.screenshot({ path: OUT + '/phone-closed-after-swipe.png' })
check('page behind did not scroll during sheet gestures', (await behind()) === behind0, `before ${behind0} after ${await behind()}`)

// 9 reopen shows at rest
await openProfile()
check('reopen after swipe-close: sheet at rest', Math.abs(await sheetY()) < 1 && (await bodyTop()) === 0, `y=${await sheetY()} scrollTop=${await bodyTop()}`)
await page.screenshot({ path: OUT + '/phone-reopened.png' })

// 10 fast short flick (60px over 40ms ~1500px/s) closes; slow 60px (60px over 600ms ~100px/s) springs back
p = await pt()
await timedDrag(p.x, p.y, 60, 15, 40, 16) // slow: 15 moves * 40ms = 600ms
await sleep(800)
check('slow 60px drag (~100px/s) springs back', (await isOpen()) && Math.abs(await sheetY()) < 1, `y=${await sheetY()}`)
await timedDrag(p.x, p.y, 60, 5, 8, 8) // fast: 60px in 40ms
await sleep(800)
check('fast 60px flick (~1500px/s) closes', !(await isOpen()))

// 11 handle drag, ×, Escape, backdrop
await openProfile()
{
  const g = await page.locator('.sheet__grabber').boundingBox()
  await drag(g.x + g.width / 2, g.y + g.height / 2, 0, 220, 20, 20)
  await sleep(800)
  check('handle drag closes', !(await isOpen()))
}
await openProfile()
await page.locator('.sheet--bottom .sheet__close').tap()
await sleep(800)
check('× closes', !(await isOpen()))
await openProfile()
await page.keyboard.press('Escape')
await sleep(800)
check('Escape closes', !(await isOpen()))
await openProfile()
await page.touchscreen.tap(195, 12)
await sleep(800)
check('backdrop tap closes', !(await isOpen()))

// 12 the other bottom sheet: Compare (tick a city in the list, open Compare, swipe down)
{
  const cmp = page.locator('.crow__cmp').first()
  if (await cmp.count()) {
    await cmp.scrollIntoViewIfNeeded()
    await cmp.tap()
    await sleep(500)
    const btn = page.getByRole('button', { name: /^Compare \d/ })
    await btn.tap()
    await page.waitForSelector('.cmp-sheet', { timeout: 5000 })
    await sleep(900)
    const r = await page.locator('.cmp-sheet .sheet__body').boundingBox()
    let m
    await drag(r.x + r.width / 2, r.y + 60, 0, 220, 20, 25, async (i) => i === 10 && (m = await sheetY()))
    await sleep(800)
    check('Compare sheet: swipe down at top drags and closes', m > 50 && !(await page.evaluate(() => !!document.querySelector('.cmp-sheet'))), `mid y=${m}`)
  } else check('compare checkbox found', false)
}
await ctx.close()

// ---------- tablet left drawer (touch) ----------
{
  const tctx = await browser.newContext({ viewport: { width: 820, height: 1180 }, hasTouch: true, isMobile: true })
  const tp = await tctx.newPage()
  tp.on('pageerror', (e) => errors.push('tablet pageerror: ' + e.message))
  await tp.goto(BASE + '/#plan')
  const ok = await tp.waitForSelector('.sheet--left', { timeout: 15000 }).then(() => true, () => false)
  await sleep(900)
  if (ok) {
    const tc = await tctx.newCDPSession(tp)
    const t = (type, x, y) => tc.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y, id: 1 }] })
    const r = await tp.locator('.sheet--left').boundingBox()
    // vertical swipe down on drawer content: must not close or move it
    const x0 = r.x + r.width / 2
    const y0 = r.y + 200
    await t('touchStart', x0, y0)
    for (let i = 1; i <= 15; i++) (await t('touchMove', x0, y0 + i * 15), await sleep(16))
    await t('touchEnd', x0, y0 + 225)
    await sleep(800)
    const stillOpen = await tp.evaluate(() => !!document.querySelector('.sheet--left'))
    const tx = await tp.evaluate(() => new DOMMatrix(getComputedStyle(document.querySelector('.sheet--left')).transform))
    check('tablet left drawer: downward swipe does not close or move it', stillOpen && Math.abs(tx.m42) < 1 && Math.abs(tx.m41) < 1, `x=${tx.m41} y=${tx.m42}`)
    const x1 = r.x + r.width - 40
    await t('touchStart', x1, y0)
    for (let i = 1; i <= 20; i++) (await t('touchMove', x1 - i * 12, y0), await sleep(16))
    await t('touchEnd', x1 - 240, y0)
    await sleep(800)
    // Informational: a CDP touch drag-left on the drawer panel does not close it at HEAD *or* at the
    // pre-stage commit (see drawer-baseline.txt) -- pre-existing, so it is logged, not counted.
    console.log('INFO  tablet left drawer: touch drag-left closes =', !(await tp.evaluate(() => !!document.querySelector('.sheet--left'))), '(same as pre-stage build; see drawer-baseline.txt)')
  } else check('tablet left drawer opens on #plan', false)
  await tctx.close()
}

// ---------- desktop (mouse) ----------
{
  const dctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const dp = await dctx.newPage()
  dp.on('pageerror', (e) => errors.push('desktop pageerror: ' + e.message))
  await dp.goto(BASE + '/#atlas')
  await dp.waitForSelector('.pick__open', { timeout: 30000 })
  await sleep(800)
  await dp.locator('.pick__open').first().click()
  await dp.waitForSelector('.sheet--bottom')
  await sleep(900)
  const r = await dp.locator('.sheet--bottom .sheet__body').boundingBox()
  const dy = () => dp.evaluate(() => new DOMMatrix(getComputedStyle(document.querySelector('.sheet--bottom')).transform).m42)
  await dp.mouse.move(r.x + r.width / 2, r.y + 150)
  await dp.mouse.down()
  const ys = []
  for (let i = 1; i <= 15; i++) (await dp.mouse.move(r.x + r.width / 2, r.y + 150 + i * 20), ys.push(await dy()))
  await dp.mouse.up()
  await sleep(800)
  const open = await dp.evaluate(() => !!document.querySelector('.sheet--bottom'))
  check('desktop: mouse drag on profile content does not move or close the sheet', open && ys.every((v) => Math.abs(v) < 1), `y max ${Math.max(...ys)}`)
  await dp.screenshot({ path: OUT + '/desktop-profile-after-mouse-drag.png' })
  // handle still drags with the mouse
  const g = await dp.locator('.sheet__grabber').boundingBox()
  await dp.mouse.move(g.x + g.width / 2, g.y + g.height / 2)
  await dp.mouse.down()
  for (let i = 1; i <= 15; i++) (await dp.mouse.move(g.x + g.width / 2, g.y + g.height / 2 + i * 16), await sleep(16))
  await dp.mouse.up()
  await sleep(800)
  check('desktop: mouse drag on the handle still closes', !(await dp.evaluate(() => !!document.querySelector('.sheet--bottom'))))
  // styleguide drawer: mouse drag on panel still closes
  await dp.goto(BASE + '/#styleguide')
  const drawerBtn = dp.getByRole('button', { name: 'Drawer', exact: true }).first()
  if (await drawerBtn.waitFor({ timeout: 15000 }).then(() => true, () => false)) {
    await drawerBtn.click()
    await dp.waitForSelector('.sheet--left')
    await sleep(900)
    const lr = await dp.locator('.sheet--left').boundingBox()
    await dp.mouse.move(lr.x + lr.width - 60, lr.y + 300)
    await dp.mouse.down()
    for (let i = 1; i <= 15; i++) (await dp.mouse.move(lr.x + lr.width - 60 - i * 20, lr.y + 300), await sleep(16))
    await dp.mouse.up()
    await sleep(800)
    check('desktop styleguide drawer: mouse drag left still closes', !(await dp.evaluate(() => !!document.querySelector('.sheet--left'))))
    await dp.getByRole('button', { name: 'Bottom sheet', exact: true }).first().click()
    await dp.waitForSelector('.sheet--bottom')
    await sleep(900)
    const br = await dp.locator('.sheet--bottom .sheet__body').boundingBox()
    await dp.mouse.move(br.x + 100, br.y + 20)
    await dp.mouse.down()
    const bys = []
    for (let i = 1; i <= 15; i++) (await dp.mouse.move(br.x + 100, br.y + 20 + i * 15), bys.push(await dy()))
    await dp.mouse.up()
    await sleep(800)
    check('desktop styleguide bottom sheet: mouse drag on body does not move it', bys.every((v) => Math.abs(v) < 1) && (await dp.evaluate(() => !!document.querySelector('.sheet--bottom'))), `y max ${Math.max(...bys)}`)
  } else console.log('SKIP styleguide drawer: route/button not found at', dp.url())
  await dctx.close()
}

check('no page errors or console errors', errors.length === 0, errors.join(' | '))
console.log(`${results.filter(Boolean).length}/${results.length} passed`)
console.log(results.every(Boolean) ? 'ALL PASS' : 'SOME FAILED')
await browser.close()
