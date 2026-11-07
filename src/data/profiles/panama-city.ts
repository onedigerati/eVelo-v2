import type { ExpatProfile } from '../expatPicks'
import { S } from './_shared'

const profile: ExpatProfile = {
  tagline: 'Dollarized hub city with top private hospitals',
  summary:
    'Panama is 2nd in International Living\'s 2026 index and 1st in Expat Insider 2025 and 2026. The capital adds Central America\'s strongest private hospitals and Copa\'s hub, with nonstops to dozens of US cities, on top of the Pensionado visa and territorial tax.',
  // TODO(stage5): set tax, estate and lending from the rubric (3 is a placeholder).
  scores: { cost: 3, healthcare: 4, safety: 3, visa: 4, climate: 3, community: 4, tax: 3, estate: 3, lending: 3 },
  facts: {
    // TODO(stage5): write the estate and lending facts; rewrite tax and visa for BBD.
    estate: 'TODO',
    lending: 'TODO',
    healthcare:
      'Strong private hospitals (Pacifica Salud at Punta Pacífica, Hospital Nacional), often with US-trained doctors; pensionados get 15–20% off medical bills, and most expats use private insurance.',
    safety:
      'Panama is 81st of 163 in the 2026 Global Peace Index and US State Dept Level 2 (August 2026); expats favour Punta Pacífica, San Francisco and Casco, as some districts and nearby Colón have high crime.',
    visa:
      'Pensionado is permanent and needs a $1,000/month lifetime pension ($750 with $100k+ of Panama property); Social Security counts, portfolio income does not, and the investor route was reportedly raised to $500k in September 2026.',
    tax: 'Territorial: foreign pensions, dividends and capital gains are generally untaxed in Panama, and the currency is the US dollar; check current rules.',
    climate: 'Hot and humid all year (highs about 30°C / 86°F), with heavy rain roughly May–December.',
    community: 'Large, mixed international community of retirees, diplomats and business people; English is widely used where foreigners live.',
    access: 'Tocumen is Copa\'s hub, with nonstops to many US cities: about 3 hours to Miami and 4.5 to Houston.',
  },
  drawbacks: [
    'Heat, humidity and an eight-month rainy season',
    'Traffic, noise, and condo prices in expat areas close to mid-tier US cities',
    'Pensionado excludes portfolio income, and the investor route reportedly got pricier in 2026',
  ],
  sources: [
    S.il,
    {
      name: 'Reside Panama: Pensionado visa 2026',
      url: 'https://www.residepanama.com/en/reside-panama-blog/retiring-in-panama-in-2026-the-pensionado-visa-everything-you-need-to-know',
    },
    S.pensionado,
    S.gpiPoster,
  ],
}

export default profile
