import type { ExpatProfile } from '../expatPicks'
import { S } from './_shared'

const profile: ExpatProfile = {
  tagline: 'Island food capital with medical-tourism hospitals',
  summary:
    'Penang has Malaysia\'s BBD strengths (no wealth, estate or gift tax, foreign income exempt through 2036, 12th in the Global Peace Index, wide use of English) on a smaller, cheaper island. Its private hospitals are a regional medical-tourism hub; the cost of entry is MM2H\'s deposit and forced home purchase.',
  scores: { cost: 5, healthcare: 4, safety: 4, visa: 3, climate: 3, community: 4, tax: 5, estate: 5, lending: 5 },
  facts: {
    healthcare:
      'Accredited private hospitals (Island Hospital, Gleneagles Penang, Loh Guan Lye) draw medical tourists, at a fraction of US prices; since July 2025 private hospitals add 6% service tax for foreign patients (whether MM2H holders are carved out is unconfirmed).',
    safety: 'Malaysia is 12th in the 2026 Global Peace Index; Penang is generally safe, with petty theft the main concern.',
    visa: 'Federal MM2H applies, with no separate Penang programme found: Silver needs a USD 150,000 fixed deposit with a Malaysian bank (up to half withdrawable after approval) plus a compulsory home of at least RM600k that cannot be sold for 10 years, or more if Penang\'s own foreign-buyer floor is higher (unverified); a renewable 5-year pass, no minimum stay from age 50.',
    tax: 'No wealth tax; foreign-sourced income received in Malaysia by resident individuals (182+ days) is exempt, subject to conditions, through 31 Dec 2036, so US dividends, interest and loan draws are untaxed locally; the 2% tax on dividends above MYR 100,000 appears to reach only Malaysian-company dividends (confirm with an adviser).',
    estate:
      'No inheritance, estate or gift tax, so US assets pass to US-resident children with no Malaysian tax; there is no US estate treaty, but nothing to double-tax, and US estate tax applies only above the $15M exemption (2026).',
    lending:
      'IBKR reportedly accepts Malaysia residents (IBKR Pro), and Schwab One International\'s online form reportedly accepted Malaysia in Oct 2026; margin by country of residence is unreported, and Fidelity and Vanguard open no accounts for residents abroad.',
    climate: 'Tropical: hot and humid all year, with monsoon rains and occasional haze; sea breezes help a little.',
    community: 'A long-established Western retiree community in George Town, Tanjung Bungah and Batu Ferringhi; English is widely spoken.',
    access: 'No US nonstops; connect via Singapore, Kuala Lumpur or another Asian hub, often with two stops.',
  },
  drawbacks: [
    'Very long trips to the US, often with two connections',
    'MM2H\'s USD 150k deposit and a home that cannot be sold for 10 years',
    'Traffic congestion, and coastal high-rise development changing the island',
  ],
  sources: [
    S.mm2h,
    {
      name: 'Asia Lifestyle Magazine: MM2H 2026 requirements, tiers and deposits',
      url: 'https://www.asialifestylemagazine.com/mm2h-2026-requirements-tiers-deposits-how-to-apply/',
      edition: '2026',
    },
    { name: 'PwC: Malaysia, income determination', url: 'https://taxsummaries.pwc.com/malaysia/individual/income-determination' },
    { name: 'PwC: Malaysia, other taxes', url: 'https://taxsummaries.pwc.com/malaysia/individual/other-taxes' },
    S.myTax,
    {
      name: 'RinggitPlus: private hospitals ask MOF to delay 6% SST on foreign patients',
      url: 'https://ringgitplus.com/en/blog/personal-finance-news/private-hospitals-ask-mof-to-delay-6-sst-on-foreign-patients.html',
    },
    { name: 'YourTaxBase: Charles Schwab for expats (country list, Oct 2026)', url: 'https://yourtaxbase.com/blog/charles-schwab-for-expats' },
    S.seaGpi,
  ],
}

export default profile
