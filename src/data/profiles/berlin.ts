import type { ExpatProfile } from '../expatPicks'

const profile: ExpatProfile = {
  tagline: 'Big, green and cheaper than most capitals, with German taxes',
  summary:
    'Berlin is the cheapest of Western Europe\'s big capitals, with lakes and forests inside the city limits, world-class hospitals such as the Charité and a large English-speaking international crowd. For buy-borrow-die it is middling at best: there is no wealth tax and dividends pay a flat 26.375%, but after 10 years\' residence children pay 7–30% inheritance tax on the worldwide estate above €400k each, the residence permit for retirees is discretionary, and a newcomer at retirement age usually needs costly private health insurance.',
  scores: { cost: 2, healthcare: 4, safety: 4, visa: 3, climate: 2, community: 4, tax: 3, estate: 2, lending: 3 },
  facts: {
    healthcare:
      'Excellent hospitals, led by the Charité (Europe\'s largest university hospital) and Vivantes; a retiree arriving from abroad generally cannot join statutory insurance (it needs years of prior membership), so private cover matching statutory benefits plus long-term care insurance is the realistic route, and it is underwritten and costly at 65+.',
    safety:
      'Germany is 28th of 163 in the 2026 Global Peace Index; Berlin has more street crime than most German cities, with pickpocketing on transit and around a few hot spots such as Görlitzer Park and Kottbusser Tor.',
    visa: 'No dedicated retirement visa: retirees apply for a discretionary residence permit for "other purposes" (§7(1) AufenthG) with no fixed income threshold, showing pensions, savings or investments that cover living costs plus adequate health insurance; US citizens can apply in Germany within their 90 visa-free days, permits usually run a year at a time, and settlement is possible after 5 years with sufficient German (B1 in practice, waivable from age 60 in hardship cases) (law-firm sources).',
    tax: 'No wealth tax is levied; dividends, interest and capital gains pay a flat 25% plus the 5.5% solidarity surcharge (26.375%, plus church tax for members) after a €1,000 allowance (€2,000 for a couple), and Germany credits US tax on US dividends up to the treaty\'s 15% rate; there is no newcomer regime for retirees.',
    estate:
      'Inheritance tax reaches the worldwide estate when the person who dies lives in Germany: children pay 7–30% (the rate for the whole amount rises with its size) after a €400,000 allowance each; but under the US–Germany estate and gift tax treaty (1998 protocol) a US citizen who is not German and has lived in Germany 10 years or less is treated as US-domiciled, so Germany generally taxes only German-sited assets left to US-resident heirs until then; and the $15M US exemption (2026) applies as anywhere.',
    lending:
      'IBKR reportedly serves Germany residents (EU clients through its Irish entity), and Schwab International reportedly accepts them, but Schwab reportedly bars Europe residents from taking cash out through margin, so plan on IBKR margin; EU PRIIPs rules reportedly block new buys of US-listed ETFs, not holding them.',
    climate:
      'Continental: warm summers (July highs about 25 °C / 77 °F), long grey winters around freezing (January highs about 3 °C / 37 °F) with short days, and a fairly dry 570 mm of rain a year.',
    community:
      'One of Europe\'s largest international communities, with English widely spoken in central districts; offices and landlords mostly work in German, and the retiree share is small.',
    access:
      'BER has daily nonstops in summer 2026 to New York on United (Newark) and Delta; winter schedules are thinner (check before relying on them), and other US cities mean connecting via Frankfurt, Munich, Amsterdam or London.',
  },
  drawbacks: [
    'After 10 years\' residence, up to 30% inheritance tax on the worldwide estate above €400k per child',
    'Discretionary residence permit and expensive private health insurance for newcomers at retirement age',
    'Long, dark winters, slow bureaucracy, and only seasonal US nonstops',
  ],
  sources: [
    { name: 'PwC: Germany, other taxes', url: 'https://taxsummaries.pwc.com/germany/individual/other-taxes', edition: '2026' },
    { name: 'PwC: Germany, income determination', url: 'https://taxsummaries.pwc.com/germany/individual/income-determination', edition: '2026' },
    {
      name: 'Taxes for Expats: Germany inheritance tax for US expats and heirs',
      url: 'https://www.taxesforexpats.com/country-guides/germany/inheritance-tax-germany.html',
      edition: '2026',
    },
    {
      name: 'US Treasury: technical explanation of the 1998 US–Germany estate and gift tax protocol',
      url: 'https://home.treasury.gov/system/files/131/Treaty-Germany-Estate-Gift-Protocol-TE-12-14-1998.pdf',
    },
    { name: 'IRS: estate and gift tax treaties', url: 'https://www.irs.gov/businesses/small-businesses-self-employed/estate-gift-tax-treaties-international' },
    {
      name: 'Schlun & Elseven: retiree residence permits in Germany',
      url: 'https://se-legal.de/immigration-lawyer-germany/retiree-resident-permits-germany/?lang=en',
    },
    {
      name: 'VisaGuard Berlin: health insurance for a retirement residence permit',
      url: 'https://www.visaguard.berlin/en/post/retirement-visa-in-germany-which-health-insurance-should-you-choose',
    },
    {
      name: 'Schürmann Steuerberater: crediting US withholding tax',
      url: 'https://www.steuerberater-berlin-schuermann.de/steuernews_mandanten/dezember_2016/us_quellensteuern/',
    },
    { name: 'VisaRight: settlement permit (Niederlassungserlaubnis)', url: 'https://visaright.eu/blog/niederlassungserlaubnis' },
    { name: 'Money.it: GPI 2026 top 50', url: 'https://www.money.it/50-paesi-piu-sicuri-al-mondo-nel-2026', edition: '2026' },
    { name: 'YourTaxBase: Charles Schwab for expats (country list, Oct 2026)', url: 'https://yourtaxbase.com/blog/charles-schwab-for-expats' },
    { name: 'BER: summer 2026 flight schedule', url: 'https://ber.berlin-airport.de/en/news/2026-03-25-sommerflugplan-rw.html', edition: '2026' },
    { name: 'Wikipedia: Berlin', url: 'https://en.wikipedia.org/wiki/Berlin' },
  ],
}

export default profile
