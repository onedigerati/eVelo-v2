import { it } from 'vitest'
import marketJson from '../../data/market.json'
import { prepare } from '../prepare'
import type { MarketData } from '../types'
const market = marketJson as unknown as MarketData
function corr(a:number[], b:number[]) { const n=a.length; const ma=a.reduce((s,x)=>s+x,0)/n, mb=b.reduce((s,x)=>s+x,0)/n; let ab=0,aa=0,bb=0; for(let i=0;i<n;i++){ab+=(a[i]-ma)*(b[i]-mb);aa+=(a[i]-ma)**2;bb+=(b[i]-mb)**2} return ab/Math.sqrt(aa*bb) }
it('resid corr', () => {
  for (const [x,y] of [['SMH','SOXX'],['VGT','XLK'],['SCHD','VYM'],['BND','AGG'],['BTC-USD','ETH-USD'],['NVDA','AMD'], ['IBIT','BTC-USD']]) {
    const p = prepare(market, [{symbol:x,weight:1},{symbol:y,weight:1}], 'historical')
    const f = Math.max(market.assets[x].first, market.assets[y].first)
    const a:number[]=[],b:number[]=[],c:number[]=[],d:number[]=[]
    for (let m=0;m<p.months;m++){ (m<f? a:c).push(p.R[m*2]); (m<f? b:d).push(p.R[m*2+1]) }
    const pv = (A:number[],B:number[]) => { const s=A.map((v,i)=>(v+B[i])/2); const m=s.reduce((q,v)=>q+v,0)/s.length; return Math.sqrt(s.reduce((q,v)=>q+(v-m)**2,0)/(s.length-1)*12) }
    console.log(x,y,'first',f,'corr backfill',corr(a,b).toFixed(2),'real',corr(c,d).toFixed(2), 'port vol backfill', pv(a,b).toFixed(3), 'real', pv(c,d).toFixed(3))
  }
})
