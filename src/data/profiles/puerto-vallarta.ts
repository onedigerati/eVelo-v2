import type { ExpatProfile } from '../expatPicks'
import { S } from './_shared'

const profile: ExpatProfile = {
  tagline: 'Bay-front resort town, easy US nonstops',
  summary:
    'Live and Invest Overseas ranked Puerto Vallarta 3rd for 2026, and Mexico is 2nd in Expat Insider 2026 and 5th in International Living. It pairs a big English-speaking snowbird community and easy residency on savings with short nonstop flights home, but Mexico taxes residents\' dividends at up to 35% plus 10%, and Jalisco\'s cartel violence reached the city in February 2026.',
  scores: { cost: 3, healthcare: 3, safety: 2, visa: 5, climate: 3, community: 5, tax: 2, estate: 5, lending: 4 },
  facts: {
    healthcare:
      'Good private hospitals for a city its size (CMQ, San Javier, Amerimed) at well below US prices; the most complex care is in Guadalajara, and IMSS voluntary cover (about MXN 21,500/yr at 70–79 in 2026) has pre-existing-condition limits.',
    safety:
      'Mexico is 137th of 163 in the 2026 Global Peace Index and Jalisco is reportedly at Level 3, "reconsider travel"; in February 2026, cartel blockades after El Mencho\'s killing shut the airport and left tourists sheltering in place.',
    visa: 'Temporary residency on economic solvency accepts savings or investment balances: the San Diego consulate\'s 2026 sheet asks for about $68,200 average monthly balance over 12 months or $4,049/month of income for 6 months, and other consulates ask more (about $74,700 or $4,430/month); permanent residency for retirees is about $299,000 or $7,430/month (2026), and a brokerage account counts as investments.',
    tax: 'No wealth tax; tax residents pay up to 35% (2026) on worldwide income, with foreign dividends fully taxable plus a separate 10% tax on the net dividend that cannot be credited, and foreign interest fully taxable, FX gains on principal included; margin-loan proceeds are not income, so a low-yield, growth-tilted portfolio limits the drag (get local advice).',
    estate:
      'No inheritance or estate tax: inheritances received by Mexican residents are exempt from income tax, and US-resident heirs receiving US assets should fall outside Mexican tax (an inference); there is no US estate treaty, so only US estate tax applies, above the $15M exemption (2026).',
    lending:
      'IBKR reportedly accepts Mexico residents (IBKR Pro), and Schwab One International\'s online form reportedly accepted Mexico in Oct 2026; margin by country of residence is unreported, and Fidelity and Vanguard open no accounts for residents abroad.',
    climate: 'Dry and warm November–May; hot, humid and rainy June–October, with hurricane risk.',
    community: 'One of Mexico\'s largest US and Canadian communities, swelled by winter snowbirds and LGBTQ-friendly; daily life works in English.',
    access: 'Many nonstops to US and Canadian cities: about 3 hours to Dallas or Los Angeles.',
  },
  drawbacks: [
    'Jalisco cartel violence can reach the city, as the February 2026 blockades and flight shutdown showed',
    'Mexico taxes residents\' dividends at up to 35% plus a 10% levy that cannot be credited',
    'Sticky summers, and prices that have climbed with popularity',
  ],
  sources: [
    S.mxAdvisory,
    { ...S.lios, name: '401(k) Specialist: Live and Invest Overseas 2026 list' },
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
