import type { ExpatProfile } from '../expatPicks'

const profile: ExpatProfile = {
  tagline: 'World city with four tax-free years, but no visa to stay',
  summary:
    'London has the most US nonstops of any city outside North America, world-class hospitals and free national museums, and no language barrier. For buy-borrow-die it is mostly a base for long visits: there is no retirement or passive-income visa (a US visitor can stay up to 6 months), and anyone who did settle gets only 4 years of tax-free foreign income and gains before dividends pay up to 39.35%, with 40% inheritance tax on the worldwide estate after 10 years\' residence.',
  scores: { cost: 1, healthcare: 4, safety: 3, visa: 1, climate: 3, community: 5, tax: 2, estate: 2, lending: 3 },
  facts: {
    healthcare:
      'World-class NHS teaching hospitals (Guy\'s and St Thomas\', UCLH, Imperial) and a large private sector (The London Clinic, Cromwell); visa holders pay the Immigration Health Surcharge (£1,035 a year for most adults) for NHS access, visitors are charged for NHS hospital care, and NHS waits for planned treatment are long.',
    safety:
      'The UK is 39th of 163 in the 2026 Global Peace Index; London has low violent crime by US big-city standards, but phone snatching, pickpocketing and knife crime in some boroughs are real concerns.',
    visa: 'No retirement or passive-income visa: savings and pensions alone give no right to live there, and a US visitor can normally stay up to 6 months but cannot make the UK home through repeated visits; the routes left need a UK-born grandparent plus Commonwealth citizenship (Ancestry), a British or settled partner, or sponsored work (secondary source); visitors need an Electronic Travel Authorisation (£20).',
    tax: 'No wealth tax; since April 2025 the 4-year foreign income and gains (FIG) regime replaces non-dom status: after 10 years of non-UK residence, foreign dividends, interest and gains are untaxed for the first 4 UK tax years whether or not brought in (claiming costs the personal and CGT allowances); after that, dividends pay 10.75–39.35% (from April 2026), interest 20–45% (rising to 22–47% from April 2027) and gains 18–24%.',
    estate:
      'Inheritance tax of 40% above a £325,000 nil-rate band; since April 2025 it is residence-based, reaching non-UK assets only after 10 of the last 20 tax years in the UK (with a tail of up to 10 years after leaving); the US–UK estate and gift tax treaty gives relief, and the $15M US exemption (2026) applies as anywhere.',
    lending:
      'IBKR reportedly serves UK residents through IB UK, and Schwab International reportedly accepts them, but Schwab reportedly bars Europe residents from taking cash out through margin, which likely covers the UK, so plan on IBKR margin; UK PRIIPs rules, which reportedly limited new buys of US-listed ETFs, were replaced on 6 April 2026 by the Consumer Composite Investments regime (check how brokers apply it).',
    climate:
      'Mild maritime: warm summers (July highs about 24 °C / 75 °F), cool, grey winters (January highs about 8 °C / 46 °F) with rare snow, and about 600 mm of rain spread through the year.',
    community:
      'English-speaking, with one of the largest American communities abroad and residents from everywhere; nothing about daily life needs another language.',
    access:
      'Heathrow has nonstops to about 30 US cities on British Airways, Virgin Atlantic, American, United and Delta, and Gatwick adds more; it is the best-connected place to the US outside North America.',
  },
  drawbacks: [
    'No visa for a retiree living on a portfolio: visits of up to 6 months only',
    'After 4 FIG years, dividends taxed up to 39.35%; 40% inheritance tax on the worldwide estate after 10 years',
    'Among the world\'s most expensive cities for housing',
  ],
  sources: [
    { name: 'PwC: United Kingdom, other taxes', url: 'https://taxsummaries.pwc.com/united-kingdom/individual/other-taxes', edition: '2026' },
    {
      name: 'PwC: United Kingdom, income determination',
      url: 'https://taxsummaries.pwc.com/united-kingdom/individual/income-determination',
      edition: '2026',
    },
    {
      name: 'GOV.UK: check if you can claim the 4-year foreign income and gains regime',
      url: 'https://www.gov.uk/guidance/check-if-you-can-claim-the-4-year-foreign-income-and-gains-regime',
    },
    { name: 'GOV.UK: Capital Gains Tax rates', url: 'https://www.gov.uk/capital-gains-tax/rates', edition: '2026' },
    { name: 'GOV.UK: Inheritance Tax', url: 'https://www.gov.uk/inheritance-tax' },
    { name: 'IRS: estate and gift tax treaties', url: 'https://www.irs.gov/businesses/small-businesses-self-employed/estate-gift-tax-treaties-international' },
    {
      name: 'Taxes for Expats: retiring in the UK as an American',
      url: 'https://www.taxesforexpats.com/country-guides/uk/retiring-in-the-uk.html',
      edition: '2026',
    },
    { name: 'GOV.UK: apply for an electronic travel authorisation', url: 'https://www.gov.uk/guidance/apply-for-an-electronic-travel-authorisation-eta' },
    {
      name: 'Ashurst: Consumer Composite Investments replace UK PRIIPs',
      url: 'https://www.ashurstperkinscoie.com/en/insights/consumer-composite-investments-replace-uk-priips-412026-33515-pm/',
      edition: '2026',
    },
    { name: 'Davidson Morris: Immigration Health Surcharge 2026', url: 'https://www.davidsonmorris.com/immigration-health-surcharge/', edition: '2026' },
    { name: 'Money.it: GPI 2026 top 50', url: 'https://www.money.it/50-paesi-piu-sicuri-al-mondo-nel-2026', edition: '2026' },
    { name: 'YourTaxBase: Charles Schwab for expats (country list, Oct 2026)', url: 'https://yourtaxbase.com/blog/charles-schwab-for-expats' },
    { name: 'Wikipedia: Heathrow Airport', url: 'https://en.wikipedia.org/wiki/Heathrow_Airport' },
    { name: 'Wikipedia: London', url: 'https://en.wikipedia.org/wiki/London' },
  ],
}

export default profile
