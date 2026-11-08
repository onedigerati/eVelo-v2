import type { ExpatProfile } from '../expatPicks'

const profile: ExpatProfile = {
  tagline: 'No state income or estate tax, with big retiree suburbs and a world-class airport',
  summary:
    'Nevada\'s constitution bars a personal income tax and the state has no estate or inheritance tax, so a buy-borrow-die retiree based in Las Vegas pays nothing to the state on dividends, gains or the estate, and keeps full access to US brokers and securities-based lending. The valley adds large retiree suburbs (Summerlin, Henderson), lower housing costs than California and nonstops worldwide. The costs are thin specialist care, summers that reached 120 °F in 2024 and a water supply that leans on a falling Lake Mead.',
  scores: { cost: 2, healthcare: 3, safety: 3, visa: 5, climate: 2, community: 4, tax: 5, estate: 5, lending: 5 },
  facts: {
    healthcare:
      'University Medical Center is Nevada\'s only Level 1 trauma centre, alongside the Sunrise, Valley Health and Dignity Health hospitals and Cleveland Clinic\'s Lou Ruvo brain-health centre, but Nevada had the fewest primary-care doctors per capita of any state in 2025 KFF data, and many residents travel to Los Angeles, Salt Lake City or Phoenix for complex care; Medicare applies from 65.',
    safety:
      'The US is 134th of 163 in the 2026 Global Peace Index; Las Vegas Metro police recorded 90 homicides in 2025, down about 21% and the first year under 100 since 2019, though the 2026 count was running about 21% ahead of 2025 by late August; the Strip and some central areas see more crime than the suburbs.',
    visa: 'No visa needed: a US citizen can live there without any residency process.',
    tax: 'No state income tax on dividends, interest or realised gains: the Nevada constitution (Art. 10, §1) bars any income tax on the personal income of natural persons, and there is no city income tax, so only federal tax applies.',
    estate:
      'No state estate or inheritance tax: Nevada\'s estate tax was a pick-up of the federal state death tax credit, needs no filing for deaths from 2005 and is no longer collected, so heirs owe only the federal estate tax above the $15M exemption (2026).',
    lending:
      'Full US broker access: every major broker (Schwab, Fidelity, IBKR and others) offers margin and securities-based lines to Nevada residents.',
    climate:
      'Extreme desert heat: an all-time record 120 °F (49 °C) on 7 July 2024 and a record 36 summer days at 110 °F (43 °C) or more that year, against 9 in 2025 and an average of about 10; winters are mild and sunny, with cold nights.',
    community:
      'Large retiree communities in Summerlin, Henderson and the Sun City developments, with many newcomers from California; daily life in the suburbs is far from the Strip.',
    access:
      'Harry Reid International (LAS) has nonstops to most US cities and about two dozen international markets, including London Heathrow (British Airways, Virgin Atlantic), Canada and Mexico, with seasonal Qantas flights from Sydney, three a week, from 29 December 2026 to March 2027.',
  },
  drawbacks: [
    'Thin specialist care; complex cases often go out of state',
    'Very hot summers, with a record 120 °F in 2024',
    'About 90% of the valley\'s water comes from Lake Mead, under a Colorado River shortage',
  ],
  sources: [
    { name: 'Ballotpedia: Article 10, Nevada Constitution', url: 'https://ballotpedia.org/Article_10,_Nevada_Constitution' },
    { name: 'Nevada Department of Taxation: estate tax FAQs', url: 'https://tax.nv.gov/faqs/estate-tax-faqs' },
    {
      name: 'Nevada Department of Taxation: notice of intent to adopt regulation R045-24 (estate tax not collected)',
      url: 'https://tax.nv.gov/wp-content/uploads/2024/07/NoticeofIntenttoAdoptaRegulation-R045-24.pdf',
      edition: '2024',
    },
    {
      name: "Becker's Hospital Review: primary care and specialist physicians per capita by state",
      url: 'https://www.beckershospitalreview.com/quality/hospital-physician-relationships/primary-care-specialist-physicians-per-capita-by-state/',
      edition: '2025',
    },
    {
      name: 'Spokesman-Review: US falls again in global peace rankings',
      url: 'https://www.spokesman.com/stories/2026/jun/11/us-falls-again-in-global-peace-rankings-while-icel/',
      edition: '2026',
    },
    {
      name: 'Las Vegas Review-Journal: as Metro shootings drop, the sheriff discusses goals for 2026',
      url: 'https://www.reviewjournal.com/local/local-las-vegas/as-metro-shootings-drop-and-traffic-deaths-remain-stubbornly-high-sheriff-discusses-goals-for-2026-3603268/',
      edition: '2026',
    },
    {
      name: 'News 3 Las Vegas: homicides up 21% as Las Vegas murder total reaches 73',
      url: 'https://news3lv.com/news/local/homicides-up-21-as-4-more-killings-push-las-vegas-murder-total-to-73',
      edition: '2026',
    },
    {
      name: 'Las Vegas Review-Journal: summer 2025 was hot in Las Vegas, but not like 2024',
      url: 'https://www.reviewjournal.com/local/weather/summer-2025-was-hot-in-las-vegas-but-not-like-2024-3435141',
      edition: '2025',
    },
    { name: 'Southern Nevada Water Authority: drought and shortage', url: 'https://www.snwa.com/water-resources/drought-and-shortage/' },
    { name: 'The Points Guy: Qantas launches Las Vegas nonstop flights', url: 'https://thepointsguy.com/news/qantas-airways-las-vegas-nonstop-flights/', edition: '2026' },
  ],
}

export default profile
