import type { ExpatProfile } from '../expatPicks'
import { S } from './_shared'

const profile: ExpatProfile = {
  tagline: 'Renaissance city, strong healthcare, big American community',
  summary:
    'Italy is 6th in International Living\'s 2026 index and on Forbes\' 2026 list, and Florence offers world-class culture, good Tuscan public hospitals and a long-established American community. The elective-residence visa wants about €31,000 a year of passive income, and Florence does not qualify for Italy\'s 7% tax regime for pensioners.',
  // TODO(stage5): set tax, estate and lending from the rubric (3 is a placeholder).
  scores: { cost: 1, healthcare: 4, safety: 4, visa: 3, climate: 3, community: 4, tax: 3, estate: 3, lending: 3 },
  facts: {
    // TODO(stage5): write the estate and lending facts; rewrite tax and visa for BBD.
    estate: 'TODO',
    lending: 'TODO',
    healthcare:
      'Elective-residence holders need private insurance for the visa, then can join the public SSN voluntarily for at least €2,000 a year; Careggi is a major teaching hospital, and Tuscany\'s public system is among Italy\'s better ones.',
    safety: 'Italy is 35th in the 2026 Global Peace Index; violent crime is low, with pickpocketing around the Duomo, the station and on buses.',
    visa:
      'Elective-residence visa: stable passive income of about €31,000/year (a consular benchmark, not a statute; more for a spouse); pensions, dividends, interest and rent count, savings alone do not, and no work is allowed, even remote.',
    tax: 'Residents are taxed on worldwide income; dividends, interest and gains are taxed at 26%, plus IVAFE of 0.2% a year on foreign financial accounts; the 7% pensioner regime covers only small southern and quake-zone towns, so not Florence; check current rules.',
    climate: 'Hot, humid summers often above 35°C in the river basin, and cool, damp winters with occasional frost.',
    community: 'A large, long-established American and British community, helped by many US university programmes; English is common in the centre.',
    access: 'No regular US nonstop to Florence or Pisa could be confirmed for 2026; most trips go via Rome (about 1.5 hours by fast train), Milan or a European hub.',
  },
  drawbacks: [
    'Very expensive housing in the centre, and heavy tourist crowds most of the year',
    '26% on investment income plus a yearly tax on foreign accounts, and no 7% regime',
    'The visa needs proven passive income, so a portfolio-only retiree with low dividends may struggle',
  ],
  sources: [
    S.il,
    { name: 'Global Citizen Solutions: Italy elective residence visa 2026', url: 'https://www.globalcitizensolutions.com/italy-elective-residence-visa/' },
    {
      name: 'The Local: is Italy\'s flat tax for pensioners still available in 2026',
      url: 'https://www.thelocal.it/20260128/is-italys-flat-tax-rate-for-pensioners-still-available-in-2026',
    },
    S.gpiTop50,
  ],
}

export default profile
