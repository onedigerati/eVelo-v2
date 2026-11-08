import type { ExpatProfile } from '../expatPicks'

const profile: ExpatProfile = {
  tagline: 'No state income or estate tax, next door to the world\'s largest medical centre',
  summary:
    'Texas has no state income tax (the constitution has barred one since 2019, and a capital gains tax since 2025) and no estate or inheritance tax, so a buy-borrow-die retiree based in Houston pays nothing to the state on dividends, gains or the estate, and keeps full access to US brokers and securities-based lending. Houston adds the Texas Medical Center, home of MD Anderson, the cheapest housing of the big Texas cities and a United hub with about 72 international nonstops across Houston\'s two airports. The costs come back as property tax around 2%, hurricanes and flooding, a long humid summer and high violent crime.',
  scores: { cost: 2, healthcare: 5, safety: 2, visa: 5, climate: 2, community: 4, tax: 5, estate: 5, lending: 5 },
  facts: {
    healthcare:
      'The Texas Medical Center is the largest medical complex in the world, with MD Anderson (consistently ranked at or near the top US cancer hospital), Houston Methodist, Memorial Hermann\'s Level 1 trauma centre and Baylor St. Luke\'s; Medicare applies from 65.',
    safety:
      'The US is 134th of 163 in the 2026 Global Peace Index; Houston police reported 272 homicides in 2025, down from 331 in 2024 but still about 11 per 100,000 people, roughly double Austin\'s rate, and safety varies sharply by neighbourhood.',
    visa: 'No visa needed: a US citizen can live there without any residency process.',
    tax: 'No state income tax on dividends, interest or realised gains: Texas has no personal income tax, the constitution has barred one since 2019, and a 2025 amendment also bars any tax on realised or unrealised capital gains; there is no city income tax, so only federal tax applies.',
    estate:
      'No state estate or inheritance tax: Texas repealed its inheritance tax from 1 September 2015, so heirs owe only the federal estate tax above the $15M exemption (2026).',
    lending:
      'Full US broker access: every major broker (Schwab, Fidelity, IBKR and others) offers margin and securities-based lines to Texas residents.',
    climate:
      'Hot and humid from May to September, with mild winters; hurricanes and flash floods are the big risk: Harvey (2017) dropped around 50 inches of rain on parts of the metro, and Beryl (2024) cut power to about 2.26 million customers, some for over a week in the heat.',
    community:
      'One of the most diverse US cities, with a large international and newcomer population; retirees mostly settle in suburbs such as The Woodlands, Sugar Land, Katy and Clear Lake.',
    access:
      'Bush Intercontinental (IAH), a United hub, has nonstops to Europe, Latin America, the Middle East, East Asia and Sydney; with Hobby (HOU), Southwest\'s base, Houston\'s airports reach 129 domestic and 72 international destinations on five continents (2026) and handled 62.1 million passengers in 2025.',
  },
  drawbacks: [
    'Property tax around 2.0–2.2% of taxable value inside the city (2025 rates); homesteads get $140k off school tax ($200k from 65, when school tax is also frozen)',
    'Hurricanes, flooding and some of the highest home-insurance premiums in Texas (about $5,600–6,000 a year by private estimates), plus flood cover on top',
    'Long humid summers and violent crime about double Austin\'s rate',
  ],
  sources: [
    {
      name: 'Ballotpedia: Texas Prohibit State Personal Income Tax Amendment (2019)',
      url: 'https://ballotpedia.org/Texas_Prohibit_State_Personal_Income_Tax_Amendment_(2019)',
    },
    {
      name: 'Ballotpedia: Texas Prohibit Capital Gains Tax on Individuals, Estates, and Trusts Amendment (2025)',
      url: 'https://ballotpedia.org/Texas_Prohibit_Capital_Gains_Tax_on_Individuals,_Estates,_and_Trusts_Amendment_(2025)',
    },
    {
      name: 'Texas Comptroller: Texas inheritance tax repealed effective Sept. 1, 2015',
      url: 'https://content.govdelivery.com/accounts/TXCOMPT/bulletins/11679ec',
      edition: '2015',
    },
    {
      name: 'Texas Comptroller: appraisal and tax limitations (65+ school tax ceiling)',
      url: 'https://comptroller.texas.gov/taxes/property-tax/appraisal-tax-limitations.php',
    },
    { name: 'Houston ISD: tax information', url: 'https://www.houstonisd.org/our-district/budget-financial-planning/tax-information' },
    {
      name: 'Community Impact: Houston City Council keeps property tax rate flat',
      url: 'https://communityimpact.com/houston/heights-river-oaks-montrose/government/2025/10/15/houston-city-council-keeps-property-tax-rate-flat-despite-53m-projected-revenue-loss',
      edition: '2025',
    },
    {
      name: 'Major Cities Chiefs Association: violent crime report, 2025 and 2024 year-end',
      url: 'https://majorcitieschiefs.com/wp-content/uploads/2026/02/MCCA-Violent-Crime-Report-2025-and-2024-Year-End.pdf',
      edition: '2026',
    },
    {
      name: 'Spokesman-Review: US falls again in global peace rankings',
      url: 'https://www.spokesman.com/stories/2026/jun/11/us-falls-again-in-global-peace-rankings-while-icel/',
      edition: '2026',
    },
    {
      name: 'FOX 26: when will power be restored in Houston? (Beryl outages)',
      url: 'https://www.fox26houston.com/news/when-will-power-be-restored-houston-centerpoint-beryl-outages-update',
      edition: '2024',
    },
    { name: 'Hippo: homeowners insurance in Houston', url: 'https://www.hippo.com/homeowners-insurance/texas/houston' },
    { name: 'Houston Airports: fast facts', url: 'https://www.fly2houston.com/airport-business/newsroom/media-center/houston-airports-fast-facts/', edition: '2026' },
  ],
}

export default profile
