// Independent stage-2 verifier: node v.cjs <base> <outdir>
const { chromium } = require('/home/jonah/repos/eVelo/node_modules/playwright-core')
const BASE = process.argv[2], OUT = process.argv[3]
let fails = 0
const log = (...a) => console.log(...a)
const ok = (c, m) => { if (!c) fails++; log(`${c ? 'PASS' : 'FAIL'}  ${m}`) }
const errs = []

async function ctx(b, o) {
  const c = await b.newContext(o); const p = await c.newPage()
  p.on('pageerror', (e) => errs.push('pageerror: ' + e.message))
  p.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.type() + ': ' + m.text()) })
  return [c, p]
}
async function openProfile(p, name, waitRank = true) {
  await p.goto(BASE + '#atlas')
  await p.waitForSelector('.pick__open', { timeout: 20000 })
  if (waitRank) await p.waitForFunction(() => !document.querySelector('.atlas.is-running') && document.querySelector('.pick__odds b'), null, { timeout: 60000 })
  const btn = p.locator(`.pick__open:text-is("${name}")`).first()
  await btn.scrollIntoViewIfNeeded(); await btn.click()
  await p.waitForSelector('.prof-sheet .prof', { timeout: 10000 })
  await p.waitForTimeout(1500)
}
// contrast helpers evaluated in page
const CONTRAST_FN = `
window.__rgb = (c) => { const cv = document.createElement('canvas'); cv.width = cv.height = 1; const x = cv.getContext('2d'); x.clearRect(0,0,1,1); x.fillStyle = '#000'; x.fillStyle = c; x.fillRect(0,0,1,1); const d = x.getImageData(0,0,1,1).data; return [d[0], d[1], d[2], d[3] / 255] }
window.__lum = ([r,g,b]) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4 }; return 0.2126*f(r) + 0.7152*f(g) + 0.0722*f(b) }
window.__cr = (a, b) => { const la = __lum(a), lb = __lum(b); return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05) }
window.__bgOf = (el, under) => { const layers = []; let e = el; while (e) { const c = __rgb(getComputedStyle(e).backgroundColor); if (c[3] > 0) { layers.push({ c, cls: e.className }); if (c[3] >= 0.999) break } e = e.parentElement } let base = layers.length && layers[layers.length-1].c[3] >= 0.999 ? layers.pop().c : (under || [255,255,255,1]); for (const l of layers.reverse()) base = [0,1,2].map((i) => l.c[i]*l.c[3] + base[i]*(1-l.c[3])).concat(1); return { c: base.map(Math.round), el: layers.map((l) => l.cls).join('>') || 'opaque', alpha: layers.map((l) => l.c[3].toFixed(2)).join(',') } }
`
async function contrast(p, scope, sels) {
  await p.addScriptTag({ content: CONTRAST_FN })
  return p.evaluate(({ scope, sels }) => sels.map((s) => {
    const el = document.querySelector(scope + ' ' + s); if (!el) return { s, missing: true }
    const fg = __rgb(getComputedStyle(el).color); const bw = __bgOf(el, [255,255,255,1]), bb = __bgOf(el, [0,0,0,1])
    const r1 = __cr(fg, bw.c), r2 = __cr(fg, bb.c)
    return { s, text: el.textContent.trim().slice(0, 40), fg: fg.join(','), bgOverWhite: bw.c.join(','), bgOverBlack: bb.c.join(','), layers: bw.el, alpha: bw.alpha, ratio: +Math.min(r1, r2).toFixed(2) }
  }), { scope, sels })
}

