import { AnimatePresence, m as motion } from 'framer-motion'
import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'
import { CITY_BY_ID } from '../../data/cities'
import { amountsTotal, BUDGET_CATEGORIES, budgetTotal, categoryRatios, destinationAmounts } from '../../engine/cost'
import type { BudgetCategory } from '../../engine/types'
import { useStore } from '../../state/store'
import { currencyCompact, percent } from '../format'
import { ease } from '../motion'
import { AnimatedNumber, cx, InfoTip, Section, Select, Slider, type SelectOption } from '../primitives'
import { catColor, CATEGORY_LABEL } from './BudgetEditor'
import { CITY_OPTIONS, cityLabel } from './placeholderCities'
import { AMOUNT_HINT, CHANGE_HINT, changeLabel, clearRow, hasAnyOverride, parseAmount, parseChange, resetAll, rowOverride, setAmount, setRatio, type SpendOverrides } from './spendOverrides'

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
  const ratioOverrides = useStore((s) => s.inputs.ratioOverrides)
  const amountOverrides = useStore((s) => s.inputs.amountOverrides)
  const budget = useStore((s) => s.inputs.budget)
  const setInput = useStore((s) => s.setInput)
  const patch = useStore((s) => s.patchInputs)
  const homeCity = CITY_BY_ID[homeId]
  const destCity = CITY_BY_ID[destId]
  if (!homeCity || !destCity) return null
  const ratios = categoryRatios(homeCity, destCity, expat, ratioOverrides)
  // Same per-category amounts the engine spends at the destination (fixed $ where set, else home × ratio).
  const amounts = destinationAmounts(budget, ratios, amountOverrides?.[destId])
  const homeTotal = budgetTotal(budget)
  const destTotal = amountsTotal(amounts)
  const delta = homeTotal > 0 ? destTotal / homeTotal - 1 : 0
  const current: SpendOverrides = { ratioOverrides, amountOverrides }
  const apply = (next: SpendOverrides) =>
    patch({
      ratioOverrides: next.ratioOverrides,
      amountOverrides: next.amountOverrides,
    })

  return (
    <div className="expat">
      <div className="expat__slider">
        <Slider
          label="Expat price premium"
          tone="bruised"
          aside={
            <InfoTip label="What is the expat price premium?">
              How much extra you pay abroad for the same standard of living. <b>Live like a local</b> (0%): you rent, shop and eat where
              locals do and pay local prices, so you keep the full saving. <b>Live like a tourist</b> (100%): expat-area rents, imported
              groceries, Western restaurants and international clinics cost what they do at home, so the move saves you nothing. Most
              newcomers land in between. Your spending below and your odds update as you move it.
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
          <span>Live like a local</span>
          <span>Live like a tourist</span>
        </div>
      </div>

      <div className="expat__card">
        <div className="expat__total">
          <span className="expat__head">
            <span className="t-eyebrow">Spending in {destCity.name}</span>
            <InfoTip label={`How spending in ${destCity.name} is worked out`} side="bottom">
              Each % compares {destCity.name}&rsquo;s cost for that category with what you spend on it in {homeCity.name}, after the expat
              price premium. Tap the % or the $ to set your own. A <b>$</b> you type is your researched yearly cost: it stays put when your
              home budget or the premium changes. A <b>%</b> follows your home budget. &times; undoes a row; Reset all undoes them all.
            </InfoTip>
          </span>
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
        <ul className="ratios" aria-label={`Yearly cost by category in ${destCity.name}, versus ${homeCity.name}`}>
          {BUDGET_CATEGORIES.map((c) => (
            <RatioRow
              key={c}
              c={c}
              cityName={destCity.name}
              amount={amounts[c]}
              homeAmt={budget[c] || 0}
              override={rowOverride(current, destId, c)}
              onAmount={(v) => apply(setAmount(current, destId, c, v))}
              onRatio={(r) => apply(setRatio(current, destId, c, r))}
              onClear={() => apply(clearRow(current, destId, c))}
            />
          ))}
        </ul>
        <div className="ratios__foot">
          <span className="t-small ink-3">Tap a % or $ to set your own.</span>
          {hasAnyOverride(current, destId) && (
            <button type="button" className="text-btn" onClick={() => apply(resetAll(current, destId))}>
              Reset all
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

type Field = 'amt' | 'chg'

function RatioRow({
  c,
  cityName,
  amount,
  homeAmt,
  override,
  onAmount,
  onRatio,
  onClear,
}: {
  c: BudgetCategory
  cityName: string
  amount: number
  homeAmt: number
  override: 'amount' | 'ratio' | null
  onAmount: (v: number) => void
  onRatio: (r: number) => void
  onClear: () => void
}) {
  const [editing, setEditing] = useState<Field | null>(null)
  const [draft, setDraft] = useState('')
  const [invalid, setInvalid] = useState(false)
  const hintId = useId()
  const initial = useRef('')
  const done = useRef(false)
  // Where focus goes once the input closes: back to the field's button, or (Tab) on to the next stop.
  const refocus = useRef<{ field: Field; next: boolean } | null>(null)
  const amtBtn = useRef<HTMLButtonElement>(null)
  const chgBtn = useRef<HTMLButtonElement>(null)
  const resetBtn = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    const r = refocus.current
    if (editing !== null || r === null) return
    refocus.current = null
    const own = (r.field === 'amt' ? amtBtn : chgBtn).current
    if (!r.next) return own?.focus()
    // Tab: the next stop in this row (the % after the $, else the ×), else whatever follows the row.
    const inRow = [r.field === 'amt' ? chgBtn.current : null, resetBtn.current].find((b) => b)
    if (inRow) return inRow.focus()
    if (own) focusAfter(own)
  }, [editing])

  const name = CATEGORY_LABEL[c]
  const hasHome = homeAmt > 0
  const change = hasHome ? amount / homeAmt - 1 : 0
  const chgLabel = changeLabel(change, (v) => percent(v, { signed: true }))
  const amtLabel = currencyCompact(amount)

  const begin = (f: Field) => {
    const v = f === 'amt' ? String(Math.round(amount)) : String(Math.round(change * 100))
    initial.current = v
    done.current = false
    setInvalid(false)
    setDraft(v)
    setEditing(f)
  }
  /** Closes the input; returns false (and keeps it open, flagged) when `stayOnInvalid` and the entry doesn't parse. */
  const finish = (save: boolean, focus: 'back' | 'next' | null, stayOnInvalid = false): boolean => {
    if (done.current || editing === null) return true
    // An untouched draft (tabbing through) sets nothing.
    if (save && draft.trim() !== initial.current) {
      const v = editing === 'amt' ? parseAmount(draft) : parseChange(draft)
      if (v === null && stayOnInvalid) {
        setInvalid(true)
        return false
      }
      if (v !== null) (editing === 'amt' ? onAmount : onRatio)(v)
    }
    done.current = true
    refocus.current = focus ? { field: editing, next: focus === 'next' } : null
    setEditing(null)
    return true
  }
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      finish(true, 'back', true)
    } else if (e.key === 'Tab' && !e.shiftKey) {
      // The × is hidden while editing, so step to it (or past the row) ourselves once the input closes.
      e.preventDefault()
      finish(true, 'next', true)
    } else if (e.key === 'Escape') {
      // Keep the Escape from closing a surrounding sheet.
      e.stopPropagation()
      finish(false, 'back')
    }
  }
  const input = (f: Field) => (
    <span className={cx('ratio__edit', f === 'amt' && 'ratio__edit--amt', invalid && 'is-invalid')}>
      {f === 'amt' && <span aria-hidden="true">$</span>}
      <input
        className="num"
        autoFocus
        inputMode={f === 'amt' ? 'text' : 'numeric'}
        enterKeyHint="done"
        aria-label={f === 'amt' ? `${name} in ${cityName}, dollars a year` : `${name} in ${cityName}, change versus home, percent`}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? hintId : undefined}
        value={draft}
        onChange={(e) => {
          setDraft(e.currentTarget.value)
          setInvalid(false)
        }}
        onFocus={(e) => e.currentTarget.select()}
        onBlur={() => finish(true, null)}
        onKeyDown={onKey}
      />
      {f === 'chg' && <span aria-hidden="true">%</span>}
    </span>
  )

  // Bar: ratio on a 0..2 scale, with 1 (= home) at the middle tick; no home amount, any $ reads as "far above".
  const w = hasHome ? Math.min(1, amount / homeAmt / 2) : amount > 0 ? 1 : 0
  return (
    <li
      className={cx('ratio', override && 'is-override', override === 'amount' && 'is-fixed', override === 'ratio' && 'is-ratio')}
      style={{ '--c': catColor(c), '--w': w } as CSSProperties}
    >
      <span className="ratio__label">
        <span className="ratio__swatch" aria-hidden="true" />
        {name}
      </span>
      {editing !== 'amt' && (
        <span className="ratio__bar" aria-hidden="true">
          <i />
        </span>
      )}
      {editing === 'amt' ? (
        input('amt')
      ) : (
        <button
          ref={amtBtn}
          type="button"
          className="ratio__amt num"
          onClick={() => begin('amt')}
          aria-label={`${name} in ${cityName}: ${amtLabel} a year${override === 'amount' ? ', your amount' : ''}, edit`}
        >
          {amtLabel}
        </button>
      )}
      {!hasHome ? (
        <span className="ratio__chg-ph" aria-hidden="true" />
      ) : editing === 'chg' ? (
        input('chg')
      ) : (
        <button
          ref={chgBtn}
          type="button"
          className={cx('ratio__chg num', change < -0.005 ? 'is-down' : change > 0.005 ? 'is-up' : 'is-flat')}
          onClick={() => begin('chg')}
          aria-label={`${name} in ${cityName}: ${chgLabel} versus home${override === 'ratio' ? ', your change' : ''}, edit`}
        >
          {chgLabel}
        </button>
      )}
      {override && editing === null ? (
        <button
          ref={resetBtn}
          type="button"
          className="ratio__reset"
          aria-label={`Reset ${name} to the city estimate`}
          title="Reset to estimate"
          onClick={() => {
            onClear()
            amtBtn.current?.focus()
          }}
        >
          <svg width="12" height="12" viewBox="0 0 16 16" aria-hidden="true">
            <path d="M4.5 4.5l7 7M11.5 4.5l-7 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      ) : (
        <span className="ratio__reset-ph" aria-hidden="true" />
      )}
      {editing !== null && invalid && (
        <span id={hintId} className="ratio__hint" role="alert">
          {editing === 'amt' ? AMOUNT_HINT : CHANGE_HINT}
        </span>
      )}
    </li>
  )
}

/** Focus the first tabbable element after `el` in document order (used when a Tab leaves an edit field). */
function focusAfter(el: HTMLElement) {
  const all = [...document.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])')]
  const next = all.find((x) => el.compareDocumentPosition(x) & Node.DOCUMENT_POSITION_FOLLOWING && x.offsetParent !== null)
  ;(next ?? el).focus()
}
