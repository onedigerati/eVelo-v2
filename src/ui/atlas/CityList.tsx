import { m as motion } from 'framer-motion'
import { useDeferredValue, useMemo, useState, type ReactNode } from 'react'
import { currency, currencyCompact, percent } from '../format'
import { ease } from '../motion'
import { SegmentedControl, cx } from '../primitives'
import { FX_RISK_LABEL, costDelta, fxRisk, inRegion, successColor, successTextColor, type Ranked, type RegionChip } from './atlasData'
import { CodeChip } from './CodeChip'
import { expatPickFor, hasProfile } from '../../data/expatPicks'
import { VerifiedMark } from './VerifiedMark'
import { verifiedLabel } from './picks'
import { taxStatus } from './taxLines'
import { costBands, defaultOpen, groupTiers, oddsBands, type Tier } from './tiers'

type SortKey = 'odds' | 'cost' | 'name'

export interface CityListProps {
  rows: Ranked[]
  homeId: string
  destId: string | null
  region: RegionChip
  compare: string[]
  onToggleCompare: (id: string) => void
  onChoose: (id: string) => void
  /** Open a city's profile: a pick's "Top pick #N" badge, or the "Profile" chip of an unranked profiled city. */
  onOpenProfile?: (id: string) => void
}

export function CityList({ rows, homeId, destId, region, compare, onToggleCompare, onChoose, onOpenProfile }: CityListProps) {
  const [sort, setSort] = useState<SortKey>('odds')
  const [q, setQ] = useState('')
  const query = useDeferredValue(q.trim().toLowerCase())

  const shown = useMemo(() => {
    const f = rows.filter(
      (r) =>
        inRegion(r.city, region) &&
        (!query ||
          r.city.name.toLowerCase().includes(query) ||
          r.city.country.toLowerCase().includes(query) ||
          r.city.currency.toLowerCase() === query ||
          r.city.countryCode.toLowerCase() === query),
    )
    if (sort === 'cost') return [...f].sort((a, b) => a.spendUsd - b.spendUsd || a.rank - b.rank)
    if (sort === 'name') return [...f].sort((a, b) => a.city.name.localeCompare(b.city.name))
    return f
  }, [rows, region, query, sort])

  // Odds and cost bands split from the full list, so tiers hold still while searching or switching region.
  const bands = useMemo(() => (sort === 'cost' ? costBands(rows) : sort === 'odds' ? oddsBands(rows) : undefined), [rows, sort])
  const tiers = useMemo(() => groupTiers(shown, sort, homeId, bands), [shown, sort, homeId, bands])
  // Open tiers reset to the default (first tier; every tier with hits while searching) whenever the sort,
  // search or region changes; toggles only last within that context.
  const ctx = `${sort}|${query}|${region}`
  const [toggled, setToggled] = useState<Set<string> | null>(null)
  const [openCtx, setOpenCtx] = useState(ctx)
  if (openCtx !== ctx) {
    setOpenCtx(ctx)
    setToggled(null)
  }
  const open = (openCtx === ctx && toggled) || defaultOpen(tiers, !!query)
  const allOpen = tiers.length > 0 && tiers.every((t) => open.has(t.key))
  const setOpen = (keys: Set<string>) => setToggled(keys)
  const toggle = (key: string) => {
    const next = new Set(open)
    if (!next.delete(key)) next.add(key)
    setOpen(next)
  }

  const pinned = useMemo(() => {
    const out: Ranked[] = []
    const home = rows.find((r) => r.cityId === homeId)
    const dest = destId ? rows.find((r) => r.cityId === destId) : undefined
    if (home) out.push(home)
    if (dest && dest !== home) out.push(dest)
    return out
  }, [rows, homeId, destId])

  const rowProps = { homeId, destId, compare, onToggleCompare, onChoose, onOpenProfile, homeSpend: pinned[0]?.spendUsd ?? 0 }

  return (
    <div className="clist">
      <div className="clist__tools">
        <label className="search">
          <svg width="16" height="16" viewBox="0 0 20 20" aria-hidden="true" className="search__icon">
            <circle cx="9" cy="9" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M13.2 13.2L17 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search cities or countries"
            aria-label="Search cities"
            className="search__input"
          />
          {q && (
            <button type="button" className="search__clear" aria-label="Clear search" onClick={() => setQ('')}>
              ×
            </button>
          )}
        </label>
        <SegmentedControl<SortKey>
          size="sm"
          aria-label="Sort cities"
          value={sort}
          onChange={setSort}
          options={[
            { value: 'odds', label: 'Best odds' },
            { value: 'cost', label: 'Cheapest' },
            { value: 'name', label: 'A–Z' },
          ]}
        />
      </div>

      {pinned.length > 0 && (
        <section className="clist__group" aria-label="Your cities">
          <div className="clist__group-h t-eyebrow">Your cities</div>
          <ul className="clist__rows" role="list">
            {pinned.map((r) => (
              <Row key={`pin-${r.cityId}`} r={r} {...rowProps} pinnedRow />
            ))}
          </ul>
        </section>
      )}

      <section className="clist__group" aria-label="All cities">
        {tiers.length > 1 && (
          <div className="clist__tierbar">
            <span className="t-small ink-3">
              {tiers.length} {sort === 'name' ? 'letters' : 'tiers'}
            </span>
            <button
              type="button"
              className="clist__openall"
              onClick={() => setOpen(allOpen ? new Set() : new Set(tiers.map((t) => t.key)))}
            >
              {allOpen ? 'Close all' : 'Open all'}
            </button>
          </div>
        )}
        <div className="clist__head" aria-hidden="true">
          <span>#</span>
          <span>City</span>
          <span>Plan holds</span>
          <span className="is-r">A year</span>
          <span className="is-r">Vs home</span>
          <span>Currency risk</span>
          <span className="is-c">Compare</span>
        </div>
        {tiers.map((t) => (
          <TierBlock key={t.key} tier={t} open={open.has(t.key)} onToggle={() => toggle(t.key)}>
            {t.rows.map((r, i) => (
              <Row key={r.cityId} r={r} i={i} {...rowProps} />
            ))}
          </TierBlock>
        ))}
        {shown.length === 0 && (
          <p className="clist__empty">
            No cities match <b>“{q}”</b>
            {region !== 'All' ? ` in ${region}` : ''}.
          </p>
        )}
        <p className="clist__count t-small ink-3">
          {shown.length === rows.length ? `All ${rows.length} cities` : `${shown.length} of ${rows.length} cities`} · ranked by the share of
          simulated futures where the plan never forces a sale. Cities marked “tax not modelled” are in countries eVelo hasn’t
          researched for wealth and inheritance tax: their odds and estates carry none, which isn’t the same as there being none.
        </p>
      </section>
    </div>
  )
}

