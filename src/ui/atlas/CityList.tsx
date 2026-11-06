import { m as motion } from 'framer-motion'
import { useDeferredValue, useMemo, useState } from 'react'
import { currency, currencyCompact, percent } from '../format'
import { ease } from '../motion'
import { SegmentedControl, cx } from '../primitives'
import { FX_RISK_LABEL, costDelta, fxRisk, inRegion, successColor, successTextColor, type Ranked, type RegionChip } from './atlasData'
import { CodeChip } from './CodeChip'
import { expatPickFor } from '../../data/expatPicks'
import { VerifiedMark } from './VerifiedMark'
import { verifiedLabel } from './picks'

type SortKey = 'odds' | 'cost' | 'name'

export interface CityListProps {
  rows: Ranked[]
  homeId: string
  destId: string | null
  region: RegionChip
  compare: string[]
  onToggleCompare: (id: string) => void
  onChoose: (id: string) => void
  /** Open a top pick's profile (cities ranked 1–15 in the expat picks). */
  onOpenPick?: (id: string) => void
}

export function CityList({ rows, homeId, destId, region, compare, onToggleCompare, onChoose, onOpenPick }: CityListProps) {
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

  const pinned = useMemo(() => {
    const out: Ranked[] = []
    const home = rows.find((r) => r.cityId === homeId)
    const dest = destId ? rows.find((r) => r.cityId === destId) : undefined
    if (home) out.push(home)
    if (dest && dest !== home) out.push(dest)
    return out
  }, [rows, homeId, destId])

  const rowProps = { homeId, destId, compare, onToggleCompare, onChoose, onOpenPick, homeSpend: pinned[0]?.spendUsd ?? 0 }

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
        <div className="clist__head" aria-hidden="true">
          <span>#</span>
          <span>City</span>
          <span>Plan holds</span>
          <span className="is-r">A year</span>
          <span className="is-r">Vs home</span>
          <span>Currency risk</span>
          <span className="is-c">Compare</span>
        </div>
        <ul className="clist__rows" role="list">
          {shown.map((r, i) => (
            <Row key={r.cityId} r={r} i={i} {...rowProps} />
          ))}
        </ul>
        {shown.length === 0 && (
          <p className="clist__empty">
            No cities match <b>“{q}”</b>
            {region !== 'All' ? ` in ${region}` : ''}.
          </p>
        )}
        <p className="clist__count t-small ink-3">
          {shown.length === rows.length ? `All ${rows.length} cities` : `${shown.length} of ${rows.length} cities`} · ranked by the share of
          simulated futures where the plan never forces a sale.
        </p>
      </section>
    </div>
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
  onOpenPick,
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
  onOpenPick?: (id: string) => void
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
  const pick = expatPickFor(r.cityId)
  const profiled = pick?.profile && onOpenPick ? pick : undefined
  const label = isHome
    ? `${r.city.name}, your home: plan holds in ${percent(r.successRate)} of futures; ${vl.spoken}.${destId ? ' Choose to stay home.' : ''}`
    : `${isDest ? 'Your destination' : 'Make destination'}: ${r.city.name}, ${r.city.country}. Plan holds in ${percent(r.successRate)}, rank ${r.rank}, ${currency(r.spendUsd)} a year, ${costDelta(r.costRatio)} vs home; ${vl.spoken}.`
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
            <span>
              {(isHome || isDest) && <em className="crow__role">{isHome ? 'Home · ' : 'Destination · '}</em>}
              {r.city.country}
              <VerifiedMark label={vl} className="crow__vmark" />
            </span>
          </span>
          {isHome && <span className="crow__tag">Home</span>}
          {isDest && <span className="crow__tag is-dest">Destination</span>}
        </button>
        {profiled && (
          <button
            type="button"
            className="pickbadge"
            onClick={() => onOpenPick!(r.cityId)}
            aria-label={`Top pick ${profiled.rank} for expat retirees: open the ${r.city.name} profile`}
            title={`Top pick #${profiled.rank} for expat retirees · open profile`}
          >
            <span className="pickbadge__l">Top pick </span>#{profiled.rank}
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
