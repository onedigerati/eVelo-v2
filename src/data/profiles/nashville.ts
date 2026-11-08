import type { ExpatProfile } from '../expatPicks'

const profile: ExpatProfile = {
  tagline: 'No state income or estate tax, with Vanderbilt\'s hospitals and a music city\'s buzz',
  summary:
    'Tennessee taxes neither wages nor investment income since the Hall tax on dividends and interest ended in 2021, and has no estate or inheritance tax, so a buy-borrow-die retiree based in Nashville pays nothing to the state on dividends, gains or the estate, and keeps full access to US brokers and securities-based lending. Nashville adds Vanderbilt\'s Level 1 trauma and NCI comprehensive cancer centre, a fast-growing airport and the music scene. The costs come back as a high sales tax, fast-rising housing, traffic and a spring season of severe storms and tornadoes.',
  scores: { cost: 2, healthcare: 5, safety: 3, visa: 5, climate: 3, community: 4, tax: 5, estate: 5, lending: 5 },
  facts: {
    healthcare:
      'Vanderbilt University Medical Center (Level 1 trauma, with the NCI-designated comprehensive Vanderbilt-Ingram Cancer Center) leads, alongside HCA\'s TriStar hospitals (HCA is based in Nashville) and Ascension Saint Thomas; Medicare applies from 65.',
    safety:
      'The US is 134th of 163 in the 2026 Global Peace Index; Nashville recorded 74 homicides in 2025, down about 27% from 103 in 2024 and the fewest since 2014 (about 10 per 100,000), and car break-ins downtown are the everyday concern.',
    visa: 'No visa needed: a US citizen can live there without any residency process.',
    tax: 'No state income tax on dividends, interest or realised gains: the Hall income tax on investment income was phased down from 6% and repealed for tax periods from 1 January 2021, and Tennessee has never taxed wages; there is no city income tax, though the combined sales tax in Nashville is 9.75% (since February 2025, after the transit referendum).',
    estate:
      'No state estate or inheritance tax: Tennessee\'s inheritance tax is not imposed on deaths after 31 December 2015, so heirs owe only the federal estate tax above the $15M exemption (2026).',
    lending:
      'Full US broker access: every major broker (Schwab, Fidelity, IBKR and others) offers margin and securities-based lines to Tennessee residents.',
    climate:
      'Four seasons: mild winters with highs around 49 °F (9 °C) and occasional ice storms, hot, humid summers with highs near 90 °F (32 °C), and a spring and late-autumn severe-weather season; tornadoes struck the city in March 2020 and December 2023.',
    community:
      'One of the fastest-growing US metros, with many newcomers from California, the Northeast and the Midwest; retirees settle in Franklin, Brentwood, Hendersonville and the lake towns around the city.',
    access:
      'Nashville International (BNA), a Southwest focus city with a newly expanded terminal, has 115 nonstop destinations (June 2026), including daily British Airways flights to London Heathrow, Aer Lingus to Dublin (about five a week in summer), Porter to Toronto, and Mexico and the Caribbean.',
  },
  drawbacks: [
    'Fast-rising housing costs and a 9.75% sales tax',
    'Traffic and limited public transport',
    'Severe storms and tornadoes in spring',
  ],
  sources: [
    { name: 'Tennessee Department of Revenue: Hall income tax (repealed from 2021)', url: 'https://www.tn.gov/revenue/taxes/hall-income-tax.html' },
    { name: 'Tennessee Department of Revenue: inheritance tax', url: 'https://www.tn.gov/revenue/taxes/inheritance-tax.html' },
    {
      name: 'Nashville District Attorney: in 2025, Nashville crime rates continued to drop',
      url: 'https://da.nashville.gov/in-2025-nashville-crime-rates-continued-to-drop/',
      edition: '2026',
    },
    {
      name: 'WSMV: Nashville police report drop in major crime in 2025',
      url: 'https://www.wsmv.com/2026/01/08/nashville-police-reports-drop-major-crime-2025/',
      edition: '2026',
    },
    {
      name: 'Adams and Reese (via Legal 500): Nashville sales tax increase in 2025 (9.75% from 1 February 2025)',
      url: 'https://www.legal500.com/intelligence/united-states/tax/nashville-sales-tax-increase-in-2025',
      edition: '2025',
    },
    {
      name: 'Parking.net: Nashville airports report infrastructure progress in FY26 (115 nonstop destinations)',
      url: 'https://www.parking.net/parking-news/nashville-airports-report-infrastructure-progress-in-fy26',
      edition: '2026',
    },
    {
      name: 'AeroRoutes: British Airways 3Q26 Nashville aircraft changes (daily LHR–BNA)',
      url: 'https://www.aeroroutes.com/eng/260113-ba3q26bna',
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
