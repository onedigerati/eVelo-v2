import type { ReactNode } from 'react'
import { formatValue, type FormatKind } from '../format'
import { AnimatedNumber } from './AnimatedNumber'
import { cx } from './cx'

export interface StatProps {
  label: ReactNode
  value: number
  format?: FormatKind
  /** Change vs a baseline; sign decides arrow. */
  delta?: number
  deltaFormat?: FormatKind
  /** Whether a positive delta is good (green) or bad (coral). */
  deltaPositive?: 'good' | 'bad'
  hint?: ReactNode
  tone?: 'holds' | 'bruised' | 'broken' | 'neutral'
  size?: 'sm' | 'md' | 'lg'
  from?: number
  className?: string
}

export function Stat({ label, value, format = 'number', delta, deltaFormat, deltaPositive = 'good', hint, tone, size = 'md', from, className }: StatProps) {
  const dir = delta === undefined || delta === 0 ? 0 : delta > 0 ? 1 : -1
  const good = dir === 0 ? null : (dir > 0) === (deltaPositive === 'good')
  return (
    <div className={cx('stat', `stat--${size}`, tone && `stat--${tone}`, className)}>
      <div className="stat__label t-eyebrow">{label}</div>
      <div className="stat__value">
        <AnimatedNumber value={value} format={format} from={from} />
      </div>
      {(delta !== undefined || hint) && (
        <div className="stat__foot">
          {delta !== undefined && (
            <span className={cx('stat__delta num', good === true && 'is-good', good === false && 'is-bad')}>
              <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true" style={{ transform: `rotate(${dir < 0 ? 180 : 0}deg)` }}>
                {dir === 0 ? <path d="M2 5h6" stroke="currentColor" strokeWidth="1.5" /> : <path d="M5 1.5L8.5 7h-7z" fill="currentColor" />}
              </svg>
              {formatValue(Math.abs(delta), deltaFormat ?? format)}
              <span className="sr-only">{dir > 0 ? ' increase' : dir < 0 ? ' decrease' : ' no change'}</span>
            </span>
          )}
          {hint && <span className="stat__hint">{hint}</span>}
        </div>
      )}
    </div>
  )
}
