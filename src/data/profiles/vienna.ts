import type { ExpatProfile } from '../expatPicks'

const profile: ExpatProfile = {
  tagline: 'Safe, orderly capital where a US ETF portfolio is taxed every year',
  summary:
    'Vienna has first-rate hospitals, Austria is 6th in the 2026 Global Peace Index, and there is no wealth, inheritance or gift tax, plus a US estate treaty. It ranks last of the 75 because Austria taxes funds that do not report to its reporting agent, the OeKB (likely including US ETFs), every year on 90% of their growth, so a never-sell ETF portfolio pays Austrian tax anyway, on top of 27.5% on dividends; eVelo\'s odds do not model that yearly charge. The borrow step is weak too: Schwab and IBKR both reportedly bar EU residents from drawing margin as cash.',
  scores: { cost: 1, healthcare: 5, safety: 5, visa: 3, climate: 2, community: 4, tax: 1, estate: 5, lending: 2 },
  facts: {
    healthcare:
      'Once resident, you can join the public ÖGK self-insurance at €565.25/month (2026), with benefits after a 6-month wait; the settlement permit first needs private all-risk cover (Cigna Global has no entry-age cap), and Vienna\'s hospitals, led by the AKH university hospital, are generally regarded as excellent.',
    safety:
      'Austria is 6th in the 2026 Global Peace Index; UK travel advice says crime levels are generally low, with pickpocketing in city centres, and that terrorists are likely to try to carry out attacks (citing Vienna 2020 and Villach 2025).',
    visa: 'Settlement permit with no right to work (Niederlassungsbewilligung – ausgenommen Erwerbstätigkeit): regular net income of €2,616.78/month single or €4,128.24 for a couple (2026) from pensions or sufficient personal assets, all-risk health insurance, housing, German proof with the first application and a quota place; apply at an Austrian embassy before entry, and it is renewed yearly.',
    tax: 'No wealth tax, but Austria taxes funds that do not report their tax figures to its reporting agent (OeKB), which likely include US-domiciled ETFs such as VTI or VOO, every year on a deemed distribution of 90% of their growth (at least 10% of year-end value) at 27.5%, so a never-sell ETF portfolio pays tax each year anyway; eVelo\'s odds do not model this; ordinary individual US stocks are not caught (US REITs and BDCs reportedly are), dividends and bond interest on a foreign account pay 27.5% (bank-deposit interest 25%), and margin interest gives no deduction.',
    estate:
      'No inheritance, estate or gift tax (only a transfer tax on Austrian real estate), so a US portfolio passes to US-resident children with no Austrian tax; a US–Austria estate and gift tax treaty exists but is mostly moot, and the $15M US exemption (2026) applies as anywhere.',
    lending:
      'IBKR reportedly serves Austria residents (likely through its EU entity), with margin terms per country unknown, and Schwab International reportedly accepts them too (Austria is on its reported list, Oct 2026), but Schwab reportedly bars Europe residents from taking cash out through margin, and IBKR\'s EU entity reportedly lends on margin only to buy securities, not to withdraw as cash, so confirm how you would draw cash before relying on either; EU PRIIPs rules reportedly block new buys of US-listed ETFs, not holding them.',
    climate: 'Continental: July highs about 27°C with heatwaves above 35°C, January highs about 4°C with lows near freezing and grey skies, and about 600–670 mm of rain a year.',
    community:
      'A city of about 2 million, where about 740,000 residents were first-generation migrants in 2023, home to UN, OPEC and OSCE offices and a large international community; English is widely spoken, but the permit, paperwork and daily life run in German.',
    access: 'Vienna International (VIE) is about 18 km south-east of the centre, about 16 minutes on the City Airport Train; trains run to Bratislava, Budapest, Prague and Munich.',
  },
  drawbacks: [
    'Yearly Austrian tax on the growth of non-reporting funds (likely US ETFs), on top of 27.5% on dividends',
    'Very high costs, and a permit that needs German and a quota place',
    'Cold, grey winters',
  ],
  sources: [
    { name: 'PwC: Austria, income determination', url: 'https://taxsummaries.pwc.com/austria/individual/income-determination' },
    { name: 'PwC: Austria, other taxes', url: 'https://taxsummaries.pwc.com/austria/individual/other-taxes' },
    { name: 'Broker-Test.at: lump-sum taxation of non-reporting funds', url: 'https://www.broker-test.at/news/nichtmeldefonds-pauschale-besteuerung/', edition: '2025' },
    { name: 'Broker-Test.at: tax on REITs and other non-reporting funds', url: 'https://www.broker-test.at/news/steuern-auf-reits-und-anderen-nicht-meldefonds/' },
    { name: 'Income Tax Act (EStG) § 20: non-deductible expenses', url: 'https://www.jusline.at/gesetz/estg/paragraf/20' },
    { name: 'IRS: estate and gift tax treaties', url: 'https://www.irs.gov/businesses/small-businesses-self-employed/estate-gift-tax-treaties-international' },
    {
      name: 'oesterreich.gv.at: settlement permit, gainful employment excepted',
      url: 'https://www.oesterreich.gv.at/de/themen/menschen_aus_anderen_staaten/aufenthalt/3/2/Seite.120302',
      edition: '2026',
    },
    {
      name: 'oesterreich.gv.at: self-insurance in health insurance',
      url: 'https://www.oesterreich.gv.at/de/themen/gesundheit/selbstversicherung_in_der_krankenversicherung',
      edition: '2026',
    },
    { name: 'Cigna Global: international health plans', url: 'https://cignaglobal.com/international-health-plans' },
    {
      name: 'Advantage Austria: AKH and MedUni Vienna in the 2026 hospital ranking',
      url: 'https://www.advantageaustria.org/lr/zentral/news/akh-meduni-wien-hospital-ranking-2026.de.html',
      edition: '2026',
    },
    { name: 'LYNX: withdrawals from accounts carried by Interactive Brokers', url: 'https://www.lynxbroker.com/service/payments-and-transfers/withdrawal/' },
    { name: 'GOV.UK: Austria travel advice, safety and security', url: 'https://www.gov.uk/foreign-travel-advice/austria/safety-and-security' },
    { name: 'Frankfurt Flyer: Austrian Airlines North America winter 2025/26', url: 'https://frankfurtflyer.de/?p=184875' },
    { name: 'Wikipedia: Vienna (climate, population)', url: 'https://en.wikipedia.org/wiki/Vienna' },
    { name: 'YourTaxBase: Charles Schwab for expats', url: 'https://yourtaxbase.com/blog/charles-schwab-for-expats', edition: '2026' },
    { name: 'Money.it: GPI 2026 top 50', url: 'https://www.money.it/50-paesi-piu-sicuri-al-mondo-nel-2026', edition: '2026' },
  ],
}

export default profile
