import type { ExpatProfile } from '../expatPicks'

const profile: ExpatProfile = {
  tagline: 'Mayo Clinic, a 2.5% flat tax and America\'s biggest retiree draw, if you can take the heat',
  summary:
    'Arizona taxes dividends, interest and gains at a flat 2.5%, exempts Social Security and has no estate or inheritance tax, so a buy-borrow-die retiree based in Phoenix pays very little to the state and nothing on the estate, with full access to US brokers and securities-based lending. Phoenix adds Mayo Clinic, Barrow Neurological Institute, one of the largest retiree communities in the country and mild, sunny winters. The costs are brutal summers (122 days at 100 °F or more in 2025) and Colorado River cuts that are likely to push water bills up.',
  scores: { cost: 2, healthcare: 5, safety: 3, visa: 5, climate: 2, community: 5, tax: 5, estate: 5, lending: 5 },
  facts: {
    healthcare:
      'Mayo Clinic Arizona (part of Mayo\'s NCI-designated comprehensive cancer centre), Banner–University Medical Center Phoenix and Barrow Neurological Institute at St. Joseph\'s lead a large hospital market with several Level 1 trauma centres; Medicare applies from 65.',
    safety:
      'The US is 134th of 163 in the 2026 Global Peace Index; Phoenix police counted 84 homicides from January to September 2025, against 111 in the same months of 2024 and 137 in 2023, and property crime and uneven neighbourhoods are the everyday concerns.',
    visa: 'No visa needed: a US citizen can live there without any residency process.',
    tax: 'Arizona taxes all income, dividends, interest and realised gains included, at a flat 2.5% (since 2023), and exempts Social Security; Phoenix levies no city income tax.',
    estate:
      'No state estate or inheritance tax: Arizona\'s estate tax was a pick-up of the federal state death tax credit and was repealed in 2006, so heirs owe only the federal estate tax above the $15M exemption (2026).',
    lending:
      'Full US broker access: every major broker (Schwab, Fidelity, IBKR and others) offers margin and securities-based lines to Arizona residents.',
    climate:
      'Extreme desert heat: 122 days at 100 °F (38 °C) or more and 37 at 110 °F (43 °C) or more in 2025, after a record 70 days at 110 °F in 2024 (the most since records began in 1896), with warm nights; winters from November to March are sunny and mild.',
    community:
      'One of the largest retiree populations in the US, from Sun City and the active-adult towns of the West Valley to the snowbirds who arrive each winter; newcomers from California and the Midwest keep the metro growing.',
    access:
      'Phoenix Sky Harbor (PHX), an American hub and a big Southwest base, has nonstops to most US cities, London Heathrow (British Airways and American), Taipei (STARLUX since January 2026), Canada and Mexico.',
  },
  drawbacks: [
    'Four months or more of 100 °F heat each summer',
    'Colorado River cuts: about 40% of Phoenix\'s water comes from the river, and bills are likely to rise',
    'Car-dependent sprawl and uneven neighbourhoods',
  ],
  sources: [
    { name: 'Arizona Revised Statutes §43-1011: taxes and tax rates', url: 'https://www.azleg.gov/ars/43/01011.01.htm' },
    { name: 'Arizona Department of Revenue: 2025 Form 140EZ booklet (2.5% rate)', url: 'https://azdor.gov/sites/default/files/document/FORMS_INDIVIDUAL_2025_140EZBooklet.pdf', edition: '2025' },
    { name: 'Arizona JLBC: 2025 tax handbook', url: 'https://www.azjlbc.gov/revenues/25taxbk.pdf', edition: '2025' },
    { name: 'Arizona Department of Revenue: Publication 10 (estate tax repeal)', url: 'https://www.azdor.gov:443/sites/default/files/2023-03/PUBLICATION_10.pdf' },
    {
      name: 'Spokesman-Review: US falls again in global peace rankings',
      url: 'https://www.spokesman.com/stories/2026/jun/11/us-falls-again-in-global-peace-rankings-while-icel/',
      edition: '2026',
    },
    {
      name: 'azfamily: Phoenix police data show homicides, violent crime down heading into 2026',
      url: 'https://www.azfamily.com/2026/01/01/phoenix-police-data-show-homicides-violent-crime-down-heading-into-2026/',
      edition: '2026',
    },
    { name: 'National Weather Service Phoenix: 2025 year in review', url: 'https://www.weather.gov/psr/yearinreview2025', edition: '2025' },
    { name: 'National Weather Service Phoenix: extreme temperatures (110 °F day records)', url: 'https://www.weather.gov/psr/ExtremeTemps' },
    {
      name: 'City of Phoenix: prepared as federal framework outlines potential Colorado River cuts',
      url: 'https://www.phoenix.gov/newsroom/water-services-news/phoenix-prepared-as-federal-framework-outlines-potential-cuts-to.html',
      edition: '2026',
    },
    {
      name: 'KUNC: Colorado River cuts won\'t make Phoenix taps go dry, but the backup plan will cost billions',
      url: 'https://www.kunc.org/regional-news/2026-09-09/colorado-river-cuts-wont-make-phoenix-taps-go-dry-but-the-backup-plan-will-cost-billions',
      edition: '2026',
    },
    {
      name: 'Phoenix Sky Harbor: STARLUX launches nonstop service between Taipei and Phoenix',
      url: 'https://www.skyharbor.com/about-phx/news-media/phx-check-in/2026/january-2026/starlux-airlines-launches-nonstop-service-between-taipei-and-phoenix/',
      edition: '2026',
    },
  ],
}

export default profile
