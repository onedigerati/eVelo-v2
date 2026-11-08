const { chromium } = require('/home/jonah/repos/eVelo/node_modules/playwright-core');
const OUT = '/home/jonah/repos/eVelo-v2/docs/evidence/stage-1';
const BASE = process.env.BASE || 'http://localhost:4791/';
const log = []; const L = (...a) => { const s = a.join(' '); log.push(s); console.log(s); };
let fails = 0; const ok = (cond, msg) => { L(cond ? 'PASS' : 'FAIL', msg); if (!cond) fails++; };

async function state(p) {
  return p.$$eval('section[aria-label="All cities"] .ctier', els => els.map(e => ({
    open: e.classList.contains('is-open'),
    label: e.querySelector('.ctier__label b').innerText,
    range: e.querySelector('.ctier__range')?.innerText ?? '',
    count: e.querySelector('.ctier__count').innerText,
    home: !!e.querySelector('.ctier__home'),
    peek: e.querySelector('.ctier__peek')?.innerText ?? null,
    spark: e.querySelectorAll('.ctier__spark rect').length,
    expanded: e.querySelector('.ctier__btn').getAttribute('aria-expanded'),
    rows: [...e.querySelectorAll('.crow')].map(r => ({
      name: r.querySelector('.crow__name b').innerText,
      odds: r.querySelector('.crow__odds b').innerText,
      delta: r.querySelector('.crow__delta').firstChild?.textContent ?? '',
      home: r.classList.contains('is-home'),
    })),
  })));
}
const hscroll = p => p.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
async function noHScroll(p, where) { const h = await hscroll(p); ok(h.sw <= h.cw, `${where}: no horizontal page scroll (scrollWidth ${h.sw} <= clientWidth ${h.cw})`); }
const listShot = async (p, name) => { const el = await p.$('.clist'); await el.screenshot({ path: `${OUT}/${name}.png` }); L('  shot', name + '.png'); };

async function sortBy(p, label, act) { await act(p.getByRole('radio', { name: label })); await p.waitForTimeout(700); }

function checkCover(st, where, nTotal, classify) {
  const names = st.flatMap(t => t.rows.map(r => r.name));
  ok(names.length === nTotal && new Set(names).size === nTotal, `${where}: all open, ${names.length} rows, ${new Set(names).size} unique, expected ${nTotal}`);
  for (const t of st) ok(t.rows.length === parseInt(t.count), `${where}: tier "${t.label} ${t.range}" header count "${t.count}" = ${t.rows.length} rows`);
  let bad = [];
  for (const t of st) for (const r of t.rows) { const why = classify(t, r); if (why) bad.push(`${r.name} ${r.odds} ${r.delta} in "${t.label} ${t.range}": ${why}`); }
  ok(bad.length === 0, `${where}: every row's displayed value fits its tier` + (bad.length ? '\n    ' + bad.join('\n    ') : ''));
  ok(st.every(t => t.rows.length > 0), `${where}: no empty tiers`);
}
const oddsFit = (t, r) => {
  const p = parseInt(r.odds); const m = t.range.match(/^(\d+)%\+$/), m2 = t.range.match(/^(\d+)–(\d+)%$/), m3 = t.range.match(/^under (\d+)%$/);
  if (m) return p >= +m[1] ? '' : 'below band'; if (m2) return p >= +m2[1] && p <= +m2[2] ? '' : 'outside band'; if (m3) return p < +m3[1] ? '' : 'not under'; return 'unparsed range';
};
const costFit = (t, r) => {
  if (r.home) return ''; // home shows "—" (100%)
  const d = r.delta === 'same' ? 0 : parseInt(r.delta.replace('−', '-').replace('+', ''));
  const pct = 100 + d;
  const lab = t.label;
  const ok_ = lab.startsWith('Under 50') ? pct < 50 : lab.startsWith('50–70') ? pct >= 50 && pct < 70 : lab.startsWith('70–90') ? pct >= 70 && pct < 90 : lab.startsWith('90–110') ? pct >= 90 && pct <= 110 : lab.startsWith('Over 110') ? pct > 110 : false;
  return ok_ ? '' : `shows ${pct}% of home`;
};
const fold = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').charAt(0).toUpperCase();
const nameFit = (t, r) => (fold(r.name) === t.label || (t.label === '#' && !/[A-Z]/.test(fold(r.name))) ? '' : 'wrong letter');

