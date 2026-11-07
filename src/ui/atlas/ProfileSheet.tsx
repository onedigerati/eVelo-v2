import { m as motion } from 'framer-motion'
import { EXPAT_PICKS, EXPAT_SCORE_LABELS, EXPAT_SCORE_RUBRIC, type ExpatFacts } from '../../data/expatPicks'
import type { City, PlanInputs } from '../../engine/types'
import { useDestinationSim } from '../../state/sim'
import { currency, currencyCompact, percent } from '../format'
import { ease } from '../motion'
import { Button, InfoTip, Sheet, Skeleton, cx } from '../primitives'
import { CATEGORY_LABEL, costDelta, successColor, successTextColor, type Ranked } from './atlasData'
import { CodeChip } from './CodeChip'
import { SCORE_KEYS, categoryCompare, costDataLine, oddsVsHome, type ProfiledPickView } from './picks'
import { estateVsHome, taxLines, taxNotice, taxStatus } from './taxLines'

/** Fact labels, in display order: the BBD facts first. */
const FACT_LABEL: Record<keyof ExpatFacts, string> = {
  tax: 'Tax on holdings',
  estate: 'Estate & inheritance',
  lending: 'Lending & brokers',
  visa: 'Residency',
  healthcare: 'Healthcare',
  safety: 'Safety',
  climate: 'Climate',
  community: 'Community',
  access: 'Getting there',
}
const FACT_KEYS = Object.keys(FACT_LABEL) as (keyof ExpatFacts)[]

export interface ProfileSheetProps {
  /** The pick to show; null = closed. */
  view: ProfiledPickView<Ranked> | null
  home?: Ranked
  inputs: PlanInputs
  onClose: () => void
  onChoose: (cityId: string) => void
}

export function ProfileSheet({ view, home, inputs, onClose, onChoose }: ProfileSheetProps) {
  return (
    <Sheet
      open={!!view}
      onClose={onClose}
      side="bottom"
      className="prof-sheet"
      title={
        view ? (
          <>
            <span className="prof__no">No. {view.pick.rank}</span> {view.city.name}
          </>
        ) : (
          ''
        )
      }
    >
      {view && <ProfileBody view={view} home={home} inputs={inputs} onChoose={onChoose} />}
    </Sheet>
  )
}

