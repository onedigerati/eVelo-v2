import { hrefFor } from '../../state/router'
import type { Breakpoint } from '../hooks'
import { ThemeCycleButton, ThemeToggle } from '../shell/ThemeToggle'
import { Wordmark } from '../shell/TopBar'
import './landing.css'

/**
 * The landing page (`#home`). Full-bleed, with its own slim header in place of the app's top bar.
 * Stage 1 placeholder: Stage 2 fills the stage with the "Escape velocity" hero.
 */
export function LandingView({ bp }: { bp: Breakpoint }) {
  const phone = bp === 'phone'
  return (
    <div className={`landing landing--${bp}`}>
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
        <h1 className="landing__headline">Reach escape velocity.</h1>
        <div className="landing__ctas">
          <a href={hrefFor('plan')} className="btn btn--primary landing__cta">
            Launch my plan
          </a>
        </div>
      </main>
    </div>
  )
}
