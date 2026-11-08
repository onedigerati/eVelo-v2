import type { ExpatProfile } from '../expatPicks'

const profile: ExpatProfile = {
  tagline: 'Safe, cheaper than Tokyo, famous food, but no way to stay past a year',
  summary:
    'Osaka has Japan\'s very low crime (10th in the 2026 Global Peace Index), good hospitals, a famous street-food culture and rents well below Tokyo\'s, with Kyoto and Nara a short train ride away. For buy-borrow-die it is a base for long visits, not a retirement home: Japan has no retirement or passive-income visa, the wealthy-tourist "Long Stay" status lasts a year at most, and inheritance tax runs to 55%. A Long Stay visitor\'s US assets stay outside it, since that status can never build the 10 years of residence after which a foreigner\'s worldwide estate is taxed; someone who settles on a spouse or permanent-resident status is taxed on the worldwide estate from the start.',
  scores: { cost: 3, healthcare: 4, safety: 5, visa: 2, climate: 3, community: 1, tax: 3, estate: 2, lending: 3 },
  facts: {
    healthcare:
      'Good hospitals, including Osaka University Hospital (accredited under Japan\'s JMIP scheme for international patients) and Iseikai International General Hospital in Kita-ku (JCI-accredited Dec 2024, multilingual staff), though fewer English-speaking doctors than Tokyo; Long Stay holders cannot join National Health Insurance and must carry private cover for the whole stay, and international plans often stop taking new members around 65–70.',
    safety:
      'Japan is 10th of 163 in the 2026 Global Peace Index; violent and street crime are very low even at night, and the real risks are earthquakes and summer typhoons.',
    visa: 'No retirement or passive-income visa: the Designated Activities "Long Stay for sightseeing and recreation" status needs savings above JPY 30m (about $190k; JPY 60m for a couple on separate itineraries) and private insurance, and gives 6 months, extendable once to 1 year at most, after which a new stay means applying again from abroad; it allows no work and does not lead to permanent residence, and the Business Manager route now needs JPY 30m capital and an employee.',
    tax: 'No wealth tax; a foreign resident is a non-permanent resident for the first 5 of 10 years, taxed on foreign dividends and interest only when paid in or remitted to Japan (how borrowed money sent in is treated needs advice), but on gains from securities bought while living in Japan (since April 2017) whether or not anything is remitted, with holdings bought before arrival staying on the remittance basis; after 5 years, worldwide income: 20.315% on listed-share dividends and capital gains (US-listed included), progressive rates up to about 56% on offshore bank interest; leaving after 5+ years of non-Table-I residence with JPY 100m+ in securities triggers an exit tax on unrealised gains.',
    estate:
      'Inheritance tax of 10–55%, paid by the heirs (55% above JPY 600m per heir\'s share; basic exemption JPY 30m + 6m per heir); a foreign national on a Table I status such as Long Stay is taxed only on Japan-sited assets until 10 of the last 15 years in Japan, which a 1-year Long Stay cannot reach, while statuses outside Table I (spouse of a Japanese national, permanent resident) put the worldwide estate in reach from the start; the US–Japan estate and gift tax treaty gives credit relief, and the $15M US exemption (2026) applies as anywhere.',
    lending:
      'IBKR reportedly serves Japan residents (Japan-resident clients may be moved to IB Securities Japan), while Schwab One International reportedly does not accept Japan residents; margin terms by country of residence are unconfirmed, and Fidelity and Vanguard open no accounts for residents abroad.',
    climate:
      'Humid subtropical: hot, humid summers (August highs about 34 °C / 93 °F) with an early-summer rainy season and typhoons in late summer and autumn, and cool, mostly dry winters (January highs about 10 °C / 50 °F); about 1,340 mm of rain a year.',
    community:
      'Osaka City counted 214,337 registered foreigners at the end of 2025, mostly Chinese (60,946), Korean (56,539), Vietnamese (32,608) and Nepalese (19,345), with only about 2,100 Americans, out of Japan\'s record 4.1 million foreign residents; English-speaking retirees are few, and daily life needs more Japanese than in central Tokyo.',
    access:
      'Kansai airport (KIX) has nonstops to Honolulu (JAL, Hawaiian), Los Angeles (JAL; United from Mar 2027) and San Francisco (United), with Seattle due in May 2027; other US cities mean a connection, often via Tokyo.',
  },
  drawbacks: [
    'No residence route on a portfolio: Long Stay ends after a year at most and needs JPY 30m in savings',
    'Up to 55% inheritance tax on worldwide assets for anyone who settles beyond Long Stay, and an exit tax on leaving',
    'Few English-speaking foreigners, and private health cover with age limits on Long Stay',
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
    {
      name: 'Migaku: retirement visa options in Japan',
      url: 'https://migaku.com/blog/language-fun/retirement-visa-options-in-japan-whats-actually-available',
    },
    {
      name: 'Morgan Lewis: Japan to tighten Business Manager requirements',
      url: 'https://www.morganlewis.com/fr/pubs/2025/09/japanese-government-to-tighten-requirements-for-business-manager-work-permit',
      edition: '2025',
    },
    { name: 'Iseikai International General Hospital: about the hospital (JCI, Dec 2024)', url: 'https://www.iseikaihp.or.jp/english/about.html' },
    { name: 'University of Osaka Hospital: JMIP accreditation', url: 'https://www.hosp.med.osaka-u.ac.jp/english/topics/detail.php?id=358' },
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
    {
      name: 'Osaka City: registered foreign residents by ward and nationality (end of 2025)',
      url: 'https://www.city.osaka.lg.jp/shimin/cmsfiles/contents/0000431/431477/r7kubetsu2.pdf',
      edition: '2025',
    },
    { name: 'Wikipedia: Osaka', url: 'https://en.wikipedia.org/wiki/Osaka' },
    { name: 'Wikipedia: Kansai International Airport', url: 'https://en.wikipedia.org/wiki/Kansai_International_Airport' },
    { name: 'RetireJapan: Interactive Brokers review', url: 'https://retirejapan.com/blog/review-interactive-brokers' },
    { name: 'YourTaxBase: Charles Schwab for expats (country list, Oct 2026)', url: 'https://yourtaxbase.com/blog/charles-schwab-for-expats' },
  ],
}

export default profile
