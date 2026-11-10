// The last Atlas ranking, saved in the browser so a reload with the same plan shows the odds
// without running. Pure encode/decode (tested); sim.ts does the storage I/O.
//
// Only a hash of the ranking key (atlasKey + data version) is stored, never the plan's inputs.
// Decoding is strict: a hash mismatch, an unknown city or any malformed field drops the value.

import type { AtlasEntry } from '../engine/types'

export const ATLAS_SAVED_KEY = 'evelo:atlas'
const FORMAT = 1

export interface SavedRanking {
  entries: AtlasEntry[]
  at: number
}

/** 53-bit string hash (cyrb53) with a given seed. */
function cyrb53(str: string, seed: number): string {
  let h1 = 0xdeadbeef ^ seed
  let h2 = 0x41c6ce57 ^ seed
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i)
    h1 = Math.imul(h1 ^ ch, 2654435761)
    h2 = Math.imul(h2 ^ ch, 1597334677)
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909)
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36)
}

/** Hash of a ranking key and the data version (two seeds, ~106 bits). */
export function savedHash(rankingKey: string, dataVersion: string): string {
  const s = `${dataVersion}\n${rankingKey}`
  return `${cyrb53(s, 1)}.${cyrb53(s, 2)}`
}

export function encodeSaved(rankingKey: string, dataVersion: string, v: SavedRanking): string {
  return JSON.stringify({ f: FORMAT, h: savedHash(rankingKey, dataVersion), at: v.at, entries: v.entries })
}

const isObj = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null && !Array.isArray(x)
const finite = (x: unknown): x is number => typeof x === 'number' && Number.isFinite(x)

function entry(x: unknown, known: (id: string) => boolean): AtlasEntry | null {
  if (!isObj(x)) return null
  const { cityId, successRate, spendUsd, costRatio } = x
  if (typeof cityId !== 'string' || !known(cityId)) return null
  if (!finite(successRate) || successRate < 0 || successRate > 1) return null
  if (!finite(spendUsd) || spendUsd < 0) return null
  if (!finite(costRatio)) return null
  return { cityId, successRate, spendUsd, costRatio }
}

/**
 * The saved ranking for this key and data version, or null when the stored value is missing,
 * corrupt, malformed or belongs to another plan / data version. `known` must accept only cities
 * that are part of this ranking.
 */
export function decodeSaved(raw: string | null | undefined, rankingKey: string, dataVersion: string, known: (id: string) => boolean): SavedRanking | null {
  if (typeof raw !== 'string' || !raw) return null
  let v: unknown
  try {
    v = JSON.parse(raw)
  } catch {
    return null
  }
  if (!isObj(v) || v.f !== FORMAT || v.h !== savedHash(rankingKey, dataVersion)) return null
  if (!finite(v.at) || v.at <= 0 || !Array.isArray(v.entries) || v.entries.length === 0) return null
  const entries: AtlasEntry[] = []
  const seen = new Set<string>()
  for (const x of v.entries) {
    const e = entry(x, known)
    if (!e || seen.has(e.cityId)) return null
    seen.add(e.cityId)
    entries.push(e)
  }
  return { entries, at: v.at }
}
