import type { ExpatProfile } from '../expatPicks'

const profile: ExpatProfile = {
  tagline: 'Historic capital with JCI care, poor air and no retiree visa',
  summary:
    'Hanoi pairs a thousand-year-old capital\'s lakes, temples and street food with very low costs and a JCI-accredited hospital (Vinmec Times City), on Vietnam\'s light BBD taxes: no wealth or estate tax and 5% on dividends. Against it: Vietnam has no retirement or passive-income visa, so staying means back-to-back 90-day e-visas, and the air is among the worst of any capital, with PM2.5 averaging about nine times the WHO guideline in 2025.',
  scores: { cost: 5, healthcare: 4, safety: 4, visa: 1, climate: 2, community: 3, tax: 4, estate: 4, lending: 3 },
  facts: {
    healthcare:
      'Vinmec Times City is JCI-accredited, one of two Vinmec hospitals with it, and the city has other large private and public hospitals at well below US prices; plan on private or international insurance, since public-insurance access for foreigners was not confirmed.',
    safety:
      'Vietnam is 41st of 163 in the 2026 Global Peace Index; violent crime against foreigners is rare, but the UK warns that bag-snatching from passing motorbikes is common and that road safety is poor.',
    visa: 'No retirement or passive-income visa: US citizens use the 90-day e-visa (USD 25 single, USD 50 multiple entry), which cannot be extended without a Vietnamese sponsor and leads to no residence card, so long stays mean leaving and reapplying (secondary sources); a temporary residence card needs work, marriage to a Vietnamese citizen or an active business investment of VND 3bn or more (about $115k), which gives a card of up to 3 years, not a portfolio.',
    tax: 'No wealth tax; a resident (183+ days in a year, or a rented home on a fixed-term lease) is taxed on worldwide income, and the new Personal Income Tax Law (Law 109/2025/QH15, in force 1 Jul 2026) keeps 5% on dividends and interest (bank-deposit interest exempt) and 0.1% of the price on securities sales, though gains on US-listed shares might instead be taxed as other capital transfers, at 20% of the gain (Art. 13(1)); there is no US income tax treaty.',
    estate:
      'No estate tax: inheritances above VND 20m are taxed as income of the recipient at 10%, covering inherited securities (US brokerage holdings included), business stakes, real estate and registered assets, but US-resident heirs receiving US assets are likely outside it (inferred, not confirmed); there is no US estate treaty, and the $15M US exemption (2026) applies as anywhere.',
    lending:
      'IBKR reportedly accepts residents of almost every country outside sanctions lists, while Schwab One International reportedly does not accept Vietnam residents (Oct 2026); margin terms by country of residence are unreported, and Fidelity and Vanguard open no accounts for residents abroad.',
    climate:
      'Humid subtropical with four seasons: hot, wet summers (July highs about 34 °C), cool, dry winters (January highs about 20 °C) and about 1,600 mm of rain, mostly May–October; PM2.5 averaged 45.9 µg/m³ in 2025, 9.1 times the WHO guideline (IQAir), and record downpours flooded the streets several times that year.',
    community:
      'A smaller foreign community than Ho Chi Minh City\'s (no headcount found), in a capital with 83 foreign embassies; Vietnam was 5th of 46 in the 2025 edition of InterNations\' Expat Insider, first for personal finance but 34th for quality of life.',
    access:
      'Nội Bài airport (HAN) has no US passenger nonstops; connect through an Asian hub or via Ho Chi Minh City; the elevated Cát Linh–Hà Đông metro line serves the west of the city.',
  },
  drawbacks: [
    'No residence route for a retiree: life on repeated 90-day e-visas',
    'Some of the worst air of any capital, about nine times the WHO guideline (2025)',
    'Hot, humid summers, damp winters and recurring street flooding',
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
    { name: 'Vinmec: medical tourism and accreditations', url: 'https://www.vinmec.com/eng/medical-tourism/' },
    {
      name: 'IQAir: Hanoi among the 10 most polluted cities in the world (Mar 2026)',
      url: 'https://www.iqair.cn/cn-en/newsroom/hanoi-among-top-10-most-polluted-cities-in-the-world-3-31-3026',
      edition: '2026',
    },
    {
      name: 'Viet Nam News: Viet Nam 41st in the 2026 Global Peace Index',
      url: 'https://vietnamnews.vn/society/1783735/viet-nam-recognised-as-highly-peaceful-in-2026-global-index.html',
      edition: '2026',
    },
    { name: 'GOV.UK: Vietnam travel advice, safety and security', url: 'https://www.gov.uk/foreign-travel-advice/vietnam/safety-and-security' },
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
    { name: 'Wikipedia: Hanoi', url: 'https://en.wikipedia.org/wiki/Hanoi' },
    { name: 'Wikipedia: Noi Bai International Airport', url: 'https://en.wikipedia.org/wiki/Noi_Bai_International_Airport' },
    { name: 'YourTaxBase: best brokerage for US expats', url: 'https://yourtaxbase.com/blog/best-brokerage-for-us-expats' },
    { name: 'YourTaxBase: Charles Schwab for expats (country list, Oct 2026)', url: 'https://yourtaxbase.com/blog/charles-schwab-for-expats' },
  ],
}

export default profile
