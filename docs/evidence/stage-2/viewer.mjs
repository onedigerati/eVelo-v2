// Full-size viewer: open a profile, open the lead photo, step through all 5, record naturalWidth vs the listed original.
import { chromium } from '/home/jonah/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs'
const BASE = process.argv[2]
const browser = await chromium.launch({ executablePath: '/home/jonah/.cache/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-linux-arm64/chrome-headless-shell' })
for (const p of [{ name: 'desktop', vw: 1440, vh: 900, dpr: 1 }, { name: 'phone', vw: 390, vh: 844, dpr: 3, mobile: true }]) {
  const ctx = await browser.newContext({ viewport: { width: p.vw, height: p.vh }, deviceScaleFactor: p.dpr, isMobile: !!p.mobile, hasTouch: !!p.mobile })
  const page = await ctx.newPage()
  await page.goto(BASE + '#atlas')
  await page.waitForSelector('.atlas__status.is-done', { timeout: 180000 })
  for (let k = 0; k < 2; k++) {
    const b = page.locator('.pick__open:visible').nth(k)
    await b.scrollIntoViewIfNeeded()
    await b.click()
    await page.waitForSelector('[role="dialog"]')
    await page.locator(p.mobile ? '.pgal__slide' : '.pgal__tile.is-lead').first().click()
    await page.waitForSelector('.pview')
    for (let i = 0; i < 5; i++) {
      await page.waitForFunction(() => { const im = document.querySelector('.pview__frame img:last-child'); return im && im.complete && im.naturalWidth > 0 }, null, { timeout: 30000 })
      await page.waitForTimeout(400)
      const r = await page.evaluate(() => {
        const im = [...document.querySelectorAll('.pview__frame img')].pop()
        return { src: im.currentSrc.split('/').pop(), srcset: im.getAttribute('srcset'), nw: im.naturalWidth, nh: im.naturalHeight, attrW: +im.getAttribute('width'), attrH: +im.getAttribute('height') }
      })
      const ok = r.nw === r.attrW && r.nh === r.attrH && !/-640/.test(r.src) && !r.srcset
      console.log(`${p.name} pick${k + 1} photo${i + 1}: ${r.src} natural ${r.nw}x${r.nh}, listed original ${r.attrW}x${r.attrH}, srcset ${r.srcset ?? 'none'} -> ${ok ? 'OK' : 'NOT ORIGINAL'}`)
      if (k === 0 && i === 0) await page.screenshot({ path: `${process.argv[3]}/viewer-${p.name}.png` })
      await page.locator('.pview__next').click()
    }
    await page.keyboard.press('Escape'); await page.waitForTimeout(400)
    await page.keyboard.press('Escape')
    await page.waitForSelector('[role="dialog"]', { state: 'detached', timeout: 10000 }).catch(() => {})
  }
  await ctx.close()
}
await browser.close()
