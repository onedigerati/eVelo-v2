import type { CSSProperties } from 'react'
import { cx } from './cx'

/** Shimmering placeholder block. Reserve the final size so nothing shifts when content lands. */
export function Skeleton({
  width = '100%',
  height = 14,
  radius,
  className,
  style,
}: {
  width?: number | string
  height?: number | string
  radius?: number | string
  className?: string
  style?: CSSProperties
}) {
  return <span className={cx('skeleton', className)} aria-hidden="true" style={{ width, height, borderRadius: radius, ...style }} />
}

/** A few stacked text lines. */
export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <span className={cx('skeleton-text', className)} aria-hidden="true">
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} width={i === lines - 1 ? '62%' : '100%'} height={10} />
      ))}
    </span>
  )
}
