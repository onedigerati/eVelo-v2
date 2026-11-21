// The walkthrough's twin ledgers for one year: living on income and eVelo side by side (docs/PLAN.md
// stage 2 and its decision on the eVelo ledger).
// STUB: the foundation's placeholder; the ledger builder replaces it, keeping TwinLedgersProps.

import type { TwinLedgersProps } from './walkthrough'

export function TwinLedgers({ row }: TwinLedgersProps) {
  return (
    <div className="wt__placeholder" data-testid="wt-ledgers">
      Ledgers for age {row.age}.
    </div>
  )
}
