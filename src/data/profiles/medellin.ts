import type { ExpatProfile } from '../expatPicks'

const profile: ExpatProfile = {
  tagline: 'Spring-like climate, good hospitals, weaker safety',
  summary:
    'Colombia was 2nd in Expat Insider 2025 and is 15th in International Living\'s 2026 index, and Medellín pairs a mild climate all year with well-regarded private hospitals at low cost. Safety is the weak point: Colombia is 141st of 163 in the 2026 Global Peace Index and is reportedly at US State Dept Level 3.',
  // TODO(stage5): set tax, estate and lending from the rubric (3 is a placeholder).
  scores: { cost: 4, healthcare: 4, safety: 2, visa: 3, climate: 5, community: 4, tax: 3, estate: 3, lending: 3 },
  facts: {
    // TODO(stage5): write the estate and lending facts; rewrite tax and visa for BBD.
    estate: 'TODO',
    lending: 'TODO',
    healthcare:
      'Private hospitals such as Pablo Tobón Uribe, Clínica Las Américas and San Vicente Fundación are reportedly among Latin America\'s best ranked; residents with a cédula can join the EPS system, and many expats add a private plan.',
    safety:
      'Colombia is 141st of 163 in the 2026 Global Peace Index and reportedly at US State Dept Level 3, "reconsider travel" (March 2026), with warnings about scopolamine druggings and dating-app robberies in Medellín; expats cluster in El Poblado and Laureles.',
    visa:
      'M-Pensionado needs a pension of at least 3× the minimum wage (about COP 5.25 million a month in 2026), and portfolio income does not count; a portfolio-only retiree needs the M-Rentista, which one guide puts at 10× the minimum wage (about COP 17.5 million a month) and another at 5×; check current rules.',
    tax: 'Residents present more than 183 days in any 365 are taxed on worldwide income at up to 39%, so US dividends, interest and gains are reportable in Colombia; there is no US–Colombia income tax treaty, only US foreign tax credits (get local advice and check current rules).',
    climate: '"Eternal spring" at about 1,500 m: roughly 22–28°C by day all year, with two rainy seasons.',
    community:
      'A large, young-skewing expat and digital-nomad scene in El Poblado and Laureles, and a smaller retiree community in nearby Envigado and Sabaneta; Spanish helps a lot.',
    access:
      'Nonstops reportedly include Miami, Fort Lauderdale and New York-JFK (mostly Avianca), plus American to Miami and United to Houston; about 4 hours to South Florida (check current schedules).',
  },
  drawbacks: [
    'Worldwide taxation with no US–Colombia treaty, so investment income can face Colombian tax at up to 39%',
    'Crime that targets foreigners (druggings, dating-app setups, robbery), and a reported Level 3 US advisory',
    'The Pensionado visa needs an actual pension; living off a portfolio means the much higher Rentista bar',
  ],
  sources: [
    { name: 'Colombia Move: Pensionado visa income requirements 2026', url: 'https://colombiamove.com/blog/colombia-pensionado-visa-income-requirements-2026/' },
    { name: 'Greenback Tax Services: Tax guide for Americans living in Colombia', url: 'https://www.greenbacktaxservices.com/country-guide/tax-guide-for-americans-living-in-colombia/' },
    {
      name: 'El Espectador: Colombia falls in the Global Peace Index 2026',
      url: 'https://www.elespectador.com/mundo/america/colombia-retrocede-en-el-indice-global-de-paz-mientras-aumentan-los-conflictos-mundiales/',
      edition: '2026',
    },
    { name: 'Jetpac: Is it safe to travel to Colombia in 2026', url: 'https://blog.jetpacglobal.com/blog/is-it-safe-to-travel-to-colombia/' },
  ],
}

export default profile
