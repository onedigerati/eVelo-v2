import type { ExpatProfile } from '../expatPicks'
import { S } from './_shared'

const profile: ExpatProfile = {
  tagline: 'Spain\'s capital: top hospitals and the most US nonstops',
  summary:
    'The Community of Madrid charges no wealth tax between €700k and about €3.7M of net wealth and gives children 99% inheritance relief, the same buy-borrow-die outcome as Málaga. It adds Spain\'s best hospitals, nonstops to about a dozen US cities and the country\'s largest American community, against hot summers, frosty winters and big-city prices. The weak point is the borrow step: Schwab and IBKR both reportedly bar EU residents from drawing margin as cash.',
  scores: { cost: 2, healthcare: 5, safety: 4, visa: 3, climate: 3, community: 3, tax: 2, estate: 4, lending: 2 },
  facts: {
    healthcare:
      'Hospital Universitario Quirónsalud Pozuelo (named Quirónsalud Madrid until June 2026; JCI-accredited since 2021) and Hospital Sanitas Virgen del Mar (JCI renewed Nov 2025) lead a deep private and public network; visa holders start on private insurance and can buy into public cover (convenio especial, €157/month at 65+) after a year.',
    safety:
      'Spain is 27th in the 2026 Global Peace Index, and the US rates Spain Level 2 for terrorism and unrest (Aug 2026, secondary source); violent crime is low, with pickpocketing in the centre and on the Metro.',
    visa: 'Non-lucrative visa: €2,400/month or €28,800/year (400% of IPREM, 2026; +€7,200 per dependant) from investment income or liquid savings, plus Spanish private health insurance with no co-pay; no work is allowed, and holders must live in Spain most of the year. The Los Angeles consulate adds that applicants "cannot have/leave loans or mortgages in the United States"; it doesn\'t say whether a margin loan counts, so ask your consulate before applying with one open.',
    tax: 'Spain taxes worldwide net wealth (margin debt deductible); Madrid\'s relief is reduced by the solidarity tax, so residents pay nothing between €700k and about €3.7M and about 1.7–3.5% above; dividends and interest pay 19–30%, foreign assets go on Modelo 720, and an exit tax can reach gains on shares over €4M after 10 years\' residence; check current rules.',
    estate:
      'Spain taxes the heir, and a non-resident heir only on Spanish assets, so US assets left to US-resident children appear outside it (an inference; confirm with a Spanish adviser); a resident child gets 99% relief in Madrid (a €200k inheritance reportedly owes about €64); there is no US–Spain estate treaty.',
    lending:
      'IBKR reportedly accepts Spain residents (likely through its EU entity), and Schwab International reportedly accepts them too, but Schwab reportedly bars Europe residents from taking cash out through margin, and IBKR\'s EU entity reportedly lends on margin only to buy securities, not to withdraw as cash, so confirm how you would draw cash before relying on either; EU PRIIPs rules reportedly block new buys of US-listed ETFs, not holding them.',
    climate:
      'Dry and continental: July days about 33°C, January days about 10°C with nights near 3°C and frequent frost, about 2,800 hours of sun and around 400 mm of rain a year (Retiro 1991–2020).',
    community:
      'About 14,200 US citizens were registered in the Madrid province on 1 Jan 2025 (10,400 in the city), a quarter of Americans in Spain; the international crowd is large but mostly working-age, and daily life runs in Spanish.',
    access:
      'Barajas, Spain\'s main hub, is about 12 km north-east of the centre, linked by metro and suburban rail; high-speed trains from Atocha reach most of the country.',
  },
  drawbacks: [
    'Hot summers and cold, frosty winters, unlike the coast',
    'Wealth tax at about 1.7–3.5% a year on net wealth above about €3.7M',
    'Big-city rents, and the non-lucrative visa\'s high income bar',
  ],
  sources: [
    { name: 'SEPE: yearly amounts of the IPREM and the minimum wage', url: 'https://www.sepe.es/HomeSepe/es/prestaciones-desempleo/Cuantias-anuales.html', edition: '2026' },
    {
      name: 'Spanish Consulate in Los Angeles: non-lucrative residence visa',
      url: 'https://www.exteriores.gob.es/Consulados/losangeles/en/ServiciosConsulares/Paginas/Consular/Visado-de-residencia-no-lucrativa.aspx',
      edition: '2026',
    },
    { name: 'LYNX: withdrawals from accounts carried by Interactive Brokers', url: 'https://www.lynxbroker.com/service/payments-and-transfers/withdrawal/' },
    {
      name: 'El Independiente: Quirónsalud Madrid earns the JCI gold seal (Mar 2021)',
      url: 'https://www.elindependiente.com/vida-sana/salud/2021/03/30/el-hospital-quironsalud-madrid-consigue-el-sello-dorado-de-la-joint-commission-internacional/amp/',
      edition: '2021',
    },
    {
      name: 'The Objective: Quirónsalud Madrid renamed Quirónsalud Pozuelo (Jun 2026)',
      url: 'https://theobjective.com/actualidad/2026-06-08/hospital-universitario-quironsalud-pozuelo-20-anos/',
      edition: '2026',
    },
    {
      name: 'Cuatrecasas: regional measures on the solidarity tax (Mar 2026)',
      url: 'https://www.cuatrecasas.com/es/spain/fiscalidad/art/itsgf-medidas-adoptadas-ccaa',
      edition: '2026',
    },
    { name: 'Guía Fiscal: wealth tax 2026, map of regional reliefs', url: 'https://guiafiscal.es/opinion/patrimonio-2026-mapa-bonificaciones-ccaa/', edition: '2026' },
    { name: 'Guía Fiscal: inheritance tax map 2026', url: 'https://guiafiscal.es/actualidad/mapa-sucesiones-2026-donde-se-paga-mas/', edition: '2026' },
    { name: 'YourTaxBase: Charles Schwab for expats', url: 'https://yourtaxbase.com/blog/charles-schwab-for-expats', edition: '2026' },
    {
      name: 'Alicante Plaza: Quirónsalud first hospital group to earn JCI enterprise accreditation',
      url: 'https://alicanteplaza.es/alicanteplaza/quironsaludprimergrupohospitalarioprivadodelmundoenobtenerlaacreditacionjointcommissioninternationalenterprise2',
    },
    {
      name: 'Redacción Médica: Hospital Sanitas Virgen del Mar renews JCI (Nov 2025)',
      url: 'https://www.redaccionmedica.com/ultimas-noticias/20251120/el-hospital-sanitas-virgen-del-mar-renueva-la-acreditacion-de-jointcommission-international/132684_0.html',
    },
    { name: 'Travel Advisory: Spain', url: 'https://www.traveladvisory.io/advisory/spain' },
    { name: 'MySpainVisa: Americans living in Spain (INE data)', url: 'https://myspainvisa.com/americans-living-in-spain/', edition: '2025' },
    { name: 'Wikipedia: Climate of Madrid', url: 'https://en.wikipedia.org/wiki/Climate_of_Madrid' },
    { name: 'Wikipedia: Adolfo Suárez Madrid–Barajas Airport', url: 'https://en.wikipedia.org/wiki/Adolfo_Su%C3%A1rez_Madrid%E2%80%93Barajas_Airport' },
    S.gpiTop50,
  ],
}

export default profile
