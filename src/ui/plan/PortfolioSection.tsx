import { useStore } from '../../state/store'
import { currency, currencyCompact, percent } from '../format'
import { InfoTip, NumberField, Section, Slider } from '../primitives'
import { HoldingsEditor } from './HoldingsEditor'

/** The portfolio field's hint; with a loan balance it also says the portfolio must stay above it.
 *  The balance is compact unless that would round it to the portfolio's own compact figure
 *  ($1,999,999 under $2.0M reads "$2.0M"), when it is shown in full. */
export function portfolioHint(loan: number, portfolio = Infinity): string {
  const base = 'Taxable brokerage assets you would borrow against. Try “2.5m”.'
  if (!(loan > 0)) return base
  const compact = currencyCompact(loan)
  const amount = Number.isFinite(portfolio) && compact === currencyCompact(portfolio) ? currency(loan) : compact
  return `${base} Must stay above your ${amount} loan balance.`
}

export function PortfolioSection() {
  const portfolio = useStore((s) => s.inputs.portfolio)
  const basis = useStore((s) => s.inputs.basisFraction)
  const n = useStore((s) => s.inputs.holdings.length)
  const loan = useStore((s) => s.inputs.existingLoan ?? 0)
  const setInput = useStore((s) => s.setInput)
  return (
    <Section
      index="01"
      title="Portfolio"
      summary={`${currencyCompact(portfolio)} · ${n} ${n === 1 ? 'holding' : 'holdings'} · ${percent(basis)} basis`}
    >
      <NumberField
        label="Portfolio value"
        kind="currency"
        size="lg"
        value={portfolio}
        min={0}
        max={1e10}
        step={50_000}
        onChange={(v) => setInput('portfolio', v)}
        hint={portfolioHint(loan, portfolio)}
      />
      <HoldingsEditor />
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
        hint={`${currencyCompact(portfolio * (1 - basis))} of unrealized gains.`}
      />
    </Section>
  )
}
