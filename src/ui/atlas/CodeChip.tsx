import { cx } from '../primitives'

/** Country as a small mono code chip (consistent everywhere; emoji flags don't render on every OS). */
export function CodeChip({ code, className }: { code: string; className?: string }) {
  return (
    <span className={cx('code-chip', className)} aria-hidden="true">
      {code}
    </span>
  )
}
