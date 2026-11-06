import { AnimatePresence, m as motion } from 'framer-motion'
import { useState, type CSSProperties, type KeyboardEvent } from 'react'
import type { Holding } from '../../engine/types'
import { useStore } from '../../state/store'
import { number, parseLoose, percent } from '../format'
import { ease } from '../motion'
import { cx, Sparkline, StackBar } from '../primitives'
import { assetMeta, GROUP_LABEL } from './marketIndex'
import { usePlanUi, slotColor } from './planUi'
import { fmtCagr, fmtYears, isMac } from './TickerPalette'
import { equalWeights, evenOut, MAX_HOLDINGS, removeHolding, roundWeights, setWeight } from './weights'

/** "50%" for whole numbers, "16.7%" otherwise. */
export const wPct = (w: number) => {
  const p = Math.round(w * 1000) / 10
  return `${number(p, Number.isInteger(p) ? 0 : 1)}%`
}

export function HoldingsEditor() {
  const holdings = useStore((s) => s.inputs.holdings)
  const setInput = useStore((s) => s.setInput)
  const locked = usePlanUi((s) => s.locked)
  const slots = usePlanUi((s) => s.slots)
  const toggleLock = usePlanUi((s) => s.toggleLock)
  const openPalette = usePlanUi((s) => s.setPaletteOpen)
  const lockSet = new Set(locked)
  const set = (hs: Holding[]) => setInput('holdings', hs)
  const color = (sym: string, i: number) => slotColor(slots[sym] ?? i)
  const full = holdings.length >= MAX_HOLDINGS

  return (
    <div className="holdings">
      <div className="field__row holdings__head">
        <span className="field__label" id="holdings-label">
          Holdings
        </span>
        <span className="holdings__count num">
          {holdings.length}/{MAX_HOLDINGS}
        </span>
        <span className="holdings__tools">
          <button type="button" className="text-btn" onClick={() => set(evenOut(holdings, lockSet))} title="Split the unlocked weight equally">
            Even out
          </button>
          <button type="button" className="text-btn" onClick={() => set(roundWeights(holdings))} title="Round to whole percents summing to 100%">
            Normalize
          </button>
        </span>
      </div>

      <StackBar
        height={12}
        className="holdings__bar"
        aria-label={`Allocation: ${holdings.map((h) => `${h.symbol} ${wPct(h.weight)}`).join(', ')}`}
        segments={holdings.map((h, i) => ({ key: h.symbol, value: h.weight, color: color(h.symbol, i), label: `${h.symbol} ${wPct(h.weight)}` }))}
      />

      <ul className="holdings__list" aria-labelledby="holdings-label">
        <AnimatePresence initial={false}>
          {holdings.map((h, i) => (
            <motion.li
              key={h.symbol}
              layout="position"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: 24, transition: { duration: 0.18 } }}
              transition={{ duration: 0.32, ease }}
            >
              <HoldingRow
                h={h}
                color={color(h.symbol, i)}
                locked={lockSet.has(h.symbol)}
                // Can this row move? Only if some other row is unlocked.
                movable={holdings.some((o, j) => j !== i && !lockSet.has(o.symbol))}
                canRemove={holdings.length > 1}
                onWeight={(w) => set(setWeight(holdings, i, w, lockSet))}
                onLock={() => toggleLock(h.symbol)}
                onRemove={() => set(removeHolding(holdings, h.symbol, lockSet))}
              />
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      <button type="button" className="add-holding" onClick={() => openPalette(true)} disabled={full}>
        <span className="add-holding__plus" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 16 16">
            <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </span>
        <span>{full ? `${MAX_HOLDINGS} holdings is the limit` : 'Add holding'}</span>
        <span className="add-holding__kbd" aria-hidden="true">
          <kbd className="kbd">{isMac ? '⌘' : 'Ctrl'}</kbd>
          <kbd className="kbd">K</kbd>
        </span>
      </button>

      <Presets current={holdings} onApply={(hs) => set(hs)} />
    </div>
  )
}

interface RowProps {
  h: Holding
  color: string
  locked: boolean
  movable: boolean
  canRemove: boolean
  onWeight: (w: number) => void
  onLock: () => void
  onRemove: () => void
}

function HoldingRow({ h, color, locked, movable, canRemove, onWeight, onLock, onRemove }: RowProps) {
  const m = assetMeta(h.symbol)
  const disabled = locked || !movable
  const short = m && m.years < 10
  return (
    <div className={cx('hrow', locked && 'is-locked')} style={{ '--c': color } as CSSProperties}>
      <div className="hrow__top">
        <span className="hrow__swatch" aria-hidden="true" />
        <span className="hrow__id">
          <span className="hrow__sym-line">
            <span className="hrow__sym num">{h.symbol}</span>
            {m && <span className="cls-badge">{GROUP_LABEL[m.group].short}</span>}
          </span>
          <span className="hrow__name" title={m?.name}>
            {m?.name ?? 'Not in bundled data'}
          </span>
        </span>
        {m && (
          <span className="hrow__spark" title={`${fmtYears(m.years)} of history · 10-yr ${fmtCagr(m.cagr10)}/yr`}>
            <Sparkline values={m.spark} width={52} height={22} color={color} />
          </span>
        )}
        <WeightInput value={h.weight} disabled={disabled} symbol={h.symbol} onChange={onWeight} />
      </div>
      <div className="hrow__bottom">
        <div
          className={cx('slider', 'slider--compact', disabled && 'is-disabled')}
          style={{ '--pct': h.weight, '--track-c': color } as CSSProperties}
        >
          <div className="slider__control">
            <div className="slider__track" aria-hidden="true">
              <div className="slider__fill" />
            </div>
            <input
              className="slider__input"
              type="range"
              min={0}
              max={1}
              step={0.005}
              value={h.weight}
              disabled={disabled}
              aria-label={`${h.symbol} weight`}
              aria-valuetext={percent(h.weight, { digits: 1 })}
              onChange={(e) => onWeight(Number(e.currentTarget.value))}
            />
          </div>
        </div>
        <button
          type="button"
          className={cx('icon-btn hrow__btn', locked && 'is-on')}
          aria-pressed={locked}
          aria-label={`${locked ? 'Unlock' : 'Lock'} ${h.symbol} weight`}
          title={locked ? 'Locked — other changes leave this weight alone' : 'Lock this weight'}
          onClick={onLock}
        >
          <LockIcon locked={locked} />
        </button>
        <button
          type="button"
          className="icon-btn hrow__btn hrow__remove"
          aria-label={`Remove ${h.symbol}`}
          title="Remove"
          onClick={onRemove}
          disabled={!canRemove}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
            <path d="M4.5 4.5l7 7M11.5 4.5l-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      {short && (
        <div className="hrow__warn">
          <svg width="12" height="12" viewBox="0 0 16 16" aria-hidden="true">
            <path d="M8 2.5l6 11H2z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
            <path d="M8 6.5v3.25M8 11.6v.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Short history — blended toward market
          <span className="num ink-3"> · {fmtYears(m.years)}</span>
        </div>
      )}
    </div>
  )
}

