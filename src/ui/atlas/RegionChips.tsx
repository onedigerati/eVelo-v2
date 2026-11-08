import { m as motion } from 'framer-motion'
import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { cx } from '../primitives'
import type { Ranked } from './atlasData'
import { REGION_CHIPS, regionCounts, type RegionChip } from './regionCounts'

/**
 * The Atlas's one region, shared by the map's chips and the city list's chips.
 * AtlasView owns the state and provides it here, so the list can set it without
 * threading a setter through CityList's props.
 */
interface SharedRegion {
  region: RegionChip
  setRegion: (r: RegionChip) => void
}
const RegionContext = createContext<SharedRegion | null>(null)

export function RegionProvider({ region, setRegion, children }: SharedRegion & { children: ReactNode }) {
  const value = useMemo(() => ({ region, setRegion }), [region, setRegion])
  return <RegionContext.Provider value={value}>{children}</RegionContext.Provider>
}

/**
 * Region chips for the city list's toolbar. Each shows how many cities in that
 * region match the current search; "All" is the total. Choosing one changes the
 * shared region, which also refits the map.
 */
export function ListRegionChips({ rows, query }: { rows: Ranked[]; query: string }) {
  const shared = useContext(RegionContext)
  const counts = useMemo(() => regionCounts(rows.map((r) => r.city), query), [rows, query])
  if (!shared) return null
  const { region, setRegion } = shared
  return (
    <div className="lchips" role="toolbar" aria-label={query ? 'Filter by region · counts match your search' : 'Filter by region'}>
      <div className="lchips__track">
        {REGION_CHIPS.map((r) => {
          const on = region === r
          const n = counts[r]
          return (
            <button
              key={r}
              type="button"
              className={cx('rchip lchip', on && 'is-on', n === 0 && !on && 'is-empty')}
              aria-pressed={on}
              aria-label={`${r}, ${n} ${n === 1 ? 'city' : 'cities'}`}
              onClick={() => setRegion(r)}
            >
              {on && (
                <motion.span layoutId="lchip-pill" className="rchip__pill" transition={{ type: 'spring', stiffness: 500, damping: 38 }} />
              )}
              <span className="rchip__label">{r}</span>
              <span className="rchip__n num">{n}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
