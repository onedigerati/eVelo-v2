import type { ExpatProfile } from '../expatPicks'

const profile: ExpatProfile = {
  tagline: 'A low flat tax and no estate tax, with Duke and UNC down the road',
  summary:
    'North Carolina taxes dividends, interest and gains at a flat 3.99% (2026), falling to 3.49% in 2027, and has had no estate or inheritance tax since 2013, so a buy-borrow-die retiree in Raleigh keeps most of the portfolio\'s income and passes it on free of state tax, with full access to US brokers and securities-based lending. The Research Triangle adds two of the best academic medical centres in the South (Duke and UNC), mild winters, a growing newcomer population and costs well below the Northeast. Summers are hot and humid, the city is car-dependent, and flights abroad are limited.',
  scores: { cost: 2, healthcare: 5, safety: 3, visa: 5, climate: 4, community: 4, tax: 5, estate: 5, lending: 5 },
  facts: {
    healthcare:
      'WakeMed (a Level 1 trauma centre) and UNC Rex serve Raleigh itself, and Duke University Hospital in Durham and UNC Medical Center in Chapel Hill, each with an NCI-designated comprehensive cancer centre, are about 25–30 miles away; Medicare applies from 65.',
    safety:
      'The US is 134th of 163 in the 2026 Global Peace Index; Raleigh recorded 28 homicides in 2025 (about 5 per 100,000), against 27 in 2024 and a peak of 49 in 2022, and is among the safer large cities in the South; property crime is the everyday concern.',
    visa: 'No visa needed: a US citizen can live there without any residency process.',
    tax: 'North Carolina taxes dividends, interest and realised gains at a flat 3.99% (2026, down from 4.25% in 2025); S.B. 257 (July 2026) cuts it to 3.49% for 2027–2029, 3.24% for 2030–2032 and 2.99% from 2033; Social Security is exempt, and there is no city income tax.',
    estate:
      'No state estate or inheritance tax: North Carolina repealed its inheritance tax in 1999 and its estate tax for deaths from 1 January 2013, so heirs owe only the federal estate tax above the $15M exemption (2026).',
    lending:
      'Full US broker access: every major broker (Schwab, Fidelity, IBKR and others) offers margin and securities-based lines to North Carolina residents.',
    climate:
      'Mild winters with highs around 50 °F (10 °C) and a few inches of snow in some years, hot and humid summers with highs around 90 °F (32 °C), and long springs and autumns; hurricane remnants bring heavy rain and wind some years.',
    community:
      'One of the fastest-growing metros in the US, drawing newcomers from the Northeast, the Midwest and California to its universities and tech jobs; retirees settle in Cary, Wake Forest, Apex and active-adult communities around the city.',
    access:
      'Raleigh-Durham (RDU) has nonstops to most large US cities, London Heathrow on American, Paris, Frankfurt, Reykjavik, Dublin on Aer Lingus (since April 2026), Toronto on Air Canada and Cancún; Charlotte\'s hub is about 2.5 hours away by car or Amtrak.',
  },
  drawbacks: [
    'Car-dependent suburbs and little public transit',
    'Hot, humid summers and the odd hurricane remnant',
    'Few nonstop flights abroad; property tax of about 0.91% of assessed value inside the city (FY2027: Wake County 53.71 cents plus the city\'s 37.2 cents per $100)',
  ],
  sources: [
    { name: 'NC Department of Revenue: tax rate schedules', url: 'https://www.ncdor.gov/taxes-forms/tax-rate-schedules', edition: '2026' },
    {
      name: 'EY Tax News: North Carolina law progressively lowers personal income tax rate',
      url: 'https://taxnews.ey.com/news/2026-1630-north-carolina-law-progressively-lowers-personal-income-tax-rate-over-several-years',
      edition: '2026',
    },
    {
      name: 'NC General Assembly: Chapter 105, Article 1A (estate tax repealed from 1 January 2013)',
      url: 'https://house.ncleg.gov/EnactedLegislation/Statutes/HTML/ByArticle/Chapter_105/Article_1A.html',
    },
    {
      name: 'Axios Raleigh: the Triangle continues to see homicides fall from the pandemic peak',
      url: 'https://www.axios.com/local/raleigh/2026/02/17/raleigh-durham-homicides-below-pandemic-peak',
      edition: '2026',
    },
    {
      name: 'Wake County: commissioners adopt $2.28 billion FY2027 budget (53.71-cent tax rate)',
      url: 'https://www.wake.gov/news/wake-county-commissioners-adopt-228-billion-fiscal-year-2027-budget',
      edition: '2026',
    },
    {
      name: 'ABC11: homeowners pay more as Raleigh and Durham County pass 2027 budgets (Raleigh 37.2 cents)',
      url: 'https://abc11.com/post/nc-affordability-homeowners-pay-more-raleigh-durham-county-pass-2027-budgets/19260552/',
      edition: '2026',
    },
    {
      name: 'ABC11: Aer Lingus launches nonstop service from RDU to Dublin',
      url: 'https://abc11.com/post/nonstop-flight-nc-aer-lingus-launches-service-dublin-raleigh-durham-international-airport/18880717/',
      edition: '2026',
    },
    {
      name: 'Spokesman-Review: US falls again in global peace rankings',
      url: 'https://www.spokesman.com/stories/2026/jun/11/us-falls-again-in-global-peace-rankings-while-icel/',
      edition: '2026',
    },
  ],
}

export default profile
