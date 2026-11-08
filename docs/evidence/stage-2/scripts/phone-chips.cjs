// Check 4 in a fresh touch page per theme: chip row scrolls inside the card, 44px chips on a coarse
// pointer, no page-level horizontal scroll, rows and tiers still work. Logs the pointer media after every step.
const { chromium } = require('/home/jonah/repos/eVelo/node_modules/playwright-core');
const OUT = '/home/jonah/repos/eVelo-v2/docs/evidence/stage-2';
const BASE = process.env.BASE || 'http://localhost:4792/';
const log = []; const L = (...a) => { const s = a.join(' '); log.push(s); console.log(s); };
let fails = 0; const ok = (c, m) => { L(c ? 'PASS' : 'FAIL', m); if (!c) fails++; };
const ALL = 'section[aria-label="All cities"]';
(async () => {
  for (const scheme of ['light', 'dark']) {
    const name = `phone-${scheme}`;
    L(`\n===== ${name} (390x844, isMobile, hasTouch, fresh page) =====`);
    const b = await chromium.launch();
    const p = await (await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, colorScheme: scheme })).newPage();
    const errs = []; p.on('console', m => m.type() === 'error' && errs.push(m.text())); p.on('pageerror', e => errs.push(String(e)));
    const media = async step => { const c = await p.evaluate(() => matchMedia('(pointer: coarse)').matches); L(`  [${step}] pointer coarse: ${c}`); return c; };
    const geo = () => p.evaluate(() => {
      const s = document.querySelector('.lchips'), sr = s.getBoundingClientRect(), card = s.closest('.card') || s.closest('.clist');
      const cr = card.getBoundingClientRect();
      return { sw: s.scrollWidth, cw: s.clientWidth, sl: s.scrollLeft, ox: getComputedStyle(s).overflowX, row: [sr.left, sr.right].map(Math.round), card: [cr.left, cr.right].map(Math.round), cardCls: card.className,
        chips: [...s.querySelectorAll('.lchip')].map(e => { const r = e.getBoundingClientRect(); return { t: e.querySelector('.rchip__label').innerText, h: r.height, w: Math.round(r.width), l: Math.round(r.left), r: Math.round(r.right) }; }),
        page: [document.documentElement.scrollWidth, document.documentElement.clientWidth] };
    });
    const chip = t => p.locator('.lchips .lchip', { has: p.locator('.rchip__label', { hasText: new RegExp(`^${t}$`) }) });
    await p.goto(BASE + '#atlas'); await p.waitForSelector('.ctier', { timeout: 60000 }); await p.waitForTimeout(2500);
    await media('load');
    await p.locator('.clist__tools').scrollIntoViewIfNeeded(); await p.waitForTimeout(300);
    let g = await geo();
    L(`  row ${g.row.join('..')} inside card ${g.card.join('..')} (${g.cardCls}); scrollWidth ${g.sw} clientWidth ${g.cw} overflow-x ${g.ox}; page ${g.page.join(' / ')}`);
    L(`  chips: ${g.chips.map(c => `${c.t} ${c.h}x${c.w} @${c.l}..${c.r}`).join(' | ')}`);
    ok(g.ox === 'auto' && g.sw > g.cw, `${name}: chips overflow their row and scroll inside it (scrollWidth ${g.sw} > clientWidth ${g.cw})`);
    ok(g.row[0] >= g.card[0] && g.row[1] <= g.card[1], `${name}: the scrolling row is within the card's box (${g.row.join('..')} in ${g.card.join('..')})`);
    ok(g.chips.every(c => c.h >= 44 && c.w >= 44), `${name}: every chip is >=44px tall and wide on touch (${g.chips.map(c => c.h).join('/')})`);
    ok(g.page[0] <= g.page[1], `${name}: no page-level horizontal scroll at rest (${g.page.join(' <= ')})`);
    await p.locator('.clist__tools').screenshot({ path: `${OUT}/${name}-chips-44-rest.png` });
    // swipe the row horizontally with a real touch drag
    const box = await p.locator('.lchips').boundingBox();
    const cdp = await p.context().newCDPSession(p);
    const y = box.y + box.height / 2;
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 330, y }] });
    for (let i = 1; i <= 12; i++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 330 - i * 25, y }] });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await p.waitForTimeout(800);
    await media('after swipe');
    g = await geo();
    L(`  after swipe: row scrollLeft ${g.sl}; page scrollX ${await p.evaluate(() => scrollX)}; page ${g.page.join(' / ')}`);
    ok(g.sl > 0 && (await p.evaluate(() => scrollX)) === 0, `${name}: a horizontal swipe scrolls the chip row (scrollLeft ${g.sl}), not the page`);
    if (g.sl < g.sw - g.cw) { await p.locator('.lchips').evaluate(e => { e.scrollLeft = e.scrollWidth; }); await p.waitForTimeout(400); }
    await p.locator('.clist__tools').screenshot({ path: `${OUT}/${name}-chips-44-scrolled.png` });
    g = await geo();
    const other = g.chips.find(c => c.t === 'Other');
    ok(other.r <= 390 && other.l >= 0, `${name}: scrolled to the end, Other is fully on screen (${other.l}..${other.r})`);
    await chip('Other').tap(); await p.waitForTimeout(1200);
    await media('after tapping Other');
    const on = await p.$$eval('[aria-pressed="true"] .rchip__label', e => e.map(x => x.innerText));
    ok(on.length === 2 && on.every(x => x === 'Other'), `${name}: tapping Other selects it on list and map (${on.join(', ')})`);
    // tiers and rows still work
    await chip('Europe').scrollIntoViewIfNeeded(); await chip('Europe').tap(); await p.waitForTimeout(1200);
    const nT = await p.locator(`${ALL} .ctier`).count();
    await p.locator(`${ALL} .ctier`).nth(1).locator('.ctier__btn').tap(); await p.waitForTimeout(500);
    const openN = await p.locator(`${ALL} .ctier.is-open`).count();
    ok(nT > 1 && openN === 2, `${name}: Europe has ${nT} tiers; tapping the 2nd header opens it (${openN} open)`);
    const row = p.locator(`${ALL} .ctier`).nth(1).locator('.crow').filter({ hasNot: p.locator('.crow__tag') }).first();
    const rn = await row.locator('.crow__name b').innerText();
    await row.scrollIntoViewIfNeeded(); await row.locator('.crow__cmp').tap(); await p.waitForTimeout(600);
    ok(await row.locator('input[type=checkbox]').isChecked(), `${name}: compare tick on ${rn} checks it`);
    await row.locator('.crow__cmp').tap(); await p.waitForTimeout(500);
    await row.locator('.crow__main').tap(); await p.waitForTimeout(2500);
    const dest = await p.$$eval(`${ALL} .crow.is-dest .crow__name b`, e => e.map(x => x.innerText));
    ok(dest.includes(rn), `${name}: tapping ${rn} makes it the destination`);
    await media('after row taps');
    const pg = await p.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
    ok(pg[0] <= pg[1], `${name}: no page-level horizontal scroll after the interactions (${pg.join(' <= ')})`);
    await p.locator('.clist').screenshot({ path: `${OUT}/${name}-chips-europe-list.png` });
    // which harness action drops the touch emulation? (fill)
    await p.fill('input.search__input', 'an'); await p.waitForTimeout(800);
    await media('after page.fill (diagnostic)');
    ok(errs.length === 0, `${name}: no console errors` + (errs.length ? ': ' + errs.join(' / ') : ''));
    await b.close();
  }
  L(`\nTOTAL FAILS: ${fails}`);
  require('fs').writeFileSync(`${OUT}/phone-chips.txt`, `$ BASE=${BASE} node scripts/phone-chips.cjs   (playwright-core chromium, vite preview of npm run build, #atlas)\n` + log.join('\n') + '\n');
})();
