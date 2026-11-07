// Top 75 retirement destinations for US expats living on buy-borrow-die (BBD), each
// with a full profile.
//
// The rank follows eVelo's BBD destinations research (docs/research/bbd-ranking-2026-11.md)
// on top of the published rankings (EXPAT_RANKING_SOURCES); the 1–5 factor scores are
// eVelo's own assessment, following EXPAT_SCORE_RUBRIC. Research was done on EXPAT_AS_OF
// from the sources cited here. Visa and tax rules change often: every profile is a
// starting point, not legal or tax advice.
//
// Profiles live one per city in ./profiles/<cityId>.ts (see ./profiles/README.md) and are
// picked up by the glob below, so adding a profile needs no edit here.

export type ExpatScoreKey =
  | 'cost'
  | 'healthcare'
  | 'safety'
  | 'visa'
  | 'climate'
  | 'community'
  | 'tax'
  | 'estate'
  | 'lending'

export type ExpatScore = 1 | 2 | 3 | 4 | 5

export interface ExpatSource {
  name: string
  url: string
  edition?: string
}

export interface ExpatFacts {
  healthcare: string
  safety: string
  /** Residency: routes that accept assets or passive income. */
  visa: string
  /** Tax on holding the portfolio: wealth tax, dividends, interest, foreign income. */
  tax: string
  /** Inheritance or estate tax reaching US assets left to US-resident children. */
  estate: string
  /** US-broker and margin access for residents (secondary-sourced: "reported"). */
  lending: string
  climate: string
  community: string
  access: string
}

export interface ExpatProfile {
  tagline: string
  summary: string
  /** eVelo's own 1–5 assessment, 5 = best for a US BBD retiree; see EXPAT_SCORE_RUBRIC. */
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
  visa: 'Residency',
  climate: 'Climate',
  community: 'Community',
  tax: 'Tax on holdings',
  estate: 'Estate',
  lending: 'Lending',
}

/** What 1–5 means for each score (5 = best for a US BBD retiree). */
export const EXPAT_SCORE_RUBRIC: Record<ExpatScoreKey, string> = {
  cost: '5 = very low living costs for a US retiree (well under half of a typical US city); 3 = moderately cheaper than the US; 1 = as costly as a high-cost US city or more.',
  healthcare:
    '5 = excellent hospitals nearby with easy access for foreign residents; 3 = decent private care, with serious cases a trip away; 1 = weak local care, with evacuation needed for anything serious.',
  safety: '5 = among the world\'s safest places (Global Peace Index top tier, low crime); 3 = average, with petty crime or uneven areas; 1 = serious safety concerns or a high travel advisory.',
  visa: '5 = a straightforward long-term or permanent route on assets or passive income at a modest threshold; 3 = a workable route with a high threshold, a pension requirement or heavy paperwork; 1 = no realistic residency route for a retiree living on a portfolio.',
  climate: '5 = mild and pleasant most of the year; 3 = comfortable with a hard season (heat, humidity, rain or cold); 1 = hard climate much of the year.',
  community: '5 = a large, established English-speaking expat and retiree community; 3 = a modest one; 1 = few English-speaking foreigners.',
  tax: '5 = no wealth tax, and foreign dividends/interest untaxed or ≤5% (territorial, non-dom or exempt regime); 4 = no wealth tax and ≤15% on dividends, or a long exemption window; 3 = no wealth tax and 19–30% on dividends; 2 = a wealth tax above a high threshold (≥ ~$2M), or dividends taxed above 30% with surcharges; 1 = a wealth tax from a low threshold or on the gross portfolio.',
  estate:
    '5 = no inheritance tax reaching US assets left to US-resident children; 4 = ≤5%, or an allowance ≥ $1M per child; 3 = top rate ≤10%; 2 = top rate 11–35%; 1 = top rate above 35% on the worldwide estate. A regime whose reach over US assets left to US-resident heirs is only inferred, not confirmed, scores one point lower.',
  lending:
    '5 = margin borrowing for residents confirmed by IBKR and Schwab International (none confirmed as of 2026-11); 4 = Schwab International reported to accept residents (outside the EU) plus IBKR, margin terms unconfirmed; 3 = IBKR only, or EU residence where Schwab reportedly restricts cash-out by margin; 2 = IBKR only, and even that uncertain; 1 = no known US broker.',
}

