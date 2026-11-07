import type { ExpatProfile } from '../expatPicks'
import { S } from './_shared'

const profile: ExpatProfile = {
  tagline: 'Beach city, top-rated by expats, sensible prices',
  summary:
    'Valencia was the top city in InterNations\' most recent city ranking (2024), and from 2026 the Valencian Community exempts the first €2M of net wealth, with 99% inheritance relief for children. Portfolios above €2M pay wealth tax every year, so it suits a moderate buy-borrow-die portfolio better than a large one; it has beaches, good public healthcare and lower costs than Madrid or Barcelona.',
  scores: { cost: 3, healthcare: 4, safety: 4, visa: 3, climate: 4, community: 4, tax: 2, estate: 4, lending: 3 },
  facts: {
    healthcare:
      'Strong Spanish public system (for example La Fe hospital); visa holders start on private insurance and can buy into public cover (convenio especial, €157/month at 65+) after a year; private plans commonly cap entry at 70–75.',
    safety: 'Spain is 27th in the 2026 Global Peace Index; violent crime is low, with petty theft in the centre and on beaches.',
    visa: 'Non-lucrative visa: €2,400/month or €28,800/year (400% of IPREM, 2026; +€7,200 per dependant) from investment income or liquid savings, plus Spanish private health insurance with no co-pay; no work is allowed, and holders must live in Spain most of the year.',
    tax: 'Wealth tax on worldwide net wealth (margin debt deductible) above a €2M exemption from the 2026 assessment (Ley 5/2026), at 0.25–3.5% with no general relief; the income-plus-wealth cap can trim it by up to 80%; dividends and interest pay 19–30%, foreign assets go on Modelo 720, and an exit tax can reach gains on shares over €4M; check current rules.',
    estate:
      'Spain taxes the heir, and a non-resident heir only on Spanish assets, so US assets left to US-resident children appear outside it (an inference; confirm with a Spanish adviser); a resident child gets a €100k reduction plus 99% relief in the Valencian Community; there is no US–Spain estate treaty.',
    lending:
      'IBKR reportedly accepts Spain residents (likely through its EU entity), and Schwab International reportedly accepts them too, but Schwab reportedly bars Europe residents from taking cash out through margin, so plan on IBKR margin; EU PRIIPs rules reportedly block new buys of US-listed ETFs, not holding them.',
    climate: 'Mild winters (days about 17°C) and hot, humid summers; the October 2024 floods showed the flash-flood risk.',
    community: 'A growing English-speaking expat scene in Ruzafa, the centre and the coastal suburbs, with about 4,900 Americans and 9,400 Britons registered in the province (1 Jan 2025), though daily life runs in Spanish and Valencian.',
    access: 'No US nonstop found; connect via Madrid, Barcelona, Lisbon or another European hub.',
  },
  drawbacks: [
    'Yearly wealth tax on net wealth above €2M, at up to 3.5%',
    'No direct US flights',
    'The non-lucrative visa\'s income bar (€2,400/month) is far higher than Portugal\'s',
  ],
  sources: [
    S.iprem,
    {
      name: 'Cuatrecasas: Valencian Community tax changes for 2026',
      url: 'https://www.cuatrecasas.com/es/spain/art/comunidad-valenciana-novedades-tributarias-2026',
      edition: '2026',
    },
    { name: 'Guía Fiscal: inheritance tax map 2026', url: 'https://guiafiscal.es/actualidad/mapa-sucesiones-2026-donde-se-paga-mas/', edition: '2026' },
    { name: 'PwC: Spain, other taxes', url: 'https://taxsummaries.pwc.com/spain/individual/other-taxes', edition: '2026' },
    { name: 'YourTaxBase: Charles Schwab for expats', url: 'https://yourtaxbase.com/blog/charles-schwab-for-expats', edition: '2026' },
    { name: 'MySpainVisa: Americans living in Spain (INE data)', url: 'https://myspainvisa.com/americans-living-in-spain/', edition: '2025' },
    { name: 'InterNations Expat City Ranking 2024 methodology', url: 'https://assets.in-cdn.net/expat-insider/2024/city-ranking-methodology-40492', edition: '2024' },
    S.gpiTop50,
    S.spainAir,
  ],
}

export default profile
