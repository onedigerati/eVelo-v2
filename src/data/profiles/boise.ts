import type { ExpatProfile } from '../expatPicks'

const profile: ExpatProfile = {
  tagline: 'A safe, fast-growing river city with no estate tax and a 5.3% income tax',
  summary:
    'Idaho has no estate or inheritance tax, so a buy-borrow-die retiree based in Boise leaves the portfolio to heirs untouched by the state, and keeps full access to US brokers and securities-based lending; the price is Idaho\'s flat 5.3% on dividends, interest and gains. Boise adds low crime, the Boise River Greenbelt and the foothills on the doorstep, and a large inflow of retirees. The trade-offs are thin specialist care (Idaho has no Level 1 trauma centre), a domestic-only airport and smoky late summers.',
  scores: { cost: 2, healthcare: 3, safety: 4, visa: 5, climate: 3, community: 4, tax: 4, estate: 5, lending: 5 },
  facts: {
    healthcare:
      'Saint Alphonsus Regional Medical Center (ACS-verified Level 2 trauma, the highest level in the Treasure Valley) and St. Luke\'s Boise (with St. Luke\'s Children\'s, a Level 2 paediatric trauma centre) are the main hospitals, but Idaho has no Level 1 trauma centre (the nearest is in Salt Lake City, about 340 miles away) and had the fewest specialists per capita of any state in 2025 KFF data; Medicare applies from 65.',
    safety:
      'The US is 134th of 163 in the 2026 Global Peace Index, but Boise is one of the safest US cities of its size: police report the combined violent and property crime rate at a 25-year low (2025), and FBI figures show 3 murders in 2024 (secondary source).',
    visa: 'No visa needed: a US citizen can live there without any residency process.',
    tax: 'Idaho taxes all income, dividends, interest and realised gains included, at a flat 5.3% above a small zero-rate band ($4,811 single, $9,622 married, 2025), unchanged for 2026; there is no city income tax.',
    estate:
      'No state estate or inheritance tax: Idaho\'s estate tax applied only to deaths through 2004 and its chapter was repealed in 2020, so heirs owe only the federal estate tax above the $15M exemption (2026).',
    lending:
      'Full US broker access: every major broker (Schwab, Fidelity, IBKR and others) offers margin and securities-based lines to Idaho residents.',
    climate:
      'Four dry seasons at 2,700 ft (820 m): hot summers in the 90s °F (32–37 °C) with some 100 °F days, cold winters with valley inversions, and wildfire smoke that can linger for weeks in late summer.',
    community:
      'One of the fastest-growing US metros, with many retirees from California and the Pacific Northwest settling in Boise, Meridian and Eagle; the city is conservative-leaning, with a lively downtown and university.',
    access:
      'Boise Airport (BOI) has domestic nonstops only, to about 27–30 cities on Alaska, Southwest, Delta, United, American and others; international trips connect through Salt Lake City, Seattle or Denver.',
  },
  drawbacks: [
    'No Level 1 trauma centre in Idaho and few specialists; serious cases may go to Salt Lake City',
    'Idaho\'s flat 5.3% tax on dividends, interest and gains',
    'Domestic-only airport and late-summer wildfire smoke',
  ],
  sources: [
    {
      name: 'Idaho State Tax Commission: individual income tax rate schedule',
      url: 'https://tax.idaho.gov/taxes/income-tax/individual-income/individual-income-tax-rate-schedule/',
    },
    {
      name: 'EY Tax News: Idaho issues revised income tax withholding tables (5.3% unchanged for 2026)',
      url: 'https://taxnews.ey.com/news/2026-1829-idaho-issues-revised-income-tax-withholding-tables-formula-for-immediate-use',
      edition: '2026',
    },
    { name: 'Idaho State Tax Commission: estates and taxes', url: 'https://tax.idaho.gov/taxes/estates-and-taxes' },
    {
      name: 'KBOI 2News: Saint Alphonsus in Boise reverified as Level II trauma center',
      url: 'https://idahonews.com/news/local/saint-alphonsus-in-boise-reverified-as-level-ii-trauma-center',
    },
    {
      name: "St. Luke's: six St. Luke's facilities earn trauma redesignation in 2025",
      url: 'https://stlukesonline.org/en/news/2025/six-st-lukes-facilities-earn-trauma-redesignation-in-2025/',
      edition: '2025',
    },
    {
      name: "Becker's Hospital Review: primary care and specialist physicians per capita by state",
      url: 'https://www.beckershospitalreview.com/quality/hospital-physician-relationships/primary-care-specialist-physicians-per-capita-by-state/',
      edition: '2025',
    },
    {
      name: 'City of Boise: police report to the community 2025',
      url: 'https://www.cityofboise.org/departments/police/about/report-to-the-community-2025/',
      edition: '2025',
    },
    { name: 'OpenCrime: crime rate in Boise (FBI data, 2024)', url: 'https://www.opencrime.us/crime-rate-in/boise', edition: '2024' },
    {
      name: 'Spokesman-Review: US falls again in global peace rankings',
      url: 'https://www.spokesman.com/stories/2026/jun/11/us-falls-again-in-global-peace-rankings-while-icel/',
      edition: '2026',
    },
    {
      name: 'Spokesman-Review: could Boise Airport go international?',
      url: 'https://www.spokesman.com/stories/2025/sep/26/could-boise-airport-go-international-boise-eyes-mo',
      edition: '2025',
    },
  ],
}

export default profile
