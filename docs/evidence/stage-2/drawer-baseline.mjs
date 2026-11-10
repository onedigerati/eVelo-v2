import { createRequire } from 'module'
const require = createRequire('/home/jonah/.npm/_npx/e41f203b7505f1fb/node_modules/')
const { chromium } = require('playwright')
const PORT = process.argv[2]
const browser = await chromium.launch({ executablePath: process.env.HOME + '/.cache/ms-playwright/chromium-1248/chrome-linux-arm64/chrome' })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
for (const [label, fx, fy] of [['right-40,y+120', -40, 120], ['right-40,y+200', -40, 200], ['mid,y+400', 0.5, 400], ['right-60,y+600', -60, 600]]) {
  const tctx = await browser.newContext({ viewport: { width: 820, height: 1180 }, hasTouch: true, isMobile: true })
  const tp = await tctx.newPage()
  await tp.goto(`http://localhost:${PORT}/#plan`)
  await tp.waitForSelector('.sheet--left', { timeout: 15000 }); await sleep(900)
  const tc = await tctx.newCDPSession(tp)
  const t = (type, x, y) => tc.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y, id: 1 }] })
  const r = await tp.locator('.sheet--left').boundingBox()
  const x1 = fx < 1 && fx > 0 ? r.x + r.width * fx : r.x + r.width + fx, y0 = r.y + fy
  const el = await tp.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return (e.tagName + '.' + e.className).slice(0, 50) }, [x1, y0])
  let mid
  await t('touchStart', x1, y0)
  for (let i = 1; i <= 20; i++) { await t('touchMove', x1 - i * 12, y0); await sleep(16); if (i === 10) mid = await tp.evaluate(() => new DOMMatrix(getComputedStyle(document.querySelector('.sheet--left')).transform).m41) }
  await t('touchEnd', x1 - 240, y0); await sleep(800)
  console.log(label, el, 'mid x', mid, 'closed', !(await tp.evaluate(() => !!document.querySelector('.sheet--left'))))
  await tctx.close()
}
await browser.close()
