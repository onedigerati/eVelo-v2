// Stage 2 check: one Plan tab on desktop; tablet and phone keep Plan + Outlook.
// Usage: NEW=http://localhost:4893/ BASE=http://localhost:4894/ node nav-verify.cjs
//   NEW  = build of fdd4827 (the change), BASE = build of 04a5062 (before), for the desktop comparison.
const { chromium } = require('/home/jonah/repos/eVelo/node_modules/playwright-core');
const { PNG } = require('/home/jonah/repos/eVelo/node_modules/pngjs');
const pixelmatch = require('/home/jonah/repos/eVelo/node_modules/pixelmatch').default;
const fs = require('fs');
const OUT = '/home/jonah/repos/eVelo-v2/docs/evidence/stage-2';
const NEW = process.env.NEW || 'http://localhost:4893/';
const BASE = process.env.BASE || 'http://localhost:4894/';
const log = []; const L = (...a) => { const s = a.join(' '); log.push(s); console.log(s); };
let fails = 0; const ok = (c, m) => { L(c ? 'PASS' : 'FAIL', m); if (!c) fails++; };

const VIEW = {
  desktop: { viewport: { width: 1280, height: 900 } },
  tablet: { viewport: { width: 900, height: 1100 } },
  phone: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
};
const navInfo = p => p.$$eval('.topnav .topnav__link', els => els.map(e => ({ t: e.innerText.trim(), cur: e.getAttribute('aria-current'), on: e.classList.contains('is-active'), href: e.getAttribute('href') })));
const tabInfo = p => p.$$eval('.tabbar .tabbar__tab', els => els.map(e => ({ t: e.innerText.trim(), cur: e.getAttribute('aria-current'), href: e.getAttribute('href') })));
const lit = items => items.filter(i => i.cur === 'page').map(i => i.t).join(',') || '(none)';
const hash = p => p.evaluate(() => location.hash);
const vis = (p, sel) => p.locator(sel).first().isVisible().catch(() => false);
const settle = p => p.waitForTimeout(1200);

async function open(b, scheme, kind, url) {
  const ctx = await b.newContext({ ...VIEW[kind], colorScheme: scheme, reducedMotion: 'reduce' });
  const p = await ctx.newPage();
  p.errs = []; p.on('console', m => m.type() === 'error' && p.errs.push(m.text())); p.on('pageerror', e => p.errs.push(String(e)));
  await p.goto(url);
  await p.waitForSelector('.topbar', { timeout: 60000 });
  await p.waitForTimeout(3000); // let the worker finish the first run
  return p;
}
async function go(p, h) { await p.evaluate(x => { location.hash = x }, h); await settle(p); }

async function desktop(b, scheme) {
  const n = `desktop-${scheme}`;
  L(`\n===== ${n} (1280x900) =====`);
  const p = await open(b, scheme, 'desktop', NEW + '#plan');
  let nav = await navInfo(p);
  L('nav on #plan:', JSON.stringify(nav));
  ok(nav.map(i => i.t).join('/') === 'Plan/Atlas/Method', `${n}: nav items are exactly Plan/Atlas/Method (${nav.map(i => i.t).join('/')})`);
  ok(lit(nav) === 'Plan', `${n}: #plan -> aria-current on "${lit(nav)}"`);
  ok(await vis(p, '.workspace .rail') && await vis(p, '.workspace .canvas'), `${n}: #plan shows the workspace (rail + canvas)`);
  ok(await p.evaluate(() => document.activeElement?.classList.contains('rail')), `${n}: #plan focuses the rail (existing behaviour)`);
  await p.screenshot({ path: `${OUT}/nav-${n}-plan.png` }); L('  shot', `nav-${n}-plan.png`);

  await go(p, '#outlook');
  nav = await navInfo(p);
  ok(lit(nav) === 'Plan', `${n}: #outlook -> aria-current on "${lit(nav)}"`);
  ok(nav.every(i => i.t !== 'Outlook'), `${n}: no Outlook item on #outlook`);
  ok(await vis(p, '.workspace .rail') && await vis(p, '.workspace .canvas'), `${n}: #outlook shows the same workspace`);
  ok(!(await vis(p, '[role="dialog"]')), `${n}: no drawer on desktop`);
  await p.screenshot({ path: `${OUT}/nav-${n}-outlook.png` }); L('  shot', `nav-${n}-outlook.png`);

  // clicks
  const link = t => p.locator('.topnav .topnav__link', { hasText: new RegExp(`^${t}$`) });
  for (const [t, h, sel] of [['Atlas', '#atlas', '.wmap, .clist'], ['Method', '#method', null], ['Plan', '#plan', '.workspace .rail']]) {
    await link(t).click(); await settle(p);
    nav = await navInfo(p);
    const hh = await hash(p);
    ok(hh === h && lit(nav) === t && nav.length === 3, `${n}: click ${t} -> ${hh}, lit "${lit(nav)}", ${nav.length} items`);
    if (sel) ok(await vis(p, sel), `${n}: ${t} view rendered (${sel})`);
  }
  ok(!(await vis(p, '.workspace')) || (await hash(p)) === '#plan', `${n}: workspace only on plan routes`);

  // keyboard: Tab from the top of the page to each nav link, Enter
  for (const [t, h] of [['Atlas', '#atlas'], ['Method', '#method'], ['Plan', '#plan']]) {
    // start from the first tab stop (the skip link); on #plan the rail holds focus, so Tab would
    // otherwise continue from the rail into the inputs (existing behaviour, unchanged by fdd4827)
    await p.evaluate(() => { window.scrollTo(0, 0); document.querySelector('.skip-link').focus(); });
    let reached = false;
    for (let i = 0; i < 15; i++) {
      await p.keyboard.press('Tab');
      const f = await p.evaluate(() => { const a = document.activeElement; return a && a.classList.contains('topnav__link') ? a.innerText.trim() : null; });
      if (f === t) { reached = true; break; }
    }
    await p.keyboard.press('Enter'); await settle(p);
    nav = await navInfo(p);
    ok(reached && (await hash(p)) === h && lit(nav) === t, `${n}: keyboard Tab to ${t} + Enter -> ${await hash(p)}, lit "${lit(nav)}"`);
  }
  // Tab order through the nav
  await p.evaluate(() => { window.scrollTo(0, 0); document.querySelector('.skip-link').focus(); });
  const order = [await p.evaluate(() => document.activeElement.innerText.trim())];
  for (let i = 0; i < 8; i++) { await p.keyboard.press('Tab'); order.push(await p.evaluate(() => { const a = document.activeElement; return (a.innerText || a.getAttribute('aria-label') || a.tagName).trim().split('\n')[0]; })); }
  L(`${n}: skip link + first 8 Tab stops:`, order.join(' | '));
  ok(p.errs.length === 0, `${n}: no console errors (${p.errs.join(' ; ') || 'none'})`);
  await p.context().close();
}

