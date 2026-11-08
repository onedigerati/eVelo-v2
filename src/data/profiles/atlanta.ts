import type { ExpatProfile } from '../expatPicks'

const profile: ExpatProfile = {
  tagline: 'A sub-5% state tax, a big retirement exclusion and the world\'s busiest airport',
  summary:
    'Georgia cut its flat income tax to 4.99% for 2026, lets residents 65 and over exclude up to $65,000 each of retirement income, interest, dividends and gains included, and has no estate or inheritance tax, so a buy-borrow-die retiree based in Atlanta pays little state tax on the portfolio and passes it on untouched by the state, with full access to US brokers and securities-based lending. Atlanta adds Emory\'s NCI comprehensive cancer centre, Grady\'s Level 1 trauma centre, mild winters and nonstops almost anywhere from Hartsfield-Jackson. The costs are traffic and sprawl, hot humid summers and violent crime above the US average.',
  scores: { cost: 2, healthcare: 5, safety: 2, visa: 5, climate: 4, community: 4, tax: 5, estate: 5, lending: 5 },
  facts: {
    healthcare:
      'Emory Healthcare (its Winship Cancer Institute is NCI-designated comprehensive) and Grady Memorial (a Level 1 trauma centre) lead a deep hospital market with Piedmont, Northside and Wellstar; Medicare applies from 65.',
    safety:
      'The US is 134th of 163 in the 2026 Global Peace Index; Atlanta police counted 98 homicides in 2025 (preliminary), the fewest since 2018 and down from 171 in 2022, but still about 19 per 100,000, and car break-ins are common.',
    visa: 'No visa needed: a US citizen can live there without any residency process.',
    tax: 'Georgia taxes dividends, interest and realised gains at a flat 4.99% from 2026 (HB 463, down from 5.19%), and set to fall a further point to 3.99% over about eight years if revenue triggers are met; residents 62–64 can exclude up to $35,000 and those 65+ up to $65,000 each of retirement income, which includes interest, dividends and capital gains; Social Security is exempt and there is no city income tax.',
    estate:
      'No state estate or inheritance tax: Georgia\'s estate tax was tied to the federal state death tax credit and has not applied to deaths after 2004 (formally abolished in 2014), so heirs owe only the federal estate tax above the $15M exemption (2026).',
    lending:
      'Full US broker access: every major broker (Schwab, Fidelity, IBKR and others) offers margin and securities-based lines to Georgia residents.',
    climate:
      'Mild winters with highs around 53 °F (12 °C) and only occasional ice or snow, long springs and autumns, and hot, humid summers with highs near 90 °F (32 °C) and frequent thunderstorms; hurricane remnants bring heavy rain some years.',
    community:
      'One of the fastest-growing US metros, full of newcomers from the Northeast and Midwest and a long-standing draw for Black professionals and retirees; retirees settle in the northern and eastern suburbs and in active-adult communities around the metro.',
    access:
      'Hartsfield-Jackson (ATL), Delta\'s main hub and the world\'s busiest airport by passengers, has nonstops to nearly every US city and to Europe, Latin America, Africa and Asia; MARTA rail runs from the terminal to downtown and Midtown.',
  },
  drawbacks: [
    'Heavy traffic and car-dependent sprawl',
    'Violent crime above the US average, though falling',
    'Hot, humid summers',
  ],
  sources: [
    { name: 'Georgia Department of Revenue: retirement income exclusion', url: 'https://dor.georgia.gov/retirement-income-exclusion' },
    {
      name: 'Office of the Governor: Gov. Kemp signs legislation lowering taxes (HB 463, 4.99% from 2026)',
      url: 'https://topstatefortalent.georgia.gov/node/546',
      edition: '2026',
    },
    {
      name: 'Rough Draft Atlanta (Capitol Beat): Kemp signs tax relief laws (HB 463 rate path and triggers)',
      url: 'https://roughdraftatlanta.com/2026/05/11/kemp-signs-tax-relief-laws/',
      edition: '2026',
    },
    {
      name: 'Georgia Department of Audits and Accounts: retirement income exclusion summary ($35,000 / $65,000)',
      url: 'https://www.audits2.ga.gov/wp-content/uploads/2023/09/Retirement-Income-Exclusion-Summary.pdf',
      edition: '2023',
    },
    { name: 'Georgia Department of Revenue: estate tax FAQ', url: 'https://dor.georgia.gov/estate-tax-faq' },
    {
      name: 'AJC: Atlanta homicides on the decline, drop below 100 for first time since 2019',
      url: 'https://www.ajc.com/news/2026/01/atlanta-homicides-on-the-decline-drop-below-100-for-first-time-since-2019/',
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
