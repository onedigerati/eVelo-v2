import { m as motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { BUDGET_CATEGORIES } from '../../engine/cost'
import type { PlanInputs } from '../../engine/types'
import { useFx } from '../../state/fx'
import { currency, currencyCompact, percent } from '../format'
import { ease } from '../motion'
import { Button, Sheet, cx } from '../primitives'
import {
  CATEGORY_LABEL,
  localCompact,
  FX_RISK_LABEL,
  cityCosts,
  costDelta,
  fxRisk,
  successColor,
  successTextColor,
  type Ranked,
} from './atlasData'
import { CodeChip } from './CodeChip'
import { verifiedLabel } from './picks'
import { VerifiedMark } from './VerifiedMark'
import { CityNotes, ExpatCaveats, SourcesLine } from './ThingsToCheck'

export interface CompareSheetProps {
  open: boolean
  onClose: () => void
  rows: Ranked[]
  inputs: PlanInputs
  onChoose: (id: string) => void
  onRemove: (id: string) => void
}

/** Index of the best value (min or max) — only when values actually differ. */
function bestIdx(vals: number[], dir: 'min' | 'max'): number {
  if (vals.length < 2) return -1
  const lo = Math.min(...vals)
  const hi = Math.max(...vals)
  if (hi - lo < Math.abs(hi) * 0.005) return -1
  return vals.indexOf(dir === 'min' ? lo : hi)
}

export function CompareSheet({ open, onClose, rows, inputs, onChoose, onRemove }: CompareSheetProps) {
  const rates = useFx((s) => s.rates)
  const n = rows.length
  const costs = rows.map((r) => cityCosts(inputs, r.city))
  const bestOdds = bestIdx(
    rows.map((r) => r.successRate),
    'max',
  )
  const bestSpend = bestIdx(
    rows.map((r) => r.spendUsd),
    'min',
  )
  const cols = { ['--n' as string]: Math.max(1, n) }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      side="bottom"
      title={
        <>
          Side by <em>side</em>
        </>
      }
      className="cmp-sheet"
    >
      {n === 0 ? (
        <p className="t-small ink-3">Pick up to three cities from the map or the list to compare them here.</p>
      ) : (
        <div className="vs" style={cols}>
          {/* Column heads */}
          <div className="vs__row vs__row--head">
            <div className="vs__label" />
            {rows.map((r) => {
              const isHome = r.cityId === inputs.homeCityId
              const isDest = r.cityId === inputs.destCityId
              return (
                <div key={r.cityId} className="vs__cell vs__city">
                  <div className="vs__city-top">
                    <CodeChip code={r.city.countryCode} />
                    <span className="vs__rank num">#{r.rank}</span>
                    <button
                      type="button"
                      className="icon-btn vs__x"
                      aria-label={`Remove ${r.city.name} from comparison`}
                      onClick={() => onRemove(r.cityId)}
                    >
                      <svg width="12" height="12" viewBox="0 0 16 16" aria-hidden="true">
                        <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                  <b className="vs__name">{r.city.name}</b>
                  <span className="vs__country">{r.city.country}</span>
                  <div className="vs__cta">
                    {isHome ? (
                      <span className="crow__tag">Home</span>
                    ) : isDest ? (
                      <span className="crow__tag is-dest">Destination</span>
                    ) : (
                      <Button size="sm" variant="primary" onClick={() => onChoose(r.cityId)}>
                        Make destination
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <Metric label="Plan holds">
            {rows.map((r, i) => (
              <div key={r.cityId} className={cx('vs__cell', i === bestOdds && 'is-best')}>
                <span className="vs__big" style={{ color: successTextColor(r.successRate) }}>
                  {Math.round(r.successRate * 100)}
                  <i>%</i>
                </span>
                <span className="vs__bar">
                  <motion.i
                    initial={{ width: 0 }}
                    animate={{ width: `${r.successRate * 100}%` }}
                    transition={{ duration: 0.8, ease, delay: 0.15 + i * 0.06 }}
                    style={{ background: successColor(r.successRate) }}
                  />
                </span>
              </div>
            ))}
          </Metric>

          <Metric label="Spend a year">
            {rows.map((r, i) => {
              const fx = rates[r.city.currency]
              return (
                <div key={r.cityId} className={cx('vs__cell', i === bestSpend && 'is-best')}>
                  <span className="vs__val num">{currency(r.spendUsd)}</span>
                  {r.city.currency !== 'USD' && fx && (
                    <span className="vs__sub num">≈ {localCompact(r.spendUsd * fx, r.city.currency)}</span>
                  )}
                </div>
              )
            })}
          </Metric>

          <Metric label="Vs home">
            {rows.map((r) => (
              <div key={r.cityId} className="vs__cell">
                <span className={cx('vs__val num', r.costRatio < 0.995 && 'is-down', r.costRatio > 1.005 && 'is-up')}>
                  {r.cityId === inputs.homeCityId ? 'home' : costDelta(r.costRatio)}
                </span>
              </div>
            ))}
          </Metric>

          <div className="vs__section t-eyebrow">By category · first year, today’s dollars</div>
          {BUDGET_CATEGORIES.map((c) => {
            const vals = costs.map((x) => x[c])
            const b = bestIdx(vals, 'min')
            const top = Math.max(...vals, 1)
            return (
              <Metric key={c} label={CATEGORY_LABEL[c]} compact>
                {rows.map((r, i) => (
                  <div key={r.cityId} className={cx('vs__cell vs__cat', i === b && 'is-best')}>
                    <span className="vs__val num">{currencyCompact(vals[i])}</span>
                    <span className="vs__mini" aria-hidden="true">
                      <i style={{ width: `${(vals[i] / top) * 100}%` }} />
                    </span>
                  </div>
                ))}
              </Metric>
            )
          })}

          <div className="vs__section t-eyebrow">Health & money</div>
          <Metric label="Healthcare cost" hint="Private / expat cover vs US pre-Medicare (US = 1.0)">
            {rows.map((r) => (
              <div key={r.cityId} className="vs__cell">
                <span className="vs__val num">{r.city.healthcare.toFixed(2)}×</span>
              </div>
            ))}
          </Metric>
          <Metric label="Cost data" hint="Checked against a current source, or a rough estimate">
            {rows.map((r) => {
              const vl = verifiedLabel(r.city)
              return (
                <div key={r.cityId} className="vs__cell">
                  <VerifiedMark label={vl} spoken />
                  <span className="vs__sub">{r.city.verified ? r.city.verified.source : 'Not yet checked'}</span>
                </div>
              )
            })}
          </Metric>
          <Metric label="Currency">
            {rows.map((r) => {
              const risk = fxRisk(r.city)
              const fx = rates[r.city.currency]
              return (
                <div key={r.cityId} className="vs__cell">
                  <span className={cx('fxchip', `fxchip--${risk}`)}>
                    <span className="fxchip__ccy">{r.city.currency}</span>
                    <span className="fxchip__lvl">{risk === 'none' ? '—' : FX_RISK_LABEL[risk]}</span>
                  </span>
                  <span className="vs__sub num">
                    {r.city.currency === 'USD'
                      ? 'US dollar'
                      : `${percent(r.city.fxVol)} vol · ${fx ? fx.toLocaleString('en-US', { maximumSignificantDigits: 4 }) : '—'}/$`}
                  </span>
                </div>
              )
            })}
          </Metric>

          <div className="vs__notes">
            {rows.map((r) => (
              <div key={r.cityId} className="vs__note-col">
                <div className="vs__note-city">
                  <CodeChip code={r.city.countryCode} /> {r.city.name}
                </div>
                {r.city.notes?.length ? <CityNotes city={r.city} /> : <p className="t-small ink-3">No city-specific notes.</p>}
              </div>
            ))}
          </div>
          <ExpatCaveats cities={rows.map((r) => r.city)} />
          <SourcesLine />
        </div>
      )}
    </Sheet>
  )
}

function Metric({ label, hint, compact, children }: { label: string; hint?: string; compact?: boolean; children: ReactNode }) {
  return (
    <div className={cx('vs__row', compact && 'is-compact')}>
      <div className="vs__label">
        {label}
        {hint && <span className="vs__hint">{hint}</span>}
      </div>
      {children}
    </div>
  )
}
