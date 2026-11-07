import type { ExpatProfile } from '../expatPicks'

const profile: ExpatProfile = {
  tagline: 'Low-cost capital with a territorial tax system',
  summary:
    'Paraguay taxes individuals only on Paraguayan-source income, so US dividends and interest appear untaxed. It has no wealth or inheritance tax, which gives it one of the cleanest BBD tax profiles on paper. Asunción is among the cheapest capitals on this list. The costs are a hot, humid climate, no US nonstop flights, and permanent residency that since July 2026 needs active income, a pension or a $200k investment.',
  scores: { cost: 5, healthcare: 3, safety: 3, visa: 3, climate: 2, community: 2, tax: 5, estate: 5, lending: 3 },
  facts: {
    healthcare:
      'Private hospitals such as Centro Médico Bautista, Sanatorio Americano, San Roque and Hospital La Costa are the country\'s best and well reviewed, with English-speaking doctors, though some equipment is dated by Western standards and no JCI accreditation was found (secondary sources); public IPS is for payroll contributors, so retirees use prepaid plans or international cover (local plans from about $75/month), and major treatment sometimes means Argentina or Brazil.',
    safety:
      'Paraguay is 64th of 163 in the 2026 Global Peace Index and reportedly at US State Dept Level 1 (secondary source, dated 2023); the UK warns of pickpocketing, occasionally armed muggings, isolated organised-crime attacks and a few high-profile kidnappings, and advises avoiding isolated or poorly lit areas, including downtown at night.',
    visa:
      'Temporary residence (up to 2 years, fee Gs. 2,926,925) comes first, with no published means test; since July 2026 (Resolution DNM 407/2026) converting to permanent residence needs proof of genuine income-generating activity or an actual pension, so a portfolio-only retiree may need the Investor Pass ($200k in real estate or financial instruments held 2 years).',
    tax: 'No wealth tax; personal income tax (IRP) applies only to Paraguayan-source income (Law 6380/2019, art. 48), so foreign brokerage dividends and interest appear untaxed, though secondary sources disagree and local confirmation is advised; local capital income is taxed at 8%.',
    estate:
      'Paraguay has no inheritance or estate tax, so heirs owe nothing locally on US assets; there is no US estate treaty, and US estate tax applies above the $15M exemption (2026).',
    lending:
      'Interactive Brokers reportedly serves all non-sanctioned countries, so Paraguay residents should be accepted, but margin terms are unconfirmed; whether Schwab One International accepts Paraguay was not checked.',
    climate:
      'Subtropical and humid: December–February highs of 33–34°C, mild winters averaging about 17°C in July with occasional near-freezing nights, and about 1,400 mm of rain a year.',
    community:
      'A small foreign community with no sizeable US-retiree enclave, and English is not widely spoken, so Spanish is needed day to day.',
    access:
      'Silvio Pettirossi (ASU) has no US nonstops: connect via Panama City (Copa), Bogotá (Avianca), Lima, Santiago or São Paulo (LATAM), or Madrid (Air Europa).',
  },
  drawbacks: [
    'Permanent residency now needs active income, a pension or a $200k investment',
    'Very hot, humid summers',
    'No US nonstops, little English, and healthcare that is decent but unaccredited',
  ],
  sources: [
    {
      name: 'BACN: Law 6380/2019, tax modernisation and simplification',
      url: 'https://www.bacn.gov.py/leyes-paraguayas/9332/ley-n-6380-de-modernizacion-y-simplificacion-del-sistema-tributario-nacional',
    },
    { name: 'PwC Worldwide Tax Summaries: Paraguay, taxes on personal income', url: 'https://taxsummaries.pwc.com/paraguay/individual/taxes-on-personal-income', edition: '2026' },
    { name: 'PwC Worldwide Tax Summaries: inheritance and gift tax rates', url: 'https://taxsummaries.pwc.com/quick-charts/inheritance-and-gift-tax-rates', edition: '2026' },
    { name: 'PwC Worldwide Tax Summaries: net wealth tax rates', url: 'https://taxsummaries.pwc.com/quick-charts/net-wealth-worth-tax-rates', edition: '2026' },
    { name: 'Dirección Nacional de Migraciones: Temporary residence', url: 'https://www.migraciones.gov.py/index.php/tramites/residencia-temporal' },
    {
      name: 'IMI Daily: Paraguay ties long-term residency to active income, unless you invest (2026)',
      url: 'https://www.imidaily.com/latam-linc/paraguay-ties-long-term-residency-to-active-income-unless-you-invest/',
    },
    { name: 'Rio Times: Healthcare in Paraguay for expats 2026', url: 'https://www.riotimesonline.com/healthcare-paraguay-expats-2026/' },
    { name: 'Expatra: Expat health insurance in Paraguay', url: 'https://www.expatra.com/expat-health-insurance-in-paraguay/' },
    { name: 'Global Citizen Solutions: Living in Paraguay 2026', url: 'https://www.globalcitizensolutions.com/living-in-paraguay/' },
    {
      name: 'Escudo Digital: Rising organised crime undermines security in Latin America (GPI 2026)',
      url: 'https://www.escudodigital.com/en/world/latin-america/rising-organized-crime-and-instability-undermine-security-in-latin-america.html',
      edition: '2026',
    },
    { name: 'GOV.UK: Paraguay travel advice, safety and security', url: 'https://www.gov.uk/foreign-travel-advice/paraguay/safety-and-security' },
    { name: 'Travel Advisory: Paraguay (US State Dept levels)', url: 'https://www.traveladvisory.io/advisory/paraguay' },
    { name: 'Wikipedia: Asunción (climate)', url: 'https://en.wikipedia.org/wiki/Asunci%C3%B3n' },
    { name: 'Wikipedia: Silvio Pettirossi International Airport', url: 'https://en.wikipedia.org/wiki/Silvio_Pettirossi_International_Airport' },
  ],
}

export default profile
