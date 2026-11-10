import { chromium } from '/home/jonah/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs'
const browser = await chromium.launch({ executablePath: '/home/jonah/.cache/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-linux-arm64/chrome-headless-shell' })
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()
await page.goto('http://localhost:4317/#atlas')
await page.waitForSelector('.pick__open'); await page.waitForTimeout(4000)
async function traced(label, fn) {
  await browser.startTracing(page, { categories: ['devtools.timeline', 'disabled-by-default-devtools.timeline', 'blink', 'cc', 'gpu'] })
  await fn(); await page.waitForTimeout(1200)
  const buf = await browser.stopTracing()
  const ev = JSON.parse(buf.toString()).traceEvents
  const agg = {}
  for (const e of ev) if (e.ph === 'X' && e.dur && ['Layout','UpdateLayoutTree','Paint','PrePaint','Layerize','Commit','ImageDecodeTask','Decode Image','RasterTask','EventDispatch','FunctionCall','HitTest','ScrollLayer','UpdateLayer','CompositeLayers','ParseHTML','IntersectionObserverController::computeIntersections','v8.compile','EvaluateScript','v8.run','RunTask'].includes(e.name)) { const k = e.name; agg[k] ??= { n: 0, ms: 0, max: 0 }; agg[k].n++; agg[k].ms += e.dur / 1000; agg[k].max = Math.max(agg[k].max, e.dur / 1000) }
  console.log(`\n${label}`)
  for (const [k, v] of Object.entries(agg).sort((a, b) => b[1].ms - a[1].ms)) console.log(`  ${k.padEnd(28)} n=${String(v.n).padStart(4)} total ${v.ms.toFixed(0).padStart(5)}ms max ${v.max.toFixed(0)}ms`)
}
await traced('OPEN', () => page.locator('.pick__open').first().click())
await traced('CLOSE', () => page.keyboard.press('Escape'))
await browser.close()
