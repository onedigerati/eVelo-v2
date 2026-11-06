import { m as motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { useStore } from '../../state/store'
import { rise } from '../motion'
import { Card, Skeleton, cx } from '../primitives'

export interface ChartFrameProps {
  eyebrow: ReactNode
  title: ReactNode
  /** One sentence that interprets the data. */
  subtitle?: ReactNode
  actions?: ReactNode
  /** CSS aspect ratio of the skeleton shown before data lands. */
  aspect?: string
  span?: 'full' | 'half'
  children?: ReactNode
  className?: string
  /** Extra "stale" signal (e.g. solver still running) on top of the global recompute state. */
  stale?: boolean
}

/** Card frame every Outlook chart lives in. Without children it shows a reserved skeleton plot. */
export function ChartFrame({ eyebrow, title, subtitle, actions, aspect = '16 / 7', span = 'half', children, className, stale }: ChartFrameProps) {
  const running = useStore((s) => s.status === 'running')
  const empty = children === undefined || children === null || children === false
  return (
    <motion.div className={cx('chart-frame', `chart-frame--${span}`, (running || stale) && !empty && 'is-stale', className)} variants={rise}>
      <Card eyebrow={eyebrow} title={title} subtitle={subtitle} actions={actions}>
        <div className={cx('chart-frame__plot', empty && 'is-empty')} style={empty ? { aspectRatio: aspect } : undefined}>
          {empty ? (
            <div className="chart-frame__empty">
              <ChartGhost />
              <Skeleton className="chart-frame__skel" height="100%" radius="var(--radius-md)" />
            </div>
          ) : (
            children
          )}
        </div>
      </Card>
    </motion.div>
  )
}

function ChartGhost() {
  return (
    <svg className="chart-frame__ghost" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true">
      {[8, 18, 28].map((y) => (
        <line key={y} x1="0" x2="100" y1={y} y2={y} stroke="var(--chart-grid)" vectorEffect="non-scaling-stroke" />
      ))}
      <line x1="0" x2="100" y1="38" y2="38" stroke="var(--chart-grid-strong)" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}
