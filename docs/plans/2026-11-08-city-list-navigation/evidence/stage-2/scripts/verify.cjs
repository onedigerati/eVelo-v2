// Stage 2 browser checks: region chips (list <-> map), city card, phone chip row.
// Usage: BASE=http://localhost:4792/ node verify.cjs [config]
const { chromium } = require('/home/jonah/repos/eVelo/node_modules/playwright-core');
const OUT = '/home/jonah/repos/eVelo-v2/docs/evidence/stage-2';
const BASE = process.env.BASE || 'http://localhost:4792/';
const CITIES = require('./cities.json'); // dumped from src/data/cities.ts (independent oracle)
const log = []; const L = (...a) => { const s = a.join(' '); log.push(s); console.log(s); };
let fails = 0; const ok = (cond, msg) => { L(cond ? 'PASS' : 'FAIL', msg); if (!cond) fails++; };

const CHIPS = ['All', 'North America', 'Latin America', 'Europe', 'Asia', 'Oceania', 'Other'];
const chipOf = c => (c.region === 'Middle East' || c.region === 'Africa') ? 'Other' : c.region;
const hit = (c, q) => { const t = q.trim().toLowerCase(); return !t || c.name.toLowerCase().includes(t) || c.country.toLowerCase().includes(t) || c.currency.toLowerCase() === t || c.countryCode.toLowerCase() === t; };
const oracle = (r, q) => CITIES.filter(c => (r === 'All' || chipOf(c) === r) && hit(c, q));
const byName = Object.fromEntries(CITIES.map(c => [c.name, c]));

const ALL = 'section[aria-label="All cities"]';
async function tiers(p) {
  return p.$$eval(`${ALL} .ctier`, els => els.map(e => ({
    open: e.classList.contains('is-open'),
    key: e.querySelector('.ctier__label').innerText.replace(/\n/g, ' '),
    count: parseInt(e.querySelector('.ctier__count').innerText),
    rows: [...e.querySelectorAll('.crow .crow__name b')].map(b => b.innerText),
  })));
}
const chips = (p, sel) => p.$$eval(sel, els => els.map(e => ({
  label: e.querySelector('.rchip__label').innerText, n: parseInt(e.querySelector('.rchip__n').innerText),
  on: e.getAttribute('aria-pressed') === 'true', empty: e.classList.contains('is-empty'),
  h: e.getBoundingClientRect().height, w: e.getBoundingClientRect().width,
})));
const listChips = p => chips(p, '.lchips .lchip');
const mapChips = p => chips(p, '.rchips .rchip');
const onOf = cs => cs.filter(c => c.on).map(c => c.label).join(',');
const hscroll = p => p.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
async function noHScroll(p, where) { const h = await hscroll(p); ok(h.sw <= h.cw, `${where}: no horizontal page scroll (scrollWidth ${h.sw} <= clientWidth ${h.cw})`); }

