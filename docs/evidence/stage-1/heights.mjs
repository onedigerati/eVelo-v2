import { chromium } from '/home/jonah/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.mjs'
const port = process.argv[2]
const b = await chromium.launch({ executablePath: '/home/jonah/.cache/ms-playwright/chromium-1248/chrome-linux-arm64/chrome' })
for (const w of [1280, 1024, 768, 390, 360]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 } })
  await p.goto(`http://localhost:${port}/#/atlas`)
  await p.waitForSelector('.pick', { timeout: 30000 }); await p.waitForTimeout(2500)
  const r = await p.evaluate(() => ({
    tiles: [...document.querySelectorAll('.atile')].map((t) => Math.round(t.getBoundingClientRect().height)),
    pick: Math.round(document.querySelector('.pick').getBoundingClientRect().height),
    tileNameTrim: [...document.querySelectorAll('.atile__name')].map((n) => n.scrollWidth > Math.ceil(n.getBoundingClientRect().width)),
  }))
  console.log(w, JSON.stringify(r))
  await p.close()
}
await b.close()
