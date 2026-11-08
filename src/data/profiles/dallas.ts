import type { ExpatProfile } from '../expatPicks'

const profile: ExpatProfile = {
  tagline: 'No state income or estate tax, with a major hospital system and the biggest airport hub in the South',
  summary:
    'Texas has no state income tax (the constitution has barred one since 2019, and a capital gains tax since 2025) and no estate or inheritance tax, so a buy-borrow-die retiree based in Dallas pays nothing to the state on dividends, gains or the estate, and keeps full access to US brokers and securities-based lending. Dallas adds UT Southwestern and Parkland, and DFW, American Airlines\' largest hub, which with Love Field gives the region nonstops to 269 destinations. The costs come back as property tax of about 2.2%, hot summers with hail and tornado risk, and violent crime well above Austin\'s.',
  scores: { cost: 2, healthcare: 5, safety: 2, visa: 5, climate: 3, community: 4, tax: 5, estate: 5, lending: 5 },
  facts: {
    healthcare:
      'UT Southwestern Medical Center (an academic centre with an NCI-designated cancer centre), Parkland Memorial (the county\'s Level 1 trauma centre) and the Baylor Scott & White and Texas Health networks are all in the city; Medicare applies from 65.',
    safety:
      'The US is 134th of 163 in the 2026 Global Peace Index; Dallas police counted 141 homicides in 2025, down from 184 in 2024 but still about 10 per 100,000 people, roughly double Austin\'s rate, and safety varies sharply by neighbourhood.',
    visa: 'No visa needed: a US citizen can live there without any residency process.',
    tax: 'No state income tax on dividends, interest or realised gains: Texas has no personal income tax, the constitution has barred one since 2019, and a 2025 amendment also bars any tax on realised or unrealised capital gains; there is no city income tax, so only federal tax applies.',
    estate:
      'No state estate or inheritance tax: Texas repealed its inheritance tax from 1 September 2015, so heirs owe only the federal estate tax above the $15M exemption (2026).',
    lending:
      'Full US broker access: every major broker (Schwab, Fidelity, IBKR and others) offers margin and securities-based lines to Texas residents.',
    climate:
      'Hot summers, with about 20 days a year at 100 °F (38 °C) or more on the 1991–2020 normal and 71 in the record year of 2011; spring brings hail and tornadoes, and winters are mild but with ice storms such as the February 2021 freeze that failed the state grid.',
    community:
      'A fast-growing metro of about 8 million with many newcomers from other states; retirees mostly settle in the suburbs (Plano, Frisco, McKinney) rather than the city itself.',
    access:
      'DFW Airport, American Airlines\' largest hub, served about 85.6 million passengers in 2025 and with Love Field (Southwest\'s domestic network) the region has nonstops to 269 destinations, including Europe, Asia, Australia (Qantas), the Middle East and Latin America.',
  },
  drawbacks: [
    'Property tax of about 2.2% of taxable value inside the city (2025 combined rate of $2.23 per $100); homesteads get $140k off school tax ($200k from 65, when school tax is also frozen)',
    'Hail, tornadoes and rising homeowners\' insurance premiums',
    'Violent crime roughly double Austin\'s rate, uneven across the city',
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
    { name: 'Texas Constitution, Art. 8, Sec. 24-a', url: 'https://statutes.capitol.texas.gov/Docs/CN/htm/CN.8/CN.8.24-a.htm' },
    {
      name: 'Texas Comptroller: Texas inheritance tax repealed effective Sept. 1, 2015',
      url: 'https://content.govdelivery.com/accounts/TXCOMPT/bulletins/11679ec',
      edition: '2015',
    },
    { name: 'Texas Comptroller: property tax exemptions', url: 'https://comptroller.texas.gov/taxes/property-tax/exemptions/' },
    { name: 'Dallas Economic Development: tax rates (2025)', url: 'https://dallasecodev.org/614/Tax-Rate', edition: '2025' },
    {
      name: 'Spokesman-Review: US falls again in global peace rankings',
      url: 'https://www.spokesman.com/stories/2026/jun/11/us-falls-again-in-global-peace-rankings-while-icel/',
      edition: '2026',
    },
    {
      name: 'Major Cities Chiefs Association: violent crime report, 2025 and 2024 year-end',
      url: 'https://majorcitieschiefs.com/wp-content/uploads/2026/02/MCCA-Violent-Crime-Report-2025-and-2024-Year-End.pdf',
      edition: '2026',
    },
    { name: 'NWS Fort Worth: 100-degree days in Dallas/Fort Worth', url: 'https://www.weather.gov/fwd/d100info' },
    {
      name: 'Dallas Morning News: when can Dallas-Fort Worth expect its first 100-degree day?',
      url: 'https://dallasnews.com/news/weather/2024/06/20/when-can-the-dallas-fort-worth-area-expect-its-first-100-degree-day',
      edition: '2024',
    },
    {
      name: 'Dallas Regional Chamber: connectivity and nonstop flight times',
      url: 'https://www.dallaschamber.org/wp-content/uploads/2026/03/EDG2026_Connectivity-Nonstop-flights.pdf',
      edition: '2026',
    },
    {
      name: 'UT Dallas Economic Engine: The Connection (DFW passenger traffic 2025)',
      url: 'https://economicengine.utdallas.edu/download/The_Connection_20260325.pdf',
      edition: '2026',
    },
  ],
}

export default profile
