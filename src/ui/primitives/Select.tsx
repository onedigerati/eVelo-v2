import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { ease } from '../motion'
import { cx } from './cx'
import { Chevron } from './Section'

export interface SelectOption<T extends string> {
  value: T
  label: string
  /** Secondary text on the right (e.g. country, currency). */
  meta?: string
  /** Leading glyph (flag, icon). */
  leading?: ReactNode
  /** Optional group heading; consecutive options with the same group are listed under it. */
  group?: string
  /** Extra text matched by the filter but not shown. */
  keywords?: string
}

export interface SelectProps<T extends string> {
  label: ReactNode
  value: T | null
  options: SelectOption<T>[]
  onChange: (v: T) => void
  placeholder?: string
  /** Show a filter input in the popover (combobox behaviour). */
  searchable?: boolean
  hint?: ReactNode
  className?: string
}

/**
 * Listbox select. Button opens a popover with a listbox; arrows/Home/End move, Enter
 * selects, Escape closes, typing filters (searchable) or jumps (typeahead). The popover is
 * rendered inline (not portaled) so scoped themes apply.
 */
export function Select<T extends string>({ label, value, options, onChange, placeholder = 'Choose…', searchable, hint, className }: SelectProps<T>) {
  const uid = useId()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const root = useRef<HTMLDivElement>(null)
  const button = useRef<HTMLButtonElement>(null)
  const list = useRef<HTMLUListElement>(null)
  const search = useRef<HTMLInputElement>(null)
  const typeahead = useRef({ s: '', t: 0 })

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q ? options.filter((o) => `${o.label} ${o.meta ?? ''}`.toLowerCase().includes(q)) : options
  }, [options, query])
  const selected = options.find((o) => o.value === value) ?? null

  useEffect(() => {
    if (!open) return
    const i = filtered.findIndex((o) => o.value === value)
    setActive(i >= 0 ? i : 0)
    requestAnimationFrame(() => (searchable ? search.current : list.current)?.focus())
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [open])

  useEffect(() => {
    list.current?.querySelector<HTMLElement>(`[data-i="${active}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [active, open])

  const close = (focusButton = true) => {
    setOpen(false)
    setQuery('')
    if (focusButton) button.current?.focus()
  }
  const choose = (i: number) => {
    const o = filtered[i]
    if (o) onChange(o.value)
    close()
  }

  const onListKey = (e: KeyboardEvent) => {
    const n = filtered.length
    if (e.key === 'ArrowDown') (e.preventDefault(), setActive((a) => Math.min(n - 1, a + 1)))
    else if (e.key === 'ArrowUp') (e.preventDefault(), setActive((a) => Math.max(0, a - 1)))
    else if (e.key === 'Home') (e.preventDefault(), setActive(0))
    else if (e.key === 'End') (e.preventDefault(), setActive(n - 1))
    else if (e.key === 'Enter' || (e.key === ' ' && !searchable)) (e.preventDefault(), choose(active))
    else if (e.key === 'Escape') (e.preventDefault(), close())
    else if (e.key === 'Tab') close(false)
    else if (!searchable && e.key.length === 1) {
      const now = Date.now()
      const ta = typeahead.current
      ta.s = now - ta.t > 600 ? e.key.toLowerCase() : ta.s + e.key.toLowerCase()
      ta.t = now
      const i = filtered.findIndex((o) => o.label.toLowerCase().startsWith(ta.s))
      if (i >= 0) setActive(i)
    }
  }

  const listId = `${uid}-list`
  const labelId = `${uid}-label`
  const optId = (i: number) => `${uid}-opt-${i}`

  return (
    <div className={cx('select', open && 'is-open', className)} ref={root}>
      <div className="field__row">
        <span className="field__label" id={labelId}>
          {label}
        </span>
      </div>
      <div className="select__anchor">
      <button
        ref={button}
        type="button"
        className="select__button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-labelledby={`${labelId} ${uid}-val`}
        onClick={() => (open ? close() : setOpen(true))}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault()
            setOpen(true)
          }
        }}
      >
        {selected?.leading && <span className="select__leading">{selected.leading}</span>}
        <span className={cx('select__value', !selected && 'is-placeholder')} id={`${uid}-val`}>
          {selected?.label ?? placeholder}
        </span>
        {selected?.meta && <span className="select__meta">{selected.meta}</span>}
        <Chevron open={open} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            className="select__pop"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98, transition: { duration: 0.14 } }}
            transition={{ duration: 0.22, ease }}
          >
            {searchable && (
              <div className="select__search">
                <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
                  <circle cx="7" cy="7" r="4.75" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <input
                  ref={search}
                  role="combobox"
                  aria-expanded="true"
                  aria-controls={listId}
                  aria-autocomplete="list"
                  aria-activedescendant={filtered.length ? optId(active) : undefined}
                  aria-label="Filter options"
                  placeholder="Type to filter"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.currentTarget.value)
                    setActive(0)
                  }}
                  onKeyDown={onListKey}
                />
              </div>
            )}
            <ul
              ref={list}
              id={listId}
              role="listbox"
              aria-labelledby={labelId}
              tabIndex={searchable ? -1 : 0}
              aria-activedescendant={!searchable && filtered.length ? optId(active) : undefined}
              className="select__list"
              onKeyDown={searchable ? undefined : onListKey}
            >
              {filtered.length === 0 && <li className="select__empty">No matches</li>}
              {filtered.map((o, i) => [
                o.group && o.group !== filtered[i - 1]?.group && (
                  <li key={`g-${o.group}`} role="presentation" className="select__group">
                    {o.group}
                  </li>
                ),
                <li
                  key={o.value}
                  id={optId(i)}
                  data-i={i}
                  role="option"
                  aria-selected={o.value === value}
                  className={cx('select__opt', i === active && 'is-active', o.value === value && 'is-selected')}
                  onPointerMove={() => setActive(i)}
                  onClick={() => choose(i)}
                >
                  {o.leading && <span className="select__leading">{o.leading}</span>}
                  <span className="select__opt-label">{o.label}</span>
                  {o.meta && <span className="select__meta">{o.meta}</span>}
                  <svg className="select__check" width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
                    <path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </li>,
              ])}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
      {hint && <p className="field__hint">{hint}</p>}
    </div>
  )
}
