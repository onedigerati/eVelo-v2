import { AnimatePresence, m as motion } from 'framer-motion'
import { cloneElement, isValidElement, useEffect, useId, useLayoutEffect, useRef, useState, type ReactElement, type ReactNode, type RefObject } from 'react'
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

const EDGE = 8

/** The visible box a bubble must fit in: the viewport, narrowed by every ancestor that clips. */
function clipBox(el: HTMLElement): { left: number; right: number; top: number; bottom: number } {
  const box = { left: 0, top: 0, right: window.innerWidth, bottom: window.innerHeight }
  for (let n = el.parentElement; n && n !== document.body; n = n.parentElement) {
    const cs = getComputedStyle(n)
    if (cs.overflowX === 'visible' && cs.overflowY === 'visible') continue
    const r = n.getBoundingClientRect()
    box.left = Math.max(box.left, r.left)
    box.right = Math.min(box.right, r.right)
    box.top = Math.max(box.top, r.top)
    box.bottom = Math.min(box.bottom, r.bottom)
  }
  return box
}

/**
 * Keeps an open bubble inside its clip box: shifts it sideways (--tip-shift) and flips it to the
 * other side of the trigger when there's no room on the preferred side.
 */
function useFitBubble(ref: RefObject<HTMLElement | null>, open: boolean, side: 'top' | 'bottom') {
  const [placed, setPlaced] = useState(side)
  useLayoutEffect(() => {
    const el = ref.current
    if (!open || !el) {
      setPlaced(side)
      return
    }
    const fit = () => {
      el.style.setProperty('--tip-shift', '0px')
      el.style.removeProperty('--tip-max')
      const box = clipBox(el)
      const avail = box.right - box.left - EDGE * 2
      if (avail > 0) el.style.setProperty('--tip-max', `${Math.floor(avail)}px`)
      const r = el.getBoundingClientRect()
      let shift = 0
      if (r.left < box.left + EDGE) shift = box.left + EDGE - r.left
      else if (r.right > box.right - EDGE) shift = box.right - EDGE - r.right
      el.style.setProperty('--tip-shift', `${Math.round(shift)}px`)
      const trigger = el.parentElement!.getBoundingClientRect()
      const h = r.height + EDGE
      const roomTop = trigger.top - box.top
      const roomBottom = box.bottom - trigger.bottom
      setPlaced(side === 'top' ? (roomTop < h && roomBottom > roomTop ? 'bottom' : 'top') : roomBottom < h && roomTop > roomBottom ? 'top' : 'bottom')
    }
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [open, side, ref])
  return placed
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
  const bubble = useRef<HTMLSpanElement>(null)
  const placed = useFitBubble(bubble, open, side)
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
            ref={bubble}
            role="tooltip"
            id={id}
            className={cx('tip__bubble', `tip__bubble--${placed}`)}
            initial={{ opacity: 0, y: placed === 'top' ? 4 : -4, scale: 0.97 }}
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
  const bubble = useRef<HTMLSpanElement>(null)
  const focusedAt = useRef(-Infinity)
  const placed = useFitBubble(bubble, open, side)
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
        onClick={() => {
          // A tap focuses the button (which opens it) and then clicks; don't let that click close it.
          if (performance.now() - focusedAt.current < 400) return setOpen(true)
          setOpen((o) => !o)
        }}
        onFocus={() => {
          focusedAt.current = performance.now()
          setOpen(true)
        }}
        onBlur={() => setOpen(false)}
      >
        <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
          <circle cx="8" cy="8" r="6.75" fill="none" stroke="currentColor" strokeWidth="1.25" />
          <path d="M8 7.25v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="8" cy="4.9" r="0.95" fill="currentColor" />
        </svg>
      </button>
      {/* Always in the DOM (visually hidden when closed) so aria-describedby resolves. */}
      <span ref={bubble} id={id} role="tooltip" className={cx('tip__bubble', `tip__bubble--${placed}`, 'infotip__bubble', open && 'is-open')}>
        {children}
      </span>
    </span>
  )
}
