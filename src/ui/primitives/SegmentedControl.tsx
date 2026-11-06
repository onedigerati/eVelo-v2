import { motion } from 'framer-motion'
import { useId, useRef, type KeyboardEvent, type ReactNode } from 'react'
import { spring } from '../motion'
import { cx } from './cx'

export interface SegmentOption<T extends string | number> {
  value: T
  label: ReactNode
  /** Accessible name when label is an icon. */
  ariaLabel?: string
  title?: string
}

export interface SegmentedControlProps<T extends string | number> {
  options: SegmentOption<T>[]
  value: T
  onChange: (v: T) => void
  'aria-label'?: string
  'aria-labelledby'?: string
  size?: 'sm' | 'md'
  /** Stretch segments to fill the container. */
  block?: boolean
  className?: string
}

/** Radio group with a springy sliding thumb (shared layoutId per instance). */
export function SegmentedControl<T extends string | number>({
  options,
  value,
  onChange,
  size = 'md',
  block,
  className,
  ...aria
}: SegmentedControlProps<T>) {
  const layoutId = `seg-${useId()}`
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const idx = Math.max(0, options.findIndex((o) => o.value === value))

  const onKey = (e: KeyboardEvent) => {
    const n = options.length
    let next = -1
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (idx + 1) % n
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (idx - 1 + n) % n
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = n - 1
    if (next >= 0) {
      e.preventDefault()
      onChange(options[next].value)
      refs.current[next]?.focus()
    }
  }

  return (
    <div role="radiogroup" className={cx('seg', `seg--${size}`, block && 'seg--block', className)} onKeyDown={onKey} {...aria}>
      {options.map((o, i) => {
        const selected = i === idx
        return (
          <button
            key={String(o.value)}
            ref={(el) => {
              refs.current[i] = el
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={o.ariaLabel}
            title={o.title}
            tabIndex={selected ? 0 : -1}
            className={cx('seg__opt', selected && 'is-selected')}
            onClick={() => onChange(o.value)}
          >
            {selected && <motion.span layoutId={layoutId} className="seg__thumb" transition={spring} aria-hidden="true" />}
            <span className="seg__label">{o.label}</span>
          </button>
        )
      })}
    </div>
  )
}
