import type { ExpatProfile } from '../expatPicks'

const profile: ExpatProfile = {
  tagline: 'Stable, easy residency, long foreign-income tax holiday',
  summary:
    'Uruguay is 13th in International Living\'s 2026 index and 43rd in the 2026 Global Peace Index, the highest in Latin America, with straightforward residency and a tax holiday on foreign investment income for the arrival year plus 10. Montevideo is a calm, mid-priced capital with good private health cooperatives, but it is far from the US and its homicide rate has been rising.',
  // TODO(stage5): set tax, estate and lending from the rubric (3 is a placeholder).
  scores: { cost: 3, healthcare: 4, safety: 3, visa: 4, climate: 3, community: 3, tax: 3, estate: 3, lending: 3 },
  facts: {
    // TODO(stage5): write the estate and lending facts; rewrite tax and visa for BBD.
    estate: 'TODO',
    lending: 'TODO',
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
}

export default profile
