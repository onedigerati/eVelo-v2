import { motion } from 'framer-motion'
import { rise, stagger } from '../motion'
import { Badge, Card, Skeleton } from '../primitives'
import '../views.css'

/** Atlas: world map + city ranking (Stage 5). Frames only for now. */
export function AtlasView() {
  return (
    <motion.div className="page" variants={stagger(0.07)} initial="hidden" animate="show">
      <motion.header className="page__header" variants={rise}>
        <div className="t-eyebrow">The atlas</div>
        <h1 className="t-display">
          Where your money goes <em>furthest</em>
        </h1>
        <p className="t-lede">
          The same lifestyle, priced in cities around the world — ranked by how often your plan holds there, with currency risk
          included.
        </p>
      </motion.header>
      <motion.div variants={rise}>
        <Card eyebrow="World map" title="Success by city" actions={<Badge tone="neutral">Soon</Badge>} padding="md">
          <div className="atlas__map" aria-hidden="true">
            <svg viewBox="0 0 200 100" preserveAspectRatio="none">
              {Array.from({ length: 9 }, (_, i) => (
                <line key={`h${i}`} x1="0" x2="200" y1={(i + 1) * 10} y2={(i + 1) * 10} stroke="var(--chart-grid)" vectorEffect="non-scaling-stroke" />
              ))}
              {Array.from({ length: 11 }, (_, i) => (
                <line key={`v${i}`} y1="0" y2="100" x1={(i + 1) * (200 / 12)} x2={(i + 1) * (200 / 12)} stroke="var(--chart-grid)" vectorEffect="non-scaling-stroke" />
              ))}
            </svg>
          </div>
        </Card>
      </motion.div>
      <motion.div variants={rise}>
        <Card eyebrow="Ranking" title="Cities, best odds first">
          <ol className="atlas__rows" role="list">
            {Array.from({ length: 6 }, (_, i) => (
              <li key={i} className="atlas__row">
                <span className="num ink-3">{String(i + 1).padStart(2, '0')}</span>
                <Skeleton width={`${46 - i * 4}%`} height={12} />
                <Skeleton width={56} height={12} style={{ marginLeft: 'auto' }} />
              </li>
            ))}
          </ol>
        </Card>
      </motion.div>
    </motion.div>
  )
}
