import { describe, expect, it } from 'vitest'
import { EXPAT_PROFILES } from '../expatPicks'

// "Getting there" on a profile is a computed route line from the user's home (src/data/airports)
// followed by the hand-written `facts.access` note. The note must read the same whatever the home
// city is, so it covers the local side only: which airport, how far, the last hop, regional trains
// and ferries. Two kinds of text break that:
//
// 1. US-as-origin framing ("no US nonstops", "for Americans", "from the States"). Any "US",
//    "U.S.", "American(s)" or "stateside" fails. Allowed: "American Airlines" (a US city's note
//    may name its hub carrier, though airline names are discouraged), and region names that merely
//    contain "American": Pan-American, Latin/North/South/Central American.
// 2. Route lists, which now come from the data: any "nonstop(s)", "direct flight(s) to", or an
//    airline route pair such as "flies Newark–Faro" ("flies"/"flown" followed by an A–B pair).
//    A local hop ("the airstrip flies only to San Pedro") still passes.
//
// The note must also be non-empty and short (at most 260 characters).
const US_ORIGIN =
  /\bUS\b|\bU\.S\.|stateside|from the States|(?<!Pan-|Latin |North |South |Central )\bAmericans?\b(?! Airlines)/i
const ROUTE_LIST = /nonstops?\b|direct flights? to|\b(?:flies|flown)\s+[\w .]+–/i
const MAX_LEN = 260

describe('access notes (Getting there) are home-independent', () => {
  it.each(Object.keys(EXPAT_PROFILES).sort())('%s', (cityId) => {
    const note = EXPAT_PROFILES[cityId].facts.access
    expect(note.trim(), 'empty').not.toBe('')
    expect(note.length, `too long: ${note}`).toBeLessThanOrEqual(MAX_LEN)
    expect(note, 'US-as-origin framing').not.toMatch(US_ORIGIN)
    expect(note, 'route list (comes from the route data now)').not.toMatch(ROUTE_LIST)
  })
})
