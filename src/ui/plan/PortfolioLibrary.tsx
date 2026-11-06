// "Your portfolios" (saved in this browser) and the built-in model portfolios, under the holdings list.
// One inline panel at a time: apply, save, rename or delete. Applying replaces holdings only.

import { AnimatePresence, m as motion } from 'framer-motion'
import { useEffect, useId, useState, type FormEvent, type KeyboardEvent, type ReactNode } from 'react'
import type { Holding } from '../../engine/types'
import { cleanName, findByName, MAX_NAME, MAX_SAVED, sameMix, usePortfolios } from '../../state/portfolios'
import { ease } from '../motion'
import { cx } from '../primitives'
import { wPct } from './HoldingsEditor'
import { equalWeights } from './weights'

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

type Panel =
  | { kind: 'preset'; id: string }
  | { kind: 'saved'; id: string }
  | { kind: 'save' }
  | { kind: 'rename'; id: string }
  | { kind: 'delete'; id: string }

const mixText = (hs: Holding[]) => hs.map((h) => `${h.symbol} ${wPct(h.weight)}`).join(' · ')
const holdingsWord = (n: number) => `${n} ${n === 1 ? 'holding' : 'holdings'}`

export function PortfolioLibrary({ current, onApply }: { current: Holding[]; onApply: (hs: Holding[]) => void }) {
  const saved = usePortfolios((s) => s.saved)
  const [panel, setPanel] = useState<Panel | null>(null)
  const [notice, setNotice] = useState('')
  const uid = useId()

  // A saved portfolio deleted in another tab closes its panel here.
  const target = panel && panel.kind !== 'preset' && panel.kind !== 'save' ? saved.find((p) => p.id === panel.id) : undefined
  useEffect(() => {
    if (panel && panel.kind !== 'preset' && panel.kind !== 'save' && !target) setPanel(null)
  }, [panel, target])
  useEffect(() => {
    if (!notice) return
    const t = window.setTimeout(() => setNotice(''), 3200)
    return () => window.clearTimeout(t)
  }, [notice])

  const toggle = (p: Panel) =>
    setPanel((cur) => (cur && cur.kind === p.kind && (!('id' in p) || ('id' in cur && cur.id === p.id)) ? null : p))
  const apply = (hs: Holding[], name: string) => {
    onApply(structuredClone(hs))
    setPanel(null)
    setNotice(`Holdings replaced with ${name}.`)
  }
  const close = () => setPanel(null)
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation()
      close()
    }
  }

  const activeSaved = saved.find((p) => sameMix(current, p.holdings))
  const canSave = current.length > 0

  let body: ReactNode = null
  let tone: 'warn' | 'calm' = 'calm'
  if (panel?.kind === 'preset') {
    const p = PRESETS.find((x) => x.id === panel.id)
    if (p) {
      tone = 'warn'
      body = (
        <>
          <p className="confirm__text">
            Replace your {holdingsWord(current.length)} with <em>{p.label}</em>?
          </p>
          <p className="confirm__mix num">{mixText(p.holdings)}</p>
          <div className="confirm__actions">
            <button type="button" className="btn btn--primary btn--sm" autoFocus onClick={() => apply(p.holdings, p.label)}>
              Replace holdings
            </button>
            <button type="button" className="btn btn--ghost btn--sm" onClick={close}>
              Keep mine
            </button>
          </div>
        </>
      )
    }
  } else if (panel?.kind === 'saved' && target) {
    const isCurrent = sameMix(current, target.holdings)
    tone = isCurrent ? 'calm' : 'warn'
    body = (
      <>
        <p className="confirm__text">
          {isCurrent ? (
            <>
              <em>{target.name}</em> is your current mix.
            </>
          ) : (
            <>
              Replace your {holdingsWord(current.length)} with <em>{target.name}</em>?
            </>
          )}
        </p>
        <p className="confirm__mix num">{mixText(target.holdings)}</p>
        <div className="confirm__actions">
          {!isCurrent && (
            <>
              <button type="button" className="btn btn--primary btn--sm" autoFocus onClick={() => apply(target.holdings, target.name)}>
                Replace holdings
              </button>
              <button type="button" className="btn btn--ghost btn--sm" onClick={close}>
                Keep mine
              </button>
            </>
          )}
          <span className="confirm__aside">
            <button type="button" className="text-btn" autoFocus={isCurrent} onClick={() => setPanel({ kind: 'rename', id: target.id })}>
              Rename
            </button>
            <button type="button" className="text-btn text-btn--danger" onClick={() => setPanel({ kind: 'delete', id: target.id })}>
              Delete
            </button>
          </span>
        </div>
      </>
    )
  } else if (panel?.kind === 'save') {
    body = (
      <NameForm
        key="save"
        label="Name this mix"
        initial={activeSaved?.name ?? ''}
        hint={mixText(current)}
        submitLabel={(name) => {
          const clash = findByName(saved, name)
          return clash ? `Replace “${clash.name}”` : 'Save portfolio'
        }}
        check={(name) => {
          const clash = findByName(saved, name)
          if (!clash && saved.length >= MAX_SAVED) return `You can keep up to ${MAX_SAVED}. Delete one, or save over an existing name.`
          if (clash && !sameMix(clash.holdings, current)) return `“${clash.name}” already exists. Saving replaces its holdings with this mix.`
          return null
        }}
        blocking={(name) => !findByName(saved, name) && saved.length >= MAX_SAVED}
        onCancel={close}
        onSubmit={(name) => {
          const r = usePortfolios.getState().save(name, current)
          if (r.ok) {
            setPanel(null)
            setNotice(`Saved “${r.saved.name}”.`)
          }
        }}
      />
    )
  } else if (panel?.kind === 'rename' && target) {
    body = (
      <NameForm
        key={`rename-${target.id}`}
        label={`Rename “${target.name}”`}
        initial={target.name}
        submitLabel={() => 'Rename'}
        check={(name) => {
          const clash = findByName(saved, name)
          return clash && clash.id !== target.id ? `Another portfolio is already called “${clash.name}”.` : null
        }}
        blocking={(name) => {
          const clash = findByName(saved, name)
          return !!clash && clash.id !== target.id
        }}
        onCancel={() => setPanel({ kind: 'saved', id: target.id })}
        onSubmit={(name) => {
          const r = usePortfolios.getState().rename(target.id, name)
          if (r.ok) {
            setPanel(null)
            setNotice(`Renamed to “${cleanName(name)}”.`)
          }
        }}
      />
    )
  } else if (panel?.kind === 'delete' && target) {
    tone = 'warn'
    body = (
      <>
        <p className="confirm__text">
          Delete <em>{target.name}</em>? This can’t be undone.
        </p>
        <p className="confirm__mix num">Your current holdings stay as they are.</p>
        <div className="confirm__actions">
          <button
            type="button"
            className="btn btn--primary btn--sm"
            autoFocus
            onClick={() => {
              usePortfolios.getState().remove(target.id)
              setPanel(null)
              setNotice(`Deleted “${target.name}”.`)
            }}
          >
            Delete portfolio
          </button>
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => setPanel({ kind: 'saved', id: target.id })}>
            Cancel
          </button>
        </div>
      </>
    )
  }

  const panelKey = panel ? `${panel.kind}-${'id' in panel ? panel.id : ''}` : ''

  return (
    <div className="presets">
      <div className="field__row">
        <span className="field__label" id={`${uid}-saved`}>
          Your portfolios
        </span>
        <button
          type="button"
          className="text-btn presets__save"
          disabled={!canSave}
          title={canSave ? 'Save the current holdings under a name' : 'Add a holding first'}
          aria-expanded={panel?.kind === 'save'}
          onClick={() => toggle({ kind: 'save' })}
        >
          Save as…
        </button>
      </div>
      {saved.length > 0 ? (
        <div className="chips" role="group" aria-labelledby={`${uid}-saved`}>
          {saved.map((p) => {
            const active = activeSaved?.id === p.id
            const open = !!panel && panel.kind !== 'preset' && panel.kind !== 'save' && panel.id === p.id
            return (
              <button
                key={p.id}
                type="button"
                className={cx('chip', active && 'is-active', open && !active && 'is-pending')}
                aria-pressed={active}
                aria-expanded={open}
                onClick={() => toggle({ kind: 'saved', id: p.id })}
              >
                <span className="chip__label">{p.name}</span>
                <span className="chip__meta num" aria-label={holdingsWord(p.holdings.length)}>
                  {p.holdings.length}
                </span>
              </button>
            )
          })}
        </div>
      ) : (
        <p className="presets__empty">Save this mix to come back to it later. Saved portfolios stay in this browser.</p>
      )}

      <div className="field__row presets__models">
        <span className="field__label" id={`${uid}-models`}>
          Model portfolios
        </span>
      </div>
      <div className="chips" role="group" aria-labelledby={`${uid}-models`}>
        {PRESETS.map((x) => {
          const active = sameMix(current, x.holdings)
          const open = panel?.kind === 'preset' && panel.id === x.id
          return (
            <button
              key={x.id}
              type="button"
              className={cx('chip', active && 'is-active', open && 'is-pending')}
              aria-pressed={active}
              aria-expanded={open}
              onClick={() => (active ? setPanel(null) : toggle({ kind: 'preset', id: x.id }))}
            >
              {x.label}
            </button>
          )
        })}
      </div>

      <AnimatePresence initial={false} mode="wait">
        {body && (
          <motion.div
            key={panelKey}
            className="confirm"
            role="region"
            aria-label={panel?.kind === 'save' ? 'Save portfolio' : 'Portfolio'}
            onKeyDown={onKey}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.26, ease }}
          >
            <div className={cx('confirm__inner', tone === 'calm' && 'confirm__inner--calm')}>{body}</div>
          </motion.div>
        )}
      </AnimatePresence>
      <p className="presets__notice" role="status" aria-live="polite">
        {notice}
      </p>
    </div>
  )
}

