import type { ExpatProfile } from '../expatPicks'

const profile: ExpatProfile = {
  tagline: 'Great harbour city with no inheritance tax, but no visa to retire on',
  summary:
    'Sydney has one of the world\'s great harbours, a mild, sunny climate, world-class hospitals and no language barrier, and Australia has no wealth, inheritance or estate tax, an estate and gift tax treaty with the US and Schwab International access. For buy-borrow-die it is a base for long visits rather than a retirement home: Australia\'s retiree visas are closed to new applicants, so without a child settled there a portfolio retiree is left with a visitor visa of up to 12 months at a time, in one of the most expensive cities anywhere. A visitor\'s US dividends and gains go untaxed, but a permanent resident pays up to 47% on worldwide income, and at death on the gains in shares left to children abroad.',
  scores: { cost: 1, healthcare: 4, safety: 4, visa: 1, climate: 5, community: 4, tax: 4, estate: 3, lending: 4 },
  facts: {
    healthcare:
      'World-class public teaching hospitals, led by Royal Prince Alfred, in Newsweek\'s 2026 world top 100; Medicare covers citizens and permanent residents, and the US has no reciprocal health agreement with Australia, so a visitor or temporary-visa retiree pays in full and needs private overseas visitors cover for the whole stay.',
    safety:
      'Australia is 20th of 163 in the 2026 Global Peace Index; violent crime is low by US big-city standards, and the natural hazards are summer heatwaves and bushfire smoke.',
    visa: 'No retirement or passive-income visa: the Investor Retirement (405) and Retirement (410) visas are closed to new applicants (existing holders can renew), and the business and investor programme closed in July 2024; parent visas need a child settled in Australia (the temporary Sponsored Parent 870 gives 3 or 5 years at a time, up to 10, with no Medicare; the permanent queues run many years), so most retirees are left with a visitor visa of up to 12 months, generally no more than 12 months in any 18 (secondary source).',
    tax: 'No wealth tax; a temporary resident (on a temporary visa, without an Australian-resident spouse) is taxed only on Australian income and on gains from Australian real property, so US dividends, interest and share gains go untaxed for as long as the temporary visa lasts; a permanent resident pays tax on worldwide income at up to 45% plus the 2% Medicare levy, with half of a gain on assets held over a year taxed until June 2027, when (as proposed in the 2026 budget) indexation and a 30% minimum tax replace the discount; non-residents get no discount on gains after May 2012.',
    estate:
      'No inheritance, estate or gift tax; but when an Australian resident dies leaving shares or other non-Australian-property assets to a non-resident heir (such as children living in the US), CGT event K3 taxes the unrealised gain in the final return as if sold, which undoes the local benefit of holding until death; a temporary resident\'s foreign assets are outside Australian CGT, so this reaches mainly permanent residents (check); the US–Australia estate and gift tax treaty applies, and the $15M US exemption (2026) applies as anywhere.',
    lending:
      'IBKR reportedly serves Australia residents through Interactive Brokers Australia, and Schwab International\'s online application reportedly accepts Australia residents (Oct 2026); margin terms by country of residence are unconfirmed, and Fidelity and Vanguard open no accounts for residents abroad.',
    climate:
      'Humid subtropical: warm, sometimes humid summers (January highs about 26 °C / 79 °F) and mild, sunny winters (July highs about 17 °C / 63 °F); about 1,150 mm of rain a year.',
    community:
      'English-speaking, with about 39% of Greater Sydney born overseas and about 26,000 US-born residents (2021 census); with no retiree visa, the community of foreign retirees is small, but nothing in daily life needs another language.',
    access:
      'Nonstops to Los Angeles (Qantas, United, Delta, American), San Francisco (Qantas, United), Dallas–Fort Worth (Qantas), Houston (United, seasonal) and Honolulu (Qantas, Hawaiian), plus Qantas to New York–JFK via Auckland; the flight to the West Coast takes about 14 hours.',
  },
  drawbacks: [
    'No retirement visa: visits of up to 12 months at a time without a child settled in Australia',
    'Among the world\'s most expensive cities for housing',
    'Permanent residents pay up to 47% on worldwide income, and tax on gains in shares left to heirs abroad',
  ],
  sources: [
    { name: 'PwC: Australia, residence', url: 'https://taxsummaries.pwc.com/australia/individual/residence', edition: '2026' },
    { name: 'PwC: Australia, income determination', url: 'https://taxsummaries.pwc.com/australia/individual/income-determination', edition: '2026' },
    { name: 'PwC: Australia, other taxes', url: 'https://taxsummaries.pwc.com/australia/individual/other-taxes', edition: '2026' },
    {
      name: 'PwC: Australia, taxes on personal income',
      url: 'https://taxsummaries.pwc.com/australia/individual/taxes-on-personal-income',
      edition: '2026',
    },
    { name: 'BDO: Budget 2026, changes to the capital gains tax discount', url: 'https://www.bdo.com.au/en-au/insights/budget/2026/changes-to-the-capital-gains-tax-discount', edition: '2026' },
    { name: 'Atlas Wealth: deceased estates with overseas connections (CGT event K3)', url: 'https://atlaswealth.com/news/deceased-estates-with-overseas-connections/', edition: '2026' },
    { name: 'Widen: retire to Australia, visa options (Oct 2026)', url: 'https://www.widen.com.au/retire-to-australia-visa-options/', edition: '2026' },
    { name: 'nib: reciprocal health care agreements for visitors to Australia', url: 'https://www.nib.com.au/the-checkup/reciprocal-health-care-agreements-for-visitors-to-australia' },
    { name: 'IRS: estate and gift tax treaties', url: 'https://www.irs.gov/businesses/small-businesses-self-employed/estate-gift-tax-treaties-international' },
    { name: 'YourTaxBase: Charles Schwab for expats (country list, Oct 2026)', url: 'https://yourtaxbase.com/blog/charles-schwab-for-expats' },
    { name: 'Alfred Health: The Alfred named one of the world\'s best hospitals (Newsweek 2026)', url: 'https://www.alfredhealth.org.au/news/the-alfred-named-one-of-the-worlds-best-hospitals', edition: '2026' },
    {
      name: 'Greek City Times: Global Peace Index 2026 rankings',
      url: 'https://greekcitytimes.com/2026/06/12/iceland-safest-country-19th-year-greece-53rd-global-peace-index-2026/',
      edition: '2026',
    },
    { name: 'ABS: people in Greater Sydney born in the United States (2021 census)', url: 'https://www.abs.gov.au/census/find-census-data/quickstats/2021/8104_1GSYD' },
    { name: 'Wikipedia: Sydney', url: 'https://en.wikipedia.org/wiki/Sydney' },
    { name: 'Wikipedia: Sydney Airport', url: 'https://en.wikipedia.org/wiki/Sydney_Airport' },
  ],
}

export default profile
