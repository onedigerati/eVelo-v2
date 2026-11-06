import { it } from 'vitest'
import marketJson from '../../data/market.json'
import { CITIES } from '../../data/cities'
import { DEFAULT_INPUTS } from '../defaults'
import { simulate } from '../simulate'
import { runPaths, createRecorder, type KernelConfig } from '../kernel'
import { solveSpending } from '../solve'
import { runAtlas } from '../atlas'
import type { MarketData } from '../types'
const market = marketJson as unknown as MarketData
const base: KernelConfig = { T: 24, portfolio: 1000, basisFraction: 0.2, dragM: 0, loanRateM: 0, maxLtv: 0.6, targetLtv: 0.45, tax: 0.238,
  homeMonthly: 0, destMonthly: 0, moveMonth: 24, fxSigmaM: 0, incomeMonthly: 0, incomeStartMonth: 999 }
function sc(rets: number[], T=24) { const ret=new Float32Array(T), infl=new Float32Array(T), fxz=new Float32Array(T); rets.forEach((r,i)=>ret[i]=r); return {paths:1,T,ret,infl,fxz} }
it('kernel', () => {
  // borrow 500 at month 0 -> LTV .5; then -20% => .625 call
  const rec = createRecorder(1, 2)
  runPaths(sc([0,-0.2]), { ...base, homeMonthly: 0 }, rec)
  // custom: spend 500 only month 0 using incomeMonthly negative trick
  const cfg = { ...base, homeMonthly: 500, incomeMonthly: 500, incomeStartMonth: 1 }
  const r2 = createRecorder(1, 2); runPaths(sc([0,-0.2]), cfg, r2)
  console.log('after call ltv y1', r2.ltv[1], 'port', r2.port[1], 'loan', r2.loan[1], 'outcome', r2.outcome[0], r2.firstCall[0])
  // crash -45% in one month from LTV .5 -> insolvent without call
  const r3 = createRecorder(1, 2); runPaths(sc([0,-0.5]), cfg, r3)
  console.log('crash outcome', r3.outcome[0], 'firstCall', r3.firstCall[0])
  // 50 -> LTV .5/.55=0.909: forced sale possible?
  const r4 = createRecorder(1, 2); runPaths(sc([0,-0.42]), cfg, r4)
  console.log('-42% outcome', r4.outcome[0], 'firstCall', r4.firstCall[0], r4.ltv[1])
})
it('solver vs simulate', () => {
  for (const target of [0.8, 0.9, 0.95]) {
    const s = solveSpending(market, CITIES, DEFAULT_INPUTS, target)
    const m = s.maxSpendHome / 110000
    const b = Object.fromEntries(Object.entries(DEFAULT_INPUTS.budget).map(([k,v])=>[k,v*m])) as any
    const r = simulate(market, CITIES, { ...DEFAULT_INPUTS, budget: b })
    console.log('target', target, 'mult', m.toFixed(4), 'simulate success', r.successRate)
  }
  const a = runAtlas(market, CITIES, DEFAULT_INPUTS, ['bangkok'])
  console.log('atlas bangkok', a[0].successRate, 'sim', simulate(market, CITIES, DEFAULT_INPUTS).successRate)
})
