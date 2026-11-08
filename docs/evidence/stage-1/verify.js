const { chromium } = require('playwright');
const OUT = process.argv[2], BASE = process.argv[3] || 'http://localhost:4173/';
const log = []; const L = (...a) => { const s = a.join(' '); log.push(s); console.log(s) };
const errors = [];
async function ctxFor(b, { theme, home, phone, touch, width }) {
  const ctx = await b.newContext(phone
    ? { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }
    : { viewport: { width: width || 1440, height: 900 }, hasTouch: !!touch });
  await ctx.addInitScript(([theme, home]) => {
    if (sessionStorage.getItem('seeded')) return; sessionStorage.setItem('seeded', '1');
    localStorage.clear();
    localStorage.setItem('evelo:v2:entered', '1');
    const inputs = home ? { homeCityId: home, destCityId: 'bangkok' } : undefined;
    localStorage.setItem('evelo:v2', JSON.stringify(inputs ? { theme, inputs } : { theme }));
  }, [theme, home]);
  return ctx;
}
async function open(ctx, tag) {
  const p = await ctx.newPage();
  p.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errors.push(`[${tag}] ${m.type()}: ${m.text()}`) });
  p.on('pageerror', e => errors.push(`[${tag}] pageerror: ${e.message}`));
  p.on('request', r => { if (r.url().includes('photo-assets')) errors.push(`[${tag}] REQUEST photo-assets: ${r.url()}`) });
  await p.goto(BASE + '#atlas');
  await p.waitForSelector('.crow', { timeout: 60000 });
  await p.waitForSelector('.wmap__svg g[data-id]', { timeout: 60000 });
  await p.waitForTimeout(2500);
  return p;
}
async function hscroll(p, tag) {
  const r = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth }));
  L(`  [${tag}] horizontal scroll: scrollWidth=${r.sw} innerWidth=${r.iw} -> ${r.sw > r.iw ? 'OVERFLOW' : 'ok'}`);
}
async function rowFor(p, name) {
  await p.fill('.search__input', name); await p.waitForTimeout(600);
  return p.locator('.crow', { hasText: name }).first();
}
async function sheetInfo(p) {
  const d = p.locator('[role=dialog]'); await d.waitFor(); await p.waitForTimeout(1200);
  return d.evaluate(el => ({
    title: el.querySelector('h2, .sheet__title')?.textContent?.trim(),
    eyebrow: el.querySelector('.prof__eyebrow')?.textContent?.trim(),
    imgs: [...el.querySelectorAll('.pgal__mosaic img')].length,
    loaded: [...el.querySelectorAll('.pgal__mosaic img')].filter(i => i.complete && i.naturalWidth > 0).length,
    srcs: [...el.querySelectorAll('.pgal__mosaic img')].map(i => i.getAttribute('src')),
    badge: el.querySelector('.podds')?.getAttribute('aria-label'),
    badgeText: el.querySelector('.podds')?.textContent?.replace(/\s+/g, ' ').trim(),
  }));
}
async function closeSheet(p) { await p.keyboard.press('Escape'); await p.waitForTimeout(600) }
async function dotXY(p, id) {
  return p.evaluate((id) => {
    const g = document.querySelector(`.wmap__svg g[data-id="${id}"]`); if (!g) return null;
    const svg = g.ownerSVGElement.getBoundingClientRect(); const m = g.transform.baseVal.consolidate().matrix;
    return { x: svg.left + m.e, y: svg.top + m.f };
  }, id);
}
async function destName(p) { return p.evaluate(() => [...document.querySelectorAll('*')].find(e => e.textContent?.trim() === 'Your destination')?.parentElement?.textContent?.replace(/\s+/g,' ').slice(0,80)) }

