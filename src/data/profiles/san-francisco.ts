import type { ExpatProfile } from '../expatPicks'

const profile: ExpatProfile = {
  tagline: 'World-class hospitals and a cool, mild coast, at California tax rates and the highest US prices',
  summary:
    'San Francisco gives a buy-borrow-die retiree some of the best hospitals in the country, a mild, fog-cooled climate with almost no heat, and SFO\'s long-haul network to Asia and Europe, with full access to US brokers and securities-based lending. California has no estate or inheritance tax, so heirs face only the federal estate tax. The costs are steep: California taxes dividends, interest and realised gains as ordinary income at up to 13.3%, and housing and daily costs are among the highest in the US.',
  scores: { cost: 1, healthcare: 5, safety: 3, visa: 5, climate: 4, community: 3, tax: 4, estate: 5, lending: 5 },
  facts: {
    healthcare:
      'UCSF Health, with an NCI-designated comprehensive cancer centre, is among the top US academic medical centres; Zuckerberg San Francisco General is the city\'s Level 1 trauma centre, alongside Kaiser and Sutter\'s CPMC, and Stanford is about 35 miles south; Medicare applies from 65.',
    safety:
      'The US is 134th of 163 in the 2026 Global Peace Index; San Francisco recorded 28 homicides in 2025, the fewest since 1954, and overall crime fell about 25%, though car break-ins, shoplifting and street disorder around downtown and the Tenderloin remain the everyday concerns.',
    visa: 'No visa needed: a US citizen can live there without any residency process.',
    tax: 'California taxes dividends, interest and realised gains as ordinary income, with no lower rate for long-term gains: 1% to 12.3% (12.3% above $742,953 single or $1,485,906 joint, 2025), plus a 1% Behavioral Health Services Tax on taxable income over $1M, so 13.3% at the top; there is no city income tax, and Prop 40, a one-time 5% tax on the net worth of billionaires only, was rejected by voters on 3 November 2026.',
    estate:
      'No state estate or inheritance tax: California repealed its inheritance tax in 1982 and its pick-up estate tax has not applied to deaths since 2005, so heirs owe only the federal estate tax above the $15M exemption (2026); since Prop 19 (2021) a house passed to children keeps its low Prop 13 tax base only if they live in it, and only up to a cap.',
    lending:
      'Full US broker access: every major broker (Schwab, Fidelity, IBKR and others) offers margin and securities-based lines to California residents.',
    climate:
      'Mild all year and rarely hot: highs are mostly in the 60s °F (16–21 °C), summer fog keeps July cool and September is often the warmest month; wildfire smoke from fires elsewhere in the state can foul the air for days in some autumns, as in 2018 and 2020.',
    community:
      'A dense, high-income city that skews young and professional; retirees are a modest share, many of them long-time owners, and newcomers who retire here tend to choose the Peninsula or Marin for space.',
    access:
      'SFO, a major hub, is about 20 km south of downtown and on BART; Oakland and San José airports add more choice.',
  },
  drawbacks: [
    'Among the highest housing and living costs in the US; the median house price is well over $1M',
    'California\'s 13.3% top rate on dividends, interest and gains, with no lower rate for long-term gains',
    'Grey, cool summers and street disorder downtown',
  ],
  sources: [
    { name: 'California FTB: 2025 California tax rate schedules', url: 'https://www.ftb.ca.gov/forms/2025/2025-540-tax-rate-schedules.pdf', edition: '2025' },
    { name: 'California FTB: capital gains and losses', url: 'https://www.ftb.ca.gov/file/personal/income-types/capital-gains-and-losses.html' },
    { name: 'California State Controller: California estate tax', url: 'https://sco.ca.gov/ardtax_estate_tax.html' },
    { name: 'UC Law SF ballot propositions: Proposition 6 (1982), gift and inheritance taxes', url: 'https://repository.uclawsf.edu/ca_ballot_props/901' },
    { name: 'FOX 10 Phoenix (AP): California Prop. 40 fails, voters reject one-time 5% wealth tax on billionaires', url: 'https://www.fox10phoenix.com/news/prop-40-fails-california-voters-reject-billionaire-wealth-tax', edition: '2026' },
    {
      name: 'SFPD: lowest homicide rate in 70 years, declines across all major crime categories in 2025',
      url: 'https://www.sanfranciscopolice.org/node/50891',
      edition: '2026',
    },
    { name: 'KTVU: San Francisco crime fell 25% in 2025', url: 'https://www.ktvu.com/news/san-francisco-crime-fell-2025-data-shows', edition: '2026' },
    {
      name: 'Spokesman-Review: US falls again in global peace rankings',
      url: 'https://www.spokesman.com/stories/2026/jun/11/us-falls-again-in-global-peace-rankings-while-icel/',
      edition: '2026',
    },
  ],
}

export default profile
