import type { ExpatProfile } from '../expatPicks'

const profile: ExpatProfile = {
  tagline: 'Low-cost Andean city, US dollar, steep inheritance tax',
  summary:
    'Ecuador is 11th in International Living\'s 2026 index and uses the US dollar. Its rentista visa takes investment income at about $1,446 a month, and Cuenca is a long-established US retiree base with some of the lowest costs on this list. For BBD it ranks near the bottom: worldwide income is taxed at up to 37%, and an inheritance tax of up to 35% reaches residents\' foreign assets.',
  scores: { cost: 5, healthcare: 3, safety: 3, visa: 5, climate: 4, community: 4, tax: 2, estate: 2, lending: 5 },
  facts: {
    healthcare:
      'Private hospitals such as Hospital Universitario del Río, Santa Inés and Monte Sinaí give good care at low prices (consultations $20–50); residents with a cédula can join IESS voluntarily at 17.6% of declared income, minimum $84.86/month (2026), and complex cases may go to Quito or Guayaquil.',
    safety:
      'Ecuador is 135th of 163 in the 2026 Global Peace Index and reportedly at US State Dept Level 2 (renewed August 2026), with Level 4 zones on the coast, including part of Guayaquil, and along the borders; Cuenca is not among the higher-risk areas.',
    visa:
      'The rentista visa accepts investment income ("títulos de inversión") of at least 3× the basic wage, about $1,446/month (+$250 per dependant), with health insurance covering Ecuador; the investor route is about $48,200 (100× the basic wage, unverified on the official page); 2 years of temporary residence, then permanent.',
    tax: 'No general wealth tax (only a municipal asset tax on people who must keep accounts); residents are taxed on worldwide income, including US dividends and interest, at up to 37% (above $109,956 in 2026), with a foreign tax credit and no US–Ecuador income tax treaty.',
    estate:
      'Inheritance tax runs from 0% up to $78,527 to 35% above $942,353 per heir (2026 table) and reaches the foreign assets of Ecuadorian residents; with no US estate treaty, the US gives no credit on US-sited stocks, so it can stack on any US estate tax.',
    lending:
      'Interactive Brokers reportedly accepts Ecuador residents, and Schwab One International\'s application reportedly lists Ecuador (October 2026), with no known margin restriction outside Europe; IBKR margin terms by country are unconfirmed.',
    climate: 'Spring-like all year at about 2,560 m (roughly 10–22°C), with frequent rain; the altitude can matter for heart and lung conditions.',
    community: 'One of the largest US retiree communities in Latin America, with English-language groups and services; Spanish is still needed day to day.',
    access:
      'No commercial US flights from Cuenca: drive or fly to Guayaquil or Quito, which reportedly have nonstops to Miami, Fort Lauderdale, Houston, Atlanta and New York (check current schedules).',
  },
  drawbacks: [
    'An inheritance tax of up to 35% that reaches US assets, with no treaty relief',
    'Worldwide tax on dividends and interest at up to 37%',
    'Ecuador ranks low on safety (135th in the Global Peace Index), and every US trip starts with a connection',
  ],
  sources: [
    { name: 'PwC Worldwide Tax Summaries: Ecuador, taxes on personal income', url: 'https://taxsummaries.pwc.com/ecuador/individual/taxes-on-personal-income', edition: '2026' },
    { name: 'NMS Law: Ecuador tax tables 2026 (income and inheritance)', url: 'https://nmslaw.com.ec/blog/2026/01/05/tablas-impuesto-renta-2026-ecuador/', edition: '2026' },
    { name: 'Ecuador Legal Online: Inheritance tax in Ecuador', url: 'https://www.ecuadorlegalonline.com/sri/impuesto-herencia-ecuador/' },
    { name: 'Gob.ec: Temporary rentista residence visa', url: 'https://www.gob.ec/mremh/tramites/concesion-visa-residencia-temporal-rentista' },
    { name: 'Ecuador Legal Online: Voluntary IESS affiliation', url: 'https://www.ecuadorlegalonline.com/laboral/afiliacion-voluntaria-iess/' },
    { name: 'Cuenca High Life: Healthcare in Cuenca for US expats', url: 'https://cuencahighlife.com/navigating-healthcare-in-cuenca-a-comprehensive-guide-for-us-expats/' },
    { name: 'Your Tax Base: Charles Schwab for expats (country list, Oct 2026)', url: 'https://yourtaxbase.com/blog/charles-schwab-for-expats' },
    {
      name: 'The Traveler: US renews Ecuador advisory, Guayaquil zone stays at Level 4 (Aug 2026)',
      url: 'https://www.thetraveler.org/us-renews-ecuador-travel-advisory-keeps-guayaquil-zone-at-level-4/',
    },
    { name: 'blogTO: Global Peace Index 2026 rankings', url: 'https://www.blogto.com/travel/2026/06/canada-ranking-most-peaceful-countries/', edition: '2026' },
  ],
}

export default profile
