import { useId, useState, type KeyboardEvent, type ReactNode } from 'react'
import { currency, number, parseLoose, percent } from '../format'
import { cx } from './cx'

export interface NumberFieldProps {
  label: ReactNode
  value: number
  onChange: (v: number) => void
  /** 'percent' values are decimals (0.065 shows as 6.5%). */
  kind?: 'currency' | 'percent' | 'number'
  step?: number
  min?: number
  max?: number
  /** Fraction digits when displaying (percent defaults to 1, others 0). */
  digits?: number
  suffix?: string
  hint?: ReactNode
  aside?: ReactNode
  stepper?: boolean
  size?: 'md' | 'lg'
  id?: string
  className?: string
}

function display(v: number, kind: NumberFieldProps['kind'], digits?: number) {
  if (kind === 'currency') return currency(v, { digits: digits ?? 0 }).replace('$', '')
  if (kind === 'percent') return percent(v, { digits: digits ?? 1 }).replace('%', '')
  return number(v, digits ?? 0)
}

/**
 * Text input that formats on blur ("5,000,000") and accepts loose input while editing
 * ("5m", "850k", "6.5"). Arrow keys step (Shift = ×10). Exposed as a spinbutton.
 */
export function NumberField({
  label,
  value,
  onChange,
  kind = 'number',
  step,
  min = -Infinity,
  max = Infinity,
  digits,
  suffix,
  hint,
  aside,
  stepper = true,
  size = 'md',
  id,
  className,
}: NumberFieldProps) {
  const uid = useId()
  const inputId = id ?? `${uid}-num`
  const hintId = hint ? `${uid}-hint` : undefined
  const [draft, setDraft] = useState<string | null>(null)
  const st = step ?? (kind === 'percent' ? 0.0025 : kind === 'currency' ? 10_000 : 1)
  const clamp = (v: number) => Math.min(max, Math.max(min, v))
  const round = (v: number) => Math.round(v / st) * st
  const commit = (raw: string) => {
    const parsed = parseLoose(raw, kind)
    if (parsed !== null) onChange(clamp(parsed))
    setDraft(null)
  }
  const bump = (dir: 1 | -1, mult = 1) => onChange(clamp(round(value + dir * st * mult)))
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault()
      if (draft !== null) commit(draft)
      bump(e.key === 'ArrowUp' ? 1 : -1, e.shiftKey ? 10 : 1)
    } else if (e.key === 'Enter') {
      commit(e.currentTarget.value)
    } else if (e.key === 'Escape') {
      setDraft(null)
    }
  }
  const prefix = kind === 'currency' ? '$' : undefined
  const suf = suffix ?? (kind === 'percent' ? '%' : undefined)
  const shown = display(value, kind, digits)
  const ariaText = kind === 'currency' ? currency(value) : kind === 'percent' ? percent(value, { digits: digits ?? 1 }) : shown

  return (
    <div className={cx('numfield', `numfield--${size}`, className)}>
      <div className="field__row">
        <label className="field__label" htmlFor={inputId}>
          {label}
        </label>
        {aside}
      </div>
      <div className="numfield__box">
        {prefix && <span className="numfield__affix num" aria-hidden="true">{prefix}</span>}
        <input
          id={inputId}
          className="numfield__input num"
          type="text"
          inputMode="decimal"
          autoComplete="off"
          spellCheck={false}
          role="spinbutton"
          aria-valuenow={value}
          aria-valuetext={ariaText}
          aria-valuemin={Number.isFinite(min) ? min : undefined}
          aria-valuemax={Number.isFinite(max) ? max : undefined}
          aria-describedby={hintId}
          value={draft ?? shown}
          onFocus={(e) => {
            setDraft(shown)
            const el = e.currentTarget
            requestAnimationFrame(() => el.select())
          }}
          onChange={(e) => setDraft(e.currentTarget.value)}
          onBlur={(e) => commit(e.currentTarget.value)}
          onKeyDown={onKey}
        />
        {suf && <span className="numfield__affix num" aria-hidden="true">{suf}</span>}
        {stepper && (
          <span className="numfield__stepper">
            <button type="button" tabIndex={-1} aria-label="Decrease" onClick={() => bump(-1)} disabled={value <= min}>
              <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                <path d="M2.5 6h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
            <button type="button" tabIndex={-1} aria-label="Increase" onClick={() => bump(1)} disabled={value >= max}>
              <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                <path d="M2.5 6h7M6 2.5v7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </span>
        )}
      </div>
      {hint && (
        <p className="field__hint" id={hintId}>
          {hint}
        </p>
      )}
    </div>
  )
}
