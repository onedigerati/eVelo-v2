import type { CSSProperties, ReactNode } from 'react'
import { cx } from './cx'

export interface StackSegment {
  key: string
  value: number
  color: string
  /** Accessible / tooltip label, e.g. "VTI 50%". */
  label: string
}

export interface StackBarProps {
  segments: StackSegment[]
  height?: number
  /** Accessible summary of the whole bar. */
  'aria-label': string
  className?: string
  children?: ReactNode
}

/**
 * Horizontal 100% stacked bar. Segments animate their widths (CSS flex-grow transition) and
 * are separated by a 2px surface gap. Exposed as one image with a text summary.
 */
export function StackBar({ segments, height = 10, className, ...aria }: StackBarProps) {
  const total = segments.reduce((s, x) => s + Math.max(0, x.value), 0) || 1
  return (
    <div className={cx('stackbar', className)} role="img" aria-label={aria['aria-label']} style={{ '--h': `${height}px` } as CSSProperties}>
      {segments.map((s) => (
        <span
          key={s.key}
          className="stackbar__seg"
          title={s.label}
          style={{ flexGrow: Math.max(0, s.value) / total, background: s.color } as CSSProperties}
        />
      ))}
    </div>
  )
}
