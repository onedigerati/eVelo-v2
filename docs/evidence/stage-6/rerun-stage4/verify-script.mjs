// Stage 4 independent verification, against dist/ (fresh npm run build).
import { mkdirSync, writeFileSync } from 'node:fs'
import { chromium } from '/home/jonah/src/repos/eVelo-v2/node_modules/playwright/index.mjs'
import { withPreview } from '/home/jonah/src/repos/eVelo-v2/scripts/serve-preview.mjs'

const EV = '/home/jonah/src/repos/eVelo-v2/docs/evidence/stage-6/rerun-stage4/'
mkdirSync(EV, { recursive: true })
const log = []
const out = (s) => { console.log(s); log.push(s) }
const fails = []
const check = (ok, msg) => { out(`${ok ? 'ok  ' : 'FAIL'} ${msg}`); if (!ok) fails.push(msg) }

const ARROW = '.landing__cta-climb'
const CTA = 'a.landing__cta--primary'
const COUPON = 'a.landing__coupon'

async function home(p, base) {
  await p.goto(base + '#home')
  await p.waitForLoadState('networkidle')
  await p.locator(ARROW).waitFor()
}
// Hash-change timestamp relative to a start mark set in-page.
async function markStart(p) {
  await p.evaluate(() => {
    window.__t0 = performance.now(); window.__tHash = null
    window.addEventListener('hashchange', () => { if (window.__tHash == null) window.__tHash = performance.now() - window.__t0 }, { once: true })
  })
}
const hashDelay = (p) => p.evaluate(() => window.__tHash)

async function hitArrow(p, n, touch, gap = 70) {
  const box = await p.locator(ARROW).boundingBox()
  const x = box.x + box.width / 2, y = box.y + box.height / 2
  await markStart(p)
  for (let i = 0; i < n; i++) {
    if (touch) await p.touchscreen.tap(x, y)
    else await p.mouse.click(x, y)
    if (i < n - 1) await p.waitForTimeout(gap)
  }
}

