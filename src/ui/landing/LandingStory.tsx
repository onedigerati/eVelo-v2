import { useCallback, type ReactNode } from 'react'
import { StepButtons } from './StepButtons'
import { stepScrollTarget } from './stepScroll'
import { COPY, type BeatId } from './story'
import { StoryCard } from './StoryCard'
import { useStoryPlayback } from './useStoryPlayback'

/** Document-coordinate span of an element (rect + scroll), so a scroll in flight doesn't matter. */
function span(el: Element) {
  const r = el.getBoundingClientRect()
  return { top: r.top + window.scrollY, bottom: r.bottom + window.scrollY }
}

/**
 * A step pressed: scroll the least that shows the card's chart and the pressed step together (the
 * step stays on screen); on a phone, where they can't both fit, bring the chart in. Focus stays on
 * the step button.
 */
function revealBeat(card: HTMLElement | null, step: HTMLElement) {
  const plot = card?.querySelector('.story__plot')
  if (!plot) return
  const viewport = window.innerHeight
  const { top } = stepScrollTarget({
    scrollY: window.scrollY,
    viewport,
    maxScroll: document.documentElement.scrollHeight - viewport,
    chart: span(plot),
    step: span(step),
  })
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  // Always issued, even to stay put: it replaces any scroll in flight (a Tab's focus scroll).
  window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' })
}

/**
 * The hero (its copy beside the story card) and the four steps under it, sharing one playback so
 * the beat on show, the caption and the step marked `aria-current` always agree. Playback lives
 * here, not in LandingView, so only the card and the steps re-render as the story plays; `copy` is
 * an element made once by LandingView, so React skips it.
 */
export function LandingStory({ copy, stepsId }: { copy: ReactNode; stepsId: string }) {
  const story = useStoryPlayback()
  const { jump, el: cardEl } = story
  const selectStep = useCallback(
    (id: BeatId, button: HTMLElement) => {
      jump(id)
      revealBeat(cardEl, button)
    },
    [jump, cardEl],
  )
  return (
    <>
      <section className="landing__hero" aria-labelledby="landing-title">
        {copy}
        <StoryCard
          cardRef={story.ref}
          frame={story.frame}
          playing={story.playing}
          live={story.live}
          onTogglePlay={story.togglePlay}
          onReplay={story.replay}
        />
      </section>

      <section id={stepsId} tabIndex={-1} className="landing__steps" aria-label={COPY.stepsLabel}>
        <StepButtons active={story.beat} onSelect={selectStep} />
      </section>
    </>
  )
}
