import type { ExpatProfile } from '../expatPicks'
import { S } from './_shared'

const profile: ExpatProfile = {
  tagline: 'Costa Blanca retiree town with a JCI hospital and Valencian tax rules',
  summary:
    'Torrevieja sits in the Valencian Community, so it shares Alicante\'s rules: no wealth tax on the first €2M of net wealth from 2026 and 99% inheritance relief for children. It adds a JCI-accredited Quirónsalud hospital in town and one of the largest English-speaking retiree communities in Spain, at a lower cost than Alicante; against that, portfolios above €2M pay wealth tax every year, there are no US nonstops, and autumn flash floods are a regional risk.',
  scores: { cost: 4, healthcare: 4, safety: 4, visa: 3, climate: 5, community: 5, tax: 2, estate: 4, lending: 3 },
  facts: {
    healthcare:
      'Hospital Quirónsalud Torrevieja (private) renewed its JCI accreditation in June 2026 (first accredited 2023), and the public Hospital Universitario de Torrevieja is reportedly in town; visa holders start on private insurance and can buy into public cover (convenio especial, €157/month at 65+) after a year.',
    safety:
      'Spain is 27th in the 2026 Global Peace Index, and the US rates Spain Level 2 for terrorism and unrest (secondary source); UK advice warns of distraction theft and fake police, and violent crime is low.',
    visa: 'Non-lucrative visa: €2,400/month or €28,800/year (400% of IPREM, 2026; +€7,200 per dependant) from investment income or liquid savings, plus Spanish private health insurance with no co-pay; no work is allowed, and holders must live in Spain most of the year.',
    tax: 'Valencian Community: wealth tax on worldwide net wealth (margin debt deductible) above a €2M exemption from the 2026 assessment (Ley 5/2026), at 0.25–3.5% with no general relief; the income-plus-wealth cap can trim it by up to 80%; dividends and interest pay 19–30%, foreign assets go on Modelo 720, and an exit tax can reach gains on shares over €4M; check current rules.',
    estate:
      'Spain taxes the heir, and a non-resident heir only on Spanish assets, so US assets left to US-resident children appear outside it (an inference; confirm with a Spanish adviser); a resident child gets a €100k reduction plus 99% relief in the Valencian Community; there is no US–Spain estate treaty.',
    lending:
      'IBKR reportedly accepts Spain residents (likely through its EU entity), and Schwab International reportedly accepts them too, but Schwab reportedly bars Europe residents from taking cash out through margin, so plan on IBKR margin; EU PRIIPs rules reportedly block new buys of US-listed ETFs, not holding them.',
    climate:
      'Hot semi-arid: about 328 mm of rain a year, October the wettest month, and July–August highs about 32°C with mild, sunny winters; autumn DANA storms can bring flash floods to the region.',
    community:
      'About 98,500 residents (2025); in 2012 British and Russian residents were each 5.6% of the population, and it was long reported as the Spanish municipality with the most British residents; English is everywhere in daily life.',
    access: 'Alicante–Elche airport is about 43 km (about 42 minutes by road) away and flies mainly to the UK and Northern Europe, with no US nonstops; connect via Madrid or a European hub.',
  },
  drawbacks: [
    'Yearly wealth tax on net wealth above €2M, at up to 3.5%',
    'No US nonstops, so every trip home means a connection',
    'Densely built resort sprawl, hot summers and autumn flash-flood risk',
  ],
  sources: [
    {
      name: 'Euro Weekly News: Quirónsalud Torrevieja renews its JCI seal (Jun 2026)',
      url: 'https://euroweeklynews.com/2026/06/30/quironsalud-torrevieja-hospital-renews-its-joint-commission-international-gold-seal-reinforcing-its-leadership-in-healthcare-quality/',
      edition: '2026',
    },
    { name: 'Wikipedia: Torrevieja', url: 'https://en.wikipedia.org/wiki/Torrevieja' },
    { name: 'Rome2rio: Torrevieja to Alicante airport', url: 'https://www.rome2rio.com/s/Torrevieja/Alicante-Airport-ALC' },
    { name: 'Guía Fiscal: wealth tax 2026, map of regional reliefs', url: 'https://guiafiscal.es/opinion/patrimonio-2026-mapa-bonificaciones-ccaa/', edition: '2026' },
    {
      name: 'Cuatrecasas: Valencian Community tax changes for 2026',
      url: 'https://www.cuatrecasas.com/es/spain/art/comunidad-valenciana-novedades-tributarias-2026',
      edition: '2026',
    },
    { name: 'Guía Fiscal: inheritance tax map 2026', url: 'https://guiafiscal.es/actualidad/mapa-sucesiones-2026-donde-se-paga-mas/', edition: '2026' },
    { name: 'TaxesForExpats: succession and inheritance tax in Spain', url: 'https://www.taxesforexpats.com/country-guides/spain/succession-inheritance-tax-spain.html' },
    { name: 'Ministerio de Sanidad: convenio especial', url: 'https://www.sanidad.gob.es/en/servCiudadanos/internacional/convenioEspecial.htm' },
    { name: 'YourTaxBase: Charles Schwab for expats', url: 'https://yourtaxbase.com/blog/charles-schwab-for-expats', edition: '2026' },
    { name: 'Travel Advisory: Spain', url: 'https://www.traveladvisory.io/advisory/spain' },
    { name: 'GOV.UK: Spain travel advice, safety and security', url: 'https://www.gov.uk/foreign-travel-advice/spain/safety-and-security' },
    S.iprem,
    S.gpiTop50,
  ],
}

export default profile
