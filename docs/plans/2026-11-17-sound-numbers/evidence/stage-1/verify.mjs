// Stage 1 browser checks against the built app (npm run build first).
// node docs/evidence/stage-1/verify.mjs  -> screenshots + run-product.txt / reset-plan-browser.txt in this folder.
// Check 5: crafted #p= links (constructor, __proto__, nowhere as home/destination; a stay-home plan) render the app, reload works.
// Check 4: a render error is forced in the harness only (an init script makes number formatting throw on the
// first load of the session), the recovery screen shows, "Reset plan" clears the stored plan and the app comes back.
import { chromium } from 'playwright'
import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { withPreview } from '../../../scripts/serve-preview.mjs'

const OUT = dirname(fileURLToPath(import.meta.url))
const log = []
const L = (...a) => { const s = a.join(' '); log.push(s); console.log(s) }
let fails = 0
const check = (ok, msg) => { L(`${ok ? 'ok  ' : 'FAIL'} ${msg}`); if (!ok) fails++ }

// Same format as src/state/share.ts encodeInputs: base64url(JSON {v:1,d:diff}), no padding.
// Built from JSON text so `__proto__` is an own key, as it is in a real link.
const link = (json) => Buffer.from(`{"v":1,"d":${json}}`, 'utf8').toString('base64url')

const CASES = [
  { name: 'dest-constructor', d: '{"destCityId":"constructor"}', home: 'st-louis', dest: null, expect: /Stay home/ },
  { name: 'home-constructor', d: '{"homeCityId":"constructor","destCityId":"lisbon"}', home: 'st-louis', dest: 'lisbon', expect: /Lisbon/ },
  { name: 'dest-proto', d: '{"destCityId":"__proto__"}', home: 'st-louis', dest: null, expect: /Stay home/ },
  { name: 'home-proto', d: '{"homeCityId":"__proto__"}', home: 'st-louis', dest: 'bangkok', expect: /Bangkok/ },
  { name: 'dest-nowhere', d: '{"destCityId":"nowhere"}', home: 'st-louis', dest: null, expect: /Stay home/ },
  { name: 'home-nowhere', d: '{"homeCityId":"nowhere","destCityId":"nowhere"}', home: 'st-louis', dest: null, expect: /Stay home/ },
  { name: 'stay-home', d: '{"destCityId":null}', home: 'st-louis', dest: null, expect: /Stay home/ },
]

async function newCtx(b, phone) {
  const ctx = await b.newContext({
    colorScheme: 'dark',
    ...(phone ? { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } : { viewport: { width: 1440, height: 900 } }),
  })
  await ctx.addInitScript(() => {
    if (sessionStorage.getItem('seeded')) return
    sessionStorage.setItem('seeded', '1')
    localStorage.clear()
    localStorage.setItem('evelo:v2:entered', '1')
    localStorage.setItem('evelo:v2', JSON.stringify({ theme: 'dark' }))
  })
  return ctx
}

function watch(p, errors) {
  p.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
  p.on('console', (m) => { if (m.type() === 'error') errors.push(`console.error: ${m.text().slice(0, 200)}`) })
}

async function state(p) {
  return p.evaluate(() => {
    const root = document.getElementById('root')
    const text = document.body.innerText
    const sec = [...document.querySelectorAll('section.section')].find((e) => e.querySelector('.section__title')?.textContent.trim() === 'Where you live')
    let stored = null
    try { stored = JSON.parse(localStorage.getItem('evelo:v2') || 'null')?.inputs ?? null } catch {}
    return {
      rootLen: root.innerHTML.length,
      recover: !!document.querySelector('.app-recover'),
      place: sec ? sec.innerText.replace(/\s+/g, ' ').trim().slice(0, 160) : null,
      odds: (text.match(/\d+%/) || [null])[0],
      stored: stored ? { home: stored.homeCityId, dest: stored.destCityId } : null,
      hash: location.hash.slice(0, 40),
    }
  })
}

async function settle(p) {
  await p.waitForLoadState('networkidle')
  await p.waitForTimeout(2500)
}

