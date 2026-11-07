import type { ExpatProfile } from '../expatPicks'

const profile: ExpatProfile = {
  tagline: 'Low-cost Andean city, US dollar, easy pensioner visa',
  summary:
    'Ecuador is 11th in International Living\'s 2026 index, uses the US dollar and offers a pensioner visa at about $1,446 a month, and Cuenca is a long-established US retiree base with some of the lowest costs on this list. The risk is security: Ecuador is 135th of 163 in the 2026 Global Peace Index, with the worst areas on the coast and borders.',
  // TODO(stage5): set tax, estate and lending from the rubric (3 is a placeholder).
  scores: { cost: 5, healthcare: 3, safety: 3, visa: 4, climate: 4, community: 4, tax: 3, estate: 3, lending: 3 },
  facts: {
    // TODO(stage5): write the estate and lending facts; rewrite tax and visa for BBD.
    estate: 'TODO',
    lending: 'TODO',
    healthcare:
      'Private hospitals such as Hospital del Río and Monte Sinaí reportedly give good care at low prices; residents with a cédula can join IESS public insurance from about $85 a month (2026), and complex cases may go to Quito or Guayaquil.',
    safety:
      'Ecuador is 135th of 163 in the 2026 Global Peace Index and reportedly at US State Dept Level 2 (renewed August 2026), with Level 4 zones on the coast, including part of Guayaquil, and along the borders; Cuenca is not among the higher-risk areas.',
    visa:
      'Pensioner visa: a foreign pension of at least 3× the basic wage, $1,446/month in 2026 (+$250 per dependant); the rentista visa takes investment returns at the same income, and the investor visa about $48,200 on deposit for 730 days or in property; 2 years of temporary residence, then permanent (official pages lag, so check current figures).',
    tax: 'Residents present 183+ days a year are taxed on worldwide income at up to 37%, with credit for foreign tax; sources disagree on whether foreign pensions are exempt, and there is no US–Ecuador income tax treaty (check current rules).',
    climate: 'Spring-like all year at about 2,560 m (roughly 10–22°C), with frequent rain; the altitude can matter for heart and lung conditions.',
    community: 'One of the largest US retiree communities in Latin America, with English-language groups and services; Spanish is still needed day to day.',
    access:
      'No commercial US flights from Cuenca: drive or fly to Guayaquil or Quito, which reportedly have nonstops to Miami, Fort Lauderdale, Houston, Atlanta and New York (check current schedules).',
  },
  drawbacks: [
    'Ecuador ranks low on safety (135th in the Global Peace Index), even if Cuenca has been calmer than the coast',
    'No US flights from Cuenca itself, so every trip home starts with a connection or a 3–4 hour drive',
    'The altitude, and cool, damp weather much of the year',
  ],
  sources: [
    { name: 'Rio Times: Residency in Ecuador for foreigners 2026', url: 'https://www.riotimesonline.com/residency-ecuador-foreigners-2026/' },
    { name: 'Rio Times: Retire in Ecuador 2026', url: 'https://www.riotimesonline.com/retire-in-ecuador-2026/' },
    {
      name: 'The Traveler: US renews Ecuador advisory, Guayaquil zone stays at Level 4 (Aug 2026)',
      url: 'https://www.thetraveler.org/us-renews-ecuador-travel-advisory-keeps-guayaquil-zone-at-level-4/',
    },
    { name: 'blogTO: Global Peace Index 2026 rankings', url: 'https://www.blogto.com/travel/2026/06/canada-ranking-most-peaceful-countries/', edition: '2026' },
    { name: 'Greenback Tax Services: Expat tax guide for Americans in Ecuador', url: 'https://www.greenbacktaxservices.com/country-guide/expat-taxes-for-ecuador/' },
  ],
}

export default profile
