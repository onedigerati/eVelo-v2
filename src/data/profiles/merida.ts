import type { ExpatProfile } from '../expatPicks'
import { S } from './_shared'

const profile: ExpatProfile = {
  tagline: 'Colonial capital in Mexico\'s safest state',
  summary:
    'Mérida, on Forbes\' 2026 list, is a large, low-cost colonial city in Yucatán, reportedly the only Mexican state the US State Department rates at Level 1, and the Yucatán Peninsula\'s medical hub. Residency on savings is easy and there is no estate tax, but Mexico taxes residents\' dividends at up to 35% plus a separate 10%.',
  scores: { cost: 4, healthcare: 4, safety: 4, visa: 5, climate: 2, community: 4, tax: 2, estate: 5, lending: 4 },
  facts: {
    healthcare:
      'The regional medical centre for the Yucatán Peninsula, where even Belize sends serious cases, with private hospitals (Star Médica, Faro del Mayab, Clínica de Mérida) well below US prices; IMSS voluntary cover is about MXN 21,500/yr at 70–79 (2026), with limits.',
    safety:
      'Mexico is 137th of 163 in the 2026 Global Peace Index, but Yucatán is reportedly the only state at US State Dept Level 1, "normal precautions", and Mérida is widely called Mexico\'s safest large city.',
    visa: 'Temporary residency on economic solvency accepts savings or investment balances: the San Diego consulate\'s 2026 sheet asks for about $68,200 average monthly balance over 12 months or $4,049/month of income for 6 months, and other consulates ask more (about $74,700 or $4,430/month); permanent residency for retirees is about $299,000 or $7,430/month (2026), and a brokerage account counts as investments.',
    tax: 'No wealth tax; tax residents pay up to 35% (2026) on worldwide income, with foreign dividends fully taxable plus a separate 10% tax on the net dividend that cannot be credited, and foreign interest fully taxable, FX gains on principal included; margin-loan proceeds are not income, so a low-yield, growth-tilted portfolio limits the drag (get local advice).',
    estate:
      'No inheritance or estate tax: inheritances received by Mexican residents are exempt from income tax, and US-resident heirs receiving US assets should fall outside Mexican tax (an inference); there is no US estate treaty, so only US estate tax applies, above the $15M exemption (2026).',
    lending:
      'IBKR reportedly accepts Mexico residents (IBKR Pro), and Schwab One International\'s online form reportedly accepted Mexico in Oct 2026; margin by country of residence is unreported, and Fidelity and Vanguard open no accounts for residents abroad.',
    climate: 'Hot all year, often 40°C (104°F) in April–May, with a humid rainy season June–October and hurricane exposure.',
    community: 'A sizeable, growing US, Canadian and European community in the centre and northern suburbs, less English-dominated than Puerto Vallarta or San Miguel.',
    access: 'A few US nonstops, reportedly to Houston, Miami, Dallas and Orlando (check current schedules); otherwise connect via Mexico City or drive 4 hours to Cancún.',
  },
  drawbacks: [
    'Punishing heat in spring and summer, and high air-conditioning bills',
    'Few nonstop US flights compared with Cancún or Puerto Vallarta',
    'Mexico taxes residents\' dividends at up to 35% plus a 10% levy that cannot be credited',
  ],
  sources: [
    { ...S.mxAdvisory, name: 'Jetpac: Is it safe to travel to Mexico (Yucatán Level 1, 2026)' },
    S.forbes,
    { name: 'Rio Times: healthcare in Belize for expats (referrals to Mérida)', url: 'https://www.riotimesonline.com/healthcare-belize-expats-2026/', edition: '2026' },
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
