import type { ExpatScoreKey } from '../../data/expatPicks'
import { cx } from '../primitives'
import { SCORE_KEYS, SCORE_SHORT, scoreLabel } from './picks'

/** Nine 1–5 factor scores as a 3×3 grid of dot rows. One accessible label for the whole glyph. */
export function ScoreDots({
  scores,
  size = 'sm',
  className,
}: {
  scores: Record<ExpatScoreKey, number>
  size?: 'sm' | 'lg'
  className?: string
}) {
  return (
    <div className={cx('scores', `scores--${size}`, className)} role="img" aria-label={scoreLabel(scores)}>
      {SCORE_KEYS.map((k) => (
        <div key={k} className="scores__item" aria-hidden="true">
          <span className="scores__k">{SCORE_SHORT[k]}</span>
          <span className="scores__dots">
            {[1, 2, 3, 4, 5].map((n) => (
              <i key={n} className={cx(n <= scores[k] && 'is-on')} />
            ))}
          </span>
          {size === 'lg' && <span className="scores__n num">{scores[k]}/5</span>}
        </div>
      ))}
    </div>
  )
}
