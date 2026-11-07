import type { ExpatProfile } from '../expatPicks'
import { S } from './_shared'

const profile: ExpatProfile = {
  tagline: 'Dry, sunny Costa Blanca city with a big British community',
  summary:
    'Alicante shares Valencia\'s regional tax rules (no wealth tax on the first €2M of net wealth from 2026, 99% inheritance relief for children) at a lower cost, with one of Europe\'s driest, sunniest climates. About a quarter of Spain\'s British residents live in its province, but there are no US nonstops, and portfolios above €2M pay wealth tax every year.',
  scores: { cost: 3, healthcare: 4, safety: 4, visa: 3, climate: 5, community: 4, tax: 2, estate: 4, lending: 3 },
  facts: {
    healthcare:
      'The public Hospital General Universitario Dr. Balmis is the province\'s reference teaching hospital (220 transplants in 2025); visa holders start on private insurance and can buy into public cover (convenio especial, €157/month at 65+) after a year; Quirónsalud Torrevieja, about 50 km south, reportedly holds JCI accreditation.',
    safety:
      'Spain is 27th in the 2026 Global Peace Index, and the US rates Spain Level 2 for terrorism and unrest (secondary source); violent crime is low, with petty theft in the centre and on beaches.',
    visa: 'Non-lucrative visa: €2,400/month or €28,800/year (400% of IPREM, 2026; +€7,200 per dependant) from investment income or liquid savings, plus Spanish private health insurance with no co-pay; no work is allowed, and holders must live in Spain most of the year.',
    tax: 'Wealth tax on worldwide net wealth (margin debt deductible) above a €2M exemption from the 2026 assessment (Ley 5/2026), at 0.25–3.5% with no general relief; the income-plus-wealth cap can trim it by up to 80%; dividends and interest pay 19–30%, foreign assets go on Modelo 720, and an exit tax can reach gains on shares over €4M; check current rules.',
    estate:
      'Spain taxes the heir, and a non-resident heir only on Spanish assets, so US assets left to US-resident children appear outside it (an inference; confirm with a Spanish adviser); a resident child gets a €100k reduction plus 99% relief in the Valencian Community; there is no US–Spain estate treaty.',
    lending:
      'IBKR reportedly accepts Spain residents (likely through its EU entity), and Schwab International reportedly accepts them too, but Schwab reportedly bars Europe residents from taking cash out through margin, so plan on IBKR margin; EU PRIIPs rules reportedly block new buys of US-listed ETFs, not holding them.',
    climate: 'One of Europe\'s driest cities: about 285 mm of rain and 3,000 hours of sun a year, January days about 17°C and August days about 31°C with warm nights (1991–2020 normals).',
    community:
      'About 68,900 Britons were registered in Alicante province on 1 Jan 2025, a quarter of all Britons in Spain, mostly along the Costa Blanca, against about 2,900 Americans; in the city itself about 27% of residents are foreign-born, led by Latin Americans and North Africans.',
    access:
      'Alicante–Elche airport, 9 km from the city, handled about 20M passengers in 2025, mainly to the UK and Northern Europe, but has no US nonstops; connect via Madrid or another European hub.',
  },
  drawbacks: [
    'No US nonstops, so every trip home means a connection',
    'Yearly wealth tax on net wealth above €2M, at up to 3.5%',
    'Hot summers with warm nights, and daily life in the city runs in Spanish and Valencian',
  ],
  sources: [
    S.iprem,
    { name: 'Guía Fiscal: wealth tax 2026, map of regional reliefs', url: 'https://guiafiscal.es/opinion/patrimonio-2026-mapa-bonificaciones-ccaa/', edition: '2026' },
    {
      name: 'Cuatrecasas: Valencian Community tax changes for 2026',
      url: 'https://www.cuatrecasas.com/es/spain/art/comunidad-valenciana-novedades-tributarias-2026',
      edition: '2026',
    },
    { name: 'Guía Fiscal: inheritance tax map 2026', url: 'https://guiafiscal.es/actualidad/mapa-sucesiones-2026-donde-se-paga-mas/', edition: '2026' },
    { name: 'YourTaxBase: Charles Schwab for expats', url: 'https://yourtaxbase.com/blog/charles-schwab-for-expats', edition: '2026' },
    {
      name: 'El Periòdic: Hospital Doctor Balmis performs 220 transplants in 2025',
      url: 'https://www.elperiodic.com/alicante/hospital-doctor-balmis-realiza-trasplantes-durante-2025-consolida-actividad-trasplantadora-referencia_1055867',
      edition: '2025',
    },
    { name: 'Ministerio de Sanidad: convenio especial', url: 'https://www.sanidad.gob.es/en/servCiudadanos/internacional/convenioEspecial.htm' },
    { name: 'Travel Advisory: Spain', url: 'https://www.traveladvisory.io/advisory/spain' },
    { name: 'MySpainVisa: Brits living in Spain (INE data)', url: 'https://myspainvisa.com/brits-living-in-spain/', edition: '2025' },
    { name: 'MySpainVisa: Americans living in Spain (INE data)', url: 'https://myspainvisa.com/americans-living-in-spain/', edition: '2025' },
    { name: 'Wikipedia: Alicante', url: 'https://en.wikipedia.org/wiki/Alicante' },
    { name: 'Wikipedia: Alicante–Elche Miguel Hernández Airport', url: 'https://en.wikipedia.org/wiki/Alicante%E2%80%93Elche_Miguel_Hern%C3%A1ndez_Airport' },
    S.gpiTop50,
  ],
}

export default profile
