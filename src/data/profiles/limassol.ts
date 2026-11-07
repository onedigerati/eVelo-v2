import type { ExpatProfile } from '../expatPicks'

const profile: ExpatProfile = {
  tagline: 'Cyprus\'s tax profile in its liveliest, best-served city',
  summary:
    'Limassol has the same Cyprus BBD profile as Paphos: a non-domiciled resident\'s dividends and interest carry only the capped 2.65% health contribution, with no wealth or inheritance tax, and Category F residence costs little. It adds the island\'s largest private hospital and an international business scene, at a higher cost than Paphos.',
  scores: { cost: 2, healthcare: 4, safety: 4, visa: 5, climate: 4, community: 4, tax: 5, estate: 5, lending: 3 },
  facts: {
    healthcare:
      'Limassol General Hospital plus Ygia Polyclinic (the largest private hospital in Cyprus, in GeSY since 2023), the German Oncology Center and other private clinics; Category F holders can join GeSY, with co-pays capped at €150 a year (2026), and Nicosia\'s reference centres are about an hour away.',
    safety:
      'Cyprus fell nine places to 80th in the 2026 Global Peace Index; UK travel advice says crime against tourists is not common, though protests can start at short notice and wildfire risk is high from April to October.',
    visa: 'Category F permanent residence: secured foreign income of at least €9,568 a year (+€4,613 per dependant), and dividends and interest count; renting is fine, no work is allowed, and the permit lapses after 2 years away; the alternative is €300k of new property plus €50k/yr of income.',
    tax: 'No wealth tax; dividends and interest are exempt from income tax, and a non-domiciled resident pays no Special Defence Contribution for 17 of 20 years, so they carry only the 2.65% GeSY contribution, capped at about €4.8k a year (PwC does not carve non-doms out of GeSY, so assume it applies); after that, a €250k lump sum covers 5 years.',
    estate: 'No inheritance or estate tax, and no gift tax between relatives to the third degree, so a US portfolio passes to US-resident children with no Cypriot tax; no US estate treaty is needed.',
    lending:
      'IBKR reportedly serves Cyprus residents (likely through its EU entity), with margin terms per country unknown; Schwab International is reportedly unavailable, and EU PRIIPs rules reportedly block new purchases of US ETFs, though existing holdings can usually be kept.',
    climate: 'Mediterranean with about 3,400 hours of sun: August highs average about 34°C, and January highs about 18°C with lows near 11°C.',
    community:
      'A large international population (about 22% of the district are non-Cypriot citizens, 2021 census), many of them Russian-speaking or working in shipping, finance and tech; English is the common language, though the scene is less retiree-centred than Paphos.',
    access: 'Larnaca airport is about 60 km away and Paphos airport about 45 minutes; both have direct flights to the UK and Europe, but there are no US nonstops.',
  },
  drawbacks: [
    'Rents and property prices are the highest in Cyprus',
    'Hot, humid summers and a long wildfire season',
    'Schwab International is reportedly unavailable, so borrowing rests on IBKR',
  ],
  sources: [
    { name: 'PwC: Cyprus, income determination', url: 'https://taxsummaries.pwc.com/cyprus/individual/income-determination' },
    { name: 'PwC: Cyprus, other taxes', url: 'https://taxsummaries.pwc.com/cyprus/individual/other-taxes' },
    {
      name: 'GK Law Firm: Cyprus Category F permanent residency',
      url: 'https://gk-lawfirm.com/practice-areas/immigration-law/cyprus-permanent-residency/category-f-visa',
    },
    { name: 'Demetriades Law: what is GeSY', url: 'https://www.demetriadeslaw.com/what-is-gesy/' },
    { name: 'index.cy: hospitals in Cyprus, 2026 guide', url: 'https://index.cy/articles/hospitals-in-cyprus-guide/' },
    { name: 'Cyprus Mail: Cyprus falls nine places in GPI 2026', url: 'https://cyprus-mail.com/2026/06/12/cyprus-falls-nine-places-in-global-peace-ranking', edition: '2026' },
    { name: 'GOV.UK: Cyprus travel advice, safety and security', url: 'https://www.gov.uk/foreign-travel-advice/cyprus/safety-and-security' },
    { name: 'YourTaxBase: Charles Schwab for expats (Oct 2026)', url: 'https://yourtaxbase.com/blog/charles-schwab-for-expats' },
    { name: 'Wikipedia: Limassol (climate, population)', url: 'https://en.wikipedia.org/wiki/Limassol' },
  ],
}

export default profile
