import type { ExpatProfile } from '../expatPicks'
import { S } from './_shared'

const profile: ExpatProfile = {
  tagline: 'World city with JCI hospitals and US nonstops, under Catalonia\'s wealth tax',
  summary:
    'Barcelona has some of Spain\'s best private hospitals, a mild Mediterranean climate, a large international community and nonstops to a dozen US cities. For buy-borrow-die it ranks near the bottom, as Tarragona does: Catalonia taxes worldwide net wealth above only €500,000 every year, at up to 3.48% with no relief, the weakest Spanish region for a large portfolio.',
  scores: { cost: 2, healthcare: 5, safety: 3, visa: 3, climate: 4, community: 4, tax: 1, estate: 4, lending: 3 },
  facts: {
    healthcare:
      'Centro Médico Teknon has held JCI accreditation since 2002, and Teknon, Hospital Quirónsalud Barcelona and Hospital Universitari Dexeus were all JCI in 2022; visa holders start on private insurance and can buy into public cover (convenio especial, €157/month at 65+) after a year.',
    safety:
      'Spain is 27th in the 2026 Global Peace Index, and the US rates Spain Level 2 for terrorism and unrest (secondary source); UK advice says terrorists are likely to try attacks in Spain and warns of distraction theft by teams, and Barcelona still recorded about 239 thefts a day in 2025, the lowest since 2015, while violent robberies stay high.',
    visa: 'Non-lucrative visa: €2,400/month or €28,800/year (400% of IPREM, 2026; +€7,200 per dependant) from investment income or liquid savings, plus Spanish private health insurance with no co-pay; no work is allowed, and holders must live in Spain most of the year.',
    tax: 'Catalonia: wealth tax on worldwide net wealth (margin debt deductible) above a €500k exemption, at 0.21–3.48% with no relief, so a typical BBD portfolio pays every year (the Catalan tax is credited against the national solidarity tax); the income-plus-wealth cap can trim it by up to 80%; dividends and interest pay 19–30%, foreign assets go on Modelo 720, and an exit tax can reach gains on shares over €4M; check current rules.',
    estate:
      'Spain taxes the heir, and a non-resident heir only on Spanish assets, so US assets left to US-resident children appear outside it (an inference; confirm with a Spanish adviser); a resident child gets only Catalonia\'s sliding relief (a €200k inheritance pays about €3,825 without a home); there is no US–Spain estate treaty.',
    lending:
      'IBKR reportedly accepts Spain residents (likely through its EU entity), and Schwab International reportedly accepts them too, but Schwab reportedly bars Europe residents from taking cash out through margin, so plan on IBKR margin; EU PRIIPs rules reportedly block new buys of US-listed ETFs, not holding them.',
    climate: 'Mediterranean: summer highs about 28–29°C with humid nights, and winter days about 15°C.',
    community: 'A large international community of Europeans, Latin Americans and North Americans (its size not measured here); English is common in business and the centre, but daily life runs in Catalan and Spanish.',
    access: 'Barcelona–El Prat has nonstops on American (Miami, Philadelphia, plus seasonal routes), Delta (Atlanta, New York JFK, plus seasonal Boston and Seattle), United (Newark, Washington Dulles, plus seasonal Chicago and San Francisco) and Level.',
  },
  drawbacks: [
    'Catalonia\'s yearly wealth tax on net wealth above €500,000, at up to 3.48%',
    'Frequent street theft (about 239 a day in 2025) and tourist crowds in the centre',
    'High rents for Spain, and daily life in Catalan and Spanish',
  ],
  sources: [
    { name: 'Guía Fiscal: wealth tax 2026, map of regional reliefs', url: 'https://guiafiscal.es/opinion/patrimonio-2026-mapa-bonificaciones-ccaa/', edition: '2026' },
    { name: 'Guía Fiscal: inheritance tax map 2026', url: 'https://guiafiscal.es/actualidad/mapa-sucesiones-2026-donde-se-paga-mas/', edition: '2026' },
    { name: 'PwC: Spain, other taxes', url: 'https://taxsummaries.pwc.com/spain/individual/other-taxes', edition: '2026' },
    { name: 'TaxesForExpats: succession and inheritance tax in Spain', url: 'https://www.taxesforexpats.com/country-guides/spain/succession-inheritance-tax-spain.html' },
    {
      name: 'Redacción Médica: Teknon renews JCI for the fifth time',
      url: 'https://www.redaccionmedica.com/empresas/sanidad-privada/20161011/teknon-unico-hospital-de-espana-en-acreditar-su-calidad-por-quinta-vez/22872_0.html',
    },
    {
      name: 'Alicante Plaza: Quirónsalud first private hospital group to win JCI enterprise accreditation',
      url: 'https://alicanteplaza.es/alicanteplaza/quironsaludprimergrupohospitalarioprivadodelmundoenobtenerlaacreditacionjointcommissioninternationalenterprise2',
    },
    { name: 'Ministerio de Sanidad: convenio especial', url: 'https://www.sanidad.gob.es/en/servCiudadanos/internacional/convenioEspecial.htm' },
    { name: 'YourTaxBase: Charles Schwab for expats', url: 'https://yourtaxbase.com/blog/charles-schwab-for-expats', edition: '2026' },
    { name: 'Travel Advisory: Spain', url: 'https://www.traveladvisory.io/advisory/spain' },
    { name: 'GOV.UK: Spain travel advice, safety and security', url: 'https://www.gov.uk/foreign-travel-advice/spain/safety-and-security' },
    { name: 'Wikipedia: Josep Tarradellas Barcelona–El Prat Airport', url: 'https://en.wikipedia.org/wiki/Josep_Tarradellas_Barcelona%E2%80%93El_Prat_Airport' },
    { name: 'Ara: thefts in Barcelona lowest since 2015 (Feb 2026)', url: 'https://en.ara.cat/society/security-in-barcelona-thefts-haven-t-been-this-low-since_1_5647693.html', edition: '2026' },
    { name: 'Wikipedia: Climate of Barcelona', url: 'https://en.wikipedia.org/wiki/Climate_of_Barcelona' },
    S.iprem,
    S.gpiTop50,
  ],
}

export default profile