const PEEK = 3

function TierBlock({ tier, open, onToggle, children }: { tier: Tier<Ranked>; open: boolean; onToggle: () => void; children: ReactNode }) {
  const id = `tier-${tier.key}`
  const n = tier.rows.length
  const peek = tier.rows.slice(0, PEEK).map((r) => r.city.name)
  return (
    <div className={cx('ctier', open && 'is-open')}>
      <h3 className="ctier__h">
        <button type="button" className="ctier__btn" aria-expanded={open} aria-controls={id} onClick={onToggle}>
          <svg className="ctier__chev" width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
            <path d="M4 2.5L7.5 6 4 9.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="ctier__label">
            <b>{tier.label}</b>
            {tier.range && <span className="ctier__range">{tier.range}</span>}
          </span>
          <span className="ctier__count num">
            {n} {n === 1 ? 'city' : 'cities'}
          </span>
          {tier.hasHome && <span className="crow__tag ctier__home">Home</span>}
          {!open && (
            <>
              <span className="ctier__peek">
                {peek.join(', ')}
                {n > PEEK ? ` +${n - PEEK}` : ''}
              </span>
              <OddsSpark rows={tier.rows} />
            </>
          )}
        </button>
      </h3>
      {open && (
        <ul className="clist__rows" role="list" id={id}>
          {children}
        </ul>
      )}
    </div>
  )
}

/** Tiny strip of the tier's odds: one bar per city, height and color by its odds. */
function OddsSpark({ rows }: { rows: Ranked[] }) {
  const W = 72
  const H = 18
  const n = rows.length
  const step = W / Math.max(n, 1)
  const bw = Math.max(1, Math.min(4, step - (step > 2 ? 1 : 0)))
  return (
    <svg className="ctier__spark" width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden="true" preserveAspectRatio="none">
      <line x1="0" x2={W} y1={H - 0.5} y2={H - 0.5} className="ctier__spark-base" />
      {rows.map((r, i) => {
        const h = Math.max(1.5, r.successRate * (H - 1))
        return <rect key={r.cityId} x={i * step} y={H - 1 - h} width={bw} height={h} rx={0.5} style={{ fill: successColor(r.successRate) }} />
      })}
    </svg>
  )
}

