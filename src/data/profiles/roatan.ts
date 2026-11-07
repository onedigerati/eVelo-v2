import type { ExpatProfile } from '../expatPicks'

const profile: ExpatProfile = {
  tagline: 'Bay Islands dive island, territorial tax, thin hospital care',
  summary:
    'On tax, Honduras is about as good as BBD gets: only Honduran-source income is taxed, there is no wealth or inheritance tax, and rentista residence accepts $2,500 a month of investment income. Roatán adds reefs, a long-settled English-speaking community and four US nonstops. Against that, the island\'s only public hospital burned in April 2024, serious cases fly out, and a worldwide-income bill that failed in 2025 could return.',
  scores: { cost: 4, healthcare: 1, safety: 3, visa: 4, climate: 2, community: 3, tax: 5, estate: 4, lending: 3 },
  facts: {
    healthcare:
      'The island\'s only public hospital burned down on 19 April 2024 (rebuilding was expected to take about 18 months), leaving private hospitals and clinics; Canada calls Bay Islands emergency facilities "very limited" and says major procedures may need evacuation, so serious cases fly to San Pedro Sula, Tegucigalpa or the US, and international cover with medevac is a must.',
    safety:
      'Honduras is reportedly at US State Dept Level 3, "reconsider travel" (August 2026, secondary source), with Level 4 only for Gracias a Dios; Canada says "the Bay Islands are generally safe" but reports night-time beach assaults and rental burglaries and advises avoiding Coxen Hole, Los Fuertes and Suampo after dark, and the UK flags petty theft and ATM fraud on Roatán.',
    visa:
      'Rentista residence on at least $2,500/month of stable income from abroad or in Honduras, which portfolio income should meet, or pensionado on a $1,500/month foreign pension (Ley de Migración y Extranjería, art. 21; secondary source); a Honduran bank account and yearly renewal are reported but unverified.',
    tax: 'No wealth tax; Honduras taxes only Honduran-source income (PwC, reviewed August 2026), so US dividends and interest are outside its tax; a "Ley de Justicia Tributaria" to tax worldwide income collapsed in May 2025 without passing, but could return.',
    estate:
      'No inheritance, estate or gift tax is listed by PwC, and a secondary source confirms none, though no Honduran statute was found; there is no US estate treaty, and US estate tax applies above the $15M exemption (2026).',
    lending:
      'Interactive Brokers reportedly lists Honduras among admitted countries, with margin subject to product rules (secondary source); whether Schwab One International accepts Honduras is unknown, and Fidelity and Vanguard open no new accounts for residents abroad.',
    climate:
      'Hot and humid: highs about 28°C in winter to 32°C in August–September, a dry spring (about 76 mm in April) and a very wet October–December (about 400–450 mm a month); hurricane season runs May–November, and Hurricane Mitch (1998) paralysed the island.',
    community:
      'A long-settled community of American, Canadian, British and other settlers, concentrated in West End, West Bay and French Harbour, on an island of about 110,000 (2020); no expat headcount was found.',
    access:
      'Roatán airport (RTB) has nonstops to Miami and Dallas (American), Atlanta (Delta) and Houston (United), plus seasonal Minneapolis (Sun Country) and winter flights to Canada.',
  },
  drawbacks: [
    'The island\'s public hospital burned in 2024, and serious illness means an evacuation flight',
    'A worldwide-income tax bill keeps returning to Congress',
    'Very wet late-year months, hurricane risk, and a Level 3 US advisory for the country',
  ],
  sources: [
    { name: 'PwC Worldwide Tax Summaries: Honduras, taxes on personal income', url: 'https://taxsummaries.pwc.com/honduras/individual/taxes-on-personal-income', edition: '2026' },
    { name: 'PwC Worldwide Tax Summaries: Honduras, other taxes', url: 'https://taxsummaries.pwc.com/honduras/individual/other-taxes', edition: '2026' },
    { name: 'TaxAtlas: Honduras wealth tax', url: 'https://taxatlas.io/country/honduras/wealth-tax' },
    { name: 'Consortium Legal: Residencia en Honduras', url: 'https://consortiumlegal.com/2021/11/15/residencia-en-honduras/' },
    {
      name: 'El Heraldo: Ley de Justicia Tributaria vote collapses (May 2025)',
      url: 'https://www.elheraldo.hn/honduras/fracasa-intentona-luis-redondo-aprobar-matacaballo-ley-justicia-tributaria-OJ25683195',
    },
    {
      name: 'Direct Relief: Fire destroyed an island hospital (Roatán, 2024)',
      url: 'https://www.directrelief.org/2024/10/fire-destroyed-an-island-hospital-months-later-a-honduran-free-clinic-is-still-bridging-the-gap/amp/',
    },
    { name: 'Government of Canada: Honduras travel advice', url: 'https://travel.gc.ca/destinations/honduras' },
    { name: 'GOV.UK: Honduras travel advice, safety and security', url: 'https://www.gov.uk/foreign-travel-advice/honduras/safety-and-security' },
    { name: 'Travel Advisory: Honduras (US State Dept levels)', url: 'https://www.traveladvisory.io/advisory/honduras' },
    { name: 'Weather2Travel: Roatán climate', url: 'https://www.weather2travel.com/honduras/roatan/climate' },
    { name: 'Wikipedia: Roatán', url: 'https://en.wikipedia.org/wiki/Roat%C3%A1n' },
    { name: 'Wikipedia: Juan Manuel Gálvez International Airport', url: 'https://en.wikipedia.org/wiki/Juan_Manuel_G%C3%A1lvez_International_Airport' },
    { name: 'Finantres: Interactive Brokers in Honduras', url: 'https://finantres.com/interactive-brokers-honduras/?hub_page=2', edition: '2026' },
  ],
}

export default profile