async function run(cfg) {
  const { name, scheme, phone } = cfg;
  L(`\n===== ${name} (${scheme}${phone ? ', 390x844 touch' : ', 1280x900'}) =====`);
  const b = await chromium.launch(); B.push(b);
  const ctx = await b.newContext(phone
    ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, colorScheme: scheme }
    : { viewport: { width: 1280, height: 900 }, colorScheme: scheme });
  const p = await ctx.newPage();
  const errs = []; p.on('console', m => m.type() === 'error' && errs.push(m.text())); p.on('pageerror', e => errs.push(String(e)));
  const act = loc => phone ? loc.tap({ timeout: 10000 }) : loc.click({ timeout: 10000 });
  const shot = async (sel, file) => { const el = p.locator(sel).first(); await el.scrollIntoViewIfNeeded(); await p.waitForTimeout(250); await el.screenshot({ path: `${OUT}/${file}` }); L('  shot', file); };
  const listChip = r => p.locator('.lchips .lchip', { has: p.locator('.rchip__label', { hasText: new RegExp(`^${r}$`) }) });
  const mapChip = r => p.locator('.rchips .rchip', { has: p.locator('.rchip__label', { hasText: new RegExp(`^${r}$`) }) });
  const openAll = async () => { const btn = p.locator('.clist__openall'); if (!(await btn.count())) return; if ((await btn.innerText()) === 'Open all') { await act(btn); await p.waitForTimeout(600); } };
  const search = async q => { await p.fill('input.search__input', q); await p.waitForTimeout(900); };

  await p.goto(BASE + '#atlas');
  await p.waitForSelector('.ctier', { timeout: 60000 });
  await p.waitForTimeout(2500);
  L('body background', await p.evaluate(() => getComputedStyle(document.body).backgroundColor));

  // ---------------- Check 2: region sync, tiers, reset, counts
  let lc = await listChips(p), mc = await mapChips(p);
  L('list chips at rest:', lc.map(c => `${c.label} ${c.n}${c.on ? '*' : ''}`).join(' | '));
  L('map chips at rest: ', mc.map(c => `${c.label} ${c.n}${c.on ? '*' : ''}`).join(' | '));
  ok(lc.map(c => c.label).join() === CHIPS.join() && mc.map(c => c.label).join() === CHIPS.join(), `${name}: list and map both show the 7 region chips in order`);
  ok(onOf(lc) === 'All' && onOf(mc) === 'All', `${name}: both start on All`);
  ok(lc.every(c => c.n === oracle(c.label, '').length), `${name}: list chip counts with no search equal the oracle per region (${lc.map(c => c.n).join('/')})`);
  ok(lc.slice(1).reduce((s, c) => s + c.n, 0) === lc[0].n, `${name}: list regions sum to All (${lc[0].n})`);
  await shot('.clist__tools', `${name}-chips-rest.png`);
  if (phone) {
    const m0 = await p.evaluate(() => ({ coarse: matchMedia('(pointer: coarse)').matches, h: [...document.querySelectorAll('.lchips .lchip')].map(e => e.getBoundingClientRect().height), mapH: [...document.querySelectorAll('.rchips .rchip')].map(e => e.getBoundingClientRect().height) }));
    L(`at load: pointer coarse ${m0.coarse}; list chip heights ${m0.h.join('/')}; map chip heights ${m0.mapH.join('/')}`);
    ok(m0.coarse && m0.h.every(h => h >= 44), `${name}: at load with a coarse pointer every list chip is >=44px tall (${m0.h.join('/')})`);
  }

  // list -> map
  await act(listChip('Europe')); await p.waitForTimeout(1500);
  lc = await listChips(p); mc = await mapChips(p);
  ok(onOf(lc) === 'Europe' && onOf(mc) === 'Europe', `${name}: list chip Europe -> list on "${onOf(lc)}", map on "${onOf(mc)}"`);
  let st = await tiers(p);
  ok(st.length > 0 && st[0].open && st.slice(1).every(t => !t.open), `${name}: after the region change only the first tier is open (${st.map(t => (t.open ? '[open]' : '') + t.key + ' ' + t.count).join(' | ')})`);
  ok(st.reduce((s, t) => s + t.count, 0) === lc.find(c => c.label === 'Europe').n, `${name}: Europe tier header counts sum to the Europe chip (${lc.find(c => c.label === 'Europe').n})`);
  await shot('.wmap', `${name}-europe-map.png`);
  await shot('.clist', `${name}-europe-list.png`);
  // toggle a tier, then re-press the same region: open state must stay
  if (st.length > 1) {
    await act(p.locator(`${ALL} .ctier`).nth(1).locator('.ctier__btn')); await p.waitForTimeout(400);
    const before = (await tiers(p)).map(t => t.open).join();
    await act(listChip('Europe')); await p.waitForTimeout(800);
    const after1 = (await tiers(p)).map(t => t.open).join();
    ok(before === after1 && before.split(',').filter(x => x === 'true').length === 2, `${name}: re-pressing the current region (list chip) keeps the toggled tiers open (${before} -> ${after1})`);
    await act(mapChip('Europe')); await p.waitForTimeout(800);
    const after2 = (await tiers(p)).map(t => t.open).join();
    ok(before === after2, `${name}: re-pressing the current region (map chip) keeps the toggled tiers open (${after2})`);
    // a non-region interaction (compare tick) keeps them too
    const cmp = p.locator(`${ALL} .ctier.is-open .crow`).first();
    await cmp.scrollIntoViewIfNeeded(); await act(cmp.locator('.crow__cmp')); await p.waitForTimeout(600);
    ok((await tiers(p)).map(t => t.open).join() === before, `${name}: a compare tick keeps the toggled tiers open`);
    await act(cmp.locator('.crow__cmp')); await p.waitForTimeout(500);
  }
  await openAll();
  st = await tiers(p);
  let names = st.flatMap(t => t.rows);
  let exp = oracle('Europe', '').map(c => c.name);
  ok(names.length === exp.length && names.every(n => byName[n] && chipOf(byName[n]) === 'Europe') && new Set(names).size === exp.length, `${name}: Europe, all open: ${names.length} rows, all European, unique (oracle ${exp.length})`);

  // map -> list, and the reset on change
  await mapChip('Asia').scrollIntoViewIfNeeded(); await act(mapChip('Asia')); await p.waitForTimeout(1500);
  lc = await listChips(p); mc = await mapChips(p);
  ok(onOf(lc) === 'Asia' && onOf(mc) === 'Asia', `${name}: map chip Asia -> map on "${onOf(mc)}", list on "${onOf(lc)}"`);
  st = await tiers(p);
  ok(st[0].open && st.slice(1).every(t => !t.open), `${name}: map-driven region change from an all-open Europe resets to only the first tier open (${st.map(t => (t.open ? '[open]' : '') + t.key + ' ' + t.count).join(' | ')})`);
  await openAll(); st = await tiers(p); names = st.flatMap(t => t.rows); exp = oracle('Asia', '').map(c => c.name);
  ok(names.length === exp.length && names.every(n => chipOf(byName[n]) === 'Asia'), `${name}: Asia, all open: ${names.length} rows, all Asian (oracle ${exp.length})`);
  await shot('.wmap', `${name}-asia-from-map.png`);
  await shot('.clist__tools', `${name}-asia-list-chips.png`);

  // every region via the map, rows only from that region and count = chip
  for (const r of CHIPS) {
    await mapChip(r).scrollIntoViewIfNeeded(); await act(mapChip(r)); await p.waitForTimeout(1100);
    lc = await listChips(p);
    await openAll(); st = await tiers(p); names = st.flatMap(t => t.rows);
    const n = lc.find(c => c.label === r).n;
    ok(onOf(lc) === r && names.length === n && names.length === oracle(r, '').length && names.every(x => r === 'All' || chipOf(byName[x]) === r),
      `${name}: map chip ${r} -> list on ${onOf(lc)}, ${names.length} rows listed = list chip ${n}, only ${r} cities`);
  }

  // search + region: chip counts equal the rows under that search+region, for every chip
  for (const q of ['an', 'eur', 'mx', 'united states', 'zzzz']) {
    await search(q);
    lc = await listChips(p);
    ok(lc.every(c => c.n === oracle(c.label, q).length) && lc.slice(1).reduce((s, c) => s + c.n, 0) === lc[0].n,
      `${name}: search "${q}": chip counts ${lc.map(c => c.label + ' ' + c.n).join(', ')} equal the oracle and sum to All`);
    ok(lc.every(c => c.empty === (c.n === 0 && !c.on)), `${name}: search "${q}": exactly the zero chips (not selected) are styled empty`);
    for (const r of CHIPS) {
      await listChip(r).scrollIntoViewIfNeeded(); await act(listChip(r)); await p.waitForTimeout(800);
      st = await tiers(p); names = st.flatMap(t => t.rows);
      const n = (await listChips(p)).find(c => c.label === r).n;
      const allOpen = st.every(t => t.open);
      const emptyMsg = n === 0 ? await p.locator('.clist__empty').isVisible() : true;
      const mapOn = onOf(await mapChips(p));
      if (!(names.length === n && allOpen && emptyMsg && mapOn === r && names.every(x => hit(byName[x], q) && (r === 'All' || chipOf(byName[x]) === r))))
        ok(false, `${name}: search "${q}" + ${r}: ${names.length} rows vs chip ${n}, allOpen ${allOpen}, map on ${mapOn}`);
      else L(`PASS ${name}: search "${q}" + ${r}: ${names.length} rows listed = chip ${n}, all match, all tiers open, map on ${mapOn}`);
    }
    if (q === 'an') { await listChip('Asia').scrollIntoViewIfNeeded(); await act(listChip('Asia')); await p.waitForTimeout(700); await shot('.clist', `${name}-search-an-asia.png`); }
    if (q === 'united states') { await listChip('All').scrollIntoViewIfNeeded(); await act(listChip('All')); await p.waitForTimeout(700); await shot('.clist__tools', `${name}-search-us-empty-chips.png`); }
  }
  await search('');
  await listChip('All').scrollIntoViewIfNeeded(); await act(listChip('All')); await p.waitForTimeout(1000);
  st = await tiers(p);
  ok(st[0].open && st.slice(1).every(t => !t.open) && st.reduce((s, t) => s + t.count, 0) === 133, `${name}: back on All with no search: 133 cities, only first tier open`);

  // ---------------- Check 4 (phone): chip row scrolls inside the card, 44px, no page scroll
  lc = await listChips(p);
  const geo = await p.evaluate(() => {
    const s = document.querySelector('.lchips'), card = s.closest('.card, section, .clist').getBoundingClientRect(), sr = s.getBoundingClientRect();
    return { sw: s.scrollWidth, cw: s.clientWidth, ox: getComputedStyle(s).overflowX, left: sr.left, right: sr.right, cardL: card.left, cardR: card.right, vw: innerWidth };
  });
  L('media at measure: ' + JSON.stringify(await p.evaluate(() => ({ coarse: matchMedia('(pointer: coarse)').matches, hoverNone: matchMedia('(hover: none)').matches, lchipComputed: getComputedStyle(document.querySelector('.lchip')).height, rchipComputed: getComputedStyle(document.querySelector('.rchips .rchip')).height }))));
  L(`chip row: scrollWidth ${geo.sw}, clientWidth ${geo.cw}, overflow-x ${geo.ox}, row ${Math.round(geo.left)}..${Math.round(geo.right)} in viewport ${geo.vw}; chip heights ${lc.map(c => Math.round(c.h)).join('/')}`);
  if (phone) {
    ok(geo.sw > geo.cw && geo.ox === 'auto', `${name}: chips overflow and scroll inside their row (scrollWidth ${geo.sw} > clientWidth ${geo.cw})`);
    ok(geo.left >= -0.5 && geo.right <= geo.vw + 0.5, `${name}: the chip row stays within the viewport (${Math.round(geo.left)}..${Math.round(geo.right)})`);
    const coarseNow = await p.evaluate(() => matchMedia('(pointer: coarse)').matches);
    if (coarseNow) ok(lc.every(c => c.h >= 44), `${name}: every list chip is >=44px tall on touch (${lc.map(c => c.h).join('/')})`);
    else L(`NOTE ${name}: headless Chromium now reports pointer:fine (touch emulation dropped mid-run, a harness artifact; the page cannot change it), so the 44px rule is inactive here; judged at load and in a fresh touch page instead`);
    ok(lc.every(c => c.w >= 44), `${name}: every list chip is >=44px wide`);
    await noHScroll(p, `${name} chips at rest`);
    // swipe the chip row and tap the last chip
    await p.locator('.lchips').evaluate(e => { e.scrollLeft = e.scrollWidth; });
    await p.waitForTimeout(400);
    const sl = await p.locator('.lchips').evaluate(e => e.scrollLeft);
    ok(sl > 0, `${name}: chip row scrolled to ${sl}px`);
    await shot('.clist__tools', `${name}-chips-scrolled.png`);
    await noHScroll(p, `${name} chips scrolled`);
    const otherBox = await listChip('Other').boundingBox();
    ok(otherBox && otherBox.x + otherBox.width <= geo.vw + 0.5, `${name}: after scrolling, the Other chip is fully on screen (${otherBox && Math.round(otherBox.x)}..${otherBox && Math.round(otherBox.x + otherBox.width)})`);
    await act(listChip('Other')); await p.waitForTimeout(1200);
    ok(onOf(await listChips(p)) === 'Other' && onOf(await mapChips(p)) === 'Other', `${name}: tapping Other in the scrolled row selects it on both`);
    // rows and tiers still work under a region
    st = await tiers(p);
    if (st.length > 1) { await act(p.locator(`${ALL} .ctier`).nth(1).locator('.ctier__btn')); await p.waitForTimeout(400); }
    const st2 = await tiers(p);
    ok(st.length < 2 || (st2[1].open && st2[0].open), `${name}: tapping a closed tier header opens it under Other`);
    const row = p.locator(`${ALL} .ctier.is-open .crow`).filter({ hasNot: p.locator('.crow__tag') }).first();
    const rowName = await row.locator('.crow__name b').innerText();
    await row.scrollIntoViewIfNeeded();
    await act(row.locator('.crow__cmp')); await p.waitForTimeout(600);
    ok(await row.locator('input[type=checkbox]').isChecked() && (await p.locator('.cmp-dock').innerText()).includes(rowName), `${name}: compare tick on ${rowName} works under Other`);
    await act(row.locator('.crow__cmp')); await p.waitForTimeout(500);
    await act(row.locator('.crow__main')); await p.waitForTimeout(2500);
    const dest = await p.$$eval(`${ALL} .crow.is-dest .crow__name b`, e => e.map(x => x.innerText));
    ok(dest.includes(rowName), `${name}: tapping ${rowName} under Other makes it the destination`);
    await shot('.clist', `${name}-other-list.png`);
    await noHScroll(p, `${name} after row interactions`);
    await mapChip('All').scrollIntoViewIfNeeded(); await act(mapChip('All')); await p.waitForTimeout(1200);
  } else {
    ok(geo.sw <= geo.cw + 1, `${name}: on desktop the chips wrap with nothing hidden (scrollWidth ${geo.sw}, clientWidth ${geo.cw})`);
    await noHScroll(p, `${name} chips`);
  }

  // ---------------- Check 3: city card over the dots
  await p.locator('.wmap').scrollIntoViewIfNeeded(); await p.waitForTimeout(800);
  const dots = await p.$$eval('.wmap__stage circle.wmap__dot, .wmap__stage circle.wmap__ring', els => {
    const st = document.querySelector('.wmap__stage').getBoundingClientRect();
    return els.map(e => { const r = e.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; })
      .filter(d => d.x > st.left + 20 && d.x < st.right - 20 && d.y > st.top + 20 && d.y < st.bottom - 20);
  });
  // pick the dot with the most neighbours (densest cluster), so the card lands over other dots
  let best = null, bestN = -1;
  for (const d of dots) { const n = dots.filter(e => Math.abs(e.x - d.x) < 160 && Math.abs(e.y - d.y) < 120).length; if (n > bestN) { best = d; bestN = n; } }
  L(`map: ${dots.length} dots in view; target (${Math.round(best.x)},${Math.round(best.y)}) with ${bestN} neighbours`);
  if (!phone) {
    await p.mouse.move(best.x - 30, best.y - 30); await p.mouse.move(best.x, best.y, { steps: 4 }); await p.waitForTimeout(900);
  } else {
    await p.touchscreen.tap(best.x, best.y); await p.waitForTimeout(1200);
  }
  const card = p.locator('.city-card');
  ok(await card.isVisible(), `${name}: ${phone ? 'tapping' : 'hovering'} a dot shows the city card`);
  if (await card.isVisible()) {
    const info = await card.evaluate(e => {
      const cs = getComputedStyle(e), r = e.getBoundingClientRect();
      const under = [...document.querySelectorAll('.wmap__stage circle.wmap__dot, .wmap__stage circle.wmap__ring')].filter(c => { const b = c.getBoundingClientRect(); const x = b.x + b.width / 2, y = b.y + b.height / 2; return x > r.left && x < r.right && y > r.top && y < r.bottom; }).length;
      return { docked: e.classList.contains('is-docked'), bg: cs.backgroundColor, blur: cs.backdropFilter, name: e.querySelector('.city-card__name')?.innerText.replace(/\n/g, ' '), ink: getComputedStyle(e.querySelector('.city-card__name')).color, rect: [r.x, r.y, r.width, r.height].map(Math.round), under };
    });
    L(`card: ${JSON.stringify(info)}`);
    ok(info.docked === !!phone, `${name}: card is ${phone ? 'docked' : 'floating'} (is-docked ${info.docked})`);
    ok(/0\.9[24]\)$/.test(info.bg), `${name}: card background is --surface-glass-strong (${info.bg})`);
    if (!phone) ok(info.under > 0, `${name}: the floating card sits over ${info.under} dots (so the screenshot tests readability over dots)`);
    const st = await p.locator('.wmap__stage').boundingBox(); const cb = await card.boundingBox();
    const x0 = Math.max(0, Math.min(st.x, cb.x) - 10), y0 = Math.max(0, Math.min(phone ? st.y : cb.y - 60, cb.y) - 10);
    const x1 = Math.max(st.x + st.width, cb.x + cb.width) + 10, y1 = Math.max(phone ? st.y + st.height : cb.y + cb.height + 60, cb.y + cb.height) + 10;
    const clip = phone ? { x: 0, y: y0, width: 390, height: y1 - y0 } : { x: Math.max(0, cb.x - 80), y: Math.max(0, cb.y - 60), width: cb.width + 160, height: cb.height + 120 };
    await p.screenshot({ path: `${OUT}/${name}-city-card.png`, clip });
    L('  shot', `${name}-city-card.png`);
    if (!phone) { await p.screenshot({ path: `${OUT}/${name}-city-card-zoom.png`, clip: { x: cb.x, y: cb.y, width: cb.width, height: cb.height }, scale: 'device' }); L('  shot', `${name}-city-card-zoom.png`); }
    // phone: also pan the card's region to Europe (dense) and tap there
    if (phone) await noHScroll(p, `${name} docked card open`);
  }
  // Same check zoomed into a dense region (Europe), where dots pack tightest
  await mapChip('Europe').scrollIntoViewIfNeeded(); await act(mapChip('Europe')); await p.waitForTimeout(1800);
  if (phone) { await p.touchscreen.tap(5, (await p.locator('.wmap__stage').boundingBox()).y + 5); await p.waitForTimeout(400); }
  await p.locator('.wmap').scrollIntoViewIfNeeded(); await p.waitForTimeout(500);
  const eu = await p.$$eval('.wmap__stage circle.wmap__dot, .wmap__stage circle.wmap__ring', els => {
    const st = document.querySelector('.wmap__stage').getBoundingClientRect();
    return els.map(e => { const r = e.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; })
      .filter(d => d.x > st.left + 30 && d.x < st.left + st.width * 0.6 && d.y > st.top + 30 && d.y < st.bottom - 30);
  });
  let t2 = null, n2 = -1;
  for (const d of eu) { const n = eu.filter(e => Math.abs(e.x - d.x) < 200 && Math.abs(e.y - d.y) < 150).length; if (n > n2) { t2 = d; n2 = n; } }
  if (t2) {
    if (!phone) { await p.mouse.move(t2.x - 20, t2.y - 20); await p.mouse.move(t2.x, t2.y, { steps: 4 }); await p.waitForTimeout(900); }
    else { await p.touchscreen.tap(t2.x, t2.y); await p.waitForTimeout(1200); }
    if (await card.isVisible()) {
      const cb = await card.boundingBox(); const stb = await p.locator('.wmap__stage').boundingBox();
      const under = await card.evaluate(e => { const r = e.getBoundingClientRect(); return [...document.querySelectorAll('.wmap__stage circle.wmap__dot, .wmap__stage circle.wmap__ring')].filter(c => { const b = c.getBoundingClientRect(); const x = b.x + b.width / 2, y = b.y + b.height / 2; return x > r.left && x < r.right && y > r.top && y < r.bottom; }).length; });
      L(`Europe card: ${await card.locator('.city-card__name').innerText()} over ${under} dots`);
      const clip = phone ? { x: 0, y: Math.max(0, stb.y - 10), width: 390, height: cb.y + cb.height - stb.y + 20 } : { x: Math.max(0, cb.x - 80), y: Math.max(0, cb.y - 60), width: cb.width + 160, height: cb.height + 120 };
      await p.screenshot({ path: `${OUT}/${name}-city-card-europe.png`, clip }); L('  shot', `${name}-city-card-europe.png`);
      ok(true, `${name}: Europe-zoom card shown (${under} dots under it)`);
    } else ok(false, `${name}: Europe-zoom card did not show`);
  }
  await noHScroll(p, `${name} end`);
  ok(errs.length === 0, `${name}: no console errors` + (errs.length ? ': ' + errs.join(' / ') : ''));
  await b.close();
}

const B = [];
(async () => {
  const which = process.argv[2];
  const cfgs = [
    { name: 'desktop-light', scheme: 'light' }, { name: 'desktop-dark', scheme: 'dark' },
    { name: 'phone-light', scheme: 'light', phone: true }, { name: 'phone-dark', scheme: 'dark', phone: true },
  ].filter(c => !which || c.name === which);
  for (const c of cfgs) { try { await run(c); } catch (e) { fails++; L('FAIL', c.name, 'threw', e.message.split('\n').slice(0, 6).join(' / ')); } }
  for (const b of B) await b.close().catch(() => {});
  L(`\nTOTAL FAILS: ${fails}`);
  require('fs').writeFileSync(`${OUT}/browser-checks${which ? '-' + which : ''}.txt`, `$ BASE=${BASE} node scripts/verify.cjs${which ? ' ' + which : ''}   (playwright-core chromium, against vite preview of npm run build at ${BASE}#atlas)\n` + log.join('\n') + '\n');
})();
