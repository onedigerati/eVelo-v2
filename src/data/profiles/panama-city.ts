import type { ExpatProfile } from '../expatPicks'
import { S } from './_shared'

const profile: ExpatProfile = {
  tagline: 'Dollarized hub city with top private hospitals',
  summary:
    'Panama is 2nd in International Living\'s 2026 index and 1st in Expat Insider 2025 and 2026. Its territorial system leaves US dividends and interest untaxed, and it has no wealth or inheritance tax. The capital adds Central America\'s strongest private hospitals and Copa\'s hub, with nonstops to dozens of US cities. The catch for a portfolio-only retiree is residency, which needs a pension or about $200k placed in Panama.',
  scores: { cost: 3, healthcare: 4, safety: 3, visa: 3, climate: 3, community: 4, tax: 5, estate: 5, lending: 4 },
  facts: {
    healthcare:
      'Strong private hospitals (Hospital Punta Pacífica, affiliated with Johns Hopkins Medicine; Pacífica Salud, Hospital Nacional, Paitilla), often with internationally trained, English-speaking doctors; pensionados get 15–20% off medical bills (Law 562 changes the discounts from May 2027), and local private cover runs about $350–700+/month in your 60s, so most expats insure privately.',
    safety:
      'Panama is 81st of 163 in the 2026 Global Peace Index and US State Dept Level 2 (August 2026); expats favour Punta Pacífica, San Francisco and Casco, as some districts and nearby Colón have high crime.',
    visa:
      'A US portfolio alone does not qualify: Friendly Nations needs $200k+ in Panamanian real estate or a local fixed-term deposit (2 years provisional, then permanent; the US is on the list), and Qualified Investor needs $300k in new local property or $500k in resale property, $500k in local securities, or $500k–750k on a five-year deposit (Decree 17, September 2026); Pensionado is permanent on a $1,000/month lifetime pension, which portfolio income does not meet.',
    tax: 'No wealth tax; the system is territorial, so dividends and interest from a US brokerage are generally outside Panamanian tax (PwC states the principle, not the specific items); no newcomer regime is needed, and the currency is the US dollar.',
    estate:
      'Panama has no inheritance, estate or gift tax, so heirs owe nothing locally on US assets; there is no US estate treaty, and US estate tax still applies to the worldwide estate above the $15M exemption (2026).',
    lending:
      'Interactive Brokers reportedly accepts Panama residents, and Schwab One International\'s application reportedly lists Panama (checked October 2026), with no known margin restriction outside Europe; IBKR margin terms by country are unconfirmed, and Fidelity and Vanguard reportedly open no new accounts for residents abroad.',
    climate: 'Hot and humid all year (highs about 30°C / 86°F), with heavy rain roughly May–December.',
    community: 'Large, mixed international community of retirees, diplomats and business people; English is widely used where foreigners live.',
    access: 'Tocumen (PTY), a major connecting hub for the Americas, is about 25 km east of the centre.',
  },
  drawbacks: [
    'Heat, humidity and an eight-month rainy season',
    'Without a pension, residency means parking $200k or more in Panamanian property or deposits',
    'Traffic, noise, and condo prices in expat areas close to mid-tier US cities',
  ],
  sources: [
    { name: 'PwC Worldwide Tax Summaries: Panama, taxes on personal income', url: 'https://taxsummaries.pwc.com/panama/individual/taxes-on-personal-income', edition: '2026' },
    { name: 'PwC Worldwide Tax Summaries: Panama, other taxes', url: 'https://taxsummaries.pwc.com/panama/individual/other-taxes', edition: '2026' },
    { name: 'Reside Panama: Panama visa options for expats in 2026', url: 'https://www.residepanama.com/en/reside-panama-blog/panama-visa-options-for-expats-in-2026-the-complete-guide' },
    {
      name: 'Reside Panama: Healthcare in Panama, hospitals, insurance and costs 2026',
      url: 'https://www.residepanama.com/en/reside-panama-blog/healthcare-in-panama-an-expat-guide-to-hospitals-insurance-costs-2026',
    },
    { name: 'Your Tax Base: Charles Schwab for expats (country list, Oct 2026)', url: 'https://yourtaxbase.com/blog/charles-schwab-for-expats' },
    S.pensionado,
    S.il,
    S.gpiPoster,
    { name: 'Kraemer & Kraemer: Panama Qualified Investor visa (Decree 17 of 2026)', url: 'https://kraemerlaw.com/en/immigration/panama-qualified-investor-visa', edition: '2026' },
    { name: 'Gaceta Oficial 30601: Executive Decree 16 of 2026, friendly-nations list (copy by NDM)', url: 'https://www.ndm.com.pa/wp-content/uploads/2026/09/Decreto-Ejecutivo-N°-16.-Incluye-a-Ecuador-en-lista-de-paises-amigos.pdf', edition: '2026' },
    { name: 'Telemetro: Law 562, new retiree discounts from May 2027', url: 'https://www.telemetro.com/nacionales/jubilados-y-pensionados-cuando-comenzaran-aplicarse-los-nuevos-descuentos-n6097480', edition: '2026' },
    { name: 'Your Tax Base: Best brokerage for US expats (Oct 2026)', url: 'https://yourtaxbase.com/blog/best-brokerage-for-us-expats' },
  ],
}

export default profile
