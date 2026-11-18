import { type MouseEvent } from 'react'
import { hrefFor } from '../../state/router'
import type { Breakpoint } from '../hooks'
import { ThemeCycleButton, ThemeToggle } from '../shell/ThemeToggle'
import { Wordmark } from '../shell/TopBar'
import './landing.css'
import { LandingStory } from './LandingStory'

const STEPS_ID = 'how'

/**
 * Scroll to the steps without touching the hash: `#how` would be read by the router as an unknown
 * route. Jumps (no smooth scroll) when the visitor prefers reduced motion; focus follows.
 */
function scrollToSteps(e: MouseEvent<HTMLAnchorElement>) {
  const target = document.getElementById(STEPS_ID)
  if (!target) return
  e.preventDefault()
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
  target.focus({ preventScroll: true })
}

/**
 * The landing page (`#home`). Full-bleed, with its own header in place of the app's top bar: the
 * hero copy beside the story card (one illustrative plan, St. Louis to Bangkok, in four beats),
 * then the four steps; LandingStory owns their shared playback, so this view doesn't re-render as
 * the story plays. Colours are theme tokens
 * (landing.css), so the site theme and the landing's toggle restyle it live.
 */
export function LandingView({ bp }: { bp: Breakpoint }) {
  return (
    <div className={`landing landing--${bp}`}>
      <div className="landing__frame">
        <header className="landing__header">
          <Wordmark />
          <nav className="landing__nav" aria-label="Primary">
            <a href={`#${STEPS_ID}`} onClick={scrollToSteps}>
              How it works
            </a>
            <a href={hrefFor('atlas')}>Atlas</a>
            <a href={hrefFor('method')}>Method</a>
          </nav>
          <div className="landing__actions">
            {bp === 'desktop' ? <ThemeToggle /> : <ThemeCycleButton />}
            <a href={hrefFor('plan')} className="landing__open">
              Open the planner
            </a>
          </div>
        </header>

        <main id="main" tabIndex={-1} className="landing__main">
          <LandingStory
            stepsId={STEPS_ID}
            copy={
              <div className="landing__copy">
                <p className="landing__eyebrow">
                  eVelo · <span className="landing__eyebrow-accent">escape velocity</span>
                </p>
                <h1 id="landing-title" className="landing__headline">
                  Live off your portfolio <em>without ever selling it.</em>
                </h1>
                <p className="landing__kicker">Find your escape velocity with eVelo.</p>
                <div className="landing__body">
                  <p>
                    <strong>Escape velocity is the point where your portfolio grows faster than you borrow from it.</strong>{' '}
                    Reach it before you retire, and the loan never catches up.
                  </p>
                  <p>
                    eVelo shows how far you are from that line, and which move gets you over it: a different city, a
                    smaller draw, a bigger portfolio, a later start or a different mix of assets. What you hold sets the
                    returns that have to outrun the loan.
                  </p>
                </div>
                <div className="landing__ctas">
                  <a href={hrefFor('plan')} className="landing__cta landing__cta--primary">
                    Find your eVelo
                    {/* On hover the flat arrow becomes an escape path climbing up and away. */}
                    <svg className="landing__cta-traj" width="18" height="16" viewBox="0 0 18 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path className="landing__cta-flat" d="M3 8h10M9 4l4 4-4 4" />
                      <path className="landing__cta-path" d="M2 13C7 13 11 10 15 3" />
                      <path className="landing__cta-head" d="M10.5 3.2 15 3l.6 4.4" />
                    </svg>
                  </a>
                  <a href={hrefFor('atlas')} className="landing__cta landing__cta--ghost">
                    {/* A small globe whose meridians turn on hover. */}
                    <svg className="landing__cta-globe" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
                      <circle cx="8" cy="8" r="6.2" />
                      <path d="M1.8 8h12.4" opacity="0.6" />
                      <ellipse className="landing__cta-mer" cx="8" cy="8" rx="3" ry="6.2" />
                      <ellipse className="landing__cta-mer landing__cta-mer--b" cx="8" cy="8" rx="3" ry="6.2" opacity="0.5" />
                    </svg>
                    Explore the Atlas
                  </a>
                </div>
                <p className="landing__fine">Free · No sign-up · Runs in your browser, nothing leaves your device</p>
              </div>
            }
          />
        </main>
      </div>
    </div>
  )
}
