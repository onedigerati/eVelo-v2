import type { ExpatProfile } from '../expatPicks'

const profile: ExpatProfile = {
  tagline: 'Big-city hospitals and culture at a lower price, with a city tax on dividends',
  summary:
    'Philadelphia gives a buy-borrow-die retiree top-tier hospitals, a walkable historic core, a large food and arts scene and Amtrak to New York and Washington, for much less than either, with full access to US brokers and securities-based lending. Pennsylvania\'s flat 3.07% income tax is low and leaves retirement income alone, but the city\'s School Income Tax adds 3.735% on dividends and short-term gains, and Pennsylvania\'s 4.5% inheritance tax reaches what children inherit. Gun violence, though at a 60-year low, is still high for a US city.',
  scores: { cost: 2, healthcare: 5, safety: 2, visa: 5, climate: 3, community: 4, tax: 4, estate: 4, lending: 5 },
  facts: {
    healthcare:
      'Penn Medicine (the Hospital of the University of Pennsylvania and its Abramson Cancer Center), Jefferson, Temple and the Fox Chase Cancer Center make Philadelphia one of the strongest medical cities in the US; Medicare applies from 65.',
    safety:
      'The US is 134th of 163 in the 2026 Global Peace Index; Philadelphia recorded 222 homicides in 2025, the fewest since 1966 and down from 562 in 2021, but that is still about 14 per 100,000, and violence is concentrated in parts of North, West and Southwest Philadelphia.',
    visa: 'No visa needed: a US citizen can live there without any residency process.',
    tax: 'Pennsylvania taxes interest, dividends and net gains at a flat 3.07% (retirement income and Social Security are exempt); Philadelphia adds its School Income Tax of 3.735% (2026) on residents\' dividends, short-term gains (assets held less than six months) and some interest, but not bank interest or long-term gains, so dividends pay about 6.8% in all; the city\'s wage tax does not reach investment income.',
    estate:
      'Pennsylvania inheritance tax: 4.5% on what children and other lineal heirs inherit, 12% for siblings and 15% for others, 0% for a spouse, with a 5% discount for paying within three months; no separate estate tax; heirs also face the federal estate tax above the $15M exemption (2026).',
    lending:
      'Full US broker access: every major broker (Schwab, Fidelity, IBKR and others) offers margin and securities-based lines to Pennsylvania residents.',
    climate:
      'Humid summers with highs in the upper 80s °F (about 31 °C) and heat waves, cold but short winters around freezing with about 23 inches (58 cm) of snow in a typical year, and long, mild springs and autumns.',
    community:
      'A large, old city of neighbourhoods with many newcomers priced out of New York and Washington; Center City, Old City and the Main Line suburbs have well-established retiree communities.',
    access:
      'Philadelphia International (PHL) is an American Airlines hub with nonstops across the US and to London, Dublin, Paris, Rome and other European cities, and Amtrak reaches New York in about 75 minutes and Washington in under two hours.',
  },
  drawbacks: [
    'The School Income Tax adds 3.735% on dividends and short-term gains to Pennsylvania\'s 3.07%',
    'Pennsylvania\'s 4.5% inheritance tax on what children inherit, with no exemption amount',
    'Gun violence still high in parts of the city despite the steep fall since 2021; property tax is 1.3998% of assessed value, less a $100,000 homestead exemption',
  ],
  sources: [
    {
      name: 'Pennsylvania Department of Revenue: personal income tax',
      url: 'https://www.pa.gov/en/agencies/revenue/resources/tax-types-and-information/personal-income-tax.html',
    },
    {
      name: 'Pennsylvania Department of Revenue: inheritance tax',
      url: 'https://www.pa.gov/en/agencies/revenue/resources/tax-types-and-information/inheritance-tax.html',
    },
    { name: 'City of Philadelphia: School Income Tax', url: 'https://phila.gov/services/payments-assistance-taxes/taxes/income-taxes/school-income-tax/' },
    {
      name: 'City of Philadelphia: 2026 tax rate changes (Wage and School Income Tax 3.735%)',
      url: 'https://www.phila.gov/2026-06-11-what-you-need-to-know-about-changes-to-phillys-use-and-occupancy-tax/',
      edition: '2026',
    },
    {
      name: 'City of Philadelphia: unearned income is subject to the School Income Tax',
      url: 'https://www.phila.gov/2024-05-06-unearned-income-in-philly-is-subject-to-the-school-income-tax/',
      edition: '2024',
    },
    {
      name: 'City of Philadelphia: own a home in Philly? Homestead exemption',
      url: 'https://www.phila.gov/2026-06-22-own-a-home-in-philly-make-sure-youre-getting-this-property-tax-benefit/',
      edition: '2026',
    },
    {
      name: 'Pew: Philadelphia\'s homicides at historic lows',
      url: 'https://www.pew.org/en/research-and-analysis/articles/2025/12/15/philadelphias-homicides-at-historic-lows',
      edition: '2025',
    },
    {
      name: 'Spokesman-Review: US falls again in global peace rankings',
      url: 'https://www.spokesman.com/stories/2026/jun/11/us-falls-again-in-global-peace-rankings-while-icel/',
      edition: '2026',
    },
  ],
}

export default profile
