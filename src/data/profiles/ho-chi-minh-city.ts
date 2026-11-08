import type { ExpatProfile } from '../expatPicks'

const profile: ExpatProfile = {
  tagline: 'Big, cheap metropolis with JCI hospitals, but no retiree visa',
  summary:
    'Ho Chi Minh City offers very low costs, two JCI-accredited hospitals (FV and Vinmec Central Park), Vietnam\'s largest foreign community and its only US nonstop, on light BBD taxes: no wealth or estate tax and 5% on dividends. For a retiree it is a base for long visits, not a home: Vietnam has no retirement or passive-income visa, so staying means back-to-back 90-day e-visas with no residence card.',
  scores: { cost: 5, healthcare: 4, safety: 4, visa: 1, climate: 3, community: 4, tax: 4, estate: 4, lending: 3 },
  facts: {
    healthcare:
      'FV Hospital (JCI-accredited for a fourth consecutive cycle in 2025) and Vinmec Central Park (JCI) lead a deep private sector at well below US prices; plan on private or international insurance, since public-insurance access for foreigners was not confirmed.',
    safety:
      'Vietnam is 41st of 163 in the 2026 Global Peace Index; violent crime against foreigners is rare, but the UK warns that bag-snatching from passing motorbikes is common and that road safety is poor.',
    visa: 'No retirement or passive-income visa: US citizens use the 90-day e-visa (USD 25 single, USD 50 multiple entry), which cannot be extended without a Vietnamese sponsor and leads to no residence card, so long stays mean leaving and reapplying (secondary sources); a temporary residence card needs work, marriage to a Vietnamese citizen or an active business investment of VND 3bn or more (about $115k), which gives a card of up to 3 years, not a portfolio.',
    tax: 'No wealth tax; a resident (183+ days in a year, or a rented home on a fixed-term lease) is taxed on worldwide income, and the new Personal Income Tax Law (Law 109/2025/QH15, in force 1 Jul 2026) keeps 5% on dividends and interest (bank-deposit interest exempt) and 0.1% of the price on securities sales, though gains on US-listed shares might instead be taxed as other capital transfers, at 20% of the gain (Art. 13(1)); there is no US income tax treaty.',
    estate:
      'No estate tax: inheritances above VND 20m are taxed as income of the recipient at 10%, covering inherited securities (US brokerage holdings included), business stakes, real estate and registered assets, but US-resident heirs receiving US assets are likely outside it (inferred, not confirmed); there is no US estate treaty, and the $15M US exemption (2026) applies as anywhere.',
    lending:
      'IBKR reportedly accepts residents of almost every country outside sanctions lists, while Schwab One International reportedly does not accept Vietnam residents (Oct 2026); margin terms by country of residence are unreported, and Fidelity and Vanguard open no accounts for residents abroad.',
    climate:
      'Tropical savanna: hot all year (about 28 °C on average, April highs about 34.5 °C), a May–November rainy season with about 1,800–1,970 mm of rain, and street flooding from downpours and tides; the Saigon River set record high tides in Nov 2025.',
    community:
      'The largest foreign community in Vietnam, put at more than 200,000 foreigners living and working in the city by consulates (2021); Vietnam was 5th of 46 in the 2025 edition of InterNations\' Expat Insider, first for personal finance.',
    access:
      'Vietnam Airlines reportedly flies to San Francisco nonstop, and United serves Los Angeles via Hong Kong; otherwise connect through an Asian hub; Metro Line 1 (opened Dec 2024) runs 19.7 km from Bến Thành to the eastern suburbs.',
  },
  drawbacks: [
    'No residence route for a retiree: life on repeated 90-day e-visas',
    'Heat all year, rainy-season and tidal street flooding, and heavy motorbike traffic',
    'Worldwide income tax for residents, no US tax treaty and unclear treatment of gains on US shares',
  ],
  sources: [
    { name: 'PwC: Vietnam, taxes on personal income', url: 'https://taxsummaries.pwc.com/vietnam/individual/taxes-on-personal-income', edition: '2026' },
    { name: 'PwC: Vietnam, residence', url: 'https://taxsummaries.pwc.com/vietnam/individual/residence' },
    { name: 'PwC: Vietnam, other taxes', url: 'https://taxsummaries.pwc.com/vietnam/individual/other-taxes' },
    { name: 'PwC: Vietnam, income determination', url: 'https://taxsummaries.pwc.com/vietnam/individual/income-determination' },
    { name: 'Law on Personal Income Tax No. 109/2025/QH15 (English translation)', url: 'https://lawfirm.vn/wp-content/uploads/2026/01/109_2025_QH15_687756.doc', edition: '2025' },
    { name: 'PwC: Vietnam, significant developments', url: 'https://taxsummaries.pwc.com/vietnam/individual/significant-developments', edition: '2026' },
    { name: 'IRS: United States income tax treaties, A to Z', url: 'https://www.irs.gov/businesses/international-businesses/united-states-income-tax-treaties-a-to-z' },
    { name: 'GetWhereNext: Vietnam retirement visa, the honest truth', url: 'https://getwherenext.com/blog/vietnam-retirement-visa-2026-honest-truth', edition: '2026' },
    { name: 'Emerhub: how to retire in Vietnam as a foreign expat', url: 'https://emerhub.com/vietnam/how-to-retire-in-vietnam-as-a-foreign-expat/', edition: '2026' },
    {
      name: 'FV Hospital: fourth consecutive JCI accreditation',
      url: 'https://www.fvhospital.com/en/fv-hospital-achieves-fourth-consecutive-jci-accreditation-reaffirming-commitment-to-international-standard-care-at-only-50-of-the-cost-compared-to-leading-hospitals-in-the-region/',
      edition: '2025',
    },
    { name: 'Vinmec: medical tourism and accreditations', url: 'https://www.vinmec.com/eng/medical-tourism/' },
    {
      name: 'Viet Nam News: Viet Nam 41st in the 2026 Global Peace Index',
      url: 'https://vietnamnews.vn/society/1783735/viet-nam-recognised-as-highly-peaceful-in-2026-global-index.html',
      edition: '2026',
    },
    { name: 'GOV.UK: Vietnam travel advice, safety and security', url: 'https://www.gov.uk/foreign-travel-advice/vietnam/safety-and-security' },
    { name: 'Vietnam Law Magazine: HCM City to vaccinate foreigners (foreign residents)', url: 'https://vietnamlawmagazine.vn/hcm-city-to-vaccinate-foreigners-against-covid-19-37906.html', edition: '2021' },
    {
      name: 'Asia News Network: Vietnam fifth in Expat Insider 2025',
      url: 'https://asianews.network/vietnam-ranks-fifth-among-best-countries-for-expats-in-2025/',
      edition: '2025',
    },
    {
      name: 'VnExpress: a year under water, record floods sweep Vietnam in 2025',
      url: 'https://e.vnexpress.net/news/news/environment/a-year-under-water-record-floods-sweep-vietnam-from-megacities-to-tourist-hubs-in-2025-4998103.html',
      edition: '2025',
    },
    { name: 'Wikipedia: Ho Chi Minh City', url: 'https://en.wikipedia.org/wiki/Ho_Chi_Minh_City' },
    { name: 'Wikipedia: Tan Son Nhat International Airport', url: 'https://en.wikipedia.org/wiki/Tan_Son_Nhat_International_Airport' },
    { name: 'Wikipedia: Ho Chi Minh City Metro', url: 'https://en.wikipedia.org/wiki/Ho_Chi_Minh_City_Metro' },
    { name: 'YourTaxBase: best brokerage for US expats', url: 'https://yourtaxbase.com/blog/best-brokerage-for-us-expats' },
    { name: 'YourTaxBase: Charles Schwab for expats (country list, Oct 2026)', url: 'https://yourtaxbase.com/blog/charles-schwab-for-expats' },
  ],
}

export default profile
