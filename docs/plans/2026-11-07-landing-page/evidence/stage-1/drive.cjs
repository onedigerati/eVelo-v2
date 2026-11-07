const { chromium } = require('/home/jonah/repos/eVelo/node_modules/playwright-core')
const fs = require('fs')
const BASE = 'http://localhost:4180/'
const OUT = '/home/jonah/repos/eVelo-v2/docs/evidence/stage-1/'
const VPS = { desktop: { width: 1280, height: 800 }, phone: { width: 390, height: 844 } }
const lines = []
const log = (s) => { lines.push(s); console.log(s) }
let fails = 0
const expect = (cond, msg) => { if (!cond) fails++; log(`  ${cond ? 'OK  ' : 'FAIL'} ${msg}`) }
const consoleErrors = []

async function ctx(browser, vp, opts = {}) {
  const c = await browser.newContext({ viewport: VPS[vp], deviceScaleFactor: 1, isMobile: vp === 'phone', hasTouch: vp === 'phone', colorScheme: opts.scheme || 'light' })
  if (opts.clipboard) await c.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: BASE })
  const p = await c.newPage()
  p.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(`[${vp}] ${p.url()} ${m.text()}`) })
  p.on('pageerror', (e) => consoleErrors.push(`[${vp}] pageerror ${p.url()} ${e.message}`))
  return { c, p }
}
async function state(p) {
  await p.waitForTimeout(700)
  return p.evaluate(() => ({
    hash: location.hash,
    landing: !!document.querySelector('.landing'),
    topbar: !!document.querySelector('.topbar'),
    tabbar: !!document.querySelector('.tabbar'),
    app: !!document.querySelector('.app'),
    plan: !!document.querySelector('.plan'),
    outlook: !!document.querySelector('.outlook, .outlook__grid'),
    h1: document.querySelector('h1')?.textContent ?? null,
    flag: localStorage.getItem('evelo:v2:entered'),
    theme: document.documentElement.dataset.theme ?? null,
    bg: getComputedStyle(document.body).backgroundColor,
  }))
}
const fmt = (s) => JSON.stringify(s)

