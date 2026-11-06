import { AnimatePresence, m as motion } from 'framer-motion'
import { Fragment, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { createPortal } from 'react-dom'
import { useStore } from '../../state/store'
import { percent } from '../format'
import { useBreakpoint, useScrollLock } from '../hooks'
import { ease } from '../motion'
import { cx, Sparkline, toast } from '../primitives'
import { allAssets, GROUP_LABEL, GROUPS, searchAssets, type AssetMeta } from './marketIndex'
import { usePlanUi } from './planUi'
import { addHolding, MAX_HOLDINGS } from './weights'

export const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)

/** Registers ⌘K / Ctrl-K to open the ticker palette while mounted. */
export function usePaletteShortcut() {
  const setOpen = usePlanUi((s) => s.setPaletteOpen)
  useEffect(() => {
    const on = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && !e.altKey && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen(!usePlanUi.getState().paletteOpen)
      }
    }
    window.addEventListener('keydown', on)
    return () => window.removeEventListener('keydown', on)
  }, [setOpen])
}

export const fmtYears = (y: number) => (y >= 10 ? `${Math.floor(y)} yrs` : `${y.toFixed(1)} yrs`)
export const fmtCagr = (c: number | null) => (c === null ? '—' : percent(c, { digits: 1, signed: true }))

