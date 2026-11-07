import type { ExpatProfile } from '../expatPicks'

const profile: ExpatProfile = {
  tagline: 'Caribbean peninsula village, tax-free QRP, no hospital',
  summary:
    'Belize\'s Qualified Retired Persons programme exempts all foreign income and inheritances and accepts investment-account income of $2,000 a month, so the BBD tax case is the same as Cayo\'s. Placencia ranks low because there is no hospital on the peninsula: a polyclinic of uncertain night staffing, a public hospital 1¼–1¾ hours away and private care 3½ hours by road. It is also a low, hurricane-exposed strip of sand.',
  scores: { cost: 3, healthcare: 1, safety: 3, visa: 4, climate: 2, community: 3, tax: 5, estate: 5, lending: 3 },
  facts: {
    healthcare:
      'No hospital on the peninsula: the public Placencia Polyclinic opened in May 2024 and was billed as 24-hour, but a parent found it unstaffed in the early hours that October; the nearest hospital is the public Southern Regional in Dangriga, about 1¼–1¾ hours by road, private care is in Belize City (3½ hours by road or a daytime flight), Tropic Air\'s 24-hour medical transfers do not list Placencia, and medevac "can easily cost US$10,000 and up".',
    safety:
      'Belize is at US State Dept Level 2 (March 2026, secondary source), with Level 3 only for Southside Belize City, and is not scored in the Global Peace Index; the UK notes one of the world\'s highest murder rates per capita, mostly gang violence in Belize City, names Placencia among places where tourists are vulnerable to theft, and flags flooded bridges in Stann Creek in severe weather.',
    visa:
      'QRP: age 40+, at least $2,000/month of income from outside Belize, which explicitly includes an investment account, savings or an inheritance, deposited in a Belize institution, and at least 30 consecutive days a year in Belize; it is a renewable status, not permanent residency.',
    tax: 'QRP members are exempt from all taxes and duties on income from outside Belize, so US dividends and interest are untaxed; no wealth tax is believed to exist, but that is unverified (PwC does not cover Belize), as are the rules for residents outside the QRP.',
    estate:
      'The Belize Tourism Board lists QRP members as exempt from inheritance tax; there is no US estate treaty, and US estate tax applies above the $15M exemption (2026).',
    lending:
      'Interactive Brokers reportedly serves all non-sanctioned countries, so Belize residents should be accepted, but margin terms are unconfirmed; Schwab One International probably does not accept Belize (it is missing from the October 2026 accepted list).',
    climate:
      'Tropical monsoon: highs 27°C in December–January to 32°C April–September, heavy rain June–October (290–350 mm a month) and a dry February–April; hurricane season runs June–November, and Hurricane Iris (Category 4, 2001) damaged nearly 95% of the village\'s buildings.',
    community:
      'Small: about 1,500 in the village and 3,500 on the peninsula (2010 census), with "a healthy number of expats" in Maya Beach and Seine Bight to the north but no headcount; English is Belize\'s official language.',
    access:
      'The Placencia airstrip has more than 20 daily Tropic Air and Maya Island Air flights to Belize City (BZE), which has year-round nonstops to Atlanta, Dallas, Houston, Los Angeles and Miami; by road BZE is about 3½ hours.',
  },
  drawbacks: [
    'No hospital on the peninsula: Dangriga is over an hour away and private care 3½ hours',
    'A low peninsula in the hurricane belt, as Iris showed in 2001',
    'Beach prices above inland Belize, and Schwab International is likely unavailable',
  ],
  sources: [
    { name: 'Belize Tourism Board: Qualified Retired Persons programme', url: 'https://www.belizetourismboard.org/programs-events/retirement-program/' },
    { name: 'Belize Tourism Board: Placencia Polyclinic opens', url: 'https://www.belizetourismboard.org/?p=39983', edition: '2024' },
    { name: 'Greater Belize Media: Is the Placencia Polyclinic truly open 24/7?', url: 'https://www.greaterbelize.com/is-the-placencia-polyclinic-truly-open-24-7/', edition: '2024' },
    { name: 'GOV.UK: Belize list of medical facilities', url: 'https://www.gov.uk/government/publications/belize-list-of-medical-facilities/belize-medical-facilities' },
    { name: 'Tropic Air: Medical transfer', url: 'https://www.tropicair.com/medical-transfer/' },
    { name: 'Rome2rio: Placencia to Dangriga', url: 'https://www.rome2rio.com/s/Placencia/Dangriga' },
    { name: 'Rio Times: Healthcare in Belize for expats 2026', url: 'https://www.riotimesonline.com/healthcare-belize-expats-2026/' },
    { name: 'GOV.UK: Belize travel advice, safety and security', url: 'https://www.gov.uk/foreign-travel-advice/belize/safety-and-security' },
    { name: 'Travel Advisory: Belize (US State Dept levels)', url: 'https://www.traveladvisory.io/advisory/belize' },
    { name: 'Wikipedia: Placencia', url: 'https://en.wikipedia.org/wiki/Placencia' },
    { name: 'Afar: Placencia Peninsula', url: 'https://www.afar.com/places/placencia-peninsula-stann-creek-district' },
    { name: 'Weather2Travel: Placencia climate', url: 'https://weather2travel.com/belize/placencia/climate' },
    { name: 'Moon: Getting to and around Placencia', url: 'https://www.moontravelguides.com/travel/planning/getting-to-and-around-belizes-placencia-village/' },
    { name: 'Wikipedia: Philip S. W. Goldson International Airport', url: 'https://en.wikipedia.org/wiki/Philip_S._W._Goldson_International_Airport' },
    { name: 'Your Tax Base: Charles Schwab for expats (country list, Oct 2026)', url: 'https://yourtaxbase.com/blog/charles-schwab-for-expats' },
  ],
}

export default profile
