import type { ExpatProfile } from '../expatPicks'

const profile: ExpatProfile = {
  tagline: 'No state income or estate tax, in a fast-growing hill-country city',
  summary:
    'Texas has no state income tax (the constitution has barred one since 2019) and no estate or inheritance tax, so a buy-borrow-die retiree based in Austin pays nothing to the state on dividends, gains or the estate, and keeps full access to US brokers and securities-based lending. Austin adds a Level 1 trauma centre, lakes and the Hill Country on the doorstep, and a big nonstop network. The costs come back as property tax, long hot summers and a city that has become much dearer than the rest of Texas.',
  scores: { cost: 2, healthcare: 4, safety: 3, visa: 5, climate: 3, community: 4, tax: 5, estate: 5, lending: 5 },
  facts: {
    healthcare:
      'Dell Seton Medical Center (UT Austin\'s teaching hospital) is the only adult Level 1 trauma centre in the 11-county Central Texas region, alongside the St. David\'s and Ascension Seton networks; Medicare applies from 65, and the nearest top-tier cancer centre (MD Anderson) is in Houston, about 2.5 hours away.',
    safety:
      'The US is 134th of 163 in the 2026 Global Peace Index; Austin recorded 55 homicides in 2025, down from about 90 in 2021, and property crime and homelessness downtown are the everyday concerns.',
    visa: 'No visa needed: a US citizen can live there without any residency process.',
    tax: 'No state income tax on dividends, interest or realised gains: Texas has no personal income tax, and since 2019 the state constitution bars the legislature from imposing one; there is no city income tax either, so only federal tax applies.',
    estate:
      'No state estate or inheritance tax: Texas repealed its inheritance tax from 1 September 2015, so heirs owe only the federal estate tax above the $15M exemption (2026).',
    lending:
      'Full US broker access: every major broker (Schwab, Fidelity, IBKR and others) offers margin and securities-based lines to Texas residents.',
    climate:
      'Hot and long summers: about 29 days a year at 100 °F (38 °C) or more on the 1991–2020 normal, 90 in the record year of 2011 and over 60 in 2023; winters are mild with occasional hard freezes.',
    community:
      'One of the fastest-growing US metros, with many newcomers from other states; the city skews young, and retirees tend to settle in the suburbs and Hill Country towns around it.',
    access:
      'Austin-Bergstrom (AUS) has nonstops to most large US cities, plus London Heathrow (British Airways, twice daily from March 2026), Frankfurt (Lufthansa), Panama City (Copa) and Mexican resorts.',
  },
  drawbacks: [
    'Property tax of about 2.1% of taxable value inside the city (2026); homesteads get $140k off school tax ($200k from 65, when school tax is also frozen) but only 20% off city, county and Central Health tax',
    'Long, very hot summers, with dozens of 100 °F days in recent years',
    'Housing and living costs well above the rest of Texas, even after the metro median fell about 22% from its May 2022 peak to about $430k',
  ],
  sources: [
    {
      name: 'Ballotpedia: Texas Prohibit State Personal Income Tax Amendment (2019)',
      url: 'https://ballotpedia.org/Texas_Prohibit_State_Personal_Income_Tax_Amendment_(2019)',
    },
    {
      name: 'Texas Comptroller: property tax cuts as large as Texas (no income tax)',
      url: 'https://comptroller.texas.gov/economy/fiscal-notes/archive/2023/dec/proptax.php',
      edition: '2023',
    },
    { name: 'Texas Constitution, Art. 8, Sec. 24-a', url: 'https://statutes.capitol.texas.gov/Docs/CN/htm/CN.8/CN.8.24-a.htm' },
    {
      name: 'Texas Comptroller: Texas inheritance tax repealed effective Sept. 1, 2015',
      url: 'https://content.govdelivery.com/accounts/TXCOMPT/bulletins/11679ec',
      edition: '2015',
    },
    {
      name: 'Ballotpedia: Texas Increase Homestead Property Tax Exemption Amendment (2025)',
      url: 'https://ballotpedia.org/Texas_Increase_Homestead_Property_Tax_Exemption_Amendment_(2025)',
    },
    { name: 'Texas Comptroller: property tax exemptions', url: 'https://comptroller.texas.gov/taxes/property-tax/exemptions/' },
    {
      name: 'Texas Comptroller: appraisal and tax limitations (65+ school tax ceiling)',
      url: 'https://comptroller.texas.gov/taxes/property-tax/appraisal-tax-limitations.php',
    },
    { name: 'Neuhaus Realty: your 2026 Travis County property tax bill', url: 'https://neuhausre.com/travis-county-property-tax-bill-2026/', edition: '2026' },
    {
      name: 'Dell Medical School: Division of Acute Care Surgery (Level 1 trauma centre)',
      url: 'https://www.dellmed.utexas.edu/units/department-of-surgery-and-perioperative-care/division-of-acute-care-surgery',
    },
    {
      name: 'Spokesman-Review: US falls again in global peace rankings',
      url: 'https://www.spokesman.com/stories/2026/jun/11/us-falls-again-in-global-peace-rankings-while-icel/',
      edition: '2026',
    },
    {
      name: 'CBS Austin: homicide rates lag behind previous years',
      url: 'https://cbsaustin.com/news/local/story/apd-searches-for-gunman-in-deadly-shooting-as-homicide-rates-lag-behind-previous-years',
    },
    { name: 'KXAN: how often does Austin hit 100°?', url: 'https://www.yahoo.com/news/articles/often-does-austin-hit-100-215006990.html', edition: '2025' },
    { name: 'KUT: new nonstop flights from Austin in 2026', url: 'https://www.kut.org/transportation/2025-12-29/austin-tx-abia-aus-new-nonstop-flights-2026' },
    { name: 'Neuhaus Realty: will the Austin housing market crash in 2026?', url: 'https://neuhausre.com/will-austin-housing-market-crash-2026', edition: '2026' },
  ],
}

export default profile
