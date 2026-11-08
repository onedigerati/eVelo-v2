import type { ExpatProfile } from '../expatPicks'
import { S } from './_shared'

const profile: ExpatProfile = {
  tagline: 'Easy permanent visa and English everywhere, with an estate-tax catch',
  summary:
    'Cebu offers very low costs, English in daily use, islands within reach and the Philippines\' SRRV, a permanent, multiple-entry retiree visa for a USD 30,000 deposit at 50+; a resident alien is taxed only on Philippine-source income, so US dividends and loan draws go untaxed locally. The catches for buy-borrow-die: a 6% estate tax on a resident alien\'s worldwide estate, US accounts included, no confirmed JCI hospital in Cebu, typhoons, and no US nonstops.',
  scores: { cost: 5, healthcare: 3, safety: 3, visa: 5, climate: 3, community: 3, tax: 5, estate: 3, lending: 3 },
  facts: {
    healthcare:
      'Chong Hua (Cebu City and Mandaue) and Cebu Doctors\' University Hospital lead the private sector; Chong Hua was JCI-accredited from 2009 but was not in JCI\'s directory in Sept 2026, and the country\'s six JCI sites are all in Metro Manila and Clark, so complex care may mean a flight to Manila.',
    safety:
      'The Philippines scores 2.092 in the 2026 Global Peace Index, 9th of 10 in Southeast Asia; the US rates the country Level 2 (Sept 2026), and its Level 3 and 4 areas (Mindanao, the Sulu Archipelago and other listed provinces) do not include Cebu (secondary source).',
    visa: 'SRRV Classic from the Philippine Retirement Authority: from age 50, a USD 30,000 deposit in an accredited Philippine bank with no pension needed (USD 15,000 with a pension of USD 800/month single or USD 1,000 with family; ages 40–49 pay USD 50,000 or 25,000), a USD 1,500 application fee and USD 360 a year; it gives indefinite, multiple-entry residence and covers two dependants.',
    tax: 'No wealth tax; the Tax Code (Sec. 23) taxes an alien, resident or not, only on Philippine-source income, so US dividends, interest, gains and loan draws are untaxed locally; Philippine dividends pay 10% and local interest 20%, and a US–Philippines income tax treaty exists.',
    estate:
      'A flat 6% estate tax on the net estate (after a PHP 5m standard deduction and up to PHP 10m for the family home) reaches the worldwide estate of resident aliens, which an SRRV holder living here would likely be, so US brokerage accounts left to US-resident children are taxed (a non-resident alien is taxed only on Philippine assets); there is no US estate treaty to relieve it, and the $15M US exemption (2026) applies as anywhere.',
    lending:
      'IBKR reportedly accepts residents of almost every country outside sanctions lists, while Schwab One International reportedly does not accept Philippine residents (Oct 2026); margin terms by country of residence are unreported, and Fidelity and Vanguard open no accounts for residents abroad.',
    climate:
      'Tropical monsoon: about 27–29 °C all year, about 1,700 mm of rain with only a short March–April dry season, and typhoon exposure; Typhoon Kalmaegi (Tino) killed 139 people in Cebu province in Nov 2025 (188 nationwide by 7 Nov), most of them in floods.',
    community:
      'English is a main language of schooling and business, and Metro Cebu (about 3.2 million people) is a major outsourcing hub; no headcount of the foreign retiree community was found.',
    access:
      'Mactan–Cebu (CEB) has no US mainland nonstops: United flies to Tokyo Narita and Philippine Airlines to Guam (seasonal), with direct flights to Seoul, Singapore, Hong Kong and Taipei for one-stop trips.',
  },
  drawbacks: [
    '6% estate tax on a resident alien\'s worldwide estate, US accounts included',
    'No confirmed JCI hospital: complex care may mean Manila',
    'Typhoons and floods, and no US nonstops',
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
    { name: 'PwC: Philippines, income determination', url: 'https://taxsummaries.pwc.com/philippines/individual/income-determination', edition: '2026' },
    { name: 'PwC: Philippines, taxes on personal income', url: 'https://taxsummaries.pwc.com/philippines/individual/taxes-on-personal-income', edition: '2026' },
    { name: 'PwC: Philippines tax summary (net wealth tax: none)', url: 'https://taxsummaries.pwc.com/philippines' },
    { name: 'Respicio & Co.: estate tax computation in the Philippines', url: 'https://www.respicio.ph/commentaries/estate-tax-computation-guidelines-in-the-philippines' },
    { name: 'IRS: estate and gift tax treaties', url: 'https://www.irs.gov/businesses/small-businesses-self-employed/estate-gift-tax-treaties-international' },
    { name: 'IRS: United States income tax treaties, A to Z', url: 'https://www.irs.gov/businesses/international-businesses/united-states-income-tax-treaties-a-to-z' },
    { name: 'ClinicFinder PH: JCI-accredited hospitals in the Philippines (Sept 2026)', url: 'https://www.clinicfinderph.com/blog/jci-accredited-hospitals-philippines', edition: '2026' },
    { name: 'Wikipedia: Chong Hua Hospital', url: 'https://en.wikipedia.org/wiki/Chong_Hua_Hospital' },
    S.seaGpi,
    { name: 'TravelAdvisory.io: Philippines (US advisory, Sept 2026)', url: 'https://www.traveladvisory.io/advisory/philippines', edition: '2026' },
    { name: 'PTV News: reported deaths from Tino onslaught climb to 188', url: 'https://ptvnews.ph/reported-deaths-from-tino-onslaught-climb-to-188/', edition: '2025' },
    { name: 'Wikipedia: Cebu City', url: 'https://en.wikipedia.org/wiki/Cebu_City' },
    { name: 'Wikipedia: Mactan–Cebu International Airport', url: 'https://en.wikipedia.org/wiki/Mactan%E2%80%93Cebu_International_Airport' },
    { name: 'YourTaxBase: best brokerage for US expats', url: 'https://yourtaxbase.com/blog/best-brokerage-for-us-expats' },
    { name: 'YourTaxBase: Charles Schwab for expats (country list, Oct 2026)', url: 'https://yourtaxbase.com/blog/charles-schwab-for-expats' },
  ],
}

export default profile
