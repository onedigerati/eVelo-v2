// Usage (from repo root): NODE_PATH=/home/jonah/repos/eVelo/node_modules node docs/evidence/stage-3/scripts/sheet-shot.cjs
const { chromium } = require('playwright-core')
const path = require('path')
;(async () => {
  const E = path.resolve('docs/evidence/stage-3')
  const b = await chromium.launch()
  const p = await b.newPage({ viewport: { width: 1400, height: 1000 } })
  await p.goto('file://' + E + '/contact-sheet.html')
  await p.evaluate(() => document.querySelectorAll('img').forEach(i => (i.loading = 'eager')))
  await p.waitForFunction(() => [...document.images].every(i => i.complete), null, { timeout: 60000 })
  const imgs = await p.evaluate(() => [...document.images].map(i => ({ src: i.getAttribute('src'), w: i.naturalWidth, h: i.naturalHeight, aw: +i.getAttribute('width'), ah: +i.getAttribute('height') })))
  const broken = imgs.filter(i => !i.w)
  const mism = imgs.filter(i => i.w && (i.w !== i.aw || i.h !== i.ah))
  const portrait = imgs.filter(i => i.h > i.w).map(i => i.src)
  console.log(`images ${imgs.length}, broken ${broken.length}, natural size != listed size ${mism.length}, portrait ${portrait.length}`)
  broken.forEach(i => console.log('BROKEN', i.src))
  mism.forEach(i => console.log('MISMATCH', i.src, i.w, i.h, i.aw, i.ah))
  portrait.forEach(s => console.log('portrait', s))
  const secs = await p.$$('section')
  const H = await p.evaluate(() => document.documentElement.scrollHeight)
  const tops = []
  for (const s of secs) tops.push(await s.evaluate(e => e.getBoundingClientRect().top + window.scrollY))
  const per = 6
  for (let k = 0, n = 1; k < secs.length; k += per, n++) {
    const y0 = k === 0 ? 0 : tops[k] - 8
    const y1 = k + per < secs.length ? tops[k + per] - 8 : H
    await p.screenshot({ path: `${E}/contact-sheet-${n}.png`, fullPage: true, clip: { x: 0, y: y0, width: 1400, height: y1 - y0 } })
    console.log(`contact-sheet-${n}.png: sections ${k + 1}-${Math.min(k + per, secs.length)}`)
  }
  await b.close()
})()
