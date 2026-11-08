import type { ExpatProfile } from '../expatPicks'

const profile: ExpatProfile = {
  tagline: 'No state income or estate tax, on the Gulf beaches in America\'s retirement capital',
  summary:
    'Florida has no state income tax and no estate or inheritance tax, so a buy-borrow-die retiree based in Sarasota pays nothing to the state on dividends, gains or the estate, and keeps full access to US brokers and securities-based lending. Sarasota adds famous white-sand beaches, a strong arts scene, a large public hospital and one of the oldest, most retiree-oriented populations in the country. The costs come back as hurricane exposure (Milton made landfall on Siesta Key in 2024), high home insurance and a small airport.',
  scores: { cost: 2, healthcare: 4, safety: 3, visa: 5, climate: 3, community: 5, tax: 5, estate: 5, lending: 5 },
  facts: {
    healthcare:
      'Sarasota Memorial, a public hospital with an 897-bed main campus, has the county\'s only trauma centre (Level 2) and a second hospital in Venice; the most complex cases go to Moffitt or Tampa General, about an hour north; Medicare applies from 65.',
    safety:
      'The US is 134th of 163 in the 2026 Global Peace Index; the City of Sarasota recorded 2 homicides in 2025 (7 in 2024, none in 2023) and overall crime fell 18%, its third yearly drop in a row, so it is calmer than Florida\'s big metros, with crime concentrated in a few neighbourhoods.',
    visa: 'No visa needed: a US citizen can live there without any residency process.',
    tax: 'No state income tax on dividends, interest or realised gains: Florida\'s constitution (Art. VII, s. 5) bars a state income tax on natural persons, and the Department of Revenue administers no personal income tax; there is no city income tax either, so only federal tax applies.',
    estate:
      'No state estate or inheritance tax: Florida\'s estate tax ended for deaths after 31 December 2004, when the federal credit it was tied to was phased out, and the constitution bars any inheritance tax beyond that credit, so heirs owe only the federal estate tax above the $15M exemption (2026).',
    lending:
      'Full US broker access: every major broker (Schwab, Fidelity, IBKR and others) offers margin and securities-based lines to Florida residents.',
    climate:
      'Mild, sunny winters and hot, humid summers with afternoon storms; the coast is exposed to hurricanes: Helene\'s surge flooded the keys in September 2024 and Milton made landfall on Siesta Key two weeks later as a Category 3 storm, with 4–6 ft of surge from Longboat Key to Venice and 6–9 ft farther south.',
    community:
      'One of the largest retiree communities in the US: Sarasota County\'s median age is about 57 (2024), among the oldest of any large US county, with many newcomers from the Midwest and Northeast and a busy arts calendar (the Ringling, opera, orchestra and theatre).',
    access:
      'Sarasota Bradenton (SRQ) set a record of over 4.5 million passengers in 2025 and has 60-plus nonstops on 10 airlines, almost all domestic (2026); Tampa International, about an hour north, adds transatlantic flights.',
  },
  drawbacks: [
    'High home insurance on the coast, plus flood cover in surge zones, though Citizens cut average rates about 8.7% from June 2026',
    'Hurricanes and storm surge on the keys and bayfront, as in 2024',
    'Property tax of about 1.1–1.5% of assessed value (11.5 mills unincorporated, 14.9 in the City of Sarasota, 2025), plus non-ad valorem fire and other assessments; homesteads get about $50k off and a 3% yearly cap on assessed value, and voters approved Amendment 3 on 3 November 2026 (about 61%, unofficial results) to raise the exemption from non-school tax to $150k in 2027 and $250k in 2028, though owners who were not Florida residents on 31 December 2026 get the larger exemption only from their fifth year of eligibility',
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
    { name: 'Sarasota Memorial Health Care System: about SMH', url: 'https://www.smh.com/about' },
    { name: 'Business Observer: Sarasota-Bradenton International Airport sets passenger record in 2025', url: 'https://www.businessobserverfl.com/news/2026/jan/13/sarasota-airport-record-traffic/', edition: '2026' },
    { name: 'NHC: tropical cyclone report, Hurricane Milton', url: 'https://www.nhc.noaa.gov/data/tcr/AL142024_Milton.pdf', edition: '2025' },
    { name: 'WWSB: Sarasota police say crime down 18% in 2025', url: 'https://www.mysuncoast.com/2026/04/28/sarasota-police-crime-down-18-2025-real-time-operations-center-marks-one-year-impact/', edition: '2026' },
    { name: 'WWSB: zero homicides in the City of Sarasota in 2023, first time since 1967', url: 'https://www.mysuncoast.com/2024/02/20/zero-homicides-city-sarasota-2023-first-time-since-1967', edition: '2024' },
    { name: 'Data USA: Sarasota County, FL', url: 'https://datausa.io/profile/geo/sarasota-county-fl', edition: '2024' },
    { name: 'Visit Sarasota: nonstop flights from SRQ', url: 'https://www.visitsarasota.com/article/nonstop-flights-sarasota-bradenton-international-airport', edition: '2026' },
    { name: 'Sarasota County Tax Collector: 2025 millage rates', url: 'https://www.sarasotataxcollector.gov/docs/2025Millage', edition: '2025' },
  ],
}

export default profile
