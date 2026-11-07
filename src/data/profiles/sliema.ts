import type { ExpatProfile } from '../expatPicks'

const profile: ExpatProfile = {
  tagline: 'English-speaking EU island where unremitted dividends go untaxed',
  summary:
    'Malta taxes a resident non-dom only on foreign income brought into the country, so dividends left in the US account face a €5,000 minimum tax at most, with no wealth or inheritance tax. Sliema is the expat heart of the island, English is an official language, and Delta began flying from New York in 2026; the cheaper Global Residence terms need an application by 31 December 2026.',
  scores: { cost: 2, healthcare: 4, safety: 4, visa: 3, climate: 4, community: 5, tax: 4, estate: 5, lending: 3 },
  facts: {
    healthcare:
      'Mater Dei, the acute general teaching hospital in Msida, is a short drive away, and Saint James and St Thomas are the main private hospitals; non-EU residents must hold qualifying private cover, since free public care is tied to social security status.',
    safety:
      'Malta is outside the Global Peace Index; UK travel advice says crime against tourists is rare, with pickpocketing on crowded summer buses, bag snatching and drink spiking in the Paceville bars the main risks.',
    visa: 'Global Residence Programme: a tax status and residence route for non-EU nationals with a €275k purchase or €9,600/yr rental (lower in the south and Gozo); from 2027 the new Global Resident status needs €700k or €14k/yr, while applications filed by 31 Dec 2026 keep the old terms to 2031; permanent residence (MPRP) costs about €99k in fees plus €375k property or €14k/yr rent.',
    tax: 'No wealth tax; a non-domiciled resident is taxed only on foreign income remitted to Malta, with a €5,000 minimum tax if foreign income is €35k+, and foreign capital gains are untaxed even if remitted; under the GRP, remitted income pays 15% with a €15k minimum (€35k from 2027); whether margin-loan proceeds brought into Malta count as a remittance is unverified.',
    estate: 'No inheritance, estate or gift tax; stamp duty applies only on inheriting Maltese property (5%) or Maltese shares (2%), so a US portfolio passes to US-resident children with no Maltese tax.',
    lending:
      'IBKR reportedly serves Malta residents (likely through its EU entity), with margin terms per country unknown; Schwab International reportedly does not accept Malta, and EU PRIIPs rules reportedly block new purchases of US ETFs, though existing holdings can usually be kept.',
    climate: 'Mediterranean with about 3,000 hours of sun: August days around 31°C and humid, January highs about 15°C with lows near 9°C, and little rain outside winter.',
    community:
      'More than half of Sliema\'s 22,000 residents are foreign nationals (2024), and English is an official language, so daily life, government and healthcare all work in English.',
    access: 'Delta flies New York JFK–Malta 3 times a week in summer (from June 2026); the rest of the year, connect through a European hub; the Airport Direct bus links Sliema to Malta International.',
  },
  drawbacks: [
    'Dense, built-up and crowded, with heavy traffic and construction',
    'Housing in Sliema is in the full-price tier, and the cheap GRP terms close for applications after 2026',
    'Whether bringing in loan proceeds counts as a taxable remittance is untested',
  ],
  sources: [
    { name: 'PwC: Malta, taxes on personal income', url: 'https://taxsummaries.pwc.com/malta/individual/taxes-on-personal-income' },
    { name: 'PwC: Malta, other taxes', url: 'https://taxsummaries.pwc.com/malta/individual/other-taxes' },
    {
      name: 'Deloitte Malta: Individual Tax Programme Rules 2026',
      url: 'https://www.deloitte.com/mt/en/services/tax/perspectives/tax-alerts/2026/individual-tax-programme-rules-2026.html',
      edition: '2026',
    },
    {
      name: 'PKF Malta: 2027 individual tax programme thresholds',
      url: 'https://pkfmalta.com/news/network-news/malta-s-2027-individual-tax-programme-new-thresholds-and-new-planning-priorities/',
    },
    {
      name: 'Legal 500: Malta Permanent Residence Programme 2026',
      url: 'https://www.legal500.com/intelligence/malta/immigration/malta-permanent-residence-programme-%28mprp%29-2026-requirements-costs-timeline',
    },
    {
      name: 'Legal 500: healthcare system in Malta',
      url: 'https://www.legal500.com/intelligence/malta/food-drugs-healthcare-life-sciences/healthcare-system-in-malta-a-detailed-overview',
    },
    { name: 'GOV.UK: Malta travel advice, safety and security', url: 'https://www.gov.uk/foreign-travel-advice/malta/safety-and-security' },
    { name: 'Live and Let\'s Fly: Delta New York–Malta and Sardinia', url: 'https://liveandletsfly.com/delta-air-lines-new-york-malta-sardinia-flights' },
    { name: 'Wikipedia: Sliema (population, airport bus)', url: 'https://en.wikipedia.org/wiki/Sliema' },
    { name: 'Wikipedia: Malta (climate, languages)', url: 'https://en.wikipedia.org/wiki/Malta' },
    { name: 'YourTaxBase: Charles Schwab for expats (Oct 2026)', url: 'https://yourtaxbase.com/blog/charles-schwab-for-expats' },
  ],
}

export default profile
