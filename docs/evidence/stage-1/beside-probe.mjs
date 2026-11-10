import { chromium } from '/home/jonah/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.mjs'
// The cases fitcheck flagged as "beside but overflows": is the country really on the name line, one line, whole, clear of "Profile →"?
const cases = { 1280: [['t', 'Las Terrenas', 'Dominican Republic'], ['p', 'Lake Atitlán (Panajachel)', 'Guatemala']], 1024: [['t', 'Dubai', 'United Arab Emirates'], ['t', 'Los Angeles', 'United States']], 768: [['t', 'Madrid', 'Spain'], ['t', 'Taipei', 'Taiwan']], 390: [['t2', 'Lisbon', 'Portugal'], ['p', 'Dubai', 'United Arab Emirates']], 360: [['p', 'Prague', 'Czech Republic'], ['t2', 'Taipei', 'Taiwan'], ['t', 'New York City', 'United States']] }
const b = await chromium.launch({ executablePath: '/home/jonah/.cache/ms-playwright/chromium-1248/chrome-linux-arm64/chrome' })
for (const [w, list] of Object.entries(cases)) {
  const p = await b.newPage({ viewport: { width: +w, height: 900 } })
  await p.goto('http://localhost:5231/#/atlas')
  await p.waitForSelector('.pick__country', { timeout: 30000 }); await p.waitForTimeout(2500)
  for (const [slot, name, country] of list) {
    const r = await p.evaluate(([slot, name, country]) => {
      const tiles = document.querySelectorAll('.atile')
      const root = slot === 'p' ? document.querySelector('.pick') : tiles[slot === 't2' ? 1 : 0]
      const n = root.querySelector(slot === 'p' ? '.pick__open' : '.atile__name'), c = root.querySelector(slot === 'p' ? '.pick__country' : '.atile__country')
      n.textContent = name; c.textContent = country
      const nr = n.getBoundingClientRect(), cr = c.getBoundingClientRect(), t = c.parentElement.getBoundingClientRect(), row = c.parentElement.parentElement.getBoundingClientRect()
      const lines = c.getClientRects().length && Math.round(cr.height / parseFloat(getComputedStyle(c).lineHeight))
      const go = root.querySelector('.atile__go--head'); const gr = go && getComputedStyle(go).display !== 'none' ? go.getBoundingClientRect() : null
      return `${slot} ${name} / ${country}: ${cr.top >= nr.bottom - 1 ? 'UNDER' : 'BESIDE'} lines=${lines} countryW=${cr.width.toFixed(1)} scrollW=${c.scrollWidth} nameRight=${nr.right.toFixed(1)} countryLeft=${cr.left.toFixed(1)} countryRight=${cr.right.toFixed(1)} titleRight=${t.right.toFixed(1)} rowRight=${row.right.toFixed(1)} goLeft=${gr ? gr.left.toFixed(1) : 'n/a'}`
    }, [slot, name, country])
    console.log(w, r)
  }
  await p.close()
}
await b.close()
