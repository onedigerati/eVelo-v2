import type { ExpatProfile } from '../expatPicks'

const profile: ExpatProfile = {
  tagline: 'Bayside town by the Mexican border, tax-free QRP',
  summary:
    'Belize\'s Qualified Retired Persons programme exempts all foreign income and inheritances and accepts investment-account income of $2,000 a month, which makes the BBD tax case close to perfect. Corozal, a quiet bay town 9 miles from Mexico, adds the best hospital access in Belize outside Belize City and Cayo: private care in Chetumal is about 26 minutes away. Hurricanes and a 2-hour drive to US flights count against it.',
  scores: { cost: 4, healthcare: 2, safety: 3, visa: 4, climate: 2, community: 3, tax: 5, estate: 5, lending: 3 },
  facts: {
    healthcare:
      'Corozal Community Hospital (public; internal medicine, general surgery, paediatrics, obstetrics, orthopaedics) is in town, private care is at Northern Medical Specialty Plaza in Orange Walk, and many retirees cross to Chetumal, Mexico, about 15.7 miles (26 minutes), for a wider range of services; no JCI hospital was found, cross-border care needs a passport, and insurer cover in Mexico is unverified.',
    safety:
      'Belize is at US State Dept Level 2 (March 2026, secondary source), with Level 3 only for Southside Belize City, and is not scored in the Global Peace Index; the UK notes one of the world\'s highest murder rates per capita, mostly gang violence in Belize City, and does not mention Corozal or the Chetumal crossing.',
    visa:
      'QRP: age 40+, at least $2,000/month of income from outside Belize, which explicitly includes an investment account, savings or an inheritance, deposited in a Belize institution, and at least 30 consecutive days a year in Belize; it is a renewable status, not permanent residency.',
    tax: 'QRP members are exempt from all taxes and duties on income from outside Belize, so US dividends and interest are untaxed; no wealth tax is believed to exist, but that is unverified (PwC does not cover Belize), as are the rules for residents outside the QRP.',
    estate:
      'The Belize Tourism Board lists QRP members as exempt from inheritance tax; there is no US estate treaty, and US estate tax applies above the $15M exemption (2026).',
    lending:
      'Interactive Brokers reportedly serves all non-sanctioned countries, so Belize residents should be accepted, but margin terms are unconfirmed; Schwab One International probably does not accept Belize (it is missing from the October 2026 accepted list).',
    climate:
      'Tropical savanna: highs from about 28°C in January to 33°C in May, about 1,355 mm of rain a year (June wettest, February driest); in the hurricane belt, and Hurricane Janet (1955) destroyed about 90% of the town.',
    community:
      'A town of about 13,500 (2017 estimate), known as an expat and retiree town, partly for the care across the border, but no headcount was found; English is Belize\'s official language.',
    access:
      'Belize City (BZE), 84 miles south, about 2 hours by road (unverified), has year-round nonstops to Atlanta, Dallas, Houston, Los Angeles and Miami; Corozal\'s airstrip flies only to San Pedro, and Chetumal\'s airport has no US nonstops.',
  },
  drawbacks: [
    'Serious care means crossing into Mexico or a flight abroad',
    'Hurricane history: Janet levelled most of the town in 1955',
    'About 2 hours to US flights, and Schwab International is likely unavailable',
  ],
  sources: [
    { name: 'Belize Tourism Board: Qualified Retired Persons programme', url: 'https://www.belizetourismboard.org/programs-events/retirement-program/' },
    { name: 'GOV.UK: Belize list of medical facilities', url: 'https://www.gov.uk/government/publications/belize-list-of-medical-facilities/belize-medical-facilities' },
    { name: 'Belize.com: Medical care in Belize', url: 'https://www.belize.com/medical-care-in-belize/' },
    { name: 'Rio Times: Healthcare in Belize for expats 2026', url: 'https://www.riotimesonline.com/healthcare-belize-expats-2026/' },
    { name: 'Rome2rio: Corozal to Chetumal', url: 'https://www.rome2rio.com/s/Corozal-Town/Chetumal' },
    { name: 'GOV.UK: Belize travel advice, safety and security', url: 'https://www.gov.uk/foreign-travel-advice/belize/safety-and-security' },
    { name: 'Travel Advisory: Belize (US State Dept levels)', url: 'https://www.traveladvisory.io/advisory/belize' },
    { name: 'Wikipedia: Corozal Town (climate, Hurricane Janet)', url: 'https://en.wikipedia.org/wiki/Corozal_Town' },
    { name: 'Wikipedia: Corozal Airport', url: 'https://en.wikipedia.org/wiki/Corozal_Airport' },
    { name: 'Wikipedia: Chetumal International Airport', url: 'https://en.wikipedia.org/wiki/Chetumal_International_Airport' },
    { name: 'Your Tax Base: Charles Schwab for expats (country list, Oct 2026)', url: 'https://yourtaxbase.com/blog/charles-schwab-for-expats' },
  ],
}

export default profile
