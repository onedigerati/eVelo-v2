// Check 3: the map city card over the dots, desktop hover (floating) and phone tap (docked), both themes.
// Screenshots, plus the worst-case WCAG contrast of every text colour in the card against the card's
// background composited over every dot colour on the map (and over the map's bare background).
const { chromium } = require('/home/jonah/repos/eVelo/node_modules/playwright-core');
const OUT = '/home/jonah/repos/eVelo-v2/docs/evidence/stage-2';
const BASE = process.env.BASE || 'http://localhost:4792/';
const log = []; const L = (...a) => { const s = a.join(' '); log.push(s); console.log(s); };
let fails = 0; const ok = (c, m) => { L(c ? 'PASS' : 'FAIL', m); if (!c) fails++; };

const parse = s => { const m = s.match(/rgba?\(([^)]+)\)/); if (!m) return null; const v = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return [v[0], v[1], v[2], v.length > 3 ? v[3] : 1]; };
const over = (top, bot) => [0, 1, 2].map(i => top[i] * top[3] + bot[i] * (1 - top[3])).concat(1);
const lum = c => { const f = x => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

async function contrast(p, name, docked) {
  const d = await p.evaluate(() => {
    const card = document.querySelector('.city-card');
    const cv = document.createElement('canvas'); cv.width = cv.height = 1; const cx = cv.getContext('2d', { willReadFrequently: true });
    const rgba = css => { cx.clearRect(0, 0, 1, 1); cx.fillStyle = '#000'; cx.fillStyle = css; cx.fillRect(0, 0, 1, 1); const [r, g, b, a] = cx.getImageData(0, 0, 1, 1).data; return `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(3)})`; };
    const texts = [];
    for (const el of card.querySelectorAll('*')) {
      const own = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
      if (!own || !el.getClientRects().length) continue;
      if (el.closest('.btn--primary')) continue; // the solid primary button sits on its own fill
      texts.push({ t: [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent.trim()).join(' ').slice(0, 28), c: rgba(getComputedStyle(el).color), raw: getComputedStyle(el).color, fs: getComputedStyle(el).fontSize });
    }
    const dots = [...new Set([...document.querySelectorAll('.wmap__stage circle')].flatMap(c => { const s = getComputedStyle(c); return [s.fill, s.stroke]; }).filter(x => x && x !== 'none').map(rgba))];
    const stage = getComputedStyle(document.querySelector('.wmap__stage')).backgroundColor;
    return { bg: rgba(getComputedStyle(card).backgroundColor), body: rgba(getComputedStyle(document.body).backgroundColor), stage, texts, dots };
  });
  const bg = parse(d.bg), body = parse(d.body);
  // A docked card sits below the map, over the page, not over dots.
  const unders = docked ? [body] : [body, ...d.dots.map(parse).filter(Boolean).map(c => over(c, body))];
  let worst = { r: 99, m: 99 };
  for (const t of d.texts) {
    const tc = parse(t.c);
    for (const u of unders) { const cb = over(bg, u); const r = ratio(over(tc, cb), cb); const need = parseFloat(t.fs) >= 24 ? 3 : 4.5; if (r / need < worst.m) worst = { m: r / need, r, need, t: t.t, c: t.c, fs: t.fs, under: u.map(Math.round).slice(0, 3).join(',') }; }
  }
  L(`  card bg ${d.bg}; ${d.texts.length} text runs; ${d.dots.length} dot colours on the map`);
  L(`  worst text contrast (relative to its WCAG AA need, 4.5:1 or 3:1 at >=24px) ${docked ? 'over the page' : 'over any dot colour'}: ${worst.r.toFixed(2)}:1 vs ${worst.need}:1 ("${worst.t}", ${worst.c}, ${worst.fs}, over rgb(${worst.under}))`);
  ok(worst.m >= 1, `${name}: every card text run meets WCAG AA ${docked ? 'on the docked card' : 'over the worst dot colour'} (worst ${worst.r.toFixed(2)}:1, needs ${worst.need}:1)`);
}

(async () => {
  for (const scheme of ['light', 'dark']) for (const phone of [false, true]) {
    const name = `${phone ? 'phone' : 'desktop'}-${scheme}`;
    L(`\n===== ${name} =====`);
    const b = await chromium.launch();
    const p = await (await b.newContext(phone
      ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, colorScheme: scheme }
      : { viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2, colorScheme: scheme })).newPage();
    const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
    await p.goto(BASE + '#atlas'); await p.waitForSelector('.ctier', { timeout: 60000 }); await p.waitForTimeout(2500);
    // Europe: the densest view
    const eu = p.locator('.rchips .rchip', { hasText: 'Europe' });
    await eu.scrollIntoViewIfNeeded(); phone ? await eu.tap() : await eu.click(); await p.waitForTimeout(1800);
    await p.locator('.wmap__stage').scrollIntoViewIfNeeded(); await p.waitForTimeout(400);
    const dots = await p.$$eval('.wmap__stage circle.wmap__dot, .wmap__stage circle.wmap__ring', els => {
      const st = document.querySelector('.wmap__stage').getBoundingClientRect();
      return els.map(e => { const r = e.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; })
        .filter(d => d.x > st.left + 30 && d.x < st.left + st.width * 0.55 && d.y > st.top + 30 && d.y < st.bottom - 60);
    });
    let t = null, n = -1;
    for (const d of dots) { const k = dots.filter(e => e.x > d.x && e.x - d.x < 300 && Math.abs(e.y - d.y) < 200).length; if (k > n) { t = d; n = k; } }
    if (phone) await p.touchscreen.tap(t.x, t.y); else { await p.mouse.move(t.x - 15, t.y - 15); await p.mouse.move(t.x, t.y, { steps: 4 }); }
    await p.waitForTimeout(1200);
    const card = p.locator('.city-card');
    ok(await card.isVisible(), `${name}: ${phone ? 'tap' : 'hover'} on a dot in the Europe view opens the card`);
    const info = await card.evaluate(e => { const r = e.getBoundingClientRect(); return { docked: e.classList.contains('is-docked'), name: e.querySelector('.city-card__name').innerText.replace(/\n/g, ' · '),
      under: [...document.querySelectorAll('.wmap__stage circle.wmap__dot, .wmap__stage circle.wmap__ring')].filter(c => { const b = c.getBoundingClientRect(); const x = b.x + b.width / 2, y = b.y + b.height / 2; return x > r.left && x < r.right && y > r.top && y < r.bottom; }).length,
      labelsUnder: [...document.querySelectorAll('.wmap__stage text')].filter(c => { const b = c.getBoundingClientRect(); return b.width && b.x < r.right && b.right > r.left && b.y < r.bottom && b.bottom > r.top; }).map(x => x.textContent).join(', ') }; });
    L(`  card: ${info.name}; docked ${info.docked}; ${info.under} dots under it; map labels under it: ${info.labelsUnder || 'none'}`);
    ok(info.docked === phone, `${name}: card is ${phone ? 'docked below the map' : 'floating over the map'}`);
    if (!phone) ok(info.under >= 5, `${name}: the hover card covers ${info.under} dots, so this is a real over-the-dots case`);
    await contrast(p, name, info.docked);
    if (phone) {
      await card.evaluate(e => e.scrollIntoView({ block: 'center' })); await p.waitForTimeout(500);
      await p.screenshot({ path: `${OUT}/${name}-docked-card.png` });
      L(`  shot ${name}-docked-card.png (viewport, card centred)`);
    } else {
      const cb = await card.boundingBox();
      await p.screenshot({ path: `${OUT}/${name}-hover-card-2x.png`, clip: { x: cb.x - 70, y: cb.y - 50, width: cb.width + 140, height: cb.height + 100 } });
      L(`  shot ${name}-hover-card-2x.png`);
    }
    ok(errs.length === 0, `${name}: no console errors` + (errs.length ? ': ' + errs.join(' / ') : ''));
    await b.close();
  }
  L(`\nTOTAL FAILS: ${fails}`);
  require('fs').writeFileSync(`${OUT}/city-card.txt`, `$ BASE=${BASE} node scripts/city-card.cjs   (playwright-core chromium, vite preview of npm run build, #atlas)\n` + log.join('\n') + '\n');
})();
