import type { ExpatProfile } from '../expatPicks'

const profile: ExpatProfile = {
  tagline: 'The EU\'s lightest tax on a US portfolio, in a British retiree hub',
  summary:
    'Cyprus has the best BBD tax profile in the EU: a non-domiciled resident\'s dividends and interest carry only the capped 2.65% health contribution for 17 years, with no wealth or inheritance tax. Category F gives permanent residence on about €9,600 a year of foreign income, and Paphos is the island\'s most retiree-oriented town, cheaper than Limassol.',
  scores: { cost: 3, healthcare: 3, safety: 4, visa: 5, climate: 4, community: 5, tax: 5, estate: 5, lending: 3 },
  facts: {
    healthcare:
      'Paphos General Hospital plus private hospitals (Royal Artemis, Evangelismos, Iasis, St George & Blue Cross), where English is generally spoken; Category F holders can join GeSY, with co-pays capped at €150 a year (2026), and the national reference centres are in Nicosia, about 90 minutes away.',
    safety:
      'Cyprus fell nine places to 80th in the 2026 Global Peace Index; UK travel advice says crime against tourists is not common, though protests can start at short notice and wildfire risk is high from April to October.',
    visa: 'Category F permanent residence: secured foreign income of at least €9,568 a year (+€4,613 per dependant), and dividends and interest count; renting is fine, no work is allowed, and the permit lapses after 2 years away; the alternative is €300k of new property plus €50k/yr of income.',
    tax: 'No wealth tax; dividends and interest are exempt from income tax, and a non-domiciled resident pays no Special Defence Contribution for 17 of 20 years, so they carry only the 2.65% GeSY contribution, capped at about €4.8k a year (PwC does not carve non-doms out of GeSY, so assume it applies); after that, a €250k lump sum covers 5 years.',
    estate: 'No inheritance or estate tax, and no gift tax between relatives to the third degree, so a US portfolio passes to US-resident children with no Cypriot tax; no US estate treaty is needed.',
    lending:
      'IBKR reportedly serves Cyprus residents (likely through its EU entity), with margin terms per country unknown; Schwab International is reportedly unavailable, and EU PRIIPs rules reportedly block new purchases of US ETFs, though existing holdings can usually be kept.',
    climate: 'Mediterranean with about 3,300 hours of sun: August highs average 31°C (heatwaves reach 35–38°C), and January highs about 17°C with lows near 9°C.',
    community:
      'Cyprus\'s main British retiree town, with an estimated 20,000+ British residents in the district (Tala, Chloraka, Peyia) plus Dutch, German and Scandinavian retirees, and English everywhere.',
    access: 'Paphos airport (10 km) has direct flights to the UK and much of Europe; there are no US nonstops, so connect through a European hub.',
  },
  drawbacks: [
    'Hot summers push up air-conditioning bills, and wildfire season is long',
    'No US nonstops, and complex care is in Nicosia',
    'Schwab International is reportedly unavailable, so borrowing rests on IBKR',
  ],
  sources: [
    { name: 'PwC: Cyprus, income determination', url: 'https://taxsummaries.pwc.com/cyprus/individual/income-determination' },
    { name: 'PwC: Cyprus, other taxes', url: 'https://taxsummaries.pwc.com/cyprus/individual/other-taxes' },
    { name: 'Andersen Cyprus: alternative SDC regime', url: 'https://cy.andersen.com/news/cyprus-introduces-an-alternative-sdc-regime/' },
    {
      name: 'GK Law Firm: Cyprus Category F permanent residency',
      url: 'https://gk-lawfirm.com/practice-areas/immigration-law/cyprus-permanent-residency/category-f-visa',
    },
    {
      name: 'Cyprus Mail: residency requirements explained (Jan 2026)',
      url: 'https://cyprus-mail.com/2026/01/28/cyprus-residency-requirements-visas-permits-and-permanent-residence-explained',
    },
    { name: 'index.cy: hospitals in Cyprus, 2026 guide', url: 'https://index.cy/articles/hospitals-in-cyprus-guide/' },
    { name: 'index.cy: living in Paphos, 2026 guide', url: 'https://index.cy/articles/living-in-paphos-guide/' },
    { name: 'Cyprus Mail: Cyprus falls nine places in GPI 2026', url: 'https://cyprus-mail.com/2026/06/12/cyprus-falls-nine-places-in-global-peace-ranking', edition: '2026' },
    { name: 'GOV.UK: Cyprus travel advice, safety and security', url: 'https://www.gov.uk/foreign-travel-advice/cyprus/safety-and-security' },
    { name: 'YourTaxBase: Charles Schwab for expats (Oct 2026)', url: 'https://yourtaxbase.com/blog/charles-schwab-for-expats' },
    { name: 'Wikipedia: Paphos (climate, airport)', url: 'https://en.wikipedia.org/wiki/Paphos' },
  ],
}

export default profile
