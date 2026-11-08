import { useState, type ReactNode } from 'react'
import type { SimulationResult } from '../../engine/types'
import { useStore } from '../../state/store'
import { currencyCompact, percent } from '../format'
import { useBreakpoint } from '../hooks'
import { SegmentedControl } from '../primitives'
import { cityName, startNetWorth } from './cards'
import { ChartFrame } from './ChartFrame'
import { FAN_METRICS, FanChart, bandsFor, type FanMarker, type FanMetric } from './FanChart'

const EYEBROW: Record<FanMetric, string> = {
  networth: 'Net worth · today’s dollars',
  portfolio: 'Portfolio value · today’s dollars',
  loan: 'Loan balance · today’s dollars',
  ltv: 'Loan-to-value',
}

const TITLE: Record<FanMetric, ReactNode> = {
  networth: (
    <>
      The range of <em>futures</em>
    </>
  ),
  portfolio: (
    <>
      The portfolio, <em>untouched</em>
    </>
  ),
  loan: (
    <>
      The loan, <em>compounding</em>
    </>
  ),
  ltv: (
    <>
      How close to the <em>line</em>
    </>
  ),
}

export function fanCaption(r: SimulationResult, m: FanMetric): string {
  const b = bandsFor(r, m)
  const n = b.p50.length - 1
  const a = r.inputs.age
  const end = a + n
  if (m === 'networth') {
    const low = b.p5[n]
    const tiny = startNetWorth(r) * 0.02
    if (b.p50[n] <= tiny)
      return `In the median future the loan consumes everything by ${end}: net worth falls from ${currencyCompact(b.p50[0])} to ${currencyCompact(b.p50[n])}${b.p95[n] > tiny ? `, and only the luckiest 5% end above ${currencyCompact(b.p95[n])}` : ''}.`
    if (b.p50[n] < b.p50[0])
      return `In the median future net worth shrinks from ${currencyCompact(b.p50[0])} to ${currencyCompact(b.p50[n])} by ${end}; the unluckiest 5% end ${low <= tiny ? 'with almost nothing' : `near ${currencyCompact(low)}`}.`
    return `In the median future net worth grows from ${currencyCompact(b.p50[0])} to ${currencyCompact(b.p50[n])} by ${end}; the unluckiest 5% end ${low <= tiny ? 'with almost nothing' : `near ${currencyCompact(low)}`}.`
  }
  if (m === 'portfolio')
    return `Nothing is sold to fund your life: the median portfolio compounds to ${currencyCompact(b.p50[n])} by ${end}, carrying the loan on top.`
  if (m === 'loan')
    return `Borrowing compounds: ${(r.inputs.existingLoan ?? 0) > 0 ? `from your existing ${currencyCompact(r.inputs.existingLoan)} balance, ` : ''}the median loan reaches ${currencyCompact(b.p50[n])} by ${end}, and ${currencyCompact(b.p95[n])} in the costliest 5% of futures.`
  const max = r.inputs.maxLtv
  let peak = 0
  for (let i = 1; i <= n; i++) if (b.p50[i] > b.p50[peak]) peak = i
  const cross = b.p95.findIndex((v) => v >= max)
  return `Median loan-to-value peaks at ${percent(b.p50[peak])} around ${a + peak}, well ${b.p50[peak] < max * 0.6 ? 'under' : 'close to'} the ${percent(max)} call line; ${cross >= 0 ? `the worst 5% touch it by ${a + cross}` : 'even the worst 5% never reach it'}.`
}

export function fanMarkers(r: SimulationResult): FanMarker[] {
  const i = r.inputs
  const out: FanMarker[] = []
  if (i.destCityId && i.moveInYears > 0) out.push({ age: i.age + i.moveInYears, label: `Move to ${cityName(i.destCityId)}` })
  if (i.otherIncome > 0) out.push({ age: i.incomeStartAge, label: 'Income starts' })
  return out
}

export function FanCard() {
  const result = useStore((s) => s.result)
  const [metric, setMetric] = useState<FanMetric>('networth')
  const bp = useBreakpoint()
  const control = (
    <SegmentedControl
      size="sm"
      aria-label="Metric"
      options={FAN_METRICS.map((f) => ({ value: f.value, label: bp === 'phone' ? f.short : f.label }))}
      value={metric}
      onChange={setMetric}
      block={bp === 'phone'}
    />
  )
  return (
    <ChartFrame
      span="full"
      eyebrow={EYEBROW[metric]}
      title={TITLE[metric]}
      subtitle={result ? fanCaption(result, metric) : 'Median path, with the middle half and 90% of outcomes shaded.'}
      aspect="16 / 6.5"
      className="fan-card"
    >
      {result && (
        <>
          <div className="fan-card__control">{control}</div>
          <FanChart result={result} metric={metric} markers={fanMarkers(result)} />
        </>
      )}
    </ChartFrame>
  )
}
