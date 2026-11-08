const { chromium } = require('/home/jonah/repos/eVelo/node_modules/playwright-core')
const sharp = require('/home/jonah/repos/eVelo-v2/node_modules/sharp')
const OUT = process.argv[2]
const SITES = { head: 'http://localhost:4232/', now: 'http://localhost:4231/' }
const norm = (h) => h.replace(/-[A-Za-z0-9_-]{8}\.(js|css|webp|svg|png)/g, '-HASH.$1').replace(/:r[0-9a-z]+:|«r[0-9a-z]+»|_r_[0-9a-z]+_/g, 'ID')
;(async () => {
  const b = await chromium.launch(); let fails = 0
  for (const [vp, w, h] of [['desktop', 1440, 1000], ['phone', 390, 844]]) for (const scheme of ['light', 'dark']) {
    const got = {}
    for (const [k, base] of Object.entries(SITES)) {
      const c = await b.newContext({ viewport: { width: w, height: h }, colorScheme: scheme, reducedMotion: 'reduce', ...(vp === 'phone' ? { hasTouch: true, isMobile: true } : {}) })
      const p = await c.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message))
      await p.goto(base + '#atlas')
      await p.waitForFunction(() => !document.querySelector('.atlas.is-running') && document.querySelector('.pick__odds b'), null, { timeout: 60000 })
      await p.locator('.pick__open:text-is("Paphos")').first().click()
      await p.waitForSelector('.prof-sheet .prof'); await p.waitForTimeout(1500)
      const html = await p.evaluate(() => document.querySelector('.prof-sheet').outerHTML)
      const info = await p.evaluate(() => ({ pgal: !!document.querySelector('.pgal'), firstChild: document.querySelector('.prof-sheet .prof')?.firstElementChild?.className, sw: document.documentElement.scrollWidth }))
      const shot = await p.screenshot({ path: `${OUT}/paphos-${vp}-${scheme}-${k}.png` })
      const full = await p.locator('.prof-sheet').screenshot({ path: `/tmp/claude-1000/-home-jonah-repos-eVelo-v2/9fb17dce-697c-43fb-b2f4-989e3e046b71/scratchpad/verify2/sheet-${vp}-${scheme}-${k}.png` })
      got[k] = { html: norm(html), info, shot, errs }
      await c.close()
    }
    const sameHtml = got.head.html === got.now.html
    const [a, bb] = await Promise.all([sharp(got.head.shot).raw().toBuffer({ resolveWithObject: true }), sharp(got.now.shot).raw().toBuffer({ resolveWithObject: true })])
    let diff = 0; for (let i = 0; i < a.data.length; i += a.info.channels) if (Math.abs(a.data[i] - bb.data[i]) + Math.abs(a.data[i + 1] - bb.data[i + 1]) + Math.abs(a.data[i + 2] - bb.data[i + 2]) > 6) diff++
    const ok = sameHtml && !got.now.info.pgal && diff === 0 && !got.now.errs.length
    if (!ok) fails++
    console.log(`${ok ? 'PASS' : 'FAIL'}  paphos ${vp} ${scheme}: sheet HTML identical to HEAD=${sameHtml} (len ${got.head.html.length}/${got.now.html.length}), .pgal present=${got.now.info.pgal}, differing pixels=${diff} of ${a.info.width * a.info.height}, errors=${got.now.errs.length}`)
    if (!sameHtml) { let i = 0; while (got.head.html[i] === got.now.html[i]) i++; console.log("   first diff at", i, JSON.stringify(got.head.html.slice(0, i + 60)), "|", JSON.stringify(got.now.html.slice(0, i + 60))) }
  }
  await b.close(); console.log(`${fails} failing`)
})()