/** Command palette for adding a ticker: modal on desktop, bottom sheet on phone. */
export function TickerPalette() {
  const open = usePlanUi((s) => s.paletteOpen)
  const setOpen = usePlanUi((s) => s.setPaletteOpen)
  const bp = useBreakpoint()
  const phone = bp === 'phone'
  useScrollLock(open)
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className={cx('tp-root', phone && 'tp-root--sheet')}>
          <motion.div
            className="tp-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24, ease }}
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <motion.div
            className="tp"
            initial={phone ? { y: '100%' } : { opacity: 0, y: -12, scale: 0.98 }}
            animate={phone ? { y: 0 } : { opacity: 1, y: 0, scale: 1 }}
            exit={phone ? { y: '100%', transition: { duration: 0.24, ease: [0.4, 0, 1, 1] } } : { opacity: 0, y: -8, scale: 0.98, transition: { duration: 0.14 } }}
            transition={phone ? { type: 'spring', stiffness: 380, damping: 40 } : { duration: 0.26, ease }}
          >
            <PaletteBody phone={phone} onClose={() => setOpen(false)} />
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

function PaletteBody({ phone, onClose }: { phone: boolean; onClose: () => void }) {
  const uid = useId()
  const holdings = useStore((s) => s.inputs.holdings)
  const setInput = useStore((s) => s.setInput)
  const locked = usePlanUi((s) => s.locked)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const input = useRef<HTMLInputElement>(null)
  const list = useRef<HTMLDivElement>(null)
  const restore = useRef<HTMLElement | null>(null)
  const held = useMemo(() => new Set(holdings.map((h) => h.symbol)), [holdings])
  const full = holdings.length >= MAX_HOLDINGS

  // Flat result list; with no query, everything grouped by class.
  const results = useMemo<AssetMeta[]>(() => {
    if (query.trim()) return searchAssets(query, 50)
    const all = allAssets()
    return GROUPS.flatMap((g) => all.filter((a) => a.group === g.id))
  }, [query])
  const grouped = !query.trim()

  useEffect(() => {
    restore.current = document.activeElement as HTMLElement | null
    const raf = requestAnimationFrame(() => input.current?.focus({ preventScroll: true }))
    return () => {
      cancelAnimationFrame(raf)
      restore.current?.focus?.({ preventScroll: true })
    }
  }, [])
  useEffect(() => {
    list.current?.querySelector<HTMLElement>(`[data-i="${active}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [active])

  const add = (m: AssetMeta | undefined) => {
    if (!m) return
    if (held.has(m.symbol)) {
      toast(`${m.symbol} is already in your plan`)
      return
    }
    if (full) {
      toast(`Up to ${MAX_HOLDINGS} holdings`, { detail: 'Remove one to add another.', tone: 'bruised' })
      return
    }
    const next = addHolding(holdings, m.symbol, new Set(locked))
    setInput('holdings', next)
    const w = next.find((h) => h.symbol === m.symbol)?.weight ?? 0
    toast(`Added ${m.symbol}`, { detail: `${m.name} · ${percent(w, { digits: w * 100 < 10 ? 1 : 0 })}`, tone: 'holds' })
    onClose()
  }

  const onKey = (e: KeyboardEvent) => {
    const n = results.length
    if (e.key === 'ArrowDown') (e.preventDefault(), setActive((a) => Math.min(n - 1, a + 1)))
    else if (e.key === 'ArrowUp') (e.preventDefault(), setActive((a) => Math.max(0, a - 1)))
    else if (e.key === 'PageDown') (e.preventDefault(), setActive((a) => Math.min(n - 1, a + 8)))
    else if (e.key === 'PageUp') (e.preventDefault(), setActive((a) => Math.max(0, a - 8)))
    else if (e.key === 'Enter') (e.preventDefault(), add(results[active]))
    else if (e.key === 'Escape') (e.preventDefault(), e.stopPropagation(), onClose())
    else if (e.key === 'Tab') e.preventDefault() // focus stays in the search field
  }

  const listId = `${uid}-list`
  const optId = (i: number) => `${uid}-o-${i}`

  return (
    <div role="dialog" aria-modal="true" aria-label="Add a holding" className="tp__inner" onKeyDown={onKey}>
      {phone && <div className="tp__grabber" aria-hidden="true"><span /></div>}
      <div className="tp__search">
        <svg width="18" height="18" viewBox="0 0 16 16" aria-hidden="true">
          <circle cx="7" cy="7" r="4.75" fill="none" stroke="currentColor" strokeWidth="1.4" />
          <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        <input
          ref={input}
          role="combobox"
          aria-expanded="true"
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={results.length ? optId(active) : undefined}
          aria-label="Search tickers"
          placeholder={phone ? 'Ticker or name' : 'Search ticker or name — NVDA, gold, dividend…'}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="characters"
          spellCheck={false}
          enterKeyHint="go"
          value={query}
          onChange={(e) => {
            setQuery(e.currentTarget.value)
            setActive(0)
          }}
        />
        {phone ? (
          <button type="button" className="tp__cancel" onClick={onClose}>
            Cancel
          </button>
        ) : (
          <kbd className="kbd">esc</kbd>
        )}
      </div>
      <div className="tp__status">
        <span className="num">
          {holdings.length}/{MAX_HOLDINGS}
        </span>{' '}
        holdings
        {full ? <span className="tp__full"> · Remove one to add another</span> : <span> · New holdings take an equal share</span>}
      </div>
      <div className="tp__list" id={listId} role="listbox" aria-label="Tickers" ref={list}>
        {results.length === 0 && (
          <div className="tp__empty">
            <span className="t-h3">No match for “{query}”</span>
            <span className="t-small">Bundled data covers {allAssets().length} ETFs, stocks and crypto.</span>
          </div>
        )}
        {results.map((m, i) => {
          const isHeld = held.has(m.symbol)
          const head = grouped && m.group !== results[i - 1]?.group
          return (
            <Fragment key={m.symbol}>
              {head && (
                <div className="tp__group" role="presentation">
                  {GROUP_LABEL[m.group].label}
                </div>
              )}
              <div
                id={optId(i)}
                data-i={i}
                role="option"
                aria-selected={i === active}
                aria-disabled={isHeld || full || undefined}
                className={cx('tp__opt', i === active && 'is-active', isHeld && 'is-held', full && !isHeld && 'is-full')}
                onPointerMove={() => i !== active && setActive(i)}
                onClick={() => add(m)}
              >
                <span className="tp__sym num">{m.symbol}</span>
                <span className="tp__name">
                  <span className="tp__name-t">{m.name}</span>
                  <span className="tp__meta">
                    <span className="cls-badge">{GROUP_LABEL[m.group].short}</span>
                    <span className={cx('num', m.years < 10 && 'tone-bruised')}>{fmtYears(m.years)}</span>
                    {!phone && <span className="tp__dot" aria-hidden="true">·</span>}
                    <span className="num tp__cagr">
                      <span className="sr-only">10-year growth </span>
                      {m.cagr10 === null ? 'new' : `${fmtCagr(m.cagr10)}/yr`}
                    </span>
                  </span>
                </span>
                <Sparkline values={m.spark} width={phone ? 48 : 64} height={22} className="tp__spark" />
                <span className="tp__action" aria-hidden="true">
                  {isHeld ? (
                    <svg width="16" height="16" viewBox="0 0 16 16">
                      <path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 16 16">
                      <path d="M8 3.5v9M3.5 8h9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                  )}
                </span>
                {isHeld && <span className="sr-only">, already in plan</span>}
              </div>
            </Fragment>
          )
        })}
      </div>
      {!phone && (
        <div className="tp__foot" aria-hidden="true">
          <span>
            <kbd className="kbd">↑</kbd>
            <kbd className="kbd">↓</kbd> move
          </span>
          <span>
            <kbd className="kbd">↵</kbd> add
          </span>
          <span>
            <kbd className="kbd">{isMac ? '⌘' : 'Ctrl'}</kbd>
            <kbd className="kbd">K</kbd> toggle
          </span>
          <span className="tp__foot-r">10-yr growth · total return</span>
        </div>
      )}
    </div>
  )
}
