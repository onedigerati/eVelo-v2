// Clipping: pixels just outside each tile where the glow's box extends past it, with the glow shown vs hidden.
import { createRequire } from 'module'
import fs from 'fs'
const require = createRequire('/home/jonah/repos/Heel/node_modules/')
const { chromium } = require('playwright')
const EV = '/home/jonah/repos/eVelo-v2/docs/evidence/stage-1/'
const b = await chromium.launch()
const lines = []
for (const theme of ['dark', 'light']) for (const width of [1280, 390]) {
  const ctx = await b.newContext({ viewport: { width, height: 1000 }, colorScheme: theme })
  await ctx.addInitScript(({ theme }) => localStorage.setItem('evelo:v2', JSON.stringify({ theme, themeV: 2 })), { theme })
  const p = await ctx.newPage()
  await p.goto('http://localhost:4318/#atlas'); await p.waitForSelector('.atlas__status.is-done', { timeout: 90000 }); await p.waitForTimeout(1800)
  await p.mouse.move(0, 0)
  // Points: 3px outside the tile edge the glow's box crosses, level with the glow centre (left) or below it (bottom); also 3px inside.
  const pts = await p.evaluate(() => [...document.querySelectorAll('.atile')].flatMap((t, i) => {
    const f = t.querySelector('.atile__fig'); if (!f) return []
    const tr = t.getBoundingClientRect(), fr = f.getBoundingClientRect()
    const cx = fr.left + fr.width / 2, cy = fr.top + fr.height / 2
    const out = []
    if (cx - 90 < tr.left) out.push({ i, side: 'left', outside: [tr.left - 3, cy], inside: [tr.left + 3, cy], overshootPx: Math.round(tr.left - (cx - 90)) })
    if (cy + 90 > tr.bottom) out.push({ i, side: 'bottom', outside: [cx, tr.bottom + 3], inside: [cx, tr.bottom - 3], overshootPx: Math.round(cy + 90 - tr.bottom) })
    out.push({ i, overflow: getComputedStyle(t).overflow, radius: getComputedStyle(t).borderRadius })
    return out
  }))
  const read = async () => {
    const buf = await p.screenshot({ animations: 'disabled' })
    return p.evaluate(async ({ b64, pts }) => {
      const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode()
      const c = new OffscreenCanvas(img.width, img.height); const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(img, 0, 0)
      const g = ([a, b]) => [...x.getImageData(Math.round(a), Math.round(b), 1, 1).data].slice(0, 3).join(',')
      return pts.map((q) => q.side ? { o: g(q.outside), in: g(q.inside) } : null)
    }, { b64: buf.toString('base64'), pts })
  }
  const shown = await read()
  await p.addStyleTag({ content: '.atile__fig::before{display:none!important}' })
  const hidden = await read()
  pts.forEach((q, k) => {
    if (!q.side) { lines.push(`${theme}-${width} tile${q.i} overflow=${q.overflow} border-radius=${q.radius}`); return }
    lines.push(`${theme}-${width} tile${q.i} glow box overshoots ${q.side} edge by ${q.overshootPx}px | 3px outside: shown=${shown[k].o} hidden=${hidden[k].o} ${shown[k].o === hidden[k].o ? 'SAME (clipped)' : 'DIFFERENT'} | 3px inside: shown=${shown[k].in} hidden=${hidden[k].in}`)
  })
  await ctx.close()
}
await b.close()
fs.writeFileSync(EV + 'clip-pixels.txt', '$ node clip.mjs  (default state; tile0 Best odds, tile1 Your home, tile2 Your destination)\n' + lines.join('\n') + '\n')
console.log(lines.join('\n'))
