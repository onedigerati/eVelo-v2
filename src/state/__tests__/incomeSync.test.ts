import { describe, expect, it } from 'vitest'
import { budgetTotal } from '../../engine/cost'
import { DEFAULT_INPUTS } from '../../engine/defaults'
import { INCOME_DEFAULTS } from '../../engine/income'
import type { PlanInputs } from '../../engine/types'
import {
  applySync,
  changedSince,
  fieldMatches,
  makeSyncRecord,
  sanitizeSnapshot,
  sanitizeSyncRecord,
  snapshotFromEvelo,
  SYNC_FIELDS,
  type SyncRecord,
} from '../incomeSync'
import { sanitizeIncomeInputs } from '../incomeState'

const plan = (patch: Partial<PlanInputs> = {}): PlanInputs => ({
  ...structuredClone(DEFAULT_INPUTS),
  ...patch,
})
const EV = plan({
  portfolio: 2_400_000,
  basisFraction: 0.55,
  age: 52,
  horizonYears: 40,
  otherIncome: 38_000,
  incomeStartAge: 68,
  homeCityId: 'new-york',
  destCityId: 'lisbon',
  seed: 99,
  paths: 10000,
  blockMonths: 36,
  outlook: 'conservative',
  existingLoan: 100_000,
})

describe('snapshotFromEvelo', () => {
  it('maps every shared value, spending as the home budget total', () => {
    const s = snapshotFromEvelo(EV)
    expect(s).toEqual({
      portfolio: 2_400_000,
      basisFraction: 0.55,
      age: 52,
      horizonYears: 40,
      spending: budgetTotal(EV.budget),
      otherIncome: 38_000,
      incomeStartAge: 68,
      homeCityId: 'new-york',
      seed: 99,
      paths: 10000,
      blockMonths: 36,
      outlook: 'conservative',
    })
  })

  it('never copies what each side keeps (loan, destination, holdings, method)', () => {
    const keys = Object.keys(snapshotFromEvelo(EV))
    for (const k of ['existingLoan', 'destCityId', 'holdings', 'method', 'stockShare', 'muniShare', 'filingStatus'])
      expect(keys).not.toContain(k)
  })

  it('does not touch the plan', () => {
    const before = JSON.stringify(EV)
    snapshotFromEvelo(EV)
    expect(JSON.stringify(EV)).toBe(before)
  })
})

describe('applySync', () => {
  const base = {
    ...INCOME_DEFAULTS,
    stockShare: 0.7,
    muniShare: 0.3,
    filingStatus: 'mfj' as const,
  }
  const snap = snapshotFromEvelo(EV)

  it('copies the ticked fields only, and keeps the mode’s own', () => {
    const out = applySync(base, snap, ['portfolio', 'spending', 'otherIncome'])
    expect(out.portfolio).toBe(2_400_000)
    expect(out.spending).toBe(budgetTotal(EV.budget))
    expect([out.otherIncome, out.incomeStartAge]).toEqual([38_000, 68])
    expect(out.age).toBe(base.age)
    expect(out.homeCityId).toBe(base.homeCityId)
    expect(out.seed).toBe(base.seed)
    expect([out.stockShare, out.muniShare, out.filingStatus, out.method]).toEqual([0.7, 0.3, 'mfj', base.method])
  })

  it('copies the futures together', () => {
    const out = applySync(base, snap, ['futures'])
    expect([out.seed, out.paths, out.blockMonths, out.outlook]).toEqual([99, 10000, 36, 'conservative'])
    expect(out.portfolio).toBe(base.portfolio)
  })

  it('returns sanitized inputs, even from a hostile snapshot', () => {
    const out = applySync(
      base,
      {
        portfolio: -5,
        age: 200.7,
        paths: 77,
        homeCityId: 'atlantis',
        outlook: 'rosy',
      } as never,
      [...SYNC_FIELDS],
    )
    expect(out).toEqual(sanitizeIncomeInputs(out))
    expect(out.portfolio).toBe(0)
    expect(out.age).toBe(85)
    expect(out.paths).toBe(base.paths)
    expect(out.homeCityId).toBe(base.homeCityId)
    expect(out.outlook).toBe(base.outlook)
  })

  it('a full sync makes every field match', () => {
    const out = applySync(base, snap, SYNC_FIELDS)
    for (const f of SYNC_FIELDS) expect(fieldMatches(f, out, snap)).toBe(true)
    expect(fieldMatches('portfolio', base, snap)).toBe(false)
  })

  it('ignores unknown fields and leaves the input object alone', () => {
    const before = JSON.stringify(base)
    const out = applySync(base, snap, ['nope' as never])
    expect(out).toEqual(base)
    expect(JSON.stringify(base)).toBe(before)
  })
})