(async () => {
  const b = await chromium.launch();
  for (const theme of ['light', 'dark']) {
    // ---- Desktop, mouse
    L(`== desktop 1440 ${theme} (home St. Louis)`);
    let ctx = await ctxFor(b, { theme }); let p = await open(ctx, `desk-${theme}`);
    await p.evaluate(() => scrollTo(0, 0)); await hscroll(p, 'atlas');
    for (const [name, id] of [['Tokyo', 'tokyo'], ['Austin', 'austin'], ['Lisbon', 'lisbon'], ['Seoul', 'seoul']]) {
      const row = await rowFor(p, name);
      const chips = await row.evaluate(r => [...r.querySelectorAll('.pickbadge')].map(c => `${c.textContent.trim()} [${c.getAttribute('aria-label')}]`));
      L(`  row ${name}: chips=${JSON.stringify(chips)}`);
      await row.scrollIntoViewIfNeeded(); await row.screenshot({ path: `${OUT}/row-${id}-desktop-${theme}.png` });
      const chip = row.locator('.pickbadge');
      if (await chip.count()) {
        await chip.first().click();
        const s = await sheetInfo(p); L(`  sheet from ${name} chip: ${JSON.stringify(s)}`);
        await p.screenshot({ path: `${OUT}/sheet-${id}-desktop-${theme}.png` }); await hscroll(p, `sheet ${name}`);
        await closeSheet(p);
      }
    }
    await p.fill('.search__input', '');
    // top picks contains?
    const tp = await p.evaluate(() => { const t = document.querySelector('.atlas__picks'); return { tokyo: /Tokyo/.test(t.textContent), austin: /Austin/.test(t.textContent) } });
    await p.locator('.picks__more .chip-btn').click().catch(() => {}); await p.waitForTimeout(500);
    const tp2 = await p.evaluate(() => { const t = document.querySelector('.atlas__picks'); return { tokyo: /Tokyo/.test(t.textContent), austin: /Austin/.test(t.textContent), items: t.querySelectorAll('.pick, li').length } });
    L(`  top picks contains (collapsed) ${JSON.stringify(tp)}; (expanded "all") ${JSON.stringify(tp2)}`);
    // map hover
    await p.locator('.wmap').scrollIntoViewIfNeeded();
    for (const id of ['tokyo', 'austin', 'lisbon', 'seoul']) {
      await p.mouse.move(5, 5); await p.waitForTimeout(500);
      const xy = await dotXY(p, id); await p.mouse.move(xy.x, xy.y); await p.waitForTimeout(700);
      const card = await p.evaluate(() => { const c = document.querySelector('.city-card'); return c && { text: c.querySelector('.city-card__foot')?.textContent, name: c.textContent.slice(0, 40), link: !!c.querySelector('.city-card__profile') } });
      L(`  hover ${id}: ${JSON.stringify(card)}`);
      if (id !== 'seoul') await p.locator('.city-card').screenshot({ path: `${OUT}/card-hover-${id}-desktop-${theme}.png` }).catch(e => L('   shot fail ' + e.message.slice(0, 80)));
      if (id === 'tokyo' || id === 'lisbon') {
        const before = await destName(p);
        await p.locator('.city-card__profile').click();
        const s = await sheetInfo(p); L(`  hover ${id} -> View profile: sheet title=${s.title} eyebrow=${s.eyebrow} imgs=${s.loaded}/${s.imgs}`);
        await closeSheet(p);
        L(`   destination before="${before}" after="${await destName(p)}"`);
      }
    }
    await ctx.close();

    // ---- Desktop-width touch (tapped floating card)
    L(`== touch 1024 ${theme}`);
    ctx = await ctxFor(b, { theme, touch: true, width: 1024 }); p = await open(ctx, `tab-${theme}`);
    await p.locator('.wmap').scrollIntoViewIfNeeded();
    let xy = await dotXY(p, 'tokyo'); await p.touchscreen.tap(xy.x, xy.y); await p.waitForTimeout(800);
    L(`  tapped tokyo card: ${await p.evaluate(() => document.querySelector('.city-card')?.textContent?.slice(0, 160))}`);
    await p.locator('.city-card').screenshot({ path: `${OUT}/card-tapped-tokyo-1024-${theme}.png` });
    await p.screenshot({ path: `${OUT}/map-tapped-tokyo-1024-${theme}.png` });
    let before = await destName(p);
    await p.locator('.city-card__profile').tap();
    let s = await sheetInfo(p); L(`  tap View profile -> sheet ${s.title} | ${s.eyebrow}; dest before="${before}" after="${await destName(p)}"`);
    await closeSheet(p);
    xy = await dotXY(p, 'tokyo'); await p.touchscreen.tap(xy.x, xy.y); await p.waitForTimeout(500);
    xy = await dotXY(p, 'tokyo'); await p.touchscreen.tap(xy.x, xy.y); await p.waitForTimeout(1500);
    L(`  tap-tap tokyo dot -> dest="${await destName(p)}"`);
    await ctx.close();

    // ---- Phone 390 touch
    L(`== phone 390 ${theme}`);
    ctx = await ctxFor(b, { theme, phone: true }); p = await open(ctx, `phone-${theme}`);
    await hscroll(p, 'atlas phone');
    for (const [name, id] of [['Tokyo', 'tokyo'], ['Austin', 'austin']]) {
      const row = await rowFor(p, name);
      await row.scrollIntoViewIfNeeded(); await row.screenshot({ path: `${OUT}/row-${id}-phone-${theme}.png` });
      L(`  row ${name}: ${JSON.stringify(await row.evaluate(r => [...r.querySelectorAll('.pickbadge')].map(c => c.textContent.trim())))}`);
      await row.locator('.pickbadge').first().tap();
      s = await sheetInfo(p); L(`  phone sheet ${name}: ${JSON.stringify(s)}`);
      await p.screenshot({ path: `${OUT}/sheet-${id}-phone-${theme}.png` }); await hscroll(p, `phone sheet ${name}`);
      await closeSheet(p);
    }
    await p.fill('.search__input', '');
    await p.locator('.wmap').scrollIntoViewIfNeeded(); await p.waitForTimeout(500);
    for (const id of ['tokyo', 'austin', 'lisbon']) {
      // zoom-less tap on phone: dots may be close; tap and check which card opened
      xy = await dotXY(p, id); await p.touchscreen.tap(xy.x, xy.y); await p.waitForTimeout(900);
      const card = await p.evaluate(() => { const c = document.querySelector('.city-card'); return c && { docked: c.className, head: c.textContent.slice(0, 50), link: !!c.querySelector('.city-card__profile') } });
      L(`  phone tap ${id}: ${JSON.stringify(card)}`);
      await p.locator('.city-card').scrollIntoViewIfNeeded().catch(() => {});
      await p.screenshot({ path: `${OUT}/card-docked-${id}-phone-${theme}.png` }); await hscroll(p, `phone card ${id}`);
      if (id === 'tokyo') {
        before = await destName(p);
        await p.locator('.city-card__profile').tap();
        s = await sheetInfo(p); L(`  phone tap View profile -> ${s.title} | ${s.eyebrow}; dest before="${before}" after="${await destName(p)}"`);
        await closeSheet(p);
        await p.locator('.wmap').scrollIntoViewIfNeeded();
      }
      await p.locator('.city-card__close').tap().catch(() => {}); await p.waitForTimeout(400);
    }
    xy = await dotXY(p, 'tokyo'); await p.touchscreen.tap(xy.x, xy.y); await p.waitForTimeout(500);
    xy = await dotXY(p, 'tokyo'); await p.touchscreen.tap(xy.x, xy.y); await p.waitForTimeout(1500);
    L(`  phone tap-tap tokyo -> dest="${await destName(p)}"`);
    await ctx.close();

    // ---- Home Austin
    L(`== home=Austin desktop ${theme}`);
    ctx = await ctxFor(b, { theme, home: 'austin' }); p = await open(ctx, `austin-${theme}`);
    let row = await rowFor(p, 'Austin');
    L(`  Austin home row chips: ${JSON.stringify(await row.evaluate(r => [...r.querySelectorAll('.pickbadge')].map(c => c.textContent.trim())))} rowText="${(await row.textContent()).slice(0, 90)}"`);
    await row.screenshot({ path: `${OUT}/row-austin-home-${theme}.png` });
    if (await row.locator('.pickbadge').count()) {
      await row.locator('.pickbadge').first().click(); s = await sheetInfo(p); L(`  Austin(home) sheet: ${JSON.stringify(s)}`);
      await p.screenshot({ path: `${OUT}/sheet-austin-home-${theme}.png` }); await closeSheet(p);
    }
    row = await rowFor(p, 'Tokyo'); await row.locator('.pickbadge').first().click(); s = await sheetInfo(p);
    L(`  Tokyo sheet with home Austin: badge="${s.badge}"`); await closeSheet(p);
    await p.fill('.search__input', '');
    await p.locator('.wmap').scrollIntoViewIfNeeded(); await p.mouse.move(5,5);
    xy = await dotXY(p, 'austin'); await p.mouse.move(xy.x, xy.y); await p.waitForTimeout(700);
    L(`  hover Austin(home) card: ${await p.evaluate(() => document.querySelector('.city-card')?.textContent)}`);
    await p.locator('.city-card').screenshot({ path: `${OUT}/card-hover-austin-home-${theme}.png` }).catch(() => {});
    await ctx.close();
  }
  L('== console errors/warnings/photo-assets requests: ' + (errors.length ? '\n' + errors.join('\n') : 'none'));
  require('fs').writeFileSync(`${OUT}/run-product.txt`, `$ node verify.js ${OUT} ${BASE}\n` + log.join('\n') + '\n');
  await b.close();
})().catch(e => { console.error(e); require('fs').writeFileSync(`${OUT}/run-product.txt`, log.join('\n') + '\nFAILED: ' + e.stack); process.exit(1) });
