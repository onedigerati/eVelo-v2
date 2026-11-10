import { AnimatePresence, m as motion } from 'framer-motion'
import { useId, useMemo, useRef, useState } from 'react'
import { EXPAT_AS_OF, EXPAT_PICKS, EXPAT_RANKING_METHOD, EXPAT_RANKING_SOURCES, EXPAT_SCORE_LABELS, EXPAT_SCORE_RUBRIC } from '../../data/expatPicks'
import { currency, currencyCompact, percent } from '../format'
import { useBreakpoint } from '../hooks'
import { ease } from '../motion'
import { Card, Chevron, Skeleton, cx } from '../primitives'
import { costDelta, successColor, successTextColor, type Ranked } from './atlasData'
import { CodeChip } from './CodeChip'
import { SCORE_KEYS, isProfiled, longDate, pickViews, splitPicks, type PickView, type ProfiledPickView } from './picks'
import { ScoreDots } from './ScoreDots'
import { preloadOnIntent } from './photoLoad'

const FIRST = 6
/** Compact rows shown before "Show all". */
const FIRST_ROWS = 10

export interface TopPicksProps {
  rows: Ranked[]
  homeId: string
  destId: string | null
  onOpen: (cityId: string) => void
  onChoose: (cityId: string) => void
}

export function TopPicks({ rows, homeId, destId, onOpen, onChoose }: TopPicksProps) {
  const bp = useBreakpoint()
  const [all, setAll] = useState(false)
  const views = useMemo(() => pickViews(rows), [rows])
  const { cards: profiled, rest } = useMemo(() => splitPicks(views), [views])
  const year = EXPAT_AS_OF.slice(0, 4)
  // Phone: a swipeable row of every pick. Larger: a grid that reveals the rest.
  const scroller = bp === 'phone'
  const shown = scroller || all ? profiled : profiled.slice(0, FIRST)

  return (
    <Card
      className="atlas__picks"
      eyebrow={`Top picks for expat retirees · ${year}`}
      title={
        <>
          Where retirees <em>thrive</em>
        </>
      }
      subtitle="Ranked for a US retiree living on buy-borrow-die: tax on holding and passing on a portfolio, residency on assets, US-broker lending abroad and healthcare, on top of the main retirement indexes and expat surveys. Your plan’s odds are shown for each."
    >
      <ol className={cx('picks', scroller && 'picks--scroll')} aria-label={`Top ${profiled.length} of ${EXPAT_PICKS.length} picks`}>
        <AnimatePresence initial={false}>
          {shown.map((v, i) => (
            <PickCard key={v.pick.cityId} v={v} i={i % FIRST} homeId={homeId} destId={destId} onOpen={onOpen} />
          ))}
        </AnimatePresence>
      </ol>
      {!scroller && profiled.length > FIRST && (
        <div className="picks__more">
          <button type="button" className="chip-btn" aria-expanded={all} onClick={() => setAll((x) => !x)}>
            {all ? 'Show fewer' : `Show all top ${profiled.length}`}
            <Chevron open={all} />
          </button>
        </div>
      )}
      {scroller && <p className="picks__swipe t-small ink-3">Swipe for the top {profiled.length}.</p>}

      {rest.length > 0 && <AlsoList views={rest} homeId={homeId} destId={destId} onOpen={onOpen} onChoose={onChoose} />}
      <HowRanked />
    </Card>
  )
}

export function PickCard({
  v,
  i,
  homeId,
  destId,
  onOpen,
}: {
  v: ProfiledPickView<Ranked>
  i: number
  homeId: string
  destId: string | null
  onOpen: (cityId: string) => void
}) {
  const { pick, city, row } = v
  const p = pick.profile
  const isDest = pick.cityId === destId
  const isHome = pick.cityId === homeId
  const label = `Top pick ${pick.rank}: ${city.name}, ${city.country}. ${p.tagline}.${row ? ` Plan holds in ${percent(row.successRate)} of futures there, ${currency(row.spendUsd)} a year, ${costDelta(row.costRatio)} vs home.` : ''} Open profile.`
  return (
    <motion.li
      layout="position"
      className={cx('pick', isDest && 'is-dest')}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.6, ease, delay: i * 0.04 } }}
      exit={{ opacity: 0, y: 8, transition: { duration: 0.18 } }}
      style={row ? { ['--tone' as string]: successColor(row.successRate) } : undefined}
    >
      <div className="pick__top">
        <span className="pick__rank" aria-hidden="true">
          <i>No.</i>
          {pick.rank}
        </span>
        <span className="pick__odds" aria-hidden="true">
          {row ? (
            <>
              <b style={{ color: successTextColor(row.successRate) }}>
                {Math.round(row.successRate * 100)}
                <i>%</i>
              </b>
              <small>plan holds</small>
            </>
          ) : (
            <Skeleton width={56} height={30} radius={8} />
          )}
        </span>
      </div>
      <div className="pick__city">
        <CodeChip code={city.countryCode} />
        {/* Name and country: the country trims before the name does. */}
        <span className="pick__title">
          <button type="button" className="pick__open" onClick={() => onOpen(pick.cityId)} {...preloadOnIntent(pick.cityId)} aria-label={label}>
            {city.name}
          </button>
          {/* Decoration: the open button's label already names the country. */}
          <span className="pick__country" aria-hidden="true">
            {city.country}
          </span>
        </span>
        {isDest && <span className="crow__tag is-dest">Destination</span>}
        {isHome && <span className="crow__tag">Home</span>}
      </div>
      <p className="pick__tag">{p.tagline}</p>
      <ScoreDots scores={p.scores} className="pick__scores" />
      <div className="pick__foot" aria-hidden="true">
        <span>
          <b className="num">{row ? currencyCompact(row.spendUsd) : '—'}</b>
          <span className="ink-3"> a year</span>
        </span>
        {row && !isHome && (
          <span className={cx('pick__delta', row.costRatio < 0.995 && 'is-down', row.costRatio > 1.005 && 'is-up')}>
            <span className="num">{costDelta(row.costRatio)}</span> vs home
          </span>
        )}
        <span className="pick__go">Profile →</span>
      </div>
    </motion.li>
  )
}