const IL = 'International Living Global Retirement Index'
const LIOS = 'Live and Invest Overseas Retire Overseas Index'
const EI26 = 'InterNations Expat Insider 2026'
const EI25 = 'InterNations Expat Insider 2025'
const IN_CITY = 'InterNations Expat City Ranking'
const GPI = 'Global Peace Index'
const FORBES = 'Forbes: best places for Americans to retire abroad'
const BBD = 'eVelo BBD destinations research'

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
  {
    name: BBD,
    edition: '2026-11 (41 countries)',
    url: 'https://github.com/onedigerati/eVelo-v2/blob/main/docs/research/bbd-ranking-2026-11.md',
    whatItRanks: 'Country wealth, inheritance, dividend and residency rules, US-broker access and healthcare, sourced.',
  },
]

export const EXPAT_RANKING_METHOD =
  'The ranking is judged for a US retiree living on buy-borrow-die: a taxable US portfolio that is never sold, spending borrowed against it, and an estate passed to heirs. ' +
  'eVelo\'s BBD destinations research weighs, country by country, the tax on holding and passing on that portfolio (wealth tax, dividends and interest, inheritance tax), residency routes that accept assets or passive income, whether US brokers will keep lending to residents, and healthcare and insurance into old age. ' +
  'That sits on top of the published rankings: the two retiree-specific indexes (International Living and Live and Invest Overseas), expat-satisfaction surveys (InterNations) and the Global Peace Index as a safety check. ' +
  'The factor scores are eVelo\'s own 1–5 assessment of each city on a published rubric, separate from the rank, so they won\'t always line up with it.'

// One profile per city: ./profiles/<cityId>.ts, default export. Files starting with "_"
// (shared sources) are not profiles.
const PROFILE_MODULES = import.meta.glob<ExpatProfile>(['./profiles/*.ts', '!./profiles/_*.ts'], {
  eager: true,
  import: 'default',
})

/** Profiles keyed by city id (the file name). */
export const EXPAT_PROFILES: Record<string, ExpatProfile> = Object.fromEntries(
  Object.entries(PROFILE_MODULES).map(([path, profile]) => [path.replace(/^.*\/([^/]+)\.ts$/, '$1'), profile]),
)

type Ranked = Omit<ExpatPick, 'profile'>

