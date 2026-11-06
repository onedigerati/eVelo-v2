import type { ReactNode } from 'react'
import { cx } from './cx'

export type Tone = 'holds' | 'bruised' | 'broken' | 'neutral'

export function Badge({ tone = 'neutral', dot, children, className }: { tone?: Tone; dot?: boolean; children: ReactNode; className?: string }) {
  return (
    <span className={cx('badge', `badge--${tone}`, className)}>
      {dot && <span className="badge__dot" aria-hidden="true" />}
      {children}
    </span>
  )
}
