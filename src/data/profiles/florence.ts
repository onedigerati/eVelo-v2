import type { ExpatProfile } from '../expatPicks'
import { S } from './_shared'

const profile: ExpatProfile = {
  tagline: 'Renaissance city, strong healthcare, big American community',
  summary:
    'Italy is 6th in International Living\'s 2026 index and on Forbes\' 2026 list, and Florence offers world-class culture, good Tuscan public hospitals and a long-established American community. For buy-borrow-die it ranks low: Italy charges 0.2% a year on the whole US portfolio (IVAFE) and 26% on dividends, though children inherit at only 4% above €1M each under a US estate treaty.',
  scores: { cost: 1, healthcare: 4, safety: 4, visa: 3, climate: 3, community: 4, tax: 1, estate: 4, lending: 3 },
  facts: {
    healthcare:
      'Elective-residence holders need private insurance (at least €30k cover) for the visa, then can join the public SSN voluntarily for €2,000–2,789 a year; Careggi is a major teaching hospital, and Tuscany\'s public system is among Italy\'s better ones.',
    safety: 'Italy is 35th in the 2026 Global Peace Index; violent crime is low, with pickpocketing around the Duomo, the station and on buses.',
    visa: 'Elective-residence visa: at least €31,000/year for one person and €62,000 for a couple (Houston consulate) of stable passive income, plus a registered lease or deed for the whole period; it is consular practice rather than statute, savings alone do not count, no work is allowed, and absences over 6 months put renewal at risk.',
    tax: 'IVAFE charges 0.2% a year on the market value of financial assets held abroad, so the whole US portfolio pays yearly with no deduction for the loan; foreign dividends and interest pay a 26% substitute tax (the US credit is contested but backed by recent Cassation rulings); a €300k/yr flat tax for new residents replaces both, and the 7% regime excludes Florence.',
    estate:
      '4% above a €1M allowance per child (believed to reach a resident\'s worldwide assets, unverified), and a 1955 US–Italy estate treaty exists; the $15M US exemption (2026) applies as anywhere.',
    lending:
      'IBKR is reportedly the only option: Schwab International\'s online form reportedly does not accept Italy residents; EU PRIIPs rules reportedly block new buys of US-listed ETFs, not holding them.',
    climate: 'Hot, humid summers often above 35°C in the river basin, and cool, damp winters with occasional frost.',
    community: 'A large, long-established American and British community, helped by many US university programmes; English is common in the centre.',
    access: 'No regular US nonstop to Florence or Pisa could be confirmed for 2026; most trips go via Rome (about 1.5 hours by fast train), Milan or a European hub.',
  },
  drawbacks: [
    'IVAFE at 0.2% a year on the whole portfolio, plus 26% on dividends and interest',
    'Very expensive housing in the centre, and heavy tourist crowds most of the year',
    'The visa needs proven passive income, so a portfolio-only retiree with low dividends may struggle',
  ],
  sources: [
    S.il,
    { name: 'PwC: Italy, other taxes', url: 'https://taxsummaries.pwc.com/italy/individual/other-taxes', edition: '2026' },
    { name: 'PwC: Italy, income determination', url: 'https://taxsummaries.pwc.com/italy/individual/income-determination', edition: '2026' },
    { name: 'We Wealth: tax on foreign dividends in Italy', url: 'https://www.we-wealth.com/en?p=131082' },
    { name: 'Boccadutri: elective residence permit requirements', url: 'https://www.boccadutri.com/elective-residence-permit-italy-requirements/' },
    { name: 'IRS: estate and gift tax treaties', url: 'https://www.irs.gov/businesses/small-businesses-self-employed/estate-gift-tax-treaties-international' },
    { name: 'YourTaxBase: Charles Schwab for expats', url: 'https://yourtaxbase.com/blog/charles-schwab-for-expats', edition: '2026' },
    {
      name: 'The Local: is Italy\'s flat tax for pensioners still available in 2026',
      url: 'https://www.thelocal.it/20260128/is-italys-flat-tax-rate-for-pensioners-still-available-in-2026',
    },
    S.gpiTop50,
  ],
}

export default profile
