import type { ExpatProfile } from '../expatPicks'

const profile: ExpatProfile = {
  tagline: 'Very safe, superb transit, but no way to stay past a year',
  summary:
    'Tokyo is among the safest big cities anywhere (Japan is 10th in the 2026 Global Peace Index), with world-class hospitals, superb transit and a weak yen that makes it cheaper than most large US cities. For buy-borrow-die it is a base for long visits, not a retirement home: there is no retirement or passive-income visa, the wealthy-tourist "Long Stay" status lasts a year at most, and Japan\'s inheritance tax runs to 55%. A Long Stay visitor\'s US assets stay outside it, since that status can never build the 10 years of residence after which a foreigner\'s worldwide estate is taxed; someone who settles on a spouse or permanent-resident status is taxed on the worldwide estate from the start.',
  scores: { cost: 2, healthcare: 4, safety: 5, visa: 2, climate: 3, community: 2, tax: 3, estate: 2, lending: 3 },
  facts: {
    healthcare:
      'Excellent hospitals, several with English-speaking staff, including JCI-accredited St. Luke\'s International (Tsukiji) and NTT Medical Center; Long Stay holders cannot join National Health Insurance and must carry private cover for the whole stay, and some international plans take new members only up to about 75 (Allianz Care, secondary source), while Cigna Global sets no upper age limit.',
    safety:
      'Japan is 10th of 163 in the 2026 Global Peace Index; violent and street crime are very low even at night, and the real risks are earthquakes and summer typhoons.',
    visa: 'No retirement or passive-income visa: the Designated Activities "Long Stay for sightseeing and recreation" status needs savings above JPY 30m (about $190k; JPY 60m for a couple on separate itineraries) and private insurance, and gives 6 months, extendable once to 1 year at most, after which a new stay means applying again from abroad; it allows no work and does not lead to permanent residence, and the Business Manager route now needs JPY 30m capital and an employee.',
    tax: 'No wealth tax; a foreign resident is a non-permanent resident for the first 5 of 10 years, taxed on foreign dividends and interest only when paid in or remitted to Japan (how borrowed money sent in is treated needs advice), but on gains from securities bought while living in Japan (since April 2017) whether or not anything is remitted, with holdings bought before arrival staying on the remittance basis; after 5 years, worldwide income: 20.315% on listed-share dividends and capital gains (US-listed included), progressive rates up to about 56% on offshore bank interest; leaving after 5+ years of non-Table-I residence with JPY 100m+ in securities triggers an exit tax on unrealised gains.',
    estate:
      'Inheritance tax of 10–55%, paid by the heirs (55% above JPY 600m per heir\'s share; basic exemption JPY 30m + 6m per heir); a foreign national on a Table I status such as Long Stay is taxed only on Japan-sited assets until 10 of the last 15 years in Japan, which a 1-year Long Stay cannot reach, while statuses outside Table I (spouse of a Japanese national, permanent resident) put the worldwide estate in reach from the start; the US–Japan estate and gift tax treaty gives credit relief, and the $15M US exemption (2026) applies as anywhere.',
    lending:
      'IBKR reportedly serves Japan residents (Japan-resident clients may be moved to IB Securities Japan), while Schwab One International reportedly does not accept Japan residents; margin terms by country of residence are unconfirmed, and Fidelity and Vanguard reportedly open no new accounts for residents abroad.',
    climate:
      'Humid subtropical: hot, humid summers (August highs about 31 °C / 88 °F) with an early-summer rainy season, typhoons most years in late summer and autumn, and cool, dry, sunny winters (January highs about 10 °C / 50 °F); about 1,600 mm of rain a year.',
    community:
      'Japan had a record 4.1 million foreign residents at the end of 2025, mostly working-age and from China, Vietnam and Korea, and Tokyo has the largest share; with no retiree visa, the English-speaking retiree community is small, and daily life outside central areas needs some Japanese.',
    access:
      'Haneda (HND) is about 30 minutes from central Tokyo and Narita (NRT) about an hour by express train; the shinkansen runs to Kyoto, Osaka and beyond.',
  },
  drawbacks: [
    'No residence route on a portfolio: Long Stay ends after a year at most and needs JPY 30m in savings',
    'Up to 55% inheritance tax on worldwide assets for anyone who settles beyond Long Stay, and an exit tax on leaving',
    'No public health insurance on Long Stay, so private cover for the whole stay',
  ],
  sources: [
    { name: 'PwC: Japan, other taxes', url: 'https://taxsummaries.pwc.com/japan/individual/other-taxes', edition: '2026' },
    { name: 'PwC: Japan, residence', url: 'https://taxsummaries.pwc.com/japan/individual/residence', edition: '2026' },
    { name: 'PwC: Japan, taxes on personal income', url: 'https://taxsummaries.pwc.com/japan/individual/taxes-on-personal-income', edition: '2026' },
    { name: 'PwC: Japan, income determination', url: 'https://taxsummaries.pwc.com/japan/individual/income-determination', edition: '2026' },
    {
      name: 'Deloitte (Legal 500): change in taxation of non-permanent residents',
      url: 'https://www.legal500.com/intelligence/japan/tax/change-in-taxation-of-non-permanent-residents',
      edition: '2017',
    },
    {
      name: 'Embassy of Japan in Singapore (VFS): Designated Activities, Long Stay requirements',
      url: 'https://www.vfsglobal.com/one-pager/japan/singapore/english/pdf/Designated-activities-Long-Stay-Updated.pdf',
      edition: '2025',
    },
    { name: 'Toma Consultants: basics of Japan\'s exit tax', url: 'https://toma.co.jp/en/blog/jtg/basics-exittax-japan/' },
    { name: 'IRS: estate and gift tax treaties', url: 'https://www.irs.gov/businesses/small-businesses-self-employed/estate-gift-tax-treaties-international' },
    { name: 'Fukuoka Now: Long Stay for sightseeing and recreation', url: 'https://www.fukuoka-now.com/en/long-stay-for-sightseeing-and-recreation/', edition: '2023' },
    { name: 'Go! Go! Nihon: the long-stay tourist visa for Japan', url: 'https://gogonihon.com/en/blog/long-stay-tourist-visa-for-japan/', edition: '2024' },
    {
      name: 'Migaku: retirement visa options in Japan',
      url: 'https://migaku.com/blog/language-fun/retirement-visa-options-in-japan-whats-actually-available',
    },
    {
      name: 'Morgan Lewis: Japan to tighten Business Manager requirements',
      url: 'https://www.morganlewis.com/fr/pubs/2025/09/japanese-government-to-tighten-requirements-for-business-manager-work-permit',
      edition: '2025',
    },
    { name: 'St. Luke\'s International Hospital: JCI accreditation', url: 'https://hospital.luke.ac.jp/eng/about/jci/index.html' },
    {
      name: 'Vision of Humanity: the 10 most peaceful countries in 2026',
      url: 'https://www.visionofhumanity.org/why-iceland-stretched-its-lead-among-the-worlds-10-most-peaceful-countries-in-2026/',
      edition: '2026',
    },
    {
      name: 'Adnkronos (Jiji): foreign residents in Japan reach a record 4.12M',
      url: 'https://english.adnkronos.com/2026/03/27/foreign-residents-in-japan-reach-record-4-12-m/',
      edition: '2026',
    },
    { name: 'Wikipedia: Haneda Airport', url: 'https://en.wikipedia.org/wiki/Haneda_Airport' },
    { name: 'Wikipedia: Tokyo', url: 'https://en.wikipedia.org/wiki/Tokyo' },
    { name: 'YourTaxBase: Charles Schwab for expats (country list, Oct 2026)', url: 'https://yourtaxbase.com/blog/charles-schwab-for-expats' },
    { name: 'Meguro City: National Health Insurance for foreign residents (who cannot join)', url: 'https://www.city.meguro.tokyo.jp/kokuho/kurashi/kokuho/kanyu-gaikoku.html', edition: '2025' },
    { name: 'National Tax Agency: exit tax (Tax Answer No.1478)', url: 'https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1478.htm', edition: '2026' },
    { name: 'Office Tree (gyoseishoshi): Business Manager status after the October 2025 reform', url: 'https://office-tree.jp/blog/immigration/keiei-kanri-visa-2025-kaisei/', edition: '2026' },
    { name: 'Japan Visa: long-term tourism (Long Stay) requirements', url: 'https://japan-visa.com/visas/long-term-tourism', edition: '2026' },
    { name: 'Finance Magnates: Interactive Brokers launches NISA accounts through IB Securities Japan', url: 'https://www.financemagnates.com/forex/brokers/interactive-brokers-targets-japanese-market-with-tax-free-investment-accounts/', edition: '2025' },
    { name: 'Cigna Global: international health plans (no upper age limit)', url: 'https://cignaglobal.com/international-health-plans' },
    { name: 'Expatica: Allianz Care health insurance review (entry to age 75)', url: 'https://www.expatica.com/global/healthcare/healthcare-basics/allianz-care-health-insurance-review-2173537', edition: '2026' },
    { name: 'Your Tax Base: best brokerage for US expats (Oct 2026)', url: 'https://yourtaxbase.com/blog/best-brokerage-for-us-expats', edition: '2026' },
    { name: 'Cities Insider: Tokyo healthcare, the 2025-2026 guide', url: 'https://citiesinsider.com/country/japan/tokyo/guides/tokyo-healthcare/zh', edition: '2026' },
    { name: 'NTT Medical Center Tokyo: Department of International Healthcare', url: 'https://www.nmct.ntt-east.co.jp/en/divisions/international_healthcare' },
  ],
}

export default profile
