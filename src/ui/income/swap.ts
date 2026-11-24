// Swap the mixes (docs/PLAN.md, stage 1): the comparison's "Holdings" switch puts both plans on one
// portfolio. Pure, no React, no DOM.
//
//   'own'    each plan on its own mix (the default view, unchanged)
//   'evelo'  both on eVelo's mix: the mode runs on an approximation of eVelo's holdings, mapped onto
//            its stock share and its muni share within the bonds (2026-11-24 decisions)
//   'income' both on the mode's mix: eVelo runs on exactly the mode's four funds at its weights
//
// Neither swapped plan is ever saved or put in a share link. The swapped eVelo plan is built here,
// in memory, and never goes through `sanitizeHoldings`: that keeps only symbols in the ticker index,
// which leaves out the mode's three bond funds on purpose.
//
// Same months: the engine's calendar is the whole bundled market (prepare backfills every held
// asset to month 0, so `Prepared.months` is `market.months` whatever the holdings), and the
// bootstrap draws its months from that calendar with the plan's own seed, block length, paths and
// horizon. The swap changes only the holdings, so the swapped plan replays exactly the same drawn
// months as the plan it came from (tests: swap.test.ts).

import type { IncomeInputs } from '../../engine/incomeTypes'
import type { AssetClass, Holding, PlanInputs } from '../../engine/types'
import { marketIndex } from '../plan/marketIndex'
import { incomeHoldings } from './compare'

export type HoldingsMode = 'own' | 'evelo' | 'income'
export const HOLDINGS_MODES: readonly HoldingsMode[] = ['own', 'evelo', 'income']

/** Which plan runs on the other's mix under a mode, or null for 'own'. */
export function borrowerOf(mode: HoldingsMode): 'income' | 'evelo' | null {
  return mode === 'evelo' ? 'income' : mode === 'income' ? 'evelo' : null
}

/** Bond funds that count as munis within the bonds. */
export const MUNI_SYMBOLS: ReadonlySet<string> = new Set(['MUB', 'VWITX'])

/** The mode's own funds aren't all in the ticker index (its bond funds are left out on purpose). */
const MODE_FUND_CLASS: Record<string, AssetClass> = { SPY: 'etf-equity', VWITX: 'etf-bond', VFITX: 'etf-bond', VBMFX: 'etf-bond' }

let classes: Map<string, AssetClass> | null = null
/** A symbol's asset class from the ticker index (or the mode's own funds), undefined if unknown. */
export function assetClassOf(symbol: string): AssetClass | undefined {
  classes ??= new Map(marketIndex.assets.map((a) => [a.symbol, a.cls]))
  return classes.get(symbol) ?? (Object.hasOwn(MODE_FUND_CLASS, symbol) ? MODE_FUND_CLASS[symbol] : undefined)
}

/** Stocks or bonds, by asset class: only `etf-bond` is bonds; equity (stocks and equity ETFs), real
 *  estate, commodities and crypto all count as stocks. */
export const isBondClass = (cls: AssetClass) => cls === 'etf-bond'

export interface ModeShares {
  /** 0..1 of the portfolio in stocks. */
  stockShare: number
  /** 0..1 of the bonds in munis; 0 when there are no bonds. */
  muniShare: number
}

/** eVelo's holdings mapped onto the mode's two shares. Holdings with no positive finite weight or an
 *  unknown symbol are left out and the rest renormalised; null when nothing is left. */
export function mixShares(holdings: readonly Holding[], classOf: (symbol: string) => AssetClass | undefined = assetClassOf): ModeShares | null {
  let total = 0
  let bonds = 0
  let munis = 0
  for (const h of holdings) {
    if (!(Number.isFinite(h.weight) && h.weight > 0)) continue
    const cls = classOf(h.symbol)
    if (!cls) continue
    total += h.weight
    if (!isBondClass(cls)) continue
    bonds += h.weight
    if (MUNI_SYMBOLS.has(h.symbol)) munis += h.weight
  }
  if (!(total > 0)) return null
  return { stockShare: (total - bonds) / total, muniShare: bonds > 0 ? munis / bonds : 0 }
}

/** The eVelo plan on the mode's mix: the saved plan with holdings = SPY, VWITX, VFITX and VBMFX at
 *  the mode's weights (compare.ts's incomeHoldings). Not sanitized; never saved or shared. */
export function swappedEveloPlan(plan: PlanInputs, income: Pick<IncomeInputs, 'stockShare' | 'muniShare'>): PlanInputs {
  return { ...plan, holdings: incomeHoldings(income) }
}

/** The mode on eVelo's mix (an approximation): its inputs with the two shares from mixShares, or
 *  null when eVelo has no holdings to borrow. */
export function swappedIncomeInputs(income: IncomeInputs, plan: Pick<PlanInputs, 'holdings'>): IncomeInputs | null {
  const s = mixShares(plan.holdings)
  return s ? { ...income, stockShare: s.stockShare, muniShare: s.muniShare } : null
}

/** The inputs each plan runs on under a mode. `swapped` names the one that needs a re-run (the
 *  borrower), null under 'own'; `evelo`/`income` are null only when the borrowed mix is empty. */
export interface SwapInputs {
  mode: HoldingsMode
  evelo: PlanInputs | null
  income: IncomeInputs | null
  swapped: 'evelo' | 'income' | null
}

export function swapInputs(mode: HoldingsMode, plan: PlanInputs, income: IncomeInputs): SwapInputs {
  if (mode === 'income') return { mode, evelo: swappedEveloPlan(plan, income), income, swapped: 'evelo' }
  if (mode === 'evelo') return { mode, evelo: plan, income: swappedIncomeInputs(income, plan), swapped: 'income' }
  return { mode, evelo: plan, income, swapped: null }
}
