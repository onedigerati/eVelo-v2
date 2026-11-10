// Screenshots of the desktop mosaic (DPR 1 and 2) and the phone cover (DPR 3), images fully loaded.
import { chromium } from '/home/jonah/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs'
const [BASE, OUT, TAG] = process.argv.slice(2)
const browser = await chromium.launch({ executablePath: '/home/jonah/.cache/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-linux-arm64/chrome-headless-shell' })
for (const p of [{ name: 'desktop-dpr1', vw: 1440, vh: 900, dpr: 1 }, { name: 'desktop-dpr2', vw: 1440, vh: 900, dpr: 2 }, { name: 'phone-dpr3', vw: 390, vh: 844, dpr: 3, mobile: true }]) {
  const ctx = await browser.newContext({ viewport: { width: p.vw, height: p.vh }, deviceScaleFactor: p.dpr, isMobile: !!p.mobile, hasTouch: !!p.mobile, colorScheme: 'dark' })
  const page = await ctx.newPage()
  const errs = []
  page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()) })
  await page.goto(BASE + '#atlas')
  await page.waitForSelector('.atlas__status.is-done', { timeout: 180000 })
  const b = page.locator('.pick__open:visible').first()
  await b.click()
  await page.waitForSelector('[role="dialog"]')
  const sel = p.mobile ? '.pgal__cover' : '.pgal__mosaic'
  await page.waitForFunction((s) => [...document.querySelectorAll(s + ' img')].slice(0, 5).every((i) => i.complete && i.naturalWidth > 0), sel, { timeout: 30000 }).catch(() => {})
  await page.waitForTimeout(800)
  const info = await page.evaluate((s) => [...document.querySelectorAll(s + ' img')].slice(0, 5).map((i) => `${i.currentSrc.split('/').pop()} ${i.naturalWidth}px->${i.clientWidth}css`), sel)
  console.log(`${TAG} ${p.name}: ${info.join(' | ')}${errs.length ? ' ERRORS ' + errs.join(';') : ''}`)
  await page.locator(sel).screenshot({ path: `${OUT}/${TAG}-${p.name}.png` })
  await ctx.close()
}
await browser.close()
