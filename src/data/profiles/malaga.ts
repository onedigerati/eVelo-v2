import type { ExpatProfile } from '../expatPicks'
import { S } from './_shared'

const profile: ExpatProfile = {
  tagline: 'Costa del Sol warmth, long-established foreign community',
  summary:
    'Malaga was 2nd in InterNations\' 2024 city ranking and anchors the Costa del Sol, home to one of Europe\'s oldest and largest foreign retiree communities. It has some of Europe\'s mildest winters, and Andalusia waives its regional wealth tax.',
  // TODO(stage5): set tax, estate and lending from the rubric (3 is a placeholder).
  scores: { cost: 3, healthcare: 4, safety: 4, visa: 3, climate: 5, community: 5, tax: 3, estate: 3, lending: 3 },
  facts: {
    // TODO(stage5): write the estate and lending facts; rewrite tax and visa for BBD.
    estate: 'TODO',
    lending: 'TODO',
    healthcare:
      'Good public hospitals (Regional, Clínico); visa holders start on private insurance and can usually move to convenio especial after a year; many English-speaking private clinics along the coast.',
    safety: 'Spain is 27th in the 2026 Global Peace Index; violent crime is low, with petty theft and some organised-crime news along the coast.',
    visa: 'Non-lucrative visa: passive income or savings of €2,400/month (400% of IPREM, 2026) plus private health insurance; work is not allowed.',
    tax: 'Residents are taxed on worldwide income (savings income at 19–30%); Andalusia gives full relief on regional wealth tax, but the national solidarity tax still applies to net wealth above €3M; check current rules.',
    climate: 'About 300 sunny days; winters around 17°C; hot, dry summers.',
    community: 'A very large British and Northern European community on the Costa del Sol (Fuengirola, Marbella, Nerja), with English-language services everywhere.',
    access: 'United has flown Newark–Malaga in past summers, but 2026 service could not be confirmed; otherwise connect via Madrid or a European hub.',
  },
  drawbacks: [
    'Rents and property prices have risen sharply with tourism and foreign demand',
    'Summer crowds and heat, and some coastal towns feel more resort than Spanish town',
    'The non-lucrative visa\'s income bar is high, and holders must spend most of the year in Spain',
  ],
  sources: [
    S.iprem,
    {
      name: 'Skybound Wealth: Spain wealth tax 2026 and the €3M solidarity tax',
      url: 'https://www.skyboundwealth.com/technical-guides/spain-wealth-tax-2026-who-pays-regional-rules-the-3m-solidarity-tax',
    },
    S.gpiTop50,
    S.spainAir,
  ],
}

export default profile
