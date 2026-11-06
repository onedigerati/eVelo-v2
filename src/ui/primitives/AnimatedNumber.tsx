import { animate, useMotionValue, useReducedMotion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { formatValue, type FormatKind } from '../format'
import { ease } from '../motion'
import { cx } from './cx'

export interface AnimatedNumberProps {
  value: number
  format?: FormatKind
  /** Value to tween from on first mount (default: no mount animation). */
  from?: number
  duration?: number
  delay?: number
  className?: string
  /** Accessible text override; defaults to the formatted final value. */
  'aria-label'?: string
}

/**
 * Tweens between values without re-rendering React: the motion value writes straight to the
 * DOM text node. Screen readers get the final value (the animated text is aria-hidden).
 * Uses tabular figures so digits don't jitter while counting.
 */
export function AnimatedNumber({ value, format = 'number', from, duration = 0.9, delay = 0, className, ...aria }: AnimatedNumberProps) {
  const reduce = useReducedMotion()
  const mv = useMotionValue(from ?? value)
  const ref = useRef<HTMLSpanElement>(null)
  const fmt = useRef(format)
  fmt.current = format
  // React owns the initial text only; afterwards the motion value writes to the node, so the
  // JSX text must stay constant across renders or React would overwrite mid-tween.
  const initialText = useRef(formatValue(from !== undefined && !reduce ? from : value, format)).current

  useEffect(() => {
    const unsub = mv.on('change', (v) => {
      if (ref.current) ref.current.textContent = formatValue(v, fmt.current)
    })
    return unsub
  }, [mv])

  useEffect(() => {
    if (ref.current) ref.current.textContent = formatValue(mv.get(), fmt.current)
  }, [format, mv])

  useEffect(() => {
    if (reduce) {
      mv.jump(value)
      if (ref.current) ref.current.textContent = formatValue(value, fmt.current)
      return
    }
    const controls = animate(mv, value, { duration, delay, ease })
    return () => controls.stop()
  }, [value, reduce, duration, delay, mv])

  const final = formatValue(value, format)
  return (
    <span className={cx('anum', className)}>
      <span ref={ref} aria-hidden="true">
        {initialText}
      </span>
      <span className="sr-only">{aria['aria-label'] ?? final}</span>
    </span>
  )
}
