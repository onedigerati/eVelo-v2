import type { ExpatProfile } from '../expatPicks'

const profile: ExpatProfile = {
  tagline: 'The mildest big-city climate in the US, at California tax rates and prices',
  summary:
    'San Diego gives a buy-borrow-die retiree perhaps the most comfortable year-round weather of any large US city, strong hospitals including UC San Diego\'s comprehensive cancer centre, low violent crime for a big city and a large retiree and military-retiree community, with full access to US brokers and securities-based lending. California has no estate or inheritance tax. The trade-offs are California\'s up-to-13.3% tax on dividends, interest and gains, very high housing costs, and fewer long-haul flights than Los Angeles.',
  scores: { cost: 1, healthcare: 5, safety: 4, visa: 5, climate: 5, community: 4, tax: 4, estate: 5, lending: 5 },
  facts: {
    healthcare:
      'UC San Diego Health, with an NCI-designated comprehensive cancer centre (Moores), Scripps, Sharp and Kaiser give the region deep hospital capacity, including several Level 1 trauma centres; the VA medical centre in La Jolla serves the large veteran population; Medicare applies from 65.',
    safety:
      'The US is 134th of 163 in the 2026 Global Peace Index; the city counted 39 homicides in 2025, down from 48, crime fell for a fourth straight year, and its violent-crime rate of 4.1 per 1,000 residents is among the lowest of large US cities.',
    visa: 'No visa needed: a US citizen can live there without any residency process.',
    tax: 'California taxes dividends, interest and realised gains as ordinary income, with no lower rate for long-term gains: 1% to 12.3% (12.3% above $742,953 single or $1,485,906 joint, 2025), plus a 1% Behavioral Health Services Tax on taxable income over $1M, so 13.3% at the top; there is no city income tax.',
    estate:
      'No state estate or inheritance tax: California repealed its inheritance tax in 1982 and its pick-up estate tax has not applied to deaths since 2005, so heirs owe only the federal estate tax above the $15M exemption (2026); since Prop 19 (2021) a house passed to children keeps its low Prop 13 tax base only if they live in it, and only up to a cap.',
    lending:
      'Full US broker access: every major broker (Schwab, Fidelity, IBKR and others) offers margin and securities-based lines to California residents.',
    climate:
      'Mild and dry all year on the coast, with highs of about 65–77 °F (18–25 °C) and grey mornings in May and June; inland suburbs run hotter, and the backcountry has had major wildfires (Cedar 2003, Witch 2007).',
    community:
      'A large retiree population, many of them Navy and Marine Corps veterans, plus steady arrivals from colder states; coastal towns such as La Jolla, Coronado and Carlsbad have long-established retiree communities.',
    access:
      'San Diego International (SAN) has 87 nonstop destinations (2026), mostly domestic, plus London Heathrow, Munich, Amsterdam (seasonal), Panama City and Canada; for Asia and most long-haul flights, LAX is about two hours north, and Tijuana\'s airport across the border adds Mexico.',
  },
  drawbacks: [
    'Housing costs near the top of the US, with median house prices around $1M',
    'California\'s 13.3% top rate on dividends, interest and gains',
    'Limited long-haul flights from a single-runway airport',
  ],
  sources: [
    { name: 'California FTB: 2025 California tax rate schedules', url: 'https://www.ftb.ca.gov/forms/2025/2025-540-tax-rate-schedules.pdf', edition: '2025' },
    { name: 'California FTB: capital gains and losses', url: 'https://www.ftb.ca.gov/file/personal/income-types/capital-gains-and-losses.html' },
    { name: 'California State Controller: California estate tax', url: 'https://sco.ca.gov/ardtax_estate_tax.html' },
    {
      name: 'City of San Diego: 2025 annual crime statistics report',
      url: 'https://www.sandiego.gov/sites/default/files/2026-03/2025-annual-crime-statistics-report.pdf',
      edition: '2025',
    },
    {
      name: 'City of San Diego: crime reduction streak continues',
      url: 'https://www.sandiego.gov/sites/default/files/2026-03/20260309-crime-reduction-streak-continues-for-city-of-san-diego.pdf',
      edition: '2026',
    },
    {
      name: 'San Diego International Airport: record nonstop flights this spring and summer',
      url: 'https://www.san.org/wp-content/uploads/2026/04/04_28_26_News-Release_Spring-Summer-Air-Service-from-SAN_FINAL-2.pdf',
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
