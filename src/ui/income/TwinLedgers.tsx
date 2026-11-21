// The walkthrough's twin ledgers for one year: living on income and eVelo side by side (docs/PLAN.md
// stage 2 and its decision on the eVelo ledger). Plain content for screen readers: headings, a
// definition list per plan and the event line; the bar repeats the rows, so it is hidden from them.
// No aria-live: Play story steps the year and would chatter.

import { currencyCompact, percent } from '../format'
import { eveloBar, eveloEvent, eveloFunded, incomeBar, incomeEvent, LEDGER_NOTE, type BarPart } from './twinLedgers'
import type { EveloYear, IncomeYear, TwinLedgersProps } from './walkthrough'
import './twinLedgers.css'

const money = (v: number) => currencyCompact(v)

type Tone = 'income' | 'ss' | 'sold' | 'loan' | 'evelo' | 'tax'

interface Row {
  label: string
  value: number
  tone: Tone
}

const BAR_TONE: Record<BarPart['key'], Tone> = { income: 'income', ss: 'ss', sold: 'sold', borrowed: 'loan' }

function Bar({ total, parts }: { total: number; parts: BarPart[] }) {
  return (
    <div className="tl__from">
      <div className="tl__small">This year’s <span className="tl__num">{money(total)}</span> came from</div>
      <div className="tl__bar" aria-hidden="true">
        {parts.map((p) => (
          <span key={p.key} className={`tl__part tl--${BAR_TONE[p.key]}`} style={{ flexBasis: `${p.share * 100}%` }} title={`${p.label} ${money(p.value)}`} />
        ))}
      </div>
    </div>
  )
}

function Rows({ rows }: { rows: Row[] }) {
  return (
    <dl className="tl__rows">
      {rows.map((r) => (
        <div key={r.label} className="tl__row">
          <dt className="tl__key">
            <i className={`tl__sw tl--${r.tone}`} aria-hidden="true" />
            {r.label}
          </dt>
          <dd className="tl__num">{money(r.value)}</dd>
        </div>
      ))}
    </dl>
  )
}

function Missing({ name, plan }: { name: string; plan: 'inc' | 'ev' }) {
  return (
    <section className={`tl__ledger tl__ledger--${plan} tl__ledger--none`} aria-label={name}>
      <h4 className="tl__name">{name}</h4>
      <p className="tl__small">Not in this plan’s years.</p>
    </section>
  )
}

function IncomeLedger({ y }: { y: IncomeYear }) {
  const rows: Row[] = [
    { label: 'Dividends and interest', value: y.dividendsInterest, tone: 'income' },
    { label: 'Social Security', value: y.socialSecurity, tone: 'ss' },
    { label: 'Shares sold', value: y.sold, tone: 'sold' },
    { label: 'Tax', value: y.tax, tone: 'tax' },
    { label: 'Portfolio at year end', value: y.portfolio, tone: 'income' },
  ]
  return (
    <section className="tl__ledger tl__ledger--inc" aria-label="Living on income" data-testid="tl-income">
      <div className="tl__who">
        <h4 className="tl__name">Living on income</h4>
        <span className="tl__small">
          tax <span className="tl__num">{money(y.tax)}</span>
        </span>
      </div>
      <Bar total={y.spending} parts={incomeBar(y)} />
      <Rows rows={rows} />
      <p className="tl__event" data-testid="tl-income-event">{incomeEvent(y)}</p>
    </section>
  )
}

function EveloLedger({ y }: { y: EveloYear }) {
  const rows: Row[] = [
    { label: 'Social Security', value: y.socialSecurity, tone: 'ss' },
    { label: 'Borrowed', value: y.borrowed, tone: 'loan' },
    { label: 'Interest added', value: y.interest, tone: 'loan' },
    ...(y.repaid > 0 ? [{ label: 'Repaid', value: y.repaid, tone: 'evelo' as const }] : []),
    ...(y.forcedSaleSold > 0 ? [{ label: 'Sold in forced sales', value: y.forcedSaleSold, tone: 'sold' as const }] : []),
    { label: 'Loan at year end', value: y.loan, tone: 'loan' },
    { label: 'Portfolio at year end', value: y.portfolio, tone: 'evelo' },
  ]
  return (
    <section className="tl__ledger tl__ledger--ev" aria-label="eVelo" data-testid="tl-evelo">
      <div className="tl__who">
        <h4 className="tl__name">eVelo</h4>
        <span className="tl__small">
          loan-to-value <span className="tl__num">{percent(y.ltv)}</span>
        </span>
      </div>
      <Bar total={eveloFunded(y)} parts={eveloBar(y)} />
      <Rows rows={rows} />
      <p className="tl__event" data-testid="tl-evelo-event">{eveloEvent(y)}</p>
    </section>
  )
}

export function TwinLedgers({ row, phone }: TwinLedgersProps) {
  return (
    <div className={`tl${phone ? ' tl--phone' : ''}`} data-testid="wt-ledgers" data-age={row.age}>
      <div className="tl__twins">
        {row.income ? <IncomeLedger y={row.income} /> : <Missing name="Living on income" plan="inc" />}
        {row.evelo ? <EveloLedger y={row.evelo} /> : <Missing name="eVelo" plan="ev" />}
      </div>
      <p className="tl__note">{LEDGER_NOTE}</p>
    </div>
  )
}
