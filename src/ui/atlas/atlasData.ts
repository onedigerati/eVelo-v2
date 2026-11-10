// Atlas view model: region groups, the outcome color ramp, FX-risk buckets, per-city costs and
// the debounced ranking sync (only while the Atlas view is mounted).

import { useEffect } from 'react'
import { CITIES, CITY_BY_ID } from '../../data/cities'
import { BUDGET_CATEGORIES, budgetTotal, destinationSpend } from '../../engine/cost'
import type { AtlasEntry, BudgetCategory, City, PlanInputs } from '../../engine/types'
import { atlasClient, hasHoldings, isCancelled, runAtlas } from '../../state/sim'
import { useStore } from '../../state/store'
import { currencyCompact, number, percent } from '../format'

// Same ids, same order as ATLAS_CITY_IDS in state/sim (the idle prewarm ranks those).
export const CITY_IDS = CITIES.map((c) => c.id)
export const ATLAS_DEBOUNCE_MS = 380

/* ---------------------------------------------------------------- Regions */

// Pure definitions live in regionCounts.ts so tests can import them without the store.
export { REGION_CHIPS, inRegion, regionOf, type RegionChip } from './regionCounts'

/* ---------------------------------------------------------------- Outcome ramp */

// One scale for every outcome color in the app (src/ui/outcomeScale.ts).
export { outcomeColor as successColor, outcomeTextColor as successTextColor } from '../outcomeScale'

/* ---------------------------------------------------------------- FX risk */

export type FxRisk = 'none' | 'low' | 'medium' | 'high'
export function fxRisk(c: City): FxRisk {
  if (c.currency === 'USD' || c.fxVol <= 0.012) return 'none'
  if (c.fxVol <= 0.05) return 'low'
  if (c.fxVol <= 0.1) return 'medium'
  return 'high'
}
export const FX_RISK_LABEL: Record<FxRisk, string> = { none: 'No FX risk', low: 'Low', medium: 'Medium', high: 'High' }

/* ---------------------------------------------------------------- Costs */

export const CATEGORY_LABEL: Record<BudgetCategory, string> = {
  housing: 'Housing',
  groceries: 'Groceries',
  dining: 'Dining out',
  transport: 'Transport',
  utilities: 'Utilities',
  healthcare: 'Healthcare',
  travel: 'Travel',
  other: 'Other',
}

/** Per-category first-year spend (today's USD) if the user lived in `city`; only that city's own
 *  fixed amounts (`amountOverrides[city.id]`) apply. Priced by `destinationSpend`, as the engine does. */
export function cityCosts(inputs: PlanInputs, city: City): Record<BudgetCategory, number> {
  const home = CITY_BY_ID[inputs.homeCityId]
  const out = {} as Record<BudgetCategory, number>
  if (!home || home.id === city.id) {
    for (const c of BUDGET_CATEGORIES) out[c] = inputs.budget[c] || 0
    return out
  }
  return destinationSpend(inputs, home, city).amounts
}

/** "−38%", "+12%", "same". */
export function costDelta(ratio: number): string {
  const d = ratio - 1
  if (Math.abs(d) < 0.005) return 'same'
  return percent(d, { signed: true })
}

/* ---------------------------------------------------------------- Ranking model */

export interface Ranked extends AtlasEntry {
  city: City
  /** 1-based rank by success. */
  rank: number
}

export function ranked(entries: AtlasEntry[] | null): Ranked[] {
  if (!entries) return []
  return entries
    .map((e) => ({ e, city: CITY_BY_ID[e.cityId] }))
    .filter((x) => !!x.city)
    .map(({ e, city }, i) => ({ ...e, city, rank: i + 1 }))
}

export function lifestyleCaption(inputs: PlanInputs): string {
  const home = CITY_BY_ID[inputs.homeCityId]?.name ?? 'home'
  return `Your ${currencyCompact(budgetTotal(inputs.budget))} ${home} lifestyle, priced in ${CITIES.length} cities`
}

/** One data-driven sentence about the ranking. */
export function insight(rows: Ranked[], inputs: PlanInputs): string | null {
  if (!rows.length) return null
  const best = rows[0]
  const home = rows.find((r) => r.cityId === inputs.homeCityId)
  if (!home) return `${best.city.name} gives your plan its best odds: ${percent(best.successRate)}.`
  if (best.cityId === home.cityId) return `Nowhere beats staying in ${home.city.name}: it already gives your plan its best odds.`
  const better = rows.filter((r) => r.successRate > home.successRate + 0.005).length
  return `Moving from ${home.city.name} to ${best.city.name} lifts your odds from ${percent(home.successRate)} to ${percent(best.successRate)} and trims ${percent(1 - best.costRatio)} off your spend. ${better} ${better === 1 ? 'city beats' : 'cities beat'} staying home.`
}

/* ---------------------------------------------------------------- Sync */

/** Re-rank on mount and (debounced) whenever inputs change, while mounted. */
export function useAtlasSync() {
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined
    let alive = true
    const go = () => {
      if (!alive) return
      const st = useStore.getState()
      if (!hasHoldings(st.inputs)) {
        st.setAtlas(null)
        st.setAtlasRunning(false)
        return
      }
      const hit = atlasClient.peek(st.inputs, CITY_IDS)
      if (hit) {
        if (st.atlas !== hit.entries) st.setAtlas(hit.entries, hit.at)
        st.setAtlasRunning(false)
        return
      }
      runAtlas(CITY_IDS).catch((e) => {
        if (!isCancelled(e)) console.warn('Atlas ranking failed', e)
      })
    }
    go()
    const unsub = useStore.subscribe((s, prev) => {
      if (s.inputs === prev.inputs) return
      if (!hasHoldings(s.inputs)) return go()
      // A destination change alone never changes the ranking (cache hit), so no debounce needed.
      if (atlasClient.peek(s.inputs, CITY_IDS)) return go()
      clearTimeout(timer)
      useStore.getState().setAtlasRunning(true)
      timer = setTimeout(go, ATLAS_DEBOUNCE_MS)
    })
    return () => {
      alive = false
      clearTimeout(timer)
      unsub()
    }
  }, [])
}

/** Compact local amount with the ISO code ("≈ 3.9M TRY") — symbols like ₾ are missing from many fonts. */
export function localCompact(v: number, code: string): string {
  const a = Math.abs(v)
  const [d, suf] = a >= 1e9 ? [1e9, 'B'] : a >= 1e6 ? [1e6, 'M'] : a >= 1e3 ? [1e3, 'K'] : [1, '']
  const x = v / d
  return `${number(x, Math.abs(x) < 10 && d > 1 ? 1 : 0)}${suf} ${code}`
}
