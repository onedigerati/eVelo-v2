import type { ExpatProfile } from '../expatPicks'
import { S } from './_shared'

const profile: ExpatProfile = {
  tagline: 'The Eternal City, with US nonstops and Italy\'s yearly portfolio tax',
  summary:
    'Rome offers big teaching hospitals, more US nonstops than anywhere else in Italy and a large international community, and Italy is 6th in International Living\'s 2026 index. For buy-borrow-die it ranks low, as Florence does: Italy charges 0.2% a year on the whole US portfolio (IVAFE) and 26% on dividends, though children inherit at only 4% above €1M each under a US estate treaty.',
  scores: { cost: 2, healthcare: 4, safety: 4, visa: 3, climate: 3, community: 4, tax: 1, estate: 4, lending: 3 },
  facts: {
    healthcare:
      'Elective-residence holders need private insurance (at least €30k cover) for the visa, then can join the public SSN voluntarily for €2,000–2,789 a year; among Rome\'s many hospitals, Campus Bio-Medico University Hospital received JCI accreditation in 2014 (current status unverified), and the US Embassy keeps a list of English-speaking doctors (secondary source); public-system care runs in Italian.',
    safety: 'Italy is 35th in the 2026 Global Peace Index, and the US rates it Level 2 (secondary source); UK advice says crime is generally low, with pickpocketing and bag-snatching in the centre, at tourist sites and on transport.',
    visa: 'Elective-residence visa: at least €31,000/year for one person and €62,000 for a couple (Houston consulate) of stable passive income, plus a registered lease or deed for the whole period; it is consular practice rather than statute, savings alone do not count, no work is allowed, and absences over 6 months put renewal at risk.',
    tax: 'IVAFE charges 0.2% a year on the market value of financial assets held abroad, so the whole US portfolio pays yearly with no deduction for the loan; foreign dividends and interest pay a 26% substitute tax (the US credit is contested but backed by recent Cassation rulings); a €300k/yr flat tax for new residents replaces both, and the 7% southern regime excludes Rome.',
    estate:
      '4% above a €1M allowance per child (believed to reach a resident\'s worldwide assets, unverified), and a 1955 US–Italy estate treaty exists; the $15M US exemption (2026) applies as anywhere.',
    lending:
      'IBKR is reportedly the only option: Schwab International\'s online form reportedly does not accept Italy residents; EU PRIIPs rules reportedly block new buys of US-listed ETFs, not holding them.',
    climate: 'Mediterranean: July–August highs about 31–33°C with long hot spells, and January highs about 12°C with lows near 3°C.',
    community: 'A large international community around the embassies, the Vatican, UN agencies and US university programmes, though its size is not measured; English is common in the centre, but daily life and paperwork run in Italian.',
    access: 'Fiumicino has year-round and seasonal nonstops to many US cities on ITA, Delta, United and American (including New York, Boston, Chicago, Atlanta, Washington, Miami and Los Angeles).',
  },
  drawbacks: [
    'IVAFE at 0.2% a year on the whole portfolio, plus 26% on dividends and interest',
    'Hot summers, heavy tourist crowds and slow Italian bureaucracy',
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
    { name: 'Campus Bio-Medico: JCI accreditation', url: 'https://www.unicampus.it/en/news/quality-polyclinic-in-healthcare/' },
    { name: 'Travel Advisory: Italy', url: 'https://www.traveladvisory.io/advisory/italy' },
    { name: 'GOV.UK: Italy travel advice, safety and security', url: 'https://www.gov.uk/foreign-travel-advice/italy/safety-and-security' },
    { name: 'Wikipedia: Rome Fiumicino Airport', url: 'https://en.wikipedia.org/wiki/Rome_Fiumicino_Airport' },
    { name: 'Wikipedia: Climate of Rome', url: 'https://en.wikipedia.org/wiki/Climate_of_Rome' },
    S.gpiTop50,
  ],
}

export default profile
