import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { rise } from '../motion'
import { Card, Skeleton, cx } from '../primitives'

export interface ChartFrameProps {
  eyebrow: string
  title: ReactNode
  subtitle?: ReactNode
  actions?: ReactNode
  /** CSS aspect ratio of the plot area, reserved up front so nothing shifts. */
  aspect?: string
  span?: 'full' | 'half'
  children?: ReactNode
  className?: string
}

/** Card frame every Outlook chart lives in. Without children it shows a reserved skeleton plot. */
export function ChartFrame({ eyebrow, title, subtitle, actions, aspect = '16 / 7', span = 'half', children, className }: ChartFrameProps) {
  return (
    <motion.div className={cx('chart-frame', `chart-frame--${span}`, className)} variants={rise}>
      <Card eyebrow={eyebrow} title={title} subtitle={subtitle} actions={actions}>
        <div className="chart-frame__plot" style={{ aspectRatio: aspect }}>
          {children ?? (
            <div className="chart-frame__empty">
              <ChartGhost />
              <Skeleton className="chart-frame__skel" height="100%" radius="var(--radius-md)" />
            </div>
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
