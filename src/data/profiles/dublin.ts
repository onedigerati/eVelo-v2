import type { ExpatProfile } from '../expatPicks'

const profile: ExpatProfile = {
  tagline: 'Very safe, English-speaking, with the best US flights in Europe',
  summary:
    'Dublin is English-speaking, Ireland is 5th in the 2026 Global Peace Index, and its airport has US preclearance and more than 20 US nonstops. For buy-borrow-die it is mixed: a US citizen is usually non-domiciled, so foreign investment income and gains are taxed only when brought into Ireland, but Stamp 0 needs €50,000 a year per person, children pay 33% inheritance tax above €420,000 once the parent has lived there 5 years, and Dublin housing is very expensive.',
  scores: { cost: 1, healthcare: 4, safety: 5, visa: 3, climate: 3, community: 5, tax: 4, estate: 2, lending: 3 },
  facts: {
    healthcare:
      'Major teaching hospitals (St James\'s, the Mater, Beaumont, St Vincent\'s) and private ones (Beacon, Blackrock Clinic), but public waiting lists are long and Stamp 0 requires full private cover; Irish private insurance takes any age, with a late-entry loading of 2% of the premium per year over 34 (up to 70%) for first-time joiners.',
    safety:
      'Ireland is 5th of 163 in the 2026 Global Peace Index; violent crime is low, with petty theft and antisocial behaviour around parts of the north inner city and the quays at night.',
    visa: 'Stamp 0 (independent means) needs at least €50,000 a year per person (€100,000 for a couple) from pensions or savings ("speculative investments" generally do not count), a lump sum for emergencies and full private health insurance; it is granted a year at a time, allows no work, and gives no access to state benefits (law-firm source).',
    tax: 'No wealth tax; a non-domiciled resident (a US citizen usually keeps a US domicile) is taxed on foreign dividends, interest and gains only when remitted to Ireland, at up to 40% plus USC on income and 33% on gains, so money spent in Ireland should come from capital held before arrival (clean capital), not from foreign income or gains; whether loan money brought in counts as a remittance of the securing assets needs advice.',
    estate:
      'Capital Acquisitions Tax of 33% above a €420,000 lifetime allowance per child (from 7 Oct 2026); a non-domiciled parent counts as resident only after 5 consecutive years in Ireland, after which the worldwide estate is in reach; the US–Ireland estate tax treaty gives credit relief, and the $15M US exemption (2026) applies as anywhere.',
    lending:
      'IBKR reportedly serves Ireland residents through its Irish entity, and Schwab International reportedly accepts them, but Schwab reportedly bars Europe residents from taking cash out through margin, so plan on IBKR margin; EU PRIIPs rules reportedly block new buys of US-listed ETFs, not holding them.',
    climate:
      'Mild and damp: cool summers (July highs about 20 °C / 68 °F), mild winters (January highs about 8 °C / 46 °F) with little frost or snow, frequent cloud and wind, and about 760 mm of rain spread through the year.',
    community:
      'An English-speaking capital with a large international population and a sizeable American community; most newcomers are working-age, but daily life needs no other language.',
    access:
      'Dublin Airport has nonstops to more than 20 US cities on Aer Lingus, Delta, American, United and JetBlue (some seasonal), and most Terminal 2 flights include US preclearance, so you skip immigration queues on landing.',
  },
  drawbacks: [
    'Very high rents and house prices, and a tight rental market',
    '33% inheritance tax on the worldwide estate above €420k per child after 5 years\' residence',
    'Stamp 0 needs €50k a year per person, renewed yearly, and remitted income is taxed at up to 40% plus USC',
  ],
  sources: [
    { name: 'PwC: Ireland, other taxes', url: 'https://taxsummaries.pwc.com/ireland/individual/other-taxes', edition: '2026' },
    { name: 'PwC: Ireland, income determination', url: 'https://taxsummaries.pwc.com/ireland/individual/income-determination', edition: '2026' },
    { name: 'PwC: Ireland, taxes on personal income', url: 'https://taxsummaries.pwc.com/ireland/individual/taxes-on-personal-income', edition: '2026' },
    {
      name: 'Revenue: CAT thresholds',
      url: 'https://www.revenue.ie/en/gains-gifts-and-inheritance/cat-thresholds-rates-and-aggregation-rules/cat-thresholds.aspx',
      edition: '2026',
    },
    {
      name: 'Irish Times: tax rules on bringing money back into Ireland',
      url: 'https://www.irishtimes.com/business/personal-finance/what-are-the-tax-rules-on-bringing-money-back-into-ireland-1.4773102',
    },
    { name: 'IRS: estate and gift tax treaties', url: 'https://www.irs.gov/businesses/small-businesses-self-employed/estate-gift-tax-treaties-international' },
    {
      name: 'Lewis Silkin: Stamp 0, Ireland\'s visa for retirees',
      url: 'https://www.lewissilkin.com/en-ie/insights/2025/08/07/stamp-0irelands-visa-for-retirees-or-persons-of-independent-means',
      edition: '2025',
    },
    { name: 'Irish Life Health: maximum lifetime community rating loading', url: 'https://www.irishlife.ie/health-insurance/help/what-is-the-maximum-lifetime-community-rating-lcr/' },
    { name: 'Money.it: GPI 2026 top 50', url: 'https://www.money.it/50-paesi-piu-sicuri-al-mondo-nel-2026', edition: '2026' },
    { name: 'YourTaxBase: Charles Schwab for expats (country list, Oct 2026)', url: 'https://yourtaxbase.com/blog/charles-schwab-for-expats' },
    { name: 'Dublin Airport: travelling to the USA', url: 'https://dublinairport.com/flight-information/travelling-to-usa' },
    { name: 'Wikipedia: Dublin Airport', url: 'https://en.wikipedia.org/wiki/Dublin_Airport' },
    { name: 'Wikipedia: Dublin', url: 'https://en.wikipedia.org/wiki/Dublin' },
  ],
}

export default profile
