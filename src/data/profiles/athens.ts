import type { ExpatProfile } from '../expatPicks'
import { S } from './_shared'

const profile: ExpatProfile = {
  tagline: 'History, islands nearby, 7% flat tax for pensioners',
  summary:
    'Greece is 1st in International Living\'s 2026 Global Retirement Index, the first time it has topped the list, and new residents with a qualifying pension can elect a 7% flat tax on foreign income for 15 years. Athens is a low-cost EU capital with good flight links and the islands close by.',
  // TODO(stage5): set tax, estate and lending from the rubric (3 is a placeholder).
  scores: { cost: 3, healthcare: 3, safety: 3, visa: 3, climate: 3, community: 3, tax: 3, estate: 3, lending: 3 },
  facts: {
    // TODO(stage5): write the estate and lending facts; rewrite tax and visa for BBD.
    estate: 'TODO',
    lending: 'TODO',
    healthcare:
      'The public ESY system is stretched, with long waits; good private hospitals (Hygeia, Metropolitan, Iaso) are moderately priced, and most expats use private insurance.',
    safety: 'Greece is 53rd in the 2026 Global Peace Index; violent crime is low, but pickpocketing and frequent protests and strikes affect central Athens.',
    visa:
      'Financially Independent Person permit: at least €3,500/month of passive income from abroad (+20% for a spouse), private health insurance and Greek housing; renewable for 3 years, no work allowed.',
    tax: 'Article 5B: a 7% flat tax on all foreign income for up to 15 years if you have a qualifying pension and were not Greek tax resident in 5 of the previous 6 years (rules updated September 2026); otherwise progressive rates up to 44%; check current rules.',
    climate: 'Hot, dry summers with frequent 40°C heatwaves and wildfire smoke; short, mild winters.',
    community: 'A smaller English-speaking retiree scene than Portugal or Spain, growing in the southern coastal suburbs (Glyfada, Vouliagmeni); English is widely spoken.',
    access: 'United flies Newark–Athens daily (from March 2026) plus Washington Dulles in summer; other US nonstops are mostly seasonal.',
  },
  drawbacks: [
    'Extreme summer heat and wildfire smoke are getting worse',
    'Slow bureaucracy, a stretched public health system and frequent strikes',
    'The 7% regime needs a qualifying pension, so a portfolio-only retiree may not qualify, and the residence permit\'s €3,500/month bar is high',
  ],
  sources: [
    { ...S.il, name: '401k Specialist: Greece tops 2026 Global Retirement Index' },
    { name: 'Global Citizen Solutions: FIP visa Greece 2026', url: 'https://www.globalcitizensolutions.com/fip-visa-greece/' },
    {
      name: 'Greek City Times: Greece extends special tax regime deadline for foreign pensioners',
      url: 'https://greekcitytimes.com/2026/09/26/greece-extends-special-tax-regime-deadline-for-foreign-pensioners/',
    },
    {
      name: 'Greek City Times: Greece 53rd in GPI 2026',
      url: 'https://greekcitytimes.com/2026/06/12/iceland-safest-country-19th-year-greece-53rd-global-peace-index-2026/',
      edition: '2026',
    },
    S.united,
  ],
}

export default profile
