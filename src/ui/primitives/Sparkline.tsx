import { useId } from 'react'
import { cx } from './cx'

export interface SparklineProps {
  /** Values normalized to 0..1 (or any range; they are rescaled). */
  values: number[]
  width?: number
  height?: number
  /** Stroke colour; defaults to currentColor. */
  color?: string
  /** Soft fill under the line. */
  area?: boolean
  className?: string
  'aria-label'?: string
}

/** Tiny line chart. Decorative unless given an aria-label. */
export function Sparkline({ values, width = 64, height = 22, color = 'currentColor', area = true, className, ...aria }: SparklineProps) {
  const gid = useId().replace(/:/g, '')
  if (values.length < 2) return <svg width={width} height={height} className={cx('spark', className)} aria-hidden="true" />
  const lo = Math.min(...values)
  const hi = Math.max(...values)
  const pad = 2
  const x = (i: number) => pad + (i / (values.length - 1)) * (width - pad * 2)
  const y = (v: number) => height - pad - (hi > lo ? (v - lo) / (hi - lo) : 0.5) * (height - pad * 2)
  const line = values.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join('')
  const fill = `${line}L${x(values.length - 1).toFixed(1)},${height}L${x(0).toFixed(1)},${height}Z`
  const last = values[values.length - 1]
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cx('spark', className)}
      role={aria['aria-label'] ? 'img' : undefined}
      aria-label={aria['aria-label']}
      aria-hidden={aria['aria-label'] ? undefined : true}
      style={color === 'currentColor' ? undefined : { color }}
    >
      {area && (
        <>
          <defs>
            <linearGradient id={`${gid}-g`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="currentColor" stopOpacity="0.22" />
              <stop offset="1" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={fill} fill={`url(#${gid}-g)`} />
        </>
      )}
      <path d={line} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={x(values.length - 1)} cy={y(last)} r="2" fill="currentColor" />
    </svg>
  )
}
