import type { ExpatProfile } from '../expatPicks'

const profile: ExpatProfile = {
  tagline: 'Cheap beach city with a stormy autumn and no retiree visa',
  summary:
    'Da Nang has a long city beach, very low costs, an easy pace and Hội An (now part of the city) on its doorstep, on Vietnam\'s light BBD taxes: no wealth or estate tax and 5% on dividends. Against it: Vietnam has no retirement or passive-income visa, so staying means back-to-back 90-day e-visas; there is no JCI hospital in the city, and the September–December typhoon season brings floods (12 dead in late Oct 2025).',
  scores: { cost: 5, healthcare: 3, safety: 4, visa: 1, climate: 3, community: 3, tax: 4, estate: 4, lending: 3 },
  facts: {
    healthcare:
      'Vinmec Da Nang (a 4-star Global Hospital Rating, not JCI) and other private hospitals cover routine and much specialist care; complex cases often go to Ho Chi Minh City, Hanoi or Bangkok (secondary source), and plan on private or international insurance, since public-insurance access for foreigners was not confirmed.',
    safety:
      'Vietnam is 41st of 163 in the 2026 Global Peace Index; violent crime against foreigners is rare, but the UK warns that bag-snatching from passing motorbikes is common, road safety is poor and central Vietnam floods in October–November.',
    visa: 'No retirement or passive-income visa: US citizens use the 90-day e-visa (USD 25 single, USD 50 multiple entry), which cannot be extended without a Vietnamese sponsor and leads to no residence card, so long stays mean leaving and reapplying (secondary sources); a temporary residence card needs work, marriage to a Vietnamese citizen or an active business investment of VND 3bn or more (about $115k), which gives a card of up to 3 years, not a portfolio.',
    tax: 'No wealth tax; a resident (183+ days in a year, or a rented home on a fixed-term lease) is taxed on worldwide income, and the new Personal Income Tax Law (Law 109/2025/QH15, in force 1 Jul 2026) keeps 5% on dividends and interest (bank-deposit interest exempt) and 0.1% of the price on securities sales, though gains on US-listed shares might instead be taxed as other capital transfers, at 20% of the gain (Art. 13(1)); there is no US income tax treaty.',
    estate:
      'No estate tax: inheritances above VND 20m are taxed as income of the recipient at 10%, covering inherited securities (US brokerage holdings included), business stakes, real estate and registered assets, but US-resident heirs receiving US assets are likely outside it (inferred, not confirmed); there is no US estate treaty, and the $15M US exemption (2026) applies as anywhere.',
    lending:
      'IBKR reportedly accepts residents of almost every country outside sanctions lists, while Schwab One International reportedly does not accept Vietnam residents (Oct 2026); margin terms by country of residence are unreported, and Fidelity and Vanguard open no accounts for residents abroad.',
    climate:
      'Tropical monsoon: a dry season from January to August with hot summers (July highs about 34 °C) and mild winters (January highs about 25 °C), then a September–December wet and typhoon season with most of the 2,200 mm of yearly rain; floods from 27 Oct 2025 killed 12 and flooded about 76,500 homes in Da Nang.',
    community:
      'A growing scene of long-stay foreigners, remote workers and retirees, most on the 90-day e-visa (the city had 6.3 million international visitors in 2025); no headcount of foreign residents was found.',
    access:
      'Da Nang airport (DAD) has no US nonstops; it has direct flights to Seoul, Tokyo, Taipei, Hong Kong, Singapore and Bangkok for a one-stop trip.',
  },
  drawbacks: [
    'No residence route for a retiree: life on repeated 90-day e-visas',
    'Typhoons and floods from September to December',
    'No JCI hospital: complex care may mean Ho Chi Minh City or Bangkok',
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
      name: 'Viet Nam News: Viet Nam 41st in the 2026 Global Peace Index',
      url: 'https://vietnamnews.vn/society/1783735/viet-nam-recognised-as-highly-peaceful-in-2026-global-index.html',
      edition: '2026',
    },
    { name: 'GOV.UK: Vietnam travel advice, safety and security', url: 'https://www.gov.uk/foreign-travel-advice/vietnam/safety-and-security' },
    {
      name: 'Tuoi Tre: Da Nang downpours and floods take 12 lives',
      url: 'https://news.tuoitre.vn/print/da-nang-downpours-floods-take-12-lives-cause-over-29mn-in-damage-103251102151139392.htm',
      edition: '2025',
    },
    {
      name: 'Tuoi Tre: foreign long-stay visitors seen as clean FDI for Da Nang',
      url: 'https://news.tuoitre.vn/foreign-long-stay-visitors-seen-as-clean-fdi-for-da-nang-experts-103260121165609909.htm',
      edition: '2026',
    },
    { name: 'Wikipedia: Da Nang', url: 'https://en.wikipedia.org/wiki/Da_Nang' },
    { name: 'Wikipedia: Hội An (city)', url: 'https://en.wikipedia.org/wiki/H%E1%BB%99i_An_(city)' },
    { name: 'Wikipedia: Da Nang International Airport', url: 'https://en.wikipedia.org/wiki/Da_Nang_International_Airport' },
    { name: 'YourTaxBase: best brokerage for US expats', url: 'https://yourtaxbase.com/blog/best-brokerage-for-us-expats' },
    { name: 'YourTaxBase: Charles Schwab for expats (country list, Oct 2026)', url: 'https://yourtaxbase.com/blog/charles-schwab-for-expats' },
  ],
}

export default profile
