// The comparison's Holdings switch (docs/PLAN.md, Swap the mixes, stage 2), pure: the three
// choices, the line that says what's compared, the approximate note, the two mix bars (the borrower
// shows the mix it borrows) and which result each column reads under a choice.

import type { IncomeInputs } from '../../engine/incomeTypes'
import type { PlanInputs } from '../../engine/types'
import { percent } from '../format'
import { incomeHoldings, mixParts, type MixPart } from './compare'
import type { IncomeComputed } from './incomeClient'
import { borrowerOf, mixShares, type HoldingsMode, type ModeShares } from './swap'
import type { EveloComputed, OwnEvelo, SwapPair } from './swapRuns'

export const HOLDINGS_CHOICES: readonly { value: HoldingsMode; label: string }[] = [
  { value: 'own', label: 'Each its own' },
  { value: 'evelo', label: 'Both on eVelo’s mix' },
  { value: 'income', label: 'Both on this mode’s mix' },
]

/** Two shares in plain words: "60% stocks, 20% munis, 20% taxable bonds" (zero parts left out). */
export function sharesText({ stockShare, muniShare }: ModeShares): string {
  const bonds = 1 - stockShare
  const parts: [number, string][] = [
    [stockShare, 'stocks'],
    [bonds * muniShare, 'munis'],
    [bonds * (1 - muniShare), muniShare > 0 ? 'taxable bonds' : 'bonds'],
  ]
  return parts
    .filter(([w]) => w >= 0.005)
    .map(([w, what]) => `${percent(w)} ${what}`)
    .join(', ')
}

/** The one line saying what's compared under a shared mix; null under "Each its own" (unchanged). */
export function comparedLine(mode: HoldingsMode, plan: Pick<PlanInputs, 'holdings'>, income: Pick<IncomeInputs, 'stockShare' | 'muniShare'>): string | null {
  if (mode === 'own') return null
  if (mode === 'income') return `Both plans on this mode’s mix: ${sharesText(income)}.`
  const shares = mixShares(plan.holdings)
  return shares ? `Both plans on eVelo’s mix: ${sharesText(shares)}.` : 'Both plans on eVelo’s mix.'
}

/** The switch's info tip; the full account is in "How this is worked out" (HowWorkedOut.tsx). */
export const HOLDINGS_TIP =
  'Picking a shared mix re-runs the plan that borrows it, through the same market months, so you see both strategies on one portfolio. eVelo on this mode’s mix is exact; this mode on eVelo’s mix is approximate, since it can only hold SPY and three Vanguard bond funds.'

export const APPROX_NOTE =
  'Living on income’s run here is approximate: it can only hold SPY and three Vanguard bond funds, so eVelo’s mix is mapped onto its stock and muni shares.'

/** The approximate note: only when the mode borrows eVelo's mix. */
export const approxNote = (mode: HoldingsMode): string | null => (mode === 'evelo' ? APPROX_NOTE : null)

export interface MixView {
  parts: MixPart[]
  /** The plan shows the other's mix for this comparison. */
  borrowed: boolean
}

/** Each column's mix bar under a choice: its own mix, or (for the borrower) the mix it borrows. */
export function compareMixes(mode: HoldingsMode, plan: Pick<PlanInputs, 'holdings'>, income: Pick<IncomeInputs, 'stockShare' | 'muniShare'>): { income: MixView; evelo: MixView } {
  const own = { income: mixParts(incomeHoldings(income)), evelo: mixParts(plan.holdings) }
  const b = borrowerOf(mode)
  return {
    income: b === 'income' ? { parts: own.evelo, borrowed: true } : { parts: own.income, borrowed: false },
    evelo: b === 'evelo' ? { parts: own.income, borrowed: true } : { parts: own.evelo, borrowed: false },
  }
}

export type Side<T> = { status: 'done'; value: T } | { status: 'loading' | 'error' | 'empty' }

/** Which result each column reads: the pair's when it's in; otherwise the borrower waits on its
 *  swapped run and the other column reads its own result as before. */
