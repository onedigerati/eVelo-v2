import type { ExpatProfile } from '../expatPicks'

const profile: ExpatProfile = {
  tagline: 'Some of the best hospitals in the world, with a millionaire surtax and a $2M estate tax',
  summary:
    'Boston offers a buy-borrow-die retiree a walkable historic city, hospitals that rank among the best anywhere, universities and culture, and Logan\'s nonstops to Europe, with full access to US brokers and securities-based lending. Massachusetts taxes dividends and long-term gains at a flat 5% and short-term gains at 8.5%, but adds a 4% surtax on income above about $1.1M, so a retiree who realises a big gain in one year pays up to 9% (12.5% on short-term gains). Its estate tax starts at $2M, among the lowest thresholds in the US, and housing and winters are both hard.',
  scores: { cost: 1, healthcare: 5, safety: 3, visa: 5, climate: 2, community: 4, tax: 4, estate: 4, lending: 5 },
  facts: {
    healthcare:
      'Massachusetts General, Brigham and Women\'s, Beth Israel Deaconess and the Dana-Farber Cancer Institute, all teaching hospitals of Harvard Medical School, make Boston one of the strongest medical cities in the world; Medicare applies from 65.',
    safety:
      'The US is 134th of 163 in the 2026 Global Peace Index; Boston police counted 31 homicides in 2025 (about 4.7 per 100,000), up from 24 in 2024, the fewest since 1957, and still among the lowest rates of any large US city; property crime is the everyday concern.',
    visa: 'No visa needed: a US citizen can live there without any residency process.',
    tax: 'Massachusetts taxes dividends, interest and long-term gains at a flat 5% and short-term gains at 8.5%, plus a 4% surtax on taxable income above $1,107,750 (2026; $1,083,150 in 2025), gains included, so the top rate is 9% (12.5% on short-term gains); there is no city income tax.',
    estate:
      'Massachusetts estate tax: a $99,600 credit (since 2023) means estates of $2M or less owe nothing, with rates up to 16% above that and no cliff; there is no portability between spouses and no inheritance tax; heirs also face the federal estate tax above the $15M exemption (2026).',
    lending:
      'Full US broker access: every major broker (Schwab, Fidelity, IBKR and others) offers margin and securities-based lines to Massachusetts residents.',
    climate:
      'Long, cold winters with about 49 inches (125 cm) of snow in a typical year and nor\'easters that shut the city down, humid summers with highs in the low 80s °F (about 28 °C), and fine autumns; spring arrives late.',
    community:
      'A university and medical city with many newcomers; retirees are a modest share in the city itself, and many settle in the inner suburbs, on the North and South Shores or on Cape Cod.',
    access:
      'Logan (BOS), minutes from downtown, has nonstops across the US and to most large European cities, plus Tokyo, Seoul, Dubai and Doha; Amtrak runs to New York and Washington.',
  },
  drawbacks: [
    'Housing among the most expensive in the US; Boston\'s residential property tax rose to $12.40 per $1,000 (FY2026), offset in part by a residential exemption of about $4,350 on an owner\'s home',
    'Massachusetts estate tax from $2M, one of the lowest thresholds in the US',
    'Long, snowy winters and a late spring',
  ],
  sources: [
    { name: 'Mass.gov: Massachusetts tax rates', url: 'https://www.mass.gov/info-details/massachusetts-tax-rates', edition: '2026' },
    {
      name: 'Massachusetts General Laws c.62 §4 (5% rate, 8.5% on short-term gains)',
      url: 'https://malegislature.gov/Laws/GeneralLaws/PartI/TitleIX/Chapter62/Section4',
    },
    {
      name: 'Massachusetts General Laws c.65C §2A (estate tax: $2M threshold, $99,600 credit)',
      url: 'https://malegislature.gov/Laws/GeneralLaws/PartI/TitleIX/Chapter65C/Section2A',
    },
    {
      name: 'Bloomberg Tax: Massachusetts releases draft 2026 withholding methods (surtax threshold)',
      url: 'https://news.bloombergtax.com/payroll/massachusetts-releases-draft-2026-withholding-methods',
      edition: '2025',
    },
    {
      name: 'Boston.com: Boston\'s homicide count rises from 24 to 31 in 2025',
      url: 'https://www.boston.com/news/local-news/2026/01/12/bostons-homicide-rate-increases-30-from-2024-from-24-killings-to-31/',
      edition: '2026',
    },
    {
      name: 'GBH: Boston City Council approves increased tax rates',
      url: 'https://www.wgbh.org/news/politics/2025-12-11/boston-city-council-approves-increased-tax-rates-after-legislative-action-stalls',
      edition: '2025',
    },
    {
      name: 'Jamaica Plain Gazette: FY2026 Boston residential exemption ($12.40 rate, up to $4,353.74)',
      url: 'https://jamaicaplaingazette.com/2026/01/22/op-ed-your-property-matters-fy-2026-boston-residential-tax-exemption-can-save-you-up-to-4353-74-on-your-property-tax-bill/',
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
