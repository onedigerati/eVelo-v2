import { isFixedAmount } from '../../engine/cost'
import type { BudgetCategory, PlanInputs } from '../../engine/types'
import { parseLoose } from '../format'

/** The override maps a "Spending in <city>" row can write: the typed values and the premiums they were typed at. */
export type SpendOverrides = Pick<PlanInputs, 'ratioOverrides' | 'amountOverrides' | 'ratioOverrideAt' | 'amountOverrideAt'>

export const RATIO_MIN = 0.05
export const RATIO_MAX = 5
export const AMOUNT_MAX = 1e9

/** Which field of a row the user set: a typed $ (`amount`), a typed % (`ratio`), or neither. */
export function rowOverride(o: SpendOverrides, destId: string, c: BudgetCategory): 'amount' | 'ratio' | null {
  if (isFixedAmount(o.amountOverrides?.[destId]?.[c])) return 'amount'
  if (o.ratioOverrides?.[c] !== undefined) return 'ratio'
  return null
}

/** The most a typed yearly amount can be for one category. (Share links clamp at AMOUNT_MAX.) */
export const TYPED_AMOUNT_MAX = 10_000_000

/** Annual dollars from "18000", "18,000", "$18k", "18.5k", "$1.2m". Null when not a number in 0..$10M. */
export function parseAmount(raw: string): number | null {
  if (/%/.test(raw)) return null
  const v = parseLoose(raw, 'currency')
  if (v === null || v < 0 || v > TYPED_AMOUNT_MAX) return null
  return Math.round(v)
}

/** A % change versus home ("-33", "−33%", "+20") as a ratio (0.67, 1.2), clamped; null when not a number. */
export function parseChange(raw: string): number | null {
  const s = raw.replace(/[−–]/g, '-').replace(/[%+\s]/g, '')
  if (!/^-?(\d+\.?\d*|\.\d+)$/.test(s)) return null
  const v = parseFloat(s)
  return Math.max(RATIO_MIN, Math.min(RATIO_MAX, 1 + v / 100))
}

/** Inline hints for an entry that didn't parse. */
export const AMOUNT_HINT = 'Enter a yearly amount up to $10M, like 18k'
export const CHANGE_HINT = 'Enter a change versus home, like -20'

/** The % pill text for a change (0.2 -> "+20%"); beyond ±999% it reads ">+999%" so it fits its column. */
export function changeLabel(change: number, pct: (v: number) => string): string {
  if (Math.abs(change) < 0.005) return '±0%'
  if (change > 9.99) return '>+999%'
  return pct(change)
}

type CatMap = Partial<Record<BudgetCategory, number>>
type CityMap = Partial<Record<string, CatMap>>

function withoutRatio<T extends CatMap | undefined>(r: T, c: BudgetCategory): T | undefined {
  if (!r || r[c] === undefined) return r
  const next = { ...r }
  delete next[c]
  return Object.keys(next).length ? next : undefined
}

function withoutAmount<T extends CityMap | undefined>(a: T, destId: string, c: BudgetCategory): T | undefined {
  const row = a?.[destId]
  if (!a || !row || row[c] === undefined) return a
  const nextRow = { ...row }
  delete nextRow[c]
  const next = { ...a }
  if (Object.keys(nextRow).length) next[destId] = nextRow
  else delete next[destId]
  return Object.keys(next).length ? next : undefined
}

function withoutCity<T extends CityMap | undefined>(a: T, destId: string): T | undefined {
  if (!a || a[destId] === undefined) return a
  const next = { ...a }
  delete next[destId]
  return Object.keys(next).length ? next : undefined
}

/** The premium a typed value is anchored at: a finite number clamped to 0..1, or null (no anchor). */
const anchorOf = (premium: number | undefined) =>
  typeof premium === 'number' && Number.isFinite(premium) ? Math.max(0, Math.min(1, premium)) : null

/**
 * A typed $ for this city: sets `amountOverrides[destId][c]`, anchors it at `premium` (the current
 * `expatFactor`) in `amountOverrideAt[destId][c]`, and drops the global % for `c` with its anchor.
 * Without a premium the row is left unanchored (the engine then doesn't scale it).
 */
export function setAmount(o: SpendOverrides, destId: string, c: BudgetCategory, amount: number, premium?: number): SpendOverrides {
  const v = Math.max(0, Math.min(AMOUNT_MAX, amount))
  const at = anchorOf(premium)
  return {
    ratioOverrides: withoutRatio(o.ratioOverrides, c),
    ratioOverrideAt: withoutRatio(o.ratioOverrideAt, c),
    amountOverrides: {
      ...(o.amountOverrides ?? {}),
      [destId]: { ...(o.amountOverrides?.[destId] ?? {}), [c]: v },
    },
    amountOverrideAt:
      at === null
        ? withoutAmount(o.amountOverrideAt, destId, c)
        : { ...(o.amountOverrideAt ?? {}), [destId]: { ...(o.amountOverrideAt?.[destId] ?? {}), [c]: at } },
  }
}

/**
 * A typed %: sets `ratioOverrides[c]`, anchors it at `premium` (the current `expatFactor`) in
 * `ratioOverrideAt[c]`, and drops this city's fixed $ for `c` with its anchor.
 * Without a premium the row is left unanchored (the engine then doesn't scale it).
 */
export function setRatio(o: SpendOverrides, destId: string, c: BudgetCategory, ratio: number, premium?: number): SpendOverrides {
  const at = anchorOf(premium)
  return {
    ratioOverrides: {
      ...(o.ratioOverrides ?? {}),
      [c]: Math.max(RATIO_MIN, Math.min(RATIO_MAX, ratio)),
    },
    ratioOverrideAt: at === null ? withoutRatio(o.ratioOverrideAt, c) : { ...(o.ratioOverrideAt ?? {}), [c]: at },
    amountOverrides: withoutAmount(o.amountOverrides, destId, c),
    amountOverrideAt: withoutAmount(o.amountOverrideAt, destId, c),
  }
}

/** The row's ×: clears whichever override the row has, with its anchor. */
export function clearRow(o: SpendOverrides, destId: string, c: BudgetCategory): SpendOverrides {
  return {
    ratioOverrides: withoutRatio(o.ratioOverrides, c),
    ratioOverrideAt: withoutRatio(o.ratioOverrideAt, c),
    amountOverrides: withoutAmount(o.amountOverrides, destId, c),
    amountOverrideAt: withoutAmount(o.amountOverrideAt, destId, c),
  }
}

/** "Reset all": every % override, and this city's fixed amounts (other cities' research stays), with their anchors. */
export function resetAll(o: SpendOverrides, destId: string): SpendOverrides {
  return {
    ratioOverrides: undefined,
    ratioOverrideAt: undefined,
    amountOverrides: withoutCity(o.amountOverrides, destId),
    amountOverrideAt: withoutCity(o.amountOverrideAt, destId),
  }
}

/** True when the card has anything for "Reset all" to clear. */
export function hasAnyOverride(o: SpendOverrides, destId: string): boolean {
  return (
    (!!o.ratioOverrides && Object.keys(o.ratioOverrides).length > 0) ||
    (!!o.amountOverrides?.[destId] && Object.keys(o.amountOverrides[destId]!).length > 0)
  )
}
