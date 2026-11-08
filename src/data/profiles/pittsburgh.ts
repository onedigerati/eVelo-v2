import type { ExpatProfile } from '../expatPicks'

const profile: ExpatProfile = {
  tagline: 'Low taxes on a portfolio and top hospitals, in an affordable river city',
  summary:
    'Pittsburgh gives a buy-borrow-die retiree one of the largest academic health systems in the US, low housing costs for a big city and only Pennsylvania\'s flat 3.07% on dividends, interest and gains, because the city\'s 3% earned-income tax does not reach investment income; brokers and securities-based lending are fully available. The catches are Pennsylvania\'s 4.5% inheritance tax on what children inherit, a 2026 jump in property tax, grey winters and a thin international flight list. A council proposal to tax unearned income at 2% from 2027 is pending and legally contested.',
  scores: { cost: 2, healthcare: 5, safety: 3, visa: 5, climate: 2, community: 3, tax: 5, estate: 4, lending: 5 },
  facts: {
    healthcare:
      'UPMC (UPMC Presbyterian is a Level 1 trauma centre, and UPMC Hillman is an NCI-designated comprehensive cancer centre) and Allegheny Health Network give Pittsburgh hospital care on a par with much larger cities; Medicare applies from 65.',
    safety:
      'The US is 134th of 163 in the 2026 Global Peace Index; Pittsburgh recorded 35 homicides in 2025, down from 42 and among the lowest in decades, though about 11 per 100,000 is still above the large-city average, and Allegheny County\'s total was its lowest since its records begin in 2007.',
    visa: 'No visa needed: a US citizen can live there without any residency process.',
    tax: 'Pennsylvania taxes interest, dividends and net gains at a flat 3.07% (retirement income and Social Security are exempt); Pittsburgh\'s 3% earned-income tax (1% city, 2% schools) covers wages and business profits, not dividends, interest, gains or pensions; an ordinance introduced on 27 October 2026 would add a 2% city tax on dividends, gains and other unearned income (interest and pensions excluded) from 1 January 2027, but it is in committee and its legality under state law is disputed.',
    estate:
      'Pennsylvania inheritance tax: 4.5% on what children and other lineal heirs inherit, 12% for siblings and 15% for others, 0% for a spouse, with a 5% discount for paying within three months; no separate estate tax; heirs also face the federal estate tax above the $15M exemption (2026).',
    lending:
      'Full US broker access: every major broker (Schwab, Fidelity, IBKR and others) offers margin and securities-based lines to Pennsylvania residents.',
    climate:
      'One of the cloudiest large US cities, with grey, damp winters around freezing and about 44 inches (112 cm) of snow in a typical year; summers are warm and humid but rarely extreme, with highs in the low 80s °F (about 28 °C).',
    community:
      'A city that lost people for decades and is now drawing newcomers with its universities, hospitals and low costs; the population is older than in most US cities, but the newcomer and retiree networks are smaller than in the Sun Belt.',
    access:
      'Pittsburgh International (PIT) has nonstops to most large US cities, London Heathrow on British Airways year-round, Dublin on Aer Lingus (since May 2026), seasonal Reykjavik on Icelandair, Toronto on Air Canada and seasonal Caribbean flights; most other international trips connect.',
  },
  drawbacks: [
    'Pennsylvania\'s 4.5% inheritance tax on what children inherit, with no exemption amount',
    'Property tax up in 2026 (city 9.67 mills, schools 10.457, county 6.43: about 2.66% of assessed value), and a pending proposal to tax unearned income',
    'Grey winters and few nonstop international flights',
  ],
  sources: [
    {
      name: 'Pennsylvania Department of Revenue: personal income tax',
      url: 'https://www.pa.gov/en/agencies/revenue/resources/tax-types-and-information/personal-income-tax.html',
    },
    {
      name: 'Pennsylvania Department of Revenue: inheritance tax',
      url: 'https://www.pa.gov/en/agencies/revenue/resources/tax-types-and-information/inheritance-tax.html',
    },
    {
      name: 'Schneider Downs: will and can the City of Pittsburgh enact a tax on unearned income?',
      url: 'https://schneiderdowns.com/our-thoughts-on/will-and-can-the-city-of-pittsburgh-enact-a-tax-on-unearned-income/',
      edition: '2026',
    },
    {
      name: 'Keystone Research Center: fair taxation can help achieve a more just Pittsburgh (what the city\'s income taxes exclude)',
      url: 'https://keystoneresearch.org/wp-content/uploads/Pgh-Fair-Taxation-Brief-4-14-22-Final.pdf',
      edition: '2022',
    },
    {
      name: 'WESA: Pittsburgh City Council poised to pass 20 percent property tax hike',
      url: 'https://www.wesa.fm/politics-government/2025-12-21/pittsburgh-city-council-poised-to-pass-20-percent-property-tax-hike',
      edition: '2025',
    },
    {
      name: 'Axios Pittsburgh: Pittsburgh-area homicides drop to 18-year low',
      url: 'https://www.axios.com/local/pittsburgh/2026/03/04/pittsburgh-area-homicides-drop-to-18-year-low',
      edition: '2026',
    },
    {
      name: 'FlyMag: Aer Lingus adds Dublin as PIT reaches three Europe routes (London, Dublin, Reykjavik)',
      url: 'https://flymag.com/pittsburghs-transatlantic-comeback-aer-lingus-adds-dublin-as-pit-reaches-three-europe-routes/',
      edition: '2026',
    },
    {
      name: 'Keystone Collects: local earned income tax return instructions (interest, dividends and gains not taxable)',
      url: 'https://keystonecollects.com/download/ITRInstructions.pdf',
    },
    { name: 'NWS Pittsburgh: historical snowfall (1991–2020 mean)', url: 'https://www.weather.gov/media/pbz/records/hissnow.pdf' },
    {
      name: 'Spokesman-Review: US falls again in global peace rankings',
      url: 'https://www.spokesman.com/stories/2026/jun/11/us-falls-again-in-global-peace-rankings-while-icel/',
      edition: '2026',
    },
  ],
}

export default profile
