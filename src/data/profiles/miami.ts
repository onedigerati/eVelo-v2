import type { ExpatProfile } from '../expatPicks'

const profile: ExpatProfile = {
  tagline: 'No state income or estate tax, in the US capital of Latin America',
  summary:
    'Florida has no state income tax and no estate or inheritance tax, so a buy-borrow-die retiree based in Miami pays nothing to the state on dividends, gains or the estate, and keeps full access to US brokers and securities-based lending. Miami adds big academic hospitals, a subtropical winter, beaches and the main US airport for Latin America and the Caribbean. It is also the dearest city in Florida: housing, home insurance and flood risk cost far more than elsewhere in the state, and hurricanes are a real threat.',
  scores: { cost: 1, healthcare: 5, safety: 3, visa: 5, climate: 3, community: 4, tax: 5, estate: 5, lending: 5 },
  facts: {
    healthcare:
      'Jackson Memorial (with the Ryder Trauma Center, a Level 1 centre), University of Miami Health and its Sylvester cancer centre, Baptist Health South Florida and Mount Sinai are all in the metro, with Cleveland Clinic Florida in nearby Weston; Medicare applies from 65.',
    safety:
      'The US is 134th of 163 in the 2026 Global Peace Index; the City of Miami recorded 27 homicides in both 2024 and 2025, close to its record low of 24, and 8 in the first half of 2026 against 16 a year earlier, though property crime and some neighbourhoods remain a concern.',
    visa: 'No visa needed: a US citizen can live there without any residency process.',
    tax: 'No state income tax on dividends, interest or realised gains: Florida\'s constitution (Art. VII, s. 5) bars a state income tax on natural persons, and the Department of Revenue administers no personal income tax; there is no city income tax either, so only federal tax applies.',
    estate:
      'No state estate or inheritance tax: Florida\'s estate tax ended for deaths after 31 December 2004, when the federal credit it was tied to was phased out, and the constitution bars any inheritance tax beyond that credit, so heirs owe only the federal estate tax above the $15M exemption (2026).',
    lending:
      'Full US broker access: every major broker (Schwab, Fidelity, IBKR and others) offers margin and securities-based lines to Florida residents.',
    climate:
      'Warm and dry from November to April, then hot, humid and rainy from May to October; hurricane season runs June to November, and low-lying areas already see tidal \'sunny-day\' flooding as sea levels rise.',
    community:
      'A large, international metro where about 54% of the county\'s residents were born abroad (2024) and Spanish is as common as English; retirees and newcomers from the Northeast cluster in Coral Gables, Brickell, the beaches and Broward and Palm Beach to the north.',
    access:
      'Miami International (MIA), American Airlines\' Latin American hub, has more flights to Latin America and the Caribbean than any other US airport, about 99 international destinations in all, including Europe; Fort Lauderdale (FLL), 30 miles north, adds low-cost routes.',
  },
  drawbacks: [
    'Home insurance among the dearest in the US (roughly $6,000 a year for a typical Miami-Dade house by private estimates, 2026), plus flood cover; Citizens cut Miami-Dade rates about 14% from June 2026',
    'Property tax of about 2% of assessed value inside the city (20.0 mills, 2025); homesteads get about $50k off and a 3% yearly cap on assessed value, and voters approved Amendment 3 on 3 November 2026 (about 61%, unofficial results) to raise the exemption from non-school tax to $150k in 2027 and $250k in 2028, though owners who were not Florida residents on 31 December 2026 get the larger exemption only from their fifth year of eligibility',
    'Hurricanes, sea-level rise and the highest housing costs in Florida',
  ],
  sources: [
    { name: 'Florida Department of Revenue: estate tax', url: 'https://floridarevenue.com/taxes/taxesfees/Pages/estate_tax.aspx' },
    { name: 'Florida Department of Revenue: taxes and fees administered', url: 'https://floridarevenue.com/taxes/taxesfees/Pages/default.aspx' },
    { name: 'Florida Senate: Florida Constitution (Art. VII, s. 5)', url: 'https://www.flsenate.gov/Laws/Constitution' },
    {
      name: 'Jones Walker: Florida\'s super homestead exemption approved by voters',
      url: 'https://www.joneswalker.com/en/insights/blogs/perspectives/floridas-proposed-super-homestead-exemption-approved-by-voters-whats-next.html',
      edition: '2026',
    },
    {
      name: 'CBS12: how Amendment 3 works (2027 homestead exemption, new residents)',
      url: 'https://cbs12.com/news/florida/florida-homeowners-could-pay-less-under-amendment-3-heres-how-it-works-homestead-exemption-2027-reduce-assessment-cap-property-tax-florida-value',
      edition: '2026',
    },
    {
      name: 'WFLX: Florida homeowners to see insurance premium cuts starting spring 2026',
      url: 'https://www.wflx.com/2026/01/12/florida-homeowners-see-insurance-premium-cuts-starting-spring-2026/',
      edition: '2026',
    },
    {
      name: 'Spokesman-Review: US falls again in global peace rankings',
      url: 'https://www.spokesman.com/stories/2026/jun/11/us-falls-again-in-global-peace-rankings-while-icel/',
      edition: '2026',
    },
    { name: 'Miami-Dade Property Appraiser: 2025 adopted millage chart', url: 'https://www.miamidadepa.gov/resources-pa/library/reports/millage/2025-adopted-millage-chart.pdf', edition: '2025' },
    {
      name: 'Insurance News Net: most Citizens customers in South Florida could see rates fall by more than 11% in 2026',
      url: 'https://insurancenewsnet.com/oarticle/most-citizens-insurance-customers-in-south-florida-could-see-rates-fall-by-more-than-11-in-2026',
      edition: '2026',
    },
    {
      name: 'Major Cities Chiefs Association: violent crime report, 2025 and 2024 year-end',
      url: 'https://majorcitieschiefs.com/wp-content/uploads/2026/02/MCCA-Violent-Crime-Report-2025-and-2024-Year-End.pdf',
      edition: '2026',
    },
    {
      name: 'Major Cities Chiefs Association: violent crime report, 2026 and 2025 midyear',
      url: 'https://majorcitieschiefs.com/wp-content/uploads/2026/08/MCCA-Violent-Crime-Report-2026-and-2025-Midyear.pdf',
      edition: '2026',
    },
    { name: 'Officer.com: Miami police report 20% decrease in homicides for first half of 2025 (record low of 24)', url: 'https://www.officer.com/command-hq/news/55304244/miami-police-report-20-decrease-in-homicides-for-1st-half-of-2025', edition: '2025' },
    { name: 'Data USA: Miami-Dade County, FL', url: 'https://datausa.io/profile/geo/miami-dade-county-fl', edition: '2024' },
    { name: 'Miami International Airport: about MIA', url: 'https://www.miami-airport.com/about_us.asp' },
    { name: 'MIA passenger brochure 2025', url: 'https://miami-airport.com/library/pdfdoc/Marketing/Passenger%20Brochure%202025.pdf', edition: '2025' },
  ],
}

export default profile
