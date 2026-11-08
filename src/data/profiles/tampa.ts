import type { ExpatProfile } from '../expatPicks'

const profile: ExpatProfile = {
  tagline: 'No state income or estate tax, on a bay with a top cancer centre',
  summary:
    'Florida has no state income tax and no estate or inheritance tax, so a buy-borrow-die retiree based in Tampa pays nothing to the state on dividends, gains or the estate, and keeps full access to US brokers and securities-based lending. Tampa adds Moffitt Cancer Center and Tampa General, Gulf beaches within half an hour, a growing transatlantic airport and costs well below Miami. The costs come back as hurricanes and storm surge, as Helene and Milton showed in 2024, and high home insurance.',
  scores: { cost: 2, healthcare: 5, safety: 3, visa: 5, climate: 3, community: 4, tax: 5, estate: 5, lending: 5 },
  facts: {
    healthcare:
      'Moffitt Cancer Center (an NCI-designated comprehensive cancer centre) and Tampa General Hospital (a Level 1 trauma centre and academic hospital for USF) lead a dense hospital network across the bay area; Medicare applies from 65.',
    safety:
      'The US is 134th of 163 in the 2026 Global Peace Index; Tampa police recorded 17 homicides in 2025, down 53% from 36 in 2024, though 11 in the first half of 2026 against 8 a year earlier, and property crime varies by neighbourhood.',
    visa: 'No visa needed: a US citizen can live there without any residency process.',
    tax: 'No state income tax on dividends, interest or realised gains: Florida\'s constitution (Art. VII, s. 5) bars a state income tax on natural persons, and the Department of Revenue administers no personal income tax; there is no city income tax either, so only federal tax applies.',
    estate:
      'No state estate or inheritance tax: Florida\'s estate tax ended for deaths after 31 December 2004, when the federal credit it was tied to was phased out, and the constitution bars any inheritance tax beyond that credit, so heirs owe only the federal estate tax above the $15M exemption (2026).',
    lending:
      'Full US broker access: every major broker (Schwab, Fidelity, IBKR and others) offers margin and securities-based lines to Florida residents.',
    climate:
      'Mild, sunny winters and long hot, humid summers with daily thunderstorms; in 2024 Helene\'s storm surge flooded low-lying bayfront neighbourhoods and Milton made landfall about 50 miles south two weeks later, so flood zone and elevation matter when buying.',
    community:
      'Tampa Bay (with St. Petersburg and Clearwater) is one of the largest US destinations for retirees and newcomers from the Midwest and Northeast, with a big established community in Pinellas and South Tampa.',
    access:
      'Tampa International (TPA) has nonstops to about 22 international destinations (2026), including London Heathrow (Virgin Atlantic, and British Airways five times a week from 25 October 2026) and seasonal Zurich (Edelweiss, paused January to March 2027), plus Canada, Mexico, Panama and the Caribbean; Orlando\'s larger airport is 90 minutes away.',
  },
  drawbacks: [
    'High home insurance and flood cover in surge zones, though Citizens cut average rates about 8.7% from June 2026',
    'Property tax of about 2% of assessed value inside the city (19.84 mills, 2025); homesteads get about $50k off and a 3% yearly cap on assessed value, and voters approved Amendment 3 on 3 November 2026 (about 61%, unofficial results) to raise the exemption from non-school tax to $150k in 2027 and $250k in 2028, though owners who were not Florida residents on 31 December 2026 get the larger exemption only from their fifth year of eligibility',
    'Hurricanes and storm surge, with long hot summers',
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
    { name: 'FOX 13: Tampa crime drops in 2025, outpacing national trend', url: 'https://www.fox13news.com/news/tampa-crime-drops-2025-outpacing-national-trend-tpd', edition: '2026' },
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
    { name: 'Axios Tampa Bay: Tampa among few major cities with rising homicides in 2026', url: 'https://www.axios.com/local/tampa-bay/2026/08/17/tampa-among-few-major-cities-with-rising-homicides-in-2026', edition: '2026' },
    { name: 'PBS NewsHour: Milton slams Florida\'s west coast but Tampa spared from direct hit', url: 'https://www.pbs.org/newshour/nation/milton-slams-floridas-west-coast-but-tampa-spared-from-direct-hit', edition: '2024' },
    { name: 'Hillsborough County Property Appraiser: 2025 final millage', url: 'https://www.hcpafl.org/Portals/HCPAFL/pdfs/2025FinalMillage.pdf', edition: '2025' },
    { name: 'Business Observer: Breeze bringing nonstop flights from TPA to the Bahamas', url: 'https://www.businessobserverfl.com/news/2026/jan/28/breeze-nonstop-flights-tpa-bahamas/', edition: '2026' },
    { name: 'Business Observer: British Airways moves Tampa flight to Heathrow', url: 'https://www.businessobserverfl.com/news/2026/mar/18/british-airways-moves-tampa-flight-heathrow', edition: '2026' },
    { name: 'AeroRoutes: Edelweiss 1Q27 US service suspension', url: 'https://www.aeroroutes.com/eng/260922-wk1q27us', edition: '2026' },
    { name: 'NHC: tropical cyclone report, Hurricane Helene', url: 'https://www.nhc.noaa.gov/data/tcr/AL092024_Helene.pdf', edition: '2025' },
  ],
}

export default profile