function Row({
  r,
  i = 0,
  homeId,
  destId,
  compare,
  onToggleCompare,
  onChoose,
  onOpenProfile,
  homeSpend,
  pinnedRow,
}: {
  r: Ranked
  i?: number
  homeId: string
  destId: string | null
  compare: string[]
  onToggleCompare: (id: string) => void
  onChoose: (id: string) => void
  onOpenProfile?: (id: string) => void
  homeSpend: number
  pinnedRow?: boolean
}) {
  const isHome = r.cityId === homeId
  const isDest = r.cityId === destId
  const checked = compare.includes(r.cityId)
  const full = compare.length >= 3 && !checked
  const risk = fxRisk(r.city)
  const top = r.rank <= 3
  const vl = verifiedLabel(r.city)
  const noTax = taxStatus(r.city) === 'unmodelled'
  const taxTitle = `Local wealth and inheritance tax not modelled for ${r.city.country}: not researched, so the odds here assume none.`
  const taxSpoken = noTax ? `; local wealth and inheritance tax not modelled for ${r.city.country}` : ''
  const pick = expatPickFor(r.cityId)
  const profiled = pick?.profile && onOpenProfile ? pick : undefined
  // An unranked city with a profile gets a "Profile" chip where picks have the badge.
  const unranked = !profiled && !pick && onOpenProfile && hasProfile(r.cityId)
  const label = isHome
    ? `${r.city.name}, your home: plan holds in ${percent(r.successRate)} of futures; ${vl.spoken}${taxSpoken}.${destId ? ' Choose to stay home.' : ''}`
    : `${isDest ? 'Your destination' : 'Make destination'}: ${r.city.name}, ${r.city.country}. Plan holds in ${percent(r.successRate)}, rank ${r.rank}, ${currency(r.spendUsd)} a year, ${costDelta(r.costRatio)} vs home; ${vl.spoken}${taxSpoken}.`
  return (
    <motion.li
      layout={pinnedRow ? false : 'position'}
      transition={{ layout: { type: 'spring', stiffness: 420, damping: 40 } }}
      className={cx('crow', top && 'is-top', isHome && 'is-home', isDest && 'is-dest', checked && 'is-checked')}
    >
      <span className={cx('crow__rank num', top && 't-italic')}>{String(r.rank).padStart(2, '0')}</span>
      <span className="crow__who">
        <button type="button" className="crow__main" onClick={() => onChoose(r.cityId)} aria-label={label}>
          <CodeChip code={r.city.countryCode} />
          <span className="crow__name">
            <b>{r.city.name}</b>
            <span className="crow__sub">
              <span className="crow__country">
                {(isHome || isDest) && <em className="crow__role">{isHome ? 'Home · ' : 'Destination · '}</em>}
                {r.city.country}
              </span>
              <VerifiedMark label={vl} className="crow__vmark" />
              {noTax && (
                <span className="taxmark" aria-hidden="true" title={taxTitle}>
                  tax not modelled
                </span>
              )}
            </span>
            {noTax && (
              <span className="taxmark taxmark--line" aria-hidden="true" title={taxTitle}>
                Tax not modelled
              </span>
            )}
          </span>
          {isHome && <span className="crow__tag">Home</span>}
          {isDest && <span className="crow__tag is-dest">Destination</span>}
        </button>
        {profiled && (
          <button
            type="button"
            className="pickbadge"
            onClick={() => onOpenProfile!(r.cityId)}
            aria-label={`Top pick ${profiled.rank} for expat retirees: open the ${r.city.name} profile`}
            title={`Top pick #${profiled.rank} for expat retirees · open profile`}
          >
            <span className="pickbadge__l">Top pick </span>#{profiled.rank}
          </button>
        )}
        {unranked && (
          <button
            type="button"
            className="pickbadge pickbadge--profile"
            onClick={() => onOpenProfile!(r.cityId)}
            aria-label={`Open the ${r.city.name} profile`}
            title={`${r.city.name} profile · not a ranked pick`}
          >
            <span className="pickbadge__l">Profile</span>
          </button>
        )}
      </span>
      <span className="crow__odds">
        <span className="crow__bar" aria-hidden="true">
          <motion.i
            initial={{ width: 0 }}
            animate={{ width: `${r.successRate * 100}%` }}
            transition={{ duration: 0.8, ease, delay: pinnedRow ? 0.1 : Math.min(i, 40) * 0.014 }}
            style={{ background: successColor(r.successRate) }}
          />
        </span>
        <b className="num" style={{ color: successTextColor(r.successRate) }}>
          {percent(r.successRate)}
        </b>
      </span>
      <span className="crow__spend num">
        <span className="is-full">{currency(r.spendUsd)}</span>
        <span className="is-compact">{currencyCompact(r.spendUsd)}</span>
      </span>
      <span className={cx('crow__delta num', r.costRatio < 0.995 && 'is-down', r.costRatio > 1.005 && 'is-up')}>
        {isHome ? '—' : costDelta(r.costRatio)}
        {!isHome && homeSpend > 0 && <span className="sr-only"> vs home</span>}
      </span>
      <span
        className={cx('fxchip', `fxchip--${risk}`)}
        title={`${r.city.currency}: ${risk === 'none' ? 'no currency risk' : `${FX_RISK_LABEL[risk].toLowerCase()} currency risk (≈${percent(r.city.fxVol)} a year)`}`}
      >
        <span className="fxchip__ccy">{r.city.currency}</span>
        <span className="fxchip__lvl">{risk === 'none' ? '—' : FX_RISK_LABEL[risk]}</span>
      </span>
      <label className={cx('crow__cmp', full && 'is-disabled')} title={full ? 'Compare holds up to 3 cities' : `Compare ${r.city.name}`}>
        <input
          type="checkbox"
          checked={checked}
          disabled={full}
          onChange={() => onToggleCompare(r.cityId)}
          aria-label={`Compare ${r.city.name}`}
        />
        <span className="crow__check" aria-hidden="true">
          <svg width="12" height="12" viewBox="0 0 16 16">
            <path d="M3.5 8.4l3 3L12.5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </label>
    </motion.li>
  )
}
