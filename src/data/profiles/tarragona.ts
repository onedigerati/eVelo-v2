import type { ExpatProfile } from '../expatPicks'
import { S } from './_shared'

const profile: ExpatProfile = {
  tagline: 'Roman seaside city on the Costa Daurada, under Catalonia\'s wealth tax',
  summary:
    'Tarragona has a Roman old town, Mediterranean beaches and Spain\'s non-lucrative visa, an hour down the coast from Barcelona. For buy-borrow-die it ranks near the bottom: Catalonia taxes worldwide net wealth above only €500,000 every year, at up to 3.48% with no relief, the weakest Spanish region for a large portfolio.',
  scores: { cost: 3, healthcare: 3, safety: 4, visa: 3, climate: 4, community: 2, tax: 1, estate: 4, lending: 3 },
  facts: {
    healthcare:
      'The public Hospital Universitari Joan XXIII (opened 1967, being replaced by a €250M new building) is the reference hospital for the Camp de Tarragona, and the private Viamed Tarragona opened in October 2025; the top private and JCI hospitals are in Barcelona; visa holders start on private insurance and can buy into public cover (convenio especial, €157/month at 65+) after a year.',
    safety:
      'Spain is 27th in the 2026 Global Peace Index, and the US rates Spain Level 2 for terrorism and unrest (secondary source); UK advice warns of distraction theft and fake police, and violent crime is low.',
    visa: 'Non-lucrative visa: €2,400/month or €28,800/year (400% of IPREM, 2026; +€7,200 per dependant) from investment income or liquid savings, plus Spanish private health insurance with no co-pay; no work is allowed, and holders must live in Spain most of the year.',
    tax: 'Catalonia: wealth tax on worldwide net wealth (margin debt deductible) above a €500k exemption, at 0.21–3.48% with no relief, so a typical BBD portfolio pays every year; the income-plus-wealth cap can trim it by up to 80%; dividends and interest pay 19–30%, foreign assets go on Modelo 720, and an exit tax can reach gains on shares over €4M; check current rules.',
    estate:
      'Spain taxes the heir, and a non-resident heir only on Spanish assets, so US assets left to US-resident children appear outside it (an inference; confirm with a Spanish adviser); a resident child gets only Catalonia\'s sliding relief, which thins out on large estates; there is no US–Spain estate treaty.',
    lending:
      'IBKR reportedly accepts Spain residents (likely through its EU entity), and Schwab International reportedly accepts them too, but Schwab reportedly bars Europe residents from taking cash out through margin, so plan on IBKR margin; EU PRIIPs rules reportedly block new buys of US-listed ETFs, not holding them.',
    climate: 'Mediterranean: July–August highs about 29–30°C, January highs about 12–14°C with lows of 4–8°C, and about 500 mm of rain a year, mostly in spring and autumn.',
    community:
      'A city of about 140,000 with a small English-speaking community: one count puts British residents at about 212 (0.16% of residents, undated); daily life runs in Catalan and Spanish.',
    access: 'Reus airport, a few kilometres away, has mostly low-cost and charter flights; Barcelona airport, with US nonstops on American, Delta, United and Level, is about 83 km (about an hour) by road, or about 1 h 45 min by train via Barcelona-Sants.',
  },
  drawbacks: [
    'Catalonia\'s yearly wealth tax on net wealth above €500,000, at up to 3.48%',
    'A small English-speaking community, with daily life in Catalan and Spanish',
    'US flights and the top private hospitals are in Barcelona, an hour away',
  ],
  sources: [
    { name: 'Guía Fiscal: wealth tax 2026, map of regional reliefs', url: 'https://guiafiscal.es/opinion/patrimonio-2026-mapa-bonificaciones-ccaa/', edition: '2026' },
    { name: 'Guía Fiscal: inheritance tax map 2026', url: 'https://guiafiscal.es/actualidad/mapa-sucesiones-2026-donde-se-paga-mas/', edition: '2026' },
    { name: 'PwC: Spain, other taxes', url: 'https://taxsummaries.pwc.com/spain/individual/other-taxes', edition: '2026' },
    { name: 'TaxesForExpats: succession and inheritance tax in Spain', url: 'https://www.taxesforexpats.com/country-guides/spain/succession-inheritance-tax-spain.html' },
    { name: 'Ara: the Camp de Tarragona hospital system is getting up to date (Oct 2025)', url: 'https://en.ara.cat/tarragona/the-camp-tarragona-hospital-system-is-getting-up-to-date_1_5536805.html' },
    { name: 'Ministerio de Sanidad: convenio especial', url: 'https://www.sanidad.gob.es/en/servCiudadanos/internacional/convenioEspecial.htm' },
    { name: 'YourTaxBase: Charles Schwab for expats', url: 'https://yourtaxbase.com/blog/charles-schwab-for-expats', edition: '2026' },
    { name: 'Travel Advisory: Spain', url: 'https://www.traveladvisory.io/advisory/spain' },
    { name: 'GOV.UK: Spain travel advice, safety and security', url: 'https://www.gov.uk/foreign-travel-advice/spain/safety-and-security' },
    { name: 'Wikipedia: Tarragona (climate, airport)', url: 'https://en.wikipedia.org/wiki/Tarragona' },
    { name: 'thinkSPAIN: living in Tarragona city', url: 'https://www.thinkspain.com/where-to-buy-rent-live/places/tarragona-city' },
    { name: 'Rome2rio: Tarragona to Barcelona airport', url: 'https://www.rome2rio.com/s/Tarragona/Barcelona-Airport-BCN' },
    { name: 'Wikipedia: Josep Tarradellas Barcelona–El Prat Airport', url: 'https://en.wikipedia.org/wiki/Josep_Tarradellas_Barcelona%E2%80%93El_Prat_Airport' },
    S.iprem,
    S.gpiTop50,
  ],
}

export default profile
