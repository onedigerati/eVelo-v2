const { chromium } = require('/home/jonah/repos/eVelo/node_modules/playwright-core')
const OUT='/home/jonah/repos/eVelo-v2/docs/evidence/stage-2/'
;(async()=>{const b=await chromium.launch();const errs=[]
for (const scheme of ['dark','light']){const c=await b.newContext({viewport:{width:1440,height:900},colorScheme:scheme,reducedMotion:'reduce'});const p=await c.newPage();p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});p.on('pageerror',e=>errs.push(e.message))
await p.goto('http://localhost:4182/');await p.waitForTimeout(800)
const t=p.locator('.landing__threshold-label');const bb=await t.boundingBox()
const last=await p.evaluate(()=>{const s=document.querySelector('.landing__field');return s.lastElementChild.getAttribute('class')})
console.log(scheme,'label is last in field:',last==='landing__threshold-label','box',JSON.stringify(bb))
await p.screenshot({path:OUT+`label-halo-d1440-${scheme}.png`,clip:{x:bb.x-120,y:bb.y-60,width:bb.width+160,height:bb.height+120}})
await c.close()}
console.log('console errors:',errs.length);await b.close()})()
