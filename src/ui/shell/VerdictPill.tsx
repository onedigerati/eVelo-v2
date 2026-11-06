import { m as motion } from 'framer-motion'
import { selectSuccess, useStore } from '../../state/store'
import { IconArrowRight } from '../icons'
import { AnimatedNumber, cx } from '../primitives'
import { toneFor } from '../verdict'

/** Compact live verdict, sticky at the top of the phone Plan tab. Taps through to Outlook. */
export function VerdictPill() {
  const success = useStore(selectSuccess)
  const status = useStore((s) => s.status)
  const tone = toneFor(success)
  const r = 9
  const c = 2 * Math.PI * r
  return (
    <div className="verdict-pill-wrap">
      <a href="#outlook" className={cx('verdict-pill', `verdict-pill--${tone}`, status === 'running' && 'is-running')}>
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
    </div>
  )
}
