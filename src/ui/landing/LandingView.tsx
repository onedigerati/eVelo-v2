import { memo } from 'react'
import { hrefFor } from '../../state/router'
import type { Breakpoint } from '../hooks'
import { Mark } from '../icons'
import { ThemeCycleButton, ThemeToggle } from '../shell/ThemeToggle'
import { Wordmark } from '../shell/TopBar'
import { FIELD } from './paths'
import './landing.css'

/**
 * The landing page (`#home`), study C "Escape velocity". Full-bleed, with its own slim header in
 * place of the app's top bar. Behind the copy, a seeded field of decorative paths draws itself in
 * (holds in green, bruised in brass, broken in coral through the margin-call line). Colours come
 * from theme tokens in landing.css, so the site theme (and the landing's toggle) restyles it live.
 */
export function LandingView({ bp }: { bp: Breakpoint }) {
  const phone = bp === 'phone'
  return (
    <div className={`landing landing--${bp}`}>
      <PathField />
      <div className="landing__scrim" aria-hidden="true" />
      <div className="landing__frame">
        <header className="landing__header">
          <Wordmark />
          <div className="landing__actions">
            {phone ? <ThemeCycleButton /> : <ThemeToggle />}
            <a href={hrefFor('plan')} className="landing__open">
              Open the planner
            </a>
          </div>
        </header>
        <main id="main" tabIndex={-1} className="landing__stage">
          <Mark size={96} className="landing__mark" />
          <h1 className="landing__headline">
            Reach <em>escape velocity.</em>
          </h1>
          <p className="landing__body">
            A portfolio that grows faster than the loan against it never has to be sold. Spend the loan, keep the
            shares, leave them to your heirs. eVelo runs your plan through thousands of real market histories and
            counts how many actually reach escape velocity.
          </p>
          <div className="landing__ctas">
            <a href={hrefFor('plan')} className="landing__cta landing__cta--primary">
              Launch my plan
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </a>
            <a href={hrefFor('method')} className="landing__cta landing__cta--link">
              What is Buy-Borrow-Die?
            </a>
          </div>
        </main>
        <footer className="landing__legend">
          <span className="landing__key">
            <span className="landing__swatch landing__swatch--holds" aria-hidden="true" />
            Holds: the loan never forces a sale
          </span>
          <span className="landing__key">
            <span className="landing__swatch landing__swatch--bruised" aria-hidden="true" />
            Bruised: a crash forced a sale, then recovered
          </span>
          <span className="landing__key">
            <span className="landing__swatch landing__swatch--broken" aria-hidden="true" />
            Broken: the debt caught up
          </span>
        </footer>
      </div>
    </div>
  )
}

/** The decorative field. Static (paths computed once at module load), so it never re-renders. */
const PathField = memo(function PathField() {
  const { width, height, paths, startY, thresholdY } = FIELD
  return (
    <svg className="landing__field" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <line className="landing__threshold" x1="0" y1={thresholdY} x2={width} y2={thresholdY} />
      {paths.map((p, i) => (
        <path key={i} className={`landing__path landing__path--${p.kind}`} d={p.d} pathLength={1} style={{ animationDelay: `${p.delay}s` }} />
      ))}
      {paths
        .filter((p) => p.kind === 'broken')
        .map((p, i) => (
          <circle key={i} className="landing__end" cx={p.end.x} cy={p.end.y} r="3.5" />
        ))}
      <circle className="landing__start" cx="0" cy={startY} r="5" />
      {/* Drawn last, with a halo, so a path crossing it never hides the words. */}
      <text className="landing__threshold-label" x={width - 32} y={thresholdY - 8} textAnchor="end">
        margin-call line
      </text>
    </svg>
  )
})
