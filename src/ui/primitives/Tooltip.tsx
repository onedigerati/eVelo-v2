import { AnimatePresence, m as motion } from 'framer-motion'
import { cloneElement, isValidElement, useEffect, useId, useRef, useState, type ReactElement, type ReactNode } from 'react'
import { ease } from '../motion'
import { cx } from './cx'

export interface TooltipProps {
  content: ReactNode
  /** A single focusable element; it receives aria-describedby. */
  children: ReactElement<{ 'aria-describedby'?: string }>
  side?: 'top' | 'bottom'
  delay?: number
  className?: string
}

/** Hover/focus tooltip. Escape dismisses. Rendered inline so scoped themes apply. */
export function Tooltip({ content, children, side = 'top', delay = 260, className }: TooltipProps) {
  const id = useId()
  const [open, setOpen] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const show = (d = delay) => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setOpen(true), d)
  }
  const hide = () => {
    clearTimeout(timer.current)
    setOpen(false)
  }
  useEffect(() => () => clearTimeout(timer.current), [])
  useEffect(() => {
    if (!open) return
    const k = (e: globalThis.KeyboardEvent) => e.key === 'Escape' && hide()
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [open])

  const child = isValidElement(children) ? cloneElement(children, { 'aria-describedby': open ? id : undefined }) : children
  return (
    <span
      className={cx('tip', className)}
      onPointerEnter={(e) => e.pointerType === 'mouse' && show()}
      onPointerLeave={hide}
      onFocus={() => show(0)}
      onBlur={hide}
    >
      {child}
      <AnimatePresence>
        {open && (
          <motion.span
            role="tooltip"
            id={id}
            className={cx('tip__bubble', `tip__bubble--${side}`)}
            initial={{ opacity: 0, y: side === 'top' ? 4 : -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.1 } }}
            transition={{ duration: 0.18, ease }}
          >
            {content}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  )
}

/**
 * Small "i" affordance that explains a term. Tap toggles (touch), hover/focus shows (mouse,
 * keyboard). The explanation is also exposed as the button's description.
 */
export function InfoTip({ children, label = 'More info', side = 'top' }: { children: ReactNode; label?: string; side?: 'top' | 'bottom' }) {
  const id = useId()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false)
    const k = (e: globalThis.KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', onDown)
    window.addEventListener('keydown', k)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      window.removeEventListener('keydown', k)
    }
  }, [open])
  return (
    <span
      className="tip infotip"
      ref={ref}
      onPointerEnter={(e) => e.pointerType === 'mouse' && setOpen(true)}
      onPointerLeave={(e) => e.pointerType === 'mouse' && setOpen(false)}
    >
      <button
        type="button"
        className="infotip__btn"
        aria-label={label}
        aria-expanded={open}
        aria-describedby={id}
        onClick={() => setOpen((o) => !o)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
          <circle cx="8" cy="8" r="6.75" fill="none" stroke="currentColor" strokeWidth="1.25" />
          <path d="M8 7.25v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="8" cy="4.9" r="0.95" fill="currentColor" />
        </svg>
      </button>
      {/* Always in the DOM (visually hidden when closed) so aria-describedby resolves. */}
      <span id={id} role="tooltip" className={cx('tip__bubble', `tip__bubble--${side}`, 'infotip__bubble', open && 'is-open')}>
        {children}
      </span>
    </span>
  )
}
