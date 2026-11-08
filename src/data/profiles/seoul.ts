import type { ExpatProfile } from '../expatPicks'

const profile: ExpatProfile = {
  tagline: 'Top hospitals and great transit, with a 50% worldwide inheritance tax',
  summary:
    'Seoul has some of Asia\'s best hospitals, open to foreign residents through the National Health Insurance, low street crime, superb transit and nonstops to about 15 US cities. For buy-borrow-die it is a poor home: Korea taxes residents on worldwide income after 5 years (dividends above KRW 20m at up to about 49.5%), its inheritance tax reaches the worldwide estate of anyone resident at death at up to 50%, and since the retiree investor route closed in 2023 the only passive residence route is a KRW 1.5bn (about $1.1M) interest-free deposit locked for 5 years.',
  scores: { cost: 2, healthcare: 5, safety: 4, visa: 2, climate: 2, community: 2, tax: 2, estate: 1, lending: 4 },
  facts: {
    healthcare:
      'World-class teaching hospitals, including Severance (JCI-accredited since 2007), Samsung Medical Center, Asan and Seoul National University Hospital; foreigners staying over 6 months must join the National Health Insurance, whose premium for those without an employer is set on income and property.',
    safety:
      'South Korea is 57th of 163 in the 2026 Global Peace Index, pulled down by tension with North Korea rather than crime; the US rates it Level 1, street crime in Seoul is low, and the hazards are summer monsoon floods and winter fine dust.',
    visa: 'No retirement visa: the retiree investor route (KRW 300m at 55+) was abolished in 2023, and the passive route left is public-business investment immigration, a KRW 1.5bn (about $1.1M) deposit held interest-free in a government-run fund for 5 years, which gives F-2 residence and then F-5 permanent residence (KRW 3bn gives permanent residence at once); a separate property-investment route applies only to designated developments such as those in Jeju and Incheon.',
    tax: 'No wealth tax; a foreign resident living in Korea 5 years or less of the last 10 is taxed on foreign-source income only when it is paid by a Korean entity or transferred to Korea; after that, worldwide: interest and dividends above KRW 20m a year join the progressive scale up to 45% plus 10% local tax (about 49.5%), and gains on foreign shares pay 22% above a KRW 2.5m yearly allowance; from 2027 an exit tax reaches foreign shares worth more than KRW 500m in total for anyone resident 5 of the last 10 years who emigrates.',
    estate:
      'Inheritance tax of 10–50% (50% above KRW 3bn, about $2.2M) reaches the worldwide estate of anyone resident in Korea at death (domicile or 183+ days), foreigners included, while non-residents are taxed only on Korean assets; the basic deduction is up to KRW 500m; a 2025 government plan to tax each heir on their own share from 2028, top rate unchanged, was still a proposal at last report; there is no US–Korea estate treaty, and the $15M US exemption (2026) applies as anywhere.',
    lending:
      'IBKR reportedly accepts Korea residents, and Schwab One International\'s online form reportedly accepted South Korea in Oct 2026; margin by country of residence is unreported, and Fidelity and Vanguard open no accounts for residents abroad.',
    climate:
      'Humid continental: cold, dry winters (January highs about 2 °C / 36 °F, lows about −6 °C), a June–July monsoon and hot, humid summers (August highs about 30 °C / 86 °F), about 1,420 mm of rain a year, and spring fine dust and yellow dust.',
    community:
      'Korea had a record 2.73 million foreign residents in mid-2025, a third of them Chinese and most working-age, with over half of registered foreigners in the Seoul area; the English-speaking retiree community is small, and daily life outside central areas needs some Korean.',
    access:
      'Incheon (ICN) has nonstops to about 15 US cities on Korean Air, Asiana, Delta, Air Premia, American and Alaska, including Los Angeles, San Francisco, Seattle, New York, Chicago, Atlanta, Dallas, Washington, Boston, Detroit, Las Vegas and Honolulu.',
  },
  drawbacks: [
    'Up to 50% inheritance tax on the worldwide estate of anyone resident at death, with no US estate treaty',
    'Worldwide tax on dividends at up to about 49.5% after 5 years, and an exit tax on foreign shares from 2027',
    'No retiree visa: the only passive route is KRW 1.5bn locked interest-free for 5 years',
  ],
  sources: [
    { name: 'PwC: Korea, residence', url: 'https://taxsummaries.pwc.com/republic-of-korea/individual/residence', edition: '2026' },
    { name: 'PwC: Korea, taxes on personal income', url: 'https://taxsummaries.pwc.com/republic-of-korea/individual/taxes-on-personal-income', edition: '2026' },
    { name: 'PwC: Korea, income determination', url: 'https://taxsummaries.pwc.com/republic-of-korea/individual/income-determination', edition: '2026' },
    { name: 'PwC: Korea, other taxes', url: 'https://taxsummaries.pwc.com/republic-of-korea/individual/other-taxes', edition: '2026' },
    { name: 'Korea JoongAng Daily: big tax shock for investors in foreign stocks', url: 'https://www.koreajoongangdaily.com/business/big-tax-shock-for-investors-in-foreign-stocks/11911611', edition: '2021' },
    { name: 'KPMG: Korea exit tax extended to overseas stocks from 2027', url: 'https://kpmg.com/xx/en/our-insights/gms-flash-alert/2026/flash-alert-2026-066.html', edition: '2026' },
    { name: 'PBL Legal: a guide to Korean inheritance law', url: 'https://pbl.legal/insights/international-estate-planning-a-guide-to-korean-inheritance-law/', edition: '2025' },
    {
      name: 'Korea JoongAng Daily: death tax set for overhaul, shifting focus to individual inheritance',
      url: 'https://www.koreajoongangdaily.com/business/death-tax-set-for-overhaul-shifting-focus-to-individual-inheritance/12393367',
      edition: '2025',
    },
    { name: 'IRS: estate and gift tax treaties', url: 'https://www.irs.gov/businesses/small-businesses-self-employed/estate-gift-tax-treaties-international' },
    { name: 'Korea Immigration Service: Immigrant Investor Scheme for Public Business (pre-2023 amounts)', url: 'https://www.moj.go.kr/immigration_eng/1853/subview.do' },
    { name: 'Segye Ilbo: investment immigration raised to KRW 1.5bn, retiree route abolished', url: 'https://www.segye.com/newsView/20230629519934', edition: '2023' },
    { name: 'NHIS: mandatory health insurance for foreigners staying over 6 months', url: 'https://www.nhis.or.kr/static/images/banner/longdesc/20190520_pop02longdesc_eng.html', edition: '2019' },
    { name: 'NHIS: contributions', url: 'https://www.nhis.or.kr/english/wbheaa02500m01.do', edition: '2026' },
    { name: 'Korea Times: service improvement at Severance (JCI, 2007)', url: 'https://www.koreatimes.co.kr/economy/20110828/service-improvement-at-severance' },
    {
      name: 'Time Out: Singapore, Japan and Malaysia among the most peaceful countries in 2026',
      url: 'https://www.timeout.com/asia/news/singapore-japan-and-malaysia-are-among-the-worlds-most-peaceful-countries-in-2026-062326',
      edition: '2026',
    },
    { name: 'TravelAdvisory.io: South Korea (US advisory)', url: 'https://www.traveladvisory.io/advisory/south-korea' },
    {
      name: 'Korea Times: number of foreigners in Korea hits record 2.73M',
      url: 'https://www.koreatimes.co.kr/southkorea/globalcommunity/20250727/no-of-foreigners-in-korea-hits-record-high-of-273-mil-in-june-data',
      edition: '2025',
    },
    { name: 'Kyunghyang Shinmun: registered foreign residents, Nov 2025', url: 'https://www.khan.co.kr/en/article/202512271143087', edition: '2025' },
    { name: 'Wikipedia: Seoul', url: 'https://en.wikipedia.org/wiki/Seoul' },
    { name: 'Wikipedia: Incheon International Airport', url: 'https://en.wikipedia.org/wiki/Incheon_International_Airport' },
    { name: 'HODU Atlas: opening a US brokerage account from Korea', url: 'https://hodu-atlas.pages.dev/blog/open-us-brokerage-account-korea/', edition: '2026' },
    { name: 'YourTaxBase: Charles Schwab for expats (country list, Oct 2026)', url: 'https://yourtaxbase.com/blog/charles-schwab-for-expats' },
  ],
}

export default profile
