import type { ExpatProfile } from '../expatPicks'
import { S } from './_shared'

const profile: ExpatProfile = {
  tagline: 'Greek island living with Greece\'s low dividend tax',
  summary:
    'Live and Invest Overseas ranks Crete 5th for 2026, citing low rents, English in the main towns and an established British, German and American community. It shares Greece\'s BBD profile: no wealth tax, 5% on dividends and a US estate tax treaty, with hospitals in Chania and Heraklion.',
  scores: { cost: 3, healthcare: 3, safety: 3, visa: 3, climate: 4, community: 3, tax: 4, estate: 3, lending: 3 },
  facts: {
    healthcare:
      'Chania\'s main public hospital is the General Hospital "Agios Georgios", with Heraklion\'s hospitals for more specialist care; public waits are long, so most expats carry private cover, which the residence permit requires.',
    safety: 'Greece is 53rd in the 2026 Global Peace Index; violent crime is low, and theft in the towns and resorts is mostly opportunistic.',
    visa: 'Financially Independent Person permit: at least €3,500/month of passive income such as dividends or interest (+20% for a spouse, +15% per child), private health insurance and Greek housing; renewable, with 183+ days a year in Greece needed to renew, and no work allowed.',
    tax: 'No wealth tax (ENFIA is on Greek real estate only); residents pay a 5% final tax on dividends and 15% on interest; the 7% Art. 5B regime needs a foreign pension (whether it covers investment income is unverified), and the €100k/yr Art. 5A lump sum needs a €500k Greek investment.',
    estate:
      'Children pay 0% on the first €150k, then 1%, 5% and 10% above €600k per heir, and a foreign resident\'s movable assets abroad (such as a US brokerage account) are generally in scope; a 1950 US–Greece estate tax treaty exists.',
    lending:
      'IBKR reportedly serves Greek residents (likely through its EU entity) and Schwab International reportedly accepts Greece, but Schwab reportedly bars Europe-resident customers from withdrawing cash against margin; EU PRIIPs rules reportedly block new purchases of US ETFs.',
    climate: 'Mediterranean: in Chania, August highs average about 30°C and January about 14°C (lows 8°C), with about 2,800 hours of sun and most rain in winter.',
    community:
      'Mostly older British and German expats, plus Americans linked to the US naval base at Souda Bay; locals in the main towns get by in English.',
    access: 'No US nonstops to any Greek island: connect through Athens (about an hour\'s flight) or fly direct from many European cities to Chania or Heraklion.',
  },
  drawbacks: [
    'Complex care can mean a trip to Heraklion or Athens',
    'Every US trip needs a connection, and the island is quieter in winter',
    'Inheritance tax of up to 10% reaches a US portfolio above €600k per child',
  ],
  sources: [
    { ...S.lios, name: '401(k) Specialist: Live and Invest Overseas 2026, Crete 5th' },
    { name: 'PwC: Greece, taxes on personal income', url: 'https://taxsummaries.pwc.com/greece/individual/taxes-on-personal-income' },
    { name: 'Greek Ministry of Finance: capital taxation', url: 'https://minfin.gov.gr/en/tax-policy/tax-guide/capital-taxation/' },
    { name: 'Vardikos & Vardikos: Financially Independent Person visa', url: 'https://vardikos.com/what-is-financially-independent-persons-fip-visa' },
    { name: 'IRS: estate and gift tax treaties', url: 'https://www.irs.gov/businesses/small-businesses-self-employed/estate-gift-tax-treaties-international' },
    { name: 'YourTaxBase: Charles Schwab for expats (Oct 2026)', url: 'https://yourtaxbase.com/blog/charles-schwab-for-expats' },
    { name: 'Wikipedia: Chania (climate, hospital)', url: 'https://en.wikipedia.org/wiki/Chania' },
    { name: 'Greek Trip Planner: direct flights to Greece 2026', url: 'https://greektriplanner.me/blog/direct-flights-to-greece' },
    {
      name: 'Greek City Times: Greece 53rd in GPI 2026',
      url: 'https://greekcitytimes.com/2026/06/12/iceland-safest-country-19th-year-greece-53rd-global-peace-index-2026/',
      edition: '2026',
    },
  ],
}

export default profile
