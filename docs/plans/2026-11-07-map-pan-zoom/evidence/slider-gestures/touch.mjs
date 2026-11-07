import { createRequire } from 'module'
const require = createRequire('/home/jonah/.npm/_npx/e41f203b7505f1fb/node_modules/')
const { chromium } = require('playwright')
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
const page = await ctx.newPage()
const errors = []
page.on('pageerror', (e) => errors.push(String(e)))
await page.goto('http://localhost:4317/#plan', { waitUntil: 'networkidle' })
const cdp = await ctx.newCDPSession(page)
const n = await page.locator('.slider__input').count()
console.log('sliders on first view:', n)
const state = async (i) => page.evaluate((i) => ({ v: document.querySelectorAll('.slider__input')[i].value, y: Math.round(scrollY) }), i)
const box = async (i) => {
  const el = page.locator('.slider__input').nth(i)
  await el.evaluate((e) => e.scrollIntoView({ block: 'center' }))
  await page.waitForTimeout(300)
  return el.boundingBox()
}
const touch = async (pts, gap = 16) => {
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: pts[0][0], y: pts[0][1] }] })
  for (const [x, y] of pts.slice(1)) {
    await page.waitForTimeout(gap)
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y }] })
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await page.waitForTimeout(400)
}
const line = (x0, y0, dx, dy, steps = 12) => Array.from({ length: steps + 1 }, (_, k) => [x0 + (dx * k) / steps, y0 + (dy * k) / steps])
const out = []
const check = (name, ok, detail) => { out.push(`${ok ? 'PASS' : 'FAIL'} ${name} — ${detail}`) }

const targets = await page.evaluate(() => { const all = [...document.querySelectorAll('.slider__input')]; const h = all.findIndex(e => e.closest('.slider--compact')); const s = all.findIndex(e => !e.closest('.slider--compact')); return [[h, 'holding weight ' + all[h].getAttribute('aria-label')], [s, 'Slider ' + document.querySelector('label[for="' + all[s].id + '"]')?.textContent]] })
for (const [i, label] of targets) {
// 1. vertical swipes starting on the track (far from the thumb) and on the thumb
for (const where of ['track-left', 'track-right', 'thumb']) {
  const b = await box(i)
  const s0 = await state(i)
  const pct = await page.evaluate((i) => { const e = document.querySelectorAll('.slider__input')[i]; return (e.value - e.min) / (e.max - e.min) }, i)
  const x = where === 'thumb' ? b.x + 11 + pct * (b.width - 22) : where === 'track-left' ? b.x + 20 : b.x + b.width - 20
  const y = b.y + b.height / 2
  await touch(line(x, y, 3, -160))
  const s1 = await state(i)
  check(`[${label}] vertical swipe up from ${where}`, s1.v === s0.v && s1.y > s0.y, `value ${s0.v}→${s1.v}, scrollY ${s0.y}→${s1.y}`)
}
// 2. horizontal drag moves it and does not scroll
{
  const b = await box(i)
  const s0 = await state(i)
  await touch(line(b.x + 20, b.y + b.height / 2, b.width - 40, 6))
  const s1 = await state(i)
  check('horizontal drag', s1.v !== s0.v && s1.y === s0.y, `value ${s0.v}→${s1.v}, scrollY ${s0.y}→${s1.y}`)
}
// 3. tap on the track sets the value on lift
{
  const b = await box(i)
  const y = b.y + b.height / 2
  await touch([[b.x + 15, y]])
  const s0 = await state(i)
  const x = b.x + b.width / 2
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] })
  await page.waitForTimeout(80)
  const mid = await state(i)
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await page.waitForTimeout(300)
  const s1 = await state(i)
  check('tap on track', mid.v === s0.v && s1.v !== s0.v, `before ${s0.v}, while held ${mid.v}, after lift ${s1.v}`)
}
}
await page.screenshot({ path: process.argv[2] + '/phone-after-touch.png' })
console.log(out.join('\n'))
console.log('page errors:', errors.length ? errors : 'none')

// 4. desktop mouse + keyboard
const d = await browser.newContext({ viewport: { width: 1280, height: 900 } })
const dp = await d.newPage()
await dp.goto('http://localhost:4317/', { waitUntil: 'networkidle' })
for (const sel of ['.slider--compact .slider__input', '.slider:not(.slider--compact) .slider__input']) {
const inp = dp.locator(sel).first()
await inp.scrollIntoViewIfNeeded()
const db = await inp.boundingBox()
const dv = () => inp.evaluate((e) => e.value)
const v0 = await dv()
await dp.mouse.click(db.x + db.width * 0.8, db.y + db.height / 2)
const v1 = await dv()
await dp.mouse.move(db.x + db.width * 0.8, db.y + db.height / 2)
await dp.mouse.down()
await dp.mouse.move(db.x + db.width * 0.25, db.y + db.height / 2, { steps: 8 })
await dp.mouse.up()
const v2 = await dv()
const focused = await inp.evaluate((e) => document.activeElement === e)
await dp.keyboard.press('ArrowRight')
const v3 = await dv()
console.log(`[${sel}] ${v1 !== v0 && v2 !== v1 && v3 !== v2 && focused ? 'PASS' : 'FAIL'} desktop mouse click ${v0}→${v1}, drag →${v2}, focused ${focused}, ArrowRight →${v3}`)
}
await browser.close()
