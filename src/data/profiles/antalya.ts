import type { ExpatProfile } from '../expatPicks'

const profile: ExpatProfile = {
  tagline: 'Low-cost Turkish Riviera with a 20-year foreign-income exemption',
  summary:
    'Turkey\'s Law 7582 (June 2026) exempts a new resident\'s foreign-source income for 20 years and cuts inheritance tax to 1% during that time, with no wealth tax. Antalya adds low costs, a long beach coast, an established foreign community and good private hospitals, against lira volatility and a US$200k property residence route.',
  scores: { cost: 4, healthcare: 4, safety: 3, visa: 3, climate: 3, community: 4, tax: 5, estate: 4, lending: 3 },
  facts: {
    healthcare:
      'Private hospitals such as Medical Park, Memorial and Anadolu serve international patients with English-speaking staff; after a year of residence foreigners can join the state GSS scheme at 24% of the minimum wage, but it excludes pre-existing conditions, so top-up private cover is advised.',
    safety:
      'Turkey is 136th in the 2026 Global Peace Index, a national rank; UK travel advice warns only against the area within 10 km of the Syrian border, far from Antalya, where the main risks are the usual resort-town petty crime.',
    visa: 'Short-term residence by owning property assessed at US$200k or more (bought since October 2023), renewable every 1–2 years while you own it; first applications are barred in 1,169 closed neighbourhoods in 15 provinces, including parts of Antalya, so check the DGMM list before buying; permanent residence after 8 years.',
    tax: 'No wealth tax (a residence tax applies only to Turkish homes worth over TRY 17.7m); under Law 7582, people resident from 2026 with no Turkish residence in the prior 3 years pay no income tax on foreign-source income for 20 years, if they get the exemption certificate in the first year; whether foreign capital gains are covered is not explicit.',
    estate:
      'Inheritance tax is normally 1–30%, cut to 1% during the 20-year new-resident exemption; sources differ on whether that keys off the decedent or the heir, and a foreign resident\'s US securities left to US heirs may be out of scope entirely; there is no US estate treaty.',
    lending:
      'IBKR reportedly accepts residents of all non-sanctioned countries, including Turkey, though margin terms per country are unknown; Schwab International reportedly does not accept Turkey; as a non-EU country, PRIIPs limits on US ETFs do not apply.',
    climate: 'Long, hot summers (July and August highs average about 35°C) and mild, wet winters: January highs about 15°C, with most of the 1,050 mm of yearly rain falling in winter.',
    community:
      'About 120,000 foreigners lived in the city in 2022, mainly in Konyaaltı and Lara, with long-standing Russian, Ukrainian, German and British communities and plenty of international shops and services.',
    access: 'Antalya airport is one of Turkey\'s busiest for international traffic, with many direct flights to Europe; there are no US nonstops, so connect through Istanbul or a European hub.',
  },
  drawbacks: [
    'Lira swings and high inflation make local costs unpredictable',
    'The property route needs US$200k, and some neighbourhoods are closed to first applications',
    'Hot summers, and the new tax regime is untested and must be claimed in year one',
  ],
  sources: [
    {
      name: 'EY: Türkiye introduces new personal tax regime (Law 7582)',
      url: 'https://www.ey.com/en_gl/technical/tax-alerts/turkiye-introduces-new-personal-tax-regime-including-foreign-income-exemption-inheritance-tax-relief-and-asset-repatriation-measure',
      edition: '2026',
    },
    { name: 'PwC: Turkey, other taxes', url: 'https://taxsummaries.pwc.com/turkey/individual/other-taxes' },
    { name: 'PwC: Turkey, income determination', url: 'https://taxsummaries.pwc.com/turkey/individual/income-determination' },
    {
      name: 'Legal 500: residence permit in Turkey by buying real estate',
      url: 'https://www.legal500.com/intelligence/turkey/real-estate-and-construction/residence-permit-in-turkey-by-buying-real-estate-%E2%80%93-legal-advice',
    },
    { name: 'Ikamet: health care services for foreigners in Turkey', url: 'https://ikamet.com/health-care-services-for-foreigners-in-turkey/' },
    { name: 'Rest Property: Antalya expat life 2026', url: 'https://restproperty.com/article-en/area-guide/antalya-expat-life-2026' },
    {
      name: 'CNBC-e: Türkiye rises to 136th in the Global Peace Index',
      url: 'https://www.cnbce.com/haberler/2-dunya-savasindan-sonra-bir-ilk-kuresel-baris-endeksinde-turkiye-detayi-dikkat-cekti-g31456',
      edition: '2026',
    },
    { name: 'GOV.UK: Turkey travel advice', url: 'https://www.gov.uk/foreign-travel-advice/turkey' },
    { name: 'Wikipedia: Antalya (climate, foreign residents)', url: 'https://en.wikipedia.org/wiki/Antalya' },
    { name: 'YourTaxBase: Charles Schwab for expats (Oct 2026)', url: 'https://yourtaxbase.com/blog/charles-schwab-for-expats' },
  ],
}

export default profile
