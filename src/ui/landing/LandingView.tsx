import { useState, type MouseEvent } from 'react'
import { hrefFor } from '../../state/router'
import type { Breakpoint } from '../hooks'
import { ThemeCycleButton, ThemeToggle } from '../shell/ThemeToggle'
import { Wordmark } from '../shell/TopBar'
import { StepButtons } from './StepButtons'
import { COPY, type BeatId } from './story'
import './landing.css'
import { StoryCard } from './StoryCard'

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
 * then the four steps. Colours are theme tokens
 * (landing.css), so the site theme and the landing's toggle restyle it live.
 */
export function LandingView({ bp }: { bp: Breakpoint }) {
  // The beat the story card shows; rests on 'die' (the finished frame). Stage 2 drives it from the timeline.
  const [beat, setBeat] = useState<BeatId>('die')
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
          <section className="landing__hero" aria-labelledby="landing-title">
            <div className="landing__copy">
              <p className="landing__eyebrow">Buy · Borrow · Die — anywhere in the world</p>
              <h1 id="landing-title" className="landing__headline">
                Live off your portfolio <em>without ever selling it.</em>
              </h1>
              <p className="landing__body">
                Borrow against your shares for living money, let them keep compounding, and pass them on with the
                gains never taxed. eVelo replays your plan through thousands of real market histories, then
                re-prices it city by city to show where in the world it holds best.
              </p>
              <div className="landing__ctas">
                <a href={hrefFor('plan')} className="landing__cta landing__cta--primary">
                  Stress-test my plan
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M3 8h10M9 4l4 4-4 4" />
                  </svg>
                </a>
                <a href={hrefFor('atlas')} className="landing__cta landing__cta--ghost">
                  Explore the Atlas
                </a>
              </div>
              <p className="landing__fine">Free · No sign-up · Runs in your browser, nothing leaves your device</p>
            </div>
            <StoryCard />
          </section>

          <section id={STEPS_ID} tabIndex={-1} className="landing__steps" aria-label={COPY.stepsLabel}>
            <StepButtons active={beat} onSelect={setBeat} />
          </section>
        </main>
      </div>
    </div>
  )
}
