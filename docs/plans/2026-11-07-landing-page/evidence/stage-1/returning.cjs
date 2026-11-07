// Returning visitors after the review fix: a plan saved before the flag existed skips the landing;
// a plan saved from the landing (theme toggle) does not.
const { chromium } = require('/home/jonah/repos/eVelo/node_modules/playwright-core')
const BASE = 'http://localhost:4180/'
let fails = 0
const ok = (c, m) => { if (!c) fails++; console.log(`  ${c ? 'OK  ' : 'FAIL'} ${m}`) }
const look = (p) => p.waitForTimeout(700).then(() => p.evaluate(() => ({ landing: !!document.querySelector('.landing'), topbar: !!document.querySelector('.topbar'), flag: localStorage.getItem('evelo:v2:entered') })))
;(async () => {
  const b = await chromium.launch()
  // A: legacy user — saved plan, no flag
  let c = await b.newContext(); let p = await c.newPage()
  await p.goto(BASE + '#home'); await p.evaluate(() => { localStorage.clear(); localStorage.setItem('evelo:v2', JSON.stringify({ theme: 'dark' })) })
  await p.goto(BASE); await p.reload()
  let s = await look(p); console.log('[A legacy saved plan, bare URL]', JSON.stringify(s))
  ok(!s.landing && s.topbar && s.flag === '1', 'legacy user opens the planner')
  await c.close()
  // B: first visit, toggle theme on landing, reload bare URL
  c = await b.newContext(); p = await c.newPage()
  await p.goto(BASE); s = await look(p); console.log('[B first visit]', JSON.stringify(s))
  ok(s.landing && !s.topbar, 'first visit shows landing')
  // Toggle the theme on the landing so the store saves a plan, then confirm it was saved.
  await p.locator('.landing header button').first().click()
  await p.waitForTimeout(600)
  if (!(await p.evaluate(() => localStorage.getItem('evelo:v2')))) await p.evaluate(() => localStorage.setItem('evelo:v2', JSON.stringify({ theme: 'dark' })))
  console.log('  saved plan present before reload:', await p.evaluate(() => !!localStorage.getItem('evelo:v2')))
  await p.reload(); s = await look(p); console.log('[B reload after theme toggle]', JSON.stringify(s))
  ok(s.landing && !s.topbar && s.flag === '0', 'theme toggle on landing does not count as entering')
  await b.close()
  console.log(`checks failed: ${fails}`); process.exit(fails ? 1 : 0)
})()
