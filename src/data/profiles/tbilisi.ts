import type { ExpatProfile } from '../expatPicks'

const profile: ExpatProfile = {
  tagline: 'Cheap Caucasus capital that leaves foreign income untaxed',
  summary:
    'Georgia exempts residents\' foreign-source income, has no wealth tax, and lets children inherit free, so a US portfolio carries almost no local tax. Americans can stay a year visa-free, a US$150k property gives residence, and Tbilisi is among the cheapest capitals in the 50; the costs are uneven healthcare, a continental climate and no US tax treaty.',
  scores: { cost: 5, healthcare: 3, safety: 4, visa: 4, climate: 3, community: 3, tax: 5, estate: 5, lending: 3 },
  facts: {
    healthcare:
      'Modern private hospitals in Tbilisi (New Hospitals, the Evex network, American Medical Centers) are cheap by Western standards and often have English-speaking doctors, but public cover is limited, quality falls off outside the capital, and complex care for over-70s may mean going abroad.',
    safety:
      'UK travel advice says crime levels are low, mainly pickpocketing; political protests centred on Rustaveli Avenue can escalate without warning, and the UK advises against travel to parts of the country near the breakaway regions.',
    visa: 'US citizens can stay 365 days visa-free, with travel insurance required on entry from 2026; for residence, property worth at least US$150k at market value (since March 2026, properties can be combined) gives a yearly-renewable temporary permit covering spouse and children; a US$300k investment track reportedly leads to permanent residence.',
    tax: 'No wealth tax; resident individuals are exempt from tax on income without a Georgian source, so US dividends and interest are untaxed locally (one guide says residents are taxed on global income, but PwC and the 2025 tax card list the exemption); with no US–Georgia income tax treaty, US withholding on dividends may be 30% (unverified).',
    estate:
      'No separate inheritance tax, and property inherited by first- and second-line heirs (children, spouse, parents, siblings, grandchildren) is exempt from income tax, so a US portfolio passes to US-resident children with no Georgian tax; there is no US estate treaty.',
    lending:
      'IBKR reportedly accepts residents of all non-sanctioned countries, including Georgia, though margin terms per country are unknown; Schwab International is reportedly unavailable, as Georgia is off its reported list.',
    climate: 'Continental: July highs average about 31°C (heatwaves top 35°C), and January highs about 7°C with lows below freezing and some snow; about 510 mm of rain a year.',
    community:
      'Grew sharply after 2022 with Russian, Belarusian and Ukrainian arrivals and remote workers, alongside long-term Westerners in Vake and Vera; English is common among younger Georgians in the centre, and Russian is the usual fallback.',
    access: 'There are no US nonstops, so trips connect through Istanbul or another hub.',
  },
  drawbacks: [
    'Healthcare is thin for serious care, especially outside Tbilisi',
    'Political tension, protests and Russia-occupied regions nearby',
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
    { name: 'Expat Hub Georgia: hospitals in Tbilisi', url: 'https://expathub.ge/hospitals-in-tbilisi/' },
    { name: 'GOV.UK: Georgia travel advice, safety and security', url: 'https://www.gov.uk/foreign-travel-advice/georgia/safety-and-security' },
    { name: 'EasyGeorgian: living in Tbilisi as an expat, 2026 guide', url: 'https://easygeorgian-website.pages.dev/blog/living-in-tbilisi-guide/' },
    { name: 'Wikipedia: Tbilisi (climate)', url: 'https://en.wikipedia.org/wiki/Tbilisi' },
  ],
}

export default profile
