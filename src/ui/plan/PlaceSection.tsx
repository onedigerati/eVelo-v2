import { AnimatePresence, m as motion } from 'framer-motion'
import { useState, type CSSProperties, type KeyboardEvent } from 'react'
import { CITY_BY_ID } from '../../data/cities'
import { applyRatios, BUDGET_CATEGORIES, budgetTotal, categoryRatios } from '../../engine/cost'
import type { BudgetCategory } from '../../engine/types'
import { useStore } from '../../state/store'
import { currency, currencyCompact, percent } from '../format'
import { ease } from '../motion'
import { AnimatedNumber, cx, InfoTip, Section, Select, Slider, type SelectOption } from '../primitives'
import { catColor, CATEGORY_LABEL } from './BudgetEditor'
import { CITY_OPTIONS, cityLabel } from './placeholderCities'

const STAY = '__stay'

export function PlaceSection() {
  const home = useStore((s) => s.inputs.homeCityId)
  const dest = useStore((s) => s.inputs.destCityId)
  const moveIn = useStore((s) => s.inputs.moveInYears)
  const horizon = useStore((s) => s.inputs.horizonYears)
  const setInput = useStore((s) => s.setInput)
  const patch = useStore((s) => s.patchInputs)
  const summary = dest
    ? `${cityLabel(home)} → ${cityLabel(dest)}${moveIn > 0 ? ` in ${moveIn} yrs` : ''}`
    : `Staying in ${cityLabel(home)}`
  const destOptions: SelectOption<string>[] = [
    { value: STAY, label: 'Stay home', meta: `Remain in ${cityLabel(home)}` },
    ...CITY_OPTIONS.filter((c) => c.value !== home),
  ]
  const maxMove = Math.max(1, Math.min(horizon - 1, 30))

  return (
    <Section index="03" title="Where you live" summary={summary}>
      <Select
        label="Home city"
        value={home}
        options={CITY_OPTIONS}
        searchable
        onChange={(v) => (v === dest ? patch({ homeCityId: v, destCityId: null }) : setInput('homeCityId', v))}
        hint="Your budget is priced here."
      />
      <Select
        label="Retire to"
        value={dest ?? STAY}
        options={destOptions}
        searchable
        onChange={(v) => setInput('destCityId', v === STAY ? null : v)}
      />
      <AnimatePresence initial={false}>
        {dest !== null && (
          <motion.div
            key="dest"
            className="place__dest"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto', transitionEnd: { overflow: 'visible' } }}
            exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
            transition={{ duration: 0.36, ease }}
            style={{ overflow: 'hidden' }}
          >
            <Slider
              label="Move"
              value={Math.min(moveIn, maxMove)}
              min={0}
              max={maxMove}
              step={1}
              format={(v) => (v === 0 ? 'Now' : `In ${v} ${v === 1 ? 'year' : 'years'}`)}
              ticks={[0, ...[10, 20].filter((v) => v < maxMove - 3), maxMove].map((v) => ({ value: v, label: v === 0 ? 'Now' : `${v}y` }))}
              onChange={(v) => setInput('moveInYears', v)}
            />
            <ExpatPanel destId={dest} />
          </motion.div>
        )}
      </AnimatePresence>
    </Section>
  )
}