const RANKING: Ranked[] = [
  {
    rank: 1,
    cityId: 'algarve',
    why: 'No wealth tax, children inherit free, the D7 visa accepts dividend income, and the Algarve adds EU healthcare, safety and a large English-speaking retiree community.',
    sourceRefs: [BBD, LIOS, IL, EI26, GPI],
  },
  {
    rank: 2,
    cityId: 'lisbon',
    why: 'Portugal\'s BBD tax profile (no wealth tax, children inherit free), with the country\'s airport hub and international hospitals.',
    sourceRefs: [BBD, IL, EI26, GPI],
  },
  {
    rank: 3,
    cityId: 'paphos',
    why: 'The best BBD tax profile in the EU (non-dom dividends and interest effectively capped at the 2.65% health levy, no wealth or inheritance tax), with cheap Category F residence, GeSY healthcare and a large English-speaking retiree base.',
    sourceRefs: [BBD],
  },
  {
    rank: 4,
    cityId: 'panama-city',
    why: 'Territorial tax, no estate tax and the US dollar, with Central America\'s top private hospitals and Copa\'s hub, though non-pensioners need about $200k placed in Panama.',
    sourceRefs: [BBD, IL, EI26],
  },
  {
    rank: 5,
    cityId: 'boquete',
    why: 'Panama\'s tax profile in a cool highland town that Live and Invest Overseas ranks 1st, with hospitals in David about an hour away.',
    sourceRefs: [BBD, LIOS, IL, EI26, EI25],
  },
  {
    rank: 6,
    cityId: 'kuala-lumpur',
    why: 'Foreign income is exempt to 2036, there is no estate tax and hospitals are excellent and cheap, though the MM2H deposit and property are the cost of entry.',
    sourceRefs: [BBD, IL, EI26, GPI],
  },
  {
    rank: 7,
    cityId: 'porto',
    why: 'Portugal\'s BBD tax profile at a lower cost than Lisbon.',
    sourceRefs: [BBD, IL, GPI],
  },
  {
    rank: 8,
    cityId: 'cascais',
    why: 'Lisbon\'s tax profile on the coast, close to Lisbon\'s airport and hospitals.',
    sourceRefs: [BBD, IL, EI26, GPI],
  },
  {
    rank: 9,
    cityId: 'malaga',
    why: 'Andalusia has no wealth tax below about €3.7M and 99% inheritance relief, with Spanish healthcare, though the wealth tax bites above that.',
    sourceRefs: [BBD, IN_CITY, IL],
  },
  {
    rank: 10,
    cityId: 'madrid',
    why: 'The Madrid region relieves wealth tax up to about €3.7M and gives children 99% inheritance relief, with accredited hospitals and many US nonstops.',
    sourceRefs: [BBD, IL, EI26],
  },
  {
    rank: 11,
    cityId: 'athens',
    why: 'Greece taxes dividends at 5%, has a US estate tax treaty and taxes children\'s inheritances at no more than 10% above €600k.',
    sourceRefs: [BBD, IL, FORBES],
  },
  {
    rank: 12,
    cityId: 'penang',
    why: 'Malaysia\'s tax profile at a lower cost than Kuala Lumpur, with hospitals that draw medical tourists.',
    sourceRefs: [BBD, IL, GPI],
  },
  {
    rank: 13,
    cityId: 'crete',
    why: 'Greece\'s tax profile and a warm climate on the island Live and Invest Overseas ranks 5th, with hospitals in Heraklion and Chania.',
    sourceRefs: [BBD, LIOS, IL],
  },
  {
    rank: 14,
    cityId: 'tavira',
    why: 'Portugal\'s BBD tax profile in the quieter eastern Algarve, with the accredited CUF Faro hospital 30 to 40 minutes away and a seasonal Faro–Newark flight, though the town has no 24-hour emergency unit.',
    sourceRefs: [BBD, IL, EI26, GPI],
  },
  {
    rank: 15,
    cityId: 'valencia',
    why: 'A €2M wealth-tax exemption from 2026 and 99% inheritance relief, though larger portfolios fare worse than in Málaga.',
    sourceRefs: [BBD, IN_CITY, EI26, IL],
  },
  {
    rank: 16,
    cityId: 'madeira',
    why: 'Portugal\'s BBD tax profile with one of Europe\'s mildest climates, but limited flights.',
    sourceRefs: [BBD, IL, GPI],
  },
  {
    rank: 17,
    cityId: 'montevideo',
    why: 'An 11-year tax holiday on foreign capital income, no inheritance tax and good mutualista care, for residents who spend 183 or more days a year there.',
    sourceRefs: [BBD, IL, FORBES],
  },
  {
    rank: 18,
    cityId: 'limassol',
    why: 'Cyprus\'s tax profile with the best hospitals on the island, at a higher cost than Paphos.',
    sourceRefs: [BBD],
  },
  {
    rank: 19,
    cityId: 'sliema',
    why: 'Malta\'s remittance basis lets dividends stay in the US account, with no wealth or inheritance tax and English spoken, though only IBKR is known to serve residents and the old terms need an application by 31 Dec 2026.',
    sourceRefs: [BBD],
  },
  {
    rank: 20,
    cityId: 'grand-baie',
    why: 'Mauritius taxes foreign income only when it is remitted and has no wealth, inheritance or capital gains tax, with a retired permit on about $2,000 a month and private hospitals, but it is far from the US and exposed to cyclones.',
    sourceRefs: [BBD],
  },
  {
    rank: 21,
    cityId: 'antalya',
    why: 'Turkey\'s new-resident regime exempts foreign income for 20 years with 1% inheritance tax, at a low cost with good private hospitals, against lira volatility and a $200k property route.',
    sourceRefs: [BBD],
  },
  {
    rank: 22,
    cityId: 'antigua-guatemala',
    why: 'Territorial tax, inheritance tax repealed in 2026 and permanent residence on $1,250 a month, with serious care about an hour away in Guatemala City.',
    sourceRefs: [BBD],
  },
  {
    rank: 23,
    cityId: 'tbilisi',
    why: 'Foreign-source income is exempt, children inherit free and $150k of property gives residence, though healthcare is uneven and there is no US tax treaty.',
    sourceRefs: [BBD],
  },
  {
    rank: 24,
    cityId: 'san-jose-cr',
    why: 'Territorial tax today, but a pending bill would tax foreign passive income at about 15%, so it ranks lower on that risk.',
    sourceRefs: [BBD, IL, FORBES],
  },
  {
    rank: 25,
    cityId: 'lake-chapala',
    why: 'Mexico\'s largest US-retiree enclave, with Guadalajara\'s flights and hospitals nearby, though Mexico taxes dividends.',
    sourceRefs: [BBD, IL, EI26],
  },
  {
    rank: 26,
    cityId: 'chiang-mai',
    why: 'Very low costs, and the LTR visa exempts foreign income, but insurance entry ages and the tax on brought-in loan proceeds are uncertain.',
    sourceRefs: [BBD, IL, EI26],
  },
  {
    rank: 27,
    cityId: 'bangkok',
    why: 'Thailand\'s top hospitals and main airport, with the same Thai tax caveats as Chiang Mai.',
    sourceRefs: [BBD, IL, EI26],
  },
  {
    rank: 28,
    cityId: 'merida',
    why: 'Easy residency on savings, safety and IMSS cover, but Mexico taxes dividends at up to 35% plus 10%.',
    sourceRefs: [BBD, FORBES],
  },
  {
    rank: 29,
    cityId: 'hua-hin',
    why: 'The beach town Live and Invest Overseas ranks 8th, with Bangkok Hospital Hua Hin and the Thai tax caveats.',
    sourceRefs: [BBD, LIOS, IL, EI26],
  },
  {
    rank: 30,
    cityId: 'coronado',
    why: 'Panama\'s tax profile on the beach, with about 4,000 expats and hospitals 1 to 1.5 hours away.',
    sourceRefs: [BBD, IL, EI26],
  },
  {
    rank: 31,
    cityId: 'atenas',
    why: 'About 1,500 expats 30 minutes from San José\'s airport, with the same Costa Rica tax-bill risk.',
    sourceRefs: [BBD, IL],
  },
  {
    rank: 32,
    cityId: 'alicante',
    why: 'The Valencian Community\'s €2M wealth-tax exemption and 99% inheritance relief at a lower cost than Valencia, but no US nonstops.',
    sourceRefs: [BBD, IL, EI26],
  },
  {
    rank: 33,
    cityId: 'torrevieja',
    why: 'The Valencian rules as in Alicante, with an accredited Quirónsalud hospital and a large retiree community, against autumn flash-flood risk.',
    sourceRefs: [BBD, IL, EI26],
  },
  {
    rank: 34,
    cityId: 'phuket',
    why: 'An accredited Bangkok Hospital on the island, with the Thai tax caveats and no US nonstops.',
    sourceRefs: [BBD, IL, EI26],
  },
  {
    rank: 35,
    cityId: 'puerto-vallarta',
    why: 'Direct flights to many US cities and a big retiree community, held back by Mexico\'s dividend tax.',
    sourceRefs: [BBD, LIOS, FORBES, EI26, IL],
  },
  {
    rank: 36,
    cityId: 'san-miguel-de-allende',
    why: 'Mexico\'s classic US-retiree enclave, held back by Mexico\'s dividend tax.',
    sourceRefs: [BBD, FORBES],
  },
  {
    rank: 37,
    cityId: 'la-paz',
    why: 'A quiet Baja retiree city with a US Level 2 advisory and no UK warning, held back by Mexico\'s dividend tax and a single US nonstop.',
    sourceRefs: [BBD, IL, EI26],
  },
  {
    rank: 38,
    cityId: 'kotor',
    why: 'No wealth tax, 15% on investment income, inheritance tax on real estate only and residence through property, but healthcare is weak.',
    sourceRefs: [BBD],
  },
  {
    rank: 39,
    cityId: 'cayo',
    why: 'Belize\'s QRP exempts foreign income and accepts investment income in a low-cost district Live and Invest Overseas ranks 7th, but healthcare is weak, so budget for international cover with evacuation.',
    sourceRefs: [BBD, LIOS],
  },
  {
    rank: 40,
    cityId: 'hopkins',
    why: 'Belize\'s QRP in a beach village about 30 minutes from Dangriga\'s hospital, the best Belize beach option for care, with hurricane exposure.',
    sourceRefs: [BBD],
  },
  {
    rank: 41,
    cityId: 'corozal',
    why: 'Belize\'s QRP with private care 26 minutes away in Chetumal, Mexico, against a history of hurricanes.',
    sourceRefs: [BBD],
  },
  {
    rank: 42,
    cityId: 'santiago',
    why: 'Foreign income is untaxed for the first three years and foreigners\' assets abroad fall outside inheritance tax, with strong clinics, but worldwide tax applies after year three.',
    sourceRefs: [BBD],
  },
  {
    rank: 43,
    cityId: 'prague',
    why: 'A 15% option on dividends, no wealth tax, children inherit free and EU healthcare, but the visa is discretionary.',
    sourceRefs: [BBD],
  },
  {
    rank: 44,
    cityId: 'plovdiv',
    why: 'Bulgaria taxes dividends at 5%, children inherit free and Acibadem runs private care in the city, but residence needs a pension.',
    sourceRefs: [BBD],
  },
  {
    rank: 45,
    cityId: 'istanbul',
    why: 'Turkey\'s new-resident regime with top private hospitals and a major hub, against higher costs and lira volatility.',
    sourceRefs: [BBD],
  },
  {
    rank: 46,
    cityId: 'mexico-city',
    why: 'Accredited hospitals and easy residency, against Mexico\'s dividend tax, altitude and a mixed safety picture.',
    sourceRefs: [BBD, IL, EI26],
  },
  {
    rank: 47,
    cityId: 'budapest',
    why: 'Children inherit free and a €250k fund investment gives residence, but dividends carry 15% plus a social contribution.',
    sourceRefs: [BBD],
  },
  {
    rank: 48,
    cityId: 'chiang-rai',
    why: 'Very low costs with the Thai tax caveats, and burning-season smoke that pushed the air-quality index to 269 in April 2026.',
    sourceRefs: [BBD, IL, EI26],
  },
  {
    rank: 49,
    cityId: 'taipei',
    why: 'Excellent healthcare and safety and estate tax on Taiwan-sited assets only, but no passive residence route.',
    sourceRefs: [BBD],
  },
  {
    rank: 50,
    cityId: 'asuncion',
    why: 'Territorial tax with no wealth or inheritance tax, though healthcare and the residency means test are unverified.',
    sourceRefs: [BBD],
  },
  {
    rank: 51,
    cityId: 'lima',
    why: 'No wealth or inheritance tax and a rentista visa on $1,000 a month, but foreign dividends are taxed at up to 30%.',
    sourceRefs: [BBD],
  },
  {
    rank: 52,
    cityId: 'oaxaca',
    why: 'Culture and low costs, against Mexico\'s dividend tax and thin hospitals.',
    sourceRefs: [BBD, IL, EI26],
  },
  {
    rank: 53,
    cityId: 'las-terrenas',
    why: 'Law 171-07 shields declared rentista income and inheritance tax is 3%, but serious care is far and Schwab International is unavailable.',
    sourceRefs: [BBD],
  },
  {
    rank: 54,
    cityId: 'medellin',
    why: 'Great hospitals and climate, but Colombia\'s wealth tax above about $1.2M, dividends taxed up to 39% and 15% on inheritances rank it low for BBD.',
    sourceRefs: [BBD, EI25, IL, FORBES],
  },
  {
    rank: 55,
    cityId: 'florence',
    why: 'A good elective-residence visa and healthcare, but Italy\'s 0.2% yearly IVAFE on the portfolio and 26% on dividends rank it low.',
    sourceRefs: [BBD, IL, FORBES],
  },
  {
    rank: 56,
    cityId: 'playa-del-carmen',
    why: 'A beach town with Cancún\'s flights, against a small hospital, cartel incidents, hurricanes and Mexico\'s dividend tax.',
    sourceRefs: [BBD, IL, EI26],
  },
  {
    rank: 57,
    cityId: 'cuenca',
    why: 'Cheap, dollarized and an easy rentista visa, but Ecuador\'s inheritance tax of up to 35% reaches foreign assets.',
    sourceRefs: [BBD, IL],
  },
  {
    rank: 58,
    cityId: 'nice',
    why: 'The best healthcare in the set, but France\'s 5–45% worldwide inheritance tax and 31.4% on dividends rank it low.',
    sourceRefs: [BBD, IL],
  },
  {
    rank: 59,
    cityId: 'roatan',
    why: 'Territorial tax, no inheritance tax and a rentista visa on $2,500 a month, but the island\'s public hospital burned in 2024, serious cases fly out and a worldwide-income bill could return.',
    sourceRefs: [BBD],
  },
  {
    rank: 60,
    cityId: 'sarande',
    why: 'Heirs inherit free, dividends are taxed at 8% and US citizens can stay a year visa-free, but local healthcare is weak, the permit is for pensioners and the property route is unclear.',
    sourceRefs: [BBD],
  },
  {
    rank: 61,
    cityId: 'langkawi',
    why: 'Malaysia\'s tax profile on a resort island, but with no private hospital on it.',
    sourceRefs: [BBD, IL, GPI],
  },
  {
    rank: 62,
    cityId: 'volcan',
    why: 'Panama\'s tax profile in a highland town near David, with small, dated healthcare data.',
    sourceRefs: [BBD, IL, EI26],
  },
  {
    rank: 63,
    cityId: 'panajachel',
    why: 'Guatemala\'s tax profile on Lake Atitlán, with serious care about three hours away in Guatemala City.',
    sourceRefs: [BBD],
  },
  {
    rank: 64,
    cityId: 'placencia',
    why: 'Belize\'s QRP, but there is no hospital on the peninsula and hurricanes are a risk.',
    sourceRefs: [BBD],
  },
  {
    rank: 65,
    cityId: 'ambergris-caye',
    why: 'Belize\'s QRP, but there is no hospital on the island.',
    sourceRefs: [BBD],
  },
  {
    rank: 66,
    cityId: 'split',
    why: 'Croatia\'s taxes suit BBD, but there is no residence route for a retiree.',
    sourceRefs: [BBD, IL],
  },
  {
    rank: 67,
    cityId: 'batumi',
    why: 'Georgia\'s tax profile on the Black Sea, with weaker healthcare and flights than Tbilisi.',
    sourceRefs: [BBD],
  },
  {
    rank: 68,
    cityId: 'gascony',
    why: 'France\'s inheritance tax and long distances to rural healthcare rank it low.',
    sourceRefs: [BBD, IL],
  },
  {
    rank: 69,
    cityId: 'rome',
    why: 'Italy\'s 0.2% yearly IVAFE on the portfolio and 26% on dividends rank it low, as for Florence.',
    sourceRefs: [BBD, IL, FORBES],
  },
  {
    rank: 70,
    cityId: 'tarragona',
    why: 'Catalonia\'s wealth tax from €500k ranks it low for BBD.',
    sourceRefs: [BBD, IL, EI26],
  },
  {
    rank: 71,
    cityId: 'barcelona',
    why: 'Catalonia\'s wealth tax from €500k ranks it low for BBD, as for Tarragona.',
    sourceRefs: [BBD, IL, EI26],
  },
  {
    rank: 72,
    cityId: 'cartagena',
    why: 'Colombia\'s wealth, dividend and inheritance taxes, with weaker hospitals than Medellín.',
    sourceRefs: [BBD, EI25, IL],
  },
  {
    rank: 73,
    cityId: 'mazatlan',
    why: 'The US rates Sinaloa Level 4 (the UK carves out Mazatlán), and Mexico taxes dividends.',
    sourceRefs: [BBD, IL, EI26],
  },
  {
    rank: 74,
    cityId: 'bali',
    why: 'Indonesia\'s worldwide tax of up to 35%, limited healthcare and a retirement KITAS rank it near the bottom.',
    sourceRefs: [BBD, IL, EI25, GPI],
  },
  {
    rank: 75,
    cityId: 'vienna',
    why: 'No inheritance tax and a US treaty, but 27.5% on dividends, yearly tax on the growth of unregistered funds (likely US ETFs) and a quota-limited settlement permit.',
    sourceRefs: [BBD],
  },
]

export const EXPAT_PICKS: ExpatPick[] = RANKING.map((p) => ({ ...p, profile: EXPAT_PROFILES[p.cityId] }))

const PICK_BY_CITY: Record<string, ExpatPick> = Object.fromEntries(EXPAT_PICKS.map((p) => [p.cityId, p]))

/** The pick for a city, or undefined if it isn't in the top 75. */
export function expatPickFor(cityId: string): ExpatPick | undefined {
  return PICK_BY_CITY[cityId]
}

/** Picks that carry a full profile, in rank order. */
export function topProfiles(): (ExpatPick & { profile: ExpatProfile })[] {
  return EXPAT_PICKS.filter((p): p is ExpatPick & { profile: ExpatProfile } => p.profile !== undefined)
}
