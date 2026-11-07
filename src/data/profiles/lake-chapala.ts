import type { ExpatProfile } from '../expatPicks'
import { S } from './_shared'

const profile: ExpatProfile = {
  tagline: 'Lakeside villages, Mexico\'s largest US-retiree enclave',
  summary:
    'Ajijic and Chapala form Mexico\'s biggest classic US and Canadian retiree enclave, with a spring-like climate and Guadalajara\'s hospitals and wide US nonstop service close by. Residency on savings is easy and there is no estate tax, but Mexico taxes residents\' dividends at up to 35% plus a separate 10%, so a low-yield portfolio matters.',
  scores: { cost: 4, healthcare: 3, safety: 3, visa: 5, climate: 5, community: 5, tax: 2, estate: 5, lending: 5 },
  facts: {
    healthcare:
      'Local clinics with short-stay beds (Ajijic Hospital, with about 20 specialists visiting from Guadalajara; Maskaras Clinic, open 24/7; Lakeside Medical Group); serious care is in Guadalajara, about 55 km north, where Centro Médico Puerta de Hierro is in the Mayo Clinic Care Network (its JCI status is unverified); Medicare is not accepted, and IMSS voluntary cover is about MXN 21,500/yr at 70–79 (2026).',
    safety:
      'Mexico is 137th of 163 in the 2026 Global Peace Index; Jalisco is reportedly US Level 3, "reconsider travel", but with no restrictions on US staff for the Guadalajara area, Chapala and Ajijic (secondary source), and the UK advises against all but essential travel only to the areas south and south-west of the lake (Oct 2026).',
    visa: 'Temporary residency on economic solvency accepts savings or investment balances: the San Diego consulate\'s 2026 sheet asks for about $68,200 average monthly balance over 12 months or $4,049/month of income for 6 months, and other consulates ask more (about $74,700 or $4,430/month); permanent residency for retirees is about $299,000 or $7,430/month (2026), and a brokerage account counts as investments.',
    tax: 'No wealth tax; tax residents pay up to 35% (2026) on worldwide income, with foreign dividends fully taxable plus a separate 10% tax on the net dividend that cannot be credited, and foreign interest fully taxable, FX gains on principal included; margin-loan proceeds are not income, so a low-yield, growth-tilted portfolio limits the drag (get local advice).',
    estate:
      'No inheritance or estate tax: inheritances received by Mexican residents are exempt from income tax, and US-resident heirs receiving US assets should fall outside Mexican tax (an inference); there is no US estate treaty, so only US estate tax applies, above the $15M exemption (2026).',
    lending:
      'IBKR reportedly accepts Mexico residents (IBKR Pro), and Schwab One International\'s online form reportedly accepted Mexico in Oct 2026; margin by country of residence is unreported, and Fidelity and Vanguard open no accounts for residents abroad.',
    climate: 'Spring-like all year: the lake basin averages about 19 °C, May highs reach 27–32 °C, and the rains fall June–October, mostly at night.',
    community:
      'Foreigners are said to be over half of Ajijic\'s winter population (11,439 residents in 2020), and Chapala is one of Jalisco\'s three main areas for new US temporary residents; clubs, services and daily life work in English.',
    access:
      'Guadalajara airport (GDL), between the city and the lake, has wide US nonstop service: American (Dallas), Delta (Atlanta), United (Houston), Alaska (Los Angeles), Aeroméxico, and Volaris to about 28 US cities.',
  },
  drawbacks: [
    'Mexico taxes residents\' dividends at up to 35% plus a 10% levy that cannot be credited',
    'Hospital care beyond the local clinics means a drive to Guadalajara',
    'Jalisco has cartel violence and a US Level 3 advisory, with a reported carve-out for the lake',
  ],
  sources: [
    { name: 'Access Lake Chapala: health care information', url: 'https://www.accesslakechapala.com/guide/health-care/information/' },
    { name: 'Wikipedia: Ajijic', url: 'https://en.wikipedia.org/wiki/Ajijic' },
    {
      name: 'Guadalajara Reporter: Centro Médico Puerta de Hierro joins Mayo Clinic Care Network',
      url: 'https://theguadalajarareporter.net/index.php/news/news/guadalajara/53148-centro-medico-puerta-de-hierro-joins-mayo-clinic-care-network',
    },
    { ...S.mxAdvisory, name: 'Jetpac: Is it safe to travel to Mexico (Jalisco Level 3, Chapala carve-out, 2026)' },
    { name: 'GOV.UK: Mexico travel advice', url: 'https://www.gov.uk/foreign-travel-advice/mexico', edition: '2026' },
    { name: 'Wikipedia: Guadalajara International Airport', url: 'https://en.wikipedia.org/wiki/Guadalajara_International_Airport' },
    { name: 'Mexico News Daily: US citizens moving to Mexico in record numbers', url: 'https://mexiconewsdaily.com/news/us-citizens-moving-to-mx-record-numbers/' },
    { name: 'PwC: Mexico, taxes on personal income', url: 'https://taxsummaries.pwc.com/mexico/individual/taxes-on-personal-income' },
    { name: 'PwC: Mexico, other taxes', url: 'https://taxsummaries.pwc.com/mexico/individual/other-taxes' },
    {
      name: 'Consulate of Mexico in San Diego: temporary resident visa, economic solvency',
      url: 'https://consulmex.sre.gob.mx/sandiego/images/visas/ingles/5a_Temporary_Resident_Visa_-_Economic_Solvency.pdf',
      edition: '2026',
    },
    S.mxResidency,
    { name: 'IMSS: Seguro de Salud para la Familia', url: 'https://imss.gob.mx/faq/seguro-familia', edition: '2026' },
    { name: 'YourTaxBase: Charles Schwab for expats (country list, Oct 2026)', url: 'https://yourtaxbase.com/blog/charles-schwab-for-expats' },
    S.gpiPoster,
  ],
}

export default profile
