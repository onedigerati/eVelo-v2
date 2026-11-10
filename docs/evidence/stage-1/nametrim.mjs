import { chromium } from '/home/jonah/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.mjs'
import { readFileSync } from 'node:fs'
const [port, file] = process.argv.slice(2)
const cities = JSON.parse(readFileSync(file, 'utf8'))
const b = await chromium.launch({ executablePath: '/home/jonah/.cache/ms-playwright/chromium-1248/chrome-linux-arm64/chrome' })
for (const w of [1280, 1024, 768, 390, 360]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 } })
  await p.goto(`http://localhost:${port}/#/atlas`)
  await p.waitForSelector('.pick', { timeout: 30000 }); await p.waitForTimeout(2500)
  const r = await p.evaluate((cities) => {
    const t = [...document.querySelectorAll('.atile')]
    const slots = [['tile1', t[0].querySelector('.atile__name')], ['tile2', t[1].querySelector('.atile__name')], ['pick', document.querySelector('.pick__open')]]
    return slots.map(([s, n]) => { const trimmed = []; for (const [name] of cities) { n.textContent = name; if (n.scrollWidth > Math.ceil(n.getBoundingClientRect().width)) trimmed.push(name) } return `${s} nameTrim=${trimmed.length}` })
  }, cities)
  console.log(w, r.join(' | '))
  await p.close()
}
await b.close()
