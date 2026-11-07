import type { ExpatProfile } from '../expatPicks'
import { S } from './_shared'

const profile: ExpatProfile = {
  tagline: 'Spring-like Central Valley, universal public healthcare',
  summary:
    'Costa Rica is 3rd in International Living\'s 2026 index. The Central Valley around San José (Escazú, Santa Ana, Atenas, Grecia) pairs mild weather all year with the CCSS public system and good private hospitals, and its Rentista visa accepts investment income. A bill filed in September 2026 would end the tax-free treatment of residents\' foreign investment income if it passes.',
  // TODO(stage5): set tax, estate and lending from the rubric (3 is a placeholder).
  scores: { cost: 2, healthcare: 4, safety: 3, visa: 4, climate: 5, community: 4, tax: 3, estate: 3, lending: 3 },
  facts: {
    // TODO(stage5): write the estate and lending facts; rewrite tax and visa for BBD.
    estate: 'TODO',
    lending: 'TODO',
    healthcare:
      'Residents must join the CCSS ("Caja") public system, at a share of declared income (reportedly about 7–11%; confirm the rate); private hospitals such as CIMA, Clínica Bíblica and Metropolitano are faster.',
    safety:
      'Costa Rica is 62nd of 163 in the 2026 Global Peace Index and US State Dept Level 2; homicides peaked at 905 in 2023 and were 873 in 2025, with 2026 projected below 800.',
    visa:
      'Pensionado needs a $1,000/month lifetime pension (portfolio income does not count); Rentista suits portfolio-funded retirees: $2,500/month guaranteed for 2 years by a bank letter, or a $60k Costa Rican deposit; both take 6–18 months.',
    tax: 'Territorial today, so foreign investment income is generally untaxed, but bill No. 25.796 (filed 22 September 2026) would tax residents\' foreign interest, dividends and capital gains at 15%, with credit for foreign tax; not law as of November 2026, so check current rules.',
    climate: 'At 1,000–1,200 m the Central Valley is spring-like all year (about 20–27°C), with afternoon rains May–November.',
    community: 'A long-established US and Canadian community in Escazú, Santa Ana, Atenas and Grecia; English is common in services.',
    access: 'San José has nonstops to many US hubs (about 2.5–3 hours to Miami, Houston and Atlanta), and Liberia also serves the US.',
  },
  drawbacks: [
    'The pending 15% tax on residents\' foreign interest, dividends and gains would remove the main tax advantage for a portfolio-funded retiree',
    'One of Latin America\'s pricier countries, and a strong colón has pushed costs up for dollar earners',
    'Gang violence has stayed high since 2023, and petty theft and burglary are common',
  ],
  sources: [
    { name: 'Tico Times: Costa Rica proposes 15% tax on foreign income (Sept 2026)', url: 'https://ticotimes.net/2026/09/23/costa-rica-15-percent-tax-foreign-income' },
    { name: 'Golden Harbors: Costa Rica Rentista visa (Aug 2026)', url: 'https://goldenharbors.com/articles/costa-rica-rentista-visa' },
    {
      name: 'Tico Times: US travel advisory, Costa Rica Level 2 (Mar 2026)',
      url: 'https://ticotimes.net/2026/03/27/u-s-travel-advisory-highlights-costa-rica-as-a-safer-choice-in-central-america',
    },
    S.il,
    S.gpiPoster,
  ],
}

export default profile
