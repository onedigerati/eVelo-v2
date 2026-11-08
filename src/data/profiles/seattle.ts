import type { ExpatProfile } from '../expatPicks'

const profile: ExpatProfile = {
  tagline: 'No tax on dividends today, a capital-gains tax and a state estate tax, by Puget Sound',
  summary:
    'Washington has no personal income tax on wages, dividends or interest, so a buy-borrow-die retiree in Seattle who lives on borrowing pays the state little on the portfolio; the 7% (9.9% above $1M) capital-gains tax bites only when gains are realised. Seattle adds top-tier hospitals, water and mountains everywhere, and a Delta and Alaska hub with nonstops to Asia and Europe. The catches are Washington\'s estate tax from $3M, a new 9.9% tax on household income over $1M from 2028, high costs and long grey winters.',
  scores: { cost: 1, healthcare: 5, safety: 3, visa: 5, climate: 3, community: 3, tax: 4, estate: 4, lending: 5 },
  facts: {
    healthcare:
      'UW Medicine (UW Medical Center and Harborview, the only Level 1 adult trauma centre for Washington, Alaska, Montana and Idaho), Fred Hutch\'s comprehensive cancer centre, Virginia Mason and Swedish make Seattle one of the strongest medical cities in the US; Medicare applies from 65.',
    safety:
      'The US is 134th of 163 in the 2026 Global Peace Index; Seattle recorded 37 homicides in 2025, down 36% and the fewest since before the pandemic, but property crime, car prowls and visible homelessness downtown remain the everyday concerns.',
    visa: 'No visa needed: a US citizen can live there without any residency process.',
    tax: 'No state tax on dividends or interest: Washington has no personal income tax today; it taxes realised long-term capital gains at 7% above an annual standard deduction ($278,000 in 2025) and 9.9% on taxable gains above $1M (from 2025); a new 9.9% tax on household income above $1M (SB 6346, signed March 2026) starts in 2028, and voters rejected a repeal (I-645) on 3 November 2026, though a court challenge (Petter v. Washington) is pending; there is no city income tax.',
    estate:
      'Washington estate tax: $3M exemption, frozen and no longer indexed, at 10% to 20% for deaths from 1 July 2026 (rolled back from the 35% top rate of 2025–26 by SB 6347); no inheritance tax; heirs also face the federal estate tax above the $15M exemption (2026).',
    lending:
      'Full US broker access: every major broker (Schwab, Fidelity, IBKR and others) offers margin and securities-based lines to Washington residents.',
    climate:
      'Mild temperatures but long grey, drizzly months from October to April, with only about 8.5 hours of daylight in December; summers are dry and pleasant, but wildfire smoke now brings a week or more of unhealthy air in many Augusts and Septembers, and the 2021 heat dome reached 108 °F (42 °C).',
    community:
      'A tech-driven city that skews young; retirees are a modest share and many settle in suburbs, on the islands or around the Sound, where newcomers from California and elsewhere have arrived in numbers.',
    access:
      'Seattle-Tacoma (SEA) is a hub for Alaska Airlines and Delta, with nonstops across the US and about 36 international destinations, including Tokyo, Seoul, Taipei, Hong Kong, London, Paris, Amsterdam, Reykjavik and Rome, and short hops to Vancouver and Alaska.',
  },
  drawbacks: [
    'Housing and living costs among the highest in the US, plus a combined sales tax of about 10.35%',
    'Washington estate tax from $3M, and a 9.9% tax on household income over $1M from 2028',
    'Long grey winters and summer wildfire smoke',
  ],
  sources: [
    { name: 'Washington DOR: capital gains tax', url: 'https://dor.wa.gov/taxes-rates/other-taxes/capital-gains-tax' },
    {
      name: 'Washington DOR: new tiered rates for Washington\'s capital gains tax',
      url: 'https://dor.wa.gov/forms-publications/publications-subject/special-notices/new-tiered-rates-washingtons-capital-gains-tax',
      edition: '2025',
    },
    { name: 'Washington DOR: estate tax tables', url: 'https://dor.wa.gov/taxes-rates/other-taxes/estate-tax-tables', edition: '2026' },
    {
      name: 'K&L Gates: Washington Legislature adopts income tax and changes to estate tax',
      url: 'https://www.klgates.com/Washington-Legislature-Adopts-Income-Tax-and-Changes-to-Estate-Tax-3-20-2026',
      edition: '2026',
    },
    {
      name: 'MyNorthwest: Washington voters reject millionaires\' tax repeal as I-645 fails',
      url: 'https://mynorthwest.com/mynorthwest-politics/millionaires-tax-i-645-2/4286467',
      edition: '2026',
    },
    {
      name: 'Port of Seattle: SEA welcomes Alaska Airlines\' new services to London and Reykjavik in 2026',
      url: 'https://www.portseattle.org/news/sea-airport-welcomes-alaska-airlines-new-services-london-reykjavik-2026',
    },
    { name: 'Axios Seattle: Ferguson signs Washington income tax targeting millionaires', url: 'https://www.axios.com/local/seattle/2026/03/30/bob-ferguson-washington-income-tax-millionaires-2028-law', edition: '2026' },
    { name: 'SPD Blotter: 2025 SPD year in review', url: 'https://spdblotter.seattle.gov/2026/02/02/2025-spd-year-in-review/', edition: '2026' },
    {
      name: 'Axios Seattle: air quality predicted to worsen due to wildfire smoke',
      url: 'https://www.axios.com/local/seattle/2024/02/16/air-quality-decline-wildfire-smoke',
      edition: '2024',
    },
    {
      name: 'Spokesman-Review: US falls again in global peace rankings',
      url: 'https://www.spokesman.com/stories/2026/jun/11/us-falls-again-in-global-peace-rankings-while-icel/',
      edition: '2026',
    },
  ],
}

export default profile