describe('changedSince and records', () => {
  const at = new Date('2026-11-18T10:00:00.000Z')
  const rec = makeSyncRecord(null, snapshotFromEvelo(EV), ['portfolio', 'spending', 'age'], at)!

  it('records the ticked fields and their values', () => {
    expect(rec).toEqual({
      at: '2026-11-18T10:00:00.000Z',
      fields: ['portfolio', 'age', 'spending'],
      snapshot: {
        portfolio: 2_400_000,
        age: 52,
        spending: budgetTotal(EV.budget),
      },
    })
  })

  it('nothing changed → empty; no record → empty', () => {
    expect(changedSince(rec, snapshotFromEvelo(EV))).toEqual([])
    expect(changedSince(null, snapshotFromEvelo(EV))).toEqual([])
  })

  it('names the synced fields that moved, not the unsynced ones', () => {
    const moved = plan({
      ...EV,
      age: 53,
      budget: { ...EV.budget, housing: EV.budget.housing + 1000 },
      seed: 1,
      homeCityId: 'boston',
    })
    expect(changedSince(rec, snapshotFromEvelo(moved))).toEqual(['age', 'spending'])
  })

  it('a re-sync of some fields keeps the others tracked', () => {
    const moved = snapshotFromEvelo(plan({ ...EV, age: 53, portfolio: 1 }))
    const next = makeSyncRecord(rec, moved, ['age'], new Date('2026-11-19T00:00:00Z'))!
    expect(next.fields).toEqual(['portfolio', 'age', 'spending'])
    expect(next.snapshot.age).toBe(53)
    expect(next.snapshot.portfolio).toBe(2_400_000)
    expect(changedSince(next, moved)).toEqual(['portfolio'])
  })

  it('copying nothing makes no record', () => {
    expect(makeSyncRecord(null, snapshotFromEvelo(EV), [])).toBeNull()
    expect(makeSyncRecord(rec, snapshotFromEvelo(EV), [])).toBe(rec)
  })
})

describe('sanitizeSyncRecord', () => {
  const good: SyncRecord = {
    at: '2026-11-18T10:00:00.000Z',
    fields: ['spending', 'futures'],
    snapshot: {
      spending: 90_000,
      seed: 7,
      paths: 4000,
      blockMonths: 24,
      outlook: 'balanced',
    },
  }

  it('keeps a good record', () => {
    expect(sanitizeSyncRecord(JSON.parse(JSON.stringify(good)))).toEqual(good)
  })

  it.each([
    null,
    undefined,
    1,
    'x',
    [],
    [good],
    { ...good, at: 'yesterday' },
    { ...good, at: 5 },
    { ...good, at: '2026-99-99T00:00:00Z' },
    { ...good, fields: [] },
    { ...good, fields: 'spending' },
    { ...good, fields: ['__proto__', 'nope'] },
  ])('drops an unfit record (%#)', (raw) => {
    expect(sanitizeSyncRecord(raw)).toBeNull()
  })

  it('ignores inherited keys', () => {
    const proto = Object.create(good)
    expect(sanitizeSyncRecord(proto)).toBeNull()
    const snapProto = { ...good, snapshot: Object.create({ spending: 1 }) }
    expect(sanitizeSyncRecord(snapProto)?.snapshot).toEqual({})
  })

  it('cleans hostile fields and values', () => {
    const r = sanitizeSyncRecord({
      at: '2026-11-18T10:00:00Z',
      fields: ['spending', 'spending', 'bogus', 'age', 'homeCityId', 'futures', 'constructor'],
      snapshot: {
        spending: 1e20,
        age: 12.4,
        homeCityId: '__proto__',
        seed: Infinity,
        paths: 123,
        blockMonths: 3,
        outlook: 'great',
        portfolio: 5,
        extra: 'x',
      },
      evil: true,
    })!
    expect(r.at).toBe('2026-11-18T10:00:00.000Z')
    expect(r.fields).toEqual(['age', 'spending', 'homeCityId', 'futures'])
    // only values for the record's fields, clamped like the inputs; unfit values dropped
    expect(r.snapshot).toEqual({ spending: 1e9, age: 30, blockMonths: 6 })
    expect(Object.keys(r)).toEqual(['at', 'fields', 'snapshot'])
  })

  it('a dropped value reads as changed, never as the same', () => {
    const r = sanitizeSyncRecord({
      at: '2026-11-18T10:00:00Z',
      fields: ['homeCityId'],
      snapshot: { homeCityId: 'atlantis' },
    })!
    expect(changedSince(r, snapshotFromEvelo(EV))).toEqual(['homeCityId'])
  })

  it('snapshot sanitizer rejects arrays and non-objects', () => {
    expect(sanitizeSnapshot([1, 2])).toEqual({})
    expect(sanitizeSnapshot('x')).toEqual({})
  })
})
