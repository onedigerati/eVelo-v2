import type { ExpatProfile } from '../expatPicks'

const profile: ExpatProfile = {
  tagline: 'No state income or estate tax, inland from the storm surge with Florida\'s busiest airport',
  summary:
    'Florida has no state income tax and no estate or inheritance tax, so a buy-borrow-die retiree based in Orlando pays nothing to the state on dividends, gains or the estate, and keeps full access to US brokers and securities-based lending. Orlando adds two large hospital systems, lakes and springs, Florida\'s busiest airport and an inland position away from storm surge. The costs come back as hot, humid summers, hurricane winds and flooding, home insurance and a tourist-driven economy.',
  scores: { cost: 2, healthcare: 4, safety: 3, visa: 5, climate: 3, community: 4, tax: 5, estate: 5, lending: 5 },
  facts: {
    healthcare:
      'AdventHealth Orlando and Orlando Health (whose Orlando Regional Medical Center is the area\'s Level 1 trauma centre) run large hospital networks across the metro, with Moffitt in Tampa and Mayo Clinic in Jacksonville for the most complex cases; Medicare applies from 65.',
    safety:
      'The US is 134th of 163 in the 2026 Global Peace Index; Orlando police recorded 10 homicides in 2025, the fewest since its records began in 1971, though 10 more came in the first half of 2026 alone, and property crime around the tourist corridors and some neighbourhoods remains a concern.',
    visa: 'No visa needed: a US citizen can live there without any residency process.',
    tax: 'No state income tax on dividends, interest or realised gains: Florida\'s constitution (Art. VII, s. 5) bars a state income tax on natural persons, and the Department of Revenue administers no personal income tax; there is no city income tax either, so only federal tax applies.',
    estate:
      'No state estate or inheritance tax: Florida\'s estate tax ended for deaths after 31 December 2004, when the federal credit it was tied to was phased out, and the constitution bars any inheritance tax beyond that credit, so heirs owe only the federal estate tax above the $15M exemption (2026).',
    lending:
      'Full US broker access: every major broker (Schwab, Fidelity, IBKR and others) offers margin and securities-based lines to Florida residents.',
    climate:
      'Mild, sunny winters and hot, humid summers with near-daily thunderstorms; inland, so there is no storm surge, but hurricanes such as Ian (2022) and Milton (2024) brought flooding and wind damage to the metro.',
    community:
      'A fast-growing metro with many newcomers and retirees, especially in Winter Park, Lake Nona and the retirement communities to the north and west; The Villages, the largest retirement community in the US, is about an hour away.',
    access:
      'Orlando International (MCO), Florida\'s busiest airport and the seventh busiest in the US, handled about 57.7 million passengers in 2025, nearly 8.5 million of them international, with wide nonstops to Europe and Latin America; Sanford (SFB) adds low-cost routes.',
  },
  drawbacks: [
    'Home insurance two to three times the US average (Florida averages roughly $4,000–6,000 a year by private estimates, 2026), though rates began to fall in 2026',
    'Property tax of about 1.8% of assessed value inside the city (about 18 mills, 2025); homesteads get about $50k off and a 3% yearly cap on assessed value, and voters approved Amendment 3 on 3 November 2026 (about 61%, unofficial results) to raise the exemption from non-school tax to $150k in 2027 and $250k in 2028, though owners who were not Florida residents on 31 December 2026 get the larger exemption only from their fifth year of eligibility',
    'Hot, humid summers, hurricane winds and tourist crowds and traffic',
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
    { name: 'Spectrum News 13: Orlando crime and homicides decrease', url: 'https://mynews13.com/fl/orlando/news/2026/02/14/orlando-crime-homicides-decrease', edition: '2026' },
    {
      name: 'Major Cities Chiefs Association: violent crime report, 2026 and 2025 midyear',
      url: 'https://majorcitieschiefs.com/wp-content/uploads/2026/08/MCCA-Violent-Crime-Report-2026-and-2025-Midyear.pdf',
      edition: '2026',
    },
    { name: 'Orlando Weekly: Orlando International remains Florida\'s busiest airport', url: 'https://www.orlandoweekly.com/news/orlando-area-news/orlando-international-airport-remains-floridas-busiest/', edition: '2026' },
    { name: 'ClickOrlando: busiest airport rankings are out, here\'s where Orlando International lands', url: 'https://clickorlando.com/news/local/2026/07/29/busiest-airport-rankings-are-out-heres-where-orlando-international-airport-lands', edition: '2026' },
    { name: 'Orlando Property Tax Guide 2026', url: 'https://www.propertyexemption.com/property-tax/orlando-property-tax/', edition: '2026' },
  ],
}

export default profile
