import { useStore } from '../../state/store'
import { currencyCompact, percent } from '../format'
import { InfoTip, NumberField, Section, Slider } from '../primitives'

export function PortfolioSection() {
  const portfolio = useStore((s) => s.inputs.portfolio)
  const basis = useStore((s) => s.inputs.basisFraction)
  const holdings = useStore((s) => s.inputs.holdings)
  const setInput = useStore((s) => s.setInput)
  return (
    <Section index="01" title="Portfolio" summary={`${currencyCompact(portfolio)} · ${holdings.length} holdings`}>
      <NumberField
        label="Portfolio value"
        kind="currency"
        size="lg"
        value={portfolio}
        min={0}
        step={50_000}
        onChange={(v) => setInput('portfolio', v)}
        hint="Taxable brokerage assets you would borrow against."
      />
      <div>
        <div className="field__row">
          <span className="field__label">Holdings</span>
        </div>
        <ul className="holding-chips" role="list">
          {holdings.map((h) => (
            <li key={h.symbol} className="holding-chip">
              <span className="holding-chip__sym num">{h.symbol}</span>
              <span className="holding-chip__w num">{percent(h.weight)}</span>
            </li>
          ))}
        </ul>
      </div>
      <Slider
        label="Cost basis"
        aside={
          <InfoTip label="What is cost basis?">
            The share of today’s value you originally paid. A low basis means a big embedded gain — exactly what borrowing
            (instead of selling) avoids realizing.
          </InfoTip>
        }
        value={basis}
        min={0}
        max={1}
        step={0.01}
        format="percent"
        ticks={[0, 0.25, 0.5, 0.75, 1]}
        onChange={(v) => setInput('basisFraction', v)}
      />
    </Section>
  )
}
