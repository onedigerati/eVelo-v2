import { AnimatePresence, m as motion } from 'framer-motion'
import { create } from 'zustand'
import { springSoft } from '../motion'
import { cx } from './cx'

export type ToastTone = 'neutral' | 'holds' | 'bruised' | 'broken'
interface ToastItem {
  id: number
  message: string
  detail?: string
  tone: ToastTone
}

const useToasts = create<{ items: ToastItem[] }>(() => ({ items: [] }))
let nextId = 1

/** Show a toast. Returns its id. */
export function toast(message: string, opts: { detail?: string; tone?: ToastTone; duration?: number } = {}) {
  const id = nextId++
  const item: ToastItem = { id, message, detail: opts.detail, tone: opts.tone ?? 'neutral' }
  useToasts.setState((s) => ({ items: [...s.items.slice(-2), item] }))
  setTimeout(() => dismissToast(id), opts.duration ?? 3200)
  return id
}
export function dismissToast(id: number) {
  useToasts.setState((s) => ({ items: s.items.filter((t) => t.id !== id) }))
}

const ICONS: Record<ToastTone, string> = {
  neutral: 'M8 4.5v4.25M8 11.1v.1',
  holds: 'M4 8.4l2.6 2.6L12 5.4',
  bruised: 'M8 4.5v4.25M8 11.1v.1',
  broken: 'M5.2 5.2l5.6 5.6M10.8 5.2l-5.6 5.6',
}

/** Mount once at the app root. Announces politely to screen readers. */
export function Toaster() {
  const items = useToasts((s) => s.items)
  return (
    <div className="toaster" role="status" aria-live="polite" aria-atomic="false">
      <AnimatePresence initial={false}>
        {items.map((t) => (
          <motion.div
            key={t.id}
            layout
            className={cx('toast', `toast--${t.tone}`)}
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96, transition: { duration: 0.18 } }}
            transition={springSoft}
            onClick={() => dismissToast(t.id)}
          >
            <span className="toast__icon" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 16 16">
                <path d={ICONS[t.tone]} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="toast__text">
              <span className="toast__msg">{t.message}</span>
              {t.detail && <span className="toast__detail">{t.detail}</span>}
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
