const { chromium } = require('/home/jonah/repos/eVelo/node_modules/playwright-core')
const OUT='/home/jonah/repos/eVelo-v2/docs/evidence/stage-2/'
;(async()=>{const b=await chromium.launch()
for (const [w,h,s] of [[390,844,'light'],[390,844,'dark'],[1000,800,'light']]){const c=await b.newContext({viewport:{width:w,height:h},deviceScaleFactor:2,colorScheme:s,reducedMotion:'reduce'});const p=await c.newPage();await p.goto('http://localhost:4191/#home');await p.waitForTimeout(700)
const m=p.locator('.landing svg[role=img]').first();await m.screenshot({path:OUT+`map-halo-${w}-${s}.png`});await c.close()}
await b.close()})()