export function compareSides(mode: HoldingsMode, pair: SwapPair, plan: PlanInputs, ownIncome: IncomeComputed, ownEvelo: OwnEvelo): { income: Side<IncomeComputed>; evelo: Side<EveloComputed> } {
  if (pair.status === 'done') return { income: { status: 'done', value: pair.income }, evelo: { status: 'done', value: pair.evelo } }
  const b = borrowerOf(mode)
  return {
    income: b === 'income' ? { status: pair.status } : { status: 'done', value: ownIncome },
    evelo:
      b === 'evelo' ? { status: pair.status } : ownEvelo.status === 'done' ? { status: 'done', value: { inputs: plan, result: ownEvelo.result } } : { status: ownEvelo.status },
  }
}

/** A waiting column's line. Under "Each its own" eVelo's are as before the switch. */
export function waitText(side: 'income' | 'evelo', status: 'loading' | 'error' | 'empty', borrowed: boolean): string {
  if (side === 'evelo' && !borrowed)
    return status === 'empty'
      ? 'Your eVelo plan has no holdings yet, so there is nothing to compare.'
      : status === 'error'
        ? 'eVelo’s figures couldn’t be worked out. Reload to try again.'
        : 'Working out eVelo’s futures…'
  const who = side === 'evelo' ? 'eVelo on this mode’s mix' : 'Living on income on eVelo’s mix'
  if (status === 'empty') return 'Your eVelo plan has no holdings yet, so there is no mix to borrow.'
  if (status === 'error') return `${who} couldn’t be worked out. Pick another mix, or reload to try again.`
  return side === 'evelo' ? 'Re-running eVelo on this mode’s mix…' : 'Re-running living on income on eVelo’s mix…'
}

/** The mix line the walkthrough and Same storm show under a shared mix: the card's "what's
 *  compared" line, plus a short approximate note when the mode borrows eVelo's mix. Null under
 *  "Each its own" (unchanged). */
export function belowMixLine(mode: HoldingsMode, plan: Pick<PlanInputs, 'holdings'>, income: Pick<IncomeInputs, 'stockShare' | 'muniShare'>): string | null {
  const line = comparedLine(mode, plan, income)
  if (!line) return null
  return mode === 'evelo' ? `${line} Living on income’s side is approximate.` : line
}

/** What the walkthrough and Same storm (below the card) read under a choice. "Each its own": each
 *  plan's own result exactly as before the switch (nothing below until eVelo's is in). A shared mix:
 *  the swapped pair, with a waiting state while the borrower's run is worked out. */
export type BelowCard =
  | { status: 'done'; evelo: EveloComputed; income: IncomeComputed; mixLine: string | null }
  | { status: 'loading' | 'error' | 'empty'; mixLine: string | null }

export function belowCard(mode: HoldingsMode, pair: SwapPair, plan: PlanInputs, ownIncome: IncomeComputed, ownEvelo: OwnEvelo): BelowCard {
  if (mode === 'own') {
    if (ownEvelo.status !== 'done') return { status: ownEvelo.status, mixLine: null }
    return { status: 'done', evelo: { inputs: plan, result: ownEvelo.result }, income: ownIncome, mixLine: null }
  }
  const mixLine = belowMixLine(mode, plan, ownIncome.inputs)
  if (pair.status !== 'done' || pair.mode !== mode) return { status: pair.status === 'done' ? 'loading' : pair.status, mixLine }
  return { status: 'done', evelo: pair.evelo, income: pair.income, mixLine }
}

/** The calm line below the card while a shared mix's run is worked out (or can't be). */
export function belowWaitText(mode: Exclude<HoldingsMode, 'own'>, status: 'loading' | 'error' | 'empty'): string {
  if (status === 'empty') return 'The walkthrough and Same storm need an eVelo plan with holdings to share a mix.'
  if (status === 'error') return 'The walkthrough and Same storm can’t follow this mix right now. Pick another mix, or reload to try again.'
  return mode === 'evelo' ? 'The walkthrough and Same storm will follow once living on income is re-run on eVelo’s mix…' : 'The walkthrough and Same storm will follow once eVelo is re-run on this mode’s mix…'
}
