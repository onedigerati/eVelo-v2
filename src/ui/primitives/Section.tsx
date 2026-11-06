import { AnimatePresence, m as motion } from 'framer-motion'
import { useId, useState, type ReactNode } from 'react'
import { ease, spring } from '../motion'
import { cx } from './cx'

export interface SectionProps {
  title: ReactNode
  /** One-line summary shown when collapsed (e.g. "$5.0M · 3 holdings"). */
  summary?: ReactNode
  /** Small ordinal shown before the title, e.g. "01". */
  index?: string
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: ReactNode
  className?: string
  id?: string
}

export function Chevron({ open }: { open: boolean }) {
  return (
    <motion.svg
      className="chevron"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      aria-hidden="true"
      initial={false}
      animate={{ rotate: open ? 180 : 0 }}
      transition={spring}
    >
      <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </motion.svg>
  )
}

export function Section({ title, summary, index, defaultOpen = true, open: openProp, onOpenChange, children, className, id }: SectionProps) {
  const [openState, setOpenState] = useState(defaultOpen)
  const open = openProp ?? openState
  const uid = useId()
  const bodyId = `${uid}-body`
  const toggle = () => {
    const next = !open
    setOpenState(next)
    onOpenChange?.(next)
  }
  return (
    <section className={cx('section', open && 'is-open', className)} id={id}>
      <h3 className="section__h">
        <button type="button" className="section__head" aria-expanded={open} aria-controls={bodyId} onClick={toggle}>
          {index && <span className="section__index num">{index}</span>}
          <span className="section__titles">
            <span className="section__title">{title}</span>
            <AnimatePresence initial={false}>
              {!open && summary && (
                <motion.span
                  className="section__summary"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.25, ease }}
                >
                  {summary}
                </motion.span>
              )}
            </AnimatePresence>
          </span>
          <Chevron open={open} />
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={bodyId}
            className="section__body-wrap"
            // Clip only while animating so popovers (Select) can escape once open.
            initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
            animate={{ height: 'auto', opacity: 1, transitionEnd: { overflow: 'visible' } }}
            exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
            transition={{ height: { duration: 0.42, ease }, opacity: { duration: 0.28, ease } }}
          >
            <div className="section__body">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
