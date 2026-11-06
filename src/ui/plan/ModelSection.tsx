import { useId } from 'react'
import type { ModelMethod, Outlook } from '../../engine/types'
import { useStore } from '../../state/store'
import { Section, SegmentedControl } from '../primitives'

const METHOD: Record<ModelMethod, string> = { bootstrap: 'History replay', 'fat-tail': 'Fat tails' }
const OUTLOOK: Record<Outlook, string> = { historical: 'Historical', balanced: 'Balanced', conservative: 'Cautious' }

export function ModelSection() {
  const method = useStore((s) => s.inputs.method)
  const outlook = useStore((s) => s.inputs.outlook)
  const setInput = useStore((s) => s.setInput)
  const uid = useId()
  return (
    <Section index="05" title="Model" summary={`${METHOD[method]} · ${OUTLOOK[outlook]} outlook`} defaultOpen={false}>
      <div>
        <div className="field__row">
          <span className="field__label" id={`${uid}-method-label`}>
            How futures are drawn
          </span>
        </div>
        <SegmentedControl<ModelMethod>
          block
          aria-labelledby={`${uid}-method-label`}
          value={method}
          onChange={(v) => setInput('method', v)}
          options={(Object.keys(METHOD) as ModelMethod[]).map((m) => ({ value: m, label: METHOD[m] }))}
        />
      </div>
      <div>
        <div className="field__row">
          <span className="field__label" id={`${uid}-outlook-label`}>
            Return outlook
          </span>
        </div>
        <SegmentedControl<Outlook>
          block
          aria-labelledby={`${uid}-outlook-label`}
          value={outlook}
          onChange={(v) => setInput('outlook', v)}
          options={(Object.keys(OUTLOOK) as Outlook[]).map((o) => ({ value: o, label: OUTLOOK[o] }))}
        />
      </div>
    </Section>
  )
}
