import type { ExpatProfile } from '../expatPicks'

const profile: ExpatProfile = {
  tagline: 'Spring-like climate and great hospitals, but costly taxes for BBD',
  summary:
    'Colombia was 2nd in Expat Insider 2025 and is 15th in International Living\'s 2026 index, and Medellín pairs a mild climate all year with some of Latin America\'s best private hospitals at low cost. For a BBD retiree it ranks low: residents pay a worldwide wealth tax above about $1.2M, dividends are taxed at up to 39%, and inheritances at 15%. Safety is also weak, with Colombia 141st of 163 in the 2026 Global Peace Index.',
  scores: { cost: 4, healthcare: 4, safety: 2, visa: 3, climate: 5, community: 4, tax: 1, estate: 2, lending: 4 },
  facts: {
    healthcare:
      'Private hospitals Pablo Tobón Uribe, San Vicente Fundación, Clínica Medellín and Las Américas were all in Newsweek\'s Colombia top 25 (2023 edition); EPS access depends on visa type, and private "medicina prepagada" plans have product-specific entry ages (one SURA plan requires entry under 70).',
    safety:
      'Colombia is 141st of 163 in the 2026 Global Peace Index and reportedly at US State Dept Level 3, "reconsider travel" (March 2026), with warnings about scopolamine druggings and dating-app robberies in Medellín; expats cluster in El Poblado and Laureles.',
    visa:
      'V-Rentista accepts dividends and portfolio yields but needs 10× the minimum wage, about COP 17.5M (~$5,440) a month, and is a visitor visa of up to 2 years that does not lead to permanent residency; the M-Investor route needs about $145k in Colombian real estate and leads to residency after 5 years, and M-Pensionado needs an actual pension.',
    tax: 'Residents pay wealth tax on worldwide net wealth above 72,000 UVT (COP 3.77bn, about $1.2M; 2026) at 0.5–1.5%, with the 1.5% band falling to 1% from 2027; worldwide income, including US dividends and interest, is taxed at up to 39%, with no US–Colombia income tax treaty (check current rules).',
    estate:
      'Inheritances are taxed to the heir as an occasional gain at 15%; how this applies to US-resident heirs inheriting US assets is unverified, and with no US estate treaty there is no US credit for it on US-sited stocks.',
    lending:
      'Interactive Brokers reportedly accepts Colombia residents, and Schwab One International\'s application reportedly lists Colombia (October 2026), with no known margin restriction outside Europe; IBKR margin terms by country are unconfirmed.',
    climate: '"Eternal spring" at about 1,500 m: roughly 22–28°C by day all year, with two rainy seasons.',
    community:
      'A large, young-skewing expat and digital-nomad scene in El Poblado and Laureles, and a smaller retiree community in nearby Envigado and Sabaneta; Spanish helps a lot.',
    access:
      'Nonstops reportedly include Miami, Fort Lauderdale and New York-JFK (mostly Avianca), plus American to Miami and United to Houston; about 4 hours to South Florida (check current schedules).',
  },
  drawbacks: [
    'A worldwide wealth tax above about $1.2M, plus dividends taxed at up to 39%',
    'Crime that targets foreigners (druggings, dating-app setups, robbery), and a reported Level 3 US advisory',
    'The rentista visa is costly ($5,440/month) and never leads to permanent residency',
  ],
  sources: [
    { name: 'PwC Worldwide Tax Summaries: Colombia, other taxes', url: 'https://taxsummaries.pwc.com/colombia/individual/other-taxes', edition: '2026' },
    { name: 'PwC Worldwide Tax Summaries: Colombia, taxes on personal income', url: 'https://taxsummaries.pwc.com/colombia/individual/taxes-on-personal-income', edition: '2026' },
    { name: 'DIAN: Oficio 8914 de 2026 (wealth tax)', url: 'https://normograma.dian.gov.co/dian/compilacion/docs/oficio_dian_8914_2026.htm', edition: '2026' },
    { name: 'Colombia Move: V-Rentista visa guide', url: 'https://colombiamove.com/blog/colombia-rentista-visa-v-rentista-guide/' },
    { name: 'Colombia Move: EPS vs medicina prepagada', url: 'https://colombiamove.com/blog/eps-vs-medicina-prepagada-colombia-healthcare-guide/' },
    { name: 'El Espectador: Colombia\'s 25 best hospitals per Newsweek', url: 'https://www.elespectador.com/salud/estos-son-los-25-mejores-hospitales-de-colombia-segun-newsweek/', edition: '2023' },
    { name: 'Your Tax Base: Charles Schwab for expats (country list, Oct 2026)', url: 'https://yourtaxbase.com/blog/charles-schwab-for-expats' },
    {
      name: 'El Espectador: Colombia falls in the Global Peace Index 2026',
      url: 'https://www.elespectador.com/mundo/america/colombia-retrocede-en-el-indice-global-de-paz-mientras-aumentan-los-conflictos-mundiales/',
      edition: '2026',
    },
    { name: 'Jetpac: Is it safe to travel to Colombia in 2026', url: 'https://blog.jetpacglobal.com/blog/is-it-safe-to-travel-to-colombia/' },
  ],
}

export default profile
