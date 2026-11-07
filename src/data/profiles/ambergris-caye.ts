import type { ExpatProfile } from '../expatPicks'

const profile: ExpatProfile = {
  tagline: 'Reef island town, tax-free QRP, no hospital',
  summary:
    'Belize\'s Qualified Retired Persons programme exempts all foreign income and inheritances and accepts investment-account income of $2,000 a month, so the BBD tax case is the same as Cayo\'s. Ambergris Caye ranks near the foot of the list because there is no hospital on the island: San Pedro has a polyclinic and private doctors, and anything serious means a flight or boat to Belize City and often onward abroad. It is also the costliest of the Belize picks.',
  scores: { cost: 2, healthcare: 1, safety: 3, visa: 4, climate: 3, community: 3, tax: 5, estate: 5, lending: 3 },
  facts: {
    healthcare:
      'No hospital on the island: San Pedro has the San Pedro Polyclinic II (24-hour general care, lab, radiology), the San Juan Health Center and private doctors, plus two dive decompression chambers; Tropic Air runs 24-hour medical transfers for stable patients to Belize City, serious cases go on to Mérida, Cancún, Guatemala City or Miami, and the US Embassy says medevac "can easily cost US$10,000 and up".',
    safety:
      'Belize is at US State Dept Level 2 (March 2026, secondary source), with Level 3 only for Southside Belize City, and is not scored in the Global Peace Index; the UK notes one of the world\'s highest murder rates per capita, mostly gang violence in Belize City, and names San Pedro among places where tourists are vulnerable to theft.',
    visa:
      'QRP: age 40+, at least $2,000/month of income from outside Belize, which explicitly includes an investment account, savings or an inheritance, deposited in a Belize institution, and at least 30 consecutive days a year in Belize; it is a renewable status, not permanent residency.',
    tax: 'QRP members are exempt from all taxes and duties on income from outside Belize, so US dividends and interest are untaxed; no wealth tax is believed to exist, but that is unverified (PwC does not cover Belize), as are the rules for residents outside the QRP.',
    estate:
      'The Belize Tourism Board lists QRP members as exempt from inheritance tax; there is no US estate treaty, and US estate tax applies above the $15M exemption (2026).',
    lending:
      'Interactive Brokers reportedly serves all non-sanctioned countries, so Belize residents should be accepted, but margin terms are unconfirmed; Schwab One International probably does not accept Belize (it is missing from the October 2026 accepted list).',
    climate:
      'Tropical and breezy: highs about 27°C in December to 31°C April–September, a dry spring (about 37 mm in March) and a wet autumn (about 245 mm in October); hurricane season runs June–November, and Hurricane Keith (2000) damaged the roofs of about 90% of San Pedro\'s houses.',
    community:
      'San Pedro, the island\'s only town, has about 20,000 people (2024 estimate), most of them bilingual in Spanish and English, and a tourist and diving economy with resident foreigners, though no expat headcount was found.',
    access:
      'Tropic Air and Maya Island Air fly from the San Pedro airstrip to Belize City (BZE), and fast ferries run there too; BZE has year-round nonstops to Atlanta, Dallas, Houston, Los Angeles and Miami and seasonal routes from Charlotte, Chicago, Denver, Newark and others.',
  },
  drawbacks: [
    'No hospital on the island: anything beyond the polyclinic means a flight or boat out',
    'The highest living costs of the Belize picks, with island prices for food and rent',
    'Hurricane exposure on a low island, and Schwab International is likely unavailable',
  ],
  sources: [
    { name: 'Belize Tourism Board: Qualified Retired Persons programme', url: 'https://www.belizetourismboard.org/programs-events/retirement-program/' },
    { name: 'Rio Times: Healthcare in Belize for expats 2026', url: 'https://www.riotimesonline.com/healthcare-belize-expats-2026/' },
    { name: 'GOV.UK: Belize list of medical facilities', url: 'https://www.gov.uk/government/publications/belize-list-of-medical-facilities/belize-medical-facilities' },
    { name: 'Tropic Air: Medical transfer', url: 'https://www.tropicair.com/medical-transfer/' },
    { name: 'GOV.UK: Belize travel advice, safety and security', url: 'https://www.gov.uk/foreign-travel-advice/belize/safety-and-security' },
    { name: 'Travel Advisory: Belize (US State Dept levels)', url: 'https://www.traveladvisory.io/advisory/belize' },
    { name: 'Wikipedia: San Pedro Town', url: 'https://en.wikipedia.org/wiki/San_Pedro_Town' },
    { name: 'Wikipedia: Ambergris Caye', url: 'https://en.wikipedia.org/wiki/Ambergris_Caye' },
    { name: 'Weather2Travel: San Pedro, Ambergris Caye climate', url: 'https://www.weather2travel.com/belize/san-pedro-ambergris-caye/climate' },
    { name: 'Wikipedia: Hurricane Keith', url: 'https://en.wikipedia.org/wiki/Hurricane_Keith' },
    { name: 'Wikipedia: Philip S. W. Goldson International Airport', url: 'https://en.wikipedia.org/wiki/Philip_S._W._Goldson_International_Airport' },
    { name: 'Your Tax Base: Charles Schwab for expats (country list, Oct 2026)', url: 'https://yourtaxbase.com/blog/charles-schwab-for-expats' },
  ],
}

export default profile
