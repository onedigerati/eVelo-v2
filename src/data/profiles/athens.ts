import type { ExpatProfile } from '../expatPicks'
import { S } from './_shared'

const profile: ExpatProfile = {
  tagline: 'EU capital with a 5% dividend tax and a US estate treaty',
  summary:
    'Greece is 1st in International Living\'s 2026 Global Retirement Index. For a BBD retiree it has no wealth tax, a 5% final tax on dividends and one of only three US estate tax treaties among the candidates. Athens is a low-cost EU capital with the most US nonstop flights in Greece and the islands close by.',
  scores: { cost: 3, healthcare: 3, safety: 3, visa: 3, climate: 3, community: 3, tax: 4, estate: 3, lending: 3 },
  facts: {
    healthcare:
      'The public ESY system is stretched, with long waits; good private hospitals (Hygeia, Metropolitan, Iaso) are moderately priced, and most expats use private insurance, which the residence permit requires.',
    safety: 'Greece is 53rd in the 2026 Global Peace Index; violent crime is low, but pickpocketing and frequent protests and strikes affect central Athens.',
    visa: 'Financially Independent Person permit: at least €3,500/month of passive income such as dividends or interest (+20% for a spouse, +15% per child), private health insurance and Greek housing; renewable, with 183+ days a year in Greece needed to renew, and no work allowed.',
    tax: 'No wealth tax (ENFIA is on Greek real estate only); residents pay a 5% final tax on dividends and 15% on interest, and gains on listed holdings under 0.5% are exempt; the 7% Art. 5B regime needs a foreign pension (whether it covers investment income is unverified), and the €100k/yr Art. 5A lump sum needs a €500k Greek investment.',
    estate:
      'Children pay 0% on the first €150k, then 1%, 5% and 10% above €600k per heir, and a foreign resident\'s movable assets abroad (such as a US brokerage account) are generally in scope; a 1950 US–Greece estate tax treaty exists, and the Art. 5A regime exempts assets abroad.',
    lending:
      'IBKR reportedly serves Greek residents (likely through its EU entity) and Schwab International reportedly accepts Greece, but Schwab reportedly bars Europe-resident customers from withdrawing cash against margin; EU PRIIPs rules reportedly block new purchases of US ETFs, though existing holdings can usually be kept.',
    climate: 'Hot, dry summers with frequent 40°C heatwaves and wildfire smoke; short, mild winters.',
    community: 'A smaller English-speaking retiree scene than Portugal or Spain, growing in the southern coastal suburbs (Glyfada, Vouliagmeni); English is widely spoken.',
    access:
      'The only Greek airport with US nonstops: Delta from Atlanta and Boston and American from Philadelphia year-round, plus seasonal flights from New York, Chicago, Washington Dulles, Charlotte and Dallas (2026).',
  },
  drawbacks: [
    'Extreme summer heat and wildfire smoke are getting worse',
    'Inheritance tax of up to 10% reaches a US portfolio above €600k per child',
    'The €3,500/month passive-income bar is high, and the 7% regime needs a pension',
  ],
  sources: [
    { ...S.il, name: '401k Specialist: Greece tops 2026 Global Retirement Index' },
    { name: 'PwC: Greece, taxes on personal income', url: 'https://taxsummaries.pwc.com/greece/individual/taxes-on-personal-income' },
    { name: 'Greek Ministry of Finance: capital taxation', url: 'https://minfin.gov.gr/en/tax-policy/tax-guide/capital-taxation/' },
    {
      name: 'IBA: preferential tax regimes for individuals moving to Greece',
      url: 'https://www.ibanet.org/preferential-tax-regimes-for-individuals-moving-their-tax-residency-to-Greece',
    },
    { name: 'Vardikos & Vardikos: Financially Independent Person visa', url: 'https://vardikos.com/what-is-financially-independent-persons-fip-visa' },
    { name: 'IRS: estate and gift tax treaties', url: 'https://www.irs.gov/businesses/small-businesses-self-employed/estate-gift-tax-treaties-international' },
    { name: 'YourTaxBase: Charles Schwab for expats (Oct 2026)', url: 'https://yourtaxbase.com/blog/charles-schwab-for-expats' },
    {
      name: 'Greek City Times: Greece 53rd in GPI 2026',
      url: 'https://greekcitytimes.com/2026/06/12/iceland-safest-country-19th-year-greece-53rd-global-peace-index-2026/',
      edition: '2026',
    },
    { name: 'Greek Trip Planner: direct flights to Greece 2026', url: 'https://greektriplanner.me/blog/direct-flights-to-greece' },
  ],
}

export default profile