function LockIcon({ locked }: { locked: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <rect x="3.5" y="7" width="9" height="6.5" rx="1.6" fill={locked ? 'currentColor' : 'none'} fillOpacity={locked ? 0.18 : 0} />
      <motion.path
        initial={false}
        animate={{ d: locked ? 'M5.5 7V5.2a2.5 2.5 0 0 1 5 0V7' : 'M5.5 7V5.2a2.5 2.5 0 0 1 5 0V4.6' }}
        transition={{ duration: 0.2 }}
      />
    </svg>
  )
}

function WeightInput({ value, disabled, symbol, onChange }: { value: number; disabled: boolean; symbol: string; onChange: (v: number) => void }) {
  const [draft, setDraft] = useState<string | null>(null)
  const shown = wPct(value).replace('%', '')
  const commit = (raw: string) => {
    const v = parseLoose(raw.replace('%', ''), 'percent')
    if (v !== null) onChange(v)
    setDraft(null)
  }
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault()
      const step = (e.shiftKey ? 5 : 1) / 100
      onChange(Math.round((value + (e.key === 'ArrowUp' ? step : -step)) * 100) / 100)
      setDraft(null)
    } else if (e.key === 'Enter') commit(e.currentTarget.value)
    else if (e.key === 'Escape') setDraft(null)
  }
  return (
    <label className={cx('wfield', disabled && 'is-disabled')}>
      <span className="sr-only">{symbol} weight, percent</span>
      <input
        className="wfield__input num"
        type="text"
        inputMode="decimal"
        autoComplete="off"
        value={draft ?? shown}
        readOnly={disabled}
        aria-disabled={disabled || undefined}
        onFocus={(e) => {
          // Select all, unless the user already started typing (late rAF would eat a keystroke).
          const el = e.currentTarget
          const v = el.value
          el.select()
          requestAnimationFrame(() => document.activeElement === el && el.value === v && el.select())
        }}
        onChange={(e) => setDraft(e.currentTarget.value)}
        onBlur={(e) => draft !== null && commit(e.currentTarget.value)}
        onKeyDown={disabled ? undefined : onKey}
      />
      <span className="wfield__pct num" aria-hidden="true">
        %
      </span>
    </label>
  )
}

