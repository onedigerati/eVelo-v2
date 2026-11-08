// Drives the v30 artifact-mode build (served with a local /_blob/ stand-in): every profiled city's gallery,
// the three profile entry points, both themes and a phone.
const { chromium } = require('playwright');
const [OUT, BASE, CITIES] = process.argv.slice(2);
const cities = require(CITIES);
const EXE = '/home/jonah/.cache/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-linux-arm64/chrome-headless-shell';
async function ctxFor(b, theme, phone) {
  const ctx = await b.newContext(phone ? { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } : { viewport: { width: 1440, height: 900 } });
  await ctx.addInitScript(([theme]) => { if (sessionStorage.getItem('s')) return; sessionStorage.setItem('s', '1'); localStorage.clear(); localStorage.setItem('evelo:v2:entered', '1'); localStorage.setItem('evelo:v2', JSON.stringify({ theme, inputs: { homeCityId: 'st-louis', destCityId: 'bangkok' } })) }, [theme]);
  return ctx;
}
async function open(ctx, errs, tag) {
  const p = await ctx.newPage();
  p.on('console', m => { if (m.type() === 'error') errs.push(`[${tag}] ${m.text().slice(0, 200)}`) }); p.on('pageerror', e => errs.push(`[${tag}] pageerror ${e.message}`));
  p.on('response', r => { if (r.status() >= 400) errs.push(`[${tag}] HTTP ${r.status()} ${r.url().replace(BASE, '/')}`) });
  await p.goto(BASE + '#atlas'); await p.waitForSelector('.crow', { timeout: 90000 }); await p.waitForTimeout(3000); return p;
}
const gal = p => p.locator('[role=dialog]').evaluate(el => { const im = [...el.querySelectorAll('.pgal__mosaic img')]; return { title: el.querySelector('h2')?.textContent?.trim(), eyebrow: el.querySelector('.prof__eyebrow')?.textContent?.trim(), n: im.length, loaded: im.filter(i => i.complete && i.naturalWidth > 0).length, blob: im.every(i => i.getAttribute('src').startsWith('/_blob/')) } });
async function waitLoaded(p) { for (let i = 0; i < 20; i++) { const g = await gal(p); if (g.n === 5 && g.loaded === 5) return g; await p.waitForTimeout(250) } return gal(p) }
(async () => {
  const b = await chromium.launch({ executablePath: EXE }); const errs = [];
  // 1. Every profiled city, desktop light, opened from its city-list badge.
  let ctx = await ctxFor(b, 'light', false), p = await open(ctx, errs, 'all');
  let ok = 0; const bad = [];
  for (const [id, name] of cities) {
    await p.fill('.search__input', name); await p.waitForTimeout(400);
    const row = p.locator('.crow', { hasText: name }).first();
    await row.locator('.pickbadge').first().click(); await p.locator('[role=dialog]').waitFor();
    const g = await waitLoaded(p);
    const pass = g.n === 5 && g.loaded === 5 && g.blob; if (pass) ok++; else bad.push({ id, ...g });
    if (['tokyo', 'austin', 'lisbon', 'volcan'].includes(id)) await p.screenshot({ path: `${OUT}/v30-sheet-${id}-light.png` });
    await p.keyboard.press('Escape'); await p.waitForTimeout(350);
  }
  console.log(`all cities: ${ok}/${cities.length} galleries with 5/5 photos loaded from /_blob/; failures: ${JSON.stringify(bad)}`);
  await ctx.close();
  // 2. Entry points + themes + phone.
  for (const [tag, theme, phone] of [['desk-light', 'light', false], ['desk-dark', 'dark', false], ['phone-light', 'light', true], ['phone-dark', 'dark', true]]) {
    ctx = await ctxFor(b, theme, phone); p = await open(ctx, errs, tag);
    const tap = async l => phone ? l.tap() : l.click();
    const out = [];
    // tiles
    const tiles = p.locator('.atile__profile:visible'); const nt = await tiles.count();
    for (let i = 0; i < nt; i++) { await tap(tiles.nth(i)); await p.locator('[role=dialog]').waitFor(); const g = await waitLoaded(p); out.push(`tile→${g.title} ${g.loaded}/5`); if (i === 0) await p.screenshot({ path: `${OUT}/v30-${tag}-sheet.png` }); await p.keyboard.press('Escape'); await p.waitForTimeout(500) }
    // list chip for a non-pick (Tokyo)
    await p.fill('.search__input', 'Tokyo'); await p.waitForTimeout(500);
    await tap(p.locator('.crow', { hasText: 'Tokyo' }).first().locator('.pickbadge--profile')); await p.locator('[role=dialog]').waitFor();
    let g = await waitLoaded(p); out.push(`chip→${g.eyebrow} ${g.loaded}/5`); await p.keyboard.press('Escape'); await p.waitForTimeout(500);
    await p.fill('.search__input', ''); await p.waitForTimeout(400);
    await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(300);
    await p.screenshot({ path: `${OUT}/v30-${tag}-atlas.png` });
    const hs = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    console.log(`${tag}: ${out.join(' · ')} · horizontal overflow ${hs}px`);
    await ctx.close();
  }
  console.log('errors:', JSON.stringify(errs));
  await b.close();
})();
