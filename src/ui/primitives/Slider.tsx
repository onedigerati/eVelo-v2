import { useId, useState, type CSSProperties, type ReactNode } from 'react'
import { formatValue, type FormatKind } from '../format'
import { cx } from './cx'

export interface SliderTick {
  value: number
  label?: string
}

export interface SliderProps {
  label: ReactNode
  value: number
  min: number
  max: number
  step?: number
  onChange: (v: number) => void
  format?: FormatKind
  /** Tick marks under the track. Pass numbers or {value,label}. Labels default to `format`. */
  ticks?: (number | SliderTick)[]
  hint?: ReactNode
  /** Extra element on the label row (e.g. an InfoTip). */
  aside?: ReactNode
  /** Tone of the filled track. */
  tone?: 'holds' | 'bruised' | 'broken' | 'neutral'
  disabled?: boolean
  id?: string
  className?: string
}

/**
 * Native <input type="range"> (full keyboard + screen-reader support for free) with a custom
 * track, a filled portion, a value bubble that appears while dragging/focused, and ticks.
 */
export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  format = 'number',
  ticks,
  hint,
  aside,
  tone = 'holds',
  disabled,
  id,
  className,
}: SliderProps) {
  const uid = useId()
  const inputId = id ?? `${uid}-range`
  const hintId = hint ? `${uid}-hint` : undefined
  const [active, setActive] = useState(false)
  const pct = max > min ? Math.min(1, Math.max(0, (value - min) / (max - min))) : 0
  const text = formatValue(value, format)
  const style = { '--pct': pct } as CSSProperties

  return (
    <div className={cx('slider', `slider--${tone}`, active && 'is-active', disabled && 'is-disabled', className)} style={style}>
      <div className="field__row">
        <label className="field__label" htmlFor={inputId}>
          {label}
        </label>
        {aside}
        <output className="field__value num" htmlFor={inputId} aria-hidden="true">
          {text}
        </output>
      </div>
      <div className="slider__control">
        <div className="slider__track" aria-hidden="true">
          <div className="slider__fill" />
        </div>
        <input
          id={inputId}
          className="slider__input"
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          aria-valuetext={text}
          aria-describedby={hintId}
          onChange={(e) => onChange(Number(e.currentTarget.value))}
          onPointerDown={() => setActive(true)}
          onPointerUp={() => setActive(false)}
          onPointerCancel={() => setActive(false)}
          onBlur={() => setActive(false)}
        />
        <div className="slider__bubble num" aria-hidden="true">
          {text}
        </div>
      </div>
      {ticks && ticks.length > 0 && (
        <div className="slider__ticks" aria-hidden="true">
          {ticks.map((t) => {
            const tk = typeof t === 'number' ? { value: t } : t
            const p = (tk.value - min) / (max - min)
            return (
              <span
                key={tk.value}
                className={cx('slider__tick', tk.value <= value && 'is-passed')}
                style={{ '--tick': p } as CSSProperties}
              >
                <i />
                <span className="num">{tk.label ?? formatValue(tk.value, format)}</span>
              </span>
            )
          })}
        </div>
      )}
      {hint && (
        <p className="field__hint" id={hintId}>
          {hint}
        </p>
      )}
    </div>
  )
}
