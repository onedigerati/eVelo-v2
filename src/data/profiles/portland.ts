import type { ExpatProfile } from '../expatPicks'

const profile: ExpatProfile = {
  tagline: 'Green, walkable and no sales tax, but with some of the highest income and estate taxes in the US',
  summary:
    'Portland offers a buy-borrow-die retiree a green, walkable city with OHSU\'s academic hospital, no sales tax, the Columbia Gorge, Mount Hood and the coast within reach, and prices below Seattle and California, with full access to US brokers and securities-based lending. It is a costly base for the portfolio, though: Oregon taxes dividends, interest and gains at up to 9.9%, Portland-area taxes add up to 4% more, and Oregon\'s estate tax starts at just $1M. Living on borrowing keeps the income tax low, but the estate tax still reaches most portfolios worth planning for.',
  scores: { cost: 2, healthcare: 5, safety: 3, visa: 5, climate: 3, community: 3, tax: 4, estate: 4, lending: 5 },
  facts: {
    healthcare:
      'OHSU, the state\'s academic medical centre, has a Level 1 trauma centre and the Knight Cancer Institute (NCI-designated comprehensive); Legacy Emanuel is the second Level 1 centre, with Providence and Kaiser networks across the metro; Medicare applies from 65, though some practices have long waits for new patients.',
    safety:
      'The US is 134th of 163 in the 2026 Global Peace Index; Portland recorded about 51 homicides in 2025, down from 68, and shootings fell 30% to a six-year low, but at about 8 per 100,000 the homicide rate is still above Seattle\'s or San Francisco\'s, and property crime and homelessness are visible concerns.',
    visa: 'No visa needed: a US citizen can live there without any residency process.',
    tax: 'Oregon taxes dividends, interest and realised gains as ordinary income at 4.75% to 9.9% (9.9% above $125,000 single or $250,000 joint); Portland residents also pay Metro\'s 1% supportive-housing tax above $128,000 single or $205,000 joint (2026) and Multnomah County\'s Preschool for All tax of 1.5% above $125,000 single or $200,000 joint and 3% above $250,000 or $400,000 (rising by 0.8 points in 2028), so up to 13.9% in all, plus a $35 arts tax.',
    estate:
      'Oregon estate tax: a $1M exemption (not indexed for inflation), then 10% rising to 16% above $9.5M, paid by the estate; no inheritance tax; heirs also face the federal estate tax above the $15M exemption (2026).',
    lending:
      'Full US broker access: every major broker (Schwab, Fidelity, IBKR and others) offers margin and securities-based lines to Oregon residents.',
    climate:
      'Mild but grey and wet from October to May, with occasional ice storms (January 2024); summers are dry and warm, but the June 2021 heat dome hit 116 °F (47 °C) and wildfire smoke has brought days of hazardous air, worst in September 2020.',
    community:
      'A mid-sized, outdoorsy city that has drawn many newcomers from California; retirees are a modest share in the city itself, with more in suburbs such as Lake Oswego and in the Willamette Valley.',
    access:
      'Portland International (PDX), rebuilt with a new main terminal in 2024, has nonstops to most large US cities and 11 international destinations (2026), mostly Mexico and Canada, plus London Heathrow (British Airways), Amsterdam (KLM) and seasonal Frankfurt (Condor) and Reykjavik (Icelandair); Aeromexico\'s daily Mexico City flight returns on 21 January 2027.',
  },
  drawbacks: [
    'Combined state and local income tax up to about 13.9%, and an estate tax from just $1M',
    'Long grey, wet winters and late-summer wildfire smoke',
    'Visible homelessness and property crime downtown',
  ],
  sources: [
    { name: 'Oregon DOR: personal income tax', url: 'https://www.oregon.gov/dor/programs/individuals/Pages/PIT.aspx' },
    { name: 'Oregon DOR: estate transfer and fiduciary income taxes', url: 'https://www.oregon.gov/dor/programs/businesses/pages/estate.aspx' },
    { name: 'Oregon DOR: 2026 Form OR-706 instructions', url: 'https://www.oregon.gov/dor/forms/FormsPubs/form-or-706-inst_104-001-1_2026.pdf', edition: '2026' },
    { name: 'City of Portland Revenue Division: personal income taxes (Metro SHS and Preschool for All)', url: 'https://www.portland.gov/revenue/personal-tax' },
    {
      name: 'KOIN: Portland sees decline in violent crime and homicides in 2025',
      url: 'https://digital-release.koin.com/news/portland/portland-sees-decline-in-violent-crime-homicides-2025-national-report-says',
      edition: '2026',
    },
    { name: 'KPTV: Portland saw 30% drop in shootings in 2025', url: 'https://www.kptv.com/2025/12/31/portland-sees-30-drop-shootings-lowest-6-years/', edition: '2025' },
    { name: 'Portland Monthly: all the nonstop destinations from PDX', url: 'https://www.pdxmonthly.com/travel-and-outdoors/nonstop-direct-flights-from-pdx-portland-airport', edition: '2026' },
    { name: 'KPTV: PDX to resume daily nonstop flights to Mexico City', url: 'https://www.kptv.com/2026/10/28/pdx-resume-daily-nonstop-flights-mexico-city/', edition: '2026' },
    {
      name: 'Spokesman-Review: US falls again in global peace rankings',
      url: 'https://www.spokesman.com/stories/2026/jun/11/us-falls-again-in-global-peace-rankings-while-icel/',
      edition: '2026',
    },
  ],
}

export default profile
