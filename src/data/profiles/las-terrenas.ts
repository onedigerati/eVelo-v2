import type { ExpatProfile } from '../expatPicks'

const profile: ExpatProfile = {
  tagline: 'Cosmopolitan Caribbean beach town on the Samaná peninsula',
  summary:
    'Las Terrenas is a beach town where over a third of residents come from abroad, mostly French and Italian. The Dominican Republic has no wealth tax, and Law 171-07 exempts the income a rentista declares. Inheritance tax is only 3%. Against that, foreign financial income can be taxed after year three, serious care is 2–3 hours away, and Schwab International does not accept DR residents.',
  scores: { cost: 4, healthcare: 2, safety: 3, visa: 4, climate: 3, community: 3, tax: 3, estate: 4, lending: 3 },
  facts: {
    healthcare:
      'The public municipal hospital and two private clinics (Clínica Especializada Internacional, Centro Galeno Integral) offer 24-hour emergency care; complex cases go to Santo Domingo or Santiago, 2–3 hours by road or by helicopter, and local private cover reportedly costs $80–150/month.',
    safety:
      'The Dominican Republic fell to 89th of 163 in the 2026 Global Peace Index and is at US State Dept Level 2 for crime (secondary source); the UK calls the crime rate high, with bag-snatching, robbery by motorcycle thieves and card cloning, and hurricanes June–November hit the north and east hardest.',
    visa:
      'Rentista (Law 171-07): $2,000/month of stable foreign income, and investments in foreign banks or companies and interest from securities qualify; Pensionado needs $1,500/month plus $250 per dependant, and an investor route about $200k (secondary sources).',
    tax: 'No wealth tax; the system is territorial, but residents are taxed on foreign investments and financial gains after their third year at up to 25% (27% from FY2027), while Law 171-07 exempts the income declared by rentistas and pensionados; whether that covers dividends above the qualifying amount is unclear, so take local advice.',
    estate:
      'Inheritance tax is 3% on successors (gifts 27%); whether it reaches a resident\'s US assets is unverified, and there is no US estate treaty, so there would be no US credit for it on US-sited stocks.',
    lending:
      'Interactive Brokers reportedly accepts Dominican residents, though margin terms are unconfirmed; Schwab One International\'s application reportedly does not accept the Dominican Republic (October 2026), so IBKR is the only known route.',
    climate: 'Tropical: about 26–31°C all year, with brief afternoon showers in the October–December rainy season and hurricane risk June–November.',
    community:
      'Over a third of the town\'s 20,000–30,000 residents come from abroad, mostly French (French is the second language), Italian, German, Swiss and Canadian, so English is less common than in North American enclaves (secondary sources).',
    access:
      'Santo Domingo (SDQ) is about 2–2.5 hours by toll road, with nonstops to Miami, New York-JFK, Newark, Boston, Atlanta, Fort Lauderdale and Orlando on American, Delta, JetBlue, United and Arajet; nearby El Catey (20–30 minutes) serves only Canada and Europe.',
  },
  drawbacks: [
    'Serious hospital care is 2–3 hours away in Santo Domingo or Santiago',
    'Foreign financial income can be taxed after year three, depending on how far Law 171-07 reaches',
    'Schwab International unavailable, and hurricane season June–November',
  ],
  sources: [
    { name: 'PwC Worldwide Tax Summaries: Dominican Republic, taxes on personal income', url: 'https://taxsummaries.pwc.com/dominican-republic/individual/taxes-on-personal-income', edition: '2026' },
    { name: 'PwC Worldwide Tax Summaries: Dominican Republic, other taxes', url: 'https://taxsummaries.pwc.com/dominican-republic/individual/other-taxes', edition: '2026' },
    { name: 'Pellerano & Herrera: Pensionado or rentista under Law 171-07', url: 'https://phlaw.com/pensionado-o-rentista-bajo-la-ley-171-07/' },
    { name: 'PlayaMax: Healthcare in Las Terrenas', url: 'https://playamax.com/?p=6331' },
    { name: 'Expat.com: Las Terrenas expat guide', url: 'https://www.expat.com/en/guide/central-america/dominican-republic/las-terrenas/' },
    { name: 'Dominican Today: Dominican Republic falls 10 places in 2026 Global Peace Index', url: 'https://dominicantoday.com/?p=4951', edition: '2026' },
    { name: 'GOV.UK: Dominican Republic travel advice, safety and security', url: 'https://www.gov.uk/foreign-travel-advice/dominican-republic/safety-and-security' },
    { name: 'Travel Advisory: Dominican Republic (US State Dept levels)', url: 'https://www.traveladvisory.io/advisory/dominican-republic' },
    { name: 'Wikipedia: Las Américas International Airport', url: 'https://en.wikipedia.org/wiki/Las_Am%C3%A9ricas_International_Airport' },
    { name: 'Wikipedia: Samaná El Catey International Airport', url: 'https://en.wikipedia.org/wiki/Saman%C3%A1_El_Catey_International_Airport' },
    { name: 'Your Tax Base: Charles Schwab for expats (country list, Oct 2026)', url: 'https://yourtaxbase.com/blog/charles-schwab-for-expats' },
  ],
}

export default profile
