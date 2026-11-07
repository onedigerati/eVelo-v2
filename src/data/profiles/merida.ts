import type { ExpatProfile } from '../expatPicks'
import { S } from './_shared'

const profile: ExpatProfile = {
  tagline: 'Colonial capital in Mexico\'s safest state',
  summary:
    'Mérida, on Forbes\' 2026 list, is a large, low-cost colonial city in Yucatán, reportedly the only Mexican state the US State Department rates at Level 1. It has solid private hospitals and a growing expat scene in the historic centre.',
  // TODO(stage5): set tax, estate and lending from the rubric (3 is a placeholder).
  scores: { cost: 4, healthcare: 4, safety: 4, visa: 3, climate: 2, community: 4, tax: 3, estate: 3, lending: 3 },
  facts: {
    // TODO(stage5): write the estate and lending facts; rewrite tax and visa for BBD.
    estate: 'TODO',
    lending: 'TODO',
    healthcare:
      'The regional medical centre for the Yucatán Peninsula, with private hospitals (Star Médica, Faro del Mayab, Clínica de Mérida) well below US prices; IMSS buy-in is available, with limits.',
    safety:
      'Mexico is 137th of 163 in the 2026 Global Peace Index, but Yucatán is reportedly the only state at US State Dept Level 1, "normal precautions", and Mérida is widely called Mexico\'s safest large city.',
    visa: 'Temporary residency needs about $4,430/month net income or about $74,700 in savings or investments; permanent residency for retirees about $7,430/month or $299,000 (2026 figures); brokerage balances generally count, and amounts vary by consulate.',
    tax: 'Mexican tax residents are taxed on worldwide income, so US dividends, interest and gains are reportable in Mexico; the US–Mexico treaty and foreign tax credits help only partly (get local advice and check current rules).',
    climate: 'Hot all year, often 40°C (104°F) in April–May, with a humid rainy season June–October and hurricane exposure.',
    community: 'A sizeable, growing US, Canadian and European community in the centre and northern suburbs, less English-dominated than Puerto Vallarta or San Miguel.',
    access: 'A few US nonstops, reportedly to Houston, Miami, Dallas and Orlando (check current schedules); otherwise connect via Mexico City or drive 4 hours to Cancún.',
  },
  drawbacks: [
    'Punishing heat in spring and summer, and high air-conditioning bills',
    'Few nonstop US flights compared with Cancún or Puerto Vallarta',
    'Mexico taxes residents\' worldwide investment income',
  ],
  sources: [{ ...S.mxAdvisory, name: 'Jetpac: Is it safe to travel to Mexico (Yucatán Level 1, 2026)' }, S.forbes, S.mxResidency, S.gpiPoster],
}

export default profile
