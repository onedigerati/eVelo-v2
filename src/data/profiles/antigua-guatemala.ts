import type { ExpatProfile } from '../expatPicks'

const profile: ExpatProfile = {
  tagline: 'Colonial highland town, territorial tax, no inheritance tax',
  summary:
    'Guatemala taxes only Guatemalan-source income, has no wealth tax, and repealed its inheritance tax in April 2026. Permanent residence as a rentista needs $1,250 a month. Antigua is the country\'s most established expat town, a colonial city at 1,545 m with a spring-like climate. Serious hospitals and the airport are in Guatemala City, about an hour away, and security is the main concern.',
  scores: { cost: 4, healthcare: 3, safety: 2, visa: 5, climate: 5, community: 3, tax: 5, estate: 5, lending: 3 },
  facts: {
    healthcare:
      'Hospital Privado Hermano Pedro in Antigua advertises 24/7 emergencies and admissions; the serious-care hospitals (Herrera Llerandi, Centro Médico, Universitario Esperanza, El Pilar) are in Guatemala City, about an hour away; the public IGSS does not cover retirees who never worked in Guatemala, so budget private or international cover with evacuation.',
    safety:
      'Guatemala is 88th of 163 in the 2026 Global Peace Index and reportedly at US State Dept Level 3, "reconsider travel" (secondary source, dated 2023), with Level 4 for San Marcos, Huehuetenango and parts of Guatemala City; Antigua\'s homicide rate was 23.8 per 100,000 in the year to June 2026, and the UK warns of armed robberies on tourist routes.',
    visa:
      'Rentista or pensionado permanent residence on verifiable foreign income of at least $1,250/month, plus $300 per dependant (Acuerdo IGM-16-2025); fees are about $25 to file and $400 for the status (secondary source), and filing is in person in Guatemala City.',
    tax: 'No wealth tax (only the municipal IUSI on real estate, about 0.2–0.9%); the system is territorial, and PwC says investment income and capital gains from abroad are not taxed, so US dividends, interest and loan proceeds are outside Guatemalan tax.',
    estate:
      'Decreto 6-2026 repealed the inheritance, legacy and gift tax (previously 1–25%) from 2 April 2026, so heirs owe nothing locally; there is no US estate treaty, and US estate tax applies above the $15M exemption (2026).',
    lending:
      'Interactive Brokers reportedly serves all non-sanctioned countries, so Guatemala residents should be accepted, but margin terms are unconfirmed; whether Schwab One International accepts Guatemala is unknown, and Fidelity and Vanguard open no new accounts for residents abroad.',
    climate:
      'Spring-like at 1,545 m: highs about 22–25°C and lows 11–15°C all year, with most of the 1,065 mm of rain falling May–October; Volcán de Fuego, nearby, is almost always active.',
    community:
      'The most established expat retirement town in Guatemala, with US and European retirees living among Guatemalans rather than in an enclave (secondary sources; no headcount found); Spanish is needed day to day.',
    access:
      'La Aurora (GUA) in Guatemala City is about 1–1.5 hours by road, with nonstops to Miami, Dallas, Atlanta, Houston, Newark, Los Angeles, New York-JFK, Fort Lauderdale and Chicago (seasonal) on American, United, Delta, JetBlue, Alaska and Avianca.',
  },
  drawbacks: [
    'Serious hospital care and the airport are an hour or more away in Guatemala City',
    'High violent crime nationally, a reported Level 3 US advisory, and robberies on tourist routes',
    'No public healthcare for retirees, so private or international cover is a must',
  ],
  sources: [
    { name: 'PwC Worldwide Tax Summaries: Guatemala, income determination', url: 'https://taxsummaries.pwc.com/guatemala/individual/income-determination', edition: '2026' },
    { name: 'PwC Worldwide Tax Summaries: Guatemala, other taxes', url: 'https://taxsummaries.pwc.com/guatemala/individual/other-taxes', edition: '2026' },
    {
      name: 'LexLatin: Decreto 6-2026 eliminates Guatemala\'s inheritance tax',
      url: 'https://lexlatin.com/opinion/decreto-6-2026-guatemala-elimina-impuesto-herencias-legados-donaciones-muerte',
      edition: '2026',
    },
    {
      name: 'Consortium Legal: Permanent residence as a rentier or pensioner in Central America (Jan 2026)',
      url: 'https://consortiumlegal.com/en/2026/01/16/permanent-residence-as-a-rentier-or-pensioner-in-central-america/',
    },
    { name: 'Living in Guatemala: Healthcare for retirees', url: 'https://livinginguatemala.com/retire-in-guatemala/healthcare-for-retirees/' },
    { name: 'Living in Guatemala: Retire in Guatemala', url: 'https://livinginguatemala.com/retire-in-guatemala/' },
    { name: 'GOV.UK: Guatemala travel advice, safety and security', url: 'https://www.gov.uk/foreign-travel-advice/guatemala/safety-and-security' },
    { name: 'Travel Advisory: Guatemala (US State Dept levels)', url: 'https://www.traveladvisory.io/advisory/guatemala' },
    { name: 'LatAm Travellers: Safest countries in Central America 2026 (GPI)', url: 'https://latamtravellers.com/es/blogs/news/safest-countries-in-central-america-2026-gpi-ranked', edition: '2026' },
    { name: 'Wikipedia: Antigua Guatemala (climate, volcanoes)', url: 'https://en.wikipedia.org/wiki/Antigua_Guatemala' },
    { name: 'Wikipedia: La Aurora International Airport', url: 'https://en.wikipedia.org/wiki/La_Aurora_International_Airport' },
  ],
}

export default profile
