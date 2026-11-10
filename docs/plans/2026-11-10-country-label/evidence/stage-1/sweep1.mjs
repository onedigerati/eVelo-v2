import { chromium } from '/home/jonah/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.mjs'
import { readFileSync } from 'node:fs'
const cities = JSON.parse(readFileSync(process.argv[2], 'utf8'))
const b = await chromium.launch({ executablePath: '/home/jonah/.cache/ms-playwright/chromium-1248/chrome-linux-arm64/chrome' })
for (const w of [1280, 1024, 768, 390, 360]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 } })
  await p.goto('http://localhost:5231/#/atlas')
  await p.waitForSelector('.pick__country', { timeout: 30000 })
  await p.waitForTimeout(2500)
  const res = await p.evaluate((cities) => {
    const tiles = [...document.querySelectorAll('.atile')]
    const pick = document.querySelector('.pick')
    const slots = [
      ['tile-full(best)', tiles[0], '.atile__name', '.atile__country', '.atile__title'],
      ['tile-2nd(home)', tiles[1], '.atile__name', '.atile__country', '.atile__title'],
      ['tile-3rd', tiles[2], '.atile__name', '.atile__country', '.atile__title'],
      ['pick', pick, '.pick__open', '.pick__country', '.pick__title'],
    ]
    const out = {}
    for (const [slot, root, ns, cs, ts] of slots) {
      if (!root || !root.querySelector(ts)) { out[slot] = null; continue }
      const n = root.querySelector(ns), c = root.querySelector(cs), t = root.querySelector(ts)
      const go = root.querySelector('.atile__go--head')
      const o = { nameTrim: [], countryHidden: [], countryStub: [], under: 0, onLine: 0, minGap: 1e9 }
      for (const [name, country] of cities) {
        n.textContent = name; c.textContent = country
        const tr = t.getBoundingClientRect(), nr = n.getBoundingClientRect(), cr = c.getBoundingClientRect()
        const rr = root.getBoundingClientRect()
        const vis = cr.width > 0 && cr.top >= tr.top - 0.5 && cr.bottom <= tr.bottom + 0.5 && cr.right <= rr.right + 0.5 && cr.bottom <= rr.bottom + 0.5
        if (n.scrollWidth > Math.ceil(nr.width)) o.nameTrim.push(name)
        if (!vis) o.countryHidden.push(`${name}/${country}`)
        else {
          if (c.scrollWidth > Math.ceil(cr.width)) o.countryStub.push(`${name}/${country}`)
          if (cr.top >= nr.bottom - 1) o.under++; else o.onLine++
        }
        if (go && getComputedStyle(go).display !== 'none') {
          const gr = go.getBoundingClientRect()
          o.minGap = Math.min(o.minGap, gr.left - Math.max(nr.right, vis ? cr.right : 0))
        }
      }
      out[slot] = o
    }
    return out
  }, cities)
  for (const [slot, o] of Object.entries(res)) {
    if (!o) { console.log(`${w} ${slot}: no city in this tile`); continue }
    console.log(`${w} ${slot}: onLine=${o.onLine} under=${o.under} hidden=${o.countryHidden.length} stub=${o.countryStub.length} nameTrim=${o.nameTrim.length} minGapToProfile=${o.minGap === 1e9 ? 'n/a' : o.minGap.toFixed(1)}`)
    if (o.countryStub.length) console.log('   stubs: ' + o.countryStub.join('; '))
    if (o.nameTrim.length) console.log('   name trimmed: ' + o.nameTrim.join('; '))
    if (o.countryHidden.length) console.log('   country hidden: ' + o.countryHidden.join('; '))
  }
  await p.close()
}
await b.close()
