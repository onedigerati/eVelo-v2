import type { ExpatProfile } from '../expatPicks'

const profile: ExpatProfile = {
  tagline: 'No state tax on capital gains, no estate tax and low costs, in the middle of the country',
  summary:
    'Missouri stopped taxing individuals\' capital gains from 2025, taxes dividends and interest at no more than 4.7% and has no estate or inheritance tax, so a buy-borrow-die retiree based in Kansas City pays little to the state on the portfolio and nothing on the estate, with full access to US brokers and securities-based lending; the city\'s 1% earnings tax falls on wages and business profits, not investment income. Kansas City adds an NCI comprehensive cancer centre, a new airport terminal and living costs below most big US cities. The costs are a high violent-crime rate in the city proper, hot summers and cold winters, and few nonstops abroad.',
  scores: { cost: 2, healthcare: 5, safety: 2, visa: 5, climate: 3, community: 3, tax: 5, estate: 5, lending: 5 },
  facts: {
    healthcare:
      'The University of Kansas Health System (just across the state line in Kansas City, Kansas, with the NCI-designated comprehensive KU Cancer Center), University Health Truman Medical Center (Level 1 trauma) and Saint Luke\'s lead the region; Medicare applies from 65.',
    safety:
      'The US is 134th of 163 in the 2026 Global Peace Index; Kansas City, Missouri, recorded 138 homicides in 2025 (police data), the fewest since 2018 but still about 27 per 100,000, among the highest rates of large US cities; most violence is concentrated east of Troost Avenue, and the suburbs on both sides of the state line are far safer.',
    visa: 'No visa needed: a US citizen can live there without any residency process.',
    tax: 'Missouri subtracts 100% of individuals\' capital gains from income from tax year 2025, and taxes dividends and interest at up to 4.7% (2025–2026); Social Security is exempt from 2024; the city\'s 1% earnings tax (renewed by voters in April 2026) can by state law reach only wages and other compensation and business net profits, not interest, dividends, pensions or Social Security.',
    estate:
      'No state estate or inheritance tax: Missouri\'s estate tax was tied to the federal state death tax credit and is not imposed on deaths from 1 January 2005, so heirs owe only the federal estate tax above the $15M exemption (2026).',
    lending:
      'Full US broker access: every major broker (Schwab, Fidelity, IBKR and others) offers margin and securities-based lines to Missouri residents.',
    climate:
      'Continental: hot, humid summers with highs near 89 °F (32 °C), cold winters with highs around 39 °F (4 °C), snow and ice, and a spring severe-storm and tornado season.',
    community:
      'A friendly, affordable metro whose newcomers are mostly regional; retirees, many returning to family, settle in Missouri-side suburbs such as Lee\'s Summit and the Northland (Kansas-side suburbs such as Overland Park fall under Kansas income tax), with jazz, barbecue, the Nelson-Atkins and the Plaza for city life.',
    access:
      'Kansas City International (MCI) opened a new single terminal in 2023 and has nonstops to most large US cities, but no transatlantic service as of November 2025; abroad it flies to Cancún, Los Cabos, Montego Bay and Punta Cana, and most international trips connect through a hub.',
  },
  drawbacks: [
    'A high homicide rate in the city proper',
    'Few international nonstops',
    'Hot summers, cold winters and tornado season',
  ],
  sources: [
    {
      name: 'Missouri Department of Revenue: 2025 individual income tax year changes (rates, capital gains subtraction)',
      url: 'https://dor.mo.gov/taxation/individual/tax-types/income/year-changes/',
    },
    {
      name: 'Missouri Department of Revenue: capital gains deduction and 2025 top rate (news release)',
      url: 'https://dor.mo.gov/news/newsitem/uuid/15044650-59dd-48f4-975a-01988d485255',
      edition: '2025',
    },
    { name: 'Missouri Department of Revenue: estate tax filings no longer required', url: 'https://dor.mo.gov/taxation/individual/tax-types/estate.html' },
    {
      name: 'KCUR: Kansas City voters renew earnings tax',
      url: 'https://www.kcur.org/politics-elections-and-government/2026-04-07/kansas-city-voters-renew-earnings-tax-city-revenue-elections',
      edition: '2026',
    },
    {
      name: 'Missouri Revised Statutes §92.111: what a city earnings tax may be levied on',
      url: 'https://revisor.mo.gov/main/OneSection.aspx?section=92.111',
    },
    {
      name: 'KCUR: Kansas City\'s earnings tax is on April\'s ballot (what it covers)',
      url: 'https://www.kcur.org/politics-elections-and-government/2026-03-24/kansas-city-earnings-tax-vote-april-2026-election',
      edition: '2026',
    },
    {
      name: 'KCPD: daily homicide analysis (year-end 2025)',
      url: 'https://kcpolice.org/media/flpjhykd/hom002-daily-homicide-analysis-1.pdf',
      edition: '2025',
    },
    {
      name: 'KCTV5: where Kansas City stands in its quest for transatlantic flights',
      url: 'https://www.kctv5.com/2025/11/03/where-kansas-city-stands-its-quest-transatlantic-flights',
      edition: '2025',
    },
    {
      name: 'Spokesman-Review: US falls again in global peace rankings',
      url: 'https://www.spokesman.com/stories/2026/jun/11/us-falls-again-in-global-peace-rankings-while-icel/',
      edition: '2026',
    },
  ],
}

export default profile
