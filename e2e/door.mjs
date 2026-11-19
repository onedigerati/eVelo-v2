// End-to-end check of the landing arrow's hidden door, on the built app in headless Chromium.
// Runs against `dist/` (build first: `npm run build && node e2e/door.mjs`). Exits non-zero on any
// failure. Screenshots go to e2e/out/ (git-ignored).
import { mkdirSync } from 'node:fs'
import { chromium } from 'playwright'
import { withPreview } from '../scripts/serve-preview.mjs'

const OUT = new URL('./out/', import.meta.url).pathname
mkdirSync(OUT, { recursive: true })

const fails = []
const check = (ok, msg) => { console.log(`${ok ? 'ok  ' : 'FAIL'} ${msg}`); if (!ok) fails.push(msg) }
const cta = (p) => p.locator('a.landing__cta--primary')
const arrow = (p) => p.locator('.landing__cta-climb')
const coupon = (p) => p.locator('a.landing__coupon')

/** Clicks the arrow glyph `n` times, `gap` ms apart, as real pointer clicks. */
async function clickArrow(p, n, gap = 80) {
  const box = await arrow(p).boundingBox()
  for (let i = 0; i < n; i++) {
    await p.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
    if (i < n - 1) await p.waitForTimeout(gap)
  }
}

await withPreview(async (base) => {
  const browser = await chromium.launch()
  try {
    for (const [name, width, height] of [['desktop', 1280, 800], ['phone', 390, 844]]) {
      const ctx = await browser.newContext({ viewport: { width, height } })
      const p = await ctx.newPage()
      const errors = []
      p.on('pageerror', (e) => errors.push(e.message))
      const home = async () => {
        await p.goto(base + '#home')
        await p.waitForLoadState('networkidle')
        await arrow(p).waitFor()
      }

      // Before the coupon: nothing names the mode.
      await home()
      const text = (await p.locator('#root').innerText()).toLowerCase()
      const aria = await p.locator('[aria-label]').evaluateAll((els) => els.map((e) => e.getAttribute('aria-label')).join(' ').toLowerCase())
      check(!/income|admit one/.test(text + aria) && (await p.locator('a[href="#income"]').count()) === 0, `${name}: nothing names the mode before the coupon`)
      check((await cta(p).getAttribute('href')) === '#plan' && (await cta(p).innerText()).trim() === 'Find your eVelo', `${name}: CTA is a link to #plan named "Find your eVelo"`)

      // A click on the label goes straight to the plan.
      const lbox = await cta(p).boundingBox()
      await p.mouse.click(lbox.x + 30, lbox.y + lbox.height / 2)
      await p.waitForTimeout(60)
      check(new URL(p.url()).hash === '#plan', `${name}: label click goes to #plan at once (got ${new URL(p.url()).hash})`)

      // One click on the arrow waits about 300 ms, then goes to the plan.
      await home()
      await clickArrow(p, 1)
      const t0 = Date.now()
      await p.waitForTimeout(150)
      const early = new URL(p.url()).hash
      await p.waitForFunction(() => location.hash === '#plan', null, { timeout: 2000 }).catch(() => {})
      const waited = Date.now() - t0
      check(early === '#home' && new URL(p.url()).hash === '#plan' && waited >= 100 && waited < 900, `${name}: one arrow click goes to #plan after the wait (still ${early} at 150 ms, there by ~${waited} ms)`)

      // Two quick clicks (a double-click) still go to the plan after the wait.
      await home()
      await clickArrow(p, 2)
      await p.waitForTimeout(150)
      const early2 = new URL(p.url()).hash
      await p.waitForFunction(() => location.hash === '#plan', null, { timeout: 2000 }).catch(() => {})
      check(early2 === '#home' && new URL(p.url()).hash === '#plan' && (await coupon(p).count()) === 0, `${name}: a quick double-click on the arrow goes to #plan after the wait (still ${early2} at 150 ms)`)

      // Three quick clicks go nowhere.
      await home()
      await clickArrow(p, 3)
      await p.waitForTimeout(600)
      check(new URL(p.url()).hash === '#home' && (await coupon(p).count()) === 0, `${name}: three quick arrow clicks stay put, no coupon`)

      // Five quick clicks give the coupon.
      await clickArrow(p, 4, 70)
      await p.screenshot({ path: `${OUT}door-${name}-drooping.png` })
      await clickArrow(p, 1)
      await coupon(p).waitFor({ timeout: 2000 }).catch(() => {})
      await p.waitForTimeout(700)
      check((await coupon(p).count()) === 1 && (await arrow(p).count()) === 0, `${name}: five quick arrow clicks turn the arrow into a coupon`)
      check(new URL(p.url()).hash === '#home', `${name}: the fifth click doesn't navigate`)
      check((await coupon(p).getAttribute('href')) === '#income', `${name}: coupon links to #income`)
      check((await cta(p).getAttribute('href')) === '#plan' && (await cta(p).innerText()).trim() === 'Find your eVelo', `${name}: CTA still links to #plan`)
      await p.locator('.landing__ctas').screenshot({ path: `${OUT}door-${name}-coupon-ctas.png` })
      await p.screenshot({ path: `${OUT}door-${name}-coupon.png` })

      // The coupon stays on reload in the same tab.
      await p.reload()
      await p.waitForLoadState('networkidle')
      check((await coupon(p).count()) === 1, `${name}: coupon still there after reload`)

      // With the coupon showing, the label still goes to the plan.
      const lbox2 = await cta(p).boundingBox()
      await p.mouse.click(lbox2.x + 30, lbox2.y + lbox2.height / 2)
      await p.waitForTimeout(60)
      check(new URL(p.url()).hash === '#plan', `${name}: label click with the coupon goes to #plan`)

      check(errors.length === 0, `${name}: no uncaught page errors${errors.length ? ': ' + errors.join(' | ') : ''}`)
      await ctx.close()
    }

    // Touch: five quick taps on the arrow at phone width give the coupon (no double-tap zoom).
    {
      const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })
      const p = await ctx.newPage()
      const errors = []
      p.on('pageerror', (e) => errors.push(e.message))
      await p.goto(base + '#home')
      await p.waitForLoadState('networkidle')
      await arrow(p).waitFor()
      const ta = await p.evaluate(() => getComputedStyle(document.querySelector('a.landing__cta--primary')).touchAction)
      check(ta === 'manipulation', `touch: CTA has touch-action: manipulation (got ${ta})`)
      const box = await arrow(p).boundingBox()
      for (let i = 0; i < 5; i++) {
        await p.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2)
        if (i < 4) await p.waitForTimeout(80)
      }
      await coupon(p).waitFor({ timeout: 2000 }).catch(() => {})
      await p.waitForTimeout(500)
      check((await coupon(p).count()) === 1 && new URL(p.url()).hash === '#home', 'touch: five quick taps on the arrow show the coupon and stay on #home')
      await p.screenshot({ path: `${OUT}door-touch-coupon.png` })
      check(errors.length === 0, `touch: no uncaught page errors${errors.length ? ': ' + errors.join(' | ') : ''}`)
      await ctx.close()
    }

    // Keyboard: Enter on the CTA goes to the plan at once.
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
    const p = await ctx.newPage()
    await p.goto(base + '#home')
    await p.waitForLoadState('networkidle')
    await cta(p).focus()
    await p.keyboard.press('Enter')
    await p.waitForTimeout(60)
    check(new URL(p.url()).hash === '#plan', 'keyboard: Enter on the CTA goes to #plan at once')
    // A fresh tab has no coupon.
    await p.goto(base + '#home')
    await p.waitForLoadState('networkidle')
    check((await coupon(p).count()) === 0, 'a fresh tab without the flag shows the arrow, not the coupon')
    await ctx.close()
  } finally {
    await browser.close()
  }
})

if (fails.length) { console.error(`\n${fails.length} door check(s) failed`); process.exit(1) }
console.log('\ne2e door passed')
