import type { ExpatProfile } from '../expatPicks'
import { S } from './_shared'

const profile: ExpatProfile = {
  tagline: 'Remittance-basis island with no wealth or inheritance tax',
  summary:
    'Mauritius has no wealth, inheritance, gift or capital gains tax and taxes foreign income only when it is brought in, so dividends left in the US account and spending funded by margin draws are close to untaxed locally. A 10-year retired permit needs about $2,000 a month transferred in, and Mauritius is 18th in the 2026 Global Peace Index. The costs are distance: no US nonstops, the larger private hospitals are inland, and cyclones from November to May.',
  scores: { cost: 4, healthcare: 3, safety: 4, visa: 4, climate: 4, community: 3, tax: 5, estate: 5, lending: 3 },
  facts: {
    healthcare:
      'C-Care Grand Baie (Mont Choisy) is the local private clinic; the larger private hospitals, C-Care Wellkin in Moka and C-Care Darné in Floréal, are reportedly 45–60 minutes away, and complex cases are often sent to South Africa or France (unverified); public care is described as free, but whether non-citizen residents get it is unverified, so plan on cover such as Cigna Global, which has no entry-age cap.',
    safety:
      'Mauritius is 18th in the 2026 Global Peace Index; UK advice says most crime is non-violent, petty crime is common in Grand Baie, Port Louis and Flic en Flac, tourist villas are burgled, and there are some reports of sexual assault on tourists; brief curfews followed unrest in October 2026.',
    visa: 'Retired Non-Citizen Residence Permit (age 50+, 10 years, renewable, no work): about $2,000/month or $24,000/year transferred to a Mauritian bank (the older EDB figure is $1,500/month; secondary sources); permanent residence after 5 years if $200k was transferred; $375k in qualifying property gives residence while it is held; the free, renewable 1-year Premium Visa sets no minimum income.',
    tax: 'No wealth tax and no capital gains tax; residents (183+ days) pay tax on foreign income only when it is received in Mauritius, at 0% on the first MUR 500k, 10% on the next MUR 500k and 20% above (from 1 Jul 2025), plus a 15% Fair Share Contribution above MUR 12m; dividends left in the US are untaxed, and the permit\'s required transfers should be documented as loan proceeds or US-taxed income to use the declaration exemption (check with an adviser).',
    estate:
      'No inheritance, estate or gift tax, so US assets pass to US-resident children with no Mauritian tax; there is no US estate treaty, but nothing to double-tax, and US estate tax applies only above the $15M exemption (2026); registration duty on inherited Mauritian property was not checked.',
    lending:
      'IBKR reportedly serves all non-sanctioned countries, so likely Mauritius (IBKR Pro); Mauritius is not on Schwab One International\'s reported list of accepted countries (Oct 2026), and margin by country of residence is unreported; Fidelity and Vanguard open no accounts for residents abroad.',
    climate:
      'Mild tropical maritime: a warm, humid summer (November–April, highs around 29°C) and a drier winter (June–September, about 20°C on average); the cyclone season runs November–May, and a cyclone means days indoors.',
    community:
      'A sizeable French, South African and British community in Grand Baie and on the west coast (no headcount found); English is official and French is widely spoken, so French helps day to day.',
    access:
      'No US nonstops: connect via Dubai (Emirates), Paris (Air France, Air Mauritius), Istanbul, London-Gatwick or Johannesburg, about 20–24 hours to the US East Coast; the airport is in the south-east, 48 km beyond Port Louis from Grand Baie.',
  },
  drawbacks: [
    'A day of travel to the US, with no nonstops',
    'Cyclone season from November to May',
    'The larger hospitals are inland, and complex care may mean flying to South Africa or France',
  ],
  sources: [
    { name: 'PwC: Mauritius, other taxes', url: 'https://taxsummaries.pwc.com/mauritius/individual/other-taxes' },
    { name: 'PwC: Mauritius, taxes on personal income', url: 'https://taxsummaries.pwc.com/mauritius/individual/taxes-on-personal-income' },
    { name: 'PwC: Mauritius, income determination', url: 'https://taxsummaries.pwc.com/mauritius/individual/income-determination' },
    { name: 'EDB Mauritius: Premium Visa', url: 'https://residency.mu/live/mauritius-premium-visa/' },
    {
      name: 'Sovereign Group: Mauritius residency permit amendments (Nov 2025)',
      url: 'https://www.sovereigngroup.com/news/mauritius-residency-permit-amendments-benefits-and-qualifying-requirements-update-november-2025/',
      edition: '2025',
    },
    { name: 'Real Estate Mauritius: retiring in Mauritius', url: 'https://real-estate-mauritius.mu/en/retiring-in-mauritius/', edition: '2026' },
    {
      name: 'GOV.UK: English-speaking doctors and medical facilities in Mauritius',
      url: 'https://www.gov.uk/government/publications/mauritius-list-of-doctors/list-of-english-speaking-doctors-and-medical-facilities-in-mauritius',
    },
    { name: 'GOV.UK: Mauritius travel advice, safety and security', url: 'https://www.gov.uk/foreign-travel-advice/mauritius/safety-and-security' },
    { ...S.timeoutGpi, name: 'Time Out: Mauritius 18th in the Global Peace Index 2026' },
    { name: 'Wikipedia: Geography of Mauritius (climate)', url: 'https://en.wikipedia.org/wiki/Geography_of_Mauritius' },
    { name: 'Wikipedia: Sir Seewoosagur Ramgoolam International Airport', url: 'https://en.wikipedia.org/wiki/Sir_Seewoosagur_Ramgoolam_International_Airport' },
    { name: 'YourTaxBase: Charles Schwab for expats (country list, Oct 2026)', url: 'https://yourtaxbase.com/blog/charles-schwab-for-expats' },
  ],
}

export default profile
