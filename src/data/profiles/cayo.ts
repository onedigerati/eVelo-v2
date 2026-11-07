import type { ExpatProfile } from '../expatPicks'

const profile: ExpatProfile = {
  tagline: 'Low-cost English-speaking jungle district, tax-free QRP',
  summary:
    'Belize\'s Qualified Retired Persons programme exempts all foreign income and inheritances, and it explicitly accepts investment-account income of $2,000 a month, which makes it close to perfect for BBD on paper. Cayo, around San Ignacio near the Guatemalan border, is cheap and English-speaking, and Live and Invest Overseas ranks it 7th. Healthcare is the weak point: plan on international cover with evacuation.',
  scores: { cost: 4, healthcare: 1, safety: 3, visa: 4, climate: 2, community: 3, tax: 5, estate: 5, lending: 3 },
  facts: {
    healthcare:
      'San Ignacio has a community hospital, with the private Adventist La Loma Luz in Santa Elena and the Western Regional Hospital in Belmopan; serious cases go to Karl Heusner in Belize City, then by air to Mérida, Guatemala City, Cancún or Miami, and the US Embassy says medevac "can easily cost US$10,000 and up".',
    safety:
      'Belize is at US State Dept Level 2 (March 2026, secondary source), with Level 3 only for Southside Belize City, and is not scored in the Global Peace Index; the UK notes one of the world\'s highest murder rates per capita, mostly gang violence in Belize City, and theft from tourists in San Ignacio.',
    visa:
      'QRP: age 40+, at least $2,000/month of income from outside Belize, which explicitly includes an investment account, savings or an inheritance, deposited in a Belize institution, and at least 30 consecutive days a year in Belize; it is a renewable status, not permanent residency.',
    tax: 'QRP members are exempt from all taxes and duties on income from outside Belize, so US dividends and interest are untaxed; no wealth tax is believed to exist, but that is unverified (PwC does not cover Belize), as are the rules for residents outside the QRP.',
    estate:
      'The Belize Tourism Board lists QRP members as exempt from inheritance tax; there is no US estate treaty, and US estate tax applies above the $15M exemption (2026).',
    lending:
      'Interactive Brokers reportedly serves all non-sanctioned countries, so Belize residents should be accepted, but margin terms are unconfirmed; Schwab One International probably does not accept Belize (it is missing from the October 2026 accepted list).',
    climate:
      'Hot and humid: highs about 28°C in January and 34°C in May (Belmopan), about 1,930 mm of rain a year, and a wet season roughly June–October that can run into January.',
    community:
      'Expats cluster along the Western Highway around San Ignacio and Santa Elena (about 21,000 people together), a more rural scene than the cayes with no reliable headcount found; English is Belize\'s official language, which makes daily life easy.',
    access:
      'Belize City (BZE) is about 100 km east by the Western Highway, with nonstops to Miami, Dallas, Houston, Atlanta, Los Angeles and Charlotte (seasonal) on American, United, Delta, Southwest and Alaska, plus seasonal routes from Denver, Chicago, Newark and others.',
  },
  drawbacks: [
    'Weak healthcare: anything serious means Belize City or an expensive flight abroad',
    'Hot, humid and very wet for half the year',
    'QRP money must be deposited in Belize, and Schwab International is likely unavailable',
  ],
  sources: [
    { name: 'Belize Tourism Board: Qualified Retired Persons programme', url: 'https://www.belizetourismboard.org/programs-events/retirement-program/' },
    { name: 'Rio Times: Healthcare in Belize for expats 2026', url: 'https://www.riotimesonline.com/healthcare-belize-expats-2026/' },
    { name: 'GOV.UK: Belize travel advice, safety and security', url: 'https://www.gov.uk/foreign-travel-advice/belize/safety-and-security' },
    { name: 'Travel Advisory: Belize (US State Dept levels)', url: 'https://www.traveladvisory.io/advisory/belize' },
    { name: 'Wikipedia: San Ignacio, Belize', url: 'https://en.wikipedia.org/wiki/San_Ignacio,_Belize' },
    { name: 'Wikipedia: Belmopan (climate)', url: 'https://en.wikipedia.org/wiki/Belmopan' },
    { name: 'Wikipedia: Philip S. W. Goldson International Airport', url: 'https://en.wikipedia.org/wiki/Philip_S._W._Goldson_International_Airport' },
    { name: 'Your Tax Base: Charles Schwab for expats (country list, Oct 2026)', url: 'https://yourtaxbase.com/blog/charles-schwab-for-expats' },
  ],
}

export default profile
