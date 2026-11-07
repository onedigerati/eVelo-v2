// Live GitHub Pages check: first visit to the bare URL shows the study G landing; #atlas goes straight to the app.
const { chromium } = require('/home/jonah/repos/eVelo/node_modules/playwright-core')
const BASE = 'https://onedigerati.github.io/eVelo-v2/'
;(async () => {
  const b = await chromium.launch(); let fails = 0; const errs = []
  const ok = (c, m) => { if (!c) fails++; console.log(`  ${c ? 'OK  ' : 'FAIL'} ${m}`) }
  for (const [w, h] of [[1440, 900], [390, 844]]) {
    const c = await b.newContext({ viewport: { width: w, height: h } }); const p = await c.newPage()
    p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()) }); p.on('pageerror', (e) => errs.push(e.message))
    await p.goto(BASE); await p.waitForTimeout(1500)
    const s = await p.evaluate(() => ({ landing: !!document.querySelector('.landing'), topbar: !!document.querySelector('.topbar'), h1: document.querySelector('h1')?.textContent, dots: document.querySelectorAll('.landing svg[role=img] circle').length }))
    console.log(`[${w}] first visit`, JSON.stringify(s))
    ok(s.landing && !s.topbar && /without ever selling it/.test(s.h1 || ''), `${w}: bare URL first visit shows the G landing`)
    await p.screenshot({ path: `/home/jonah/repos/eVelo-v2/docs/evidence/stage-2/live-${w}.png` })
    await c.close()
    const c2 = await b.newContext({ viewport: { width: w, height: h } }); const p2 = await c2.newPage()
    await p2.goto(BASE + '#atlas'); await p2.waitForTimeout(1500)
    const t = await p2.evaluate(() => ({ landing: !!document.querySelector('.landing'), topbar: !!document.querySelector('.topbar') }))
    ok(!t.landing && t.topbar, `${w}: #atlas on a first visit goes straight to the app`)
    await c2.close()
  }
  console.log('console errors:', errs.length, errs.slice(0, 3)); console.log('checks failed:', fails); await b.close()
})()
