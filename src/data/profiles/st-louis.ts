import type { ExpatProfile } from '../expatPicks'

const profile: ExpatProfile = {
  tagline: 'No state tax on capital gains, no estate tax and a top medical centre, at a low cost',
  summary:
    'Missouri stopped taxing individuals\' capital gains from 2025, taxes dividends and interest at no more than 4.7% and has no estate or inheritance tax, so a buy-borrow-die retiree based in St. Louis pays little to the state on the portfolio and nothing on the estate, with full access to US brokers and securities-based lending; the city\'s 1% earnings tax does not reach dividends, interest or pensions. St. Louis adds Barnes-Jewish and WashU\'s Siteman Cancer Center, free museums and a zoo in Forest Park, and some of the lowest housing costs of any big US metro. The costs are one of the highest homicide rates of any US city, hot summers and storms, and a thin international network.',
  scores: { cost: 2, healthcare: 5, safety: 2, visa: 5, climate: 3, community: 3, tax: 5, estate: 5, lending: 5 },
  facts: {
    healthcare:
      'Barnes-Jewish Hospital and Washington University School of Medicine (Level 1 trauma, with the NCI-designated comprehensive Siteman Cancer Center) lead, alongside SSM Health Saint Louis University Hospital (Level 1 trauma) and the Mercy and BJC suburban networks; Medicare applies from 65.',
    safety:
      'The US is 134th of 163 in the 2026 Global Peace Index; the City of St. Louis recorded 139 homicides in 2025, down 7% from 151 in 2024 and from 263 in 2020, but about 50 per 100,000 in a city of under 300,000, among the highest rates in the US; the violence is concentrated in north city, and the separate suburbs of St. Louis County, where most retirees live, are far safer.',
    visa: 'No visa needed: a US citizen can live there without any residency process.',
    tax: 'Missouri subtracts 100% of individuals\' capital gains from income from tax year 2025, and taxes dividends and interest at up to 4.7% (2025–2026); Social Security is exempt from 2024; the City of St. Louis\'s 1% earnings tax (renewed in April 2026) covers wages and business profits, not dividends, interest, pensions or Social Security, and suburbs in St. Louis County have none.',
    estate:
      'No state estate or inheritance tax: Missouri\'s estate tax was tied to the federal state death tax credit and is not imposed on deaths from 1 January 2005, so heirs owe only the federal estate tax above the $15M exemption (2026).',
    lending:
      'Full US broker access: every major broker (Schwab, Fidelity, IBKR and others) offers margin and securities-based lines to Missouri residents; Edward Jones and Stifel are based in the St. Louis area.',
    climate:
      'Continental: hot, humid summers with highs near 90 °F (32 °C), cold winters with highs around 40 °F (4 °C) and some snow and ice, and a spring severe-storm season; an EF3 tornado tore through north St. Louis on 16 May 2025, killing four people (a fifth died in the storm\'s winds) and damaging about 5,000 buildings.',
    community:
      'An affordable metro whose newcomers are mostly regional; retirees settle in suburbs such as Kirkwood, Webster Groves, Clayton and St. Charles, with free entry to the art museum, zoo, history and science museums in Forest Park.',
    access:
      'St. Louis Lambert (STL), a large Southwest base, has nonstops to most big US cities; abroad, Lufthansa flies to Frankfurt (three a week, five from June to October 2026) and British Airways began London Heathrow flights in April 2026 (four a week in summer), plus Toronto, Mexico and the Caribbean.',
  },
  drawbacks: [
    'One of the highest homicide rates of any US city, concentrated in north city',
    'Hot, humid summers and severe storms',
    'A thin international flight network',
  ],
  sources: [
    {
      name: 'Missouri Department of Revenue: 2025 individual income tax year changes (rates, capital gains subtraction)',
      url: 'https://dor.mo.gov/taxation/individual/tax-types/income/year-changes/',
    },
    {
      name: 'Missouri Department of Revenue: capital gains deduction and 2025 top rate (news release)',
      url: 'https://dor.mo.gov/news/newsitem/uuid/15044650-59dd-48f4-975a-01988d485255',
      edition: '2025',
    },
    { name: 'Missouri Department of Revenue: estate tax filings no longer required', url: 'https://dor.mo.gov/taxation/individual/tax-types/estate.html' },
    {
      name: 'City of St. Louis Comptroller: the earnings tax (what it covers)',
      url: 'https://www.stlouis-mo.gov/government/departments/comptroller/news/earnings-tax-prop-e-april-5-ballot.cfm',
    },
    {
      name: 'EY Tax News: voters renew the St. Louis earnings tax for another five years',
      url: 'https://taxnews.ey.com/news/2026-0995-voters-renew-the-st-louis-missouri-earnings-tax-for-another-five-years',
      edition: '2026',
    },
    {
      name: 'St. Louis Public Radio: St. Louis homicides continued a downward trend in 2025',
      url: 'https://www.stlpr.org/law-order/2026-01-05/st-louis-homicides-continued-a-downward-trend-in-2025-dropping-7',
      edition: '2026',
    },
    {
      name: 'St. Louis Lambert: Lufthansa begins STL nonstop service five days a week',
      url: 'https://stlouis-mo.gov/government/departments/airport/news/lufthansa-nonstop.cfm',
      edition: '2026',
    },
    {
      name: 'St. Louis Lambert: British Airways\' new St. Louis route officially takes flight',
      url: 'https://stlouis-mo.gov/government/departments/airport/news/british-airways-new-route.cfm',
      edition: '2026',
    },
    {
      name: 'Wikipedia: 2025 St. Louis tornado (EF3, 16 May 2025)',
      url: 'https://en.wikipedia.org/wiki/2025_St._Louis_tornado',
    },
    {
      name: 'Spokesman-Review: US falls again in global peace rankings',
      url: 'https://www.spokesman.com/stories/2026/jun/11/us-falls-again-in-global-peace-rankings-while-icel/',
      edition: '2026',
    },
  ],
}

export default profile
