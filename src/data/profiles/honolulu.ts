import type { ExpatProfile } from '../expatPicks'

const profile: ExpatProfile = {
  tagline: 'Warm all year and safe for a US city, at the highest prices in the country',
  summary:
    'Honolulu gives a buy-borrow-die retiree warm trade-wind weather all year, low violent crime for a US city, a large and settled retiree population and a gateway to Asia and the Pacific, with full access to US brokers and securities-based lending. The bills are high: Hawaii taxes dividends and interest at up to 11% (13% on the highest incomes from 2027), caps long-term gains at 7.25%, and has an estate tax from $5.49M. Living costs are the highest of any US state, and the mainland is a five-hour flight away.',
  scores: { cost: 1, healthcare: 4, safety: 4, visa: 5, climate: 5, community: 4, tax: 4, estate: 4, lending: 5 },
  facts: {
    healthcare:
      'The Queen\'s Medical Center is Hawaii\'s only Level 1 trauma centre, with Hawaii Pacific Health, Kaiser and Tripler Army Medical Center (for veterans and military retirees) also in town and the University of Hawaii Cancer Center NCI-designated; some specialist care still means a flight to the mainland, and Medicare applies from 65.',
    safety:
      'The US is 134th of 163 in the 2026 Global Peace Index; violent crime in Honolulu is low for a US city, Oahu\'s reported crime fell 16.6% in 2025 and statewide murders fell 24%, while car break-ins, property theft and homelessness are the everyday concerns.',
    visa: 'No visa needed: a US citizen can live there without any residency process.',
    tax: 'Hawaii taxes dividends and interest as ordinary income at 1.4% to 11% (2026), with a new 13% bracket on the highest incomes from 2027 (Act 24, 2026: above $500,000 of taxable income single or $1M joint); long-term capital gains are taxed at no more than 7.25% (an alternative rate in the income tax law); there is no city income tax, and Social Security and most employer pensions are exempt.',
    estate:
      'Hawaii estate tax: a $5.49M exclusion (fixed since 2018), then 10% rising to 20% on the largest estates; no inheritance tax; heirs also face the federal estate tax above the $15M exemption (2026); a 2026 bill to cut the exclusion to $3M was not enacted.',
    lending:
      'Full US broker access: every major broker (Schwab, Fidelity, IBKR and others) offers margin and securities-based lines to Hawaii residents.',
    climate:
      'Warm all year, with highs of about 80–89 °F (27–32 °C) and cooling trade winds; summers are humid, the wet season runs roughly November to March, and hurricanes are rare but possible; the 2023 Lahaina fire on Maui showed the islands\' wildfire risk.',
    community:
      'Hawaii has one of the oldest populations in the US, and Honolulu has a large, settled retiree community, many of them military retirees and long-time residents, alongside mainland newcomers in Kailua, Hawaii Kai and Waikiki.',
    access:
      'Daniel K. Inouye International (HNL) has nonstops to most West Coast cities (about five to six hours), several eastern hubs, Japan, Korea, Australia, New Zealand and the South Pacific; the Skyline driverless rail line reached the airport in October 2025.',
  },
  drawbacks: [
    'The highest cost of living of any US state, with food, fuel and housing all shipped-in dear',
    'Long flights to the mainland and to family elsewhere',
    'Hawaii income tax up to 11% (13% from 2027) and an estate tax from $5.49M',
  ],
  sources: [
    { name: 'Hawaii Department of Taxation: Form M-6 instructions (estate tax)', url: 'https://files.hawaii.gov/tax/forms/current/m6ins.pdf', edition: '2025' },
    { name: 'Hawaii Department of Taxation: 2025 Form M-6', url: 'https://files.hawaii.gov/tax/forms/2025/m6_i.pdf', edition: '2025' },
    { name: 'Tax Foundation: Hawaii', url: 'https://taxfoundation.org/state/hawaii/' },
    {
      name: 'Hawaii Legislature: SB 3125 CD1 (2026), the 13% bracket enacted as Act 24',
      url: 'https://data.capitol.hawaii.gov/sessions/session2026/bills/SB3125_CD1_.HTM',
      edition: '2026',
    },
    {
      name: 'Hawaii Revised Statutes §235-51 (income tax rates and the 7.25% capital-gains alternative rate)',
      url: 'https://data.capitol.hawaii.gov/hrscurrent/Vol04_Ch0201-0257/HRS0235/HRS_0235-0051.htm',
    },
    { name: 'EY Tax News: Hawaii enacts 13% personal income tax rate (Act 24)', url: 'https://taxnews.ey.com/news/2026-1440', edition: '2026' },
    { name: 'Hawaii Legislature: HB 2148 (2026), estate tax exclusion bill', url: 'https://data.capitol.hawaii.gov/sessions/session2026/bills/HB2148_.HTM', edition: '2026' },
    {
      name: 'Hawaii News Now: Hawaii crime rate drops in 2025',
      url: 'https://www.hawaiinewsnow.com/2026/09/15/hawaii-crime-rate-drops-2025-new-state-data-shows/',
      edition: '2026',
    },
    { name: 'Honolulu Authority for Rapid Transportation: Lelepaua station', url: 'https://honolulutransit.org/lelepaua/' },
    {
      name: 'Spokesman-Review: US falls again in global peace rankings',
      url: 'https://www.spokesman.com/stories/2026/jun/11/us-falls-again-in-global-peace-rankings-while-icel/',
      edition: '2026',
    },
  ],
}

export default profile
