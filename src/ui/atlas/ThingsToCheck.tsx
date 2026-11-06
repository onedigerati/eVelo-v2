import { useState } from 'react'
import { COL_AS_OF, COL_SOURCES, EXPAT_CAVEATS } from '../../data/cities'
import { EXPAT_AS_OF, EXPAT_RANKING_SOURCES } from '../../data/expatPicks'
import { longDate, monthYear } from './picks'
import type { City } from '../../engine/types'
import { useFx } from '../../state/fx'
import { cx } from '../primitives'

/** A city's notes, labelled "Things to check". */
export function CityNotes({ city, className }: { city: City; className?: string }) {
  if (!city.notes?.length) return null
  return (
    <div className={cx('ttc', className)}>
      <div className="t-eyebrow ttc__title">Things to check</div>
      <ul className="ttc__list">
        {city.notes.map((n) => (
          <li key={n}>{n}</li>
        ))}
      </ul>
    </div>
  )
}

/** Caveats shared by every non-US destination (shown once). */
export function ExpatCaveats({ cities }: { cities: City[] }) {
  const abroad = cities.filter((c) => c.countryCode !== 'US')
  if (!abroad.length) return null
  return (
    <div className="ttc ttc--caveats">
      <div className="t-eyebrow ttc__title">
        Things to check abroad <span className="ttc__for">· {abroad.map((c) => c.name).join(', ')}</span>
      </div>
      <ul className="ttc__list">
        {EXPAT_CAVEATS.map((n) => (
          <li key={n}>{n}</li>
        ))}
      </ul>
    </div>
  )
}

/** Sources + as-of line and the disclaimer. Expandable source list. */
export function SourcesLine() {
  const [open, setOpen] = useState(false)
  const fxAsOf = useFx((s) => s.asOf)
  const fxSource = useFx((s) => s.source)
  return (
    <div className="sources">
      <p className="sources__line">
        <b>Estimates, not tax or legal advice.</b> Cost indices for verified cities checked {longDate(COL_AS_OF)}, others rough estimates; exchange rates{' '}
        {fxSource === 'live' ? 'live' : 'bundled'}, as of {fxAsOf}; expat picks ranked from {EXPAT_RANKING_SOURCES.length} published indexes and surveys (
        {monthYear(EXPAT_AS_OF)}).{' '}
        <button type="button" className="link-btn" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
          {open ? 'Hide sources' : 'Sources'}
        </button>
      </p>
      {open && (
        <ul className="sources__list">
          {COL_SOURCES.map((s) => (
            <li key={s}>{s}</li>
          ))}
          <li>
            Expat picks: rank blended from{' '}
            {EXPAT_RANKING_SOURCES.map((s, i) => (
              <span key={s.name}>
                {i > 0 && (i === EXPAT_RANKING_SOURCES.length - 1 ? ' and ' : ', ')}
                <a href={s.url} target="_blank" rel="noopener noreferrer">
                  {s.name}
                </a>{' '}
                ({s.edition})
              </span>
            ))}
            ; factor scores are eVelo’s own. Researched {longDate(EXPAT_AS_OF)}.
          </li>
        </ul>
      )}
    </div>
  )
}
