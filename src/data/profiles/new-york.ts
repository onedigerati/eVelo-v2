import type { ExpatProfile } from '../expatPicks'

const profile: ExpatProfile = {
  tagline: 'The deepest city in America, at the highest combined state and city tax',
  summary:
    'New York gives a buy-borrow-die retiree world-class hospitals, culture on every block, a car-free life and three airports with nonstops almost everywhere, plus full access to US brokers and securities-based lending. The price is the highest state-plus-city income tax in the US (up to about 14.8% on dividends, interest and gains), a state estate tax from $7.35M with a "cliff" that taxes the whole estate just above it, and some of the highest housing costs anywhere. It suits a retiree who will live mostly on borrowing, realise little and plan the estate around the cliff.',
  scores: { cost: 1, healthcare: 5, safety: 3, visa: 5, climate: 3, community: 5, tax: 4, estate: 4, lending: 5 },
  facts: {
    healthcare:
      'NewYork-Presbyterian (Columbia and Weill Cornell), NYU Langone, Mount Sinai, Memorial Sloan Kettering and the Hospital for Special Surgery put New York among the strongest medical cities in the world; Medicare applies from 65.',
    safety:
      'The US is 134th of 163 in the 2026 Global Peace Index; the NYPD counted 305 homicides in 2025, down about 20% (about 3.6 per 100,000, low for a large US city), and record-low shootings, but subway incidents, theft and uneven neighbourhoods are the everyday concerns.',
    visa: 'No visa needed: a US citizen can live there without any residency process.',
    tax: 'New York State taxes dividends, interest and realised gains as ordinary income at 3.9% to 10.9% (2026; 9.65% above $1,077,550 single, 10.3% above $5M, 10.9% above $25M), and New York City adds its resident income tax of 3.078% to 3.876% (3.876% above $50,000), so the top combined rate is about 14.8% and most large portfolios pay 10–13.5%; there is no lower rate for long-term gains.',
    estate:
      'New York estate tax: $7,350,000 basic exclusion for deaths in 2026, at up to 16%; the "cliff" removes the exclusion entirely once the taxable estate passes 105% of it ($7,717,500), so the whole estate is taxed from the first dollar; no portability between spouses and no inheritance tax; heirs also face the federal estate tax above the $15M exemption (2026).',
    lending:
      'Full US broker access: every major broker (Schwab, Fidelity, IBKR and others) offers margin and securities-based lines to New York residents.',
    climate:
      'Four distinct seasons: humid summers with highs in the mid-80s °F (about 29 °C) and heat waves, cold winters around freezing with about 30 inches (75 cm) of snow in a typical year, and long, pleasant springs and autumns; coastal storms such as Sandy (2012) flood low-lying areas.',
    community:
      'A city of about 8.5 million where newcomers are the norm; retirees have every interest, language and community within reach, and many split the year with Florida.',
    access:
      'JFK, Newark and LaGuardia together have nonstops to almost every large city in the world, and Amtrak runs fast trains to Boston, Philadelphia and Washington.',
  },
  drawbacks: [
    'The highest combined state and city income tax in the US, up to about 14.8% on dividends and gains',
    'New York estate tax from $7.35M, with a cliff that taxes the whole estate just above it',
    'Housing among the most expensive in the US, and co-op boards that often demand large cash reserves',
  ],
  sources: [
    {
      name: 'NY Department of Taxation and Finance: IT-201 instructions (state and NYC tax rate schedules)',
      url: 'https://www.tax.ny.gov/forms/html-instructions/2025/it/it201i-2025.htm',
      edition: '2025',
    },
    { name: 'NY Department of Taxation and Finance: withholding tax rate changes (2026)', url: 'https://www.tax.ny.gov/bus/wt/rate.htm', edition: '2026' },
    { name: 'NY Department of Taxation and Finance: estate tax', url: 'https://www.tax.ny.gov/pit/estate/etidx.htm', edition: '2026' },
    {
      name: 'NYSSCPA: navigating the 2026 New York State estate tax and the cliff',
      url: 'https://nysscpa.org/news/1050419-navigating-the-2026-new-york-state-estate-tax-planning-with-and-for-the-new-york-and-federal-estate-tax-exemptions-the-new-york-cliff-tax-and-other-estate-planning-strategies-2026-04-01',
      edition: '2026',
    },
    {
      name: 'Patch: NYC saw 20% drop in homicides in 2025, record-low shootings',
      url: 'https://patch.com/new-york/new-york-city/nyc-saw-20-drop-homicides-2025-record-low-shootings-victims-nypd',
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
