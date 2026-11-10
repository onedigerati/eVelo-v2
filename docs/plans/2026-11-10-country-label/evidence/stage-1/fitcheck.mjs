import { chromium } from '/home/jonah/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.mjs'
import { readFileSync } from 'node:fs'
// For every city in every slot: if the country wrapped under the name, would it really not fit beside it?
// If it sits beside, is it on the name's baseline? Chip and Profile go centred on the name line?
const cities = JSON.parse(readFileSync(process.argv[2], 'utf8'))
const b = await chromium.launch({ executablePath: '/home/jonah/.cache/ms-playwright/chromium-1248/chrome-linux-arm64/chrome' })
for (const w of [1280, 1024, 768, 390, 360]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 } })
  await p.goto('http://localhost:5231/#/atlas')
  await p.waitForSelector('.pick__country', { timeout: 30000 }); await p.waitForTimeout(2500)
  const res = await p.evaluate((cities) => {
    const tiles = [...document.querySelectorAll('.atile')]
    const slots = [['tile1', tiles[0], '.atile__name', '.atile__country', '.atile__title'], ['tile2', tiles[1], '.atile__name', '.atile__country', '.atile__title'], ['pick', document.querySelector('.pick'), '.pick__open', '.pick__country', '.pick__title']]
    const out = []
    for (const [slot, root, ns, cs, ts] of slots) {
      const n = root.querySelector(ns), c = root.querySelector(cs), t = root.querySelector(ts)
      const chip = root.querySelector('.code-chip'), go = root.querySelector('.atile__go--head')
      const o = { wrongWrap: [], wrongInline: [], maxChipOff: 0, maxGoOff: 0, maxBaseOff: 0 }
            for (const [name, country] of cities) {
        n.textContent = name; c.textContent = country
        const tr = t.getBoundingClientRect(), nr = n.getBoundingClientRect(), cr = c.getBoundingClientRect()
        // the country's natural one-line width, in its own font
        const probe = c.cloneNode(true); probe.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap;max-width:none;width:max-content'; t.appendChild(probe)
        const natural = probe.getBoundingClientRect().width; probe.remove()
        const under = cr.top >= nr.bottom - 1
        // the widest the title can be: the row's right edge minus everything after the title (8px gaps)
        const row = t.parentElement.getBoundingClientRect()
        let after = 0; for (let e = t.nextElementSibling; e; e = e.nextElementSibling) if (getComputedStyle(e).display !== 'none' && getComputedStyle(e).position !== 'absolute') after += e.getBoundingClientRect().width + 8
        const room = row.right - after - tr.left - nr.width - 6
        if (under && natural <= room - 0.5) o.wrongWrap.push(`${name}/${country} room=${room.toFixed(1)} need=${natural.toFixed(1)}`)
        if (!under && natural > room + 0.5) o.wrongInline.push(`${name}/${country} room=${room.toFixed(1)} need=${natural.toFixed(1)}`)
        if (!under) {
          // baseline: text bottoms differ by descent difference only; compare via a baseline marker
          const base = (el) => { const m = document.createElement('span'); m.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline'; el.appendChild(m); const y = m.getBoundingClientRect().top; m.remove(); return y }
          o.maxBaseOff = Math.max(o.maxBaseOff, Math.abs(base(n) - base(c)))
        }
        const mid = nr.top + nr.height / 2
        if (chip) { const r = chip.getBoundingClientRect(); o.maxChipOff = Math.max(o.maxChipOff, Math.abs(r.top + r.height / 2 - mid)) }
        if (go && getComputedStyle(go).display !== 'none') { const r = go.getBoundingClientRect(); o.maxGoOff = Math.max(o.maxGoOff, Math.abs(r.top + r.height / 2 - mid)) }
      }
      out.push(`${slot}: wrappedButWouldFit=${o.wrongWrap.length} besideButOverflows=${o.wrongInline.length} maxBaselineOffset=${o.maxBaseOff.toFixed(1)} maxChipOffFromNameLine=${o.maxChipOff.toFixed(1)} maxProfileGoOffFromNameLine=${go && getComputedStyle(go).display !== 'none' ? o.maxGoOff.toFixed(1) : 'n/a'}` + (o.wrongWrap.length ? '\n   wrapped: ' + o.wrongWrap.join('; ') : '') + (o.wrongInline.length ? '\n   beside: ' + o.wrongInline.join('; ') : ''))
    }
    return out
  }, cities)
  console.log(w + ' ' + res.join(`\n${w} `))
  await p.close()
}
await b.close()