await withPreview(async (base) => {
  const b = await chromium.launch()
  try {
    // ---- Check 5: crafted links ----
    L('== Check 5: crafted #p= links, desktop 1440 and phone 390, dark ==')
    for (const phone of [false, true]) {
      const vp = phone ? 'phone' : 'desktop'
      for (const c of CASES) {
        const ctx = await newCtx(b, phone)
        const p = await ctx.newPage()
        const errors = []
        watch(p, errors)
        const url = `${base}#plan?p=${link(c.d)}`
        await p.goto(url)
        await settle(p)
        const s1 = await state(p)
        await p.screenshot({ path: join(OUT, `link-${c.name}-${vp}-dark.png`) })
        await p.reload()
        await settle(p)
        const s2 = await state(p)
        if (c.name === 'dest-constructor' || c.name === 'stay-home') await p.screenshot({ path: join(OUT, `link-${c.name}-${vp}-dark-reloaded.png`) })
        L(`[${vp}] ${c.name} payload ${c.d}`)
        L(`   load:   ${JSON.stringify(s1)}`)
        L(`   reload: ${JSON.stringify(s2)}`)
        for (const [tag, s] of [['load', s1], ['reload', s2]]) {
          check(s.rootLen > 1000 && !s.recover, `[${vp}] ${c.name} ${tag}: app drawn (root ${s.rootLen} chars, no recovery screen)`)
          check(s.stored?.home === c.home && s.stored?.dest === c.dest, `[${vp}] ${c.name} ${tag}: plan home=${s.stored?.home} dest=${s.stored?.dest} (want ${c.home} / ${c.dest})`)
          if (!phone) check(c.expect.test(s.place ?? '') && /St\. Louis/.test(s.place ?? '') && (c.dest !== null || !/Bangkok/.test(s.place ?? '')), `[${vp}] ${c.name} ${tag}: "Where you live" reads ${c.expect} with home St. Louis${c.dest === null ? ', no Bangkok' : ''}`)
        }
        check(errors.length === 0, `[${vp}] ${c.name}: no page errors${errors.length ? ': ' + errors.join(' | ') : ''}`)
        await ctx.close()
      }
    }

    // ---- Check 4: forced render error, then Reset plan ----
    L('\n== Check 4: forced render error (harness only), Reset plan ==')
    for (const phone of [false, true]) {
      const vp = phone ? 'phone' : 'desktop'
      const ctx = await b.newContext({
        colorScheme: 'dark',
        ...(phone ? { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } : { viewport: { width: 1440, height: 900 } }),
      })
      await ctx.addInitScript(() => {
        if (!sessionStorage.getItem('seeded')) {
          sessionStorage.setItem('seeded', '1')
          localStorage.clear()
          localStorage.setItem('evelo:v2:entered', '1')
          // A stored plan the reset must clear, and saved portfolios it must keep.
          localStorage.setItem('evelo:v2', JSON.stringify({ theme: 'dark', inputs: { homeCityId: 'lisbon', destCityId: 'tokyo', portfolio: 1234567 } }))
          localStorage.setItem('evelo:v2:portfolios', '[{"name":"harness-kept","holdings":[]}]')
        }
        // Break drawing on the first page load of this session only: number formatting throws.
        if (!sessionStorage.getItem('broke')) {
          sessionStorage.setItem('broke', '1')
          const boom = () => { throw new Error('harness: forced render error') }
          Intl.NumberFormat.prototype.format = boom
          Number.prototype.toLocaleString = boom
          Number.prototype.toFixed = boom
        }
      })
      const p = await ctx.newPage()
      const errors = []
      watch(p, errors)
      await p.goto(`${base}#plan?p=${link('{"destCityId":"constructor"}')}`)
      await settle(p)
      const before = await p.evaluate(() => ({
        recoverText: document.querySelector('.app-recover')?.innerText ?? null,
        stored: localStorage.getItem('evelo:v2'),
        portfolios: localStorage.getItem('evelo:v2:portfolios'),
        hash: location.hash.slice(0, 30),
      }))
      await p.screenshot({ path: join(OUT, `recover-${vp}-dark.png`) })
      L(`[${vp}] before reset: ${JSON.stringify(before)}`)
      check(!!before.recoverText && /Something went wrong drawing this plan\./.test(before.recoverText) && /Reset plan/.test(before.recoverText), `[${vp}] recovery screen with "Reset plan" shown instead of a blank page`)
      check(errors.some((e) => /forced render error/.test(e)), `[${vp}] the forced error reached the console (so the boundary caught a real throw)`)
      await Promise.all([p.waitForEvent('load'), p.getByRole('button', { name: 'Reset plan' }).click()])
      await settle(p)
      const after = await p.evaluate(() => ({
        url: location.pathname + location.search + location.hash,
        recover: !!document.querySelector('.app-recover'),
        rootLen: document.getElementById('root').innerHTML.length,
        stored: localStorage.getItem('evelo:v2'),
        portfolios: localStorage.getItem('evelo:v2:portfolios'),
      }))
      await p.screenshot({ path: join(OUT, `after-reset-${vp}-dark.png`) })
      L(`[${vp}] after reset: ${JSON.stringify(after)}`)
      check(!after.recover && after.rootLen > 1000, `[${vp}] app is back after reset (no recovery screen)`)
      check(!/p=/.test(after.url), `[${vp}] share hash stripped (url ${after.url})`)
      // Re-run after review fix 3: reset keeps the theme fields, so the key may remain without the plan.
      const kept = after.stored === null ? null : JSON.parse(after.stored)
      check(!!before.stored && (kept === null || (!('inputs' in kept) && 'theme' in kept)), `[${vp}] stored plan cleared, theme kept (evelo:v2 before: present, after: ${after.stored})`)
      check(after.portfolios === before.portfolios, `[${vp}] saved portfolios kept`)
      await p.goto(`${base}#plan`)
      await settle(p)
      const plan = await state(p)
      await p.screenshot({ path: join(OUT, `after-reset-plan-${vp}-dark.png`) })
      L(`[${vp}] #plan after reset: ${JSON.stringify(plan)}`)
      check(!plan.recover && plan.rootLen > 1000, `[${vp}] #plan draws after reset with the default plan (stored ${JSON.stringify(plan.stored)}, place: ${plan.place})`)
      await ctx.close()
    }
  } finally {
    await b.close()
  }
})

L(`\n${fails ? fails + ' check(s) FAILED' : 'all browser checks passed'}`)
writeFileSync(join(OUT, 'run-product.txt'), '$ node docs/evidence/stage-1/verify.mjs   (after npm run build; serves dist via scripts/serve-preview.mjs)\n' + log.join('\n') + '\n')
process.exit(fails ? 1 : 0)