// Desktop workspace vs 04a5062: screenshot below the top bar + DOM of <main>, and the top bar alone.
async function compare(b, scheme) {
  const n = `desktop-${scheme}`;
  L(`\n===== ${n}: fdd4827 vs 04a5062 =====`);
  for (const route of ['#plan', '#outlook']) {
    const res = {};
    for (const [tag, url] of [['new', NEW], ['base', BASE]]) {
      const p = await open(b, scheme, 'desktop', url + route);
      await p.waitForTimeout(2000);
      await p.evaluate(() => document.activeElement?.blur());
      const top = await p.locator('.topbar').boundingBox();
      res[tag] = {
        main: await p.screenshot({ clip: { x: 0, y: Math.ceil(top.y + top.height), width: 1280, height: 900 - Math.ceil(top.y + top.height) } }),
        bar: await p.locator('.topbar').screenshot(),
        dom: await p.evaluate(() => document.querySelector('main').outerHTML.replace(/ (style|id|aria-labelledby|aria-describedby|aria-controls|for)="[^"]*"/g, '')),
        nav: (await navInfo(p)).map(i => `${i.t}${i.cur ? '*' : ''}`).join('/'),
      };
      if (tag === 'base') fs.writeFileSync(`${OUT}/nav-${n}${route.replace('#', '-')}-base.png`, await p.screenshot());
      await p.context().close();
    }
    const a = PNG.sync.read(res.new.main), c = PNG.sync.read(res.base.main);
    const same = a.width === c.width && a.height === c.height;
    const diff = same ? pixelmatch(a.data, c.data, null, a.width, a.height, { threshold: 0.1 }) : -1;
    L(`${n} ${route}: nav new=${res.new.nav}  base=${res.base.nav}`);
    ok(res.new.nav.replace(/\*/g, '') === 'Plan/Atlas/Method' && res.base.nav.replace(/\*/g, '') === 'Plan/Outlook/Atlas/Method', `${n} ${route}: only the nav item set differs (new drops Outlook)`);
    ok(diff === 0, `${n} ${route}: workspace below the top bar is pixel-identical to 04a5062 (${diff} px differ of ${a.width * a.height})`);
    ok(res.new.dom === res.base.dom, `${n} ${route}: <main> DOM identical to 04a5062 (${res.new.dom.length} vs ${res.base.dom.length} chars)`);
    if (route === '#outlook') {
      fs.writeFileSync(`${OUT}/nav-${n}-topbar-new.png`, res.new.bar); fs.writeFileSync(`${OUT}/nav-${n}-topbar-base.png`, res.base.bar);
      L('  shots', `nav-${n}-topbar-new.png`, `nav-${n}-topbar-base.png`);
    }
  }
}

async function tablet(b, scheme) {
  const n = `tablet-${scheme}`;
  L(`\n===== ${n} (900x1100) =====`);
  const p = await open(b, scheme, 'tablet', NEW + '#outlook');
  let nav = await navInfo(p);
  L('nav on #outlook:', JSON.stringify(nav));
  ok(nav.map(i => i.t).join('/') === 'Plan/Outlook/Atlas/Method', `${n}: nav items Plan/Outlook/Atlas/Method (${nav.map(i => i.t).join('/')})`);
  ok(lit(nav) === 'Outlook', `${n}: #outlook -> lit "${lit(nav)}"`);
  ok(await vis(p, '.canvas') && !(await vis(p, '[role="dialog"]')), `${n}: #outlook shows the canvas, no drawer`);
  await p.screenshot({ path: `${OUT}/nav-${n}-outlook.png` }); L('  shot', `nav-${n}-outlook.png`);
  const link = t => p.locator('.topnav .topnav__link', { hasText: new RegExp(`^${t}$`) });
  await link('Plan').click(); await settle(p);
  nav = await navInfo(p);
  ok((await hash(p)) === '#plan' && lit(nav) === 'Plan', `${n}: click Plan -> ${await hash(p)}, lit "${lit(nav)}"`);
  ok(await vis(p, '[role="dialog"].sheet--left .plan'), `${n}: Plan opens the left drawer with the plan inputs`);
  await p.screenshot({ path: `${OUT}/nav-${n}-plan-drawer.png` }); L('  shot', `nav-${n}-plan-drawer.png`);
  await p.keyboard.press('Escape'); await settle(p);
  nav = await navInfo(p);
  ok((await hash(p)) === '#outlook' && lit(nav) === 'Outlook' && !(await vis(p, '[role="dialog"]')), `${n}: Escape closes the drawer -> ${await hash(p)}, lit "${lit(nav)}"`);
  await link('Outlook').click(); await settle(p);
  ok((await hash(p)) === '#outlook' && lit(await navInfo(p)) === 'Outlook', `${n}: click Outlook -> ${await hash(p)}`);
  for (const [t, h] of [['Atlas', '#atlas'], ['Method', '#method'], ['Outlook', '#outlook']]) {
    await link(t).click(); await settle(p);
    ok((await hash(p)) === h && lit(await navInfo(p)) === t, `${n}: click ${t} -> ${await hash(p)}, lit "${lit(await navInfo(p))}"`);
  }
  ok(p.errs.length === 0, `${n}: no console errors (${p.errs.join(' ; ') || 'none'})`);
  await p.context().close();
}

async function phone(b, scheme) {
  const n = `phone-${scheme}`;
  L(`\n===== ${n} (390x844 touch) =====`);
  const p = await open(b, scheme, 'phone', NEW + '#plan');
  ok(!(await vis(p, '.topnav')), `${n}: no top nav on phone`);
  let tabs = await tabInfo(p);
  L('tabs on #plan:', JSON.stringify(tabs));
  ok(tabs.map(i => i.t).join('/') === 'Plan/Outlook/Atlas/Method', `${n}: bottom tab bar has 4 tabs Plan/Outlook/Atlas/Method`);
  ok(lit(tabs) === 'Plan' && await vis(p, '.phone-plan .plan'), `${n}: #plan -> lit "${lit(tabs)}", plan inputs shown`);
  await p.screenshot({ path: `${OUT}/nav-${n}-plan.png` }); L('  shot', `nav-${n}-plan.png`);
  const tab = t => p.locator('.tabbar .tabbar__tab', { hasText: new RegExp(`^${t}$`) });
  const views = { Outlook: '.canvas', Atlas: '.wmap, .clist', Method: 'main', Plan: '.phone-plan' };
  for (const [t, h] of [['Outlook', '#outlook'], ['Atlas', '#atlas'], ['Method', '#method'], ['Plan', '#plan']]) {
    await tab(t).tap(); await settle(p);
    tabs = await tabInfo(p);
    ok((await hash(p)) === h && lit(tabs) === t && await vis(p, views[t]), `${n}: tap ${t} -> ${await hash(p)}, lit "${lit(tabs)}"`);
    if (t === 'Outlook') { await p.screenshot({ path: `${OUT}/nav-${n}-outlook.png` }); L('  shot', `nav-${n}-outlook.png`); }
  }
  const pill = p.locator('a.verdict-pill');
  ok(await pill.isVisible(), `${n}: VerdictPill shown on Plan (${await pill.getAttribute('aria-label').catch(() => '?')})`);
  await pill.tap(); await settle(p);
  tabs = await tabInfo(p);
  ok((await hash(p)) === '#outlook' && lit(tabs) === 'Outlook' && await vis(p, '.canvas') && !(await vis(p, '.phone-plan')), `${n}: VerdictPill tap -> ${await hash(p)}, lit "${lit(tabs)}", outlook canvas shown`);
  ok(p.errs.length === 0, `${n}: no console errors (${p.errs.join(' ; ') || 'none'})`);
  await p.context().close();
}

(async () => {
  const b = await chromium.launch();
  try {
    for (const s of ['light', 'dark']) { await desktop(b, s); await compare(b, s); await tablet(b, s); await phone(b, s); }
  } catch (e) { L('ERROR', e.stack); fails++; }
  await b.close();
  L(`\n${fails ? 'FAILURES: ' + fails : 'ALL PASS'}`);
  fs.writeFileSync(`${OUT}/nav-browser-checks.txt`, log.join('\n') + '\n');
  process.exit(fails ? 1 : 0);
})();
