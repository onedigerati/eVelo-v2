const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright')
const fs = require('fs')
const BASE = process.argv[2]
const OUT = __dirname
const EXE = process.env.HOME + '/.cache/ms-playwright/chromium-1248/chrome-linux-arm64/chrome'
const log = []
const P = (...a) => { const s = a.map((x) => (typeof x === 'string' ? x : JSON.stringify(x))).join(' '); log.push(s); console.log(s) }
const consoleErrors = []
let fails = 0
const expect = (label, got, want) => { const ok = got === want; if (!ok) fails++; P(`${ok ? 'PASS' : 'FAIL'} ${label}: got ${JSON.stringify(got)} want ${JSON.stringify(want)}`) }

// Records theme + body background at body insert, DOMContentLoaded and first frame, plus whether the app had mounted.
const INIT = () => {
  window.__paint = []
  const snap = (when) => {
    const de = document.documentElement
    const b = document.body
    const root = document.getElementById('root')
    window.__paint.push({
      when,
      theme: de && de.dataset.theme,
      htmlBg: de ? getComputedStyle(de).backgroundColor : null,
      bodyBg: b ? getComputedStyle(b).backgroundColor : null,
      rootChildren: root ? root.childElementCount : null,
      metas: [...document.querySelectorAll('meta[name="theme-color"]')].map((m) => m.content),
    })
  }
  const mo = new MutationObserver(() => { if (document.body) { snap('body-inserted'); mo.disconnect() } })
  mo.observe(document, { childList: true, subtree: true })
  document.addEventListener('DOMContentLoaded', () => snap('DOMContentLoaded'))
  requestAnimationFrame(() => snap('first-frame'))
}

async function newCtx(browser, opts = {}) {
  const ctx = await browser.newContext({ colorScheme: 'light', viewport: { width: 1280, height: 860 }, ...opts })
  await ctx.addInitScript(INIT)
  return ctx
}
async function open(ctx, url) {
  const page = await ctx.newPage()
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(`${url}: ${m.text()}`) })
  page.on('pageerror', (e) => consoleErrors.push(`${url}: pageerror ${e.message}`))
  await page.goto(BASE + url, { waitUntil: 'load' })
  await page.waitForTimeout(1500)
  return page
}
async function state(page) {
  return page.evaluate(() => ({
    theme: document.documentElement.dataset.theme,
    bodyBg: getComputedStyle(document.body).backgroundColor,
    metas: [...document.querySelectorAll('meta[name="theme-color"]')].map((m) => m.content),
    saved: localStorage.getItem('evelo:v2'),
    toggle: [...document.querySelectorAll('[role="radio"][aria-label$="theme"]')].map((b) => `${b.getAttribute('aria-label')}=${b.getAttribute('aria-checked')}`),
    cycle: [...document.querySelectorAll('button.icon-btn[aria-label*="theme —"]')].map((b) => b.getAttribute('aria-label')),
  }))
}
const isDark = (rgb) => { const m = rgb.match(/\d+/g).map(Number); return (m[0] + m[1] + m[2]) / 3 < 80 }

