import { AnimatePresence, m as motion } from 'framer-motion'
import type { ReactNode } from 'react'
import type { PlanInputs, SimulationResult } from '../../engine/types'
import { useStore } from '../../state/store'
import { percent, points } from '../format'
import { ease, rise, stagger } from '../motion'
import { AnimatedNumber, Badge, Skeleton, Stat, cx } from '../primitives'
import { returnStats } from '../realStats'
import { outcomeColor, outcomeTextColor } from '../outcomeScale'
import { toneFor, VERDICT_THRESHOLDS, verdictLevel, type VerdictLevel } from '../verdict'
import { cityName } from './cards'

/** "living in Bangkok from age 55" / "in St. Louis, moving to Lisbon at 60" / "staying in St. Louis". */
export function placePhrase(i: PlanInputs): string {
  const home = cityName(i.homeCityId)
  if (!i.destCityId) return `staying in ${home}`
  const dest = cityName(i.destCityId)
  return i.moveInYears > 0 ? `in ${home}, moving to ${dest} at ${i.age + i.moveInYears}` : `living in ${dest} from age ${i.age}`
}

function headline(level: VerdictLevel): { lead: ReactNode; tail: ReactNode } {
  switch (level) {
    case 'holds':
      return {
        lead: (
          <>
            Your plan <em>holds</em> in
          </>
        ),
        tail: (
          <>
            of <em>futures.</em>
          </>
        ),
      }
    case 'mostly':
      return {
        lead: (
          <>
            Your plan <em>mostly holds:</em> it gets through
          </>
        ),
        tail: <>of futures.</>,
      }
    case 'fragile':
      return {
        lead: (
          <>
            Your plan is <em>fragile:</em> it holds in only
          </>
        ),
        tail: <>of futures.</>,
      }
    default:
      return {
        lead: (
          <>
            Your plan <em>breaks</em> in most futures. Only
          </>
        ),
        tail: (
          <>
            <em>hold.</em>
          </>
        ),
      }
  }
}

/** Why a weak plan fails, in one sentence, from the result itself. */
export function diagnosis(r: SimulationResult): string | null {
  const i = r.inputs
  const exp = returnStats(r.stats).expReturn
  const nominal = r.stats.expReturn
  if (r.successRate >= VERDICT_THRESHOLDS.mostly) return null
  if (nominal < i.loanRate)
    return `The loan costs ${pct1(i.loanRate)} a year but this portfolio is expected to earn about ${pct1(nominal)}: the debt compounds faster than the assets securing it, so in most futures it catches up with them.`
  if (r.brokenRate > r.bruisedRate && exp < 0.03)
    return `With an expected real return near ${pct1(exp)}, spending plus interest outruns growth in most futures.`
  return null
}
const pct1 = (x: number) => `${(x * 100).toFixed(1).replace(/\.0$/, '')}%`

