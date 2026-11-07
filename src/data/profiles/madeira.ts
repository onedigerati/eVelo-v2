import type { ExpatProfile } from '../expatPicks'
import { S } from './_shared'

const profile: ExpatProfile = {
  tagline: 'Portugal\'s BBD tax profile, spring-like all year',
  summary:
    'Madeira has Portugal\'s buy-borrow-die strengths (no wealth tax, children inherit free, a D7 visa that accepts dividends, 7th in the Global Peace Index) and one of Europe\'s mildest climates, warm and even all year. It is an island with one main hospital and limited flights.',
  scores: { cost: 3, healthcare: 3, safety: 5, visa: 4, climate: 5, community: 3, tax: 3, estate: 5, lending: 3 },
  facts: {
    healthcare:
      'Legal residents can register with SESARAM, the regional public service (main hospital: Dr. Nélio Mendonça in Funchal); the private Hospital Particular da Madeira and Hospital da Luz Funchal have English-speaking staff, and highly specialised care generally means a transfer to Lisbon or Porto.',
    safety: 'Portugal is 7th in the 2026 Global Peace Index; Funchal has very low crime, and the main risks are steep roads, wildfires and landslides after heavy rain.',
    visa: 'D7 passive-income visa: at least €920/month (the 2026 minimum wage; +50% for a second adult) from dividends, interest, rent or pensions, plus about €11,040 of savings; loan draws do not count as income, and AIMA processing backlogs are common.',
    tax: 'No wealth tax on financial assets; dividends and interest pay Portugal\'s 28% flat rate, with the 15% US withholding creditable under the treaty; Madeira\'s regional cuts (up to 30% below mainland rates) apply to the progressive scale and reportedly not to the 28% flat rate; NHR is closed; check current rules.',
    estate:
      'No inheritance tax as such: a 10% stamp duty reaches only assets located in Portugal, and spouses, children and grandchildren are exempt, so US brokerage assets left to US-resident children appear untaxed locally; there is no US–Portugal estate treaty, and the $15M US exemption (2026) applies as anywhere.',
    lending:
      'IBKR reportedly accepts Portugal residents (likely through its EU entity), and Schwab International reportedly accepts them too, but Schwab reportedly bars Europe residents from taking cash out through margin, so plan on IBKR margin; EU PRIIPs rules reportedly block new buys of US-listed ETFs, not holding them.',
    climate: 'Subtropical and very even: days roughly 19–20°C in winter and 25–26°C in summer, drier and sunnier on the south coast around Funchal.',
    community: 'A smaller English-speaking scene than the Algarve, mostly British and German retirees plus a growing remote-worker crowd.',
    access: 'United flies Newark–Madeira 3 times a week in summer (from 16 May 2026); the rest of the year, connect via Lisbon, Porto or another European hub.',
  },
  drawbacks: [
    'One main public hospital, and complex care can mean a flight to Lisbon',
    'Year-round US trips mean a connection; the Newark nonstop is summer-only',
    '28% on dividends and interest, and Schwab margin can\'t be drawn as cash',
  ],
  sources: [
    { name: 'PwC: Portugal, other taxes', url: 'https://taxsummaries.pwc.com/portugal/individual/other-taxes', edition: '2026' },
    { name: 'PwC: Portugal, taxes on personal income', url: 'https://taxsummaries.pwc.com/portugal/individual/taxes-on-personal-income', edition: '2026' },
    { name: 'Portugalist: D7 visa requirements', url: 'https://www.portugalist.com/d7-visa-requirements/', edition: '2026' },
    { name: 'YourTaxBase: Charles Schwab for expats', url: 'https://yourtaxbase.com/blog/charles-schwab-for-expats', edition: '2026' },
    {
      name: 'Cyril Jarnias: healthcare for expats in Madeira',
      url: 'https://www.jarniascyril.com/expatriation/settling-in-madeira-complete-guide-expats/healthcare-expatriates-madeira-complete-guide/',
    },
    S.unitedSummer,
    S.gpiTop50,
  ],
}

export default profile
