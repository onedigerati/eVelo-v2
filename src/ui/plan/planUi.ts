// UI-only plan state (not part of PlanInputs): weight locks, stable holding colours, and the
// ticker palette's open flag. Locks persist per device; colours are assigned per session.

import { useEffect } from 'react'
import { create } from 'zustand'
import { useStore } from '../../state/store'

const LS_LOCKS = 'evelo:v2:locks'
export const PALETTE_SLOTS = 10

function readLocks(): string[] {
  try {
    const v = JSON.parse(window.localStorage.getItem(LS_LOCKS) ?? '[]')
    return Array.isArray(v) ? v.filter((s): s is string => typeof s === 'string').slice(0, 20) : []
  } catch {
    return []
  }
}

interface PlanUi {
  locked: string[]
  /** symbol -> categorical slot (0..9). A holding keeps its colour while it stays in the list. */
  slots: Record<string, number>
  paletteOpen: boolean
  toggleLock: (symbol: string) => void
  setPaletteOpen: (open: boolean) => void
}

export const usePlanUi = create<PlanUi>()((set) => ({
  locked: readLocks(),
  slots: {},
  paletteOpen: false,
  toggleLock: (symbol) =>
    set((s) => {
      const locked = s.locked.includes(symbol) ? s.locked.filter((x) => x !== symbol) : [...s.locked, symbol]
      try {
        window.localStorage.setItem(LS_LOCKS, JSON.stringify(locked))
      } catch {
        /* fine without */
      }
      return { locked }
    }),
  setPaletteOpen: (paletteOpen) => set({ paletteOpen }),
}))

/** Keep colour slots and locks in step with the current holdings (call once, high in the tree). */
export function useSyncPlanUi() {
  const holdings = useStore((s) => s.inputs.holdings)
  useEffect(() => {
    const syms = holdings.map((h) => h.symbol)
    usePlanUi.setState((s) => {
      const slots: Record<string, number> = {}
      for (const sym of syms) if (s.slots[sym] !== undefined) slots[sym] = s.slots[sym]
      const used = new Set(Object.values(slots))
      for (const sym of syms) {
        if (slots[sym] !== undefined) continue
        let k = 0
        while (used.has(k) && k < PALETTE_SLOTS - 1) k++
        slots[sym] = k
        used.add(k)
      }
      const locked = s.locked.filter((x) => syms.includes(x))
      return { slots, locked: locked.length === s.locked.length ? s.locked : locked }
    })
  }, [holdings])
}

export const lockedSet = (locked: string[]) => new Set(locked)
export const slotColor = (slot: number | undefined) => `var(--cat-${((slot ?? 0) % PALETTE_SLOTS) + 1})`
