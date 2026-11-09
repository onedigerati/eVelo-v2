import { memo, useId } from 'react'
import { BEATS, type BeatId } from './story'

/**
 * The four steps (Buy / Borrow / Live anywhere / Die) as buttons that pick the story card's beat.
 * Each button is named by its number and title ("01 Buy") with the body as its description; the
 * beat on show is marked `aria-current="step"`: it is the current step of a sequence the timeline
 * can also advance, not an on/off toggle, so `aria-pressed` would misdescribe it.
 */
export const StepButtons = memo(function StepButtons({ active, onSelect }: { active: BeatId; onSelect: (id: BeatId, button: HTMLElement) => void }) {
  const uid = useId()
  return (
    <ol className="landing__steps-list">
      {BEATS.map((b) => {
        const id = `${uid}-${b.id}`
        return (
          <li key={b.id} className="landing__step-item">
            <button
              type="button"
              className="landing__step"
              aria-current={b.id === active ? 'step' : undefined}
              aria-labelledby={`${id}-n ${id}-t`}
              aria-describedby={`${id}-b`}
              onClick={(e) => onSelect(b.id, e.currentTarget)}
            >
              <span id={`${id}-n`} className="landing__step-n">
                {b.n}
              </span>
              <span id={`${id}-t`} className="landing__step-title">
                {b.title}
              </span>
              <span id={`${id}-b`} className="landing__step-body">
                {b.body}
              </span>
            </button>
          </li>
        )
      })}
    </ol>
  )
})
