import type { ExpatProfile } from '../expatPicks'

const profile: ExpatProfile = {
  tagline: 'A low flat tax, no estate tax and a hub airport, in the mild Carolina Piedmont',
  summary:
    'North Carolina taxes dividends, interest and gains at a flat 3.99% (2026), falling to 3.49% in 2027, and has had no estate or inheritance tax since 2013, so a buy-borrow-die retiree in Charlotte keeps most of the portfolio\'s income and passes it on free of state tax, with full access to US brokers and securities-based lending. Charlotte adds American Airlines\' second-largest hub, large hospital systems, mild winters and costs well below the Northeast. It is car-dependent and sprawling, with hot, humid summers.',
  scores: { cost: 2, healthcare: 4, safety: 3, visa: 5, climate: 4, community: 4, tax: 5, estate: 5, lending: 5 },
  facts: {
    healthcare:
      'Atrium Health\'s Carolinas Medical Center (a Level 1 trauma centre and teaching hospital, with the Levine Cancer Institute) and Novant Health\'s Presbyterian Medical Center anchor two large systems; for the most specialised care many patients go to Duke or UNC, about 2.5 hours away; Medicare applies from 65.',
    safety:
      'The US is 134th of 163 in the 2026 Global Peace Index; Charlotte-Mecklenburg police counted 96 homicides in 2025, down from 110 (about 10 per 100,000), with violent crime down 21%, but the light-rail stabbing in August 2025 and car break-ins shape how safe residents feel.',
    visa: 'No visa needed: a US citizen can live there without any residency process.',
    tax: 'North Carolina taxes dividends, interest and realised gains at a flat 3.99% (2026, down from 4.25% in 2025); S.B. 257 (July 2026) cuts it to 3.49% for 2027–2029, 3.24% for 2030–2032 and 2.99% from 2033; Social Security is exempt, and there is no city income tax.',
    estate:
      'No state estate or inheritance tax: North Carolina repealed its inheritance tax in 1999 and its estate tax for deaths from 1 January 2013, so heirs owe only the federal estate tax above the $15M exemption (2026).',
    lending:
      'Full US broker access: every major broker (Schwab, Fidelity, IBKR and others) offers margin and securities-based lines to North Carolina residents, and Charlotte is home to Bank of America and large Wells Fargo and Truist operations.',
    climate:
      'Mild winters with highs around 50 °F (10 °C) and little snow, hot and humid summers with highs around 90 °F (32 °C), and long springs and autumns; hurricane remnants bring heavy rain and wind some years, as Helene did in September 2024.',
    community:
      'One of the fastest-growing large US cities, full of newcomers from the Northeast and Midwest; retirees settle around Lake Norman, Lake Wylie and in active-adult communities in the surrounding counties.',
    access:
      'Charlotte Douglas (CLT) is American Airlines\' second-largest hub, with nonstops to most US cities, the Caribbean and Mexico, and to London, Frankfurt, Munich, Dublin and other European cities.',
  },
  drawbacks: [
    'Car-dependent sprawl, with limited transit beyond one light-rail line',
    'Hot, humid summers and the odd hurricane remnant',
    'Property tax of about 0.79% of assessed value inside the city (FY2027: Mecklenburg County 49.27 cents plus the city\'s 29.3 cents per $100), and housing costs rising fast',
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
      name: 'CMPD: end-of-year report, violent, property and overall crime decrease',
      url: 'https://www.charlottenc.gov/cmpd/News-Information/Newsroom/CMPD-End-of-Year-Report-2025',
      edition: '2026',
    },
    { name: 'Mecklenburg County: tax rates', url: 'https://tax.mecknc.gov/tax-rates' },
    {
      name: 'City of Charlotte: City adopts Fiscal Year 2027 budget (29.3-cent tax rate)',
      url: 'https://www.charlottenc.gov/City-News/City-of-Charlotte-Adopts-Fiscal-Year-2027-Budget',
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
