import type { ExpatProfile } from '../expatPicks'
import { S } from './_shared'

const profile: ExpatProfile = {
  tagline: 'Riviera city with France\'s top-rated healthcare',
  summary:
    'France is 7th in International Living\'s 2026 index and scored best of all for healthcare, and Nice adds the Riviera\'s mild winters, a big English-speaking community and a year-round New York nonstop. It is expensive, and French tax on investment income and real estate is heavy for a large portfolio.',
  // TODO(stage5): set tax, estate and lending from the rubric (3 is a placeholder).
  scores: { cost: 1, healthcare: 5, safety: 3, visa: 4, climate: 4, community: 4, tax: 3, estate: 3, lending: 3 },
  facts: {
    // TODO(stage5): write the estate and lending facts; rewrite tax and visa for BBD.
    estate: 'TODO',
    lending: 'TODO',
    healthcare:
      'Visitor-visa holders can join the public PUMa system after 3 months\' residence (most add a top-up mutuelle); a contribution for non-EU visitor-visa holders passed in the 2026 social security law but its amount awaits a decree; the CHU de Nice and private clinics are strong.',
    safety:
      'France fell to 99th in the 2026 Global Peace Index, mostly on militarisation and nuclear factors, while homicide is very low; in Nice, pickpocketing and car break-ins are the common issues, and security stays visible since the 2016 attack.',
    visa:
      'Long-stay visitor visa (VLS-TS visiteur): stable passive income of roughly the net minimum wage (reportedly about €1,440/month in 2026), private health insurance and no work in France; renewed yearly at the prefecture at first.',
    tax: 'Residents are taxed on worldwide income; dividends, interest and securities gains face a 31.4% flat tax from 2026 (12.8% tax plus 18.6% social charges), and IFI wealth tax hits net real estate over €1.3M, with foreign property excluded for the first 5 years; the US–France treaty applies (check current rules).',
    climate: 'Mediterranean: about 300 sunny days, winter days around 13°C and hot summers near 28–30°C, with occasional heatwaves.',
    community: 'A large English-speaking community of British, American and Northern European residents along the Riviera, though daily life and paperwork run in French.',
    access:
      'La Compagnie (business class only) flies Newark–Nice year-round from the 2026–27 winter, and US carriers add summer New York flights; check current schedules.',
  },
  drawbacks: [
    'One of the most expensive places on this list, especially for housing',
    'The 31.4% flat tax and IFI on property weigh on a large taxable portfolio',
    'French bureaucracy (prefecture renewals, PUMa enrolment) is slow and in French',
  ],
  sources: [
    S.il,
    {
      name: 'Connexion: French MPs back health fee for visitor visas',
      url: 'https://www.connexionfrance.com/news/french-mps-back-new-health-fee-for-visitor-visas-and-target-americans/752385',
    },
    { name: 'Expat.com: France raises flat tax to 31.4%', url: 'https://www.expat.com/en/expat-mag/12501-france-raises-flat-tax-to-314-percent-what-it-means-for-expats.html' },
    {
      name: 'The Local: how France\'s wealth tax affects new arrivals (Oct 2026)',
      url: 'https://www.thelocal.fr/20261026/ask-the-expert-how-does-frances-wealth-tax-affect-new-arrivals',
    },
    {
      name: 'AviationPros: Nice gains first year-round New York service',
      url: 'https://www.aviationpros.com/airport-business/news/55384892/nice-airport-gains-first-year-round-new-york-service-as-la-compagnie-extends-route',
    },
  ],
}

export default profile
