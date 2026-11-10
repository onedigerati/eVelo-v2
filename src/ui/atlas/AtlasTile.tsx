// The three tiles at the top of the Atlas: Best odds, Your home, Your destination.
//
// A tile whose city has a profile works like a top-pick card: the city name is the one button
// (a stretched link, its ::after covers the tile), so a click anywhere on the tile opens the
// profile and the tile is a single keyboard stop. "Profile →" is decoration. A tile's own action
// ("Make destination") sits above the overlay and stays its own button.
import { AnimatedNumber, Skeleton, cx } from '../primitives'
import { successColor, successTextColor, type Ranked } from './atlasData'
import { CodeChip } from './CodeChip'
import { preloadOnIntent } from './photoLoad'

export interface TileProps {
  eyebrow: string
  row?: Ranked
  note?: string
  empty?: string
  action?: { label: string; onClick: () => void }
  /** Set only for a profiled city: the whole tile then opens the profile. */
  onProfile?: () => void
}

/** Accessible name of a clickable tile's open button. */
export function tileOpenLabel(eyebrow: string, row: Ranked, note?: string): string {
  return `${eyebrow}: ${row.city.name}, ${row.city.country}. Plan holds in ${Math.round(row.successRate * 100)}% of futures${note ? `, ${note}` : ''}. Open profile.`
}

export function Tile({ eyebrow, row, note, empty, action, onProfile }: TileProps) {
  const open = row && onProfile ? onProfile : undefined
  return (
    <div className={cx('atile', open && 'atile--link')} style={row ? { ['--tone' as string]: successColor(row.successRate) } : undefined}>
      <div className="t-eyebrow">{eyebrow}</div>
      {row ? (
        <>
          <div className="atile__city">
            <CodeChip code={row.city.countryCode} />
            {open ? (
              <button
                type="button"
                className="atile__name atile__open"
                onClick={open}
                {...preloadOnIntent(row.cityId)}
                aria-label={tileOpenLabel(eyebrow, row, note)}
              >
                {row.city.name}
              </button>
            ) : (
              <span className="atile__name">{row.city.name}</span>
            )}
            {open && <ProfileGo where="head" />}
          </div>
          <div className="atile__fig" style={{ color: successTextColor(row.successRate) }}>
            <AnimatedNumber value={Math.round(row.successRate * 100)} className="atile__num" />
            <i>%</i>
          </div>
          <div className="atile__foot">
            {note && <span className="t-small ink-3">{note}</span>}
            {open && <ProfileGo where="foot" />}
            {action && (
              <button type="button" className="link-btn atile__action" onClick={action.onClick}>
                {action.label} →
              </button>
            )}
          </div>
        </>
      ) : empty ? (
        <p className="atile__empty">{empty}</p>
      ) : (
        <div className="atile__skel">
          <Skeleton width="60%" height={14} />
          <Skeleton width={80} height={40} radius={10} />
        </div>
      )}
    </div>
  )
}

/** Decoration, rendered twice; CSS shows the name-line copy, or the foot copy in the half-width phone tiles. */
function ProfileGo({ where }: { where: 'head' | 'foot' }) {
  return (
    <span className={cx('atile__go', `atile__go--${where}`)} aria-hidden="true">
      Profile →
    </span>
  )
}