await withPreview(async (base) => {
  const browser = await chromium.launch()
  try {
    // ---------- 1. Door, desktop + phone/touch ----------
    for (const [name, opts, touch] of [
      ['desktop', { viewport: { width: 1280, height: 800 } }, false],
      ['phone', { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 3 }, true],
    ]) {
      out(`\n== door · ${name}`)
      const ctx = await browser.newContext(opts)
      const p = await ctx.newPage()
      const errs = []
      p.on('pageerror', (e) => errs.push(e.message))
      p.on('console', (m) => m.type() === 'error' && errs.push(m.text()))

      // Label click (on the text, left part of the link)
      await home(p, base)
      const cb = await p.locator(CTA).boundingBox()
      await markStart(p)
      if (touch) await p.touchscreen.tap(cb.x + 12, cb.y + cb.height / 2)
      else await p.mouse.click(cb.x + 12, cb.y + cb.height / 2)
      await p.waitForTimeout(600)
      let d = await hashDelay(p)
      check(p.url().endsWith('#plan') && d != null && d < 120, `${name}: label ${touch ? 'tap' : 'click'} -> #plan at once (${d?.toFixed(0)} ms)`)

      for (const n of [1, 2]) {
        await home(p, base)
        await hitArrow(p, n, touch)
        await p.waitForTimeout(800)
        d = await hashDelay(p)
        check(p.url().endsWith('#plan') && d >= 250 && d < 650, `${name}: ${n} arrow ${touch ? 'tap' : 'click'}(s) -> #plan after ${d?.toFixed(0)} ms`)
      }
      for (const n of [3, 4]) {
        await home(p, base)
        await hitArrow(p, n, touch)
        await p.waitForTimeout(1200)
        check(p.url().endsWith('#home') && (await p.locator(COUPON).count()) === 0 && (await p.locator(ARROW).count()) === 1,
          `${name}: ${n} quick arrow hits hold on #home, no coupon`)
      }
      await p.screenshot({ path: `${EV}door-${name}-after-4.png` })

      // Five -> coupon
      await home(p, base)
      await hitArrow(p, 5, touch)
      await p.waitForTimeout(700)
      const couponN = await p.locator(COUPON).count()
      check(p.url().endsWith('#home') && couponN === 1 && (await p.locator(ARROW).count()) === 0, `${name}: 5 quick hits -> coupon, stays on #home`)
      check(await p.evaluate(() => sessionStorage.getItem('evelo:v2:coupon')) === '1', `${name}: coupon saved in sessionStorage`)
      await p.screenshot({ path: `${EV}door-${name}-coupon.png` })
      // label still goes to plan with coupon present
      // Reload keeps coupon
      await p.reload(); await p.waitForLoadState('networkidle')
      check((await p.locator(COUPON).count()) === 1, `${name}: coupon still there after reload in same tab`)
      // Coupon opens #income
      const cpb = await p.locator(COUPON).boundingBox()
      if (touch) await p.touchscreen.tap(cpb.x + cpb.width / 2, cpb.y + cpb.height / 2)
      else await p.mouse.click(cpb.x + cpb.width / 2, cpb.y + cpb.height / 2)
      await p.waitForURL(/#income$/, { timeout: 3000 }).catch(() => {})
      check(p.url().endsWith('#income'), `${name}: coupon opens #income`)
      await p.locator('[data-testid=income-lasts-rate]').waitFor({ timeout: 10000 }).catch(() => {})
      check((await p.locator('.income').count()) === 1, `${name}: mode rendered after coupon`)
      check(errs.length === 0, `${name}: no console/page errors (${errs.join(' | ')})`)
      // New context: no coupon
      const ctx2 = await browser.newContext(opts)
      const p2 = await ctx2.newPage()
      await home(p2, base)
      check((await p2.locator(COUPON).count()) === 0 && (await p2.locator(ARROW).count()) === 1, `${name}: new context has the arrow, no coupon`)
      await ctx2.close()
      await ctx.close()
    }

    // ---------- 2/3. No naming of the mode; network; keyboard ----------
    out('\n== hidden + lazy')
    {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
      const p = await ctx.newPage()
      const reqs = []
      p.on('request', (r) => reqs.push(r.url()))
      const hitsAll = {}
      for (const route of ['home', 'plan', 'outlook', 'atlas', 'method']) {
        await p.goto(base + '#' + route)
        await p.waitForLoadState('networkidle')
        await p.waitForTimeout(1500)
        const hits = await p.evaluate(() => {
          const re = /income|admit/i
          const res = []
          const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
          let n
          while ((n = walk.nextNode())) {
            const t = n.textContent
            if (re.test(t)) {
              const el = n.parentElement
              const vis = !!(el && (el.offsetWidth || el.offsetHeight || el.getClientRects().length)) && getComputedStyle(el).visibility !== 'hidden'
              res.push(`text${vis ? '' : '(hidden)'}: "${t.trim().slice(0, 100)}" <${el?.tagName.toLowerCase()}.${el?.className}>`)
            }
          }
          for (const el of document.querySelectorAll('*')) {
            for (const a of el.attributes) {
              if (['class', 'style', 'd', 'id', 'for', 'aria-labelledby', 'aria-describedby', 'aria-controls', 'name', 'data-testid'].includes(a.name)) continue
              if (re.test(a.value)) res.push(`attr ${a.name}="${a.value.slice(0, 100)}" <${el.tagName.toLowerCase()}>`)
            }
          }
          // links to #income anywhere
          for (const a of document.querySelectorAll('a[href*="income"]')) res.push(`LINK ${a.getAttribute('href')}`)
          return res
        })
        hitsAll[route] = hits
        out(`${route}: ${hits.length} hits`)
        for (const h of hits.slice(0, 40)) out('   ' + h)
        if (hits.length > 40) out(`   ... ${hits.length - 40} more`)
      }
      writeFileSync(EV + 'name-scan.json', JSON.stringify(hitsAll, null, 2))
      const linkOrAdmit = Object.values(hitsAll).flat().filter((h) => /LINK|admit/i.test(h))
      check(linkOrAdmit.length === 0, `no link to #income and no "Admit" on main routes before coupon (${linkOrAdmit.join('; ')})`)
      const incomeChunkBefore = reqs.filter((u) => /IncomeMode/.test(u))
      check(incomeChunkBefore.length === 0, `IncomeMode chunk not fetched on home/plan/outlook/atlas/method (${reqs.length} requests seen)`)
      const n0 = reqs.length
      await p.goto(base + '#income')
      await p.locator('[data-testid=income-lasts-rate]').waitFor()
      await p.waitForLoadState('networkidle')
      const after = reqs.slice(n0).filter((u) => /assets\//.test(u)).map((u) => u.replace(base, ''))
      out('requests on #income: ' + after.join(', '))
      check(after.some((u) => /IncomeMode-.*\.js/.test(u)), 'IncomeMode chunk fetched on #income')
      writeFileSync(EV + 'network-log.txt', '$ verify.mjs request log (all requests in one context: #home #plan #outlook #atlas #method, then #income)\n' + reqs.map((u, i) => (i === n0 ? '--- navigate to #income ---\n' : '') + u.replace(base, '/')).join('\n') + '\n')

      // Keyboard
      await p.goto(base + '#home'); await p.waitForLoadState('networkidle')
      let found = false
      for (let i = 0; i < 30; i++) {
        await p.keyboard.press('Tab')
        if (await p.evaluate(() => document.activeElement?.matches('a.landing__cta--primary'))) { found = true; out(`CTA reached after ${i + 1} Tab(s)`); break }
      }
      check(found, 'Tab reaches the CTA')
      const name = await p.evaluate(() => document.activeElement?.textContent?.trim())
      out(`CTA accessible text: "${name}"`)
      await markStart(p)
      await p.keyboard.press('Enter')
      await p.waitForTimeout(500)
      const d = await hashDelay(p)
      check(p.url().endsWith('#plan') && d != null && d < 120, `Enter on CTA -> #plan at once (${d?.toFixed(0)} ms)`)
      await ctx.close()
    }

    // ---------- 4. Stored state ----------
    out('\n== stored state')
    const cases = [
      ['default (no key)', null],
      ['bad JSON', '{"age": 60,,,'],
      ['array', '[1,2,3]'],
      ['string', '"hello"'],
      ['hostile', JSON.stringify({ __proto__x: 1, spending: '<img src=x onerror=alert(1)>', homeCityId: '<script>alert(1)</script>', filingStatus: 'x'.repeat(5000), age: '70', paths: 1e9 }).replace('__proto__x', '__proto__')],
      ['proto-pollute', '{"__proto__":{"age":40,"polluted":true},"constructor":{"prototype":{"polluted":true}}}'],
      ['out of range', JSON.stringify({ age: 200, horizonYears: -5, spending: -100, paths: 7, stockShare: 9, blockMonths: 0.3 })],
      ['non-finite', '{"age":1e400,"spending":-1e400,"horizonYears":null}'],
      ['valid', JSON.stringify({ age: 60, horizonYears: 20, spending: 50000, paths: 1000 })],
    ]
    const rows = []
    for (const [label, raw] of cases) {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
      if (raw != null) await ctx.addInitScript((v) => { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('evelo:v2:income', v); sessionStorage.setItem('seeded', '1') } }, raw)
      const p = await ctx.newPage()
      const errs = []
      let dialog = false
      p.on('dialog', (dd) => { dialog = true; dd.dismiss() })
      p.on('pageerror', (e) => errs.push(e.message))
      await p.goto(base + '#income')
      await p.waitForFunction(() => /\d%/.test(document.querySelector('[data-testid=income-lasts-rate]')?.textContent || '') || /couldn't/.test(document.body.innerText), null, { timeout: 90000 })
      const rate = await p.locator('[data-testid=income-lasts-rate]').textContent()
      const note = (await p.locator('.income__measure-note').textContent()).trim()
      const polluted = await p.evaluate(() => ({}).polluted === true || ({}).age === 40)
      out(`${label}: rate ${rate} · "${note}"${errs.length ? ' · ERR ' + errs.join('|') : ''}${dialog ? ' · DIALOG' : ''}${polluted ? ' · POLLUTED' : ''}`)
      rows.push({ label, rate, note })
      check(errs.length === 0 && !dialog && !polluted, `${label}: renders without error/dialog/pollution`)
      await ctx.close()
    }
    const def = rows[0].note
    for (const r of rows.slice(1, 6)) r.label === 'hostile'
      ? check(r.note.replace(/\d+%/, 'N%') === def.replace(/\d+%/, 'N%').replace('4,000', '10,000'), 'hostile: strings in number fields, bad city/status ignored -> defaults; paths 1e9 clamped to 10,000 (a valid option)')
      : check(r.note === def, `${r.label}: shows default sentence`)
    check(rows[6].note.includes('$0 a year') && rows[6].note.includes('to age 86') && rows[6].note.includes('4,000 futures'), 'out of range: clamped (age 85, horizon 1, spending $0, paths default 4,000)')
    check(rows[7].note.includes('to age 85') && rows[7].note.includes('$0 a year') || rows[7].note === def, `non-finite: ${rows[7].note}`)
    check(rows[8].note.includes('$50,000') && rows[8].note.includes('to age 80') && rows[8].note.includes('1,000 futures'), 'valid: stored values used')

    // Reset through the real error boundary: abort a lazy route chunk so React.lazy throws.
    out('\n== error boundary reset')
    {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
      await ctx.addInitScript(() => { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('evelo:v2:income', '{"age":60}'); sessionStorage.setItem('seeded', '1') } })
      const p = await ctx.newPage()
      await p.route(/MethodView-.*\.js/, (r) => r.abort())
      await p.goto(base + '#method')
      const shown = await p.locator('.app-recover').waitFor({ timeout: 8000 }).then(() => true, () => false)
      check(shown, 'error boundary renders when the Method chunk fails to load')
      if (shown) {
        await p.screenshot({ path: `${EV}error-boundary.png` })
        check(await p.evaluate(() => localStorage.getItem('evelo:v2:income')) === '{"age":60}', 'income key present before Reset')
        await p.unroute(/MethodView-.*\.js/)
        await Promise.all([p.waitForEvent('load'), p.click('.app-recover button')])
        await p.waitForTimeout(500)
        check(await p.evaluate(() => localStorage.getItem('evelo:v2:income')) === null, 'Reset plan clears evelo:v2:income')
      }
      await ctx.close()
    }

    // ---------- 5. Mode at both widths, back link, worker failure ----------
    out('\n== mode')
    for (const [name, opts] of [
      ['desktop', { viewport: { width: 1280, height: 800 } }],
      ['phone', { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 3 }],
    ]) {
      const ctx = await browser.newContext(opts)
      const p = await ctx.newPage()
      const errs = []
      p.on('pageerror', (e) => errs.push(e.message))
      await p.goto(base + '#income')
      await p.waitForFunction(() => /\d%/.test(document.querySelector('[data-testid=income-lasts-rate]')?.textContent || ''), null, { timeout: 90000 })
      const info = await p.evaluate(() => {
        const el = document.querySelector('[data-testid=income-lasts-rate]')
        const cs = getComputedStyle(el)
        const probe = document.createElement('span'); probe.style.color = 'var(--bruised)'; document.body.append(probe)
        const brass = getComputedStyle(probe).color; probe.remove()
        const green = (() => { const s = document.createElement('span'); s.style.color = 'var(--accent)'; document.body.append(s); const c = getComputedStyle(s).color; s.remove(); return c })()
        return { text: el.textContent, color: cs.color, brass, green, sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, fs: cs.fontSize }
      })
      out(`${name}: ${JSON.stringify(info)}`)
      check(/\d%/.test(info.text), `${name}: headline rate shown (${info.text})`)
      check(info.color === info.brass && info.color !== info.green, `${name}: rate colour ${info.color} = --bruised ${info.brass} (accent ${info.green})`)
      check(info.sw <= info.cw, `${name}: no horizontal scroll (${info.sw} <= ${info.cw})`)
      await p.screenshot({ path: `${EV}mode-${name}.png`, fullPage: true })
      if (opts.hasTouch) await p.locator('a.income__back').tap()
      else await p.locator('a.income__back').click()
      await p.waitForTimeout(800)
      check(p.url().endsWith('#plan') && (await p.locator('.income').count()) === 0, `${name}: back link -> #plan (${p.url().replace(base, '')})`)
      check(errs.length === 0, `${name}: no page errors`)
      await ctx.close()
    }
    // Worker failure
    for (const [label, how] of [['worker URL aborted', 'abort'], ['worker served 404', '404'], ['worker script throws', 'throw']]) {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
      const p = await ctx.newPage()
      await p.route(/worker-.*\.js/, (r) => how === 'abort' ? r.abort() : how === '404' ? r.fulfill({ status: 404, body: '' }) : r.fulfill({ status: 200, contentType: 'text/javascript', body: 'throw new Error("boom")' }))
      await p.goto(base + '#income')
      const t0 = Date.now()
      const ok = await p.waitForFunction(() => /couldn't be worked out/.test(document.querySelector('.income__measure-note')?.textContent || ''), null, { timeout: 15000 }).then(() => true, () => false)
      const rate = await p.locator('[data-testid=income-lasts-rate]').textContent()
      check(ok && rate.trim() === '—', `${label}: error message shown in ${Date.now() - t0} ms, rate "${rate}"`)
      if (how === 'abort') await p.screenshot({ path: `${EV}mode-worker-failed.png` })
      await ctx.close()
    }
  } finally {
    await browser.close()
  }
}, 4174)

out(`\n${fails.length ? 'FAILURES: ' + fails.length : 'ALL OK'}`)
writeFileSync(EV + 'verify-run.txt', '$ node scratchpad/verify-s4b/verify.mjs   (against dist/ from npm run build)\n' + log.join('\n') + '\n')
process.exit(fails.length ? 1 : 0)
