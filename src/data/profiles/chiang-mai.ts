import type { ExpatProfile } from '../expatPicks'
import { S } from './_shared'

const profile: ExpatProfile = {
  tagline: 'Very low cost, easy 50+ retirement visa',
  summary:
    'Thailand is 9th in International Living\'s 2026 index and 3rd in Expat Insider 2026, and Chiang Mai is one of the cheapest well-served retiree cities anywhere. Its retirement visa for people 50 and over is among the easiest to get.',
  // TODO(stage5): set tax, estate and lending from the rubric (3 is a placeholder).
  scores: { cost: 5, healthcare: 3, safety: 3, visa: 4, climate: 3, community: 5, tax: 3, estate: 3, lending: 3 },
  facts: {
    // TODO(stage5): write the estate and lending facts; rewrite tax and visa for BBD.
    estate: 'TODO',
    lending: 'TODO',
    healthcare:
      'Good, low-cost private hospitals (Bangkok Hospital Chiang Mai, Chiang Mai Ram); complex care is often referred to Bangkok, and foreigners rely on private insurance.',
    safety:
      'Thailand scores 2.089 in the 2026 Global Peace Index, 8th in Southeast Asia (its global rank could not be confirmed; it was 86th in 2025); street crime is low, but road safety is poor.',
    visa: 'Retirement visa (Non-O or O-A, age 50+): 800,000 baht held in a Thai bank, with yearly extensions and 90-day reporting; O-A applicants also need health insurance.',
    tax: 'Since 2024, residents present 180+ days a year are taxed on foreign income remitted into Thailand, at up to 35%; proposed relief has not been enacted, and the US–Thailand treaty applies (check current rules).',
    climate: 'A pleasant cool season (November–February), then a hot, smoky burning season (roughly February–April) with some of the world\'s worst air quality.',
    community: 'A large, long-standing Western retiree and digital-nomad community, with many English-language clubs and services.',
    access: 'No US nonstops; connect via Bangkok, Tokyo, Seoul or Taipei, typically 20+ hours.',
  },
  drawbacks: [
    'Burning-season air pollution is severe, and many expats leave for 2–3 months',
    'The visa needs renewing every year plus 90-day reports, and foreign income you bring into Thailand can now be taxed',
    'Far from the US, and serious medical cases often go to Bangkok',
  ],
  sources: [
    S.thRetire,
    {
      name: 'Legal500: Thailand proposed foreign income remittance amendment',
      url: 'https://www.legal500.com/developments/press-releases/thailand-proposes-new-amendment-to-tax-rule-for-foreign-income-remittance/',
    },
    S.seaGpi,
    { name: 'Nation Thailand: Thailand 86th in GPI 2025', url: 'https://www.nationthailand.com/sustaination/40052489', edition: '2025' },
  ],
}

export default profile
