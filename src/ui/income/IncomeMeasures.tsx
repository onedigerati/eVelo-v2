// The mode's three measures (docs/PLAN.md, 2026-11-18): cards on desktop, a list on phone (CSS in
// incomeResults.css). The money lasts leads, in brass. Rates read as the whole percent, rounded the way
// eVelo's verdict rounds its odds (Math.round of the percent), with no "<1%"/">99%" clamp: eVelo
// shows 0% and 100% as they are.
import './incomeResults.css'

import type { IncomeResult } from '../../engine/incomeTypes'
import { percent } from '../format'

/** A rate as the whole percent the user sees: "84%". */
export function measureRate(rate: number): string {
  return Number.isFinite(rate) ? percent(Math.round(rate * 100) / 100) : '—'
}

export interface Measure {
  key: 'lasts' | 'principal' | 'pace'
  label: string
  rate: number
  note: string
}

export function measuresOf(result: Pick<IncomeResult, 'lastsRate' | 'principalKeptRate' | 'keepsPaceRate'>): Measure[] {
  return [
    { key: 'lasts', label: 'The money lasts', rate: result.lastsRate, note: 'of futures. Same test as eVelo.' },
    { key: 'principal', label: 'Principal never sold', rate: result.principalKeptRate, note: 'The strict income-only promise.' },
    { key: 'pace', label: 'Income keeps pace', rate: result.keepsPaceRate, note: 'Never falls more than 10% below year one, after inflation.' },
  ]
}

export interface IncomeMeasuresProps {
  result: Pick<IncomeResult, 'lastsRate' | 'principalKeptRate' | 'keepsPaceRate'>
}

export function IncomeMeasures({ result }: IncomeMeasuresProps) {
  return (
    <ul className="imeasures" aria-label="Three measures across the futures">
      {measuresOf(result).map((m) => (
        <li key={m.key} className={`imeasure imeasure--${m.key}`} data-testid={`income-measure-${m.key}`}>
          <span className="imeasure__label">{m.label}</span>
          <span className="imeasure__rate">{measureRate(m.rate)}</span>
          <span className="imeasure__note">{m.note}</span>
        </li>
      ))}
    </ul>
  )
}
