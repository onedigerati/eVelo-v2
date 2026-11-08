import type { ExpatProfile } from '../expatPicks'

const profile: ExpatProfile = {
  tagline: 'Sun, beaches and top hospitals, at California tax rates and with real wildfire risk',
  summary:
    'Los Angeles offers a buy-borrow-die retiree a sunny, mild coastal climate, some of the best hospitals in the US (Cedars-Sinai, UCLA, City of Hope) and LAX\'s worldwide nonstops, with full access to US brokers and securities-based lending. California has no estate or inheritance tax, so heirs face only the federal estate tax. Against that, California taxes dividends, interest and gains as ordinary income at up to 13.3%, housing is very dear, and the January 2025 fires showed how much of the region sits in wildfire country.',
  scores: { cost: 1, healthcare: 5, safety: 3, visa: 5, climate: 4, community: 4, tax: 4, estate: 5, lending: 5 },
  facts: {
    healthcare:
      'Cedars-Sinai, UCLA\'s Ronald Reagan Medical Center and USC\'s Keck Medicine are among the top US hospitals, and City of Hope is an NCI-designated comprehensive cancer centre; care is excellent but spread across a huge metro, so where you live decides how close it is; Medicare applies from 65.',
    safety:
      'The US is 134th of 163 in the 2026 Global Peace Index; LAPD counted 230 homicides in 2025, the fewest since 1966 (5.9 per 100,000), but crime varies sharply by neighbourhood, and homelessness and property crime are the everyday concerns.',
    visa: 'No visa needed: a US citizen can live there without any residency process.',
    tax: 'California taxes dividends, interest and realised gains as ordinary income, with no lower rate for long-term gains: 1% to 12.3% (12.3% above $742,953 single or $1,485,906 joint, 2025), plus a 1% Behavioral Health Services Tax on taxable income over $1M, so 13.3% at the top; there is no city income tax, though the city\'s Measure ULA adds about 4–5.5% transfer tax on property sales above about $5M.',
    estate:
      'No state estate or inheritance tax: California repealed its inheritance tax in 1982 and its pick-up estate tax has not applied to deaths since 2005, so heirs owe only the federal estate tax above the $15M exemption (2026); since Prop 19 (2021) a house passed to children keeps its low Prop 13 tax base only if they live in it, and only up to a cap.',
    lending:
      'Full US broker access: every major broker (Schwab, Fidelity, IBKR and others) offers margin and securities-based lines to California residents.',
    climate:
      'Mediterranean and mostly sunny, with coastal highs around 68–80 °F (20–27 °C) and little rain; inland valleys pass 100 °F (38 °C) in summer, and Santa Ana winds drive fire seasons: the Palisades and Eaton fires of January 2025 destroyed about 16,000 structures and killed about 30 people.',
    community:
      'One of the largest and most diverse metros in the US, with retirees spread across beach towns, the Westside, Pasadena and the valleys; newcomers find communities for almost any background or interest.',
    access:
      'LAX is one of the world\'s busiest airports, with nonstops across the US and to Asia, Europe, Australia, Latin America and the Pacific; Burbank, Long Beach and Ontario add easy domestic flights.',
  },
  drawbacks: [
    'Very high housing costs, and home insurance that is hard to find in fire zones after insurers pulled back',
    'Wildfire risk and smoke in the hills and canyons, plus earthquake risk everywhere',
    'Long drives and heavy traffic across a car-dependent metro',
  ],
  sources: [
    { name: 'California FTB: 2025 California tax rate schedules', url: 'https://www.ftb.ca.gov/forms/2025/2025-540-tax-rate-schedules.pdf', edition: '2025' },
    { name: 'California FTB: capital gains and losses', url: 'https://www.ftb.ca.gov/file/personal/income-types/capital-gains-and-losses.html' },
    { name: 'California State Controller: California estate tax', url: 'https://sco.ca.gov/ardtax_estate_tax.html' },
    { name: 'LA City: LAPD 2025 crime data report released', url: 'https://lacity.gov/news/los-angeles-police-departments-2025-crime-data-report-released', edition: '2026' },
    {
      name: 'Crosstown: murders and robberies tumble in Los Angeles',
      url: 'https://xtown.la/2026/01/14/murders-and-robberies-tumble-in-los-angeles-while-police-shootings-spike/',
      edition: '2026',
    },
    {
      name: 'PBS NewsHour: a year after the LA wildfire disaster, key numbers',
      url: 'https://www.pbs.org/newshour/nation/a-year-after-the-la-wildfire-disaster-key-numbers-show-how-it-unfolded-and-the-toll-left-behind',
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
