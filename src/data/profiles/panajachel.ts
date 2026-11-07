import type { ExpatProfile } from '../expatPicks'

const profile: ExpatProfile = {
  tagline: 'Lake Atitlán town, territorial tax, care three hours away',
  summary:
    'Guatemala taxes only Guatemalan-source income, has no wealth tax, repealed its inheritance tax in April 2026, and grants permanent residence as a rentista on $1,250 a month. Panajachel brings that profile to Lake Atitlán, with a mild highland climate and a 50-year history of foreign residents. It ranks low because there is no hospital in town and serious care is about 3 hours away in Guatemala City; Antigua carries Guatemala better.',
  scores: { cost: 4, healthcare: 1, safety: 2, visa: 5, climate: 4, community: 3, tax: 5, estate: 5, lending: 3 },
  facts: {
    healthcare:
      'No hospital in Panajachel: the public CAP health centre is open 24 hours and there are private clinics, the public Hospital Nacional de Sololá is about 20 minutes uphill, and the non-profit Hospitalito Atitlán across the lake offers 24-hour emergencies; cardiology, complex surgery and MRI mean about 3 hours to Guatemala City (or 2 to Xela), helicopter evacuation is sometimes used, and the public IGSS does not cover retirees.',
    safety:
      'Guatemala is 88th of 163 in the 2026 Global Peace Index and reportedly at US State Dept Level 3, "reconsider travel" (secondary source, dated 2023); the UK warns of "armed attacks or robberies on most tourist routes between Guatemala City, Antigua … and Lake Atitlán", there are occasional night robberies on the Panajachel–Sololá road, and a lake boat capsized in high wind in January 2026, killing two tourists (secondary source).',
    visa:
      'Rentista or pensionado permanent residence on verifiable foreign income of at least $1,250/month, plus $300 per dependant (Acuerdo IGM-16-2025); fees are about $25 to file and $400 for the status (secondary source), and filing is in person in Guatemala City.',
    tax: 'No wealth tax (only the municipal IUSI on real estate, about 0.2–0.9%); the system is territorial, and PwC says investment income and capital gains from abroad are not taxed, so US dividends, interest and loan proceeds are outside Guatemalan tax.',
    estate:
      'Decreto 6-2026 repealed the inheritance, legacy and gift tax (previously 1–25%) from 2 April 2026, so heirs owe nothing locally; there is no US estate treaty, and US estate tax applies above the $15M exemption (2026).',
    lending:
      'Interactive Brokers reportedly serves all non-sanctioned countries, so Guatemala residents should be accepted, but margin terms are unconfirmed; whether Schwab One International accepts Guatemala is unknown, and Fidelity and Vanguard open no new accounts for residents abroad.',
    climate:
      'Mild at 1,597 m: highs about 25°C all year, with about 1,490 mm of rain, June the wettest; rainy-season landslides are a hazard, and a mudslide in Hurricane Stan (2005) destroyed about 100 homes along the river.',
    community:
      'A town of about 15,000 (2018) with a foreign community dating back about 50 years, English-speaking doctors and brokers, and long-term expats often in Jucanya across the river; no headcount was found.',
    access:
      'La Aurora (GUA) in Guatemala City is about 3 hours by road (shared shuttles about $32–40), with nonstops to Miami, Fort Lauderdale, Atlanta, Dallas, Houston, Chicago, Newark, New York-JFK and Los Angeles.',
  },
  drawbacks: [
    'No hospital in town, and serious care is about 3 hours away in Guatemala City',
    'Robberies on the tourist routes to the lake and a reported Level 3 US advisory',
    'Rainy-season landslides, and boats that are risky in afternoon wind',
  ],
  sources: [
    { name: 'Living in Guatemala: Panajachel', url: 'https://livinginguatemala.com/panajachel/' },
    { name: 'Living in Guatemala: Hospitals near Panajachel', url: 'https://livinginguatemala.com/directories/hospitals-panajachel/' },
    { name: 'Wikipedia: Panajachel', url: 'https://en.wikipedia.org/wiki/Panajachel' },
    { name: 'GOV.UK: Guatemala travel advice, safety and security', url: 'https://www.gov.uk/foreign-travel-advice/guatemala/safety-and-security' },
    { name: 'Travel Advisory: Guatemala (US State Dept levels)', url: 'https://www.traveladvisory.io/advisory/guatemala' },
    { name: 'LatAm Travellers: Safest countries in Central America 2026 (GPI)', url: 'https://latamtravellers.com/es/blogs/news/safest-countries-in-central-america-2026-gpi-ranked', edition: '2026' },
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
    { name: 'Wikipedia: La Aurora International Airport', url: 'https://en.wikipedia.org/wiki/La_Aurora_International_Airport' },
  ],
}

export default profile
