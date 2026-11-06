// Top 25 retirement destinations for US expats, each with a full profile.
//
// The rank blends published rankings (EXPAT_RANKING_SOURCES) with retiree
// adjustments; the 1–5 factor scores are eVelo's own assessment. Research was
// done on EXPAT_AS_OF from the sources cited here. Visa and tax rules change
// often: every profile is a starting point, not legal or tax advice.

export type ExpatScoreKey = 'cost' | 'healthcare' | 'safety' | 'visa' | 'climate' | 'community'

export type ExpatScore = 1 | 2 | 3 | 4 | 5

export interface ExpatSource {
  name: string
  url: string
  edition?: string
}

export interface ExpatFacts {
  healthcare: string
  safety: string
  visa: string
  tax: string
  climate: string
  community: string
  access: string
}

export interface ExpatProfile {
  tagline: string
  summary: string
  /** eVelo's own 1–5 assessment, 5 = best for a US retiree. */
  scores: Record<ExpatScoreKey, ExpatScore>
  facts: ExpatFacts
  drawbacks: string[]
  sources: ExpatSource[]
}

export interface ExpatPick {
  rank: number
  /** Id in CITIES (src/data/cities.ts). */
  cityId: string
  /** One sentence on why it ranks here. */
  why: string
  /** Names from EXPAT_RANKING_SOURCES behind the rank. */
  sourceRefs: string[]
  profile?: ExpatProfile
}

export interface ExpatRankingSource {
  name: string
  edition: string
  url: string
  /** Further pages read for the same source. */
  moreUrls?: string[]
  whatItRanks: string
}

/** Date the research behind the ranking and profiles was done (ISO). */
export const EXPAT_AS_OF = '2026-11-06'

export const EXPAT_SCORE_LABELS: Record<ExpatScoreKey, string> = {
  cost: 'Cost',
  healthcare: 'Healthcare',
  safety: 'Safety',
  visa: 'Visa',
  climate: 'Climate',
  community: 'Community',
}

const IL = 'International Living Global Retirement Index'
const LIOS = 'Live and Invest Overseas Retire Overseas Index'
const EI26 = 'InterNations Expat Insider 2026'
const EI25 = 'InterNations Expat Insider 2025'
const IN_CITY = 'InterNations Expat City Ranking'
const GPI = 'Global Peace Index'
const FORBES = 'Forbes: best places for Americans to retire abroad'

export const EXPAT_RANKING_SOURCES: ExpatRankingSource[] = [
  {
    name: IL,
    edition: '2026 (released December 2025)',
    url: 'https://401kspecialistmag.com/greece-tops-2026-global-retirement-index-for-first-time/',
    moreUrls: [
      'https://upstox.com/news/personal-finance/latest-updates/from-greece-to-bali-full-list-of-the-world-s-top-24-retirement-destinations-for-2026/article-201622/',
    ],
    whatItRanks: 'Countries for retirees, scored on cost, healthcare, visas, climate and other retiree factors.',
  },
  {
    name: LIOS,
    edition: '2026 (top 10 confirmed)',
    url: 'https://www.yahoo.com/lifestyle/articles/top-10-countries-americans-retire-003009166.html',
    whatItRanks: 'Specific towns and regions for retirees moving overseas.',
  },
  {
    name: EI26,
    edition: '2026 (31 countries, July 2026)',
    url: 'https://www.euronews.com/2026/07/27/thinking-about-starting-a-life-abroad-these-are-the-best-countries-for-expats-in-2026',
    whatItRanks: 'Countries by how satisfied expats living there say they are.',
  },
  {
    name: EI25,
    edition: '2025 (46 countries)',
    url: 'https://asianews.network/vietnam-ranks-fifth-among-best-countries-for-expats-in-2025/',
    whatItRanks: 'Countries by how satisfied expats living there say they are.',
  },
  {
    name: IN_CITY,
    edition: '2024 (latest city edition found)',
    url: 'https://assets.in-cdn.net/expat-insider/2024/city-ranking-methodology-40492',
    whatItRanks: 'Cities by expat satisfaction.',
  },
  {
    name: GPI,
    edition: '2026',
    url: 'https://www.timeout.com/asia/news/singapore-japan-and-malaysia-are-among-the-worlds-most-peaceful-countries-in-2026-062326',
    whatItRanks: 'Countries by safety and peacefulness (Institute for Economics and Peace).',
  },
  {
    name: FORBES,
    edition: '2026 (unranked list)',
    url: 'https://www.upi.com/Top_News/World-News/2026/08/03/latam-Forves-retirment-list-latin-america/4111785782949/',
    whatItRanks: 'Places it recommends for Americans retiring abroad, without an order.',
  },
]

export const EXPAT_RANKING_METHOD =
  'The rank blends published rankings, weighting the two retiree-specific indexes (International Living and Live and Invest Overseas) most, then expat-satisfaction surveys (InterNations) and the Global Peace Index as a safety check. ' +
  'We then adjusted for what matters to a US retiree living off a portfolio: how easy the retirement visa is, how foreign investment income is taxed, healthcare and flights home. ' +
  'The factor scores are eVelo\'s own 1–5 assessment of each city, separate from the rank, so they won\'t always line up with it.'

// Shared source entries used by several profiles.
const S = {
  d7: { name: 'Portugalist: D7 requirements 2026', url: 'https://www.portugalist.com/d7-changes-2026' },
  ptTax: {
    name: 'Portugal Resident: new tax reality for incoming residents 2026',
    url: 'https://www.portugalresident.com/portugals-new-tax-reality-what-incoming-residents-need-to-know-in-2026/',
  },
  united: {
    name: 'AeroRoutes: United NS26 intercontinental changes',
    url: 'https://www.aeroroutes.com/eng/260326-uans26inc',
  },
  gpiTop50: { name: 'Money.it: GPI 2026 top 50', url: 'https://www.money.it/50-paesi-piu-sicuri-al-mondo-nel-2026', edition: '2026' },
  gpiPoster: {
    name: 'IEP Global Peace Index 2026 map poster',
    url: 'https://www.visionofhumanity.org/wp-content/uploads/2026/06/Global-Peace-Index-2026-A3-map-poster.pdf',
    edition: '2026',
  },
  il: {
    name: '401(k) Specialist: International Living Global Retirement Index 2026',
    url: 'https://401kspecialistmag.com/greece-tops-2026-global-retirement-index-for-first-time/',
    edition: '2026',
  },
  lios: {
    name: '401(k) Specialist: Live and Invest Overseas top retirement destinations 2026',
    url: 'https://401kspecialistmag.com/6-top-international-retirement-destinations-for-2026/4',
    edition: '2026',
  },
  iprem: {
    name: 'Costa Luz Lawyers: IPREM 2026 for the non-lucrative visa',
    url: 'https://www.costaluzlawyers.com/resources/iprem-non-lucrative-visa-2026/',
  },
  spainAir: {
    name: 'Turespaña: air connectivity to Spain 2026',
    url: 'https://www.tourspain.es/en/b2b/air-connectivity-frequencies-routes-spain-2026/',
  },
  mm2h: { name: 'MM2H official guidelines (MOTAC)', url: 'https://www.mm2h.gov.my/apply/guidelines' },
  myTax: {
    name: 'The Star: foreign-sourced income exemption extension',
    url: 'https://www.thestar.com.my/news/true-or-not/2024/10/19/quickcheck-has-the-tax-exemption-on-foreign-sourced-income-been-extended',
  },
  seaGpi: {
    name: 'SEA Stats: Southeast Asia\'s most peaceful countries 2026',
    url: 'https://seasiastats.com/statistic/southeast-asias-most-and-least-peaceful-countries-in-2026-1NV7O',
  },
  pensionado: { name: 'Relofirm: Panama Pensionado requirements (updated Oct 2026)', url: 'https://www.relofirm.com/?p=60' },
  mxAdvisory: {
    name: 'Jetpac: Is it safe to travel to Mexico (state advisory levels, 2026)',
    url: 'https://blog.jetpacglobal.com/blog/is-it-safe-to-travel-to-mexico-right-now/',
  },
  mxResidency: {
    name: 'Mexperience: Financial criteria for residency in Mexico (2026 UMA)',
    url: 'https://mexperience.com/financial-criteria-for-residency-in-mexico/',
  },
  unitedSummer: {
    name: 'United: new summer flights to Split, Bari, Glasgow and Santiago de Compostela (Apr 2026)',
    url: 'https://united.mediaroom.com/2026-04-28-United-Airlines-Launches-New-Summer-Flights-to-Split,-Bari,-Glasgow-and-Santiago-De-Compostela',
  },
  timeoutGpi: {
    name: 'Time Out: most peaceful countries in Asia 2026',
    url: 'https://www.timeout.com/asia/news/singapore-japan-and-malaysia-are-among-the-worlds-most-peaceful-countries-in-2026-062326',
    edition: '2026',
  },
  thRetire: { name: 'Issa Compass: Thailand retirement visa 2026', url: 'https://www.issacompass.com/insights/retirement-visa-thailand' },
  forbes: {
    name: 'UPI: Forbes best places for Americans to retire abroad, Latin America (Aug 2026)',
    url: 'https://www.upi.com/Top_News/World-News/2026/08/03/latam-Forves-retirment-list-latin-america/4111785782949/',
    edition: '2026',
  },
} satisfies Record<string, ExpatSource>

// Portugal and Mexico share country-level facts across several cities.
const PT_TAX =
  'NHR is closed to new arrivals and its IFICI successor excludes pensions, so foreign pensions are taxed at progressive rates up to 48% and investment income commonly at 28%; the US–Portugal treaty applies (check current rules).'
const PT_VISA =
  'D7 passive-income visa: at least €920/month (the 2026 minimum wage; +50% for a spouse) plus housing and savings; AIMA processing backlogs are common.'
