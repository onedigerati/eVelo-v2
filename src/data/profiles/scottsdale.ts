import type { ExpatProfile } from '../expatPicks'

const profile: ExpatProfile = {
  tagline: 'Phoenix\'s low taxes and Mayo Clinic, in its safest and most polished suburb',
  summary:
    'Arizona taxes dividends, interest and gains at a flat 2.5%, exempts Social Security and has no estate or inheritance tax, so a buy-borrow-die retiree based in Scottsdale pays very little to the state and nothing on the estate, with full access to US brokers and securities-based lending. Scottsdale adds low crime, a Level 1 trauma centre and Mayo Clinic\'s campus nearby, golf and desert trails, and Sky Harbor 20 minutes away. The costs are some of the highest house prices in Arizona, the same brutal summers as Phoenix and the region\'s Colorado River cuts.',
  scores: { cost: 2, healthcare: 5, safety: 4, visa: 5, climate: 2, community: 5, tax: 5, estate: 5, lending: 5 },
  facts: {
    healthcare:
      'HonorHealth Scottsdale Osborn is a Level 1 trauma centre, Mayo Clinic has a large outpatient campus in Scottsdale and its hospital (part of Mayo\'s NCI-designated comprehensive cancer centre) about 20 minutes north in Phoenix, and Phoenix\'s other big hospitals are close by; Medicare applies from 65.',
    safety:
      'The US is 134th of 163 in the 2026 Global Peace Index, but Scottsdale is among the safest large US cities (its police cite a top-15 ranking among cities over 100,000): the most serious (NIBRS Group A) offences fell 24% in 2025, though homicides reached a five-year high of six (secondary source).',
    visa: 'No visa needed: a US citizen can live there without any residency process.',
    tax: 'Arizona taxes all income, dividends, interest and realised gains included, at a flat 2.5% (since 2023), and exempts Social Security; Scottsdale levies no city income tax.',
    estate:
      'No state estate or inheritance tax: Arizona\'s estate tax was a pick-up of the federal state death tax credit and was repealed in 2006, so heirs owe only the federal estate tax above the $15M exemption (2026).',
    lending:
      'Full US broker access: every major broker (Schwab, Fidelity, IBKR and others) offers margin and securities-based lines to Arizona residents.',
    climate:
      'Extreme desert heat, as in Phoenix: 122 days at 100 °F (38 °C) or more and 37 at 110 °F (43 °C) or more at Sky Harbor in 2025, a little milder in the higher north of the city; winters are sunny and mild.',
    community:
      'A long-established retiree and snowbird town, with many active-adult and golf communities in north Scottsdale and a busy winter season of spring training, arts and resorts.',
    access:
      'Phoenix Sky Harbor (PHX) is about 20 minutes away, with nonstops to most US cities, London Heathrow, Taipei, Canada and Mexico; Scottsdale Airport serves private jets.',
  },
  drawbacks: [
    'House prices among the highest in Arizona',
    'Four months or more of 100 °F heat each summer',
    'Colorado River cuts that are likely to raise water costs across the Phoenix area',
  ],
  sources: [
    { name: 'Arizona Revised Statutes §43-1011: taxes and tax rates', url: 'https://www.azleg.gov/ars/43/01011.01.htm' },
    { name: 'Arizona Department of Revenue: 2025 Form 140EZ booklet (2.5% rate)', url: 'https://azdor.gov/sites/default/files/document/FORMS_INDIVIDUAL_2025_140EZBooklet.pdf', edition: '2025' },
    { name: 'Arizona Department of Revenue: Publication 10 (estate tax repeal)', url: 'https://www.azdor.gov:443/sites/default/files/2023-03/PUBLICATION_10.pdf' },
    {
      name: 'Spokesman-Review: US falls again in global peace rankings',
      url: 'https://www.spokesman.com/stories/2026/jun/11/us-falls-again-in-global-peace-rankings-while-icel/',
      edition: '2026',
    },
    { name: 'Ground News: Scottsdale reports crime rate falling (2025 figures)', url: 'https://ground.news/article/scottsdale-reports-crime-rate-falling', edition: '2026' },
    {
      name: 'City of Scottsdale: police department highlights a year of safety',
      url: 'https://www.scottsdaleaz.gov/news/details/scottsdale-police-department-highlights-a-year-of-safety-innovation-and-community-trust',
    },
    { name: 'National Weather Service Phoenix: 2025 year in review', url: 'https://www.weather.gov/psr/yearinreview2025', edition: '2025' },
    {
      name: 'KUNC: Colorado River cuts won\'t make Phoenix taps go dry, but the backup plan will cost billions',
      url: 'https://www.kunc.org/regional-news/2026-09-09/colorado-river-cuts-wont-make-phoenix-taps-go-dry-but-the-backup-plan-will-cost-billions',
      edition: '2026',
    },
  ],
}

export default profile