// ---------- Presets ----------

const PRESETS: { id: string; label: string; holdings: Holding[] }[] = [
  {
    id: 'three',
    label: 'Three-fund',
    holdings: [
      { symbol: 'VTI', weight: 0.5 },
      { symbol: 'VXUS', weight: 0.3 },
      { symbol: 'BND', weight: 0.2 },
    ],
  },
  {
    id: 'dividend',
    label: 'Dividend core',
    holdings: [
      { symbol: 'SCHD', weight: 0.3 },
      { symbol: 'VYM', weight: 0.25 },
      { symbol: 'VIG', weight: 0.25 },
      { symbol: 'BND', weight: 0.2 },
    ],
  },
  {
    id: 'growth',
    label: 'Growth tilt',
    holdings: [
      { symbol: 'VTI', weight: 0.5 },
      { symbol: 'QQQ', weight: 0.35 },
      { symbol: 'SMH', weight: 0.15 },
    ],
  },
  {
    id: 'allweather',
    label: 'All-weather',
    holdings: [
      { symbol: 'VTI', weight: 0.3 },
      { symbol: 'TLT', weight: 0.4 },
      { symbol: 'IEF', weight: 0.15 },
      { symbol: 'GLD', weight: 0.075 },
      { symbol: 'DBC', weight: 0.075 },
    ],
  },
  { id: 'mag7', label: 'Magnificent 7', holdings: equalWeights(['AAPL', 'MSFT', 'NVDA', 'AMZN', 'GOOGL', 'META', 'TSLA']) },
]

const sameMix = (a: Holding[], b: Holding[]) =>
  a.length === b.length && a.every((h, i) => h.symbol === b[i].symbol && Math.abs(h.weight - b[i].weight) < 0.001)

function Presets({ current, onApply }: { current: Holding[]; onApply: (hs: Holding[]) => void }) {
  const [pending, setPending] = useState<string | null>(null)
  const p = PRESETS.find((x) => x.id === pending)
  return (
    <div className="presets">
      <div className="field__row">
        <span className="field__label" id="presets-label">
          Start from a model portfolio
        </span>
      </div>
      <div className="chips" role="group" aria-labelledby="presets-label">
        {PRESETS.map((x) => {
          const active = sameMix(current, x.holdings)
          return (
            <button
              key={x.id}
              type="button"
              className={cx('chip', active && 'is-active', pending === x.id && 'is-pending')}
              aria-pressed={active}
              aria-expanded={pending === x.id}
              onClick={() => setPending(active ? null : pending === x.id ? null : x.id)}
            >
              {x.label}
            </button>
          )
        })}
      </div>
      <AnimatePresence initial={false}>
        {p && (
          <motion.div
            key={p.id}
            className="confirm"
            role="region"
            aria-label={`Apply ${p.label}`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease }}
          >
            <div className="confirm__inner">
              <p className="confirm__text">
                Replace your {current.length} {current.length === 1 ? 'holding' : 'holdings'} with <em>{p.label}</em>?
              </p>
              <p className="confirm__mix num">{p.holdings.map((h) => `${h.symbol} ${wPct(h.weight)}`).join(' · ')}</p>
              <div className="confirm__actions">
                <button
                  type="button"
                  className="btn btn--primary btn--sm"
                  autoFocus
                  onClick={() => {
                    onApply(structuredClone(p.holdings))
                    setPending(null)
                  }}
                >
                  Replace holdings
                </button>
                <button type="button" className="btn btn--ghost btn--sm" onClick={() => setPending(null)}>
                  Keep mine
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
