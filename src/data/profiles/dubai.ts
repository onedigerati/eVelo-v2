import type { ExpatProfile } from '../expatPicks'

const profile: ExpatProfile = {
  tagline: 'No income, wealth or inheritance tax, in a desert heat and a tense region',
  summary:
    'Dubai has no personal income tax, no wealth tax and no inheritance tax, a five-year renewable retirement visa from age 55 on AED 1M of property or savings, strong private hospitals and nonstops to a dozen US cities, which on paper makes it a near-ideal buy-borrow-die base. What stands against it: summers above 40°C, costly private health insurance that rises steeply after 60, no path to permanent residence, and a US Level 3 "reconsider travel" advisory since March 2026 over the conflict with Iran.',
  scores: { cost: 2, healthcare: 4, safety: 3, visa: 4, climate: 2, community: 4, tax: 5, estate: 5, lending: 4 },
  facts: {
    healthcare:
      'Good private hospitals with Western-trained doctors, such as the JCI-accredited American Hospital Dubai (254 beds); health insurance is compulsory for Dubai residents, there are no retiree-specific plans, and premiums climb sharply after 60, from about AED 5,000/year for basic narrow-network cover to AED 25,000–30,000+ for broader plans, with loadings for pre-existing conditions (2024).',
    safety:
      'The US has rated the UAE Level 3, "reconsider travel", for terrorism and armed conflict since early March 2026, when the US urged citizens to leave during the US and Israeli strikes on Iran (summary updated October 2026 for possible Houthi attacks); street crime is very low, but local laws are strict, with arrest or exit bans for offences that would be minor at home.',
    visa: 'Retirement residence permit: 55+ with at least 15 years of prior work (the GDRFA page lists both), plus property worth AED 1M (about $272k), an AED 1M deposit in a UAE bank, or a fixed income of AED 240,000/year (about $65k); five years, renewable on the same terms, with no route to permanent residence or citizenship; an AED 2M property buyer can instead apply for a golden visa.',
    tax: 'No personal income tax, no wealth tax and no capital gains tax: dividends, interest and gains are untaxed locally; a US citizen still files and pays US tax on worldwide income, and there is no US–UAE income tax treaty.',
    estate:
      'No inheritance, estate or gift tax; since 2023 a non-Muslim foreigner\'s estate follows the civil personal status law (or home-country law, if chosen) rather than Sharia, and a will registered with the DIFC Wills Service Centre is the usual safeguard; there is no US–UAE estate treaty, so the $15M US exemption (2026) is the only relief.',
    lending:
      'IBKR reportedly serves UAE residents (many fund accounts through a dirham or US-dollar account), and Schwab One International\'s online form reportedly accepted the UAE in Oct 2026; margin by country of residence is unreported, and Fidelity and Vanguard open no accounts for residents abroad.',
    climate:
      'Hot desert: August highs about 40°C (104°F) with very humid nights near 30°C, so from about May to September life moves indoors; January highs about 24°C, and under 100 mm of rain a year.',
    community:
      'About 92% of Dubai\'s nearly 4 million people are expatriates, with over 100,000 Britons the largest Western group and English the everyday working language; the population is young and working, and retirees are few.',
    access:
      'Emirates flies nonstop to 12 US airports, among them New York JFK, Newark, Boston, Washington, Chicago, Dallas, Houston, Miami, Orlando, Los Angeles, San Francisco and Seattle; flights were suspended during the 2026 conflict and restored by May 2026, and schedules can still change at short notice.',
  },
  drawbacks: [
    'Summers above 40°C for about five months',
    'US Level 3 advisory since March 2026 over the regional conflict with Iran',
    'Private health insurance that rises steeply with age, and no permanent residence',
  ],
  sources: [
    { name: 'PwC: United Arab Emirates, other taxes', url: 'https://taxsummaries.pwc.com/united-arab-emirates/individual/other-taxes', edition: '2026' },
    { name: 'GDRFA Dubai: residence permit for a retired foreigner', url: 'https://www.gdrfad.gov.ae/en/services/8ea80db0-f43e-11eb-0320-0050569629e8' },
    { name: 'UAE government portal: golden visa', url: 'https://u.ae/en/information-and-services/visa-and-emirates-id/residence-visas/golden-visa' },
    {
      name: 'Withers: estate planning for non-Muslims and residents in the UAE',
      url: 'https://www.withersworldwide.com/en-gb/insight/read/estate-planning-for-non-muslims-and-residents-in-the-uae',
      edition: '2024',
    },
    {
      name: 'The National: are high insurance costs pricing retirees out of the UAE?',
      url: 'https://thenationalnews.com/business/money/2024/07/11/are-high-insurance-costs-pricing-retirees-out-of-living-in-the-uae-long-term',
      edition: '2024',
    },
    {
      name: 'PR Newswire: American Hospital Dubai earns 7th JCI accreditation',
      url: 'https://prnewswire.co.uk/news-releases/american-hospital-dubai-extends-its-pioneering-track-record-for-international-accreditations-and-685796841.html',
      edition: '2018',
    },
    {
      name: 'NewKerala: US updates UAE travel advisory citing heightened threat',
      url: 'https://www.newkerala.com/news/a/us-updates-uae-travel-advisory-citing-heightened-threat-238.htm',
      edition: '2026',
    },
    {
      name: 'Jordan News: Washington raises travel advisory to Level 3 for Jordan, Oman, Saudi Arabia and the UAE',
      url: 'https://www.jordannews.jo/Section-111/All/Washington-Raises-Travel-Advisory-to-Level-3-for-Jordan-Oman-Saudi-Arabia-and-the-UAE-49360',
      edition: '2026',
    },
    {
      name: 'The National: what an Interactive Brokers UAE account means for local investors',
      url: 'https://www.thenationalnews.com/business/money/2024/10/03/what-will-interactive-brokers-uae-bank-account-mean-for-local-investors',
      edition: '2024',
    },
    { name: 'IRS: United States income tax treaties A to Z', url: 'https://www.irs.gov/businesses/international-businesses/united-states-income-tax-treaties-a-to-z' },
    { name: 'IRS: estate and gift tax treaties', url: 'https://www.irs.gov/businesses/small-businesses-self-employed/estate-gift-tax-treaties-international' },
    { name: 'YourTaxBase: Charles Schwab for expats (country list, Oct 2026)', url: 'https://yourtaxbase.com/blog/charles-schwab-for-expats' },
    {
      name: 'Boltflight: Emirates restores flights to Los Angeles, Miami, Orlando and Houston',
      url: 'https://boltflight.com/emirates-restores-flights-to-los-angeles-miami-orlando-houston-as-us-network-returns-to-full-strength/',
      edition: '2026',
    },
    { name: 'Wikipedia: Dubai (climate, demographics)', url: 'https://en.wikipedia.org/wiki/Dubai' },
  ],
}

export default profile
