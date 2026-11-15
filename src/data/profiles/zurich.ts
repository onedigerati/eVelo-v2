import type { ExpatProfile } from '../expatPicks'

const profile: ExpatProfile = {
  tagline: 'Safe, superb and very expensive, with a yearly wealth tax',
  summary:
    'Zurich is one of the safest and best-run cities anywhere (Switzerland is 3rd in the 2026 Global Peace Index), with excellent hospitals, a lake and the Alps close by, and children inherit free of Zurich inheritance tax. For buy-borrow-die it works against you while you live: the canton taxes worldwide net wealth every year from about CHF 81k, dividends are taxed as income at up to about 39% in the city, Zurich abolished lump-sum taxation from 2010, and the retiree permit is discretionary and needs ties to Switzerland.',
  scores: { cost: 1, healthcare: 5, safety: 5, visa: 2, climate: 3, community: 3, tax: 1, estate: 5, lending: 3 },
  facts: {
    healthcare:
      'Excellent care, led by the University Hospital Zurich (about 900 beds); basic health insurance (KVG) is compulsory within 3 months of registering, and insurers must accept every resident regardless of age or health, but adult premiums in the city run about CHF 640/month (2026 median, CHF 300 deductible) and rise each year.',
    safety:
      'Switzerland is 3rd of 163 in the 2026 Global Peace Index; violent and street crime are low by any standard, and petty theft in crowded places is the usual risk.',
    visa: 'No passive-income visa: non-EU retirees can get a discretionary B permit under Art. 28 of the Foreign Nationals Act at 55+, with special personal ties to Switzerland (such as past long stays; relatives alone are not enough), means that make social assistance virtually impossible, health insurance and no work anywhere; cantons may add requirements, and permits are often renewed every 1–2 years at first (secondary source).',
    tax: 'Worldwide net wealth tax (debts deductible): Zurich\'s basic scale is 0% to CHF 81k (CHF 161k married), then 0.05% rising to 0.3% above about CHF 3.3M, multiplied by the canton (0.95) and the City of Zurich (1.19), so about 0.64% at the top; dividends and interest are taxed as ordinary income, up to about 39% in the city (federal 11.5% plus canton and commune); Zurich abolished cantonal lump-sum (expenditure) taxation from 2010.',
    estate:
      'Zurich exempts spouses and direct descendants from its inheritance and gift tax (others pay progressive rates); Switzerland has no federal inheritance tax, and voters rejected a 50% federal tax on estates over CHF 50M by 78% in November 2025; the US–Switzerland estate treaty exists, and the $15M US exemption (2026) applies as anywhere.',
    lending:
      'IBKR reportedly serves Swiss residents (reportedly through its US or UK entity, not its EU one), and Schwab One International\'s online form reportedly accepted Switzerland in Oct 2026, but Schwab reportedly bars Europe residents from taking cash out through margin, which likely covers Switzerland although it is outside the EU, and whether IBKR lets Swiss residents withdraw a margin loan as cash is unconfirmed (2024 forum reports conflict), so confirm how you would draw cash before relying on either; Fidelity and Vanguard reportedly open no new accounts for residents abroad.',
    climate:
      'Temperate with cold, grey winters: July highs about 24°C, January highs about 4°C with lows just below freezing, and about 1,100 mm of rain or snow over some 130 days a year.',
    community:
      'Foreign citizens are 34% of Zurich\'s 441,000 residents (mostly German, Italian, Spanish, Portuguese and French), 14% speak English and 40% use it at work, but expats are mostly working professionals, retirees are few, and daily life runs in Swiss German.',
    access:
      'Zurich Airport (ZRH) is about 10 km north of the city, about 10–15 minutes by train; trains run across Switzerland and to Milan, Munich and Paris.',
  },
  drawbacks: [
    'Yearly wealth tax on the worldwide portfolio from about CHF 81k, and dividends taxed as income',
    'Retiree permit only at 55+ with close ties to Switzerland, and at cantonal discretion',
    'Among the costliest cities in the world, with compulsory health premiums of about CHF 640/month',
  ],
  sources: [
    { name: 'PwC: Switzerland, other taxes', url: 'https://taxsummaries.pwc.com/switzerland/individual/other-taxes', edition: '2026' },
    { name: 'PwC: Switzerland, taxes on personal income', url: 'https://taxsummaries.pwc.com/switzerland/individual/taxes-on-personal-income', edition: '2026' },
    { name: 'Swissinfo: lump-sum taxation comes under the spotlight', url: 'https://www.swissinfo.ch/eng/lump-sum-taxation-comes-under-the-spotlight/29158706' },
    { name: 'Neho: inheritance tax in the canton of Zurich', url: 'https://neho.ch/de/blog/erbschaftssteuer-zurich' },
    {
      name: 'Blue News: Juso inheritance tax initiative rejected with 78.3% no',
      url: 'https://www.bluewin.ch/en/news/switzerland/juso-inheritance-tax-initiative-rejected-with-783-percent-no-vote-2987118.html',
      edition: '2025',
    },
    { name: 'IRS: estate and gift tax treaties', url: 'https://www.irs.gov/businesses/small-businesses-self-employed/estate-gift-tax-treaties-international' },
    {
      name: 'Richmond Chambers: Swiss retirement residence permit',
      url: 'https://www.richmondchambers.ch/swiss-residence-permit/swiss-retirement-residence-permit',
    },
    { name: 'Expat Savvy: health insurance in Zurich (2026–27 premiums)', url: 'https://expat-savvy.ch/health-insurance/zurich/', edition: '2026' },
    { name: 'University Hospital Zurich (USZ)', url: 'https://www.usz.ch/en/' },
    {
      name: 'Federal Office of Public Health: compulsory health insurance for residents',
      url: 'https://www.bag.admin.ch/de/krankenversicherung-versicherungspflicht-fuer-in-der-schweiz-wohnhafte-versicherte',
    },
    { name: 'Canton of Zurich: lump-sum taxation abolished from 1 January 2010 (media release)', url: 'https://www.zh.ch/de/news-uebersicht/medienmitteilungen/2011/01/004.html' },
    { name: 'IamExpat: Switzerland third in the Global Peace Index 2026', url: 'https://www.iamexpat.ch/lifestyle/lifestyle-news/switzerland-global-peace-index', edition: '2026' },
    { name: 'YourTaxBase: Charles Schwab for expats (country list, Oct 2026)', url: 'https://yourtaxbase.com/blog/charles-schwab-for-expats' },
    { name: 'YourTaxBase: best brokerage for US expats (Fidelity, Vanguard)', url: 'https://yourtaxbase.com/blog/best-brokerage-for-us-expats', edition: '2026' },
    { name: 'Banker on Wheels: Interactive Brokers review (entities by country)', url: 'https://www.bankeronwheels.com/interactive-brokers-review/', edition: '2026' },
    { name: 'Mustachian Post forum: using a margin loan at Interactive Brokers', url: 'https://forum.mustachianpost.com/t/using-margin-loan-at-interactive-brokers/3980?page=13' },
    { name: 'Wikipedia: Zurich (climate, demographics)', url: 'https://en.wikipedia.org/wiki/Zurich' },
    { name: 'Wikipedia: Zurich Airport', url: 'https://en.wikipedia.org/wiki/Zurich_Airport' },
  ],
}

export default profile
