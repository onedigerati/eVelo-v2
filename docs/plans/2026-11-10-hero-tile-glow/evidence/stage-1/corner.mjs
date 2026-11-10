import { createRequire } from 'module'
import fs from 'fs'
const require = createRequire('/home/jonah/repos/Heel/node_modules/')
const { chromium } = require('playwright')
const EV = '/home/jonah/repos/eVelo-v2/docs/evidence/stage-1/'
const b = await chromium.launch()
const lines = []
for (const theme of ['dark', 'light']) for (const width of [1280, 390]) for (const [build, url] of [['new', 'http://localhost:4318/'], ['head', 'http://localhost:4319/']]) {
  const ctx = await b.newContext({ viewport: { width, height: 1000 }, colorScheme: theme })
  await ctx.addInitScript(({ theme }) => localStorage.setItem('evelo:v2', JSON.stringify({ theme, themeV: 2 })), { theme })
  const p = await ctx.newPage()
  await p.goto(url + '#atlas'); await p.waitForSelector('.atlas__status.is-done', { timeout: 90000 }); await p.waitForTimeout(1800)
  await p.mouse.move(0, 0)
  if (build === 'head') await p.locator('.atlas__tiles').screenshot({ path: `${EV}tiles-${theme}-${width}-default-HEAD.png`, animations: 'disabled' })
  const sample = async (label) => {
    const tiles = await p.$$('.atile')
    for (let i = 0; i < tiles.length; i++) {
      const bb = await tiles[i].boundingBox()
      const buf = await tiles[i].screenshot({ animations: 'disabled' })
      const px = await p.evaluate(async ({ b64, pts }) => {
        const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode()
        const c = new OffscreenCanvas(img.width, img.height); const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(img, 0, 0)
        return pts.map(([a, b]) => [...x.getImageData(Math.round(a), Math.round(b), 1, 1).data].slice(0, 3).join(','))
      }, { b64: buf.toString('base64'), pts: [[bb.width - 22, 22], [bb.width - 50, 40]] })
      lines.push(`${build} ${theme}-${width} ${label.padEnd(18)} tile${i} topRight(w-22,22)=${px[0]}  (w-50,40)=${px[1]}`)
    }
  }
  await sample('as shipped')
  await p.addStyleTag({ content: '.atile::after,.atile__fig::before{display:none!important}' })
  await sample('all glows hidden')
  await ctx.close()
}
await b.close()
fs.writeFileSync(EV + 'corner-pixels.txt', "$ node corner.mjs  (pixel RGB at each tile's top-right corner, this change ('new') vs a HEAD build ('head'), with and without the glow pseudo-elements; tile0 Best odds, tile1 Your home, tile2 Your destination)\n" + lines.join('\n') + '\n')
console.log(lines.join('\n'))
