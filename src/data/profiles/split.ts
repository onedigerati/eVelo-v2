import type { ExpatProfile } from '../expatPicks'
import { S } from './_shared'

const profile: ExpatProfile = {
  tagline: 'Safe Adriatic city with light taxes, but no retiree residence',
  summary:
    'Croatia\'s taxes suit buy-borrow-die well: no wealth tax, 12% on dividends and interest, and children inherit free with foreign assets outside the tax. Split adds a Roman old town, a university hospital and a summer United nonstop, but it ranks low because Croatia has no residence route for a retiree: permits run up to a year, with a wait between "other purposes" permits.',
  scores: { cost: 3, healthcare: 3, safety: 4, visa: 1, climate: 4, community: 2, tax: 4, estate: 5, lending: 3 },
  facts: {
    healthcare:
      'KBC Split, the University Hospital of Split (Firule and Križine sites), is the region\'s public referral hospital; residence applicants need health insurance and then register with the public HZZO (the contribution for a non-EU retiree is unverified), and outside private clinics Croatian is often needed.',
    safety:
      'Croatia is 23rd in the 2026 Global Peace Index; UK travel advice says crime levels are low and violent crime is rare, with pickpockets in tourist areas and wildfires common in hot, dry summers.',
    visa: 'No retiree or property route: the Interior Ministry\'s grounds for temporary stay are family, study, work, digital nomads and "other purposes", and an "other purposes" or nomad stay can be reapplied for only 6 months after the last one ends; the nomad permit needs remote work, so a portfolio-only retiree has no stable path (one secondary source says owners aged 60+ renew more easily, which the ministry list does not show).',
    tax: 'No wealth tax; residents are taxed on worldwide income, with dividends, interest and gains at a 12% final rate (gains on assets held over 2 years appear exempt, not confirmed); there is no retiree regime, and no US–Croatia income tax treaty is in force.',
    estate:
      'Croatia\'s 4% inheritance tax exempts the spouse and descendants, and the Tax Authority does not tax an inheritance located abroad, so a US portfolio passes to US-resident children with no Croatian tax; there is no US estate treaty.',
    lending:
      'IBKR is reportedly the only option: Schwab International\'s online form reportedly does not accept Croatia residents; EU PRIIPs rules reportedly block new buys of US-listed ETFs, not holding them.',
    climate: 'Mediterranean: July–August highs about 31°C, January highs about 11°C with lows near 6°C, about 2,700 hours of sun and 800 mm of rain a year, and the cold bura wind on some winter days.',
    community:
      'A city of about 160,000 (2021) with a small English-speaking resident scene; English is common on the coast, but Split is crowded with tourists and cruise passengers in summer and much quieter in winter.',
    access: 'Split airport (Kaštela, about 20 km; 3.9M passengers in 2025) has a summer United nonstop to Newark from 2026; the rest of the year, connect via Zagreb or a European hub.',
  },
  drawbacks: [
    'No residence route for a retiree living on a portfolio',
    'Peak-season crowds, and summer short-term rentals squeeze year-round leases',
    'A small English-speaking community, with healthcare and paperwork mostly in Croatian',
  ],
  sources: [
    {
      name: 'Croatian Ministry of Interior: temporary stay of third-country nationals',
      url: 'https://mup.gov.hr/aliens-281621/stay-and-work/temporary-stay-of-third-country-nationals/281661',
    },
    {
      name: 'Croatian Ministry of Interior: temporary stay of digital nomads',
      url: 'https://mup.gov.hr/aliens-281621/stay-and-work/temporary-stay-of-digital-nomads/286833',
    },
    { name: 'TaxesForExpats: retire in Croatia', url: 'https://www.taxesforexpats.com/country-guides/hr/retire-in-croatia.html' },
    { name: 'PwC: Croatia, income determination', url: 'https://taxsummaries.pwc.com/croatia/individual/income-determination' },
    { name: 'PwC: Croatia, other taxes', url: 'https://taxsummaries.pwc.com/croatia/individual/other-taxes' },
    {
      name: 'Porezna uprava: inheritance and gifts tax',
      url: 'https://porezna-uprava.gov.hr/en/inheritanc-e-and-gifts-tax-information-on-the-general-rules-rates-and-taxpayer/7315',
    },
    { name: 'KBC Split: locations', url: 'https://www.kbsplit.hr/en/about-us/locations' },
    { name: 'GOV.UK: Croatia travel advice, safety and security', url: 'https://www.gov.uk/foreign-travel-advice/croatia/safety-and-security' },
    { name: 'Wikipedia: Split, Croatia (climate, airport)', url: 'https://en.wikipedia.org/wiki/Split,_Croatia' },
    { name: 'YourTaxBase: Charles Schwab for expats', url: 'https://yourtaxbase.com/blog/charles-schwab-for-expats', edition: '2026' },
    S.unitedSummer,
    S.gpiTop50,
  ],
}

export default profile
