import type { ExpatProfile } from '../expatPicks'

const profile: ExpatProfile = {
  tagline: 'Colombia\'s best hospitals and low costs, but Colombia\'s taxes',
  summary:
    'Bogotá has Colombia\'s deepest bench of top private hospitals (5 of Newsweek\'s 2023 Colombia top 10), low living costs, a big cultural scene and the country\'s best flight links to the US. For a BBD retiree it carries the same costs as Medellín and Cartagena: residents pay a worldwide wealth tax above about $1.2M, dividends are taxed at up to 39% and inheritances at 15%. It is also high (2,600 m), cool and often grey, and street crime is a real concern, with Colombia 141st of 163 in the 2026 Global Peace Index.',
  scores: { cost: 5, healthcare: 4, safety: 2, visa: 3, climate: 3, community: 3, tax: 1, estate: 2, lending: 4 },
  facts: {
    healthcare:
      'Fundación Santa Fe de Bogotá (2nd), Hospital Universitario San Ignacio (5th), Clínica del Country (6th), Clínica de Marly (8th) and Clínica de la Colina (9th) are five of the top 10 in Newsweek\'s 2023 Colombia ranking, and the city has about nine of the top 25; EPS access depends on visa type, and private "medicina prepagada" plans have product-specific entry ages (one SURA plan requires entry under 70).',
    safety:
      'Colombia is 141st of 163 in the 2026 Global Peace Index and reportedly at US Level 3, "reconsider travel" (March 2026); Bogotá is not among the reported Level 4 departments, but street robbery, phone snatching and scopolamine druggings, sometimes through dating apps, target foreigners, and expats cluster in Chapinero, Usaquén and the north.',
    visa: 'V-Rentista accepts dividends and portfolio yields but needs 10× the minimum wage, about COP 17.5M (~$5,400) a month, and is a visitor visa of up to 2 years that does not lead to permanent residency; the M-Investor route needs 350× the minimum wage, about COP 613M (~$190k), in Colombian real estate, and M-Pensionado needs a pension of 3× the minimum wage, about COP 5.25M (~$1,620) a month (2026); both M visas can lead to residency after 5 years.',
    tax: 'Residents (183 days or more in any 365-day period) pay wealth tax on worldwide net wealth above 72,000 UVT (COP 3.77bn, about $1.2M; 2026) at 0.5–1.5%, with the 1.5% band falling to 1% from 2027; a decree lowering the 2026 threshold to 40,000 UVT was struck down (Sentencia C-079/2026), and a bill filed in October 2026 would raise it to 95,500 UVT and end the tax after 2030 (pending); worldwide income, including US dividends and interest, is taxed at up to 39%, with no US–Colombia income tax treaty (check current rules).',
    estate:
      'Inheritances are taxed to the heir as an occasional gain at 15%; how this applies to US-resident heirs inheriting US assets is unverified, and with no US estate treaty there is no US credit for it on US-sited stocks.',
    lending:
      'Interactive Brokers reportedly accepts Colombia residents, and Schwab One International\'s application reportedly lists Colombia (October 2026), with no known margin restriction outside Europe; IBKR margin terms by country are unconfirmed.',
    climate:
      'Cool highland climate at about 2,600 m: highs of about 19–20 °C and nights of 6–10 °C all year, often overcast, with rainy seasons in April–May and October–November; homes rarely have heating, and the altitude can matter for heart and lung conditions.',
    community:
      'A sizeable foreign community of diplomats, business people and digital nomads in Chapinero, Zona G and Usaquén, but fewer retirees than in Medellín; Spanish is needed for most daily life.',
    access:
      'El Dorado is Colombia\'s main hub, with nonstops reportedly to Miami, Fort Lauderdale, Orlando, Tampa, New York-JFK, Newark, Boston, Washington-Dulles, Chicago, Dallas, Houston and Atlanta on Avianca, American, United, Delta and LATAM; Miami is about 3.5 hours (check current schedules).',
  },
  drawbacks: [
    'A worldwide wealth tax above about $1.2M, dividends taxed at up to 39% and 15% on inheritances',
    'Street crime that targets foreigners, and a reported Level 3 US advisory',
    'High altitude, cool grey weather, and heavy traffic',
  ],
  sources: [
    { name: 'PwC Worldwide Tax Summaries: Colombia, other taxes', url: 'https://taxsummaries.pwc.com/colombia/individual/other-taxes', edition: '2026' },
    { name: 'PwC Worldwide Tax Summaries: Colombia, taxes on personal income', url: 'https://taxsummaries.pwc.com/colombia/individual/taxes-on-personal-income', edition: '2026' },
    { name: 'PwC Worldwide Tax Summaries: Colombia, residence', url: 'https://taxsummaries.pwc.com/colombia/individual/residence', edition: '2026' },
    { name: 'DIAN: Oficio 8914 de 2026 (wealth tax)', url: 'https://normograma.dian.gov.co/dian/compilacion/docs/oficio_dian_8914_2026.htm', edition: '2026' },
    { name: 'Colombia Move: V-Rentista visa guide', url: 'https://colombiamove.com/blog/colombia-rentista-visa-v-rentista-guide/', edition: '2026' },
    { name: 'Colombia Move: real estate investor visa (M), 2026', url: 'https://colombiamove.com/blog/colombia-real-estate-investor-visa-m10-2026/', edition: '2026' },
    { name: 'Colombia Move: pensionado visa income requirements, 2026', url: 'https://colombiamove.com/blog/es/colombia-pensionado-visa-income-requirements-2026/', edition: '2026' },
    { name: 'DIAN: Oficio 11166 de 2026 (Sentencia C-079/2026 and the wealth tax)', url: 'https://normograma.dian.gov.co/dian/compilacion/docs/oficio_dian_11166_2026.htm', edition: '2026' },
    { name: 'Portafolio: wealth tax would end in 2031 under the government\'s bill', url: 'https://www.portafolio.co/economia/gobierno/el-impuesto-al-patrimonio-desapareceria-en-2031-y-menos-personas-tendrian-que-pagarlo-esto-propuso-el-gobierno-505423', edition: '2026' },
    { name: 'Colombia Move: EPS vs medicina prepagada', url: 'https://colombiamove.com/blog/eps-vs-medicina-prepagada-colombia-healthcare-guide/' },
    { name: 'El Espectador: Colombia\'s 25 best hospitals per Newsweek', url: 'https://www.elespectador.com/salud/estos-son-los-25-mejores-hospitales-de-colombia-segun-newsweek/', edition: '2023' },
    { name: 'IRS: estate and gift tax treaties', url: 'https://www.irs.gov/businesses/small-businesses-self-employed/estate-gift-tax-treaties-international' },
    { name: 'Your Tax Base: Charles Schwab for expats (country list, Oct 2026)', url: 'https://yourtaxbase.com/blog/charles-schwab-for-expats' },
    {
      name: 'El Espectador: Colombia falls in the Global Peace Index 2026',
      url: 'https://www.elespectador.com/mundo/america/colombia-retrocede-en-el-indice-global-de-paz-mientras-aumentan-los-conflictos-mundiales/',
      edition: '2026',
    },
    { name: 'Travel Advisory: Colombia (mirrors US State Dept levels)', url: 'https://www.traveladvisory.io/advisory/colombia' },
    { name: 'GOV.UK: Colombia travel advice', url: 'https://www.gov.uk/foreign-travel-advice/colombia' },
    { name: 'Wikipedia: Bogotá', url: 'https://en.wikipedia.org/wiki/Bogot%C3%A1' },
    { name: 'Wikipedia: El Dorado International Airport', url: 'https://en.wikipedia.org/wiki/El_Dorado_International_Airport' },
  ],
}

export default profile
