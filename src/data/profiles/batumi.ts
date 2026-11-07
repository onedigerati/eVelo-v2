import type { ExpatProfile } from '../expatPicks'

const profile: ExpatProfile = {
  tagline: 'Black Sea resort city with Georgia\'s near-zero tax on a US portfolio',
  summary:
    'Batumi has Georgia\'s tax profile: foreign-source income is exempt, there is no wealth tax and children inherit free, and Americans can stay a year visa-free. It is one of the cheapest cities on this list, but it ranks below Tbilisi for weaker healthcare, few flights and one of Europe\'s wettest climates.',
  scores: { cost: 5, healthcare: 2, safety: 4, visa: 4, climate: 3, community: 2, tax: 5, estate: 5, lending: 3 },
  facts: {
    healthcare:
      'Private hospitals and clinics in Batumi handle routine care, but the best Georgian hospitals are in Tbilisi, and Acıbadem\'s Batumi office exists to send patients to its hospitals in Turkey; public cover is limited, so budget for private insurance and travel for complex care.',
    safety:
      'UK travel advice says crime levels in Georgia are low, mainly pickpocketing; daily political protests centre on Tbilisi but also reach other cities, and the UK advises against travel to parts of the country near the breakaway regions, which are far from Batumi.',
    visa: 'US citizens can stay 365 days visa-free, with travel insurance required on entry from 2026; for residence, property worth at least US$150k at market value (since March 2026, properties can be combined) gives a yearly-renewable temporary permit covering spouse and children; Batumi\'s new-build market is reportedly oversupplied, so check resale value.',
    tax: 'No wealth tax; resident individuals are exempt from tax on income without a Georgian source, so US dividends and interest are untaxed locally (one guide says residents are taxed on global income, but PwC and the 2025 tax card list the exemption); with no US–Georgia income tax treaty, US withholding on dividends may be 30% (unverified).',
    estate:
      'No separate inheritance tax, and property inherited by first- and second-line heirs (children, spouse, parents, siblings, grandchildren) is exempt from income tax, so a US portfolio passes to US-resident children with no Georgian tax; there is no US estate treaty.',
    lending:
      'IBKR reportedly accepts residents of all non-sanctioned countries, including Georgia, though margin terms per country are unknown; Schwab International is reportedly unavailable, as Georgia is off its reported list.',
    climate: 'Humid subtropical and the wettest city in the Caucasus, with about 2,400–2,500 mm of rain a year; July–August highs about 31°C and a January average about 5°C, with light snow at times.',
    community:
      'Georgia\'s second city (about 246,000 people, 2026) draws Russian-speaking residents, international medical students and summer tourists, but few Western retirees; Russian is the usual second language, more than English.',
    access: 'Batumi airport, 2 km from the centre, handled about 1.2M passengers in 2025, mostly to Istanbul, Tel Aviv (seasonal), Riga (seasonal) and Russia; there are no US nonstops, so trips connect through Istanbul.',
  },
  drawbacks: [
    'Healthcare is thinner than in Tbilisi, so serious care means Tbilisi or Turkey',
    'Very wet, humid climate for much of the year',
    'No US tax treaty, so US dividends may carry the full 30% withholding',
  ],
  sources: [
    { name: 'PwC: Georgia, taxes on personal income', url: 'https://taxsummaries.pwc.com/georgia/individual/taxes-on-personal-income' },
    { name: 'PwC: Georgia, other taxes', url: 'https://taxsummaries.pwc.com/georgia/individual/other-taxes' },
    { name: 'Legal 500: Georgia tax card 2025', url: 'https://www.legal500.com/intelligence/georgia/tax/georgia-tax-card-2025' },
    { name: 'Eurofast: understanding individual taxes in Georgia', url: 'https://eurofast.eu/understanding-individual-taxes-in-georgia/' },
    {
      name: 'EIG Law: Georgia raises the real-estate threshold for residence permits (Mar 2026)',
      url: 'https://eiglaw.com/georgia-to-increase-real-estate-investment-threshold-for-residence-permits-effective-march-1-2026/',
    },
    {
      name: 'Where in the World is Nina: Georgia\'s free year for Americans (2026)',
      url: 'https://whereintheworldisnina.com/georgias-free-year-for-americans-is-still-real-2026-quietly-added-a-catch-nobodys-mentioning/',
    },
    { name: 'Acıbadem International: Batumi office', url: 'https://acibademinternational.com/international-offices/office-georgia-batumi/' },
    { name: 'GOV.UK: Georgia travel advice, safety and security', url: 'https://www.gov.uk/foreign-travel-advice/georgia/safety-and-security' },
    { name: 'Wikipedia: Batumi', url: 'https://en.wikipedia.org/wiki/Batumi' },
    { name: 'Wikipedia: Batumi International Airport', url: 'https://en.wikipedia.org/wiki/Batumi_International_Airport' },
  ],
}

export default profile
