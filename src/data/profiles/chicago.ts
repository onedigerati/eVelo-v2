import type { ExpatProfile } from '../expatPicks'

const profile: ExpatProfile = {
  tagline: 'A flat 4.95% tax and world-class hospitals on the lake, with an estate-tax cliff at $4M',
  summary:
    'Illinois taxes dividends, interest and gains at a flat 4.95% and exempts Social Security and retirement-plan income, so a buy-borrow-die retiree based in Chicago pays a modest state rate on the portfolio and keeps full access to US brokers and securities-based lending. The catch is the estate: Illinois taxes estates above $4M (not indexed, no portability) at up to 16%, on the whole estate once the threshold is crossed. Chicago adds two NCI comprehensive cancer centres, the lakefront, world-class culture and two hub airports; the costs are long winters, some of the highest property taxes in the US and violent crime concentrated in some neighbourhoods.',
  scores: { cost: 2, healthcare: 5, safety: 2, visa: 5, climate: 2, community: 3, tax: 5, estate: 4, lending: 5 },
  facts: {
    healthcare:
      'Northwestern Memorial (with the NCI-designated comprehensive Lurie Cancer Center), UChicago Medicine (also NCI comprehensive), Rush and the University of Illinois anchor one of the deepest hospital markets in the US, with several Level 1 trauma centres; Medicare applies from 65.',
    safety:
      'The US is 134th of 163 in the 2026 Global Peace Index; Chicago recorded 416 homicides in 2025 (preliminary police data), down 29% from 587 and the fewest since 1965, but still about 15 per 100,000, concentrated on the South and West Sides; the lakefront and North Side neighbourhoods are much safer.',
    visa: 'No visa needed: a US citizen can live there without any residency process.',
    tax: 'Illinois taxes dividends, interest and realised gains at a flat 4.95%; Social Security, IRA and qualified-plan distributions and most pensions are subtracted in full, and there is no city income tax, but the state constitution\'s flat-rate rule is a recurring target for change, so check current rules.',
    estate:
      'Illinois estate tax applies above a $4M exclusion (not indexed to inflation, no portability between spouses), with a top rate of 16%; because the exclusion is a threshold rather than a credit, an estate just above $4M owes tax on far more than the excess (the Attorney General\'s example: about $286k on a $5M estate); bills to raise the exclusion were pending in 2026.',
    lending:
      'Full US broker access: every major broker (Schwab, Fidelity, IBKR and others) offers margin and securities-based lines to Illinois residents, and Chicago is a major banking and trading centre.',
    climate:
      'Cold, grey winters with highs around 32 °F (0 °C), about 38 in (97 cm) of snow and lake-effect wind chill, and warm, sometimes humid summers with highs in the mid 80s °F (about 29 °C); spring is short and cool by the lake.',
    community:
      'A big, diverse city with deep cultural life (the Art Institute, the symphony, the lyric opera, the lakefront), but more retirees leave Illinois than arrive; those who stay tend to live along the lakefront (Lincoln Park, the Gold Coast, Edgewater) or in the northern and western suburbs.',
    access:
      'O\'Hare (ORD), a United and American hub, has nonstops to almost every US city and dozens of international destinations across Europe, Asia and Latin America, and Midway (MDW) is a Southwest base; the L trains link both airports to the Loop.',
  },
  drawbacks: [
    'Estate tax above $4M, with a cliff and no portability',
    'Property taxes among the highest in the US',
    'Long, cold winters',
  ],
  sources: [
    { name: 'Illinois Department of Revenue: income tax rates', url: 'https://tax.illinois.gov/research/taxrates/income.html' },
    {
      name: 'Illinois Department of Revenue: Publication 120, retirement income',
      url: 'https://tax.illinois.gov/content/dam/soi/en/web/tax/research/publications/pubs/documents/pub-120.pdf',
    },
    {
      name: 'Illinois Attorney General: estate tax notice and instruction fact sheet ($4M exclusion)',
      url: 'https://illinoisattorneygeneral.gov/Page-Attachments/EstateTaxInstructionFactSheet.pdf',
    },
    {
      name: 'Kiplinger: the Illinois "cliff tax"',
      url: 'https://www.kiplinger.com/retirement/estate-planning/illinois-cliff-tax-what-to-know',
      edition: '2026',
    },
    {
      name: 'WTTW: Chicago set to end 2025 with fewest homicides in years after 30% drop',
      url: 'https://news.wttw.com/2025/12/30/chicago-set-end-2025-fewest-homicides-years-after-30-drop',
      edition: '2025',
    },
    {
      name: 'Spokesman-Review: US falls again in global peace rankings',
      url: 'https://www.spokesman.com/stories/2026/jun/11/us-falls-again-in-global-peace-rankings-while-icel/',
      edition: '2026',
    },
  ],
}

export default profile
