import { chromium } from 'playwright'
const base = 'https://onedigerati.github.io/eVelo-v2/'
const b = await chromium.launch()
const out = []
for (const w of [2560, 1440]) {
  const p = await b.newPage({ viewport: { width: w, height: 1400 } })
  for (const [route, sel] of [['', '.landing__frame'], ['#plan', '.workspace'], ['#atlas', '.page.page--atlas'], ['#atlas', '.topbar__inner']]) {
    await p.goto(base + route, { waitUntil: 'networkidle' }); await p.waitForTimeout(1500)
    const r = await p.evaluate(s => { const e = document.querySelector(s); return { w: e ? Math.round(e.getBoundingClientRect().width*10)/10 : null, sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth } }, sel)
    out.push(`${w} ${route||'landing'} ${sel} width=${r.w} scroll=${r.sw}/${r.cw}`)
  }
  await p.close()
}
console.log(out.join('\n')); await b.close()