function AlsoList({
  views,
  homeId,
  destId,
  onOpen,
  onChoose,
}: {
  views: PickView<Ranked>[]
  homeId: string
  destId: string | null
  onOpen: (cityId: string) => void
  onChoose: (cityId: string) => void
}) {
  const [all, setAll] = useState(false)
  const ref = useRef<HTMLElement>(null)
  const shown = all ? views : views.slice(0, FIRST_ROWS)
  const hidden = views.slice(FIRST_ROWS)
  const toggle = () => {
    // Collapsing from the bottom of 60 rows would leave the reader far below the list: bring its
    // heading back into view if it has scrolled off.
    const el = ref.current
    if (all && el && el.getBoundingClientRect().top < 0) requestAnimationFrame(() => el.scrollIntoView({ block: 'start', behavior: 'instant' }))
    setAll((x) => !x)
  }
  return (
    <section className="also" aria-labelledby="also-h" ref={ref}>
      <div className="also__h">
        <h3 id="also-h" className="t-eyebrow">
          Also worth a look · {views[0].pick.rank}–{views[views.length - 1].pick.rank}
        </h3>
        <span className="t-small ink-3">Tap one for its profile.</span>
      </div>
      <ol className="also__list">
        {shown.map((v) => {
          const { pick, city, row } = v
          const isDest = pick.cityId === destId
          const isHome = pick.cityId === homeId
          // Rows open the profile (Make destination lives there); a pick without one falls back to choosing it.
          const hasProfile = isProfiled(v)
          const status = isDest ? ' Your destination.' : isHome ? ' Your home.' : ''
          return (
            <li key={pick.cityId} className={cx('also__row', isDest && 'is-dest')}>
              <span className="also__rank num">{pick.rank}</span>
              <button
                type="button"
                className="also__main"
                onClick={() => (hasProfile ? onOpen : onChoose)(pick.cityId)}
                {...preloadOnIntent(hasProfile ? pick.cityId : undefined)}
                aria-label={
                  hasProfile
                    ? `Top pick ${pick.rank}: ${city.name}, ${city.country}.${status}${row ? ` Plan holds in ${percent(row.successRate)}.` : ''} ${pick.why} Open profile.`
                    : `${isDest ? 'Your destination' : 'Make destination'}: ${city.name}, ${city.country}, pick ${pick.rank}.${row ? ` Plan holds in ${percent(row.successRate)}.` : ''} ${pick.why}`
                }
              >
                <span className="also__name">
                  <CodeChip code={city.countryCode} />
                  <b>{city.name}</b>
                  <span className="ink-3">{city.country}</span>
                  {isDest && <span className="crow__tag is-dest">Destination</span>}
                  {isHome && <span className="crow__tag">Home</span>}
                </span>
                <span className="also__why">{pick.why}</span>
              </button>
              <span className="also__side" aria-hidden="true">
                <b className="also__odds num" style={row ? { color: successTextColor(row.successRate) } : undefined}>
                  {row ? percent(row.successRate) : '—'}
                </b>
                {hasProfile && <span className="also__go">Profile →</span>}
              </span>
            </li>
          )
        })}
      </ol>
      {hidden.length > 0 && (
        <div className="picks__more">
          <button type="button" className="chip-btn" aria-expanded={all} onClick={toggle}>
            {all ? 'Show fewer' : `Show ${hidden[0].pick.rank}–${hidden[hidden.length - 1].pick.rank}`}
            <Chevron open={all} />
          </button>
        </div>
      )}
    </section>
  )
}

function HowRanked() {
  const [open, setOpen] = useState(false)
  const id = useId()
  return (
    <div className="howr">
      <button type="button" className="howr__btn" aria-expanded={open} aria-controls={id} onClick={() => setOpen((x) => !x)}>
        <span className="t-eyebrow">How we ranked</span>
        <Chevron open={open} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={id}
            className="howr__body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ height: { duration: 0.42, ease }, opacity: { duration: 0.28, ease } }}
          >
            <div className="howr__inner">
              <p className="howr__method">{EXPAT_RANKING_METHOD}</p>
              <ul className="howr__sources">
                {EXPAT_RANKING_SOURCES.map((s) => (
                  <li key={s.name}>
                    <a href={s.url} target="_blank" rel="noopener noreferrer">
                      {s.name}
                    </a>
                    <span className="howr__ed"> · {s.edition}</span>
                    <span className="howr__what">{s.whatItRanks}</span>
                    {s.moreUrls?.map((u, i) => (
                      <a key={u} className="howr__more" href={u} target="_blank" rel="noopener noreferrer">
                        {s.moreUrls!.length > 1 ? `More ${i + 1}` : 'More'}
                        <span className="sr-only"> on {s.name} (opens in a new tab)</span>
                      </a>
                    ))}
                  </li>
                ))}
              </ul>
              <h4 className="t-eyebrow howr__h">What the scores mean</h4>
              <dl className="howr__rubric">
                {SCORE_KEYS.map((k) => (
                  <div key={k}>
                    <dt>{EXPAT_SCORE_LABELS[k]}</dt>
                    <dd>{EXPAT_SCORE_RUBRIC[k]}</dd>
                  </div>
                ))}
              </dl>
              <p className="t-small ink-3">
                Researched {longDate(EXPAT_AS_OF)}. Visa and tax rules change often: each profile is a starting point, not legal or tax advice.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
