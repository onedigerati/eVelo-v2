import type { ExpatProfile } from '../expatPicks'
import { S } from './_shared'

const profile: ExpatProfile = {
  tagline: 'Easy retiree visa and JCI hospitals, with crime and a 6% estate tax',
  summary:
    'Metro Manila has the Philippines\' best hospitals (five JCI-accredited), English in daily use, a large American community, low costs and nonstops to six US cities plus Guam, and the SRRV gives permanent, multiple-entry residence for a USD 30,000 deposit at 50+. An alien, resident or not, is taxed only on Philippine-source income, so US dividends and loan draws go untaxed locally. The catches for buy-borrow-die: a 6% estate tax on a resident alien\'s worldwide estate, US accounts included, and street crime and floods.',
  scores: { cost: 4, healthcare: 4, safety: 2, visa: 5, climate: 3, community: 4, tax: 5, estate: 3, lending: 3 },
  facts: {
    healthcare:
      'Five JCI-accredited hospitals in Metro Manila (Sept 2026): Makati Medical Center, St. Luke\'s in Quezon City and Bonifacio Global City, The Medical City (Pasig) and Asian Hospital (Muntinlupa); the country\'s only other JCI site is The Medical City Clark.',
    safety:
      'The Philippines scores 2.092 in the 2026 Global Peace Index, 9th of 10 in Southeast Asia; the US rates the country Level 2 and says violent crime, including robbery, kidnapping and homicide, is common, and the UK warns of armed hold-ups on jeepneys and buses in Manila and of taxi robberies.',
    visa: 'SRRV Classic from the Philippine Retirement Authority: from age 50, a USD 30,000 deposit in an accredited Philippine bank with no pension needed (USD 15,000 with a pension of USD 800/month single or USD 1,000 with family; ages 40–49 pay USD 50,000 or 25,000), a USD 1,500 application fee and USD 360 a year; it gives indefinite, multiple-entry residence and covers two dependants.',
    tax: 'No wealth tax; the Tax Code (Sec. 23) taxes an alien, resident or not, only on Philippine-source income, so US dividends, interest, gains and loan draws are untaxed locally; Philippine dividends pay 10% and local interest 20%, and a US–Philippines income tax treaty exists.',
    estate:
      'A flat 6% estate tax on the net estate (after a PHP 5m standard deduction and up to PHP 10m for the family home) reaches the worldwide estate of resident aliens, which an SRRV holder living here would likely be, so US brokerage accounts left to US-resident children are taxed (a non-resident alien is taxed only on Philippine assets); there is no US estate treaty to relieve it, and the $15M US exemption (2026) applies as anywhere.',
    lending:
      'IBKR reportedly accepts residents of almost every country outside sanctions lists, while Schwab One International reportedly does not accept Philippine residents (Oct 2026); margin terms by country of residence are unreported, and Fidelity and Vanguard open no accounts for residents abroad.',
    climate:
      'Tropical monsoon: hot and very humid all year (April highs about 34 °C / 93 °F), a dry season from late December to early April, heavy rain peaking July–September (about 2,240 mm a year), typhoons mostly June–September, and Manila is among the world\'s most disaster-exposed capitals, with deadly floods such as Ondoy in 2009.',
    community:
      'The US ambassador put the number of US citizens in the Philippines at about 750,000 in 2025 (many of them Filipino-Americans), and English is a language of business and schooling.',
    access:
      'Manila (MNL) has nonstops on Philippine Airlines to Los Angeles, San Francisco, Seattle, New York–JFK, Honolulu and Chicago (from Nov 2026), and on United to San Francisco and Guam; Delta adds Los Angeles in Mar 2027.',
  },
  drawbacks: [
    '6% estate tax on a resident alien\'s worldwide estate, US accounts included',
    'Street crime: armed robbery on public transport and in taxis',
    'Typhoons and street floods in the rainy season',
  ],
  sources: [
    {
      name: 'Philippine Retirement Authority: Expanded SRRV program',
      url: 'https://pra.gov.ph/Uploads/Files/Expanded%20SRRV%20Program.pdf',
      edition: '2025',
    },
    {
      name: 'Hans Goldstein: Philippines SRRV pension requirement (Oct 2026)',
      url: 'https://hansgoldstein.com/moving-abroad/philippines-srrv-pension-requirement/',
      edition: '2026',
    },
    { name: 'ChanRobles: National Internal Revenue Code, Sec. 23', url: 'https://www.chanrobles.com/legal6title3.htm' },
    { name: 'PwC: Philippines, taxes on personal income', url: 'https://taxsummaries.pwc.com/philippines/individual/taxes-on-personal-income', edition: '2026' },
    { name: 'PwC: Philippines, residence', url: 'https://taxsummaries.pwc.com/philippines/individual/residence', edition: '2026' },
    { name: 'PwC: Philippines tax summary (net wealth tax: none)', url: 'https://taxsummaries.pwc.com/philippines' },
    { name: 'Respicio & Co.: estate tax computation in the Philippines', url: 'https://www.respicio.ph/commentaries/estate-tax-computation-guidelines-in-the-philippines' },
    { name: 'IRS: estate and gift tax treaties', url: 'https://www.irs.gov/businesses/small-businesses-self-employed/estate-gift-tax-treaties-international' },
    { name: 'IRS: United States income tax treaties, A to Z', url: 'https://www.irs.gov/businesses/international-businesses/united-states-income-tax-treaties-a-to-z' },
    { name: 'ClinicFinder PH: JCI-accredited hospitals in the Philippines (Sept 2026)', url: 'https://www.clinicfinderph.com/blog/jci-accredited-hospitals-philippines', edition: '2026' },
    S.seaGpi,
    { name: 'TravelAdvisory.io: Philippines (US advisory, Sept 2026)', url: 'https://www.traveladvisory.io/advisory/philippines', edition: '2026' },
    { name: 'GOV.UK: Philippines travel advice, safety and security', url: 'https://www.gov.uk/foreign-travel-advice/philippines/safety-and-security' },
    { name: 'Wikipedia: Americans in the Philippines', url: 'https://en.wikipedia.org/wiki/Americans_in_the_Philippines' },
    { name: 'Wikipedia: Ninoy Aquino International Airport', url: 'https://en.wikipedia.org/wiki/Ninoy_Aquino_International_Airport' },
    { name: 'Wikipedia: Manila', url: 'https://en.wikipedia.org/wiki/Manila' },
    { name: 'YourTaxBase: best brokerage for US expats', url: 'https://yourtaxbase.com/blog/best-brokerage-for-us-expats' },
    { name: 'YourTaxBase: Charles Schwab for expats (country list, Oct 2026)', url: 'https://yourtaxbase.com/blog/charles-schwab-for-expats' },
  ],
}

export default profile