;(async () => {
  const browser = await chromium.launch()
  for (const vp of ['desktop', 'phone']) {
    log(`\n=== ${vp} ${VPS[vp].width}x${VPS[vp].height} ===`)

    // Check 1: first visit, bare URL
    log(`\n[check 1] first visit to bare URL (fresh context)`)
    let { c, p } = await ctx(browser, vp)
    await p.goto(BASE)
    let s = await state(p)
    log('  ' + fmt(s))
    expect(s.landing && !s.topbar && !s.tabbar && !s.app, 'landing shown, no .topbar/.tabbar/.app')
    expect(s.flag !== '1', 'flag not set by viewing the landing')
    await p.screenshot({ path: `${OUT}first-visit-${vp}.png` })

    // Check 2 via CTA: click Launch my plan, then reload bare URL
    log(`\n[check 2a] enter via CTA "Launch my plan", then reload bare URL`)
    await p.click('text=Launch my plan')
    s = await state(p)
    log('  after CTA ' + fmt(s))
    expect(s.hash === '#plan' && !s.landing && s.topbar, 'CTA opens #plan with top bar')
    expect(s.flag === '1', 'flag set after entering')
    if (vp === 'phone') expect(s.tabbar, 'phone tab bar present in app')
    await p.screenshot({ path: `${OUT}after-cta-${vp}.png` })
    // browser back to landing
    await p.goBack()
    s = await state(p)
    log('  after Back ' + fmt(s))
    expect(s.landing && !s.topbar, 'Back from planner returns to landing')
    await p.screenshot({ path: `${OUT}back-to-landing-${vp}.png` })
    // reload bare URL
    await p.goto(BASE)
    s = await state(p)
    log('  bare URL after entering ' + fmt(s))
    expect(!s.landing && s.topbar && s.plan, 'bare URL opens planner after entering')
    await p.reload()
    s = await state(p)
    log('  after reload ' + fmt(s))
    expect(!s.landing && s.topbar && s.plan, 'reload of bare URL still opens planner')
    await p.screenshot({ path: `${OUT}reload-bare-after-enter-${vp}.png` })

    // Check 4: wordmark links to #home; #home shows landing even when entered
    log(`\n[check 4] wordmark -> #home, #home always landing`)
    const href = await p.getAttribute('.topbar .wordmark', 'href')
    log(`  wordmark href=${href}`)
    expect(href === '#home', 'app wordmark href is #home')
    await p.click('.topbar .wordmark')
    s = await state(p)
    log('  after wordmark click ' + fmt(s))
    expect(s.hash === '#home' && s.landing && !s.topbar && !s.tabbar, 'wordmark click shows landing, no bars')
    await p.screenshot({ path: `${OUT}wordmark-to-home-${vp}.png` })
    await p.goto(BASE + '#home'); await p.reload()
    s = await state(p)
    expect(s.landing && s.flag === '1', '#home loaded directly (entered) shows landing, flag kept')
    // nav: header "Open the planner"
    await p.click('text=Open the planner')
    s = await state(p)
    expect(s.hash === '#plan' && s.topbar, '"Open the planner" header link enters #plan')
    await c.close()

    // #home on first visit (fresh)
    ;({ c, p } = await ctx(browser, vp))
    await p.goto(BASE + '#home')
    s = await state(p)
    log('  fresh #home ' + fmt(s))
    expect(s.landing && !s.topbar && s.flag !== '1', '#home on first visit shows landing, flag unset')
    await c.close()

    // Check 2b: enter via a route hash (fresh ctx), then bare URL -> planner
    log(`\n[check 2b] enter via app route (#method), then bare URL`)
    ;({ c, p } = await ctx(browser, vp))
    await p.goto(BASE + '#method')
    s = await state(p)
    expect(!s.landing && s.flag === '1', '#method enters app and sets flag')
    await p.goto(BASE)
    s = await state(p)
    log('  bare after #method ' + fmt(s))
    expect(!s.landing && s.plan, 'bare URL opens planner')
    await c.close()

    // Check 2c: enter via nav from landing (header link) in fresh ctx, then new page bare
    log(`\n[check 2c] enter via header nav, new tab bare URL`)
    ;({ c, p } = await ctx(browser, vp))
    await p.goto(BASE)
    await p.click('text=Open the planner')
    await p.waitForTimeout(400)
    const p2 = await c.newPage()
    await p2.goto(BASE)
    s = await state(p2)
    expect(!s.landing && s.plan, 'new tab bare URL opens planner after header nav')
    await c.close()

    // Check 3: route hashes on first visit
    log(`\n[check 3] route hashes on a first visit (fresh context each)`)
    for (const r of ['atlas', 'method', 'outlook', 'plan']) {
      ;({ c, p } = await ctx(browser, vp))
      await p.goto(BASE + '#' + r)
      s = await state(p)
      log(`  #${r} ` + fmt({ hash: s.hash, landing: s.landing, topbar: s.topbar, flag: s.flag }))
      expect(!s.landing && s.topbar, `#${r} first visit: app, not landing`)
      await p.screenshot({ path: `${OUT}first-visit-${r}-${vp}.png` })
      await c.close()
    }

    // Check 3: real share link
    log(`\n[check 3] real share link from the app's share button`)
    ;({ c, p } = await ctx(browser, vp, { clipboard: true }))
    await p.goto(BASE + '#plan')
    await p.waitForTimeout(800)
    const shareBtn = p.locator('.topbar button:has-text("Share"), .topbar [aria-label="Copy share link"]').first()
    await shareBtn.click()
    await p.waitForTimeout(400)
    const link = await p.evaluate(() => navigator.clipboard.readText())
    log(`  share link: ${link.slice(0, 90)}… (${link.length} chars)`)
    await c.close()
    ;({ c, p } = await ctx(browser, vp))
    await p.goto(link)
    s = await state(p)
    log('  fresh share link ' + fmt({ hash: s.hash.slice(0, 20) + '…', landing: s.landing, topbar: s.topbar, flag: s.flag }))
    expect(link.includes('#p=') && !s.landing && s.topbar && s.flag === '1', 'share link first visit: app, not landing; flag set')
    await p.screenshot({ path: `${OUT}first-visit-share-link-${vp}.png` })
    await c.close()

    // Themes
    log(`\n[themes] landing in both themes`)
    for (const scheme of ['light', 'dark']) {
      ;({ c, p } = await ctx(browser, vp, { scheme }))
      await p.goto(BASE)
      s = await state(p)
      log(`  system ${scheme}: theme=${s.theme} bg=${s.bg} landing=${s.landing} h1=${s.h1}`)
      expect(s.landing, `landing renders with system ${scheme}`)
      await p.screenshot({ path: `${OUT}landing-${scheme}-${vp}.png` })
      await c.close()
    }
    // toggle theme on landing
    ;({ c, p } = await ctx(browser, vp))
    await p.goto(BASE)
    await p.waitForTimeout(500)
    const before = (await state(p)).bg
    const toggle = vp === 'phone' ? p.locator('.landing__actions button').first() : p.locator('.landing__actions [role=radio], .landing__actions button').last()
    await toggle.click()
    const after = await state(p)
    log(`  toggle on landing: bg ${before} -> ${after.bg}, theme=${after.theme}, landing=${after.landing}`)
    expect(after.landing, 'landing still shown after theme toggle')
    await p.screenshot({ path: `${OUT}landing-toggled-${vp}.png` })
    await c.close()
  }
  log(`\n=== console errors (${consoleErrors.length}) ===`)
  consoleErrors.forEach((e) => log('  ' + e))
  log(`\nchecks failed: ${fails}`)
  fs.writeFileSync(OUT + 'browser-run.txt', '$ node drive.cjs  (playwright-core 1.57 headless Chromium against vite preview http://localhost:4180/)\n' + lines.join('\n') + '\n')
  await browser.close()
  process.exit(fails || consoleErrors.length ? 1 : 0)
})()
