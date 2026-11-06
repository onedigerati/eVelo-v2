// FX rates (units of currency per 1 USD). Bundled src/data/fx.json is the baseline (refreshed by
// `npm run data:fx`), FX_FALLBACK fills any gap, and a best-effort live fetch on app load can
// replace both. Hosts that block external requests simply keep the bundled rates.

import { create } from 'zustand'
import { FX_FALLBACK } from '../data/cities'
import fxJson from '../data/fx.json'

export const FX_URL = 'https://open.er-api.com/v6/latest/USD'
const TIMEOUT_MS = 4000

export interface FxState {
  rates: Record<string, number>
  /** ISO date of the rates in use. */
  asOf: string
  source: 'bundled' | 'live'
}

const bundled = fxJson as { asOf: string; rates: Record<string, number> }

export const useFx = create<FxState>()(() => ({
  rates: { ...FX_FALLBACK, ...bundled.rates },
  asOf: bundled.asOf,
  source: 'bundled',
}))

/** Units of `currency` per 1 USD (1 for USD; undefined if unknown). */
export function rate(currency: string): number | undefined {
  if (currency === 'USD') return 1
  return useFx.getState().rates[currency]
}
/** As-of date of the rates in use. */
export const fxAsOf = () => useFx.getState().asOf

/** Hook: re-renders when live rates land. */
export function useRate(currency: string | null | undefined): number | undefined {
  return useFx((s) => (!currency ? undefined : currency === 'USD' ? 1 : s.rates[currency]))
}

let started = false
/** Try once per session to fetch live rates; failures are silent. */
export async function loadLiveFx(): Promise<void> {
  if (started || typeof fetch !== 'function') return
  started = true
  const ctl = typeof AbortController === 'function' ? new AbortController() : null
  const timer = setTimeout(() => ctl?.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(FX_URL, { signal: ctl?.signal })
    if (!res.ok) return
    const json = (await res.json()) as { result?: string; rates?: Record<string, number>; time_last_update_unix?: number }
    if (json.result !== 'success' || !json.rates) return
    const next: Record<string, number> = { ...useFx.getState().rates }
    let n = 0
    for (const k of Object.keys(next)) {
      const v = json.rates[k]
      if (typeof v === 'number' && Number.isFinite(v) && v > 0) ((next[k] = v), n++)
    }
    if (!n) return
    const asOf = json.time_last_update_unix
      ? new Date(json.time_last_update_unix * 1000).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10)
    useFx.setState({ rates: next, asOf, source: 'live' })
  } catch {
    /* offline, blocked, or timed out: keep bundled rates */
  } finally {
    clearTimeout(timer)
  }
}
