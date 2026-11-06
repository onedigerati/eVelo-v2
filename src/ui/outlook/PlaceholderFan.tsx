import { scaleLinear } from 'd3-scale'
import { area, curveMonotoneX, line } from 'd3-shape'
import { motion } from 'framer-motion'
import { useMemo } from 'react'

const W = 640
const H = 260
const PAD = { t: 12, r: 8, b: 24, l: 8 }

/**
 * Decorative fan chart drawn from synthetic bands, so the chart tokens (band fills, median
 * line, grid) are visible before the engine exists. Stage 4 replaces this with the real chart.
 */
export function PlaceholderFan({ years = 30, className }: { years?: number; className?: string }) {
  const paths = useMemo(() => {
    const ts = Array.from({ length: years + 1 }, (_, i) => i)
    const mid = (t: number) => Math.pow(1.034, t)
    const spread = (t: number, z: number) => mid(t) * Math.exp(z * 0.085 * Math.sqrt(t))
    const x = scaleLinear().domain([0, years]).range([PAD.l, W - PAD.r])
    const y = scaleLinear()
      .domain([0, spread(years, 1.65)])
      .range([H - PAD.b, PAD.t])
    const band = (lo: number, hi: number) =>
      area<number>()
        .x((t) => x(t))
        .y0((t) => y(spread(t, lo)))
        .y1((t) => y(spread(t, hi)))
        .curve(curveMonotoneX)(ts) ?? ''
    return {
      outer: band(-1.65, 1.65),
      inner: band(-0.67, 0.67),
      median:
        line<number>()
          .x((t) => x(t))
          .y((t) => y(mid(t)))
          .curve(curveMonotoneX)(ts) ?? '',
      grid: y.ticks(4).map((v) => y(v)),
      xticks: [0, 10, 20, 30].filter((t) => t <= years).map((t) => ({ t, x: x(t) })),
    }
  }, [years])

  return (
    <svg className={className} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
      {paths.grid.map((gy) => (
        <line key={gy} x1={0} x2={W} y1={gy} y2={gy} stroke="var(--chart-grid)" vectorEffect="non-scaling-stroke" />
      ))}
      <motion.path
        d={paths.outer}
        fill="var(--chart-band-1)"
        initial={{ opacity: 0, scaleY: 0.2 }}
        animate={{ opacity: 1, scaleY: 1 }}
        style={{ transformOrigin: `0px ${H - PAD.b}px` }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
      />
      <motion.path
        d={paths.inner}
        fill="var(--chart-band-2)"
        initial={{ opacity: 0, scaleY: 0.2 }}
        animate={{ opacity: 1, scaleY: 1 }}
        style={{ transformOrigin: `0px ${H - PAD.b}px` }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
      />
      <motion.path
        d={paths.median}
        fill="none"
        stroke="var(--chart-line)"
        strokeWidth={2}
        vectorEffect="non-scaling-stroke"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.4, ease: [0.65, 0, 0.35, 1], delay: 0.35 }}
      />
      <line x1={0} x2={W} y1={H - PAD.b} y2={H - PAD.b} stroke="var(--chart-grid-strong)" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}
