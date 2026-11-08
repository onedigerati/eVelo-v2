import type { ExpatProfile } from '../expatPicks'

const profile: ExpatProfile = {
  tagline: 'Very safe harbour city with a real, but costly, retiree visa',
  summary:
    'New Zealand is 2nd of 163 in the 2026 Global Peace Index and has no wealth, inheritance or gift tax and no general capital gains tax, and Auckland adds a harbour, beaches, islands and volcanic hills on its doorstep, with no language barrier. Unlike Australia, it has a retirement visa a portfolio can meet, but a costly one: from 66, NZD 750,000 invested in New Zealand plus NZD 500,000 to live on, renewed every 2 years and never leading to residence. For buy-borrow-die the bigger catch is tax: after a 4-year exemption, US shares and funds are taxed every year on a deemed 5% return at up to 39%, unless a US citizen who arrived from April 2024 opts into the newer method that taxes dividends and 70% of realised gains.',
  scores: { cost: 2, healthcare: 4, safety: 5, visa: 3, climate: 4, community: 4, tax: 2, estate: 5, lending: 3 },
  facts: {
    healthcare:
      'Auckland City Hospital is New Zealand\'s largest public hospital, with private surgery at Southern Cross hospitals; public care is free to resident-visa holders (Parent Retirement residents included), while a Temporary Retirement Visitor is not eligible and must hold health insurance for the whole stay, and international plans often stop taking new members around 65–70.',
    safety:
      'New Zealand is 2nd of 163 in the 2026 Global Peace Index; violent crime is low, and the natural hazards are storms and floods (record flash floods hit Auckland in January 2023).',
    visa: 'Temporary Retirement Visitor Visa from age 66: NZD 750,000 in acceptable New Zealand investments for 2 years, plus NZD 500,000 to live on, NZD 60,000 a year of income and health insurance; it gives 2 years at a time and can be renewed, but never leads to residence; the Parent Retirement Resident Visa (NZD 1M invested for 4 years, same funds and income) needs an adult child who is a New Zealand citizen or resident, and Active Investor Plus residence needs NZD 5M (Growth, 3 years) or NZD 10M (Balanced, 5 years).',
    tax: 'No wealth tax and no general capital gains tax; new residents get a once-only, roughly 4-year transitional exemption on most foreign income, dividends, interest and FIF income included; after it, foreign shares and ETFs costing over NZD 50,000 fall under the FIF rules, usually taxed on a deemed 5% of opening market value (fair dividend rate) at up to 39%, or on the actual return in a weaker year, whether or not anything is sold, which works like a yearly charge of up to about 2% of the portfolio; a US citizen who became resident on or after 1 April 2024, after at least 5 years abroad and once out of the transitional exemption, can instead opt into the revenue account method (enacted March 2026), taxing dividends and 70% of realised gains at marginal rates (check the exit rules on leaving).',
    estate:
      'No inheritance or estate tax (estate duty ended in 1992) and no gift duty since October 2011, so US assets left to US-resident children pay nothing in New Zealand; there is no US–New Zealand estate tax treaty, and the $15M US exemption (2026) applies as anywhere.',
    lending:
      'IBKR reportedly accepts New Zealand residents on IBKR Pro, margin included, while Schwab International\'s online application reportedly does not (Oct 2026); margin terms by country of residence are unconfirmed, and Fidelity and Vanguard open no accounts for residents abroad.',
    climate:
      'Mild, humid and changeable oceanic climate: warm summers (February highs about 24 °C / 76 °F) and mild, wet winters (July highs about 15 °C / 58 °F), with about 1,100 mm of rain spread through the year and frequent wind.',
    community:
      'English-speaking, with about 43% of Auckland\'s people born overseas and about 32,000 US-born residents across New Zealand (2023 census); the foreign retiree community is small, since retiree visas are costly, but nothing in daily life needs another language.',
    access:
      'Air New Zealand flies nonstop to Los Angeles, San Francisco, Houston, New York–JFK and Honolulu, with United to San Francisco, Qantas to New York–JFK, and American and Delta seasonally to Dallas–Fort Worth and Los Angeles; the flight to the West Coast takes about 12–13 hours.',
  },
  drawbacks: [
    'The retiree visa needs NZD 1.25M in New Zealand plus NZD 60,000 a year, renews every 2 years and never leads to residence',
    'After 4 exempt years, US shares and funds are taxed on a deemed 5% return each year at up to 39%',
    'Expensive housing, a long way from the US, and no Schwab International access',
  ],
  sources: [
    { name: 'Immigration New Zealand: Temporary Retirement Visitor Visa', url: 'https://www.immigration.govt.nz/visas/temporary-retirement-visitor-visa/' },
    { name: 'Immigration New Zealand: Parent Retirement Resident Visa', url: 'https://www.immigration.govt.nz/visas/parent-retirement-resident-visa/' },
    { name: 'Immigration New Zealand: Active Investor Plus visa overview', url: 'https://www.immigration.govt.nz/about-us/news-centre/investor-category' },
    { name: 'PwC: New Zealand, residence', url: 'https://taxsummaries.pwc.com/new-zealand/individual/residence', edition: '2026' },
    { name: 'PwC: New Zealand, income determination', url: 'https://taxsummaries.pwc.com/new-zealand/individual/income-determination', edition: '2026' },
    { name: 'PwC: New Zealand, taxes on personal income', url: 'https://taxsummaries.pwc.com/new-zealand/individual/taxes-on-personal-income', edition: '2026' },
    { name: 'Inland Revenue: temporary tax exemption (transitional residents)', url: 'https://www.ird.govt.nz/topics/tax-residency/temporary-tax-exemption' },
    { name: 'Become: the FIF rules, a plain-English guide (Oct 2026)', url: 'https://www.become.nz/articles/fif-rules-nz-overseas-investment-tax-guide', edition: '2026' },
    {
      name: 'Deloitte: a small step, the revenue account method enacted',
      url: 'https://www.deloitte.com/nz/en/services/tax/perspectives/a-small-step-the-revenue-account-method-enacted.html',
      edition: '2026',
    },
    {
      name: 'Inland Revenue: gift duty abolition',
      url: 'https://www.taxtechnical.ird.govt.nz/new-legislation/act-articles/taxation-tax-administration-and-remedial-matters-act-2011/gift-duty-abolition',
    },
    { name: 'IRS: estate and gift tax treaties', url: 'https://www.irs.gov/businesses/small-businesses-self-employed/estate-gift-tax-treaties-international' },
    {
      name: 'Ministry of Health: guide to eligibility for publicly funded health services',
      url: 'https://www.health.govt.nz/new-zealand-health-system/eligibility-publicly-funded-health-services/guide-eligibility-publicly-funded-health-services',
    },
    { name: 'YourTaxBase: Charles Schwab for expats (country list, Oct 2026)', url: 'https://yourtaxbase.com/blog/charles-schwab-for-expats' },
    { name: 'MoneyBalance: Interactive Brokers NZ review (Oct 2026)', url: 'https://moneybalance.co.nz/investing/platforms/interactive-brokers-nz-review/', edition: '2026' },
    {
      name: 'Vision of Humanity: the 10 most peaceful countries in 2026',
      url: 'https://www.visionofhumanity.org/why-iceland-stretched-its-lead-among-the-worlds-10-most-peaceful-countries-in-2026/',
      edition: '2026',
    },
    { name: 'Wikipedia: Auckland', url: 'https://en.wikipedia.org/wiki/Auckland' },
    { name: 'Wikipedia: Auckland City Hospital', url: 'https://en.wikipedia.org/wiki/Auckland_City_Hospital' },
    { name: 'Wikipedia: 2023 Auckland Anniversary Weekend floods', url: 'https://en.wikipedia.org/wiki/2023_Auckland_Anniversary_Weekend_floods' },
    { name: 'Stats NZ: 2023 Census, Auckland region infographic', url: 'https://www.stats.govt.nz/assets/2023-Census/Detailed-regional-infographics/English-copy-of-Detailed-infographic-about-the-Auckland-region.pdf', edition: '2023' },
    { name: 'Wikipedia: American New Zealanders', url: 'https://en.wikipedia.org/wiki/American_New_Zealanders' },
    { name: 'Wikipedia: Auckland Airport', url: 'https://en.wikipedia.org/wiki/Auckland_Airport' },
  ],
}

export default profile
