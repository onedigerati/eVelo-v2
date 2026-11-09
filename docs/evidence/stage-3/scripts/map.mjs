import { chromium } from 'playwright'
const EV = '/home/jonah/repos/eVelo-v2/docs/evidence/stage-3'
for (const [w, h] of [[1280, 900], [390, 844]]) {
  const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: w, height: h } })).newPage()
  const errs = []; p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()) }); p.on('pageerror', (e) => errs.push(e.message))
  await p.goto('http://localhost:4350/#atlas'); await p.waitForTimeout(5000)
  const sel = await p.evaluate(() => { const s = document.querySelector('.wmap__svg'); if (!s) return null; s.setAttribute('data-verify-map', '1'); const r = s.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height), dots: s.querySelectorAll('circle').length, labels: s.querySelectorAll('text').length, canvas: !!s.parentElement.querySelector('canvas') } })
  const map = p.locator('[data-verify-map]'); await map.scrollIntoViewIfNeeded(); await p.waitForTimeout(800)
  await p.screenshot({ path: `${EV}/atlas-map-${w}.png` })
  const list = p.locator('.crow').first(); await list.scrollIntoViewIfNeeded(); await p.waitForTimeout(500)
  await p.screenshot({ path: `${EV}/atlas-list-${w}.png` })
  console.log(w, JSON.stringify(sel), 'errors', JSON.stringify(errs))
  await b.close()
}
