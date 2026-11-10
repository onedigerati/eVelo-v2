import { chromium } from '/home/jonah/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.mjs'
const out = process.argv[2]
const b = await chromium.launch({ executablePath: '/home/jonah/.cache/ms-playwright/chromium-1248/chrome-linux-arm64/chrome' })
async function page(w) {
  const p = await b.newPage({ viewport: { width: w, height: 900 }, deviceScaleFactor: 2 })
  await p.goto('http://localhost:5231/#/atlas')
  await p.waitForSelector('.pick__country', { timeout: 30000 })
  await p.waitForTimeout(2500)
  return p
}
for (const w of [768, 1024]) {
  const p = await page(w)
  await (await p.$('.atlas__tiles')).screenshot({ path: `${out}/tiles-${w}-dark.png` })
  await p.close()
}
for (const w of [390, 360]) {
  const p = await page(w)
  await p.evaluate(() => {
    const t = document.querySelectorAll('.atile')
    t[1].querySelector('.atile__name').textContent = 'Las Terrenas'; t[1].querySelector('.atile__country').textContent = 'Dominican Republic'
    t[2].querySelector('.atile__name').textContent = 'Dubai'; t[2].querySelector('.atile__country').textContent = 'United Arab Emirates'
  })
  await (await p.$('.atlas__tiles')).screenshot({ path: `${out}/stub-tiles-phone${w}-dark.png` })
  await p.close()
}
await b.close()
