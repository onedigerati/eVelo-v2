import type { ExpatProfile } from '../expatPicks'
import { S } from './_shared'

const profile: ExpatProfile = {
  tagline: 'Portugal\'s safety and visa, spring-like all year',
  summary:
    'Madeira has Portugal\'s strengths (7th in the Global Peace Index, the low D7 income bar, EU healthcare) and one of Europe\'s mildest climates, warm and even all year. Residents also pay regional income tax rates up to 30% below the mainland, but it is an island with one main hospital and limited flights.',
  // TODO(stage5): set tax, estate and lending from the rubric (3 is a placeholder).
  scores: { cost: 3, healthcare: 3, safety: 5, visa: 4, climate: 5, community: 3, tax: 3, estate: 3, lending: 3 },
  facts: {
    // TODO(stage5): write the estate and lending facts; rewrite tax and visa for BBD.
    estate: 'TODO',
    lending: 'TODO',
    healthcare:
      'Legal residents can register with SESARAM, the regional public service (main hospital: Dr. Nélio Mendonça in Funchal); the private Hospital Particular da Madeira and Hospital da Luz Funchal have English-speaking staff, and highly specialised care generally means a transfer to Lisbon or Porto.',
    safety: 'Portugal is 7th in the 2026 Global Peace Index; Funchal has very low crime, and the main risks are steep roads, wildfires and landslides after heavy rain.',
    visa: 'D7 passive-income visa: at least €920/month (the 2026 minimum wage; +50% for a spouse) plus housing and savings; AIMA processing backlogs are common.',
    tax: 'NHR is closed to new arrivals; Madeira residents pay regional IRS rates up to 30% below the mainland (reportedly a 33.6% top rate vs 48%), and Portuguese-source dividends and interest reportedly 19.6% vs 28%; whether the cut reaches US-source dividends and gains is unclear, and the US–Portugal treaty applies (check current rules).',
    climate: 'Subtropical and very even: days roughly 19–20°C in winter and 25–26°C in summer, drier and sunnier on the south coast around Funchal.',
    community: 'A smaller English-speaking scene than the Algarve, mostly British and German retirees plus a growing remote-worker crowd.',
    access: 'United flies Newark–Madeira 3 times a week in summer (from 16 May 2026); the rest of the year, connect via Lisbon, Porto or another European hub.',
  },
  drawbacks: [
    'One main public hospital, and complex care can mean a flight to Lisbon',
    'Year-round US trips mean a connection; the Newark nonstop is summer-only',
    'Very hilly terrain, and housing has risen quickly with tourism and remote workers',
  ],
  sources: [
    S.d7,
    S.ptTax,
    {
      name: 'Cyril Jarnias: healthcare for expats in Madeira',
      url: 'https://www.jarniascyril.com/expatriation/settling-in-madeira-complete-guide-expats/healthcare-expatriates-madeira-complete-guide/',
    },
    S.unitedSummer,
    S.gpiTop50,
  ],
}

export default profile