interface NameFormProps {
  label: string
  initial: string
  hint?: string
  submitLabel: (name: string) => string
  /** Message shown under the field (warning or error), or null. */
  check: (name: string) => string | null
  /** True when the message blocks submitting. */
  blocking: (name: string) => boolean
  onSubmit: (name: string) => void
  onCancel: () => void
}

function NameForm({ label, initial, hint, submitLabel, check, blocking, onSubmit, onCancel }: NameFormProps) {
  const [name, setName] = useState(initial)
  const id = useId()
  const clean = cleanName(name)
  const msg = clean ? check(clean) : null
  const blocked = !clean || blocking(clean)
  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!blocked) onSubmit(clean)
  }
  return (
    <form className="nameform" onSubmit={submit}>
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      <div className="numfield__box nameform__box">
        <input
          id={id}
          className="numfield__input"
          type="text"
          autoComplete="off"
          autoFocus
          maxLength={MAX_NAME + 20}
          placeholder="e.g. Core 60/40"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onFocus={(e) => e.currentTarget.select()}
          aria-describedby={msg ? `${id}-msg` : hint ? `${id}-hint` : undefined}
          aria-invalid={blocked && !!clean ? true : undefined}
        />
      </div>
      {msg ? (
        <p id={`${id}-msg`} className={cx('nameform__msg', blocking(clean) && 'is-error')}>
          {msg}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="confirm__mix num">
            {hint}
          </p>
        )
      )}
      <div className="confirm__actions">
        <button type="submit" className="btn btn--primary btn--sm" disabled={blocked}>
          {submitLabel(clean)}
        </button>
        <button type="button" className="btn btn--ghost btn--sm" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}

