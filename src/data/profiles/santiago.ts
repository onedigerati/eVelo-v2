import type { ExpatProfile } from '../expatPicks'

const profile: ExpatProfile = {
  tagline: 'Andean capital with top clinics and a three-year tax window',
  summary:
    'Chile taxes a newly arrived foreigner only on Chilean-source income for the first three years, and a foreigner\'s assets abroad bought with non-Chilean money fall outside its inheritance tax. There is no wealth tax. Santiago has the region\'s best private clinics and is 52nd in the 2026 Global Peace Index. After year three, though, US dividends are taxed at up to 40%, so a growth-tilted portfolio matters.',
  scores: { cost: 4, healthcare: 4, safety: 3, visa: 4, climate: 4, community: 3, tax: 2, estate: 5, lending: 3 },
  facts: {
    healthcare:
      'Clínica Alemana, Clínica Las Condes, Clínica Indisa and Clínica Santa María are among Latin America\'s best; retirees with no Chilean taxable income can qualify for free public FONASA Group A, while private Isapres price steeply by age and can exclude declared conditions for about 18 months.',
    safety:
      'Chile is 52nd of 163 in the 2026 Global Peace Index and US State Dept Level 2 (August 2026, secondary source); the UK reports common and increasingly armed muggings, pickpocketing and carjackings in affluent areas, and expats favour Providencia, Las Condes, Vitacura and Ñuñoa.',
    visa:
      'Temporary residence as a rentista or pensionado has no fixed minimum, though in practice applicants show more than about $1,000/month; the first permit is about 1 year and renewable, and permanent residence is possible after 2 years with no more than 180 days abroad (law firm, 2024).',
    tax: 'No wealth tax (a 2026 bill is pending); a foreigner who takes up residence is taxed only on Chilean-source income for 3 years from entry, extendable in qualified cases, then worldwide, with US dividends and interest in the progressive Global Complementario at up to 40% (only real interest is taxed, and a US–Chile income tax treaty exists).',
    estate:
      'Heirs pay 1–25% on their share, but under Law 16.271 art. 1 a foreigner\'s assets abroad count only if bought with money from Chile, so a US brokerage account funded from the US falls outside it; whether this holds for a foreigner who dies domiciled in Chile is unverified, and there is no US estate treaty.',
    lending:
      'Interactive Brokers reportedly serves all non-sanctioned countries, so Chile residents should be accepted, but margin terms are unconfirmed; whether Schwab One International accepts Chile was not checked.',
    climate:
      'Mediterranean at about 570 m: dry summers with January highs about 30°C, cool winters with July highs about 16°C and lows near 4°C, and most of the roughly 290 mm of rain May–August; winter smog in the valley and earthquake risk.',
    community:
      'A lively, mostly working-age expat scene centred on the east-side communes (Providencia, Las Condes, Vitacura, Ñuñoa), with meetups and online groups but no large retiree enclave; Spanish is needed day to day.',
    access:
      'SCL has nonstops to Miami, Atlanta, Los Angeles and New York-JFK (LATAM, American, Delta), plus seasonal Dallas, Houston and Orlando; the UK advises booking official taxis inside the terminal.',
  },
  drawbacks: [
    'After three years, US dividends are taxed at up to 40%',
    'Winter smog, and earthquake risk',
    'Rising armed street crime, and costs high for the region',
  ],
  sources: [
    { name: 'PwC Worldwide Tax Summaries: Chile, income determination', url: 'https://taxsummaries.pwc.com/chile/individual/income-determination', edition: '2026' },
    { name: 'PwC Worldwide Tax Summaries: Chile, other taxes', url: 'https://taxsummaries.pwc.com/chile/individual/other-taxes', edition: '2026' },
    { name: 'SII: Law 16.271 on inheritance, legacies and gifts', url: 'https://www.sii.cl/pagina/jurisprudencia/legislacion/basica/herencias_asignaciones_donaciones.doc' },
    { name: 'SII: Second-category tax table 2026', url: 'https://www.sii.cl/valores_y_fechas/impuesto_2da_categoria/impuesto2026.htm', edition: '2026' },
    { name: 'Becker Abogados: How to apply for a retiree visa in Chile', url: 'https://beckerabogados.cl/en/blog/how-to-apply-for-a-retiree-visa-in-chile', edition: '2024' },
    { name: 'Rio Times: Healthcare in Chile for expats 2026', url: 'https://www.riotimesonline.com/healthcare-chile-expats-2026/' },
    {
      name: 'Forbes Chile: Chile second-safest in South America in the Global Peace Index 2026',
      url: 'https://forbes.cl/life/2026-06-10/chile-es-el-segundo-pais-mas-seguro-de-sudamerica-aunque-la-region-completa-empeora-en-el-indice-global-de-paz-2026/',
      edition: '2026',
    },
    { name: 'GOV.UK: Chile travel advice, safety and security', url: 'https://www.gov.uk/foreign-travel-advice/chile/safety-and-security' },
    { name: 'Travel Advisory: Chile (US State Dept levels)', url: 'https://www.traveladvisory.io/advisory/chile' },
    { name: 'Expatra: Living in Santiago', url: 'https://www.expatra.com/living-in-santiago/' },
    { name: 'Wikipedia: Santiago (climate)', url: 'https://en.wikipedia.org/wiki/Santiago' },
    { name: 'Wikipedia: Arturo Merino Benítez International Airport', url: 'https://en.wikipedia.org/wiki/Arturo_Merino_Ben%C3%ADtez_International_Airport' },
  ],
}

export default profile
