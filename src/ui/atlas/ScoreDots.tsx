import type { ExpatScoreKey } from '../../data/expatPicks'
import { EXPAT_SCORE_LABELS } from '../../data/expatPicks'
import { cx } from '../primitives'
import { SCORE_KEYS, scoreLabel } from './picks'

/** Six 1–5 factor scores as rows of dots. One accessible label for the whole glyph. */
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
          <span className="scores__k">{EXPAT_SCORE_LABELS[k]}</span>
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
