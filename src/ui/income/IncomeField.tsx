// An inline field inside a question's sentence: a real <input> with a visually hidden <label>, set in
// the sentence's serif. What's typed is read loosely (incomeFlow.ts) and, when it reads, merged into
// the mode's state, whose sanitizer clamps it; leaving the field shows the stored value again.

import { useState, type Ref } from 'react'
import { useIncomeStore } from '../../state/incomeState'
import { FIELD_KIND, fieldText, parseField, type NumberKey } from './incomeFlow'

export interface IncomeFieldProps {
  k: NumberKey
  label: string
  inputRef?: Ref<HTMLInputElement>
}

export function IncomeField({ k, label, inputRef }: IncomeFieldProps) {
  const kind = FIELD_KIND[k]
  const value = useIncomeStore((s) => s.inputs[k])
  const setInputs = useIncomeStore((s) => s.setInputs)
  // The draft while typing; null at rest, when the field shows the stored value.
  const [draft, setDraft] = useState<string | null>(null)
  const text = draft ?? fieldText(kind, value)
  const invalid = draft !== null && parseField(kind, draft) === null
  const id = `if-${k}`

  return (
    <span className="ifield">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <input
        id={id}
        ref={inputRef}
        className="ifield__input"
        data-field={k}
        type="text"
        inputMode={kind === 'whole' ? 'numeric' : 'decimal'}
        autoComplete="off"
        spellCheck={false}
        value={text}
        aria-invalid={invalid || undefined}
        style={{ width: `${Math.max(kind === 'whole' ? 2 : 3, text.length) + 0.6}ch` }}
        onFocus={(e) => e.currentTarget.select()}
        onChange={(e) => {
          const raw = e.currentTarget.value
          setDraft(raw)
          const v = parseField(kind, raw)
          if (v !== null) setInputs({ [k]: v })
        }}
        onBlur={() => setDraft(null)}
      />
    </span>
  )
}
