import { describe, expect, it } from 'vitest'
import { CITY_BY_ID } from '../../../data/cities'
import { DEFAULT_INPUTS } from '../../../engine/defaults'
import type { City } from '../../../engine/types'
import type { SpendInputs } from '../../../engine/cost'
import { premiumLabel, scaleNotes, SCALES_NOTE, spendTip } from '../scaleNote'

const HOME = CITY_BY_ID['st-louis']
const DEST = CITY_BY_ID['lisbon']
// Lisbon with rent priced above St. Louis, so the premium can't move housing.
const PRICEY: City = { ...DEST, idx: { ...DEST.idx, rent: HOME.idx.rent * 1.5 } }

const base = (patch: Partial<SpendInputs> = {}): SpendInputs => ({ budget: DEFAULT_INPUTS.budget, expatFactor: 0.35, ...patch })

describe('premiumLabel', () => {
  it('shows the slider value', () => {
    expect(premiumLabel(0.35)).toBe('35%')
    expect(premiumLabel(0)).toBe('0%')
    expect(premiumLabel(1)).toBe('100%')
  })
})

describe('scaleNotes', () => {
  it('no typed values: no notes', () => {
    const n = scaleNotes(base(), HOME, DEST)
    expect(Object.values(n).every((x) => x === null)).toBe(true)
  })

  it('a $ at its own premium scales but shows nothing typed', () => {
    const n = scaleNotes(base({ amountOverrides: { [DEST.id]: { groceries: 6000 } }, amountOverrideAt: { [DEST.id]: { groceries: 0.35 } } }), HOME, DEST)
    expect(n.groceries).toEqual({ note: SCALES_NOTE, typed: null })
    expect(n.housing).toBeNull()
  })

  it('a $ with no anchor takes the current premium: nothing typed to show', () => {
    const n = scaleNotes(base({ amountOverrides: { [DEST.id]: { groceries: 6000 } } }), HOME, DEST)
    expect(n.groceries).toEqual({ note: SCALES_NOTE, typed: null })
  })

  it('a $ after the slider moved shows what was typed, and where', () => {
    const n = scaleNotes(
      base({ expatFactor: 0.7, amountOverrides: { [DEST.id]: { groceries: 6000 } }, amountOverrideAt: { [DEST.id]: { groceries: 0.35 } } }),
      HOME,
      DEST,
    )
    expect(n.groceries).toEqual({ note: SCALES_NOTE, typed: 'you typed $6,000 at 35%' })
  })

  it('a $ for another city leaves this one alone', () => {
    const n = scaleNotes(base({ amountOverrides: { bangkok: { groceries: 6000 } }, amountOverrideAt: { bangkok: { groceries: 0.1 } } }), HOME, DEST)
    expect(n.groceries).toBeNull()
  })

  it('a % after the slider moved shows the typed change with a true minus', () => {
    const n = scaleNotes(base({ expatFactor: 0.6, ratioOverrides: { dining: 0.5 }, ratioOverrideAt: { dining: 0.35 } }), HOME, DEST)
    expect(n.dining).toEqual({ note: SCALES_NOTE, typed: 'you typed −50% at 35%' })
  })

  it('moved but held at the cap reads as typed: no "you typed"', () => {
    // A $ typed at the home amount, slid toward tourist: capped at max(home, typed) = typed.
    const home$ = DEFAULT_INPUTS.budget.groceries
    const n = scaleNotes(
      base({ expatFactor: 1, amountOverrides: { [DEST.id]: { groceries: home$ } }, amountOverrideAt: { [DEST.id]: { groceries: 0 } } }),
      HOME,
      DEST,
    )
    expect(n.groceries).toEqual({ note: SCALES_NOTE, typed: null })
  })

  it('rows the premium never moves (Travel, pricier than home) make no claim', () => {
    const n = scaleNotes(
      base({
        expatFactor: 0.9,
        ratioOverrides: { travel: 0.8 },
        ratioOverrideAt: { travel: 0.1 },
        amountOverrides: { [PRICEY.id]: { housing: 9000 } },
        amountOverrideAt: { [PRICEY.id]: { housing: 0.1 } },
      }),
      HOME,
      PRICEY,
    )
    expect(n.travel).toBeNull()
    expect(n.housing).toBeNull()
  })

  it('a % on a row with no home amount has nothing to scale', () => {
    const n = scaleNotes(base({ budget: { ...DEFAULT_INPUTS.budget, dining: 0 }, ratioOverrides: { dining: 0.5 } }), HOME, DEST)
    expect(n.dining).toBeNull()
  })

  it('a $ wins over a % on the same row', () => {
    const n = scaleNotes(
      base({
        expatFactor: 0.7,
        ratioOverrides: { groceries: 0.5 },
        ratioOverrideAt: { groceries: 0.1 },
        amountOverrides: { [DEST.id]: { groceries: 6000 } },
        amountOverrideAt: { [DEST.id]: { groceries: 0.2 } },
      }),
      HOME,
      DEST,
    )
    expect(n.groceries?.typed).toBe('you typed $6,000 at 20%')
  })
})

describe('spendTip', () => {
  const tip = spendTip('Lisbon', 'St. Louis')
  it('says typed values scale from where they were typed, return exactly, and are capped', () => {
    expect(tip).toContain('scales with the premium from where you typed it')
    expect(tip).toContain('returns exactly to what you typed when you slide back')
    expect(tip).toContain('the larger of your home amount and what you typed')
    expect(tip).toContain('Lisbon’s cost')
  })
  it('no longer says typed values stay put when the premium changes', () => {
    expect(tip).not.toMatch(/stays put/)
    expect(tip).not.toMatch(/premium changes/)
  })
})
