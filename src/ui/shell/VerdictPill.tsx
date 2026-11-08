import { m as motion } from 'framer-motion'
import { useLayoutEffect, useRef, type ReactNode } from 'react'
import { hasHoldings } from '../../state/sim'
import { selectSuccess, useStore } from '../../state/store'
import { IconArrowRight } from '../icons'
import { AnimatedNumber, cx } from '../primitives'
import { outcomeTextColor } from '../outcomeScale'
import { toneFor } from '../verdict'
import { useKeyboardDock } from './keyboardDock'

/**
 * Sticky slot for the pill. While the on-screen keyboard has panned the page top out of view
 * (iOS), the pill is pinned to the top of the visible area so the verdict stays in sight while
 * typing; a spacer of the same height keeps the form from jumping.
 */
function PillSlot({ children }: { children: ReactNode }) {
  const dockTop = useKeyboardDock()
  const wrap = useRef<HTMLDivElement>(null)
  const height = useRef(0)
  useLayoutEffect(() => {
    if (dockTop === null && wrap.current) height.current = wrap.current.offsetHeight
  })
  const docked = dockTop !== null
  return (
    <>
      {docked && <div style={{ height: height.current }} aria-hidden="true" />}
      <div
        ref={wrap}
        className={cx('verdict-pill-wrap', docked && 'is-docked')}
        style={docked ? { transform: `translateY(${dockTop}px)` } : undefined}
      >
        {children}
      </div>
    </>
  )
}

/** Compact live verdict, sticky at the top of the phone Plan tab. Taps through to Outlook. */
export function VerdictPill() {
  const success = useStore(selectSuccess)
  const status = useStore((s) => s.status)
  const empty = useStore((s) => !hasHoldings(s.inputs))
  const tone = toneFor(success)
  if (empty)
    return (
      <PillSlot>
        <span className="verdict-pill verdict-pill--empty" role="status">
          <span className="verdict-pill__text">Add a holding to see your verdict</span>
        </span>
      </PillSlot>
    )
  const r = 9
  const c = 2 * Math.PI * r
  return (
    <PillSlot>
      <a
        href="#outlook"
        className={cx('verdict-pill', `verdict-pill--${tone}`, status === 'running' && 'is-running')}
        style={{ ['--tone' as string]: outcomeTextColor(success) }}
        aria-label={`Holds in ${Math.round(success * 100)}% of futures. See the outlook.`}
      >
        <svg className="verdict-pill__ring" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r={r} fill="none" stroke="var(--hairline-strong)" strokeWidth="2.5" />
          <motion.circle
            cx="12"
            cy="12"
            r={r}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={c}
            initial={{ strokeDashoffset: c }}
            animate={{ strokeDashoffset: c * (1 - success) }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            transform="rotate(-90 12 12)"
          />
        </svg>
        <span className="verdict-pill__text">
          Holds in <AnimatedNumber className="verdict-pill__num" value={success} format="percent" /> of futures
        </span>
        <IconArrowRight size={16} className="verdict-pill__go" />
      </a>
    </PillSlot>
  )
}
