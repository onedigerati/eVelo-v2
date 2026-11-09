import { m as motion } from 'framer-motion'
import { useMemo } from 'react'
import { compareYears, planRetireIn, withRetireIn, type CompareEntry } from '../../state/retireCompare'
import { inputsKey } from '../../state/sim'
import { useStore } from '../../state/store'
import { currencyCompact } from '../format'
import { ease, rise } from '../motion'
import { outcomeColor } from '../outcomeScale'
import { Skeleton, cx } from '../primitives'

/** "Now" / "In 1 yr" / "In 4 yrs" */
export function whenLabel(years: number): string {
  return years === 0 ? 'Now' : `In ${years} ${years === 1 ? 'yr' : 'yrs'}`
}

/** Odds as the verdict shows them: a whole percent. */
const oddsText = (s: number) => `${Math.round(s * 100)}%`

/** The card's accessible name: "Retire in 4 years, at age 59: 87% of futures hold, safe spending $146K a year". */
export function cardName(years: number, age: number, e: CompareEntry | undefined, plan: boolean): string {
  const when = years === 0 ? 'Retire now' : `Retire in ${years} ${years === 1 ? 'year' : 'years'}`
  const head = `${when}, at age ${age}${plan ? ' (your plan)' : ''}`
  if (e?.failed && (e.successRate == null || e.maxSpend == null)) return `${head}: couldn't compute`
  if (e?.successRate == null) return `${head}: computing`
  const odds = `${oddsText(e.successRate)} of futures hold`
  return `${head}: ${odds}, ${e.maxSpend == null ? 'safe spending computing' : `safe spending ${currencyCompact(e.maxSpend)} a year`}`
}

function OddsRing({ success }: { success: number | null }) {
  const r = 24
  const c = 2 * Math.PI * r
  return (
    <svg className="rc-card__ring" width="56" height="56" viewBox="0 0 56 56" aria-hidden="true">
      <circle cx="28" cy="28" r={r} fill="none" stroke="var(--hairline-strong)" strokeWidth="5" />
      {success != null && (
        <motion.circle
          cx="28"
          cy="28"
          r={r}
          fill="none"
          stroke={outcomeColor(success)}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - success) }}
          transition={{ duration: 0.9, ease }}
          transform="rotate(-90 28 28)"
        />
      )}
    </svg>
  )
}

/**
 * "When could you retire?": the plan at now / 2 / 4 / 5 years (those before the horizon), plus the
 * plan's own date when it isn't one of them. Figures come from the simulation client's comparison
 * runs (src/state/sim.ts), which are the main pipeline's own cached runs for each date.
 */
export function RetireCompare() {
  const inputs = useStore((s) => s.inputs)
  const compare = useStore((s) => s.compare)
  const setInput = useStore((s) => s.setInput)

  const cards = useMemo(() => compareYears(inputs).map((years) => ({ years, key: inputsKey(withRetireIn(inputs, years)) })), [inputs])
  const planYears = planRetireIn(inputs)

  return (
    <motion.section className="rc" aria-labelledby="rc-h" variants={rise} initial="hidden" animate="show">
      <div className="rc__head">
        <h2 id="rc-h" className="t-h2 rc__title">
          When could you <em>retire?</em>
        </h2>
        <span className="t-small rc__hint">Tap one to use it</span>
      </div>
      <div className="rc__grid" data-n={cards.length} style={{ ['--rc-n' as string]: cards.length }}>
        {cards.map(({ years, key }) => {
          const e = compare[key]
          const plan = years === planYears
          const age = inputs.age + years
          const failed = !!e?.failed
          return (
            <button
              key={years}
              type="button"
              className={cx('rc-card', plan && 'is-plan')}
              aria-pressed={plan}
              aria-label={cardName(years, age, e, plan)}
              aria-busy={!failed && (e?.successRate == null || e?.maxSpend == null)}
              onClick={() => !plan && setInput('retireInYears', years)}
            >
              <span className="rc-card__top">
                <OddsRing success={e?.successRate ?? null} />
                {plan && (
                  <span className="rc-card__mine" aria-hidden="true">
                    Your plan
                  </span>
                )}
              </span>
              <span className="rc-card__label">
                {whenLabel(years)} · age {age}
              </span>
              {e?.successRate != null ? (
                <span className="rc-card__odds">{oddsText(e.successRate)}</span>
              ) : failed ? (
                <span className="rc-card__odds ink-3">—</span>
              ) : (
                <Skeleton className="rc-card__odds-skel" width={72} height={36} radius={8} />
              )}
              <span className="rc-card__spend">
                Safe spending{' '}
                {e?.maxSpend != null ? (
                  <b className="num">{currencyCompact(e.maxSpend)}</b>
                ) : failed ? (
                  <b className="num">—</b>
                ) : (
                  <Skeleton width={44} height={12} style={{ verticalAlign: 'middle' }} />
                )}
              </span>
            </button>
          )
        })}
      </div>
      <p className="t-small rc__note">
        Each card reruns your plan with the same portfolio, budget and savings. Only the retirement date changes.
      </p>
    </motion.section>
  )
}
