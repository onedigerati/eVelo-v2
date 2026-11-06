// Share links: inputs -> compact base64url string in `#/?p=...`.
//
// Encoding: JSON of only the fields that differ from DEFAULT_INPUTS (deep-compared), wrapped
// as { v: 1, d: diff }, UTF-8 encoded, base64url without padding. Decoding merges the diff
// back onto DEFAULT_INPUTS, ignoring unknown keys and values of the wrong type, so a
// malformed or hostile link can never put the store into an invalid shape.

import { DEFAULT_INPUTS } from '../engine/defaults'
import type { PlanInputs } from '../engine/types'

const VERSION = 1

function toBase64Url(bytes: Uint8Array): string {
  let bin = ''
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i])
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
function fromBase64Url(s: string): Uint8Array {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4)
  const bin = atob(b64)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)

export function encodeInputs(inputs: PlanInputs): string {
  const diff: Record<string, unknown> = {}
  for (const k of Object.keys(inputs) as (keyof PlanInputs)[]) {
    if (!same(inputs[k], DEFAULT_INPUTS[k])) diff[k] = inputs[k]
  }
  return toBase64Url(new TextEncoder().encode(JSON.stringify({ v: VERSION, d: diff })))
}

/** Shallow-typed merge: keeps a key only if its JSON type matches the default's. */
export function sanitizeInputs(raw: unknown): PlanInputs {
  const base: PlanInputs = structuredClone(DEFAULT_INPUTS)
  if (!raw || typeof raw !== 'object') return base
  const src = raw as Record<string, unknown>
  const out = base as unknown as Record<string, unknown>
  for (const k of Object.keys(base)) {
    if (!(k in src)) continue
    const dv = out[k]
    const v = src[k]
    if (typeof dv === 'number') {
      if (typeof v === 'number' && Number.isFinite(v)) out[k] = v
    } else if (typeof dv === 'string') {
      if (typeof v === 'string' && v.length < 200) out[k] = v
    } else if (dv === null || k === 'destCityId') {
      if (v === null || typeof v === 'string') out[k] = v
    } else if (Array.isArray(dv)) {
      if (k === 'holdings' && Array.isArray(v)) {
        const hs = v
          .filter(
            (h): h is { symbol: string; weight: number } =>
              !!h &&
              typeof h === 'object' &&
              typeof (h as { symbol?: unknown }).symbol === 'string' &&
              typeof (h as { weight?: unknown }).weight === 'number' &&
              Number.isFinite((h as { weight: number }).weight),
          )
          .slice(0, 50)
          .map((h) => ({ symbol: h.symbol.slice(0, 16), weight: h.weight }))
        if (hs.length) out[k] = hs
      }
    } else if (typeof dv === 'object') {
      if (v && typeof v === 'object' && !Array.isArray(v)) {
        const merged: Record<string, unknown> = { ...(dv as object) }
        for (const [ck, cv] of Object.entries(v)) {
          if (typeof cv === 'number' && Number.isFinite(cv) && (ck in merged || k === 'ratioOverrides')) merged[ck] = cv
        }
        out[k] = merged
      }
    }
  }
  // Enumerations must be known values.
  if (base.method !== 'bootstrap' && base.method !== 'fat-tail') base.method = DEFAULT_INPUTS.method
  if (!['historical', 'balanced', 'conservative'].includes(base.outlook)) base.outlook = DEFAULT_INPUTS.outlook
  // Optional keys not present in defaults.
  const ro = src.ratioOverrides
  if (ro && typeof ro === 'object' && !Array.isArray(ro)) {
    const clean: Record<string, number> = {}
    for (const [ck, cv] of Object.entries(ro)) if (ck in base.budget && typeof cv === 'number' && Number.isFinite(cv)) clean[ck] = cv
    if (Object.keys(clean).length) base.ratioOverrides = clean
  }
  return base
}

export function decodeInputs(s: string): PlanInputs | null {
  try {
    const json = JSON.parse(new TextDecoder().decode(fromBase64Url(s)))
    if (!json || json.v !== VERSION || typeof json.d !== 'object') return null
    return sanitizeInputs({ ...DEFAULT_INPUTS, ...json.d })
  } catch {
    return null
  }
}

export function shareUrl(inputs: PlanInputs): string {
  const { origin, pathname, search } = window.location
  return `${origin}${pathname}${search}#/?p=${encodeInputs(inputs)}`
}
