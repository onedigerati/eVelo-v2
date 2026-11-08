const { chromium } = require('playwright');
const OUT = process.argv[2];
(async () => {
  const b = await chromium.launch();
  for (const theme of ['light','dark']) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await ctx.addInitScript((theme) => { if (sessionStorage.getItem('s')) return; sessionStorage.setItem('s','1'); localStorage.clear(); localStorage.setItem('evelo:v2:entered','1'); localStorage.setItem('evelo:v2', JSON.stringify({ theme })) }, theme);
  const p = await ctx.newPage();
  await p.goto('http://localhost:4173/#atlas'); await p.waitForSelector('.wmap__svg g[data-id]'); await p.waitForTimeout(2500);
  // scroll so map stage sits just under the header
  await p.evaluate(() => { const r = document.querySelector('.wmap').getBoundingClientRect(); scrollBy(0, r.top - 70) }); await p.waitForTimeout(3000);
  await p.waitForTimeout(600);
  const xy = await p.evaluate(() => { const g = document.querySelector('.wmap__svg g[data-id="tokyo"]'); const s = g.ownerSVGElement.getBoundingClientRect(); const m = g.transform.baseVal.consolidate().matrix; return { x: s.left + m.e, y: s.top + m.f } });
  console.log("xy",JSON.stringify(xy), await p.evaluate(([x,y])=>{const e=document.elementFromPoint(x,y);return e && (e.className.baseVal ?? e.className)},[xy.x,xy.y])); await p.touchscreen.tap(xy.x, xy.y); await p.waitForTimeout(1000); if(!(await p.$(".city-card"))){await p.screenshot({path:OUT+"/dbg2.png"}); await p.touchscreen.tap(xy.x, xy.y); await p.waitForTimeout(1000); console.log("retry card?", !!(await p.$(".city-card")))}
  const geo = await p.evaluate(() => { const c = document.querySelector('.city-card'), l = document.querySelector('.city-card__profile'), ch = document.querySelector('.city-card__choose, .city-card .btn--primary, .city-card button.btn'); const nav = [...document.querySelectorAll('nav')].map(n => ({ cls: n.className, top: n.getBoundingClientRect().top, pos: getComputedStyle(n).position })); return { text: c?.textContent, card: c?.getBoundingClientRect().toJSON(), link: l?.getBoundingClientRect().toJSON(), scrollY, nav, innerHeight } });
  console.log(theme, JSON.stringify(geo));
  await p.screenshot({ path: `${OUT}/card-docked-tokyo-phone-noscroll-${theme}.png` });
  await p.evaluate(() => { const r = document.querySelector('.city-card').getBoundingClientRect(); scrollBy(0, r.bottom - innerHeight + 120) });
  await p.waitForTimeout(500);
  await p.screenshot({ path: `${OUT}/card-docked-tokyo-phone-full-${theme}.png` });
  await p.locator('.city-card').screenshot({ path: `${OUT}/card-docked-tokyo-phone-crop-${theme}.png` });
  await ctx.close();
  }
  await b.close();
})();
