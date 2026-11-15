import type { ExpatProfile } from '../expatPicks'

const profile: ExpatProfile = {
  tagline: 'Andean capital with top clinics and a three-year tax window',
  summary:
    'Chile taxes a newly arrived foreigner only on Chilean-source income for the first three years, and a foreigner\'s assets abroad bought with non-Chilean money fall outside its inheritance tax. There is no wealth tax. Santiago has strong private clinics, led by Clínica Alemana and is 52nd in the 2026 Global Peace Index. After year three, though, US dividends are taxed at up to 40%, so a growth-tilted portfolio matters.',
  scores: { cost: 4, healthcare: 4, safety: 3, visa: 4, climate: 4, community: 3, tax: 2, estate: 5, lending: 4 },
  facts: {
    healthcare:
      'Clínica Alemana (1st in Chile and 121st in the world in Newsweek\'s 2026 ranking), Clínica Las Condes (5th in Chile), Clínica Santa María (9th) and Clínica Indisa (12th) lead private care; retirees with no Chilean taxable income can qualify for free public FONASA Group A, while private Isapres price steeply by age and can exclude declared conditions for about 18 months.',
    safety:
      'Chile is 52nd of 163 in the 2026 Global Peace Index and US State Dept Level 2 (August 2026, secondary source); the UK reports common and increasingly armed muggings, pickpocketing and carjackings in affluent areas, and expats favour Providencia, Las Condes, Vitacura and Ñuñoa.',
    visa:
      'Temporary residence as a rentista or pensionado has no fixed minimum, though applicants are reportedly advised to show more than about $1,000/month; the permit is renewable, and permanent residence needs 24 months of temporary residence (12 in some cases, such as pension income), longer if absences total more than 2 months (Migration Service, 2026).',
    tax: 'No wealth tax; a foreigner who takes up residence is taxed only on Chilean-source income for 3 years from entry, extendable in qualified cases, then worldwide, with US dividends and interest in the progressive Global Complementario at up to 40% (only real interest is taxed, and a US–Chile income tax treaty exists).',
    estate:
      'Heirs pay 1–25% on their share, but under Law 16.271 art. 1 a foreigner\'s assets abroad count only if bought with money from Chile, so a US brokerage account funded from the US falls outside it; whether this holds for a foreigner who dies domiciled in Chile is unverified, and there is no US estate treaty.',
    lending:
      'Interactive Brokers reportedly serves all non-sanctioned countries, so Chile residents should be accepted, but margin terms are unconfirmed; Schwab One International\'s application reportedly lists Chile (October 2026), with no known margin restriction outside Europe.',
    climate:
      'Mediterranean at about 570 m: dry summers with January highs about 30°C, cool winters with July highs about 16°C and lows near 4°C, and most of the roughly 290 mm of rain May–August; winter smog in the valley and earthquake risk.',
    community:
      'A lively, mostly working-age expat scene centred on the east-side communes (Providencia, Las Condes, Vitacura, Ñuñoa), with meetups and online groups but no large retiree enclave; Spanish is needed day to day.',
    access:
      'Arturo Merino Benítez (SCL) is about 17 km north-west of the centre; the UK advises booking official taxis or transfers inside the terminal.',
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
    { name: 'Servicio Nacional de Migraciones: retirees and rentiers', url: 'https://serviciomigraciones.cl/residencia-temporal/subcategorias/jubilados-y-rentistas/' },
    { name: 'Servicio Nacional de Migraciones: permanent residence', url: 'https://serviciomigraciones.cl/residencia-definitiva/', edition: '2026' },
    { name: 'Emol: Newsweek World\'s Best Hospitals 2026, Chile', url: 'https://www.emol.com/noticias/Internacional/2026/02/26/1192686/ranking-hospitales-clinicas-centros-salud.html', edition: '2026' },
    { name: 'Your Tax Base: Charles Schwab for expats (country list, Oct 2026)', url: 'https://yourtaxbase.com/blog/charles-schwab-for-expats' },
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
