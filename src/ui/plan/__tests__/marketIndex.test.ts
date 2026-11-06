import { describe, expect, it } from 'vitest'
import { allAssets, assetMeta, searchAssets } from '../marketIndex'

describe('market index', () => {
  it('finds tickers by symbol first', () => {
    expect(searchAssets('nvda')[0].symbol).toBe('NVDA')
    expect(searchAssets('NVDA')[0].symbol).toBe('NVDA')
    expect(searchAssets('brkb')[0].symbol).toBe('BRK-B')
    expect(searchAssets('v')[0].symbol).toBe('V')
  })

  it('matches names and fuzzy fragments', () => {
    expect(searchAssets('gold').map((m) => m.symbol)).toEqual(expect.arrayContaining(['GLD', 'IAU']))
    expect(searchAssets('dividend').map((m) => m.symbol)).toContain('SCHD')
    expect(searchAssets('zzzzqqq')).toHaveLength(0)
  })

  it('groups and summarizes every asset', () => {
    const all = allAssets()
    expect(all.length).toBeGreaterThan(100)
    expect(assetMeta('SCHD')?.group).toBe('dividend')
    expect(assetMeta('XLK')?.group).toBe('sectors')
    expect(assetMeta('BND')?.group).toBe('bonds')
    expect(assetMeta('GLD')?.group).toBe('real')
    expect(assetMeta('BTC-USD')?.group).toBe('crypto')
    expect(assetMeta('VTI')?.group).toBe('broad')
    for (const m of all) {
      expect(m.spark).toHaveLength(60)
      expect(m.years).toBeGreaterThan(0)
      if (m.years >= 10) expect(m.cagr10).not.toBeNull()
    }
    expect(assetMeta('ARM')!.years).toBeLessThan(10)
  })
})