export function VerdictHero() {
  const inputs = useStore((s) => s.inputs)
  const result = useStore((s) => s.result)
  const status = useStore((s) => s.status)
  const error = useStore((s) => s.error)
  const baseline = useStore((s) => s.baseline)

  const shown = result?.inputs ?? inputs
  const { age, horizonYears: horizon } = shown
  const holds = result?.successRate ?? 0
  const tone = result ? toneFor(holds) : 'holds'
  const level = result ? verdictLevel(holds) : 'holds'
  const { lead, tail } = headline(level)
  const why = result ? diagnosis(result) : null
  // Same continuous scale as the Atlas, so a city's color matches everywhere.
  const toneStyle = result ? { ['--tone' as string]: outcomeColor(holds), ['--tone-text' as string]: outcomeTextColor(holds) } : undefined
  const n = Math.round(holds * 100)
  const dots = result?.outcomeDots ?? null
  const counts = [0, 0, 0]
  for (const d of dots ?? []) counts[d]++

  const dest = shown.destCityId
  const showChip = !!dest && !!result
  const delta = baseline && result ? result.successRate - baseline.successRate : 0

  return (
    <motion.section
      className={cx('verdict', `verdict--${tone}`, !result && 'is-loading')}
      variants={stagger(0.08, 0.05)}
      initial="hidden"
      animate="show"
      style={toneStyle}
      aria-labelledby="verdict-h"
      aria-busy={status === 'running'}
    >
      <motion.div className="verdict__meta" variants={rise}>
        <span className="t-eyebrow">
          The verdict · {horizon} years, age {age} → {age + horizon}
        </span>
        <AnimatePresence initial={false}>
          {status === 'running' && (
            <motion.span key="run" className="verdict__status" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <span className="verdict__status-dot" aria-hidden="true" />
              {result ? 'Recomputing' : `Simulating ${shown.paths.toLocaleString('en-US')} futures`}
            </motion.span>
          )}
          {status === 'error' && (
            <motion.span key="err" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Badge tone="broken">Simulation failed: {error}</Badge>
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>

      <h1 id="verdict-h" className="verdict__headline">
        <motion.span className="verdict__lead t-display" variants={rise}>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span key={level} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.45, ease }}>
              {lead}
            </motion.span>
          </AnimatePresence>
        </motion.span>
        <motion.span className="verdict__number t-hero" variants={rise}>
          {result ? (
            <>
              <AnimatedNumber value={holds} from={0} format={(v) => String(Math.round(v * 100))} duration={1.2} aria-label={percent(holds)} />
              <span className="verdict__pct" aria-hidden="true">
                %
              </span>
            </>
          ) : (
            <Skeleton className="verdict__num-skel" width="1.25em" height="0.78em" radius="0.12em" />
          )}
        </motion.span>
        <motion.span className="verdict__tail t-display" variants={rise}>
          {tail}
        </motion.span>
      </h1>

      <motion.p className="t-lede verdict__lede" variants={rise}>
        Over {horizon} years, age {age} to {age + horizon}, {placePhrase(shown)}.{' '}
        {result ? (
          level === 'breaks' ? (
            <>
              {n === 0 ? 'Not one in a hundred simulated markets gets through without a forced sale' : `Only ${n} of every 100 simulated markets get through without a forced sale`}
              {result.brokenRate > result.bruisedRate ? '; in most the loan overtakes the portfolio.' : '; most hit the margin-call line first.'}
            </>
          ) : (
            <>
              In {n} of every 100 simulated markets you never face a forced sale and stay solvent to {age + horizon}.
            </>
          )
        ) : (
          <>Running thousands of market histories through your plan…</>
        )}
        {why && <span className="verdict__why"> {why}</span>}
      </motion.p>

      {showChip && (
        <motion.div className="verdict__compare" variants={rise}>
          {baseline ? (
            <span className="cmp" aria-label={`Staying in ${cityName(baseline.homeCityId)}: ${percent(baseline.successRate)}. In ${cityName(dest)}: ${percent(holds)}.`}>
              <span className="cmp__city">
                {cityName(baseline.homeCityId)} <b className="num">{percent(baseline.successRate)}</b>
              </span>
              <span className="cmp__arrow" aria-hidden="true">
                →
              </span>
              <span className="cmp__city cmp__city--dest">
                {cityName(dest)} <b className="num">{percent(holds)}</b>
              </span>
              <span className={cx('cmp__delta num', delta > 0.005 ? 'is-up' : delta < -0.005 ? 'is-down' : '')}>{points(delta, 0)}</span>
            </span>
          ) : (
            <Skeleton width={260} height={34} radius={999} />
          )}
        </motion.div>
      )}

      {/* Stats use the dot counts so the three figures always sum to 100. */}
      <motion.div
        className="verdict__dots"
        variants={rise}
        role="img"
        aria-label={
          result
            ? `${counts[0]} of 100 futures hold, ${counts[1]} survive a margin call, ${counts[2]} break.`
            : 'Loading outcomes'
        }
      >
        {Array.from({ length: 100 }, (_, i) => {
          const d = dots?.[i]
          return (
            <motion.i
              key={i}
              className={cx('dot', d === undefined ? 'dot--pending' : d === 0 ? 'dot--holds' : d === 1 ? 'dot--bruised' : 'dot--broken')}
              style={{ ['--i' as string]: i }}
              initial={{ opacity: 0, scale: 0.2 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.006, type: 'spring', stiffness: 500, damping: 24 }}
            />
          )
        })}
      </motion.div>

      <motion.div className="verdict__stats" variants={rise}>
        {result ? (
          <>
            <Stat label="Holds" tone="holds" value={counts[0] / 100} format="percent" hint="Never forced to sell" size="sm" />
            <Stat label="Bruised" tone="bruised" value={counts[1] / 100} format="percent" hint="Margin call, survived" size="sm" />
            <Stat label="Broken" tone="broken" value={counts[2] / 100} format="percent" hint="Loan overtook assets" size="sm" />
          </>
        ) : (
          [0, 1, 2].map((k) => (
            <div key={k} className="stat stat--sm">
              <Skeleton width={60} height={10} />
              <Skeleton width={70} height={30} radius={8} style={{ marginTop: 10 }} />
            </div>
          ))
        )}
      </motion.div>
    </motion.section>
  )
}
