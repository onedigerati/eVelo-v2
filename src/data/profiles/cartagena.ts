import type { ExpatProfile } from '../expatPicks'

const profile: ExpatProfile = {
  tagline: 'Colonial Caribbean city with easy US flights, but Colombia\'s taxes',
  summary:
    'Colombia was 2nd in Expat Insider 2025, and Cartagena\'s walled old city has nonstops to Miami, New York and Atlanta. For a BBD retiree it ranks near the bottom, for the same reasons as Medellín: residents pay a worldwide wealth tax above about $1.2M, dividends are taxed at up to 39% and inheritances at 15%. Its hospitals are also weaker than Medellín\'s, with one high-complexity hospital in the city.',
  scores: { cost: 4, healthcare: 3, safety: 2, visa: 3, climate: 2, community: 3, tax: 1, estate: 2, lending: 4 },
  facts: {
    healthcare:
      'Hospital Serena del Mar, run by Fundación Santa Fe de Bogotá and 15 minutes from the old city, calls itself the only high-complexity hospital in Cartagena (its JCI claim may refer to the Bogotá parent; unverified); Medellín has five hospitals in Newsweek\'s 2023 Colombia top 25, so serious cases may mean flying there or to Bogotá; private "medicina prepagada" plans have product-specific entry ages.',
    safety:
      'Colombia is 141st of 163 in the 2026 Global Peace Index and reportedly at US Level 3, "reconsider travel" (March 2026); Bolívar is not among the reported Level 4 departments, and UK advice against travel covers only southern Bolívar, not Cartagena; UK advice warns of robbery on the Caribbean coast and scopolamine druggings, sometimes through dating apps.',
    visa: 'V-Rentista accepts dividends and portfolio yields but needs 10× the minimum wage, about COP 17.5M (~$5,440) a month, and is a visitor visa of up to 2 years that does not lead to permanent residency; the M-Investor route needs about $145k in Colombian real estate and leads to residency after 5 years, and M-Pensionado needs an actual pension.',
    tax: 'Residents pay wealth tax on worldwide net wealth above 72,000 UVT (COP 3.77bn, about $1.2M; 2026) at 0.5–1.5%, with the 1.5% band falling to 1% from 2027; worldwide income, including US dividends and interest, is taxed at up to 39%, with no US–Colombia income tax treaty and no local relief in Bolívar (check current rules).',
    estate:
      'Inheritances are taxed to the heir as an occasional gain at 15%; how this applies to US-resident heirs inheriting US assets is unverified, and with no US estate treaty there is no US credit for it on US-sited stocks.',
    lending:
      'Interactive Brokers reportedly accepts Colombia residents, and Schwab One International\'s application reportedly lists Colombia (October 2026), with no known margin restriction outside Europe; IBKR margin terms by country are unconfirmed.',
    climate: 'Hot and humid all year: about 30°C on average, highs of 31–32°C and about 80% humidity, with a rainy season from May to November.',
    community:
      'A tourist-heavy city of about 900,000, with foreigners concentrated in the old city, Getsemaní and Bocagrande; no reliable count of resident retirees was found, and Spanish helps a lot.',
    access:
      'Nonstops reportedly include Miami (American), New York-JFK and Fort Lauderdale (JetBlue) and Atlanta (Delta), with Houston, Washington-Dulles (United) and Orlando (Frontier) due from December 2026 (check current schedules).',
  },
  drawbacks: [
    'A worldwide wealth tax above about $1.2M, dividends taxed at up to 39% and 15% on inheritances',
    'One high-complexity hospital; the best care is in Medellín or Bogotá',
    'Year-round heat and humidity, crime that targets foreigners, and a reported Level 3 US advisory',
  ],
  sources: [
    { name: 'PwC Worldwide Tax Summaries: Colombia, other taxes', url: 'https://taxsummaries.pwc.com/colombia/individual/other-taxes', edition: '2026' },
    { name: 'PwC Worldwide Tax Summaries: Colombia, taxes on personal income', url: 'https://taxsummaries.pwc.com/colombia/individual/taxes-on-personal-income', edition: '2026' },
    { name: 'DIAN: Oficio 8914 de 2026 (wealth tax)', url: 'https://normograma.dian.gov.co/dian/compilacion/docs/oficio_dian_8914_2026.htm', edition: '2026' },
    { name: 'Colombia Move: V-Rentista visa guide', url: 'https://colombiamove.com/blog/colombia-rentista-visa-v-rentista-guide/' },
    { name: 'Colombia Move: EPS vs medicina prepagada', url: 'https://colombiamove.com/blog/eps-vs-medicina-prepagada-colombia-healthcare-guide/' },
    { name: 'Hospital Serena del Mar: certifications and recognitions', url: 'https://www.hospitalserenadelmar.com/en/international-certifications-and-recognitions' },
    { name: 'Hospital Serena del Mar: about us', url: 'https://www.hospitalserenadelmar.com/en/about-us' },
    { name: 'El Espectador: Colombia\'s 25 best hospitals per Newsweek', url: 'https://www.elespectador.com/salud/estos-son-los-25-mejores-hospitales-de-colombia-segun-newsweek/', edition: '2023' },
    { name: 'Travel Advisory: Colombia (mirrors US State Dept levels)', url: 'https://www.traveladvisory.io/advisory/colombia' },
    { name: 'GOV.UK: Colombia travel advice', url: 'https://www.gov.uk/foreign-travel-advice/colombia' },
    { name: 'GOV.UK: Colombia travel advice, safety and security', url: 'https://www.gov.uk/foreign-travel-advice/colombia/safety-and-security' },
    {
      name: 'El Espectador: Colombia falls in the Global Peace Index 2026',
      url: 'https://www.elespectador.com/mundo/america/colombia-retrocede-en-el-indice-global-de-paz-mientras-aumentan-los-conflictos-mundiales/',
      edition: '2026',
    },
    { name: 'Wikipedia: Rafael Núñez International Airport', url: 'https://en.wikipedia.org/wiki/Rafael_N%C3%BA%C3%B1ez_International_Airport' },
    { name: 'Wikipedia: Cartagena, Colombia', url: 'https://en.wikipedia.org/wiki/Cartagena,_Colombia' },
    { name: 'Your Tax Base: Charles Schwab for expats (country list, Oct 2026)', url: 'https://yourtaxbase.com/blog/charles-schwab-for-expats' },
  ],
}

export default profile
