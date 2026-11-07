import type { ExpatProfile } from '../expatPicks'
import { S } from './_shared'

const profile: ExpatProfile = {
  tagline: 'Bay-front resort town, easy US nonstops',
  summary:
    'Live and Invest Overseas ranked Puerto Vallarta 3rd for 2026, and Mexico is 2nd in Expat Insider 2026 and 5th in International Living. It pairs a big English-speaking snowbird community with good private hospitals and short nonstop flights home, but Jalisco\'s cartel violence reached the city in February 2026.',
  // TODO(stage5): set tax, estate and lending from the rubric (3 is a placeholder).
  scores: { cost: 3, healthcare: 3, safety: 2, visa: 3, climate: 3, community: 5, tax: 3, estate: 3, lending: 3 },
  facts: {
    // TODO(stage5): write the estate and lending facts; rewrite tax and visa for BBD.
    estate: 'TODO',
    lending: 'TODO',
    healthcare:
      'Good private hospitals for a city its size (CMQ, San Javier, Amerimed) at well below US prices; the most complex care is in Guadalajara, and IMSS has age and pre-existing-condition limits.',
    safety:
      'Mexico is 137th of 163 in the 2026 Global Peace Index and Jalisco is reportedly at Level 3, "reconsider travel"; in February 2026, cartel blockades after El Mencho\'s killing shut the airport and left tourists sheltering in place.',
    visa: 'Temporary residency needs about $4,430/month net income or about $74,700 in savings or investments; permanent residency for retirees about $7,430/month or $299,000 (2026 figures); brokerage balances generally count, and amounts vary by consulate.',
    tax: 'Mexican tax residents are taxed on worldwide income, so US dividends, interest and gains are reportable in Mexico; the US–Mexico treaty and foreign tax credits help only partly (get local advice and check current rules).',
    climate: 'Dry and warm November–May; hot, humid and rainy June–October, with hurricane risk.',
    community: 'One of Mexico\'s largest US and Canadian communities, swelled by winter snowbirds and LGBTQ-friendly; daily life works in English.',
    access: 'Many nonstops to US and Canadian cities: about 3 hours to Dallas or Los Angeles.',
  },
  drawbacks: [
    'Jalisco cartel violence can reach the city, as the February 2026 blockades and flight shutdown showed',
    'Mexico taxes residents\' worldwide investment income, which undercuts a Buy-Borrow-Die tax plan',
    'Sticky summers, and prices that have climbed with popularity',
  ],
  sources: [S.mxAdvisory, S.mxResidency, { ...S.lios, name: '401(k) Specialist: Live and Invest Overseas 2026 list' }, S.gpiPoster],
}

export default profile
