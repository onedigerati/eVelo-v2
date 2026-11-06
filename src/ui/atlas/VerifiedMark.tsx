import { cx } from '../primitives'
import type { VerifiedLabel } from './picks'

/**
 * Quiet provenance marker for a city's cost data: "Verified Nov 2026" (source in the title) or
 * "Estimate". Decorative for screen readers when the parent already speaks `label.spoken`.
 */
export function VerifiedMark({ label, className, spoken }: { label: VerifiedLabel; className?: string; spoken?: boolean }) {
  return (
    <span className={cx('vmark', `vmark--${label.kind}`, className)} title={label.title} aria-hidden={spoken ? undefined : true}>
      <svg width="10" height="10" viewBox="0 0 12 12" aria-hidden="true" className="vmark__i">
        {label.kind === 'estimate' ? (
          <circle cx="6" cy="6" r="3.6" fill="none" stroke="currentColor" strokeWidth="1.3" strokeDasharray="2 1.6" />
        ) : (
          <path d="M2.6 6.3l2.2 2.2L9.4 3.8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        )}
      </svg>
      {label.kind === 'estimate' ? label.text : <><span className="vmark__w">Verified </span>{label.text.replace(/^Verified /, '')}</>}
      {label.kind === 'low' && <span className="vmark__low"> · thin data</span>}
    </span>
  )
}
