import type { ExpatProfile } from '../expatPicks'
import { S } from './_shared'

const profile: ExpatProfile = {
  tagline: 'Cheap, historic Bulgarian city with a 5% tax on dividends',
  summary:
    'Bulgaria has one of the EU\'s best tax profiles for buy-borrow-die: no wealth tax, a 5% final tax on dividends, and children (and a foreigner\'s foreign assets) outside inheritance tax. Plovdiv is among the cheapest cities on this list, with private care at Eurohospital and Sofia\'s JCI hospital 144 km away; the catches are a residence route that needs a pension, a continental climate and a small English-speaking community.',
  scores: { cost: 5, healthcare: 3, safety: 4, visa: 3, climate: 3, community: 2, tax: 4, estate: 5, lending: 3 },
  facts: {
    healthcare:
      'Eurohospital Plovdiv is the private hospital the UK embassy lists in the city; Acibadem\'s Plovdiv office only coordinates patients, and serious cases go to Sofia (Acibadem City Clinic, JCI), 144 km away; the permit needs private cover of at least €30,000, and joining public NHIF as self-insured costs 8% of declared income, about €50/month at the minimum base.',
    safety:
      'Bulgaria is 26th in the 2026 Global Peace Index; UK travel advice warns of pickpockets in tourist areas and theft from cars at petrol stations, and notes isolated hostility toward LGBT+ people in Plovdiv and Burgas.',
    visa: 'Pensioner D visa, then a residence permit renewed for up to a year at a time: it needs a right to a pension (US Social Security should qualify, an inference) and means of at least the minimum wage (€620.20/month, 2026); a law firm found no ground for savings-only applicants, and the investment route needs about €307k in Bulgarian property.',
    tax: 'No wealth tax; residents pay a 5% final tax on foreign dividends, 0% on EU/EEA bank interest and 10% on other interest (so US interest pays 10%); gains on shares are exempt on EU and "equivalent" markets, and the US treaty credit may cancel most of the 5% (an inference); there is no newcomer regime.',
    estate:
      'Bulgaria\'s municipal inheritance tax fully exempts children and grandchildren, and reaches a foreign national only on property in Bulgaria, so a US portfolio passes to US-resident children with no Bulgarian tax (law-firm source; the Ministry of Finance page could not be read); there is no US estate treaty.',
    lending:
      'IBKR reportedly serves Bulgaria residents (likely through its EU entity), with margin terms per country unknown; Schwab International is reportedly unavailable (Bulgaria is not on its reported list), and EU PRIIPs rules reportedly block new buys of US-listed ETFs, not holding them.',
    climate: 'Continental: July and August highs about 31–33°C, January highs about 5°C with lows below freezing, and about 540 mm of rain a year.',
    community:
      'Bulgaria\'s second city (about 330,000 people in 2024), with a small English-speaking foreign community, smaller than Sofia\'s or the Black Sea coast\'s; daily life runs in Bulgarian.',
    access: 'Plovdiv airport has a handful of Ryanair routes (London Stansted, Manchester, Birmingham and Milan in winter 2025/26); Sofia airport, 144 km away, has no US nonstop, so trips connect via Vienna, Frankfurt, Istanbul or another hub.',
  },
  drawbacks: [
    'Residence needs a pension, with no route on savings or investment income alone',
    'Serious care means a trip to Sofia, and paperwork runs in Bulgarian',
    'Hot summers, cold winters and few direct flights',
  ],
  sources: [
    { name: 'PwC: Bulgaria, taxes on personal income', url: 'https://taxsummaries.pwc.com/bulgaria/individual/taxes-on-personal-income' },
    { name: 'PwC: Bulgaria, income determination', url: 'https://taxsummaries.pwc.com/bulgaria/individual/income-determination' },
    { name: 'PwC: Bulgaria, other taxes', url: 'https://taxsummaries.pwc.com/bulgaria/individual/other-taxes' },
    { name: 'Innovires: inheritance tax in Bulgaria', url: 'https://www.innovires.com/en/blog/danak-nasledstvo-bulgaria.html' },
    { name: 'Innovires: D visa for Bulgaria', url: 'https://innovires.com/en/blog/viza-d-bulgaria.html' },
    { name: 'Innovires: health insurance for foreigners in Bulgaria', url: 'https://innovires.com/tax-residency/blog/bulgaria-health-insurance-foreigners.html' },
    { name: 'GOV.UK: Bulgaria, list of medical facilities', url: 'https://www.gov.uk/government/publications/bulgaria-list-of-medical-facilities/bulgaria-doctors' },
    { name: 'Acibadem International: Plovdiv office', url: 'https://acibademinternational.com/international-offices/office-bulgaria-plovdiv/' },
    { name: 'GOV.UK: Bulgaria travel advice, safety and security', url: 'https://www.gov.uk/foreign-travel-advice/bulgaria/safety-and-security' },
    { name: 'Wikipedia: Plovdiv', url: 'https://en.wikipedia.org/wiki/Plovdiv' },
    {
      name: 'Ryanair: new Milan route from Plovdiv for winter 2025/26',
      url: 'https://corporate.ryanair.com/news/ryanair-grows-in-plovdiv-with-new-milan-malpensa-route-in-winter-2025-26/',
    },
    { name: 'YourTaxBase: Charles Schwab for expats', url: 'https://yourtaxbase.com/blog/charles-schwab-for-expats', edition: '2026' },
    S.gpiTop50,
  ],
}

export default profile
