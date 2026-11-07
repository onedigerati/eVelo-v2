import type { ExpatProfile } from '../expatPicks'
import { S } from './_shared'

const profile: ExpatProfile = {
  tagline: 'Highland arts town, Mexico\'s classic American enclave',
  summary:
    'San Miguel de Allende is on Forbes\' 2026 list and is one of the towns most often reported as home by foreign residents in Mexico News Daily\'s 2026 survey. It offers a dry highland climate, a walkable colonial centre, a deep English-speaking community and easy residency on savings, against Mexico\'s dividend tax and a state with high crime.',
  scores: { cost: 3, healthcare: 3, safety: 2, visa: 5, climate: 4, community: 5, tax: 2, estate: 5, lending: 5 },
  facts: {
    healthcare:
      'Two local private hospitals (including H+ and MAC) cover routine and moderate care; major procedures usually mean Querétaro, about an hour away, or Mexico City, about 3 hours; private local cover runs about MXN 96,000/yr for a healthy 62-year-old, and IMSS voluntary cover about MXN 21,500/yr at 70–79 (2026).',
    safety:
      'Mexico is 137th of 163 in the 2026 Global Peace Index, and Guanajuato is reportedly US State Dept Level 3, "reconsider travel", with one of Mexico\'s highest homicide counts; the town itself is reported to be calmer, but no city data was found.',
    visa: 'Temporary residency on economic solvency accepts savings or investment balances: the San Diego consulate\'s 2026 sheet asks for about $68,200 average monthly balance over 12 months or $4,049/month of income for 6 months, and other consulates ask more (about $74,700 or $4,430/month); permanent residency for retirees is about $299,000 or $7,430/month (2026), and a brokerage account counts as investments.',
    tax: 'No wealth tax; tax residents pay up to 35% (2026) on worldwide income, with foreign dividends fully taxable plus a separate 10% tax on the net dividend that cannot be credited, and foreign interest fully taxable, FX gains on principal included; margin-loan proceeds are not income, so a low-yield, growth-tilted portfolio limits the drag (get local advice).',
    estate:
      'No inheritance or estate tax: inheritances received by Mexican residents are exempt from income tax, and US-resident heirs receiving US assets should fall outside Mexican tax (an inference); there is no US estate treaty, so only US estate tax applies, above the $15M exemption (2026).',
    lending:
      'IBKR reportedly accepts Mexico residents (IBKR Pro), and Schwab One International\'s online form reportedly accepted Mexico in Oct 2026; margin by country of residence is unreported, and Fidelity and Vanguard open no accounts for residents abroad.',
    climate: 'At about 1,900 m: dry, sunny and mild, with near-freezing winter nights, a hot May and moderate summer rains.',
    community: 'A long-standing, very large US and Canadian retiree community, rich in arts and volunteer groups; daily life is easy in English.',
    access: 'No airport: León/Bajío is about 1.5 hours away and Querétaro about 1 hour, both with nonstops to Texas and some other US hubs (check current routes).',
  },
  drawbacks: [
    'It sits in Guanajuato, one of Mexico\'s most violent states',
    'Mexico taxes residents\' dividends at up to 35% plus a 10% levy that cannot be credited',
    'Serious medical care and airports are an hour or more away by road',
  ],
  sources: [
    { ...S.mxAdvisory, name: 'Jetpac: Is it safe to travel to Mexico (Guanajuato Level 3, 2026)' },
    {
      name: 'Mexico News Daily: Expat Safety Perceptions Index Q1 2026',
      url: 'https://mexiconewsdaily.com/news/how-safe-is-mexico-according-to-its-foreign-residents-the-survey-results/',
    },
    { name: 'San Miguel Scene: long-term care in San Miguel de Allende', url: 'https://www.sanmiguelscene.com/blog/long-term-care-in-san-miguel-de-allende' },
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
    S.forbes,
  ],
}

export default profile