function ProfileBody({
  view,
  home,
  inputs,
  onChoose,
}: {
  view: ProfiledPickView<Ranked>
  home?: Ranked
  inputs: PlanInputs
  onChoose: (cityId: string) => void
}) {
  const { pick, city, row } = view
  const p = pick.profile
  const isDest = inputs.destCityId === city.id
  const cats = categoryCompare(inputs, city)
  const catMax = Math.max(1, ...cats.flatMap((c) => [c.home, c.here]))
  const homeName = home?.city.name ?? 'home'

  return (
    <div className="prof">
      <div className="prof__main">
        <div className="prof__lead">
          <div className="prof__eyebrow t-eyebrow">
            <CodeChip code={city.countryCode} /> Top pick {pick.rank} of {EXPAT_PICKS.length} · {city.country}
          </div>
          <p className="prof__tagline">{p.tagline}</p>
          <p className="prof__summary">{p.summary}</p>
        </div>

        <section className="prof__sec" aria-labelledby="prof-scores">
          <h3 id="prof-scores" className="t-eyebrow prof__h">
            How it scores <span className="prof__h-note">· out of 5, for a US retiree on buy-borrow-die</span>
          </h3>
          <ul className="pscores">
            {SCORE_KEYS.map((k, i) => (
              <li key={k} className="pscores__row">
                <span className="pscores__k">
                  {EXPAT_SCORE_LABELS[k]}
                  <InfoTip label={`What the ${EXPAT_SCORE_LABELS[k]} score means`}>{EXPAT_SCORE_RUBRIC[k]}</InfoTip>
                </span>
                <span className="pscores__track" aria-hidden="true">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <motion.i
                      key={n}
                      className={cx(n <= p.scores[k] && 'is-on')}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.4, ease, delay: 0.12 + i * 0.04 + n * 0.03 }}
                    />
                  ))}
                </span>
                <span className="pscores__n num">
                  {p.scores[k]}
                  <span className="sr-only"> out of 5</span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="prof__sec" aria-labelledby="prof-facts">
          <h3 id="prof-facts" className="t-eyebrow prof__h">
            The essentials
          </h3>
          <dl className="pfacts">
            {FACT_KEYS.map((k) => (
              <div key={k} className="pfacts__row">
                <dt>{FACT_LABEL[k]}</dt>
                <dd>{p.facts[k]}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="prof__sec" aria-labelledby="prof-worth">
          <h3 id="prof-worth" className="t-eyebrow prof__h">
            Worth knowing
          </h3>
          <ul className="pworth">
            {p.drawbacks.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </section>
      </div>

      <aside className="prof__plan" aria-labelledby="prof-plan">
        <div className="pplan">
          <h3 id="prof-plan" className="t-eyebrow prof__h">
            Your plan here
          </h3>
          <div className="pplan__stats">
            <div className="pplan__stat">
              <span className="pplan__l">Plan holds</span>
              {row ? (
                <span className="pplan__big" style={{ color: successTextColor(row.successRate) }}>
                  {Math.round(row.successRate * 100)}
                  <i>%</i>
                </span>
              ) : (
                <Skeleton width={70} height={36} radius={8} />
              )}
              <span className="pplan__sub">
                {row && home ? (
                  <>
                    <b className={cx(row.successRate > home.successRate + 0.005 ? 'is-down' : row.successRate < home.successRate - 0.005 && 'is-up')}>
                      {oddsVsHome(row.successRate, home.successRate)}
                    </b>{' '}
                    vs {percent(home.successRate)} in {homeName}
                  </>
                ) : (
                  'Ranking…'
                )}
              </span>
              {row && (
                <span className="pplan__bar" aria-hidden="true">
                  <motion.i
                    initial={{ width: 0 }}
                    animate={{ width: `${row.successRate * 100}%` }}
                    transition={{ duration: 0.8, ease, delay: 0.15 }}
                    style={{ background: successColor(row.successRate) }}
                  />
                  {home && <span className="pplan__mark" style={{ left: `${home.successRate * 100}%` }} title={`${homeName}: ${percent(home.successRate)}`} />}
                </span>
              )}
            </div>
            <div className="pplan__stat">
              <span className="pplan__l">A year here</span>
              <span className="pplan__val num">{row ? currency(row.spendUsd) : '—'}</span>
              <span className="pplan__sub">
                {row && home ? (
                  <>
                    <b className={cx(row.costRatio < 0.995 && 'is-down', row.costRatio > 1.005 && 'is-up')}>{costDelta(row.costRatio)}</b> vs{' '}
                    {currency(home.spendUsd)} in {homeName}
                  </>
                ) : (
                  ' '
                )}
              </span>
            </div>
          </div>

          <div className="pcats">
            <div className="pcats__head" aria-hidden="true">
              <span>By category</span>
              <span className="pcats__key">
                <i className="is-home" /> {homeName}
                <i className="is-here" /> {city.name}
              </span>
            </div>
            <ul className="pcats__list" aria-label={`Spend by category, first year in today’s dollars`}>
              {cats.map((c, i) => (
                <li key={c.cat} className="pcats__row">
                  <span className="sr-only">
                    {CATEGORY_LABEL[c.cat]}: {currencyCompact(c.here)} here vs {currencyCompact(c.home)} in {homeName}, {costDelta(c.ratio)}.
                  </span>
                  <span className="pcats__k" aria-hidden="true">
                    {CATEGORY_LABEL[c.cat]}
                  </span>
                  <span className="pcats__bars" aria-hidden="true">
                    <motion.i
                      className="is-home"
                      initial={{ width: 0 }}
                      animate={{ width: `${(c.home / catMax) * 100}%` }}
                      transition={{ duration: 0.6, ease, delay: 0.2 + i * 0.03 }}
                    />
                    <motion.i
                      className={cx('is-here', c.ratio < 0.995 && 'is-down', c.ratio > 1.005 && 'is-up')}
                      initial={{ width: 0 }}
                      animate={{ width: `${(c.here / catMax) * 100}%` }}
                      transition={{ duration: 0.6, ease, delay: 0.26 + i * 0.03 }}
                    />
                  </span>
                  <span className="pcats__v num" aria-hidden="true">
                    {currencyCompact(c.here)}
                    <small className={cx(c.ratio < 0.995 && 'is-down', c.ratio > 1.005 && 'is-up')}>{costDelta(c.ratio)}</small>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <p className="pplan__note">
            Your {homeName} budget at local prices, with your “lifestyle abroad” setting ({percent(inputs.expatFactor)})
            {inputs.ratioOverrides && Object.keys(inputs.ratioOverrides).length > 0 ? ' and your category overrides' : ''}.
          </p>

          <PlanTaxes city={city} inputs={inputs} homeName={homeName} />

          <div className="pplan__cta">
            {isDest ? (
              <span className="crow__tag is-dest">Your destination</span>
            ) : (
              <Button variant="primary" onClick={() => onChoose(city.id)}>
                Make {city.name} my destination
              </Button>
            )}
          </div>
        </div>

        <div className="prof__sources">
          <h3 className="t-eyebrow prof__h">Sources</h3>
          <ul>
            {p.sources.map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noopener noreferrer">
                  {s.name}
                </a>
                {s.edition && <span className="ink-3"> · {s.edition}</span>}
              </li>
            ))}
          </ul>
          <p className="prof__data">{costDataLine(city)} Not tax or legal advice.</p>
        </div>
      </aside>
    </div>
  )
}

/** "Taxes & estate" block of "Your plan here": local wealth/inheritance tax on this destination and
 *  the estate left, from a run of the plan with this city as the destination. */
function PlanTaxes({ city, inputs, homeName }: { city: City; inputs: PlanInputs; homeName: string }) {
  const sim = useDestinationSim(inputs, city.id)
  const status = taxStatus(city)
  const notice = taxNotice(city)
  const endAge = Math.round(inputs.age + inputs.horizonYears)
  if (sim.status === 'empty') return null
  const ready = sim.status === 'ready' ? sim : null
  const loading = sim.status === 'loading'
  const lines = ready?.dest.localTax ? taxLines(city, ready.dest.localTax, inputs) : []
  const estate = ready?.dest.estate.bbdMedian
  const homeEstate = ready?.home.estate.bbdMedian
  const better = estate != null && homeEstate != null ? estate - homeEstate : 0
  const announce = loading ? `Calculating local tax and estate for ${city.name}…` : ready ? `Local tax and estate for ${city.name} ready.` : ''

  return (
    <section className="ptax" aria-labelledby="prof-tax" aria-busy={loading}>
      <span className="sr-only" role="status">
        {announce}
      </span>
      <div className="ptax__head">
        <span id="prof-tax" className="pplan__l">
          Local tax & estate
        </span>
        {city.localTax && (
          <InfoTip label={`How ${city.country}’s local taxes are modelled`}>{city.localTax.note}</InfoTip>
        )}
      </div>

      {notice && <p className={cx('ptax__notice', status === 'unmodelled' && 'is-unmodelled')}>{notice}</p>}

      {sim.status === 'error' ? (
        <p className="ptax__notice">Couldn’t run this plan here: {sim.message}</p>
      ) : loading ? (
        <div className="ptax__rows" aria-hidden="true">
          {Array.from({ length: status === 'taxed' ? 3 : 1 }, (_, i) => (
            <div key={i} className="ptax__row">
              <span>
                <Skeleton width={110} height={11} />
              </span>
              <span className="ptax__skel-v">
                <Skeleton width={64} height={18} radius={4} />
              </span>
            </div>
          ))}
        </div>
      ) : (
        ready &&
        estate != null &&
        homeEstate != null && (
          <dl className="ptax__rows">
            {lines.map((l) => (
              <div key={l.key} className={cx('ptax__row', l.muted && 'is-muted')}>
                <dt>{l.label}</dt>
                <dd>
                  {l.value != null && <b className="num">{l.value}</b>}
                  <span>{l.sub}</span>
                </dd>
              </div>
            ))}
            <div className="ptax__row ptax__row--estate">
              <dt>
                Estate at {endAge}
                <small>{status === 'taxed' ? 'median, after local tax' : 'median, borrow and never sell'}</small>
              </dt>
              <dd>
                <b className="num">{currencyCompact(estate)}</b>
                <span>
                  <b className={cx(better > Math.abs(homeEstate) * 0.005 && 'is-down', better < -Math.abs(homeEstate) * 0.005 && 'is-up')}>
                    {estateVsHome(estate, homeEstate)}
                  </b>{' '}
                  vs {currencyCompact(homeEstate)} staying in {homeName}
                </span>
              </dd>
            </div>
          </dl>
        )
      )}
      <p className="pplan__note">Today’s dollars, from {inputs.paths.toLocaleString('en-US')} simulated futures of your plan with {city.name} as the destination.</p>
    </section>
  )
}
