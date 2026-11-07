import type { ExpatProfile } from '../expatPicks'

const profile: ExpatProfile = {
  tagline: 'Stable capital with an 11-year tax holiday on foreign income',
  summary:
    'Uruguay is 13th in International Living\'s 2026 index and 43rd in the 2026 Global Peace Index, the highest in Latin America. New residents can exempt foreign capital income for the arrival year plus 10, and there is no inheritance tax. Montevideo is a calm, mid-priced capital with good private health cooperatives. It is far from the US, its homicide rate has been rising, and the holiday needs 183 or more days a year there.',
  scores: { cost: 3, healthcare: 4, safety: 3, visa: 4, climate: 3, community: 3, tax: 4, estate: 5, lending: 5 },
  facts: {
    healthcare:
      'Private nonprofit cooperatives (mutualistas such as Hospital Británico, Asociación Española, Médica Uruguaya, CASMU) give full coverage for about $90–140 per adult a month (2026), with age-based admission rules and senior surcharges; the public ASSE serves the rest, and Montevideo holds most specialty care.',
    safety:
      'Uruguay is 43rd in the 2026 Global Peace Index and reportedly at US State Dept Level 2, but Montevideo\'s homicide rate was about 16 per 100,000 in 2025 and the first half of 2026 had Uruguay\'s most homicides since 2015; Pocitos, Punta Carretas and Carrasco are the calmer areas.',
    visa:
      'Permanent residency as a rentista on income from abroad needs a notarial certificate of its nature and monthly amount, with no published minimum (officials reportedly expect about $1,500/month, and dividends qualify as passive income); processing can take 6–18 months, and you are legal while it is pending.',
    tax: 'Wealth tax of 0.1% (2026) reaches only net wealth located in Uruguay, so a US brokerage account is outside it; under Law 20.446 (from 2026) new residents with 183+ days\' presence can exempt foreign capital income for the arrival year plus 10, then pay 6% for 5 years and 12% after (that it covers dividends and interest is inferred from "capital income"; one source says 7%).',
    estate:
      'Uruguay has no inheritance tax, so heirs owe nothing locally on US assets; there is no US estate treaty, and US estate tax applies above the $15M exemption (2026).',
    lending:
      'Interactive Brokers reportedly accepts Uruguay residents, and Schwab One International\'s application reportedly lists Uruguay (October 2026), with no known margin restriction outside Europe; IBKR margin terms by country are unconfirmed.',
    climate: 'Temperate: warm, humid summers (December–March) and cool, damp, windy winters around 10°C.',
    community: 'A small but steady expat community, mostly Argentine and European; fewer US retirees and English speakers than the Mexican or Panamanian hubs.',
    access:
      'The only US nonstop is American\'s seasonal Miami–Montevideo (daily December to early March, then 3 a week until late March); otherwise connect via São Paulo, Panama City or Bogotá, roughly 12–15 hours.',
  },
  drawbacks: [
    'The tax holiday needs 183+ days a year in Uruguay, and after 11 years foreign income is taxed at 6%, then 12%',
    'Rising violent crime in Montevideo despite Uruguay\'s national peace ranking',
    'Very few nonstop flights to the US, and none for most of the year',
  ],
  sources: [
    {
      name: 'IMI Daily: Uruguay raises tax holiday threshold, taxes foreign income at 12% (Feb 2026)',
      url: 'https://www.imidaily.com/latin-america/uruguay-raises-tax-holiday-threshold-to-us2-million-taxes-foreign-income-at-12/',
    },
    { name: 'PwC Worldwide Tax Summaries: Uruguay, other taxes', url: 'https://taxsummaries.pwc.com/uruguay/individual/other-taxes', edition: '2026' },
    { name: 'PwC Worldwide Tax Summaries: inheritance and gift tax rates', url: 'https://taxsummaries.pwc.com/quick-charts/inheritance-and-gift-tax-rates', edition: '2026' },
    { name: 'gub.uy: Permanent legal residence', url: 'https://www.gub.uy/tramites/residencia-legal-permanente' },
    { name: 'Liberty Mundo: Residency in Uruguay 2026', url: 'https://www.libertymundo.com/residency-in-uruguay/' },
    { name: 'Rio Times: Healthcare in Uruguay for expats 2026', url: 'https://www.riotimesonline.com/healthcare-uruguay-expats-2026/' },
    { name: 'Your Tax Base: Charles Schwab for expats (country list, Oct 2026)', url: 'https://yourtaxbase.com/blog/charles-schwab-for-expats' },
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