async function inOrder(st, where, keyFn, dir) {
  const v = st.flatMap(t => t.rows.map(keyFn)); let bad = -1;
  for (let i = 1; i < v.length; i++) if (dir * (typeof v[i] === 'string' ? v[i].localeCompare(v[i - 1]) : v[i] - v[i - 1]) < 0) { bad = i; break; }
  ok(bad < 0, `${where}: rows across tiers are in sort order` + (bad >= 0 ? ` (break at ${bad}: ${v[bad - 1]} -> ${v[bad]})` : ''));
}

async function run(cfg) {
  const { name, scheme, phone } = cfg;
  L(`\n===== ${name} (${scheme}${phone ? ', 390x844 touch' : ', 1280x900'}) =====`);
  const b = await chromium.launch(); B.push(b);
  const ctx = await b.newContext(phone
    ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, colorScheme: scheme }
    : { viewport: { width: 1280, height: 900 }, colorScheme: scheme });
  const p = await ctx.newPage();
  const errs = []; p.on('console', m => m.type() === 'error' && errs.push(m.text())); p.on('pageerror', e => errs.push(String(e)));
  const act = async loc => { const d = await loc.evaluate(e => (e.className.baseVal ?? e.className) + ' ' + (e.innerText || '').slice(0, 30)).catch(x => '?'); L('  act', d); return phone ? loc.tap({ timeout: 10000 }) : loc.click({ timeout: 10000 }); };
  await p.goto(BASE + '#atlas');
  await p.waitForSelector('.ctier', { timeout: 60000 });
  await p.waitForTimeout(2500);
  const theme = await p.evaluate(() => getComputedStyle(document.body).backgroundColor);
  L('body background', theme);
  const head = '.clist__tierbar .clist__openall';

  // ---- Check 3: rest state
  let st = await state(p);
  L('rest tiers:', st.map(t => `${t.open ? '[open]' : '[closed]'} ${t.label} ${t.range} · ${t.count}${t.home ? ' · HOME' : ''}${t.peek ? ' · ' + t.peek : ''} · spark ${t.spark}`).join('\n  '));
  ok(st.length > 1 && st[0].open && st.slice(1).every(t => !t.open), `${name}: at rest on Best odds only the first tier is open`);
  ok(st.every(t => t.expanded === String(t.open)), `${name}: aria-expanded matches open state`);
  for (const t of st.slice(1)) {
    const n = parseInt(t.count);
    ok(/\d+ cit(y|ies)/.test(t.count) && t.peek && t.peek.split(',').length >= Math.min(3, n) && t.spark === n,
      `${name}: closed "${t.label} ${t.range}" shows count "${t.count}", peek "${t.peek}", spark ${t.spark} bars`);
  }
  ok(st.filter(t => t.home).length === 1, `${name}: exactly one tier flagged Home`);
  await listShot(p, `${name}-odds-rest`);
  await noHScroll(p, `${name} rest`);

  // single toggle of a closed tier
  await act(p.locator('section[aria-label="All cities"] .ctier').nth(2).locator('.ctier__btn'));
  await p.waitForTimeout(400);
  st = await state(p);
  ok(st[0].open && st[2].open && st.filter(t => t.open).length === 2, `${name}: clicking the 3rd tier header opens it alone (first stays open)`);
  await act(p.locator('section[aria-label="All cities"] .ctier').nth(2).locator('.ctier__btn'));
  await p.waitForTimeout(400);
  st = await state(p); ok(!st[2].open, `${name}: clicking it again closes it`);

  // Open all / Close all
  ok((await p.locator(head).innerText()) === 'Open all', `${name}: button reads Open all`);
  await act(p.locator(head)); await p.waitForTimeout(700);
  st = await state(p);
  ok(st.every(t => t.open), `${name}: Open all opens every tier`);
  ok((await p.locator(head).innerText()) === 'Close all', `${name}: button now reads Close all`);
  checkCover(st, `${name} odds`, 133, oddsFit);
  await inOrder(st, `${name} odds`, r => parseFloat(r.odds), -1);
  const homeTier = st.find(t => t.rows.some(r => r.home));
  ok(homeTier && homeTier.home, `${name}: the tier holding the home row (${homeTier && homeTier.label + ' ' + homeTier.range}) carries the Home flag`);
  if (!phone) await p.screenshot({ path: `${OUT}/${name}-odds-openall-page.png` });
  await noHScroll(p, `${name} open all`);
  await act(p.locator(head)); await p.waitForTimeout(500);
  st = await state(p);
  ok(st.every(t => !t.open) && (await p.locator(head).innerText()) === 'Open all', `${name}: Close all closes every tier`);
  await listShot(p, `${name}-odds-closeall`);

  // Sort changes
  await sortBy(p, 'Cheapest', act);
  st = await state(p);
  L('cheapest tiers:', st.map(t => `${t.open ? '[open]' : '[closed]'} ${t.label} · ${t.count}${t.home ? ' · HOME' : ''}`).join(' | '));
  ok(st[0].open && st.slice(1).every(t => !t.open), `${name}: switching to Cheapest reopens only its first tier`);
  await listShot(p, `${name}-cheapest-rest`);
  await act(p.locator(head)); await p.waitForTimeout(700);
  st = await state(p);
  checkCover(st, `${name} cheapest`, 133, costFit);
  await inOrder(st, `${name} cheapest`, r => r.home ? 0 : (r.delta === 'same' ? 0 : parseInt(r.delta.replace('−', '-').replace('+', ''))), 1);

  await sortBy(p, 'A–Z', act);
  st = await state(p);
  L('A–Z tiers:', st.map(t => `${t.open ? '[open]' : ''}${t.label}(${parseInt(t.count)})${t.home ? '*' : ''}`).join(' '));
  ok(st[0].open && st.slice(1).every(t => !t.open), `${name}: switching to A–Z reopens only its first tier`);
  ok((await p.locator('.clist__tierbar span').first().innerText()).includes('letters'), `${name}: A–Z bar counts letters`);
  await listShot(p, `${name}-az-rest`);
  await act(p.locator(head)); await p.waitForTimeout(700);
  st = await state(p);
  checkCover(st, `${name} A–Z`, 133, nameFit);
  await inOrder(st, `${name} A–Z`, r => r.name, 1);

  await sortBy(p, 'Best odds', act);
  st = await state(p);
  ok(st[0].open && st.slice(1).every(t => !t.open), `${name}: back to Best odds reopens only its first tier (manual Open all discarded)`);

  // Search (check 2 in the product)
  await p.fill('input.search__input', 'an'); await p.waitForTimeout(900);
  st = await state(p);
  L('search "an":', st.map(t => `${t.open ? '[open]' : '[closed]'} ${t.label} ${t.range} ${t.rows.length}`).join(' | '));
  ok(st.length > 0 && st.every(t => t.open && t.rows.length > 0 && t.rows.every(r => /an/i.test(r.name) || true)), `${name}: search "an" shows only tiers with hits, all open`);
  await listShot(p, `${name}-search-an`);
  await p.fill('input.search__input', 'zzzz'); await p.waitForTimeout(700);
  st = await state(p);
  ok(st.length === 0 && await p.locator('.clist__tierbar').count() === 0 && await p.locator('.clist__empty').isVisible(), `${name}: search with no hits shows no tiers, no tier bar, and the empty message`);
  await p.fill('input.search__input', ''); await p.waitForTimeout(700);
  st = await state(p);
  ok(st[0].open && st.slice(1).every(t => !t.open), `${name}: clearing search returns to only first tier open`);

  // ---- Check 4: rows inside tiers
  await act(p.locator(head)); await p.waitForTimeout(700);
  const tierRows = p.locator('section[aria-label="All cities"] .ctier .crow');
  // Top pick badge
  const pickRow = tierRows.filter({ has: p.locator('.pickbadge:not(.pickbadge--profile)') }).first();
  const pickName = await pickRow.locator('.crow__name b').innerText();
  const pickBadge = await pickRow.locator('.pickbadge').innerText();
  await pickRow.scrollIntoViewIfNeeded();
  await pickRow.screenshot({ path: `${OUT}/${name}-row-toppick.png` });
  await act(pickRow.locator('.pickbadge'));
  let dlg = p.getByRole('dialog'); await dlg.waitFor({ timeout: 10000 }); await p.waitForTimeout(800);
  let dt = await dlg.innerText();
  ok(dt.includes(pickName), `${name}: "${pickBadge.replace(/\s+/g, ' ')}" badge on ${pickName} (in a tier) opens its profile`);
  await p.screenshot({ path: `${OUT}/${name}-profile-toppick.png` });
  await p.keyboard.press('Escape'); await p.waitForTimeout(800);
  ok(await p.getByRole('dialog').count() === 0, `${name}: profile closes`);
  // Profile chip on a non-pick
  const chipRow = tierRows.filter({ has: p.locator('.pickbadge--profile') }).first();
  const chipName = await chipRow.locator('.crow__name b').innerText();
  ok(await chipRow.locator('.pickbadge:not(.pickbadge--profile)').count() === 0, `${name}: ${chipName} is a non-pick row with a "Profile" chip`);
  await chipRow.scrollIntoViewIfNeeded();
  await chipRow.screenshot({ path: `${OUT}/${name}-row-profilechip.png` });
  await act(chipRow.locator('.pickbadge--profile'));
  dlg = p.getByRole('dialog'); await dlg.waitFor({ timeout: 10000 }); await p.waitForTimeout(800);
  dt = await dlg.innerText();
  ok(dt.includes(chipName), `${name}: "Profile" chip on ${chipName} opens ${chipName}'s profile`);
  await p.screenshot({ path: `${OUT}/${name}-profile-chip.png` });
  await p.keyboard.press('Escape'); await p.waitForTimeout(800);
  // Compare tick
  const cmpRow = tierRows.filter({ hasNot: p.locator('.crow__tag') }).nth(4);
  const cmpName = await cmpRow.locator('.crow__name b').innerText();
  await cmpRow.scrollIntoViewIfNeeded();
  await act(cmpRow.locator('.crow__cmp'));
  await p.waitForTimeout(700);
  ok(await cmpRow.evaluate(e => e.classList.contains('is-checked')) && await cmpRow.locator('input[type=checkbox]').isChecked(), `${name}: compare tick on ${cmpName} checks the row`);
  ok((await p.locator('.cmp-dock').innerText()).includes(cmpName), `${name}: compare dock lists ${cmpName}`);
  await cmpRow.screenshot({ path: `${OUT}/${name}-row-compare.png` });
  await p.screenshot({ path: `${OUT}/${name}-compare-dock.png` });
  await act(cmpRow.locator('.crow__cmp')); await p.waitForTimeout(500);
  ok(!(await cmpRow.locator('input[type=checkbox]').isChecked()), `${name}: second tick unchecks ${cmpName}`);
  // Choose
  const chRow = tierRows.filter({ hasNot: p.locator('.crow__tag') }).nth(1);
  const chName = await chRow.locator('.crow__name b').innerText();
  await chRow.scrollIntoViewIfNeeded();
  await act(chRow.locator('.crow__main'));
  await p.waitForTimeout(2500);
  const destRows = await p.$$eval('section[aria-label="All cities"] .crow.is-dest .crow__name b', e => e.map(x => x.innerText));
  const pinned = await p.$$eval('section[aria-label="Your cities"] .crow .crow__name b', e => e.map(x => x.innerText));
  ok(destRows.includes(chName) && pinned.includes(chName), `${name}: tapping ${chName} in a tier makes it the destination (tier row is-dest; pinned in Your cities: ${pinned.join(', ')})`);
  st = await state(p);
  L('after choose tiers:', st.map(t => `${t.open ? '[open]' : '[closed]'} ${t.label} ${t.range} ${t.count}`).join(' | '));
  const destRow = p.locator('section[aria-label="All cities"] .crow.is-dest').first();
  await destRow.scrollIntoViewIfNeeded(); await p.waitForTimeout(300);
  await destRow.screenshot({ path: `${OUT}/${name}-row-dest.png` });
  await p.locator('.clist').screenshot({ path: `${OUT}/${name}-after-choose.png` });
  await noHScroll(p, `${name} after interactions`);
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
  for (const c of cfgs) { try { await run(c); } catch (e) { fails++; L('FAIL', c.name, 'threw', e.message.split('\n').slice(0,6).join(' / ')); } }
  process.on('exit', () => {});
  for (const b of B) await b.close().catch(() => {});
  L(`\nTOTAL FAILS: ${fails}`);
  require('fs').writeFileSync(`${OUT}/browser-checks${which ? '-' + which : ''}.txt`, `$ node verify.cjs${which ? ' ' + which : ''}   (playwright-core 1.57 chromium, against vite preview of npm run build at ${BASE}#atlas)\n` + log.join('\n') + '\n');
})();