;(async () => {
  const b = await chromium.launch()

  // ---------- 1+2: desktop, both themes ----------
  for (const scheme of ['light', 'dark']) {
    const [c, p] = await ctx(b, { viewport: { width: 1440, height: 1000 }, colorScheme: scheme })
    await openProfile(p, 'Lisbon')
    const s = await p.evaluate(() => {
      const q = (x) => document.querySelector(x), r = (x) => q(x)?.getBoundingClientRect()
      const mosaic = q('.pgal__mosaic'), vis = (el) => !!el && el.offsetParent !== null && getComputedStyle(el).display !== 'none'
      const tiles = [...document.querySelectorAll('.pgal__mosaic .pgal__tile')]
      const big = tiles[0]?.getBoundingClientRect(), small = tiles.slice(1).map((t) => t.getBoundingClientRect())
      const imgs = [...document.querySelectorAll('.pgal__mosaic img')]
      return {
        mosaicVisible: vis(mosaic), coverVisible: vis(q('.pgal__cover')),
        tiles: tiles.length, leadFirst: tiles[0]?.classList.contains('is-lead'),
        bigArea: big && Math.round(big.width * big.height), smallAreas: small.map((x) => Math.round(x.width * x.height)),
        allLoaded: imgs.every((i) => i.complete && i.naturalWidth > 0),
        aboveLead: r('.pgal').bottom <= r('.prof__lead').top,
        credit: q('.pgal > .pgal__credit')?.textContent, creditVisible: vis(q('.pgal > .pgal__credit')),
        all: q('.pgal__all')?.textContent.trim(),
        badge: q('.pgal__mosaic .podds')?.innerText.replace(/\s+/g, ' '),
        badgeBig: q('.pgal__mosaic .podds__big')?.textContent, badgeVs: q('.pgal__mosaic .podds__vs')?.textContent,
        badgeTone: q('.pgal__mosaic .podds__big') && getComputedStyle(q('.pgal__mosaic .podds__big')).color,
        badgeBar: q('.pgal__mosaic .podds__bar i')?.style.width, badgeHome: q('.pgal__mosaic .podds__home')?.style.left,
        cardBig: q('.pplan__big')?.textContent, cardTone: q('.pplan__big') && getComputedStyle(q('.pplan__big')).color,
        cardSub: q('.pplan__sub')?.textContent, cardMark: q('.pplan__mark')?.style.left,
        badgeRect: r('.pgal__mosaic .podds'), leadRect: big,
        hscroll: document.documentElement.scrollWidth > innerWidth,
      }
    })
    log(scheme, JSON.stringify(s))
    ok(s.mosaicVisible && !s.coverVisible && s.tiles === 5 && s.leadFirst && s.smallAreas.every((a) => a < s.bigArea / 2) && s.allLoaded, `[${scheme}] mosaic visible: 5 tiles, first is-lead and largest, all images loaded`)
    ok(s.aboveLead, `[${scheme}] gallery sits above .prof__lead`)
    ok(s.creditVisible && /^Photos: .+ · .*CC.* · Wikimedia Commons$/.test(s.credit), `[${scheme}] credit line: ${s.credit}`)
    ok(s.all === 'All 5 photos', `[${scheme}] button: "${s.all}"`)
    ok(/^your plan here/i.test(s.badge) && /plan holds/i.test(s.badge), `[${scheme}] badge text: ${s.badge}`)
    ok(s.badgeBig.replace('%', '') === s.cardBig.replace('%', '').trim() && s.badgeTone === s.cardTone, `[${scheme}] badge % ${s.badgeBig} == card % ${s.cardBig}; colours ${s.badgeTone} == ${s.cardTone}`)
    ok(s.badgeVs && s.cardSub && s.cardSub.replace(/\s+/g, ' ').trim().includes(s.badgeVs.replace(/\s+/g, ' ').trim()) || (s.cardSub || '').replace(/\s+/g,' ').trim() === s.badgeVs.replace(/\s+/g,' ').trim(), `[${scheme}] badge "${s.badgeVs}" vs card sub "${s.cardSub}"`)
    ok(s.badgeHome && s.cardMark && parseFloat(s.badgeHome).toFixed(2) === parseFloat(s.cardMark).toFixed(2), `[${scheme}] home tick at ${s.badgeHome} == card mark ${s.cardMark}`)
    ok(!s.hscroll, `[${scheme}] no horizontal scroll at 1440`)
    const cr = await contrast(p, '.pgal__mosaic .podds', ['.podds__eyebrow', '.podds__big', '.podds__l', '.podds__vs', '.podds__vs b'])
    log(scheme, 'badge contrast', JSON.stringify(cr))
    for (const x of cr) ok(x.ratio >= 4.5 || (x.s === '.podds__big' && x.ratio >= 3), `[${scheme}] badge ${x.s} contrast ${x.ratio}:1 (worst of card over a white or black photo)`)
    const crb = await contrast(p, '.pgal', ['.pgal__all', '> .pgal__credit'])
    log(scheme, 'button/credit contrast', JSON.stringify(crb))
    await p.screenshot({ path: `${OUT}/lisbon-desktop-${scheme}.png` })
    await p.locator('.pgal').screenshot({ path: `${OUT}/lisbon-gallery-${scheme}.png` })

    // focus rings: tab through tiles and button
    if (true) {
      await p.locator('.pgal__mosaic .pgal__tile').first().focus()
      await p.keyboard.press('Shift+Tab'); await p.keyboard.press('Tab')
      const rings = []
      for (let i = 0; i < 6; i++) {
        rings.push(await p.evaluate(() => { const a = document.activeElement, cs = getComputedStyle(a); return { cls: a.className, fv: a.matches(':focus-visible'), outline: `${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor}`, offset: cs.outlineOffset, shadow: cs.boxShadow } }))
        if (i === 0) await p.locator('.pgal').screenshot({ path: `${OUT}/focus-tile-lead-${scheme}.png` })
        if (i === 5) await p.locator('.pgal').screenshot({ path: `${OUT}/focus-all-button-${scheme}.png` })
        await p.keyboard.press('Tab')
      }
      log(scheme, 'focus', JSON.stringify(rings))
      ok(rings.every((r) => r.fv && (r.outline.startsWith('solid') || r.outline.startsWith('auto')) && !r.outline.includes(' 0px')), `[${scheme}] keyboard focus ring on 5 tiles and the button`)
    }
    await c.close()
  }

  // ---------- 3: ranking skeleton ----------
  {
    const [c, p] = await ctx(b, { viewport: { width: 1440, height: 1000 } })
    await p.route('**/worker-*.js', () => {})
    await openProfile(p, 'Lisbon', false)
    const s = await p.evaluate(() => ({
      running: !!document.querySelector('.atlas.is-running'),
      skel: !!document.querySelector('.pgal__mosaic .podds .skeleton'), big: !!document.querySelector('.podds__big'),
      label: document.querySelector('.pgal__mosaic .podds')?.getAttribute('aria-label'),
      text: document.querySelector('.pgal__mosaic .podds')?.innerText,
      cardBig: document.querySelector('.pplan__big')?.textContent,
    }))
    log('ranking', JSON.stringify(s))
    ok(s.skel && !s.big && !/\d/.test(s.text) && !/\d/.test(s.label), `ranking state: skeleton, no number (label "${s.label}", card shows "${s.cardBig}")`)
    await p.locator('.pgal').screenshot({ path: `${OUT}/lisbon-gallery-ranking.png` })
    await p.locator('.pgal__mosaic .pgal__tile').first().click(); await p.waitForSelector('.pview'); await p.waitForTimeout(500)
    ok(await p.evaluate(() => !!document.querySelector('.ppill .skeleton') && !/\d/.test(document.querySelector('.ppill').innerText)), 'ranking state: pill also a skeleton')
    await c.close()
  }

  // ---------- 4+5: full-size view ----------
  {
    const [c, p] = await ctx(b, { viewport: { width: 1440, height: 1000 }, colorScheme: 'light' })
    await openProfile(p, 'Lisbon')
    const title = () => p.evaluate(() => document.querySelector('.pview__title')?.textContent)
    const state = () => p.evaluate(() => ({ view: !!document.querySelector('.pview'), sheet: !!document.querySelector('.prof-sheet .prof'), focus: document.activeElement?.getAttribute('aria-label') || document.activeElement?.textContent, focusCls: document.activeElement?.className }))
    for (let i = 0; i < 5; i++) {
      await p.locator('.pgal__mosaic .pgal__tile').nth(i).click(); await p.waitForSelector('.pview'); await p.waitForTimeout(350)
      const t = await title()
      ok(t.includes(`${i + 1} of 5`), `tile ${i + 1} opens at "${t}"`)
      await p.keyboard.press('Escape'); await p.waitForTimeout(600)
      const st = await state()
      ok(!st.view && st.sheet && st.focusCls.includes('pgal__tile') && st.focus.startsWith(`Open photo ${i + 1} of 5`), `tile ${i + 1}: Esc closes view only, sheet open, focus back on "${st.focus}"`)
    }
    await p.locator('.pgal__all').click(); await p.waitForSelector('.pview'); await p.waitForTimeout(350)
    ok((await title()).includes('1 of 5'), `"All 5 photos" opens at "${await title()}"`)
    const seq = []
    for (const k of ['ArrowRight', 'ArrowRight', 'ArrowLeft', 'ArrowLeft', 'ArrowLeft']) { await p.keyboard.press(k); await p.waitForTimeout(250); seq.push((await title()).match(/(\d) of/)[1]) }
    ok(seq.join('') === '23215', `keys → → ← ← ← go ${seq.join(',')} (expect 2,3,2,1,5 wrap)`)
    await p.click('.pview__next'); await p.waitForTimeout(250); const n1 = await title()
    await p.click('.pview__next'); await p.waitForTimeout(250); const n2 = await title()
    await p.click('.pview__prev'); await p.waitForTimeout(250); const n3 = await title()
    ok(n1.includes('1 of 5') && n2.includes('2 of 5') && n3.includes('1 of 5'), `arrow buttons: ${n1} / ${n2} / ${n3}`)
    await p.keyboard.press('ArrowRight'); await p.keyboard.press('ArrowRight'); await p.waitForTimeout(400)
    const v = await p.evaluate(() => {
      const q = (x) => document.querySelector(x)
      const img = q('.pview__frame img'), fr = img.getBoundingClientRect()
      return { role: q('.pview').getAttribute('role'), modal: q('.pview').getAttribute('aria-modal'), title: q('.pview__title').textContent,
        cap: q('.pview__caption')?.textContent, credit: q('.pview__credit')?.textContent,
        links: [...document.querySelectorAll('.pview__credit a')].map((a) => ({ t: a.textContent, href: a.href, target: a.target, rel: a.rel })),
        pill: q('.ppill')?.innerText.replace(/\s+/g, ' '), pillBig: q('.ppill__big')?.textContent, pillVs: q('.ppill__vs')?.textContent,
        cardBig: q('.pplan__big')?.textContent, imgW: Math.round(fr.width), imgH: Math.round(fr.height), natural: img.naturalWidth, alt: img.alt }
    })
    log('viewer', JSON.stringify(v))
    ok(v.role === 'dialog' && v.modal === 'true', 'view is role=dialog aria-modal')
    ok(!!v.cap && v.cap.length > 5, `caption: "${v.cap}"`)
    ok(/^Photo: \S.+ · /.test(v.credit), `author in credit: "${v.credit}"`)
    ok(v.links.some((l) => /creativecommons\.org\/licenses\//.test(l.href)) && v.links.some((l) => /^https:\/\/commons\.wikimedia\.org\/wiki\/File:/.test(l.href)), `licence link + Commons link: ${v.links.map((l) => l.href).join(' , ')}`)
    ok(v.pillBig && v.pillBig.replace('%', '') === v.cardBig.replace('%', '').trim() && /[+−]?\d+ pts vs \d+% in \S+|same vs/.test(v.pillVs), `odds pill "${v.pill}" matches card ${v.cardBig}`)
    ok(v.natural > 0 && v.imgW > 600, `image shown ${v.imgW}x${v.imgH} (natural ${v.natural})`)
    await p.screenshot({ path: `${OUT}/viewer-desktop.png` })
    // contrast of view texts
    const crv = await contrast(p, '.pview', ['.pview__title', '.pview__caption', '.pview__credit', '.pview__credit a', '.ppill__l', '.ppill__big', '.ppill__vs', '.pview__hint'])
    log('viewer contrast', JSON.stringify(crv))
    for (const x of crv) ok(x.ratio >= 4.5, `view ${x.s} contrast ${x.ratio}:1`)
    // focus visible on viewer buttons
    await p.focus('.pview__next'); await p.keyboard.press('Shift+Tab'); await p.keyboard.press('Tab')
    const fr = await p.evaluate(() => { const a = document.activeElement, cs = getComputedStyle(a); return { cls: a.className, fv: a.matches(':focus-visible'), outline: `${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor}` } })
    log('viewer focus', JSON.stringify(fr)); ok(fr.fv && !fr.outline.startsWith('none'), `viewer button focus ring: ${fr.outline}`)
    await p.screenshot({ path: `${OUT}/viewer-focus-next.png` })
    // Tab trap
    for (let i = 0; i < 9; i++) await p.keyboard.press('Tab')
    ok(await p.evaluate(() => document.querySelector('.pview').contains(document.activeElement)), 'Tab x9 stays inside the view')
    // Esc twice: first closes view, second closes the sheet (proves only-the-view)
    await p.keyboard.press('Escape'); await p.waitForTimeout(600)
    const st = await state(); ok(!st.view && st.sheet && st.focus.trim() === 'All 5 photos', `All-button Esc: view closed, sheet open, focus "${st.focus}" (opener was the button)`)
    await c.close()
  }

  // ---------- 4: swipe in the full-size view (touch) ----------
  {
    const [c, p] = await ctx(b, { viewport: { width: 1024, height: 800 }, hasTouch: true, isMobile: false })
    await openProfile(p, 'Lisbon')
    await p.locator('.pgal__mosaic .pgal__tile').nth(1).tap(); await p.waitForSelector('.pview'); await p.waitForTimeout(400)
    const cdp = await c.newCDPSession(p)
    const swipe = async (x0, x1, y0 = 400, y1 = 400) => {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x0, y: y0 }] })
      for (let k = 1; k <= 8; k++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x0 + (x1 - x0) * k / 8, y: y0 + (y1 - y0) * k / 8 }] })
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await p.waitForTimeout(400)
    }
    const t = () => p.evaluate(() => document.querySelector('.pview__title')?.textContent)
    const t0 = await t(); await swipe(700, 300); const t1 = await t(); await swipe(300, 700); const t2 = await t(); await swipe(500, 510, 200, 600); const t3 = await t()
    log('swipe', t0, '|', t1, '|', t2, '|', t3)
    ok(t0.includes('2 of 5') && t1.includes('3 of 5') && t2.includes('2 of 5') && t3.includes('2 of 5'), `swipe left → 3, swipe right → 2, vertical swipe stays (${[t0, t1, t2, t3].map((x) => x.match(/\d of/)[0]).join(', ')})`)
    await c.close()
  }

  // ---------- 6: phone 390 ----------
  for (const scheme of ['light', 'dark']) {
    const [c, p] = await ctx(b, { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true, colorScheme: scheme })
    await openProfile(p, 'Lisbon')
    const s = await p.evaluate(() => {
      const q = (x) => document.querySelector(x), vis = (el) => !!el && el.offsetParent !== null && getComputedStyle(el).display !== 'none'
      const tr = q('.pgal__track'), cover = q('.pgal__cover').getBoundingClientRect()
      return { mosaic: vis(q('.pgal__mosaic')), cover: vis(q('.pgal__cover')), slides: document.querySelectorAll('.pgal__track .pgal__slide').length,
        dots: document.querySelectorAll('.pgal__dots button').length, count: q('.pgal__count')?.textContent, badge: vis(q('.pgal__cover .podds')) && q('.pgal__cover .podds').innerText.replace(/\s+/g, ' '),
        trackOverflow: tr.scrollWidth > tr.clientWidth, snap: getComputedStyle(tr).scrollSnapType, coverW: Math.round(cover.width),
        docW: document.documentElement.scrollWidth, bodyW: document.body.scrollWidth, iw: innerWidth,
        sheetOverflow: (() => { const sh = q('.prof-sheet'); const out = []; for (const el of sh.querySelectorAll('*')) { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); if (cs.visibility === 'hidden' || +cs.opacity === 0) continue; if (r.width && (r.right > innerWidth + 1 || r.left < -1) && !el.closest('.pgal__track')) out.push(el.className + ':' + Math.round(r.left) + '-' + Math.round(r.right)) } return out.slice(0, 8) })(),
        dotSize: (() => { const r = q('.pgal__dots button').getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height)] })() }
    })
    log('phone', scheme, JSON.stringify(s))
    ok(!s.mosaic && s.cover && s.slides === 5 && s.dots === 5 && s.count.replace(/\s/g, '') === '1/5' && /your plan here/i.test(s.badge), `[phone ${scheme}] one cover, 5 slides, 5 dots, count ${s.count}, badge "${s.badge}"`)
    ok(s.docW <= s.iw && s.bodyW <= s.iw, `[phone ${scheme}] no sideways page scroll (doc ${s.docW}, body ${s.bodyW}, vw ${s.iw})`)
    ok(s.sheetOverflow.length === 0, `[phone ${scheme}] nothing in the sheet sticks out past 390: ${JSON.stringify(s.sheetOverflow)}`)
    await p.screenshot({ path: `${OUT}/lisbon-phone-${scheme}.png` })
    if (scheme === 'light') {
      // touch swipe the track
      const box = await p.locator('.pgal__track').boundingBox()
      const cdp = await c.newCDPSession(p)
      const y = box.y + box.height / 2
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 330, y }] })
      for (let k = 1; k <= 10; k++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 330 - 26 * k, y }] })
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await p.waitForTimeout(1200)
      const a = await p.evaluate(() => ({ count: document.querySelector('.pgal__count').textContent, sl: document.querySelector('.pgal__track').scrollLeft, on: [...document.querySelectorAll('.pgal__dots button')].findIndex((d) => d.classList.contains('is-on')), cap: document.querySelector('.pgal__cap span')?.textContent, docW: document.documentElement.scrollWidth, sx: scrollX }))
      log('phone swipe', JSON.stringify(a))
      ok(a.count.replace(/\s/g, '') === '2/5' && a.on === 1 && a.sx === 0, `[phone] swipe moves the cover to 2/5, dot 2 on, page not scrolled sideways (scrollX ${a.sx})`)
      await p.locator('.pgal__dots button').nth(3).tap(); await p.waitForTimeout(1200)
      const d = await p.evaluate(() => document.querySelector('.pgal__count').textContent)
      ok(d.replace(/\s/g, '') === '4/5', `[phone] dot 4 → ${d}`)
      await p.screenshot({ path: `${OUT}/lisbon-phone-slide4.png` })
      await p.locator('.pgal__track .pgal__slide').nth(3).tap(); await p.waitForSelector('.pview'); await p.waitForTimeout(500)
      const vt = await p.evaluate(() => ({ t: document.querySelector('.pview__title').textContent, sw: document.documentElement.scrollWidth, pill: document.querySelector('.ppill')?.getBoundingClientRect().right, close: document.querySelector('.pview__top .pview__btn')?.getBoundingClientRect().right }))
      ok(vt.t.includes('4 of 5'), `[phone] tapping the cover opens the view at ${vt.t}`)
      ok(vt.pill <= 390 && vt.close <= 390, `[phone] view top bar fits (pill right ${Math.round(vt.pill)}, close right ${Math.round(vt.close)})`)
      await p.screenshot({ path: `${OUT}/viewer-phone.png` })
      const crp = await contrast(p, '.pview', ['.ppill__big', '.ppill__vs', '.pview__credit'])
      log('phone viewer contrast', JSON.stringify(crp))
      await p.keyboard.press('Escape'); await p.waitForTimeout(500)
    }
    const crc = await contrast(p, '.pgal__cover .podds', ['.podds__eyebrow', '.podds__big', '.podds__l', '.podds__vs'])
    log('phone badge contrast', scheme, JSON.stringify(crc))
    for (const x of crc) if (!x.missing) ok(x.ratio >= 4.5 || (x.s === '.podds__big' && x.ratio >= 3), `[phone ${scheme}] compact badge ${x.s} contrast ${x.ratio}:1`)
    await c.close()
  }

  // ---------- 8: reduced motion ----------
  {
    const [c, p] = await ctx(b, { viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' })
    await openProfile(p, 'Lisbon')
    const s = await p.evaluate(() => {
      const cs = (x) => getComputedStyle(document.querySelector(x))
      return { tileImg: cs('.pgal__mosaic .pgal__tile img').transitionDuration + ' ' + cs('.pgal__mosaic .pgal__tile img').transitionProperty,
        dot: cs('.pgal__dots i').transitionDuration, track: cs('.pgal__track').scrollBehavior, bar: document.querySelector('.pgal__mosaic .podds__bar i').style.width }
    })
    // hover a tile: no zoom
    await p.hover('.pgal__mosaic .pgal__tile.is-lead'); await p.waitForTimeout(100)
    const tf = await p.evaluate(() => getComputedStyle(document.querySelector('.pgal__mosaic .pgal__tile.is-lead img')).transform)
    // open view, sample opacity right away
    await p.evaluate(() => { window.__ops = []; const tick = () => { const v = document.querySelector('.pview'); if (v) window.__ops.push(getComputedStyle(v).opacity); if (window.__ops.length < 30) requestAnimationFrame(tick) }; requestAnimationFrame(tick) })
    await p.locator('.pgal__mosaic .pgal__tile').first().click()
    await p.waitForSelector('.pview')
    await p.waitForTimeout(600); const first = await p.evaluate(() => [getComputedStyle(document.querySelector('.pview')).opacity, window.__ops.slice(0, 12)])
    await p.keyboard.press('ArrowRight')
    const imgs = await p.evaluate(() => new Promise((res) => requestAnimationFrame(() => res([...document.querySelectorAll('.pview__frame img')].map((i) => getComputedStyle(i).opacity)))))
    await p.keyboard.press('Escape')
    const gone = await p.evaluate(() => new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(() => res(!document.querySelector('.pview'))))))
    log('reduced', JSON.stringify({ s, tf, first, imgs, gone }))
    ok(parseFloat(s.tileImg) < 0.001 || /none/.test(s.tileImg), `[reduced] tile image transition: ${s.tileImg}`)
    ok(tf === 'none' || tf === 'matrix(1, 0, 0, 1, 0, 0)', `[reduced] no hover zoom (transform ${tf})`)
    ok(parseFloat(s.dot) < 0.001 && s.track === 'auto', `[reduced] dots transition ${s.dot}, track scroll-behavior ${s.track}`)
    ok(first[0] === '1' && first[1].every((o) => o === '0' || o === '1') && first[1].filter((o) => o === '0').length <= 1, `[reduced] view has no fade: no in-between opacity on any frame, at most the mount frame at 0 (${first[0]}; samples ${first[1].join(',')})`)
    ok(imgs.length === 1 && imgs[0] === '1', `[reduced] photo swap has no crossfade (img opacities next frame: ${imgs.join(',')})`)
    ok(gone, '[reduced] Esc removes the view within two frames (no exit fade)')
    await c.close()
  }
  // Same probes without reduced motion, to show the probes can detect animation
  {
    const [c, p] = await ctx(b, { viewport: { width: 1440, height: 1000 } })
    await openProfile(p, 'Lisbon')
    await p.evaluate(() => { window.__ops = []; const tick = () => { const v = document.querySelector('.pview'); if (v) window.__ops.push(getComputedStyle(v).opacity); if (window.__ops.length < 30) requestAnimationFrame(tick) }; requestAnimationFrame(tick) })
    await p.locator('.pgal__mosaic .pgal__tile').first().click(); await p.waitForSelector('.pview'); await p.waitForTimeout(600)
    const first = await p.evaluate(() => window.__ops.slice(0, 12))
    await p.keyboard.press('ArrowRight')
    const imgs = await p.evaluate(() => new Promise((res) => requestAnimationFrame(() => res([...document.querySelectorAll('.pview__frame img')].map((i) => getComputedStyle(i).opacity)))))
    log('control (motion on)', JSON.stringify({ first, imgs }))
    ok(first.some((o) => o !== '1' && o !== '0') && imgs.length > 1, '[control] with motion on, the same probes do see a fade (probe is sensitive)')
    await c.close()
  }

  log('\nconsole errors/warnings:', errs.length ? '\n  ' + [...new Set(errs)].join('\n  ') : 'none')
  log(`\n${fails} failing`)
  await b.close()
  process.exit(fails ? 1 : 0)
})()
