import type { ExpatProfile } from '../expatPicks'

const profile: ExpatProfile = {
  tagline: 'Garifuna beach village, tax-free QRP, a hospital half an hour away',
  summary:
    'Belize\'s Qualified Retired Persons programme exempts all foreign income and inheritances and accepts investment-account income of $2,000 a month, so the BBD tax case is as strong as Cayo\'s. Hopkins is a small Garifuna village on the Caribbean, and it is the best Belize beach option for care: the Southern Regional Hospital in Dangriga is about 30 minutes away. It is basic, small and exposed to hurricanes.',
  scores: { cost: 3, healthcare: 1, safety: 3, visa: 4, climate: 2, community: 2, tax: 5, estate: 5, lending: 3 },
  facts: {
    healthcare:
      'Only a small public clinic in the village; the public Southern Regional Hospital in Dangriga (general, maternity, intensive and surgical care) is about 20 miles, or 30 minutes, by road, private care is in Belize City about 2.5 hours away (secondary source), and serious cases fly on to Mérida, Guatemala City or Miami, where the US Embassy says medevac "can easily cost US$10,000 and up".',
    safety:
      'Belize is at US State Dept Level 2 (March 2026, secondary source), with Level 3 only for Southside Belize City, and is not scored in the Global Peace Index; the UK notes one of the world\'s highest murder rates per capita, mostly gang violence in Belize City, gives no warning for Hopkins, and flags flooded bridges and causeways in severe weather "particularly in Stann Creek and Toledo".',
    visa:
      'QRP: age 40+, at least $2,000/month of income from outside Belize, which explicitly includes an investment account, savings or an inheritance, deposited in a Belize institution, and at least 30 consecutive days a year in Belize; it is a renewable status, not permanent residency.',
    tax: 'QRP members are exempt from all taxes and duties on income from outside Belize, so US dividends and interest are untaxed; no wealth tax is believed to exist, but that is unverified (PwC does not cover Belize), as are the rules for residents outside the QRP.',
    estate:
      'The Belize Tourism Board lists QRP members as exempt from inheritance tax; there is no US estate treaty, and US estate tax applies above the $15M exemption (2026).',
    lending:
      'Interactive Brokers reportedly serves all non-sanctioned countries, so Belize residents should be accepted, but margin terms are unconfirmed; Schwab One International probably does not accept Belize (it is missing from the October 2026 accepted list).',
    climate:
      'Hot, humid tropical rainforest climate on the open Caribbean shore, with a long wet season; hurricane season runs June–November, and the village was founded in 1942 after a hurricane destroyed its predecessor up the coast.',
    community:
      'A village of about 1,600 (2010 census), 70% Garifuna, with a small foreign community among small resorts and no reliable headcount; English is Belize\'s official language, which makes daily life easy.',
    access:
      'Dangriga\'s airstrip, about 30 minutes away, has domestic flights to Belize City (BZE), which has year-round nonstops to Atlanta, Dallas, Houston, Los Angeles and Miami and seasonal routes from Charlotte, Chicago, Denver, Newark and others.',
  },
  drawbacks: [
    'A public regional hospital only; private care is 2.5 hours away and anything serious means a flight abroad',
    'Low, exposed coast in the hurricane belt',
    'A small village with few services, and Schwab International is likely unavailable',
  ],
  sources: [
    { name: 'Belize Tourism Board: Qualified Retired Persons programme', url: 'https://www.belizetourismboard.org/programs-events/retirement-program/' },
    { name: 'GOV.UK: Belize list of medical facilities', url: 'https://www.gov.uk/government/publications/belize-list-of-medical-facilities/belize-medical-facilities' },
    { name: 'Belize.com: Medical care in Belize', url: 'https://www.belize.com/medical-care-in-belize/' },
    { name: 'Rome2rio: Hopkins to Dangriga', url: 'https://www.rome2rio.com/s/Hopkins-Belize/Dangriga' },
    { name: 'Rio Times: Healthcare in Belize for expats 2026', url: 'https://www.riotimesonline.com/healthcare-belize-expats-2026/' },
    { name: 'GOV.UK: Belize travel advice, safety and security', url: 'https://www.gov.uk/foreign-travel-advice/belize/safety-and-security' },
    { name: 'Travel Advisory: Belize (US State Dept levels)', url: 'https://www.traveladvisory.io/advisory/belize' },
    { name: 'Wikipedia: Hopkins, Belize', url: 'https://en.wikipedia.org/wiki/Hopkins,_Belize' },
    { name: 'Wikipedia: Philip S. W. Goldson International Airport', url: 'https://en.wikipedia.org/wiki/Philip_S._W._Goldson_International_Airport' },
    { name: 'Your Tax Base: Charles Schwab for expats (country list, Oct 2026)', url: 'https://yourtaxbase.com/blog/charles-schwab-for-expats' },
  ],
}

export default profile