;(async () => {
  const browser = await chromium.launch({ executablePath: EXE })

  // 1. Fresh context, light OS: landing and #plan
  for (const [name, url] of [['landing', ''], ['plan', '#plan']]) {
    P(`\n== Fresh context, light OS, ${name} (${BASE + url})`)
    const ctx = await newCtx(browser)
    const page = await open(ctx, url)
    const paint = await page.evaluate(() => window.__paint)
    for (const p of paint) P('  first paint', p)
    for (const p of paint.filter((p) => p.when !== 'body-inserted')) expect(`${name} ${p.when} theme`, p.theme, 'dark')
    const ff = paint.find((p) => p.when === 'first-frame')
    expect(`${name} first-frame body bg is dark (${ff.bodyBg})`, isDark(ff.bodyBg), true)
    const s = await state(page)
    P('  settled', s)
    expect(`${name} settled theme`, s.theme, 'dark')
    expect(`${name} settled bg dark`, isDark(s.bodyBg), true)
    expect(`${name} theme-color metas`, s.metas.join(','), '#0A0D0C,#0A0D0C')
    expect(`${name} toggle shows Dark`, s.toggle.includes('Dark theme=true'), true)
    await page.screenshot({ path: `${OUT}/fresh-light-os-${name}.png` })
    await ctx.close()
  }

  // 1b. First paint with the app's JS blocked: only the inline pre-paint script + CSS run.
  for (const [name, seed, want] of [['fresh', null, 'dark'], ['old-system', '{"theme":"system"}', 'dark'], ['light', '{"theme":"light","themeV":2}', 'light']]) {
    P(`\n== App JS blocked (pre-paint only), light OS, saved=${seed}`)
    const ctx = await newCtx(browser)
    if (seed) await ctx.addInitScript((v) => { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('evelo:v2', v); sessionStorage.setItem('seeded', '1') } }, seed)
    await ctx.route(/\/assets\/.*\.js$/, (r) => r.abort())
    const page = await ctx.newPage()
    await page.goto(BASE + '#plan', { waitUntil: 'load' })
    await page.waitForTimeout(500)
    const s = await page.evaluate(() => ({ theme: document.documentElement.dataset.theme, htmlBg: getComputedStyle(document.documentElement).backgroundColor, bodyBg: getComputedStyle(document.body).backgroundColor, root: document.getElementById('root').childElementCount, metas: [...document.querySelectorAll('meta[name="theme-color"]')].map((m) => m.content) }))
    P('  ', s)
    expect(`prepaint ${name} app not mounted`, s.root, 0)
    expect(`prepaint ${name} theme`, s.theme, want)
    expect(`prepaint ${name} bg dark?`, isDark(s.bodyBg), want === 'dark')
    await page.screenshot({ path: `${OUT}/prepaint-only-${name}.png` })
    await ctx.close()
  }

  // Capture a real save to get a valid inputs object.
  let inputs
  {
    const ctx = await newCtx(browser)
    const page = await open(ctx, '#plan')
    let saved = (await state(page)).saved
    if (!saved) {
      P('  (nothing saved on a fresh visit; picking Light then Dark to trigger a real save)')
      await page.click('[role="radio"][aria-label="Light theme"]')
      await page.waitForTimeout(500)
      await page.click('[role="radio"][aria-label="Dark theme"]')
      await page.waitForTimeout(500)
      saved = (await state(page)).saved
    }
    P('\n== Captured real save from a fresh #plan:', saved ? saved.slice(0, 200) + '…' : saved)
    expect('fresh save writes themeV 2', JSON.parse(saved).themeV, 2)
    inputs = JSON.parse(saved).inputs
    await ctx.close()
  }

  // 2. Old save {theme:system, inputs} without themeV, light OS -> dark; then Light survives reload; then System survives reload.
  {
    const old = JSON.stringify({ theme: 'system', inputs })
    P('\n== Old save without themeV, light OS: evelo:v2 =', old.slice(0, 120) + '…')
    const ctx = await newCtx(browser)
    await ctx.addInitScript((v) => { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('evelo:v2', v); sessionStorage.setItem('seeded', '1') } }, old)
    const page = await open(ctx, '#plan')
    const paint = await page.evaluate(() => window.__paint)
    for (const p of paint) P('  first paint', p)
    for (const p of paint.filter((p) => p.when !== 'body-inserted')) expect(`old-system ${p.when} theme`, p.theme, 'dark')
    let s = await state(page)
    P('  settled', { ...s, saved: s.saved && s.saved.slice(-60) })
    expect('old-system settled theme', s.theme, 'dark')
    expect('old-system bg dark', isDark(s.bodyBg), true)
    expect('old-system toggle shows Dark', s.toggle.includes('Dark theme=true'), true)
    await page.screenshot({ path: `${OUT}/old-system-save-opens-dark.png` })

    P('\n== Pick Light, reload')
    await page.click('[role="radio"][aria-label="Light theme"]')
    await page.waitForTimeout(800)
    s = await state(page)
    P('  after click saved:', JSON.parse(s.saved).theme, 'themeV', JSON.parse(s.saved).themeV)
    await page.reload({ waitUntil: 'load' })
    await page.waitForTimeout(1500)
    const paintL = await page.evaluate(() => window.__paint)
    for (const p of paintL) P('  first paint', p)
    s = await state(page)
    P('  settled', { ...s, saved: s.saved && s.saved.slice(-60) })
    expect('light after reload theme', s.theme, 'light')
    expect('light after reload bg light', isDark(s.bodyBg), false)
    expect('light toggle shows Light', s.toggle.includes('Light theme=true'), true)
    expect('light metas', s.metas.join(','), '#F5F2EA,#F5F2EA')
    await page.screenshot({ path: `${OUT}/light-after-reload.png` })

    P('\n== Pick System (light OS), reload')
    await page.click('[role="radio"][aria-label="System theme"]')
    await page.waitForTimeout(800)
    s = await state(page)
    P('  after click saved:', JSON.parse(s.saved).theme, 'themeV', JSON.parse(s.saved).themeV)
    await page.reload({ waitUntil: 'load' })
    await page.waitForTimeout(1500)
    for (const p of await page.evaluate(() => window.__paint)) P('  first paint', p)
    s = await state(page)
    P('  settled', { ...s, saved: s.saved && s.saved.slice(-60) })
    expect('system after reload theme', s.theme, 'system')
    expect('system (light OS) renders light', isDark(s.bodyBg), false)
    expect('system toggle shows System', s.toggle.includes('System theme=true'), true)
    await page.screenshot({ path: `${OUT}/system-after-reload-light-os.png` })

    P('\n== Same saved System, OS switched to dark, reload')
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.reload({ waitUntil: 'load' })
    await page.waitForTimeout(1500)
    for (const p of await page.evaluate(() => window.__paint)) P('  first paint', p)
    s = await state(page)
    P('  settled', { ...s, saved: s.saved && s.saved.slice(-60) })
    expect('system (dark OS) theme', s.theme, 'system')
    expect('system (dark OS) renders dark', isDark(s.bodyBg), true)
    await page.screenshot({ path: `${OUT}/system-after-reload-dark-os.png` })
    await ctx.close()
  }

  // 3. Phone 390px, plain URL, fresh context
  {
    P('\n== Phone 390x844, fresh, light OS, plain URL')
    const ctx = await newCtx(browser, { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 })
    const page = await open(ctx, '')
    const paint = await page.evaluate(() => window.__paint)
    for (const p of paint) P('  first paint', p)
    for (const p of paint.filter((p) => p.when !== 'body-inserted')) expect(`phone ${p.when} theme`, p.theme, 'dark')
    const s = await state(page)
    P('  settled', s)
    expect('phone theme', s.theme, 'dark')
    expect('phone bg dark', isDark(s.bodyBg), true)
    expect('phone cycle button says Dark', (s.cycle[0] || '').startsWith('Dark theme'), true)
    const sw = await page.evaluate(() => document.documentElement.scrollWidth)
    expect('phone no horizontal scroll', sw <= 390, true)
    await page.screenshot({ path: `${OUT}/phone-390-landing.png` })
    await ctx.close()
  }

  P('\n== Console errors:', consoleErrors.length ? consoleErrors : 'none')
  P(`\n${fails} failing assertion(s)`)
  fs.writeFileSync(`${OUT}/browser-run.txt`, log.join('\n') + '\n', { flag: 'a' })
  await browser.close()
  process.exit(fails ? 1 : 0)
})().catch((e) => { console.error(e); process.exit(2) })
