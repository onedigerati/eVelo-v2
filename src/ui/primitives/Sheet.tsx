import { AnimatePresence, motion, useDragControls, type PanInfo } from 'framer-motion'
import { useEffect, useId, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useScrollLock } from '../hooks'
import { ease } from '../motion'
import { cx } from './cx'

export interface SheetProps {
  open: boolean
  onClose: () => void
  /** 'bottom' = mobile bottom sheet; 'left' / 'right' = drawer. */
  side?: 'bottom' | 'left' | 'right'
  title: ReactNode
  /** Visually hide the title (still labels the dialog). */
  hideTitle?: boolean
  children: ReactNode
  className?: string
}

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])'

/**
 * Modal sheet/drawer. Drag the handle (bottom) or the panel (sides) to dismiss; Escape and
 * the backdrop close it; focus is trapped while open and restored on close.
 */
export function Sheet({ open, onClose, side = 'bottom', title, hideTitle, children, className }: SheetProps) {
  const uid = useId()
  const panel = useRef<HTMLDivElement>(null)
  const restore = useRef<HTMLElement | null>(null)
  const drag = useDragControls()
  useScrollLock(open)

  useEffect(() => {
    if (!open) return
    restore.current = document.activeElement as HTMLElement | null
    const raf = requestAnimationFrame(() => {
      const first = panel.current?.querySelector<HTMLElement>('[data-autofocus]') ?? panel.current
      first?.focus({ preventScroll: true })
    })
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
      } else if (e.key === 'Tab' && panel.current) {
        const els = Array.from(panel.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null)
        if (!els.length) return
        const first = els[0]
        const last = els[els.length - 1]
        if (e.shiftKey && document.activeElement === first) (e.preventDefault(), last.focus())
        else if (!e.shiftKey && document.activeElement === last) (e.preventDefault(), first.focus())
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('keydown', onKey)
      restore.current?.focus?.({ preventScroll: true })
    }
  }, [open, onClose])

  const axis = side === 'bottom' ? 'y' : 'x'
  const off = side === 'bottom' ? { y: '100%' } : side === 'left' ? { x: '-100%' } : { x: '100%' }
  const onDragEnd = (_: unknown, info: PanInfo) => {
    const d = side === 'bottom' ? info.offset.y : side === 'left' ? -info.offset.x : info.offset.x
    const v = side === 'bottom' ? info.velocity.y : side === 'left' ? -info.velocity.x : info.velocity.x
    if (d > 110 || v > 550) onClose()
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className={cx('sheet-root', `sheet-root--${side}`)}>
          <motion.div
            className="sheet-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${uid}-t`}
            tabIndex={-1}
            className={cx('sheet', `sheet--${side}`, className)}
            initial={off}
            animate={{ x: 0, y: 0 }}
            exit={{ ...off, transition: { duration: 0.28, ease: [0.4, 0, 1, 1] } }}
            transition={{ type: 'spring', stiffness: 380, damping: 40 }}
            drag={axis}
            dragListener={side !== 'bottom'}
            dragControls={drag}
            dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
            dragElastic={
              side === 'bottom' ? { top: 0.04, bottom: 0.7 } : side === 'left' ? { left: 0.7, right: 0.04 } : { left: 0.04, right: 0.7 }
            }
            dragMomentum={false}
            onDragEnd={onDragEnd}
          >
            {side === 'bottom' && (
              <div className="sheet__grabber" onPointerDown={(e) => drag.start(e)} aria-hidden="true">
                <span />
              </div>
            )}
            <header className={cx('sheet__header', hideTitle && 'sr-only')}>
              <h2 className="t-h2" id={`${uid}-t`}>
                {title}
              </h2>
              <button type="button" className="icon-btn sheet__close" aria-label="Close" onClick={onClose}>
                <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </header>
            <div className="sheet__body">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
