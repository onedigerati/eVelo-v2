// The "Sync with my eVelo plan" sheet: every shared value with eVelo's beside the mode's (matching
// ones grey, differing ones brass), a tick each, and one "Copy N values" that copies the ticked ones
// once. Cancel, Escape and the backdrop leave everything as it was. The shared Sheet traps focus and
// hands it back to the opener on close. The eVelo plan is only read.
import './sync.css'

import type { IncomeInputs } from '../../engine/incomeTypes'
import { fieldMatches, SYNC_FIELDS, type SyncField, type SyncSnapshot } from '../../state/incomeSync'
import { Sheet } from '../primitives'
import { copyLabel, FIELD_TEXT, NEVER_SHARED, valueText } from './syncText'

export interface SyncSheetProps {
  open: boolean
  onClose: () => void
  /** The fields ticked (the opener starts them as all, or as the ones eVelo changed on a re-sync). */
  ticked: readonly SyncField[]
  onTickedChange: (fields: SyncField[]) => void
  inputs: IncomeInputs
  /** The eVelo plan's values now, in the mode's terms. */
  evelo: SyncSnapshot
  /** Copy these fields once; the sheet closes after. */
  onCopy: (fields: SyncField[]) => void
}

export function SyncSheet({ open, onClose, ticked, onTickedChange, inputs, evelo, onCopy }: SyncSheetProps) {
  const on = new Set(ticked)
  const toggle = (f: SyncField) => onTickedChange(SYNC_FIELDS.filter((g) => (g === f ? !on.has(g) : on.has(g))))
  const chosen = SYNC_FIELDS.filter((f) => on.has(f))

  return (
    <Sheet open={open} onClose={onClose} title="Bring values from your eVelo plan" className="sync-sheet">
      <div className="isync" data-testid="sync-sheet">
        <p className="isync__lead">
          Tick what both plans should share. It’s a one-time copy: after this the two plans are separate, until you sync again.
        </p>
        <div className="isync__head" aria-hidden="true">
          <span />
          <span>Value</span>
          <span className="isync__h-evelo">eVelo</span>
          <span />
          <span className="isync__h-mode">This mode</span>
        </div>
        <ul className="isync__rows">
          {SYNC_FIELDS.map((f, i) => {
            const same = fieldMatches(f, inputs, evelo)
            const t = FIELD_TEXT[f]
            const ev = valueText(f, evelo)
            const cv = valueText(f, inputs)
            const id = `isync-${f}`
            return (
              <li
                key={f}
                className={`isync__row ${same ? 'isync__row--same' : 'isync__row--diff'}${ev.length > 1 ? ' isync__row--multi' : ''}`}
                data-field={f}
                data-same={same}
              >
                <input
                  id={id}
                  type="checkbox"
                  className="isync__tick"
                  checked={on.has(f)}
                  onChange={() => toggle(f)}
                  aria-describedby={`${id}-v`}
                  {...(i === 0 ? { 'data-autofocus': true } : {})}
                />
                <label htmlFor={id} className="isync__label">
                  <span className="isync__name">{t.label}</span>
                  {t.note && <span className="isync__note">{t.note}</span>}
                </label>
                <span className="isync__vals" id={`${id}-v`}>
                  <span className="sr-only">eVelo: </span>
                  <span className="isync__ev" data-testid={`sync-ev-${f}`}>
                    {ev.map((s) => (
                      <span key={s}>{s}</span>
                    ))}
                  </span>
                  <span className="isync__arrow" aria-hidden="true">
                    →
                  </span>
                  <span className="sr-only">, this mode: </span>
                  <span className="isync__cv" data-testid={`sync-cv-${f}`}>
                    {cv.map((s) => (
                      <span key={s}>{s}</span>
                    ))}
                  </span>
                  <span className="sr-only">{same ? ' (the same)' : ' (differs)'}</span>
                </span>
              </li>
            )
          })}
        </ul>
        <div className="isync__never">
          <span className="isync__never-lead">Never shared, because each side has its own:</span>
          <span>{NEVER_SHARED}</span>
        </div>
        <div className="isync__actions">
          <button type="button" className="isync__cancel" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="isync__copy" disabled={chosen.length === 0} onClick={() => onCopy(chosen)}>
            {copyLabel(chosen.length)}
          </button>
        </div>
      </div>
    </Sheet>
  )
}
