// Render tests for the results panels: vitest runs in node, so they render to a string with
// react-dom/server and read the markup (no DOM, no testing-library).

import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { IncomeResult } from '../../../engine/incomeTypes'
import { HowWorkedOut } from '../HowWorkedOut'
import { IncomeLedger, LEDGER_COLUMNS, LEDGER_NOTE, ledgerMoney } from '../IncomeLedger'
import { IncomeMeasures, measureRate } from '../IncomeMeasures'
import { IncomeSummary } from '../IncomeSummary'
import fixture from './fixtures/incomeResult.json'

const result = fixture as IncomeResult
const text = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/&#x27;|&#39;/g, "'").replace(/&amp;/g, '&').replace(/\s+/g, ' ')

describe('measureRate', () => {
  it('shows the whole percent, rounded like the verdict, with no clamp at the ends', () => {
    expect(measureRate(0.844)).toBe('84%')
    expect(measureRate(0.845)).toBe('85%')
    expect(measureRate(0.985)).toBe('99%')
    expect(measureRate(0.996)).toBe('100%')
    expect(measureRate(0.004)).toBe('0%')
    expect(measureRate(1)).toBe('100%')
    expect(measureRate(NaN)).toBe('—')
  })
})

describe('IncomeMeasures', () => {
  it('shows the engine result’s three rates with their labels', () => {
    const html = renderToStaticMarkup(<IncomeMeasures result={result} />)
    const t = text(html)
    expect(t).toContain(`The money lasts ${measureRate(result.lastsRate)} of futures. Same test as eVelo.`)
    expect(t).toContain(`Principal never sold ${measureRate(result.principalKeptRate)} The strict income-only promise.`)
    expect(t).toContain(`Income keeps pace ${measureRate(result.keepsPaceRate)} Never falls more than 10% below year one, after inflation.`)
    // The lasts card is the brass one.
    expect(html).toMatch(/class="imeasure imeasure--lasts"/)
  })
})

describe('IncomeSummary', () => {
  it('sets the fraction in brass', () => {
    const html = renderToStaticMarkup(
      <IncomeSummary result={result} inputs={{ spending: result.median[0].spending, otherIncome: 0, age: 55, incomeStartAge: 67 }} />,
    )
    expect(html).toMatch(/<em class="isummary__em">about [a-z-]+<\/em>/)
  })
})

describe('ledgerMoney', () => {
  it('rounds to the nearest $100 in eVelo’s money format', () => {
    expect(ledgerMoney(22_449)).toBe('$22,400')
    expect(ledgerMoney(22_450)).toBe('$22,500')
    expect(ledgerMoney(0)).toBe('$0')
    expect(ledgerMoney(-20)).toBe('$0')
    expect(ledgerMoney(Infinity)).toBe('—')
  })
})

describe('IncomeLedger', () => {
  const html = renderToStaticMarkup(<IncomeLedger rows={result.median} />)

  it('is a real table with a caption and scoped headers', () => {
    expect(html).toMatch(/<table[^>]*>\s*<caption/)
    const cols = html.match(/<th scope="col"[^>]*>([^<]*)<\/th>/g) ?? []
    expect(cols.map((c) => c.replace(/<[^>]+>/g, ''))).toEqual([
      'Year',
      'Dividends',
      'Muni coupons',
      'Taxable interest',
      'Treasury interest',
      'Social Security',
      'Tax',
      'Sold to cover',
      'Value',
    ])
    expect(html.match(/<th scope="row"/g)).toHaveLength(result.years)
    // The scroll box is a labelled, focusable region, so keyboard users can scroll it.
    expect(html).toMatch(/<div class="iledger__scroll" role="region" aria-labelledby="[^"]+" tabindex="0">/)
  })

  it('shows each median row in today’s dollars, with the note', () => {
    const r = result.median[0]
    const first = text(html.split('<tbody>')[1].split('</tr>')[0])
    expect(first).toBe(` ${r.year} age ${r.age} ${LEDGER_COLUMNS.map((c) => c.format(r[c.key])).join(' ')} `)
    expect(text(html)).toContain(LEDGER_NOTE)
  })
})

describe('HowWorkedOut', () => {
  it('is collapsed by default and covers what’s left out', () => {
    const html = renderToStaticMarkup(<HowWorkedOut />)
    expect(html).toMatch(/^<details class="ihow">/)
    const t = text(html)
    for (const s of ['How this is worked out', 'alternative minimum tax', 'IRMAA', 'chained CPI', 'federal tax only', 'fat tails', 'half Treasury'])
      expect(t).toContain(s)
  })
})
