import type { ExpatProfile } from '../expatPicks'
import { S } from './_shared'

const profile: ExpatProfile = {
  tagline: 'Highland capital with Mexico\'s best hospitals',
  summary:
    'Mexico City has the country\'s strongest hospitals, including JCI-accredited ABC Medical Center and Hospital Ángeles Pedregal and Lomas, nonstops to about 28 US cities and a mild highland climate. Residency on savings is easy and there is no estate tax, but Mexico taxes dividends at up to 35% plus 10%, and big-city crime, altitude and a US community skewed to remote workers keep it mid-pack.',
  scores: { cost: 4, healthcare: 4, safety: 3, visa: 5, climate: 4, community: 4, tax: 2, estate: 5, lending: 5 },
  facts: {
    healthcare:
      'The best in Mexico: ABC Medical Center is JCI-accredited at its Observatorio and Santa Fe campuses (a fifth consecutive accreditation in 2021), and Hospital Ángeles Pedregal and Lomas hold the JCI Gold Seal; Medicare is generally not accepted, and IMSS voluntary cover is about MXN 21,500/yr at 70–79 (2026).',
    safety:
      'Mexico is 137th of 163 in the 2026 Global Peace Index; the city is reportedly US Level 2, "exercise increased caution" (secondary source), and the UK warns that street crime is a serious issue in major cities, including robberies in unlicensed taxis.',
    visa: 'Temporary residency on economic solvency accepts savings or investment balances: the San Diego consulate\'s 2026 sheet asks for about $68,200 average monthly balance over 12 months or $4,049/month of income for 6 months, and other consulates ask more (about $74,700 or $4,430/month); permanent residency for retirees is about $299,000 or $7,430/month (2026), and a brokerage account counts as investments.',
    tax: 'No wealth tax; tax residents pay up to 35% (2026) on worldwide income, with foreign dividends fully taxable plus a separate 10% tax on the net dividend that cannot be credited, and foreign interest fully taxable, FX gains on principal included; margin-loan proceeds are not income, so a low-yield, growth-tilted portfolio limits the drag (get local advice).',
    estate:
      'No inheritance or estate tax: inheritances received by Mexican residents are exempt from income tax, and US-resident heirs receiving US assets should fall outside Mexican tax (an inference); there is no US estate treaty, so only US estate tax applies, above the $15M exemption (2026).',
    lending:
      'IBKR reportedly accepts Mexico residents (IBKR Pro), and Schwab One International\'s online form reportedly accepted Mexico in Oct 2026; margin by country of residence is unreported, and Fidelity and Vanguard open no accounts for residents abroad.',
    climate:
      'Subtropical highland at 2,240 m: mild all year, with cool dry winters, a summer rainy season, and air pollution that has improved but persists; the altitude can matter for heart and lung conditions.',
    community:
      'A large US population, but skewed to remote workers rather than retirees: the city took the largest share of new US temporary residents (1,619, or 19%, in January–September 2022).',
    access: 'Mexico City airport (MEX) has nonstops to about 28 US cities on Aeroméxico, American, Delta and United.',
  },
  drawbacks: [
    'A sprawling megacity with street crime, traffic and air pollution',
    'Altitude of 2,240 m, which can matter for heart and lung conditions',
    'Mexico taxes residents\' dividends at up to 35% plus a 10% levy that cannot be credited',
  ],
  sources: [
    { name: 'Pulse News Mexico: ABC Medical Center JCI accreditation for the fifth year', url: 'https://pulsenewsmexico.com/2021/05/21/abc-medical-center-gets-jci-accreditation-for-fifth-year/', edition: '2021' },
    { name: 'Hospital Ángeles: Joint Commission International', url: 'https://en.hospitalangeles.com/joint-commission-international' },
    { ...S.mxAdvisory, name: 'Jetpac: Is it safe to travel to Mexico (Mexico City Level 2, 2026)' },
    { name: 'GOV.UK: Mexico travel advice, safety and security', url: 'https://www.gov.uk/foreign-travel-advice/mexico/safety-and-security', edition: '2026' },
    { name: 'Mexico News Daily: US citizens moving to Mexico in record numbers', url: 'https://mexiconewsdaily.com/news/us-citizens-moving-to-mx-record-numbers/' },
    { name: 'Wikipedia: Mexico City International Airport', url: 'https://en.wikipedia.org/wiki/Mexico_City_International_Airport' },
    { name: 'Wikipedia: Mexico City', url: 'https://en.wikipedia.org/wiki/Mexico_City' },
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
