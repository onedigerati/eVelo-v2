import type { ExpatProfile } from '../expatPicks'
import { S } from './_shared'

const profile: ExpatProfile = {
  tagline: 'Highland arts town, Mexico\'s classic American enclave',
  summary:
    'San Miguel de Allende is on Forbes\' 2026 list and is one of the towns most often reported as home by foreign residents in Mexico News Daily\'s 2026 survey. It offers a dry highland climate, a walkable colonial centre and a deep English-speaking community, in a state with high crime.',
  // TODO(stage5): set tax, estate and lending from the rubric (3 is a placeholder).
  scores: { cost: 3, healthcare: 3, safety: 2, visa: 3, climate: 4, community: 5, tax: 3, estate: 3, lending: 3 },
  facts: {
    // TODO(stage5): write the estate and lending facts; rewrite tax and visa for BBD.
    estate: 'TODO',
    lending: 'TODO',
    healthcare: 'Local private hospitals (H+, MAC) cover routine and moderate care; major procedures usually mean Querétaro, about an hour away; IMSS buy-in is available, with limits.',
    safety:
      'Mexico is 137th of 163 in the 2026 Global Peace Index, and Guanajuato is reportedly US State Dept Level 3, "reconsider travel", with one of Mexico\'s highest homicide counts; the town itself is reported to be calmer, but no city data was found.',
    visa: 'Temporary residency needs about $4,430/month net income or about $74,700 in savings or investments; permanent residency for retirees about $7,430/month or $299,000 (2026 figures); brokerage balances generally count, and amounts vary by consulate.',
    tax: 'Mexican tax residents are taxed on worldwide income, so US dividends, interest and gains are reportable in Mexico; the US–Mexico treaty and foreign tax credits help only partly (get local advice and check current rules).',
    climate: 'At about 1,900 m: dry, sunny and mild, with near-freezing winter nights, a hot May and moderate summer rains.',
    community: 'A long-standing, very large US and Canadian retiree community, rich in arts and volunteer groups; daily life is easy in English.',
    access: 'No airport: León/Bajío is about 1.5 hours away and Querétaro about 1 hour, both with nonstops to Texas and some other US hubs (check current routes).',
  },
  drawbacks: [
    'It sits in Guanajuato, one of Mexico\'s most violent states',
    'High prices for Mexico, driven by foreign demand and tourism',
    'Serious medical care and airports are an hour or more away by road',
  ],
  sources: [
    { ...S.mxAdvisory, name: 'Jetpac: Is it safe to travel to Mexico (Guanajuato Level 3, 2026)' },
    {
      name: 'Mexico News Daily: Expat Safety Perceptions Index Q1 2026',
      url: 'https://mexiconewsdaily.com/news/how-safe-is-mexico-according-to-its-foreign-residents-the-survey-results/',
    },
    S.mxResidency,
    S.forbes,
  ],
}

export default profile
