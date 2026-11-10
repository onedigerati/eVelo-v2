import { chromium } from '/home/jonah/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs'
const browser = await chromium.launch({ executablePath: '/home/jonah/.cache/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-linux-arm64/chrome-headless-shell' })
for (const hash of ['#atlas', '#atlas']) {
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()
await page.addInitScript(() => {
  window.__log = []
  const pm = Worker.prototype.postMessage
  Worker.prototype.postMessage = function (m, ...r) { window.__log.push(`${performance.now().toFixed(0)} post ${m?.kind}`); this.addEventListener('message', (e) => { if (e.data?.id === m?.id) window.__log.push(`${performance.now().toFixed(0)} recv ${e.data.kind} for ${m?.kind}`) }); return pm.call(this, m, ...r) }
  const W = window.Worker
  window.Worker = function (...a) { window.__log.push(`${performance.now().toFixed(0)} new Worker`); return new W(...a) }
  window.Worker.prototype = W.prototype
  const f = window.fetch; window.fetch = (...a) => { window.__log.push(`${performance.now().toFixed(0)} fetch ${a[0]}`); return f(...a) }
})
page.on('console', (m) => console.log('console:', m.text().slice(0, 200)))
await page.goto('http://localhost:4317/' + hash)
await page.waitForTimeout(9000)
console.log((await page.evaluate(() => window.__log)).join('\n'))
console.log('cores', await page.evaluate(() => navigator.hardwareConcurrency))
await ctx.close(); break
}
await browser.close()
