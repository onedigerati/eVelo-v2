// The "See year by year" button and the shared bottom Sheet that holds the ledger. Apart from
// IncomeLedger so the table renders (and is tested) without the Sheet's store and portal.
import './incomeResults.css'

import { useState } from 'react'
import type { IncomeResult } from '../../engine/incomeTypes'
import { Sheet } from '../primitives'
import { IncomeLedger } from './IncomeLedger'

export function YearByYear({ result }: { result: Pick<IncomeResult, 'median'> }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button type="button" className="iyears__open" onClick={() => setOpen(true)}>
        See year by year
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} title="Year by year" className="income-sheet">
        <IncomeLedger rows={result.median} />
      </Sheet>
    </>
  )
}