function ExpatPanel({ destId }: { destId: string }) {
  const homeId = useStore((s) => s.inputs.homeCityId)
  const expat = useStore((s) => s.inputs.expatFactor)
  const overrides = useStore((s) => s.inputs.ratioOverrides)
  const budget = useStore((s) => s.inputs.budget)
  const setInput = useStore((s) => s.setInput)
  const homeCity = CITY_BY_ID[homeId]
  const destCity = CITY_BY_ID[destId]
  if (!homeCity || !destCity) return null
  const ratios = categoryRatios(homeCity, destCity, expat, overrides)
  const homeTotal = budgetTotal(budget)
  const destTotal = applyRatios(budget, ratios)
  const delta = homeTotal > 0 ? destTotal / homeTotal - 1 : 0
  const hasOverrides = !!overrides && Object.keys(overrides).length > 0

  const setOverride = (c: BudgetCategory, ratio: number | null) => {
    const next = { ...(overrides ?? {}) }
    if (ratio === null) delete next[c]
    else next[c] = Math.max(0.05, Math.min(5, ratio))
    setInput('ratioOverrides', Object.keys(next).length ? next : undefined)
  }

  return (
    <div className="expat">
      <div className="expat__slider">
        <Slider
          label="Expat price premium"
          tone="bruised"
          aside={
            <InfoTip label="What is the expat price premium?">
              Your lifestyle stays the same either way; this sets what it costs. At the left you pay local prices for the same
              standard of living. Newcomers often pay more — imported groceries, expat-area rents, international hospitals — and at
              the right those extras use up every saving, so things cost what they do at home.
            </InfoTip>
          }
          value={expat}
          min={0}
          max={1}
          step={0.05}
          format={(v) => `${Math.round(v * 100)}%`}
          onChange={(v) => setInput('expatFactor', v)}
        />
        <div className="scale-ends" aria-hidden="true">
          <span>Local prices</span>
          <span>Home prices</span>
        </div>
      </div>

      <div className="expat__card">
        <div className="expat__total">
          <span className="t-eyebrow">Spending in {destCity.name}</span>
          <span className="expat__total-row">
            <AnimatedNumber className="expat__total-v" value={destTotal} format="currency" duration={0.6} />
            <span className="expat__total-u">/yr</span>
            <span className={cx('delta-chip num', delta < 0 ? 'is-down' : 'is-up')}>{percent(delta, { signed: true })}</span>
          </span>
          <span className="t-small ink-3">
            vs {currencyCompact(homeTotal)} in {homeCity.name} · {destCity.currency}
            {destCity.fxVol > 0 ? ` · FX vol ${percent(destCity.fxVol)}` : ''}
          </span>
        </div>
        <ul className="ratios" aria-label="Cost by category, destination versus home">
          {BUDGET_CATEGORIES.map((c) => (
            <RatioRow
              key={c}
              c={c}
              ratio={ratios[c]}
              homeAmt={budget[c]}
              overridden={overrides?.[c] !== undefined}
              onSet={(r) => setOverride(c, r)}
            />
          ))}
        </ul>
        <div className="ratios__foot">
          <span className="t-small ink-3">Tap a change to set your own.</span>
          {hasOverrides && (
            <button type="button" className="text-btn" onClick={() => setInput('ratioOverrides', undefined)}>
              Reset all
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function RatioRow({
  c,
  ratio,
  homeAmt,
  overridden,
  onSet,
}: {
  c: BudgetCategory
  ratio: number
  homeAmt: number
  overridden: boolean
  onSet: (r: number | null) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const change = ratio - 1
  const label = Math.abs(change) < 0.005 ? '±0%' : percent(change, { signed: true })
  const begin = () => {
    setDraft(String(Math.round(change * 100)))
    setEditing(true)
  }
  const commit = () => {
    const v = parseFloat(draft.replace(/[−–]/g, '-').replace(/[%+\s]/g, ''))
    if (Number.isFinite(v)) onSet(1 + v / 100)
    setEditing(false)
  }
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') commit()
    else if (e.key === 'Escape') setEditing(false)
  }
  // Bar: ratio on a 0..2 scale, with 1 (= home) at the middle tick.
  const w = Math.min(1, ratio / 2)
  return (
    <li className={cx('ratio', overridden && 'is-override')} style={{ '--c': catColor(c), '--w': w } as CSSProperties}>
      <span className="ratio__label">
        <span className="ratio__swatch" aria-hidden="true" />
        {CATEGORY_LABEL[c]}
      </span>
      <span className="ratio__bar" aria-hidden="true">
        <i />
      </span>
      <span className="ratio__amt num">{currencyCompact(homeAmt * ratio)}</span>
      {editing ? (
        <span className="ratio__edit">
          <input
            className="num"
            autoFocus
            inputMode="numeric"
            aria-label={`${CATEGORY_LABEL[c]} change versus home, percent`}
            value={draft}
            onChange={(e) => setDraft(e.currentTarget.value)}
            onBlur={commit}
            onKeyDown={onKey}
          />
          <span aria-hidden="true">%</span>
        </span>
      ) : (
        <button
          type="button"
          className={cx('ratio__chg num', change < -0.005 ? 'is-down' : change > 0.005 ? 'is-up' : 'is-flat')}
          onClick={begin}
          aria-label={`${CATEGORY_LABEL[c]}: ${label} versus home (${currency(homeAmt * ratio)} a year). ${overridden ? 'Custom. ' : ''}Edit`}
        >
          {label}
        </button>
      )}
      {overridden && !editing ? (
        <button type="button" className="ratio__reset" aria-label={`Reset ${CATEGORY_LABEL[c]} to the city estimate`} title="Reset to estimate" onClick={() => onSet(null)}>
          <svg width="12" height="12" viewBox="0 0 16 16" aria-hidden="true">
            <path d="M4.5 4.5l7 7M11.5 4.5l-7 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      ) : (
        <span className="ratio__reset-ph" aria-hidden="true" />
      )}
    </li>
  )
}
