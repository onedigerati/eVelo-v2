import type { ExpatProfile } from '../expatPicks'

const profile: ExpatProfile = {
  tagline: 'A low flat tax and no estate tax, in a mountain town that draws retirees',
  summary:
    'North Carolina taxes dividends, interest and gains at a flat 3.99% (2026), falling to 3.49% in 2027, and has had no estate or inheritance tax since 2013, so a buy-borrow-die retiree in Asheville keeps most of the portfolio\'s income and passes it on free of state tax, with full access to US brokers and securities-based lending. Asheville adds a cooler mountain climate, the Blue Ridge Parkway on the doorstep, an arts and food scene and a large community of retirees who chose it. The costs are a single dominant hospital system, a small airport, housing that has outrun local incomes and the damage left by Hurricane Helene in 2024.',
  scores: { cost: 2, healthcare: 3, safety: 3, visa: 5, climate: 4, community: 5, tax: 5, estate: 5, lending: 5 },
  facts: {
    healthcare:
      'Mission Hospital (owned by HCA since 2019) is the region\'s referral centre and, since December 2025, western North Carolina\'s only Level 1 trauma centre, alongside AdventHealth and Pardee; federal inspectors have placed Mission in "immediate jeopardy" three times since 2019 (most recently lifted in November 2025, with Medicare compliance issues still open), and for the most specialised care many patients travel to Charlotte (about 2 hours) or Duke and UNC (about 4 hours); Medicare applies from 65.',
    safety:
      'The US is 134th of 163 in the 2026 Global Peace Index; Asheville police reported 451 violent crimes in 2025, down 24% from 2024, and six homicides, but property crime rose 10% (to 4,038 incidents) and downtown homelessness is visible.',
    visa: 'No visa needed: a US citizen can live there without any residency process.',
    tax: 'North Carolina taxes dividends, interest and realised gains at a flat 3.99% (2026, down from 4.25% in 2025); S.B. 257 (July 2026) cuts it to 3.49% for 2027–2029, 3.24% for 2030–2032 and 2.99% from 2033; Social Security is exempt, and there is no city income tax.',
    estate:
      'No state estate or inheritance tax: North Carolina repealed its inheritance tax in 1999 and its estate tax for deaths from 1 January 2013, so heirs owe only the federal estate tax above the $15M exemption (2026).',
    lending:
      'Full US broker access: every major broker (Schwab, Fidelity, IBKR and others) offers margin and securities-based lines to North Carolina residents.',
    climate:
      'At about 2,100 ft (650 m), summers are milder than the Piedmont, with highs in the low 80s °F (about 28 °C), and winters bring highs in the upper 40s °F (about 9 °C) and some snow; Hurricane Helene\'s floods in September 2024 killed dozens in the region and wrecked the River Arts District, a reminder of flash-flood and landslide risk.',
    community:
      'A long-standing retirement magnet: many newcomers are retirees from Florida, the Northeast and the Midwest, drawn by the mountains, the arts and craft scene, breweries and the University of North Carolina Asheville\'s lifelong-learning programme.',
    access:
      'Asheville Regional (AVL) is small, with about 26 nonstop destinations (2026), mostly airline hubs and Florida, and handled a near-record 2.24 million passengers in 2025; for long-haul and international flights most residents connect or drive about 2 hours to Charlotte (CLT).',
  },
  drawbacks: [
    'One dominant hospital system, with top-tier care 2–4 hours away',
    'Housing costs high for the local economy, and recovery from Hurricane Helene still under way',
    'A small airport with few nonstops',
  ],
  sources: [
    { name: 'NC Department of Revenue: tax rate schedules', url: 'https://www.ncdor.gov/taxes-forms/tax-rate-schedules', edition: '2026' },
    {
      name: 'EY Tax News: North Carolina law progressively lowers personal income tax rate',
      url: 'https://taxnews.ey.com/news/2026-1630-north-carolina-law-progressively-lowers-personal-income-tax-rate-over-several-years',
      edition: '2026',
    },
    {
      name: 'NC General Assembly: Chapter 105, Article 1A (estate tax repealed from 1 January 2013)',
      url: 'https://house.ncleg.gov/EnactedLegislation/Statutes/HTML/ByArticle/Chapter_105/Article_1A.html',
    },
    {
      name: '828newsNOW: Asheville sees drop in violent crime in 2025',
      url: 'https://mymix965.com/news/228822-asheville-sees-drop-in-violent-crime-in-2025',
      edition: '2026',
    },
    {
      name: 'AviationPros: Asheville Regional Airport records second-busiest year with 2.24 million passengers in 2025',
      url: 'https://www.aviationpros.com/airport-business/news/55362085/asheville-regional-airport-records-second-busiest-year-with-224-million-passengers-in-2025',
      edition: '2026',
    },
    {
      name: 'Public Radio East: Mission Hospital designated sole Level I trauma center in western North Carolina',
      url: 'https://www.publicradioeast.org/2025-12-04/mission-hospital-designated-sole-level-i-trauma-center-in-western-north-carolina',
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
