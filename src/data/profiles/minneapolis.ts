import type { ExpatProfile } from '../expatPicks'

const profile: ExpatProfile = {
  tagline: 'Top-tier medicine and lakes in the city, with high taxes and hard winters',
  summary:
    'Minnesota taxes dividends, interest and gains as ordinary income at up to 9.85%, plus 1% on net investment income above $1M, and taxes estates above $3M at up to 16%, so a buy-borrow-die retiree in Minneapolis gives up more of the portfolio\'s income and estate than in most states, though full access to US brokers and securities-based lending is unaffected. Borrowing rather than selling limits the income-tax cost. Minneapolis repays it with excellent hospitals and the Mayo Clinic 90 minutes away, a chain of city lakes and parks, and a Delta hub; the costs are long, very cold winters and the taxes.',
  scores: { cost: 2, healthcare: 5, safety: 2, visa: 5, climate: 1, community: 3, tax: 4, estate: 4, lending: 5 },
  facts: {
    healthcare:
      'Hennepin Healthcare (Level 1 trauma), M Health Fairview University of Minnesota Medical Center (with the NCI-designated comprehensive Masonic Cancer Center) and Abbott Northwestern lead in the city, and the Mayo Clinic in Rochester is about 85 miles (1.5 hours) south; Medicare applies from 65.',
    safety:
      'The US is 134th of 163 in the 2026 Global Peace Index; Minneapolis counted 64 homicides in 2025, down from 76–77 in 2024 but above 2019\'s 48 (about 15 per 100,000), with violent crime concentrated in parts of the North Side and downtown; the lake neighbourhoods and suburbs are much safer.',
    visa: 'No visa needed: a US citizen can live there without any residency process.',
    tax: 'Minnesota taxes dividends, interest and realised gains as ordinary income at 5.35–9.85% (9.85% above $203,150 single or $337,930 joint, 2026), plus a 1% net investment income tax on investment income above $1M (from 2024), so about 10.85% at the top; there is no city income tax.',
    estate:
      'Minnesota estate tax applies above a $3M exclusion (2026; not indexed), at rates rising to 16%, with gifts made in the three years before death added back; it reaches Minnesota residents\' estates wherever the US assets are held, so heirs can owe state tax well below the federal $15M exemption (2026).',
    lending:
      'Full US broker access: every major broker (Schwab, Fidelity, IBKR and others) offers margin and securities-based lines to Minnesota residents.',
    climate:
      'Long, very cold winters: January highs around 23 °F (−5 °C), spells below 0 °F (−18 °C) and about 50 in (127 cm) of snow from November to April; summers are warm and pleasant, with highs in the low to mid 80s °F (about 28 °C), and the downtown skyway links most blocks indoors.',
    community:
      'A civic-minded city with strong arts (the Guthrie, the Walker, the orchestra) and lake and river parks used year-round, but few retirees move to Minnesota and many snowbird south for winter; newcomers mostly arrive for work.',
    access:
      'Minneapolis–St. Paul (MSP), a Delta hub, has nonstops to most US cities and served a record 35 international destinations in 2025, including eight in Europe (Delta added Copenhagen and Rome that year) and Delta\'s flights to Seoul and Tokyo; light rail links the airport to downtown.',
  },
  drawbacks: [
    'Income tax up to about 10.85% on investment income and estate tax above $3M',
    'Long, very cold winters',
    'Violent crime above pre-2020 levels in parts of the city',
  ],
  sources: [
    {
      name: 'Minnesota Department of Revenue: income tax brackets for tax year 2026',
      url: 'https://www.revenue.state.mn.us/mndor-pp/21641',
      edition: '2026',
    },
    { name: 'Minnesota Department of Revenue: net investment income tax', url: 'https://www.revenue.state.mn.us/mndor-pp/20626' },
    { name: 'Minnesota Department of Revenue: estate tax rates', url: 'https://www.revenue.state.mn.us/estate-tax-rates' },
    {
      name: 'Minnesota Statutes §291.016: $3,000,000 exclusion from 2020, three-year gift addback',
      url: 'https://www.revisor.mn.gov/statutes/cite/291.016',
      edition: '2026',
    },
    {
      name: 'Axios Twin Cities: homicide and other crime fall in St. Paul and Minneapolis in 2025',
      url: 'https://www.axios.com/local/twin-cities/2026/01/12/homides-fall-sharply-saint-paul-minneapolis',
      edition: '2026',
    },
    {
      name: 'Metropolitan Airports Commission: MSP Airport tops 36 million passengers in 2025',
      url: 'https://metroairports.org/news/msp-airport-tops-36-million-passengers-2025',
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
