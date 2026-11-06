import { useStore } from '../../state/store'
import { percent } from '../format'
import { InfoTip, Section, Slider } from '../primitives'

export function BorrowingSection() {
  const rate = useStore((s) => s.inputs.loanRate)
  const maxLtv = useStore((s) => s.inputs.maxLtv)
  const setInput = useStore((s) => s.setInput)
  return (
    <Section index="04" title="Borrowing" summary={`${percent(rate, { digits: 1 })} loan · call at ${percent(maxLtv)} LTV`}>
      <Slider
        label="Loan interest rate"
        value={rate}
        min={0.02}
        max={0.12}
        step={0.0025}
        format="percent1"
        ticks={[0.02, 0.05, 0.08, 0.12]}
        onChange={(v) => setInput('loanRate', v)}
        hint="Securities-backed line of credit. Interest is added to the loan, never paid in cash."
      />
      <Slider
        label="Margin-call threshold"
        tone="bruised"
        aside={
          <InfoTip label="What is a margin call?">
            If the loan grows past this share of your portfolio, the lender forces a sale — usually at the worst moment. Avoiding
            that is what “holds” means.
          </InfoTip>
        }
        value={maxLtv}
        min={0.3}
        max={0.8}
        step={0.01}
        format="percent"
        ticks={[0.3, 0.5, 0.7, 0.8]}
        onChange={(v) => setInput('maxLtv', v)}
      />
    </Section>
  )
}
