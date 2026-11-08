import type { ExpatProfile } from '../expatPicks'

const profile: ExpatProfile = {
  tagline: 'Spectacular and cheap, but crime and South Africa\'s taxes at death',
  summary:
    'Cape Town pairs mountains, ocean and wine country with a Mediterranean climate, very good private hospitals, English as an everyday language, low costs and US nonstops, and its retired person visa accepts income from a portfolio. For buy-borrow-die it is a poor fit: South Africa taxes residents on worldwide income, treats death as a sale (capital gains tax on gains made while resident, which defeats the US step-up), adds 20–25% estate duty on a worldwide estate and charges an exit tax on leaving, and violent crime is high.',
  scores: { cost: 4, healthcare: 4, safety: 2, visa: 4, climate: 4, community: 4, tax: 3, estate: 2, lending: 3 },
  facts: {
    healthcare:
      'Very good private care (UK advice: "a very high standard of private medical care") at hospitals such as Netcare Christiaan Barnard Memorial on the Foreshore, while public care varies; local medical schemes cannot refuse on age but add a late-joiner penalty of up to 75% of the contribution for someone with no prior South African cover, so a new 70-year-old pays roughly R17,500/month (about $1,000) for comprehensive cover (secondary source).',
    safety:
      'The US rates South Africa Level 2, "exercise increased caution", for crime, terrorism, unrest and kidnapping, and requires its staff to get permission for many townships around Cape Town; UK advice reports violent crime mostly in townships and informal settlements, attacks on the airport roads (use the M3 and N2, not the R300) and muggings of hikers in Table Mountain National Park.',
    visa: 'Retired person visa: at least R37,000/month (about $2,100) from a pension, annuity or retirement account, or from a net worth or combination of assets producing that income; up to 4 years and renewable, with permanent residence on the same income (s27(e)) or on R12M net worth plus a one-off R120,000 payment (financial independence, s27(f)).',
    tax: 'No wealth tax; residents are taxed on worldwide income: most foreign dividends at an effective 20%, foreign interest at marginal rates up to 45%, and 40% of capital gains included in income (at most 18%); the US treaty credit covers only the 15% US tax on dividends, so for someone in a 15% US bracket dividends cost about 5% more; leaving triggers an exit tax on worldwide assets (s9H, at most 18% on the gain).',
    estate:
      'Estate duty of 20% above an R3.5M abatement (25% above R30M) on an ordinarily resident decedent\'s worldwide estate, plus capital gains tax at death on gains made while resident (death is a deemed disposal); foreign assets owned before first becoming resident are deductible (s4(e)), but how that holds for a portfolio rebalanced over decades is unclear; the US–South Africa estate treaty gives credits only, so below the $15M US exemption (2026) the duty applies in full.',
    lending:
      'IBKR reportedly accepts South Africa residents (Oct 2026 review), while Schwab One International reportedly does not; margin by country of residence is unreported, and Fidelity and Vanguard open no accounts for residents abroad.',
    climate:
      'Mediterranean: dry, warm summers (January–February highs about 27°C) and mild, wet winters (July about 18°C by day, 7°C at night), about 500 mm of rain a year, and a strong south-easterly wind in spring and summer; a severe drought nearly ran the city dry in 2015–18.',
    community:
      'English is the first language of about 28% of Capetonians (with Afrikaans and Xhosa) and is widely used in business and daily life, so a newcomer manages in English; the size of the foreign retiree community is not well documented.',
    access:
      'United flies nonstop to Newark (year-round) and Washington Dulles, and Delta to Atlanta (some southbound flights stop in Johannesburg).',
  },
  drawbacks: [
    'High violent crime, including carjacking and attacks on the airport roads and mountain trails',
    'Capital gains tax at death and 20–25% estate duty on the worldwide estate',
    'Worldwide income tax while resident and an exit tax on leaving',
  ],
  sources: [
    { name: 'PwC: South Africa, other taxes', url: 'https://taxsummaries.pwc.com/south-africa/individual/other-taxes', edition: '2026' },
    { name: 'PwC: South Africa, income determination', url: 'https://taxsummaries.pwc.com/south-africa/individual/income-determination', edition: '2026' },
    { name: 'IRS: US–South Africa income tax treaty', url: 'https://www.irs.gov/pub/irs-trty/safrica.pdf' },
    {
      name: 'PKF: ceasing South African tax residency',
      url: 'https://pkf.co.za/news/2025/ceasing-south-african-tax-residency-key-tax-implications-for-emigrants/',
      edition: '2025',
    },
    {
      name: 'SAIT compendium: Estate Duty Act s4(e)',
      url: 'https://jutamedia2.blob.core.windows.net/jutacoza/uploads/SAIT_Compenduim_2016_Volume1/files/basic-html/page668.html',
    },
    { name: 'Capital Legacy: how much tax do you pay on a deceased estate', url: 'https://capitallegacy.co.za/faq/17/how-much-tax-do-you-pay-on-a-deceased-estate' },
    { name: 'IRS: estate and gift tax treaties', url: 'https://www.irs.gov/businesses/small-businesses-self-employed/estate-gift-tax-treaties-international' },
    {
      name: 'South African Embassy (Washington): retired persons visa, updated 2 Apr 2026',
      url: 'https://www.saembassy.org/wp-content/uploads/2026/04/Retired-Persons-Visa-updated-as-of-2-Apr-2026-1.pdf',
      edition: '2026',
    },
    { name: 'IBN Immigration: permanent residence on retirement or financial independence', url: 'https://www.ibn.co.za/south-africa/pr-retire-fi/', edition: '2026' },
    { name: 'GOV.UK: South Africa travel advice, health', url: 'https://www.gov.uk/foreign-travel-advice/south-africa/health' },
    { name: 'GOV.UK: South Africa travel advice, safety and security', url: 'https://www.gov.uk/foreign-travel-advice/south-africa/safety-and-security' },
    { name: 'TravelAdvisory.io: South Africa (US State Department level)', url: 'https://www.traveladvisory.io/advisory/south-africa', edition: '2026' },
    {
      name: 'Netcare: new Christiaan Barnard Memorial Hospital officially launched',
      url: 'https://www.netcare.co.za/NewsHub/Articles/new-netcare-christiaan-barnard-memorial-hospital-officially-launched',
    },
    {
      name: 'Discovery: late-joiner penalty (2025)',
      url: 'https://lahealth.co.za/wcm/discoverycoza/assets/medical-aid/benefit-information/2025/late-joiner-penalty.pdf',
    },
    {
      name: 'Medicalaid.com: Discovery Classic Comprehensive 2026',
      url: 'https://medicalaid.com/medical-aid/discovery-health/comprehensive-series/classic-comprehensive/',
    },
    { name: 'FX Scouts: Interactive Brokers review for South Africa', url: 'https://fxscouts.co.za/broker/interactivebrokers/' },
    { name: 'YourTaxBase: Charles Schwab for expats (country list, Oct 2026)', url: 'https://yourtaxbase.com/blog/charles-schwab-for-expats' },
    { name: 'Wikipedia: Cape Town (climate, languages)', url: 'https://en.wikipedia.org/wiki/Cape_Town' },
    { name: 'Wikipedia: Cape Town International Airport', url: 'https://en.wikipedia.org/wiki/Cape_Town_International_Airport' },
  ],
}

export default profile
