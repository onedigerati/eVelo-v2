import type { ExpatProfile } from '../expatPicks'
import { S } from './_shared'

const profile: ExpatProfile = {
  tagline: 'Modern, English-friendly city, tax-free foreign income',
  summary:
    'Malaysia is 12th in the 2026 Global Peace Index and 10th in International Living\'s 2026 index, and it is the best BBD tax fit in Asia: no wealth, estate or gift tax, and residents\' foreign income exempt through 2036. Kuala Lumpur adds first-rate private hospitals and widespread English at a fraction of US costs, but MM2H\'s deposit and forced home purchase are the cost of entry.',
  scores: { cost: 4, healthcare: 4, safety: 4, visa: 3, climate: 3, community: 4, tax: 5, estate: 5, lending: 5 },
  facts: {
    healthcare:
      'Excellent, affordable private hospitals (Gleneagles, Prince Court, Sunway) with English-speaking, often Western-trained doctors; foreigners get no public subsidy, and since July 2025 private hospitals add 6% service tax for foreign patients (whether MM2H holders are carved out is unconfirmed).',
    safety: 'Malaysia is 12th in the 2026 Global Peace Index; violent crime is low, and bag-snatching and petty theft are the main risks.',
    visa: 'MM2H Silver: a USD 150,000 fixed deposit with a Malaysian bank (up to half withdrawable after approval, for a home, medical or other costs) plus a compulsory home that cannot be sold for 10 years, at Kuala Lumpur\'s RM1m foreign-buyer floor rather than the tier\'s RM600k; a renewable 5-year pass, no minimum stay from age 50 (tier figures from a secondary source, Oct 2026).',
    tax: 'No wealth tax; foreign-sourced income received in Malaysia by resident individuals (182+ days) is exempt, subject to conditions, through 31 Dec 2036, so US dividends, interest and loan draws are untaxed locally; the 2% tax on dividends above MYR 100,000 appears to reach only Malaysian-company dividends (confirm with an adviser).',
    estate:
      'No inheritance, estate or gift tax, so US assets pass to US-resident children with no Malaysian tax; there is no US estate treaty, but nothing to double-tax, and US estate tax applies only above the $15M exemption (2026).',
    lending:
      'IBKR reportedly accepts Malaysia residents (IBKR Pro), and Schwab One International\'s online form reportedly accepted Malaysia in Oct 2026; margin by country of residence is unreported, and Fidelity and Vanguard open no accounts for residents abroad.',
    climate: 'Hot and humid all year (about 32°C), with heavy afternoon storms and occasional haze from regional fires.',
    community: 'A large, established expat community (Mont Kiara, Bangsar); English is an everyday business language.',
    access: 'No US nonstops; one stop via Tokyo, Seoul, Taipei, Doha or Dubai, typically 20+ hours.',
  },
  drawbacks: [
    'MM2H\'s entry cost: USD 150k on deposit plus a RM1m home that cannot be sold for 10 years',
    'A long trip home to the US, with no nonstop flights',
    'Relentless heat and humidity, and a city built around cars',
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
    {
      name: 'Bloomberg Tax: Malaysia gazettes order extending foreign income exemption',
      url: 'https://news.bloombergtax.com/daily-tax-report-international/malaysia-gazettes-order-extending-income-tax-exemption-on-foreign-income',
    },
    {
      name: 'RinggitPlus: private hospitals ask MOF to delay 6% SST on foreign patients',
      url: 'https://ringgitplus.com/en/blog/personal-finance-news/private-hospitals-ask-mof-to-delay-6-sst-on-foreign-patients.html',
    },
    { name: 'YourTaxBase: Charles Schwab for expats (country list, Oct 2026)', url: 'https://yourtaxbase.com/blog/charles-schwab-for-expats' },
    S.timeoutGpi,
  ],
}

export default profile
