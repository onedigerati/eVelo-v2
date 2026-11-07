import type { ExpatProfile } from '../expatPicks'
import { S } from './_shared'

const profile: ExpatProfile = {
  tagline: 'Costa del Sol warmth, long-established foreign community',
  summary:
    'Andalusia\'s 100% wealth-tax relief means nothing is due below about €3.7M of net wealth, and its inheritance relief is near-total, which makes Málaga the best Spanish base for a buy-borrow-die portfolio of moderate size. It was 2nd in InterNations\' 2024 city ranking, has some of Europe\'s mildest winters and anchors one of its oldest foreign retiree communities.',
  scores: { cost: 3, healthcare: 4, safety: 4, visa: 3, climate: 5, community: 5, tax: 2, estate: 4, lending: 3 },
  facts: {
    healthcare:
      'Good public hospitals (Regional, Clínico); visa holders start on private insurance and can buy into public cover (convenio especial, €157/month at 65+) after a year; private plans run about €240/month at 65–70, with entry caps commonly 70–75.',
    safety: 'Spain is 27th in the 2026 Global Peace Index; violent crime is low, with petty theft and some organised-crime news along the coast.',
    visa: 'Non-lucrative visa: €2,400/month or €28,800/year (400% of IPREM, 2026; +€7,200 per dependant) from investment income or liquid savings, plus Spanish private health insurance with no co-pay; no work is allowed, and holders must live in Spain most of the year.',
    tax: 'Spain taxes worldwide net wealth (margin debt deductible), but Andalusia\'s 100% relief means nothing is due below about €3.7M; above that the region collects about the solidarity-tax rates (1.7–3.5%); dividends and interest pay 19–30%, foreign assets go on Modelo 720, and an exit tax can reach gains on shares over €4M after 10 years\' residence; check current rules.',
    estate:
      'Spain taxes the heir, and a non-resident heir only on Spanish assets, so US assets left to US-resident children appear outside it (an inference; confirm with a Spanish adviser); a resident heir gets a €1M reduction plus 99% relief in Andalusia; there is no US–Spain estate treaty.',
    lending:
      'IBKR reportedly accepts Spain residents (likely through its EU entity), and Schwab International reportedly accepts them too, but Schwab reportedly bars Europe residents from taking cash out through margin, so plan on IBKR margin; EU PRIIPs rules reportedly block new buys of US-listed ETFs, not holding them.',
    climate: 'About 300 sunny days; winters around 17°C; hot, dry summers.',
    community: 'A very large British and Northern European community on the Costa del Sol (Fuengirola, Marbella, Nerja), with about 49,000 Britons and 3,900 Americans registered in the province (1 Jan 2025).',
    access: 'United has flown Newark–Málaga in past summers, but 2026 service could not be confirmed; otherwise connect via Madrid or a European hub.',
  },
  drawbacks: [
    'Wealth tax at about 1.7–3.5% a year on net wealth above about €3.7M',
    'Rents and property prices have risen sharply with tourism and foreign demand',
    'The non-lucrative visa\'s income bar is high, and holders must spend most of the year in Spain',
  ],
  sources: [
    S.iprem,
    { name: 'PwC: Spain, other taxes', url: 'https://taxsummaries.pwc.com/spain/individual/other-taxes', edition: '2026' },
    { name: 'Guía Fiscal: wealth tax 2026, map of regional reliefs', url: 'https://guiafiscal.es/opinion/patrimonio-2026-mapa-bonificaciones-ccaa/', edition: '2026' },
    { name: 'Guía Fiscal: inheritance tax map 2026', url: 'https://guiafiscal.es/actualidad/mapa-sucesiones-2026-donde-se-paga-mas/', edition: '2026' },
    {
      name: 'Taxes for Expats: succession and inheritance tax in Spain',
      url: 'https://www.taxesforexpats.com/country-guides/spain/succession-inheritance-tax-spain.html',
    },
    { name: 'YourTaxBase: Charles Schwab for expats', url: 'https://yourtaxbase.com/blog/charles-schwab-for-expats', edition: '2026' },
    { name: 'Ministerio de Sanidad: convenio especial', url: 'https://www.sanidad.gob.es/en/servCiudadanos/internacional/convenioEspecial.htm' },
    { name: 'MySpainVisa: Brits living in Spain (INE data)', url: 'https://myspainvisa.com/brits-living-in-spain/', edition: '2025' },
    { name: 'MySpainVisa: Americans living in Spain (INE data)', url: 'https://myspainvisa.com/americans-living-in-spain/', edition: '2025' },
    S.gpiTop50,
    S.spainAir,
  ],
}

export default profile