const MX_VISA =
  'Temporary residency needs about $4,430/month net income or about $74,700 in savings or investments; permanent residency for retirees about $7,430/month or $299,000 (2026 figures); brokerage balances generally count, and amounts vary by consulate.'
const MX_TAX =
  'Mexican tax residents are taxed on worldwide income, so US dividends, interest and gains are reportable in Mexico; the US–Mexico treaty and foreign tax credits help only partly (get local advice and check current rules).'
const MY_TAX =
  'Foreign-sourced income received by resident individuals is exempt through 31 Dec 2036, provided it was taxed where it arose; check current rules.'

export const EXPAT_PICKS: ExpatPick[] = [
  {
    rank: 1,
    cityId: 'algarve',
    why: 'Live and Invest Overseas ranks the Algarve 2nd for 2026, and Portugal is 4th in International Living\'s 2026 Global Retirement Index, 8th in Expat Insider 2026 and 7th in the 2026 Global Peace Index, with EU healthcare, an easy passive-income visa and a large English-speaking retiree community.',
    sourceRefs: [LIOS, IL, EI26, GPI],
    profile: {
      tagline: 'Sunny coast, big English-speaking retiree scene',
      summary:
        'Portugal is among the world\'s safest countries (7th in the Global Peace Index) and has the cheapest EU passive-income visa, and the Algarve adds about 300 days of sun and an established English-speaking retiree community. It ranks high on both retiree indexes: Live and Invest Overseas has it 2nd for 2026, and International Living has Portugal 4th.',
      scores: { cost: 3, healthcare: 3, safety: 5, visa: 4, climate: 5, community: 5 },
      facts: {
        healthcare:
          'Residents can use the public SNS, but the region has few public hospitals and long waits; most expats also carry private cover (HPA, Lusíadas, CUF) and go to Lisbon for complex care.',
        safety: 'Portugal is 7th in the 2026 Global Peace Index; violent crime is low, and theft in resort towns is mostly opportunistic.',
        visa: PT_VISA,
        tax: PT_TAX,
        climate: 'Mediterranean: about 300 sunny days, hot dry summers and mild winters around 15–17°C.',
        community:
          'One of Europe\'s largest English-speaking retiree populations (British, Irish, North American), concentrated in Lagos, Tavira, Loulé and the golf resorts.',
        access: 'United flies Newark–Faro seasonally (4 weekly, May–Sep 2026); the rest of the year, connect via Lisbon or a European hub.',
      },
      drawbacks: [
        'Public hospital capacity in the region is thin, so complex care often means a trip to Lisbon',
        'Very seasonal: some resort towns are quiet in winter, while summer brings crowds and higher prices',
        'Without NHR, a foreign pension or a large taxable portfolio draw can face high Portuguese rates',
      ],
      sources: [S.d7, S.ptTax, S.united, S.gpiTop50],
    },
  },
  {
    rank: 2,
    cityId: 'boquete',
    why: 'Live and Invest Overseas ranks Boquete 1st for 2026, and Panama is 2nd in International Living\'s 2026 index and 1st in InterNations\' Expat Insider survey in both 2025 and 2026, with the Pensionado visa, a territorial tax system and the US dollar.',
    sourceRefs: [LIOS, IL, EI26, EI25],
    profile: {
      tagline: 'Cool highland town, big North American community',
      summary:
        'Live and Invest Overseas ranked Boquete 1st for 2026, and Panama is 2nd in International Living\'s 2026 index and 1st in Expat Insider. Retirees with a pension of $1,000 a month get permanent residency, foreign income is generally untaxed, and the currency is the US dollar.',
      scores: { cost: 4, healthcare: 3, safety: 4, visa: 4, climate: 4, community: 4 },
      facts: {
        healthcare:
          'Town clinics handle routine care (visits often $20–40); private hospitals are 40 minutes away in David and serious cases go to Panama City; most expats use private insurance, as the public CSS mainly serves contributors.',
        safety:
          'Panama is 81st of 163 in the 2026 Global Peace Index and US State Dept Level 2 (August 2026); Boquete itself is a quiet small town where petty theft is the main concern.',
        visa:
          'Pensionado gives permanent residency at any age but needs a lifetime pension of at least $1,000/month ($750 with $100k+ of Panama property); Social Security counts, portfolio income does not, and the Qualified Investor alternative was reportedly raised to $500k in September 2026.',
        tax: 'Territorial: foreign pensions and US brokerage dividends and gains are generally not taxed in Panama, though US tax still applies; check current rules.',
        climate:
          'At about 1,200 m (3,900 ft), spring-like all year; a long May–November wet season, and misty drizzle and wind in the dry season.',
        community: 'About 25,000 people, over a fifth of them expats (mostly from the US and Canada), so an English-speaking social life is easy to find.',
        access:
          'No direct US flights: fly David–Panama City on Copa (or drive about 7 hours), then connect at Tocumen, which has many US nonstops.',
      },
      drawbacks: [
        'Specialist and emergency care means a trip to David or a flight to Panama City',
        'Pensionado needs a true pension, so a portfolio-only retiree needs another route, and the investor visa is costly',
        'Prices are rising with expat demand, and the long rainy season wears on some people',
      ],
      sources: [S.lios, S.il, S.pensionado, S.gpiPoster],
    },
  },
  {
    rank: 3,
    cityId: 'panama-city',
    why: 'Panama is 2nd in International Living\'s 2026 index and 1st in Expat Insider 2026, and the capital adds Copa\'s US flight hub and the country\'s best private hospitals to the Pensionado visa, territorial tax and US dollar.',
    sourceRefs: [IL, EI26],
    profile: {
      tagline: 'Dollarized hub city with top private hospitals',
      summary:
        'Panama is 2nd in International Living\'s 2026 index and 1st in Expat Insider 2025 and 2026. The capital adds Central America\'s strongest private hospitals and Copa\'s hub, with nonstops to dozens of US cities, on top of the Pensionado visa and territorial tax.',
      scores: { cost: 3, healthcare: 4, safety: 3, visa: 4, climate: 3, community: 4 },
      facts: {
        healthcare:
          'Strong private hospitals (Pacifica Salud at Punta Pacífica, Hospital Nacional), often with US-trained doctors; pensionados get 15–20% off medical bills, and most expats use private insurance.',
        safety:
          'Panama is 81st of 163 in the 2026 Global Peace Index and US State Dept Level 2 (August 2026); expats favour Punta Pacífica, San Francisco and Casco, as some districts and nearby Colón have high crime.',
        visa:
          'Pensionado is permanent and needs a $1,000/month lifetime pension ($750 with $100k+ of Panama property); Social Security counts, portfolio income does not, and the investor route was reportedly raised to $500k in September 2026.',
        tax: 'Territorial: foreign pensions, dividends and capital gains are generally untaxed in Panama, and the currency is the US dollar; check current rules.',
        climate: 'Hot and humid all year (highs about 30°C / 86°F), with heavy rain roughly May–December.',
        community: 'Large, mixed international community of retirees, diplomats and business people; English is widely used where foreigners live.',
        access: 'Tocumen is Copa\'s hub, with nonstops to many US cities: about 3 hours to Miami and 4.5 to Houston.',
      },
      drawbacks: [
        'Heat, humidity and an eight-month rainy season',
        'Traffic, noise, and condo prices in expat areas close to mid-tier US cities',
        'Pensionado excludes portfolio income, and the investor route reportedly got pricier in 2026',
      ],
      sources: [
        S.il,
        {
          name: 'Reside Panama: Pensionado visa 2026',
          url: 'https://www.residepanama.com/en/reside-panama-blog/retiring-in-panama-in-2026-the-pensionado-visa-everything-you-need-to-know',
        },
        S.pensionado,
        S.gpiPoster,
      ],
    },
  },
  {
    rank: 4,
    cityId: 'lisbon',
    why: 'Portugal is 4th in International Living\'s 2026 index, 8th in Expat Insider 2026 and 7th in the Global Peace Index, and Lisbon adds the country\'s best flight links and international hospitals, at a higher cost than the Algarve.',
    sourceRefs: [IL, EI26, GPI],
    profile: {
      tagline: 'Capital city amenities, best US flight links',
      summary:
        'Lisbon pairs Portugal\'s safety (7th in the Global Peace Index) and low D7 visa threshold with the country\'s best hospitals and the most nonstop US flights on the Iberian peninsula. It costs more than the Algarve or Porto, but offers big-city culture and a large international community.',
      scores: { cost: 2, healthcare: 4, safety: 4, visa: 4, climate: 4, community: 4 },
      facts: {
        healthcare:
          'Residents can join the public SNS (good, but with waits), and a dense private network of CUF, Luz and Lusíadas hospitals has English-speaking doctors.',
        safety: 'Portugal is 7th in the 2026 Global Peace Index; pickpocketing in tourist areas and on trams is the main issue.',
        visa: PT_VISA,
        tax: PT_TAX,
        climate: 'Mild Atlantic-Mediterranean climate: warm dry summers, and wet but mild winters around 15°C.',
        community: 'Large, mixed international crowd of retirees, remote workers and digital nomads; English is widely spoken.',
        access: 'The most US nonstops in the region: TAP flies to several US cities, and United flies daily from Washington Dulles.',
      },
      drawbacks: [
        'Housing costs have climbed fast and are high relative to local incomes',
        'Hilly, cobbled streets are hard going for anyone with limited mobility',
        'No NHR tax break for newcomers, heavy tourism, and some local resentment of foreigners',
      ],
      sources: [S.d7, S.ptTax, S.united, S.gpiTop50],
    },
  },
  {
    rank: 5,
    cityId: 'valencia',
    why: 'Valencia was 1st in InterNations\' 2024 Expat City Ranking, and Spain is 6th in Expat Insider 2026 (1st for quality of life) and 8th in International Living\'s 2026 index.',
    sourceRefs: [IN_CITY, EI26, IL],
    profile: {
      tagline: 'Beach city, top-rated by expats, sensible prices',
      summary:
        'Valencia was the top city in InterNations\' most recent city ranking (2024), with high marks for quality of life, and Spain is 6th in Expat Insider 2026. It has beaches, good public healthcare and lower costs than Madrid or Barcelona.',
      scores: { cost: 3, healthcare: 4, safety: 4, visa: 3, climate: 4, community: 4 },
      facts: {
        healthcare:
          'Strong Spanish public system (for example La Fe hospital); visa holders start on private insurance and can usually buy into public cover (convenio especial) after a year; private care is affordable.',
        safety: 'Spain is 27th in the 2026 Global Peace Index; violent crime is low, with petty theft in the centre and on beaches.',
        visa:
          'Non-lucrative visa: passive income or savings of €2,400/month (400% of IPREM, €28,800/year, +€7,200 per dependant) plus private health insurance; work is not allowed.',
        tax: 'Residents are taxed on worldwide income (savings income at 19–30%); the Valencian region has its own wealth tax, whose 2026 allowance could not be confirmed, and foreign assets must be reported (Modelo 720); check current rules.',
        climate: 'Mild winters (days about 17°C) and hot, humid summers; the October 2024 floods showed the flash-flood risk.',
        community: 'A growing English-speaking expat scene in Ruzafa, the centre and the coastal suburbs, though daily life runs in Spanish and Valencian.',
        access: 'No US nonstop found; connect via Madrid, Barcelona, Lisbon or another European hub.',
      },
      drawbacks: [
        'No direct US flights',
        'The regional wealth tax and taxed investment income can weigh on a large portfolio',
        'The non-lucrative visa\'s income bar (€2,400/month) is far higher than Portugal\'s',
      ],
      sources: [
        S.iprem,
        { name: 'InterNations Expat City Ranking 2024 methodology', url: 'https://assets.in-cdn.net/expat-insider/2024/city-ranking-methodology-40492', edition: '2024' },
        S.gpiTop50,
        S.spainAir,
      ],
    },
  },
  {
    rank: 6,
    cityId: 'malaga',
    why: 'Malaga was 2nd in InterNations\' 2024 Expat City Ranking and anchors the Costa del Sol, a long-established base for foreign retirees, and Spain is 8th in International Living\'s 2026 index.',
    sourceRefs: [IN_CITY, IL],
    profile: {
      tagline: 'Costa del Sol warmth, long-established foreign community',
      summary:
        'Malaga was 2nd in InterNations\' 2024 city ranking and anchors the Costa del Sol, home to one of Europe\'s oldest and largest foreign retiree communities. It has some of Europe\'s mildest winters, and Andalusia waives its regional wealth tax.',
      scores: { cost: 3, healthcare: 4, safety: 4, visa: 3, climate: 5, community: 5 },
      facts: {
        healthcare:
          'Good public hospitals (Regional, Clínico); visa holders start on private insurance and can usually move to convenio especial after a year; many English-speaking private clinics along the coast.',
        safety: 'Spain is 27th in the 2026 Global Peace Index; violent crime is low, with petty theft and some organised-crime news along the coast.',
        visa: 'Non-lucrative visa: passive income or savings of €2,400/month (400% of IPREM, 2026) plus private health insurance; work is not allowed.',
        tax: 'Residents are taxed on worldwide income (savings income at 19–30%); Andalusia gives full relief on regional wealth tax, but the national solidarity tax still applies to net wealth above €3M; check current rules.',
        climate: 'About 300 sunny days; winters around 17°C; hot, dry summers.',
        community: 'A very large British and Northern European community on the Costa del Sol (Fuengirola, Marbella, Nerja), with English-language services everywhere.',
        access: 'United has flown Newark–Malaga in past summers, but 2026 service could not be confirmed; otherwise connect via Madrid or a European hub.',
      },
      drawbacks: [
        'Rents and property prices have risen sharply with tourism and foreign demand',
        'Summer crowds and heat, and some coastal towns feel more resort than Spanish town',
        'The non-lucrative visa\'s income bar is high, and holders must spend most of the year in Spain',
      ],
      sources: [
        S.iprem,
        {
          name: 'Skybound Wealth: Spain wealth tax 2026 and the €3M solidarity tax',
          url: 'https://www.skyboundwealth.com/technical-guides/spain-wealth-tax-2026-who-pays-regional-rules-the-3m-solidarity-tax',
        },
        S.gpiTop50,
        S.spainAir,
      ],
    },
  },
  {
    rank: 7,
    cityId: 'san-jose-cr',
    why: 'Costa Rica is 3rd in International Living\'s 2026 index and on Forbes\' 2026 list, with spring-like weather, public and private healthcare, and visas for both pensions and investment income, though a pending bill would tax residents\' foreign investment income.',
    sourceRefs: [IL, FORBES],
    profile: {
      tagline: 'Spring-like Central Valley, universal public healthcare',
      summary:
        'Costa Rica is 3rd in International Living\'s 2026 index. The Central Valley around San José (Escazú, Santa Ana, Atenas, Grecia) pairs mild weather all year with the CCSS public system and good private hospitals, and its Rentista visa accepts investment income. A bill filed in September 2026 would end the tax-free treatment of residents\' foreign investment income if it passes.',
      scores: { cost: 2, healthcare: 4, safety: 3, visa: 4, climate: 5, community: 4 },
      facts: {
        healthcare:
          'Residents must join the CCSS ("Caja") public system, at a share of declared income (reportedly about 7–11%; confirm the rate); private hospitals such as CIMA, Clínica Bíblica and Metropolitano are faster.',
        safety:
          'Costa Rica is 62nd of 163 in the 2026 Global Peace Index and US State Dept Level 2; homicides peaked at 905 in 2023 and were 873 in 2025, with 2026 projected below 800.',
        visa:
          'Pensionado needs a $1,000/month lifetime pension (portfolio income does not count); Rentista suits portfolio-funded retirees: $2,500/month guaranteed for 2 years by a bank letter, or a $60k Costa Rican deposit; both take 6–18 months.',
        tax: 'Territorial today, so foreign investment income is generally untaxed, but bill No. 25.796 (filed 22 September 2026) would tax residents\' foreign interest, dividends and capital gains at 15%, with credit for foreign tax; not law as of November 2026, so check current rules.',
        climate: 'At 1,000–1,200 m the Central Valley is spring-like all year (about 20–27°C), with afternoon rains May–November.',
        community: 'A long-established US and Canadian community in Escazú, Santa Ana, Atenas and Grecia; English is common in services.',
        access: 'San José has nonstops to many US hubs (about 2.5–3 hours to Miami, Houston and Atlanta), and Liberia also serves the US.',
      },
      drawbacks: [
        'The pending 15% tax on residents\' foreign interest, dividends and gains would remove the main tax advantage for a portfolio-funded retiree',
        'One of Latin America\'s pricier countries, and a strong colón has pushed costs up for dollar earners',
        'Gang violence has stayed high since 2023, and petty theft and burglary are common',
      ],
      sources: [
        { name: 'Tico Times: Costa Rica proposes 15% tax on foreign income (Sept 2026)', url: 'https://ticotimes.net/2026/09/23/costa-rica-15-percent-tax-foreign-income' },
        { name: 'Golden Harbors: Costa Rica Rentista visa (Aug 2026)', url: 'https://goldenharbors.com/articles/costa-rica-rentista-visa' },
        {
          name: 'Tico Times: US travel advisory, Costa Rica Level 2 (Mar 2026)',
          url: 'https://ticotimes.net/2026/03/27/u-s-travel-advisory-highlights-costa-rica-as-a-safer-choice-in-central-america',
        },
        S.il,
        S.gpiPoster,
      ],
    },
  },
  {
    rank: 8,
    cityId: 'puerto-vallarta',
    why: 'Live and Invest Overseas ranks Puerto Vallarta 3rd for 2026 and Forbes lists it, Mexico is 2nd in Expat Insider 2026 and 5th in International Living\'s 2026 index, and it has nonstop flights to many US cities.',
    sourceRefs: [LIOS, FORBES, EI26, IL],
    profile: {
      tagline: 'Bay-front resort town, easy US nonstops',
      summary:
        'Live and Invest Overseas ranked Puerto Vallarta 3rd for 2026, and Mexico is 2nd in Expat Insider 2026 and 5th in International Living. It pairs a big English-speaking snowbird community with good private hospitals and short nonstop flights home, but Jalisco\'s cartel violence reached the city in February 2026.',
      scores: { cost: 3, healthcare: 3, safety: 2, visa: 3, climate: 3, community: 5 },
      facts: {
        healthcare:
          'Good private hospitals for a city its size (CMQ, San Javier, Amerimed) at well below US prices; the most complex care is in Guadalajara, and IMSS has age and pre-existing-condition limits.',
        safety:
          'Mexico is 137th of 163 in the 2026 Global Peace Index and Jalisco is reportedly at Level 3, "reconsider travel"; in February 2026, cartel blockades after El Mencho\'s killing shut the airport and left tourists sheltering in place.',
        visa: MX_VISA,
        tax: MX_TAX,
        climate: 'Dry and warm November–May; hot, humid and rainy June–October, with hurricane risk.',
        community: 'One of Mexico\'s largest US and Canadian communities, swelled by winter snowbirds and LGBTQ-friendly; daily life works in English.',
        access: 'Many nonstops to US and Canadian cities: about 3 hours to Dallas or Los Angeles.',
      },
      drawbacks: [
        'Jalisco cartel violence can reach the city, as the February 2026 blockades and flight shutdown showed',
        'Mexico taxes residents\' worldwide investment income, which undercuts a Buy-Borrow-Die tax plan',
        'Sticky summers, and prices that have climbed with popularity',
      ],
      sources: [S.mxAdvisory, S.mxResidency, { ...S.lios, name: '401(k) Specialist: Live and Invest Overseas 2026 list' }, S.gpiPoster],
    },
  },
  {
    rank: 9,
    cityId: 'athens',
    why: 'Greece tops International Living\'s 2026 index for the first time and is on Forbes\' 2026 list, and foreign pensioners can elect a 7% flat tax on foreign income.',
    sourceRefs: [IL, FORBES],
    profile: {
      tagline: 'History, islands nearby, 7% flat tax for pensioners',
      summary:
        'Greece is 1st in International Living\'s 2026 Global Retirement Index, the first time it has topped the list, and new residents with a qualifying pension can elect a 7% flat tax on foreign income for 15 years. Athens is a low-cost EU capital with good flight links and the islands close by.',
      scores: { cost: 3, healthcare: 3, safety: 3, visa: 3, climate: 3, community: 3 },
      facts: {
        healthcare:
          'The public ESY system is stretched, with long waits; good private hospitals (Hygeia, Metropolitan, Iaso) are moderately priced, and most expats use private insurance.',
        safety: 'Greece is 53rd in the 2026 Global Peace Index; violent crime is low, but pickpocketing and frequent protests and strikes affect central Athens.',
        visa:
          'Financially Independent Person permit: at least €3,500/month of passive income from abroad (+20% for a spouse), private health insurance and Greek housing; renewable for 3 years, no work allowed.',
        tax: 'Article 5B: a 7% flat tax on all foreign income for up to 15 years if you have a qualifying pension and were not Greek tax resident in 5 of the previous 6 years (rules updated September 2026); otherwise progressive rates up to 44%; check current rules.',
        climate: 'Hot, dry summers with frequent 40°C heatwaves and wildfire smoke; short, mild winters.',
        community: 'A smaller English-speaking retiree scene than Portugal or Spain, growing in the southern coastal suburbs (Glyfada, Vouliagmeni); English is widely spoken.',
        access: 'United flies Newark–Athens daily (from March 2026) plus Washington Dulles in summer; other US nonstops are mostly seasonal.',
      },
      drawbacks: [
        'Extreme summer heat and wildfire smoke are getting worse',
        'Slow bureaucracy, a stretched public health system and frequent strikes',
        'The 7% regime needs a qualifying pension, so a portfolio-only retiree may not qualify, and the residence permit\'s €3,500/month bar is high',
      ],
      sources: [
        { ...S.il, name: '401k Specialist: Greece tops 2026 Global Retirement Index' },
        { name: 'Global Citizen Solutions: FIP visa Greece 2026', url: 'https://www.globalcitizensolutions.com/fip-visa-greece/' },
        {
          name: 'Greek City Times: Greece extends special tax regime deadline for foreign pensioners',
          url: 'https://greekcitytimes.com/2026/09/26/greece-extends-special-tax-regime-deadline-for-foreign-pensioners/',
        },
        {
          name: 'Greek City Times: Greece 53rd in GPI 2026',
          url: 'https://greekcitytimes.com/2026/06/12/iceland-safest-country-19th-year-greece-53rd-global-peace-index-2026/',
          edition: '2026',
        },
        S.united,
      ],
    },
  },
  {
    rank: 10,
    cityId: 'kuala-lumpur',
    why: 'Malaysia is 10th in International Living\'s 2026 index, 9th in Expat Insider 2026 and 12th in the Global Peace Index, with foreign income exempt from tax, English widely spoken and good, inexpensive private hospitals.',
    sourceRefs: [IL, EI26, GPI],
    profile: {
      tagline: 'Modern, English-friendly city, tax-free foreign income',
      summary:
        'Malaysia is 12th in the 2026 Global Peace Index and 10th in International Living\'s 2026 index, and it exempts residents\' foreign income from tax through 2036. Kuala Lumpur offers first-rate private hospitals and widespread English at a fraction of US costs, but its residence program is expensive to enter.',
      scores: { cost: 4, healthcare: 4, safety: 4, visa: 2, climate: 3, community: 4 },
      facts: {
        healthcare:
          'Excellent, affordable private hospitals (Gleneagles, Prince Court, Sunway) with English-speaking, often Western-trained doctors; foreigners pay out of pocket or use private insurance.',
        safety: 'Malaysia is 12th in the 2026 Global Peace Index; violent crime is low, and bag-snatching and petty theft are the main risks.',
        visa:
          'MM2H Silver: a fixed deposit of about USD 150,000 and a property purchase (reportedly at least about RM600,000, higher in some states); a renewable 5-year pass, with no minimum stay reported for applicants 50 and over.',
        tax: MY_TAX,
        climate: 'Hot and humid all year (about 32°C), with heavy afternoon storms and occasional haze from regional fires.',
        community: 'A large, established expat community (Mont Kiara, Bangsar); English is an everyday business language.',
        access: 'No US nonstops; one stop via Tokyo, Seoul, Taipei, Doha or Dubai, typically 20+ hours.',
      },
      drawbacks: [
        'MM2H\'s entry cost (about USD 150k on deposit plus a property that cannot be sold for 10 years) is the highest of these cities',
        'A long trip home to the US, with no nonstop flights',
        'Relentless heat and humidity, and a city built around cars',
      ],
      sources: [
        S.mm2h,
        S.myTax,
        {
          name: 'Bloomberg Tax: Malaysia gazettes order extending foreign income exemption',
          url: 'https://news.bloombergtax.com/daily-tax-report-international/malaysia-gazettes-order-extending-income-tax-exemption-on-foreign-income',
        },
        {
          name: 'Time Out: Malaysia among most peaceful countries 2026',
          url: 'https://www.timeout.com/asia/news/singapore-japan-and-malaysia-are-among-the-worlds-most-peaceful-countries-in-2026-062326',
          edition: '2026',
        },
      ],
    },
  },
  {
    rank: 11,
    cityId: 'penang',
    why: 'Penang shares Malaysia\'s strengths (10th in International Living\'s 2026 index, 12th in the Global Peace Index, foreign income untaxed) at a lower cost than Kuala Lumpur, with private hospitals that draw medical tourists.',
    sourceRefs: [IL, GPI],
    profile: {
      tagline: 'Island food capital with medical-tourism hospitals',
      summary:
        'Penang has Malaysia\'s strengths (12th in the Global Peace Index, foreign income tax-exempt through 2036, wide use of English) on a smaller, cheaper island. Its private hospitals are a regional medical-tourism hub.',
      scores: { cost: 5, healthcare: 4, safety: 4, visa: 2, climate: 3, community: 4 },
      facts: {
        healthcare: 'Accredited private hospitals (Island Hospital, Gleneagles Penang, Loh Guan Lye) draw medical tourists, at a fraction of US prices.',
        safety: 'Malaysia is 12th in the 2026 Global Peace Index; Penang is generally safe, with petty theft the main concern.',
        visa: 'Federal MM2H applies (Silver: about USD 150,000 on fixed deposit plus a property purchase); Penang\'s state property minimum may be higher than the national floor.',
        tax: MY_TAX,
        climate: 'Tropical: hot and humid all year, with monsoon rains and occasional haze; sea breezes help a little.',
        community: 'A long-established Western retiree community in George Town, Tanjung Bungah and Batu Ferringhi; English is widely spoken.',
        access: 'No US nonstops; connect via Singapore, Kuala Lumpur or another Asian hub, often with two stops.',
      },
      drawbacks: [
        'Very long trips to the US, often with two connections',
        'A high MM2H deposit and property requirement, and the property cannot be sold for 10 years',
        'Traffic congestion, and coastal high-rise development changing the island',
      ],
      sources: [
        S.mm2h,
        {
          name: 'Asia Lifestyle Magazine: MM2H 2026 requirements',
          url: 'https://www.asialifestylemagazine.com/mm2h-visa-2026-what-malaysias-second-home-programme-now-requires/',
        },
        S.myTax,
        S.seaGpi,
      ],
    },
  },
  {
    rank: 12,
    cityId: 'chiang-mai',
    why: 'Thailand is 9th in International Living\'s 2026 index and 3rd in Expat Insider 2026, and Chiang Mai combines very low costs with a retirement visa for people 50 and over, though Thailand now taxes foreign income brought into the country.',
    sourceRefs: [IL, EI26],
    profile: {
      tagline: 'Very low cost, easy 50+ retirement visa',
      summary:
        'Thailand is 9th in International Living\'s 2026 index and 3rd in Expat Insider 2026, and Chiang Mai is one of the cheapest well-served retiree cities anywhere. Its retirement visa for people 50 and over is among the easiest to get.',
      scores: { cost: 5, healthcare: 3, safety: 3, visa: 4, climate: 3, community: 5 },
      facts: {
        healthcare:
          'Good, low-cost private hospitals (Bangkok Hospital Chiang Mai, Chiang Mai Ram); complex care is often referred to Bangkok, and foreigners rely on private insurance.',
        safety:
          'Thailand scores 2.089 in the 2026 Global Peace Index, 8th in Southeast Asia (its global rank could not be confirmed; it was 86th in 2025); street crime is low, but road safety is poor.',
        visa: 'Retirement visa (Non-O or O-A, age 50+): 800,000 baht held in a Thai bank, with yearly extensions and 90-day reporting; O-A applicants also need health insurance.',
        tax: 'Since 2024, residents present 180+ days a year are taxed on foreign income remitted into Thailand, at up to 35%; proposed relief has not been enacted, and the US–Thailand treaty applies (check current rules).',
        climate: 'A pleasant cool season (November–February), then a hot, smoky burning season (roughly February–April) with some of the world\'s worst air quality.',
        community: 'A large, long-standing Western retiree and digital-nomad community, with many English-language clubs and services.',
        access: 'No US nonstops; connect via Bangkok, Tokyo, Seoul or Taipei, typically 20+ hours.',
      },
      drawbacks: [
        'Burning-season air pollution is severe, and many expats leave for 2–3 months',
        'The visa needs renewing every year plus 90-day reports, and foreign income you bring into Thailand can now be taxed',
        'Far from the US, and serious medical cases often go to Bangkok',
      ],
      sources: [
        S.thRetire,
        {
          name: 'Legal500: Thailand proposed foreign income remittance amendment',
          url: 'https://www.legal500.com/developments/press-releases/thailand-proposes-new-amendment-to-tax-rule-for-foreign-income-remittance/',
        },
        S.seaGpi,
        { name: 'Nation Thailand: Thailand 86th in GPI 2025', url: 'https://www.nationthailand.com/sustaination/40052489', edition: '2025' },
      ],
    },
  },
  {
    rank: 13,
    cityId: 'merida',
    why: 'Mérida is on Forbes\' 2026 list and is widely called Mexico\'s safest large city, in the only Mexican state the US State Department rates at Level 1.',
    sourceRefs: [FORBES],
    profile: {
      tagline: 'Colonial capital in Mexico\'s safest state',
      summary:
        'Mérida, on Forbes\' 2026 list, is a large, low-cost colonial city in Yucatán, reportedly the only Mexican state the US State Department rates at Level 1. It has solid private hospitals and a growing expat scene in the historic centre.',
      scores: { cost: 4, healthcare: 4, safety: 4, visa: 3, climate: 2, community: 4 },
      facts: {
        healthcare:
          'The regional medical centre for the Yucatán Peninsula, with private hospitals (Star Médica, Faro del Mayab, Clínica de Mérida) well below US prices; IMSS buy-in is available, with limits.',
        safety:
          'Mexico is 137th of 163 in the 2026 Global Peace Index, but Yucatán is reportedly the only state at US State Dept Level 1, "normal precautions", and Mérida is widely called Mexico\'s safest large city.',
        visa: MX_VISA,
        tax: MX_TAX,
        climate: 'Hot all year, often 40°C (104°F) in April–May, with a humid rainy season June–October and hurricane exposure.',
        community: 'A sizeable, growing US, Canadian and European community in the centre and northern suburbs, less English-dominated than Puerto Vallarta or San Miguel.',
        access: 'A few US nonstops, reportedly to Houston, Miami, Dallas and Orlando (check current schedules); otherwise connect via Mexico City or drive 4 hours to Cancún.',
      },
      drawbacks: [
        'Punishing heat in spring and summer, and high air-conditioning bills',
        'Few nonstop US flights compared with Cancún or Puerto Vallarta',
        'Mexico taxes residents\' worldwide investment income',
      ],
      sources: [{ ...S.mxAdvisory, name: 'Jetpac: Is it safe to travel to Mexico (Yucatán Level 1, 2026)' }, S.forbes, S.mxResidency, S.gpiPoster],
    },
  },
  {
    rank: 14,
    cityId: 'san-miguel-de-allende',
    why: 'San Miguel de Allende is on Forbes\' 2026 list and is Mexico\'s classic American retiree town, with a dry highland climate and a walkable colonial centre.',
    sourceRefs: [FORBES],
    profile: {
      tagline: 'Highland arts town, Mexico\'s classic American enclave',
      summary:
        'San Miguel de Allende is on Forbes\' 2026 list and is one of the towns most often reported as home by foreign residents in Mexico News Daily\'s 2026 survey. It offers a dry highland climate, a walkable colonial centre and a deep English-speaking community, in a state with high crime.',
      scores: { cost: 3, healthcare: 3, safety: 2, visa: 3, climate: 4, community: 5 },
      facts: {
        healthcare: 'Local private hospitals (H+, MAC) cover routine and moderate care; major procedures usually mean Querétaro, about an hour away; IMSS buy-in is available, with limits.',
        safety:
          'Mexico is 137th of 163 in the 2026 Global Peace Index, and Guanajuato is reportedly US State Dept Level 3, "reconsider travel", with one of Mexico\'s highest homicide counts; the town itself is reported to be calmer, but no city data was found.',
        visa: MX_VISA,
        tax: MX_TAX,
        climate: 'At about 1,900 m: dry, sunny and mild, with near-freezing winter nights, a hot May and moderate summer rains.',
        community: 'A long-standing, very large US and Canadian retiree community, rich in arts and volunteer groups; daily life is easy in English.',
        access: 'No airport: León/Bajío is about 1.5 hours away and Querétaro about 1 hour, both with nonstops to Texas and some other US hubs (check current routes).',
      },
      drawbacks: [
        'It sits in Guanajuato, one of Mexico\'s most violent states',
        'High prices for Mexico, driven by foreign demand and tourism',
        'Serious medical care and airports are an hour or more away by road',
      ],
      sources: [
        { ...S.mxAdvisory, name: 'Jetpac: Is it safe to travel to Mexico (Guanajuato Level 3, 2026)' },
        {
          name: 'Mexico News Daily: Expat Safety Perceptions Index Q1 2026',
          url: 'https://mexiconewsdaily.com/news/how-safe-is-mexico-according-to-its-foreign-residents-the-survey-results/',
        },
        S.mxResidency,
        S.forbes,
      ],
    },
  },
  {
    rank: 15,
    cityId: 'porto',
    why: 'Porto has Portugal\'s strengths (4th in International Living\'s 2026 index, 7th in the Global Peace Index, an easy passive-income visa) at a lower cost than Lisbon.',
    sourceRefs: [IL, GPI],
    profile: {
      tagline: 'Portugal\'s safety and visa at lower cost',
      summary:
        'Porto offers the same strengths as the rest of Portugal (7th in the Global Peace Index, a low D7 income bar, EU healthcare) for noticeably less than Lisbon. It is a compact, walkable river city with good hospitals and a growing international community.',
      scores: { cost: 3, healthcare: 4, safety: 5, visa: 4, climate: 3, community: 3 },
      facts: {
        healthcare: 'Large public hospitals (São João, Santo António) with typical SNS waits; expats widely use the private CUF, Lusíadas and Trofa hospitals.',
        safety: 'Portugal is 7th in the 2026 Global Peace Index; Porto has low crime apart from petty theft in the tourist centre.',
        visa: PT_VISA,
        tax: PT_TAX,
        climate: 'Atlantic: warm summers and cool, rainy, grey winters; cooler and wetter than Lisbon or the Algarve.',
        community: 'A smaller, newer English-speaking scene than Lisbon or the Algarve, growing fast with remote workers and retirees.',
        access: 'United has flown Newark–Porto in past summers, but 2026 service could not be confirmed; most trips connect via Lisbon or a European hub.',
      },
      drawbacks: [
        'Rainy, damp winters, and many older homes are poorly heated',
        'Fewer US nonstops than Lisbon',
        'Rents are rising fast with tourism, and there is no NHR tax break for newcomers',
      ],
      sources: [S.d7, S.ptTax, S.gpiTop50, S.united],
    },
  },
  {
    rank: 16,
    cityId: 'medellin',
    why: 'Colombia was 2nd in Expat Insider 2025 and is 15th in International Living\'s 2026 index, and Medellín is on Forbes\' 2026 list for its spring-like climate, low costs and good hospitals, though safety is weaker than at the cities above.',
    sourceRefs: [EI25, IL, FORBES],
    profile: {
      tagline: 'Spring-like climate, good hospitals, weaker safety',
      summary:
        'Colombia was 2nd in Expat Insider 2025 and is 15th in International Living\'s 2026 index, and Medellín pairs a mild climate all year with well-regarded private hospitals at low cost. Safety is the weak point: Colombia is 141st of 163 in the 2026 Global Peace Index and is reportedly at US State Dept Level 3.',
      scores: { cost: 4, healthcare: 4, safety: 2, visa: 3, climate: 5, community: 4 },
      facts: {
        healthcare:
          'Private hospitals such as Pablo Tobón Uribe, Clínica Las Américas and San Vicente Fundación are reportedly among Latin America\'s best ranked; residents with a cédula can join the EPS system, and many expats add a private plan.',
        safety:
          'Colombia is 141st of 163 in the 2026 Global Peace Index and reportedly at US State Dept Level 3, "reconsider travel" (March 2026), with warnings about scopolamine druggings and dating-app robberies in Medellín; expats cluster in El Poblado and Laureles.',
        visa:
          'M-Pensionado needs a pension of at least 3× the minimum wage (about COP 5.25 million a month in 2026), and portfolio income does not count; a portfolio-only retiree needs the M-Rentista, which one guide puts at 10× the minimum wage (about COP 17.5 million a month) and another at 5×; check current rules.',
        tax: 'Residents present more than 183 days in any 365 are taxed on worldwide income at up to 39%, so US dividends, interest and gains are reportable in Colombia; there is no US–Colombia income tax treaty, only US foreign tax credits (get local advice and check current rules).',
        climate: '"Eternal spring" at about 1,500 m: roughly 22–28°C by day all year, with two rainy seasons.',
        community:
          'A large, young-skewing expat and digital-nomad scene in El Poblado and Laureles, and a smaller retiree community in nearby Envigado and Sabaneta; Spanish helps a lot.',
        access:
          'Nonstops reportedly include Miami, Fort Lauderdale and New York-JFK (mostly Avianca), plus American to Miami and United to Houston; about 4 hours to South Florida (check current schedules).',
      },
      drawbacks: [
        'Worldwide taxation with no US–Colombia treaty, so investment income can face Colombian tax at up to 39%',
        'Crime that targets foreigners (druggings, dating-app setups, robbery), and a reported Level 3 US advisory',
        'The Pensionado visa needs an actual pension; living off a portfolio means the much higher Rentista bar',
      ],
      sources: [
        { name: 'Colombia Move: Pensionado visa income requirements 2026', url: 'https://colombiamove.com/blog/colombia-pensionado-visa-income-requirements-2026/' },
        { name: 'Greenback Tax Services: Tax guide for Americans living in Colombia', url: 'https://www.greenbacktaxservices.com/country-guide/tax-guide-for-americans-living-in-colombia/' },
        {
          name: 'El Espectador: Colombia falls in the Global Peace Index 2026',
          url: 'https://www.elespectador.com/mundo/america/colombia-retrocede-en-el-indice-global-de-paz-mientras-aumentan-los-conflictos-mundiales/',
          edition: '2026',
        },
        { name: 'Jetpac: Is it safe to travel to Colombia in 2026', url: 'https://blog.jetpacglobal.com/blog/is-it-safe-to-travel-to-colombia/' },
      ],
    },
  },
  {
    rank: 17,
    cityId: 'cuenca',
    why: 'Ecuador is 11th in International Living\'s 2026 index, and Cuenca combines the US dollar and a pensioner visa with some of the lowest costs on this list.',
    sourceRefs: [IL],
    profile: {
      tagline: 'Low-cost Andean city, US dollar, easy pensioner visa',
      summary:
        'Ecuador is 11th in International Living\'s 2026 index, uses the US dollar and offers a pensioner visa at about $1,446 a month, and Cuenca is a long-established US retiree base with some of the lowest costs on this list. The risk is security: Ecuador is 135th of 163 in the 2026 Global Peace Index, with the worst areas on the coast and borders.',
      scores: { cost: 5, healthcare: 3, safety: 3, visa: 4, climate: 4, community: 4 },
      facts: {
        healthcare:
          'Private hospitals such as Hospital del Río and Monte Sinaí reportedly give good care at low prices; residents with a cédula can join IESS public insurance from about $85 a month (2026), and complex cases may go to Quito or Guayaquil.',
        safety:
          'Ecuador is 135th of 163 in the 2026 Global Peace Index and reportedly at US State Dept Level 2 (renewed August 2026), with Level 4 zones on the coast, including part of Guayaquil, and along the borders; Cuenca is not among the higher-risk areas.',
        visa:
          'Pensioner visa: a foreign pension of at least 3× the basic wage, $1,446/month in 2026 (+$250 per dependant); the rentista visa takes investment returns at the same income, and the investor visa about $48,200 on deposit for 730 days or in property; 2 years of temporary residence, then permanent (official pages lag, so check current figures).',
        tax: 'Residents present 183+ days a year are taxed on worldwide income at up to 37%, with credit for foreign tax; sources disagree on whether foreign pensions are exempt, and there is no US–Ecuador income tax treaty (check current rules).',
        climate: 'Spring-like all year at about 2,560 m (roughly 10–22°C), with frequent rain; the altitude can matter for heart and lung conditions.',
        community: 'One of the largest US retiree communities in Latin America, with English-language groups and services; Spanish is still needed day to day.',
        access:
          'No commercial US flights from Cuenca: drive or fly to Guayaquil or Quito, which reportedly have nonstops to Miami, Fort Lauderdale, Houston, Atlanta and New York (check current schedules).',
      },
      drawbacks: [
        'Ecuador ranks low on safety (135th in the Global Peace Index), even if Cuenca has been calmer than the coast',
        'No US flights from Cuenca itself, so every trip home starts with a connection or a 3–4 hour drive',
        'The altitude, and cool, damp weather much of the year',
      ],
      sources: [
        { name: 'Rio Times: Residency in Ecuador for foreigners 2026', url: 'https://www.riotimesonline.com/residency-ecuador-foreigners-2026/' },
        { name: 'Rio Times: Retire in Ecuador 2026', url: 'https://www.riotimesonline.com/retire-in-ecuador-2026/' },
        {
          name: 'The Traveler: US renews Ecuador advisory, Guayaquil zone stays at Level 4 (Aug 2026)',
          url: 'https://www.thetraveler.org/us-renews-ecuador-travel-advisory-keeps-guayaquil-zone-at-level-4/',
        },
        { name: 'blogTO: Global Peace Index 2026 rankings', url: 'https://www.blogto.com/travel/2026/06/canada-ranking-most-peaceful-countries/', edition: '2026' },
        { name: 'Greenback Tax Services: Expat tax guide for Americans in Ecuador', url: 'https://www.greenbacktaxservices.com/country-guide/expat-taxes-for-ecuador/' },
      ],
    },
  },
  {
    rank: 18,
    cityId: 'madeira',
    why: 'Madeira has Portugal\'s strengths (4th in International Living\'s 2026 index, 7th in the Global Peace Index) and one of Europe\'s mildest climates, but limited flights.',
    sourceRefs: [IL, GPI],
    profile: {
      tagline: 'Portugal\'s safety and visa, spring-like all year',
      summary:
        'Madeira has Portugal\'s strengths (7th in the Global Peace Index, the low D7 income bar, EU healthcare) and one of Europe\'s mildest climates, warm and even all year. Residents also pay regional income tax rates up to 30% below the mainland, but it is an island with one main hospital and limited flights.',
      scores: { cost: 3, healthcare: 3, safety: 5, visa: 4, climate: 5, community: 3 },
      facts: {
        healthcare:
          'Legal residents can register with SESARAM, the regional public service (main hospital: Dr. Nélio Mendonça in Funchal); the private Hospital Particular da Madeira and Hospital da Luz Funchal have English-speaking staff, and highly specialised care generally means a transfer to Lisbon or Porto.',
        safety: 'Portugal is 7th in the 2026 Global Peace Index; Funchal has very low crime, and the main risks are steep roads, wildfires and landslides after heavy rain.',
        visa: PT_VISA,
        tax: 'NHR is closed to new arrivals; Madeira residents pay regional IRS rates up to 30% below the mainland (reportedly a 33.6% top rate vs 48%), and Portuguese-source dividends and interest reportedly 19.6% vs 28%; whether the cut reaches US-source dividends and gains is unclear, and the US–Portugal treaty applies (check current rules).',
        climate: 'Subtropical and very even: days roughly 19–20°C in winter and 25–26°C in summer, drier and sunnier on the south coast around Funchal.',
        community: 'A smaller English-speaking scene than the Algarve, mostly British and German retirees plus a growing remote-worker crowd.',
        access: 'United flies Newark–Madeira 3 times a week in summer (from 16 May 2026); the rest of the year, connect via Lisbon, Porto or another European hub.',
      },
      drawbacks: [
        'One main public hospital, and complex care can mean a flight to Lisbon',
        'Year-round US trips mean a connection; the Newark nonstop is summer-only',
        'Very hilly terrain, and housing has risen quickly with tourism and remote workers',
      ],
      sources: [
        S.d7,
        S.ptTax,
        {
          name: 'Cyril Jarnias: healthcare for expats in Madeira',
          url: 'https://www.jarniascyril.com/expatriation/settling-in-madeira-complete-guide-expats/healthcare-expatriates-madeira-complete-guide/',
        },
        S.unitedSummer,
        S.gpiTop50,
      ],
    },
  },
  {
    rank: 19,
    cityId: 'da-nang',
    why: 'Vietnam is 18th in International Living\'s 2026 index and was 5th in Expat Insider 2025, and Da Nang is an inexpensive beach city, but Vietnam\'s visa options for retirees are weak.',
    sourceRefs: [IL, EI25],
    profile: {
      tagline: 'Cheap, safe beach city without a retirement visa',
      summary:
        'Vietnam was 5th in Expat Insider 2025 and is 18th in International Living\'s 2026 index, and Da Nang offers long beaches and very low costs in a country 41st in the 2026 Global Peace Index. But Vietnam has no retirement visa, and serious medical care usually means Bangkok or Singapore.',
      scores: { cost: 5, healthcare: 2, safety: 4, visa: 1, climate: 3, community: 3 },
      facts: {
        healthcare:
          'Private hospitals (Vinmec Da Nang, Hoan My Da Nang) have 24/7 emergency departments and English-speaking staff for routine and urgent care; complex cases are often evacuated to Bangkok or Singapore, so evacuation cover is essential.',
        safety: 'Vietnam is 41st in the 2026 Global Peace Index; violent crime against foreigners is rare, but traffic is chaotic and petty theft and bag-snatching occur.',
        visa:
          'No retirement visa: most retirees use the 90-day multiple-entry e-visa ($50), which cannot be extended and does not reset on re-entry, so they leave and reapply; a residence card needs an investor visa tied to an active Vietnamese business (VND 3 billion+) or a Vietnamese spouse.',
        tax: 'Residents (183+ days a year, or a long lease) are taxed on worldwide income at 5–35%, with investment income at flat schedular rates; a US–Vietnam tax treaty was reportedly signed in 2015 but is not in force (check current rules).',
        climate: 'Hot and humid: a sunny dry season (roughly February–August), then the typhoon and flood season, usually September–December.',
        community: 'A growing expat community around An Thuong and My Khe beach, younger and smaller than Chiang Mai\'s; English is limited outside tourist areas.',
        access: 'No US nonstops; one stop via Seoul, Tokyo, Taipei, Hong Kong or Singapore, typically 20+ hours.',
      },
      drawbacks: [
        'No retirement visa: life on repeated 90-day e-visas, with no secure path to long-term residence',
        'Serious conditions mean evacuation to Bangkok or Singapore',
        'Typhoon and flood season, and a long trip to the US',
      ],
      sources: [
        { name: 'GetWhereNext: Vietnam retirement visa 2026, the honest truth', url: 'https://getwherenext.com/blog/vietnam-retirement-visa-2026-honest-truth' },
        { name: 'Vietnam Tourism: Healthcare in Da Nang for visitors', url: 'https://www.vietnamtourism.com/en/health/da-nang' },
        { ...S.timeoutGpi, name: 'Time Out: Vietnam 41st in the Global Peace Index 2026' },
        S.seaGpi,
      ],
    },
  },
  {
    rank: 20,
    cityId: 'montevideo',
    why: 'Uruguay is 13th in International Living\'s 2026 index and on Forbes\' 2026 list, with a stable government, straightforward residency and a tax holiday for new residents.',
    sourceRefs: [IL, FORBES],
    profile: {
      tagline: 'Stable, easy residency, long foreign-income tax holiday',
      summary:
        'Uruguay is 13th in International Living\'s 2026 index and 43rd in the 2026 Global Peace Index, the highest in Latin America, with straightforward residency and a tax holiday on foreign investment income for the arrival year plus 10. Montevideo is a calm, mid-priced capital with good private health cooperatives, but it is far from the US and its homicide rate has been rising.',
      scores: { cost: 3, healthcare: 4, safety: 3, visa: 4, climate: 3, community: 3 },
      facts: {
        healthcare:
          'Private nonprofit cooperatives (mutualistas) give full coverage for a monthly fee, alongside the public ASSE system; standards are good, and Montevideo has the country\'s main hospitals.',
        safety:
          'Uruguay is 43rd in the 2026 Global Peace Index and reportedly at US State Dept Level 2, but Montevideo\'s homicide rate was about 16 per 100,000 in 2025 and the first half of 2026 had Uruguay\'s most homicides since 2015; Pocitos, Punta Carretas and Carrasco are the calmer areas.',
        visa:
          'Residency on your own means ("medios de vida propios"): no legal minimum, but officials reportedly expect about $1,500/month from pensions, dividends or other passive income; processing can take 6–18 months, and you are legal while it is pending.',
        tax: 'New tax residents can exempt foreign dividends, interest and gains for the arrival year plus 10 (Law 20.446, from 2026; 183+ days\' presence qualifies, while the investment routes now need about $2 million in property); after that, one source says 6% for 5 years then 12%, another describes a 50% phase-in, and there is reportedly no US–Uruguay income tax treaty (check current rules).',
        climate: 'Temperate: warm, humid summers (December–March) and cool, damp, windy winters around 10°C.',
        community: 'A small but steady expat community, mostly Argentine and European; fewer US retirees and English speakers than the Mexican or Panamanian hubs.',
        access:
          'The only US nonstop is American\'s seasonal Miami–Montevideo (daily December to early March, then 3 a week until late March); otherwise connect via São Paulo, Panama City or Bogotá, roughly 12–15 hours.',
      },
      drawbacks: [
        'Rising violent crime in Montevideo despite Uruguay\'s national peace ranking',
        'Very few nonstop flights to the US, and none for most of the year',
        'Higher costs than most of Latin America, and grey, windy winters',
      ],
      sources: [
        {
          name: 'IMI Daily: Uruguay raises tax holiday threshold, taxes foreign income at 12% (Feb 2026)',
          url: 'https://www.imidaily.com/latin-america/uruguay-raises-tax-holiday-threshold-to-us2-million-taxes-foreign-income-at-12/',
        },
        { name: 'Liberty Mundo: Residency in Uruguay 2026', url: 'https://www.libertymundo.com/residency-in-uruguay/' },
        {
          name: 'Ámbito: Uruguay 43rd in the Global Peace Index 2026',
          url: 'https://www.ambito.com/uruguay/reafirma-su-lugar-los-paises-mas-pacificos-del-planeta-n6288498',
          edition: '2026',
        },
        { name: 'Rio Times: Is Uruguay safe for expats 2026', url: 'https://www.riotimesonline.com/is-uruguay-safe-expats-2026/' },
        {
          name: 'MercoPress: American Airlines resumes seasonal Montevideo–Miami route in December',
          url: 'https://en.mercopress.com/2026/08/11/american-airlines-resumes-its-seasonal-montevideo-miami-route-in-december',
        },
      ],
    },
  },
  {
    rank: 21,
    cityId: 'nice',
    why: 'France is 7th in International Living\'s 2026 index and scored best of all for healthcare, but Nice is expensive and French taxes are high.',
    sourceRefs: [IL],
    profile: {
      tagline: 'Riviera city with France\'s top-rated healthcare',
      summary:
        'France is 7th in International Living\'s 2026 index and scored best of all for healthcare, and Nice adds the Riviera\'s mild winters, a big English-speaking community and a year-round New York nonstop. It is expensive, and French tax on investment income and real estate is heavy for a large portfolio.',
      scores: { cost: 1, healthcare: 5, safety: 3, visa: 4, climate: 4, community: 4 },
      facts: {
        healthcare:
          'Visitor-visa holders can join the public PUMa system after 3 months\' residence (most add a top-up mutuelle); a contribution for non-EU visitor-visa holders passed in the 2026 social security law but its amount awaits a decree; the CHU de Nice and private clinics are strong.',
        safety:
          'France fell to 99th in the 2026 Global Peace Index, mostly on militarisation and nuclear factors, while homicide is very low; in Nice, pickpocketing and car break-ins are the common issues, and security stays visible since the 2016 attack.',
        visa:
          'Long-stay visitor visa (VLS-TS visiteur): stable passive income of roughly the net minimum wage (reportedly about €1,440/month in 2026), private health insurance and no work in France; renewed yearly at the prefecture at first.',
        tax: 'Residents are taxed on worldwide income; dividends, interest and securities gains face a 31.4% flat tax from 2026 (12.8% tax plus 18.6% social charges), and IFI wealth tax hits net real estate over €1.3M, with foreign property excluded for the first 5 years; the US–France treaty applies (check current rules).',
        climate: 'Mediterranean: about 300 sunny days, winter days around 13°C and hot summers near 28–30°C, with occasional heatwaves.',
        community: 'A large English-speaking community of British, American and Northern European residents along the Riviera, though daily life and paperwork run in French.',
        access:
          'La Compagnie (business class only) flies Newark–Nice year-round from the 2026–27 winter, and US carriers add summer New York flights; check current schedules.',
      },
      drawbacks: [
        'One of the most expensive places on this list, especially for housing',
        'The 31.4% flat tax and IFI on property weigh on a large taxable portfolio',
        'French bureaucracy (prefecture renewals, PUMa enrolment) is slow and in French',
      ],
      sources: [
        S.il,
        {
          name: 'Connexion: French MPs back health fee for visitor visas',
          url: 'https://www.connexionfrance.com/news/french-mps-back-new-health-fee-for-visitor-visas-and-target-americans/752385',
        },
        { name: 'Expat.com: France raises flat tax to 31.4%', url: 'https://www.expat.com/en/expat-mag/12501-france-raises-flat-tax-to-314-percent-what-it-means-for-expats.html' },
        {
          name: 'The Local: how France\'s wealth tax affects new arrivals (Oct 2026)',
          url: 'https://www.thelocal.fr/20261026/ask-the-expert-how-does-frances-wealth-tax-affect-new-arrivals',
        },
        {
          name: 'AviationPros: Nice gains first year-round New York service',
          url: 'https://www.aviationpros.com/airport-business/news/55384892/nice-airport-gains-first-year-round-new-york-service-as-la-compagnie-extends-route',
        },
      ],
    },
  },
  {
    rank: 22,
    cityId: 'florence',
    why: 'Italy is 6th in International Living\'s 2026 index and appears on Forbes\' 2026 list, and its elective-residence visa suits retirees, but Florence is one of the costlier cities here.',
    sourceRefs: [IL, FORBES],
    profile: {
      tagline: 'Renaissance city, strong healthcare, big American community',
      summary:
        'Italy is 6th in International Living\'s 2026 index and on Forbes\' 2026 list, and Florence offers world-class culture, good Tuscan public hospitals and a long-established American community. The elective-residence visa wants about €31,000 a year of passive income, and Florence does not qualify for Italy\'s 7% tax regime for pensioners.',
      scores: { cost: 1, healthcare: 4, safety: 4, visa: 3, climate: 3, community: 4 },
      facts: {
        healthcare:
          'Elective-residence holders need private insurance for the visa, then can join the public SSN voluntarily for at least €2,000 a year; Careggi is a major teaching hospital, and Tuscany\'s public system is among Italy\'s better ones.',
        safety: 'Italy is 35th in the 2026 Global Peace Index; violent crime is low, with pickpocketing around the Duomo, the station and on buses.',
        visa:
          'Elective-residence visa: stable passive income of about €31,000/year (a consular benchmark, not a statute; more for a spouse); pensions, dividends, interest and rent count, savings alone do not, and no work is allowed, even remote.',
        tax: 'Residents are taxed on worldwide income; dividends, interest and gains are taxed at 26%, plus IVAFE of 0.2% a year on foreign financial accounts; the 7% pensioner regime covers only small southern and quake-zone towns, so not Florence; check current rules.',
        climate: 'Hot, humid summers often above 35°C in the river basin, and cool, damp winters with occasional frost.',
        community: 'A large, long-established American and British community, helped by many US university programmes; English is common in the centre.',
        access: 'No regular US nonstop to Florence or Pisa could be confirmed for 2026; most trips go via Rome (about 1.5 hours by fast train), Milan or a European hub.',
      },
      drawbacks: [
        'Very expensive housing in the centre, and heavy tourist crowds most of the year',
        '26% on investment income plus a yearly tax on foreign accounts, and no 7% regime',
        'The visa needs proven passive income, so a portfolio-only retiree with low dividends may struggle',
      ],
      sources: [
        S.il,
        { name: 'Global Citizen Solutions: Italy elective residence visa 2026', url: 'https://www.globalcitizensolutions.com/italy-elective-residence-visa/' },
        {
          name: 'The Local: is Italy\'s flat tax for pensioners still available in 2026',
          url: 'https://www.thelocal.it/20260128/is-italys-flat-tax-rate-for-pensioners-still-available-in-2026',
        },
        S.gpiTop50,
      ],
    },
  },
  {
    rank: 23,
    cityId: 'bangkok',
    why: 'Thailand is 9th in International Living\'s 2026 index and 3rd in Expat Insider 2026, and Bangkok has the country\'s top medical-tourism hospitals and its main international airport.',
    sourceRefs: [IL, EI26],
    profile: {
      tagline: 'World-class private hospitals, big-city Asian hub',
      summary:
        'Thailand is 9th in International Living\'s 2026 index and 3rd in Expat Insider 2026, and Bangkok\'s private hospitals are among Asia\'s leading medical-tourism centres. It has the same 50+ retirement visa as Chiang Mai, plus a 10-year LTR visa for wealthier retirees that reportedly exempts foreign income from Thai tax.',
      scores: { cost: 4, healthcare: 4, safety: 3, visa: 4, climate: 3, community: 4 },
      facts: {
        healthcare:
          'Internationally accredited private hospitals (Bumrungrad, Bangkok Hospital, Samitivej) with English-speaking, often US-trained specialists, well below US prices; foreigners rely on private insurance.',
        safety:
          'Thailand scores 2.089 in the 2026 Global Peace Index, 8th in Southeast Asia (its global rank could not be confirmed; it was 86th in 2025); street crime is low, but road safety is poor and political protests recur.',
        visa:
          'Retirement visa (Non-O or O-A, age 50+): 800,000 baht held in a Thai bank, with yearly extensions and 90-day reporting; or the 10-year LTR "Wealthy Pensioner" visa (50+): $80,000/year of passive income, investment returns included (or $40,000 plus $250,000 invested in Thailand), with yearly instead of 90-day reporting.',
        tax: 'Since 2024, residents present 180+ days a year are taxed on foreign income remitted into Thailand, at up to 35%; LTR holders are reportedly exempt on foreign income, proposed relief for everyone else has not been enacted, and the US–Thailand treaty applies (check current rules).',
        climate: 'Hot and humid all year (about 30–35°C), with a wet season (roughly June–October) that floods streets, and smoggy air in the dry months.',
        community: 'A large expat community along Sukhumvit and in Sathorn, with plenty of English-language services, though more working expats than retirees.',
        access: 'No US nonstops; one stop via Tokyo, Seoul, Taipei or Hong Kong (United flies Los Angeles–Bangkok via Hong Kong), typically 18–22 hours.',
      },
      drawbacks: [
        'Relentless heat, rainy-season flooding and dry-season air pollution',
        'Foreign income you bring into Thailand can be taxed unless you qualify for the LTR visa',
        'A sprawling, congested city, and far from the US',
      ],
      sources: [
        {
          name: 'Issa Compass: Wealthy Pensioner LTR visa requirements (updated Oct 2026)',
          url: 'https://www.issacompass.com/insights/wealthy-pensioner-ltr-visa-income-requirements-the-10-year-structure-and-how-to-',
        },
        S.thRetire,
        {
          name: 'Thai Law Online: Thailand foreign income remittance tax, what applies in 2026',
          url: 'https://www.thailawonline.com/thailand-foreign-income-tax-2026-what-actually-applies/',
        },
        S.seaGpi,
      ],
    },
  },
  {
    rank: 24,
    cityId: 'split',
    why: 'Croatia is 19th in International Living\'s 2026 index, and Split offers EU safety on the Adriatic coast, with a smaller expat community than the cities above.',
    sourceRefs: [IL],
    profile: {
      tagline: 'Safe Adriatic city, but no retiree visa',
      summary:
        'Croatia is 19th in International Living\'s 2026 index and 23rd in the Global Peace Index, and Split pairs a Roman old town and the Adriatic islands with low tax on investment income. The catch is residency: Croatia has no retirement visa, so a non-EU retiree gets permits of up to a year, with a wait between them.',
      scores: { cost: 3, healthcare: 3, safety: 4, visa: 1, climate: 4, community: 2 },
      facts: {
        healthcare:
          'Temporary-stay holders must join the public HZZO, reportedly about €70–100/month; KBC Split is the regional teaching hospital, private clinics are affordable, and outside private care Croatian is often needed.',
        safety: 'Croatia is 23rd in the 2026 Global Peace Index; violent crime is rare, and petty theft in peak season is the main issue.',
        visa:
          'No retiree visa: "other purposes" temporary stay (for example renting or owning a home) is granted for up to a year, then you must wait 6 months before reapplying; the digital-nomad permit needs remote work, and between permits Schengen\'s 90/180-day rule applies.',
        tax: 'Residents are taxed on worldwide income, with dividends, interest and gains at a flat 12%; gains on assets held long enough are reportedly exempt, but summaries disagree on the period (two years or 12 months), and a US–Croatia treaty was reportedly signed in 2022 but is not yet in force (check current rules).',
        climate: 'Mediterranean: hot, dry summers around 30°C and mild winters around 10–12°C, with the cold bura wind on some winter days.',
        community: 'A small English-speaking resident scene; Split is busy with tourists and cruise passengers in summer and much quieter in winter.',
        access: 'United flies Newark–Split 3 times a week in summer (from 30 April 2026, its first nonstop); otherwise connect via Zagreb or a European hub.',
      },
      drawbacks: [
        'No stable long-term residence route for a non-EU retiree',
        'Peak-season crowds, and summer short-term rentals squeeze year-round leases',
        'A small English-speaking community, and healthcare and paperwork mostly in Croatian',
      ],
      sources: [
        {
          name: 'Croatian Ministry of Interior: temporary stay of third-country nationals',
          url: 'https://mup.gov.hr/aliens-281621/stay-and-work/temporary-stay-of-third-country-nationals/281661',
        },
        { name: 'Croatian Ministry of Foreign Affairs: temporary residence', url: 'https://mvep.gov.hr/temporary-residence-247155/247155' },
        { name: 'Total Croatia News: retiring in Croatia as a non-EU national', url: 'https://total-croatia-news.com/lifestyle/retiring-in-croatia/' },
        S.unitedSummer,
        S.gpiTop50,
      ],
    },
  },
  {
    rank: 25,
    cityId: 'bali',
    why: 'Bali is 22nd in International Living\'s 2026 index and Indonesia was 8th in Expat Insider 2025, with a retirement visa for people 55 and over, but healthcare is limited and Indonesia is 69th in the Global Peace Index.',
    sourceRefs: [IL, EI25, GPI],
    profile: {
      tagline: 'Island lifestyle, retirement visa, limited hospitals',
      summary:
        'Bali is 22nd in International Living\'s 2026 index and Indonesia was 8th in Expat Insider 2025, with a retirement KITAS (from age 55, though some guides say 60) and a large international community in Canggu, Ubud and Sanur. Healthcare is the main limit: serious cases are usually evacuated to Singapore.',
      scores: { cost: 4, healthcare: 2, safety: 3, visa: 3, climate: 3, community: 4 },
      facts: {
        healthcare:
          'Private hospitals (BIMC, Siloam) handle routine and emergency care with English-speaking staff, but complex cases are usually evacuated to Singapore, so evacuation cover is essential.',
        safety: 'Indonesia is 69th in the 2026 Global Peace Index; violent crime against foreigners is rare in Bali, but scooter accidents, petty theft and scams are common.',
        visa:
          'Retirement KITAS (E33F): sources disagree on the age (55, or 60 in some 2026 guides) and the income (a foreign pension or retirement income of $1,500 or $3,000/month; IRA and 401(k) income reportedly count); it also needs a licensed local sponsor, a lease, health insurance and reportedly a hired Indonesian household worker, is renewed yearly and can become a 5-year KITAP after 4 years; the Second Home visa reportedly needs about IDR 2 billion (about $120,000) on deposit.',
        tax: 'KITAS holders and anyone present 183+ days are generally Indonesian tax residents, taxed on worldwide income at 5–35%; the 4-year foreign-income exemption is for foreign experts, generally not retirees, and a US–Indonesia treaty reportedly applies (get local advice and check current rules).',
        climate: 'Tropical: hot and humid all year, with a wet season (roughly November–March); Ubud\'s hills are a little cooler.',
        community: 'A very large international community, skewed to younger digital nomads in Canggu; retirees tend to prefer Sanur and Ubud.',
        access: 'No US nonstops; one or two stops via Singapore, Tokyo, Seoul or Doha, typically 24+ hours.',
      },
      drawbacks: [
        'Serious medical care usually means evacuation to Singapore',
        'Visa rules shift often (sources disagree on the age and income bar) and need a paid sponsor, and foreigners cannot own land outright',
        'Traffic, overdevelopment and overtourism in the south, and a very long trip to the US',
      ],
      sources: [
        { name: 'Liberty Mundo: Retire in Indonesia, the E33F visa and residency guide (2026)', url: 'https://www.libertymundo.com/retire-in-indonesia/' },
        {
          name: 'Let\'s Move Indonesia: Retirement KITAS regulation update',
          url: 'https://www.letsmoveindonesia.com/retirement-kitas-regulation-update-allows-5-years-stay-for-expatriates/',
        },
        { name: 'BIMC Hospital Bali: Emergency medical evacuation program', url: 'https://bimcbali.com/medical-evacuation-program' },
        { ...S.timeoutGpi, name: 'Time Out: Indonesia 69th in the Global Peace Index 2026' },
      ],
    },
  },
]

const PICK_BY_CITY: Record<string, ExpatPick> = Object.fromEntries(EXPAT_PICKS.map((p) => [p.cityId, p]))

/** The pick for a city, or undefined if it isn't in the top 25. */
export function expatPickFor(cityId: string): ExpatPick | undefined {
  return PICK_BY_CITY[cityId]
}

/** Picks that carry a full profile (all 25), in rank order. */
export function topProfiles(): (ExpatPick & { profile: ExpatProfile })[] {
  return EXPAT_PICKS.filter((p): p is ExpatPick & { profile: ExpatProfile } => p.profile !== undefined)
}
