import { describe, expect, it, vi } from 'vitest'

// PortfolioSection imports the store, which reads `window` on load.
vi.mock('../../../state/store', () => ({ useStore: () => undefined }))
vi.mock('../../../state/fx', () => ({ useFx: () => undefined, useRate: () => 1 }))
import { portfolioHint } from '../PortfolioSection'

describe('portfolioHint', () => {
  it('is unchanged without a loan balance', () => {
    expect(portfolioHint(0)).toBe('Taxable brokerage assets you would borrow against. Try “2.5m”.')
  })

  it('names the balance the portfolio must stay above', () => {
    expect(portfolioHint(500_000)).toBe(
      'Taxable brokerage assets you would borrow against. Try “2.5m”. Must stay above your $500K loan balance.',
    )
  })

  it('spells the balance out when it would round to the portfolio’s compact figure', () => {
    expect(portfolioHint(1_999_999, 2_000_000)).toBe(
      'Taxable brokerage assets you would borrow against. Try “2.5m”. Must stay above your $1,999,999 loan balance.',
    )
    expect(portfolioHint(500_000, 2_000_000)).toMatch(/your \$500K loan balance\.$/)
    expect(portfolioHint(1_900_000, 2_000_000)).toMatch(/your \$1\.9M loan balance\.$/)
  })
})
