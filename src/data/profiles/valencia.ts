import type { ExpatProfile } from '../expatPicks'
import { S } from './_shared'

const profile: ExpatProfile = {
  tagline: 'Beach city, top-rated by expats, sensible prices',
  summary:
    'Valencia was the top city in InterNations\' most recent city ranking (2024), with high marks for quality of life, and Spain is 6th in Expat Insider 2026. It has beaches, good public healthcare and lower costs than Madrid or Barcelona.',
  // TODO(stage5): set tax, estate and lending from the rubric (3 is a placeholder).
  scores: { cost: 3, healthcare: 4, safety: 4, visa: 3, climate: 4, community: 4, tax: 3, estate: 3, lending: 3 },
  facts: {
    // TODO(stage5): write the estate and lending facts; rewrite tax and visa for BBD.
    estate: 'TODO',
    lending: 'TODO',
    healthcare:
      'Strong Spanish public system (for example La Fe hospital); visa holders start on private insurance and can usually buy into public cover (convenio especial) after a year; private care is affordable.',
    safety: 'Spain is 27th in the 2026 Global Peace Index; violent crime is low, with petty theft in the centre and on beaches.',
    visa:
      'Non-lucrative visa: passive income or savings of €2,400/month (400% of IPREM, €28,800/year, +€7,200 per dependant) plus private health insurance; work is not allowed.',
    tax: 'Residents are taxed on worldwide income (savings income at 19–30%); the Valencian region has its own wealth tax, whose 2026 allowance could not be confirmed, and foreign assets must be reported (Modelo 720); check current rules.',
    climate: 'Mild winters (days about 17°C) and hot, humid summers; the October 2024 floods showed the flash-flood risk.',
    community: 'A growing English-speaking expat scene in Ruzafa, the centre and the coastal suburbs, though daily life runs in Spanish and Valencian.',
    access: 'No US nonstop found; connect via Madrid, Barcelona, Lisbon or another European hub.',
  },
  drawbacks: [
    'No direct US flights',
    'The regional wealth tax and taxed investment income can weigh on a large portfolio',
    'The non-lucrative visa\'s income bar (€2,400/month) is far higher than Portugal\'s',
  ],
  sources: [
    S.iprem,
    { name: 'InterNations Expat City Ranking 2024 methodology', url: 'https://assets.in-cdn.net/expat-insider/2024/city-ranking-methodology-40492', edition: '2024' },
    S.gpiTop50,
    S.spainAir,
  ],
}

export default profile
