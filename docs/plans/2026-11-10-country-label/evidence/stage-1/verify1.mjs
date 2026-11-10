import { chromium } from '/home/jonah/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.mjs'
const out = process.argv[2]
const URL = 'http://localhost:5231/#/atlas'
const b = await chromium.launch({ executablePath: '/home/jonah/.cache/ms-playwright/chromium-1248/chrome-linux-arm64/chrome' })
const errors = []
const measure = (sel) => [...document.querySelectorAll(sel)].map((t) => {
  const tr = t.getBoundingClientRect()
  const n = t.children[0], c = t.children[1]
  const nr = n.getBoundingClientRect(), cr = c.getBoundingClientRect()
  const cs = getComputedStyle(c), ns = getComputedStyle(n)
  const visible = cr.width > 0 && cr.top >= tr.top - 0.5 && cr.bottom <= tr.bottom + 0.5
  const line = cr.top >= nr.bottom - 1 ? 'UNDER-name' : 'ON-name-line'
  const go = t.parentElement.querySelector('.atile__go--head')
  const gr = go && getComputedStyle(go).display !== 'none' ? go.getBoundingClientRect() : null
  const gap = gr ? (gr.left - Math.max(nr.right, visible ? cr.right : 0)).toFixed(1) : 'n/a'
  return `${n.textContent} [${ns.fontSize} ${ns.fontWeight} ${ns.color}] | "${c.textContent}" [${cs.fontSize} ${cs.fontWeight} ${cs.color}] ${visible ? 'VISIBLE ' + line : 'hidden'} nameTrim=${n.scrollWidth > Math.ceil(nr.width)} countryTrim=${visible && c.scrollWidth > Math.ceil(cr.width)} gapToProfile=${gap}`
})
async function open(w, h, theme) {
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2, colorScheme: theme })
  p.on('console', (m) => m.type() === 'error' && errors.push(`${w} ${theme}: ${m.text()}`))
  p.on('pageerror', (e) => errors.push(`${w} ${theme}: ${e.message}`))
  await p.goto(URL)
  await p.waitForSelector('.atile__country', { timeout: 30000 })
  await p.waitForSelector('.pick__country', { timeout: 30000 })
  await p.waitForTimeout(3000)
  await p.evaluate((t) => { document.documentElement.dataset.theme = t }, theme)
  await p.waitForTimeout(500)
  return p
}
for (const [vp, w, h] of [['desktop', 1280, 1000], ['tablet', 768, 1000], ['phone', 390, 900]]) {
  for (const theme of ['dark', 'light']) {
    const p = await open(w, h, theme)
    const tiles = await p.$('.atlas__tiles'); await tiles.scrollIntoViewIfNeeded()
    console.log(`== ${vp} ${theme} tiles\n` + (await p.evaluate(measure, '.atile__title')).join('\n'))
    await tiles.screenshot({ path: `${out}/tiles-${vp}-${theme}.png` })
    const picks = await p.$('.picks'); await picks.scrollIntoViewIfNeeded(); await p.waitForTimeout(600)
    console.log(`== ${vp} ${theme} picks\n` + (await p.evaluate(measure, '.pick__title')).join('\n'))
    await picks.screenshot({ path: `${out}/picks-${vp}-${theme}.png` })
    await p.close()
  }
}
// Click on country text opens the profile.
for (const [w, h] of [[1280, 1000], [390, 900]]) {
  const p = await open(w, h, 'dark')
  for (const sel of ['.atile__country', '.pick__country']) {
    const count = (await p.$$(sel)).length
    for (let i = 0; i < Math.min(count, sel === '.pick__country' ? 2 : 3); i++) {
      const el = (await p.$$(sel))[i]
      await el.scrollIntoViewIfNeeded()
      const r = await el.boundingBox()
      if (!r || r.width === 0) { console.log(`${w} ${sel}[${i}] not visible`); continue }
      const txt = await el.textContent()
      const hit = await p.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e?.className + '' }, [r.x + r.width / 2, r.y + r.height / 2])
      await p.mouse.click(r.x + r.width / 2, r.y + r.height / 2)
      const dlg = await p.waitForSelector('[role="dialog"]', { timeout: 5000 }).catch(() => null)
      const name = dlg ? (await dlg.getAttribute('aria-label')) || (await dlg.$eval('h1,h2', (e) => e.textContent).catch(() => '?')) : 'NO DIALOG'
      console.log(`${w} click ${sel}[${i}] "${txt}" hit=${hit} -> ${name}`)
      if (w === 1280 && i === 0 && sel === '.atile__country') await p.screenshot({ path: `${out}/click-country-profile-desktop.png` })
      await p.keyboard.press('Escape'); await p.waitForTimeout(700)
    }
  }
  await p.close()
}
console.log('console errors:', errors.length ? errors.join('\n') : 'none')
await b.close()
