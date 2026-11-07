import type { ExpatProfile } from '../expatPicks'

const profile: ExpatProfile = {
  tagline: 'Global megacity and air hub with a 20-year foreign-income exemption',
  summary:
    'Turkey\'s Law 7582 (June 2026) exempts a new resident\'s foreign-source income for 20 years and cuts inheritance tax to 1% during that time, with no wealth tax. Istanbul adds the country\'s best private hospitals and Turkish Airlines\' hub, with nonstops to many US cities, against higher costs than the coast, lira volatility and many districts closed to new property permits.',
  scores: { cost: 4, healthcare: 5, safety: 3, visa: 3, climate: 3, community: 3, tax: 5, estate: 4, lending: 3 },
  facts: {
    healthcare:
      'A major medical-tourism centre: the Acıbadem and Memorial groups run several JCI-accredited Istanbul hospitals, and Istanbul-based Medipol runs 14 hospitals; after a year of residence foreigners can join the state GSS scheme at 24% of the minimum wage, but it excludes pre-existing conditions, so top-up private cover is advised.',
    safety:
      'Turkey is 136th in the 2026 Global Peace Index; UK travel advice warns only against the area within 10 km of the Syrian border, while Istanbul has the petty crime and crowded-area risks of any megacity.',
    visa: 'Short-term residence by owning property assessed at US$200k or more (bought since October 2023), renewable every 1–2 years while you own it; many Istanbul neighbourhoods are among the 1,169 closed to first applications, so check the DGMM list before buying; permanent residence after 8 years.',
    tax: 'No wealth tax (a residence tax applies only to Turkish homes worth over TRY 17.7m); under Law 7582, people resident from 2026 with no Turkish residence in the prior 3 years pay no income tax on foreign-source income for 20 years, if they get the exemption certificate in the first year; whether foreign capital gains are covered is not explicit.',
    estate:
      'Inheritance tax is normally 1–30%, cut to 1% during the 20-year new-resident exemption; sources differ on whether that keys off the decedent or the heir, and a foreign resident\'s US securities left to US heirs may be out of scope entirely; there is no US estate treaty.',
    lending:
      'IBKR reportedly accepts residents of all non-sanctioned countries, including Turkey, though margin terms per country are unknown; Schwab International reportedly does not accept Turkey; as a non-EU country, PRIIPs limits on US ETFs do not apply.',
    climate: 'Warm summers (August highs about 28°C) and cool, damp winters: January highs about 9°C with lows near 4°C, about 865 mm of rain and some 15 snowy days a year.',
    community:
      'Turkey\'s largest expat population, mostly professionals and students in Cihangir, Beşiktaş, the Bosphorus villages and Kadıköy; retirees mostly choose the southern coast instead.',
    access: 'Istanbul Airport is Turkish Airlines\' hub, with nonstops to New York JFK, Atlanta, Seattle and other US cities (2026), and a second airport, Sabiha Gökçen, on the Asian side.',
  },
  drawbacks: [
    'Lira swings and high inflation make local costs unpredictable',
    'Traffic, crowding and earthquake risk from the North Anatolian Fault',
    'Many districts are closed to new property permits, and the tax regime is untested',
  ],
  sources: [
    {
      name: 'EY: Türkiye introduces new personal tax regime (Law 7582)',
      url: 'https://www.ey.com/en_gl/technical/tax-alerts/turkiye-introduces-new-personal-tax-regime-including-foreign-income-exemption-inheritance-tax-relief-and-asset-repatriation-measure',
      edition: '2026',
    },
    { name: 'PwC: Turkey, other taxes', url: 'https://taxsummaries.pwc.com/turkey/individual/other-taxes' },
    {
      name: 'Legal 500: Türkiye\'s new foreign income exemption',
      url: 'https://www.legal500.com/intelligence/turkey/tax/turkiyes-new-foreign-income-exemption-a-regime-for-relocating-individuals',
    },
    {
      name: 'Legal 500: residence permit in Turkey by buying real estate',
      url: 'https://www.legal500.com/intelligence/turkey/real-estate-and-construction/residence-permit-in-turkey-by-buying-real-estate-%E2%80%93-legal-advice',
    },
    { name: 'Ikamet: health care services for foreigners in Turkey', url: 'https://ikamet.com/health-care-services-for-foreigners-in-turkey/' },
    { name: 'TB Mag: hospitals and medical tourism in Türkiye 2026', url: 'https://tbmag.co.uk/hospitals-medical-tourism-turkiye-international-patients-2026/' },
    {
      name: 'CNBC-e: Türkiye rises to 136th in the Global Peace Index',
      url: 'https://www.cnbce.com/haberler/2-dunya-savasindan-sonra-bir-ilk-kuresel-baris-endeksinde-turkiye-detayi-dikkat-cekti-g31456',
      edition: '2026',
    },
    { name: 'GOV.UK: Turkey travel advice', url: 'https://www.gov.uk/foreign-travel-advice/turkey' },
    { name: 'Daily Sabah: where expats choose to live in Turkey', url: 'https://dailysabah.com/turkey/expat-corner/living-abroad-where-expats-choose-to-live-in-turkey' },
    { name: 'AeroRoutes: Turkish Airlines US service changes, June 2026', url: 'https://www.aeroroutes.com/eng/260515-tkns26us' },
    { name: 'Wikipedia: Istanbul (climate, airports)', url: 'https://en.wikipedia.org/wiki/Istanbul' },
    { name: 'YourTaxBase: Charles Schwab for expats (Oct 2026)', url: 'https://yourtaxbase.com/blog/charles-schwab-for-expats' },
  ],
}

export default profile
