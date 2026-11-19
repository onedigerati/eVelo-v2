// "See year by year": the median year rows (result.median) as a table, in today's dollars. Each
// column is that year's median across futures, so a row doesn't add up to one future; the note says
// so. On a phone the table scrolls sideways inside its own box, never the page. YearByYear.tsx opens
// it in the shared bottom Sheet.
import './incomeResults.css'

import { useId } from 'react'
import type { IncomeYearRow } from '../../engine/incomeTypes'
import { currency, currencyCompact } from '../format'

/** An amount to the nearest $100, as eVelo writes money: "$22,400". */
export function ledgerMoney(v: number): string {
  if (!Number.isFinite(v)) return '—'
  const r = Math.round(v / 100) * 100
  return currency(r === 0 ? 0 : r) // no "−$0"
}

type MoneyKey = Exclude<keyof IncomeYearRow, 'year' | 'age' | 'spending' | 'reinvested'>

export const LEDGER_COLUMNS: readonly { key: MoneyKey; label: string; format: (v: number) => string }[] = [
  { key: 'dividends', label: 'Dividends', format: ledgerMoney },
  { key: 'muniInterest', label: 'Muni coupons', format: ledgerMoney },
  { key: 'taxableInterest', label: 'Taxable interest', format: ledgerMoney },
  { key: 'treasuryInterest', label: 'Treasury interest', format: ledgerMoney },
  { key: 'otherIncome', label: 'Social Security', format: ledgerMoney },
  { key: 'tax', label: 'Tax', format: ledgerMoney },
  { key: 'gapSold', label: 'Sold to cover', format: ledgerMoney },
  { key: 'value', label: 'Value', format: (v) => currencyCompact(v) },
]

export const LEDGER_NOTE = "Each column is that year's median across futures, so the columns don't add up to one future."

export interface IncomeLedgerProps {
  rows: IncomeYearRow[]
}

export function IncomeLedger({ rows }: IncomeLedgerProps) {
  const uid = useId()
  return (
    <div className="iledger">
      <div className="iledger__scroll" role="region" aria-labelledby={`${uid}-cap`} tabIndex={0}>
        <table className="iledger__table">
          <caption id={`${uid}-cap`} className="iledger__caption">
            Year by year in the typical future, today's dollars
          </caption>
          <thead>
            <tr>
              <th scope="col" className="iledger__year">
                Year
              </th>
              {LEDGER_COLUMNS.map((c) => (
                <th key={c.key} scope="col" className={`iledger__num iledger__col--${c.key}`}>
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.year}>
                <th scope="row" className="iledger__year">
                  {r.year} <span className="iledger__age">age {r.age}</span>
                </th>
                {LEDGER_COLUMNS.map((c) => (
                  <td key={c.key} className={`iledger__num iledger__col--${c.key}${Math.round(r[c.key] / 100) === 0 ? ' is-zero' : ''}`}>
                    {c.format(r[c.key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="iledger__note">{LEDGER_NOTE}</p>
    </div>
  )
}
