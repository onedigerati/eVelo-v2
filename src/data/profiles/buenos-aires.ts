import type { ExpatProfile } from '../expatPicks'

const profile: ExpatProfile = {
  tagline: 'Grand, cultured and cheap to live in, but a wealth tax on everything',
  summary:
    'Buenos Aires offers European-style boulevards, a famous food, café and arts scene, good private hospitals with plans that cannot refuse older members, and an easy residence visa on about $1,290 a month of passive income. For buy-borrow-die it ranks poorly: after a year residents pay Bienes Personales, a wealth tax on worldwide gross assets above about $249k (0.5–0.75% in 2026, falling to 0.25% from 2027, with no deduction for the margin loan), and US dividends are taxed at up to 35%. The city itself has no inheritance tax, and the April 2025 lifting of most currency controls for individuals removed an old obstacle, but policy can swing with each government.',
  scores: { cost: 4, healthcare: 4, safety: 3, visa: 4, climate: 4, community: 4, tax: 1, estate: 5, lending: 4 },
  facts: {
    healthcare:
      'Private hospitals such as Hospital Italiano, Hospital Alemán, Hospital Británico and Hospital Universitario Austral (in Pilar) are the country\'s best regarded; private "prepaga" plans (OSDE, Swiss Medical, Galeno, OMINT and others) cannot refuse a new member because of age, though premiums after 65 are higher and rise with inflation (secondary sources).',
    safety:
      'Argentina is 72nd of 163 in the 2026 Global Peace Index (down from 46th in 2025) and at US Level 1, "exercise normal precautions" (July 2026); violent crime against foreigners is uncommon in the central barrios, but phone snatching, bag theft and motorbike robberies are frequent.',
    visa: 'Rentista residence needs passive income of 5× the minimum wage, about ARS 2.0M (~$1,290) a month (November 2026), from assets rather than work, and the pensionado route needs the same in pension; both give temporary residence, renewable, with a path to permanent residence after 3 years (check current rules); the paperwork (apostilles, proof of steady income, Migraciones appointments) is slow.',
    tax: 'Foreigners become tax resident from their 13th month; residents pay Bienes Personales on worldwide gross assets (no deduction for debts) above ARS 384.7M (about $249k; FY2025) at 0.5–1.0% for 2025 and 0.5–0.75% for 2026, falling to a flat 0.25% from 2027, and a newcomer cannot use the REIBP prepayment or the "good taxpayer" rate; foreign dividends and interest are taxed at the progressive 5–35% scale (35% above about ARS 53M, ~$34k, of taxable income for 2025) and gains on foreign shares and ETFs at a flat 15%, with credit for US tax and no US–Argentina income tax treaty.',
    estate:
      'No national inheritance tax, and the City of Buenos Aires levies none; only Buenos Aires Province does (on heirs living there, and on property sited there; roughly 1.6–7% for children above an allowance indexed each year, secondary sources), so US-resident heirs inheriting US assets owe nothing locally; there is no US estate treaty, and the $15M US exemption (2026) applies as anywhere.',
    lending:
      'Interactive Brokers reportedly accepts Argentina residents, and Schwab One International\'s application reportedly lists Argentina (October 2026), with no known margin restriction outside Europe; margin terms by country are unconfirmed; most currency controls on individuals ended in April 2025, so dollars can be bought at the official rate without a cap, but a 90-day bar on the MEP and CCL dollar markets after buying official dollars was reinstated in September 2025, and since April 2026 it also follows a transfer of dollars abroad (check current rules).',
    climate:
      'Humid subtropical: hot, humid summers (January highs about 30 °C / 86 °F), mild, damp winters (July highs about 15 °C / 59 °F) with no snow, and about 1,250 mm of rain spread through the year.',
    community:
      'A large and long-standing foreign community of Europeans, Latin Americans and a growing number of Americans and digital nomads, concentrated in Palermo, Recoleta and Belgrano; Spanish (with a strong local accent) is needed for most daily life and all paperwork.',
    access:
      'Ezeiza has nonstops to Miami (American, Aerolíneas Argentinas, LATAM), New York-JFK (American, and Delta seasonally), Atlanta (Delta), Houston (United) and seasonally Dallas (American); Miami is about 9 hours (check current schedules).',
  },
  drawbacks: [
    'A wealth tax on worldwide gross assets above about $249k, plus up to 35% on US dividends',
    'Policy swings: tax and currency rules change with each government',
    'Frequent street theft, and slow, Spanish-only bureaucracy',
  ],
  sources: [
    { name: 'PwC: Argentina, other taxes', url: 'https://taxsummaries.pwc.com/argentina/individual/other-taxes', edition: '2026' },
    { name: 'PwC: Argentina, taxes on personal income', url: 'https://taxsummaries.pwc.com/argentina/individual/taxes-on-personal-income', edition: '2026' },
    { name: 'PwC: Argentina, income determination', url: 'https://taxsummaries.pwc.com/argentina/individual/income-determination', edition: '2026' },
    { name: 'PwC: Argentina, residence', url: 'https://taxsummaries.pwc.com/argentina/individual/residence', edition: '2026' },
    { name: 'Chambers: Private Wealth 2026, Argentina', url: 'https://chambers.com/practice-guides/guides/private-wealth-2026/argentina', edition: '2026' },
    { name: 'iProfesional: Bienes Personales, which assets are taxed', url: 'https://www.iprofesional.com/impuestos/455917-bienes-personales-que-bienes-estan-alcanzados-y-cuales-quedan-afuera', edition: '2026' },
    { name: 'iProfesional: how much can be inherited tax-free', url: 'https://www.iprofesional.com/impuestos/414613-cuanto-es-maximo-se-puede-heredar-sin-pagar-impuestos', edition: '2026' },
    {
      name: 'El Cronista: free transfer of assets tax, who pays',
      url: 'https://www.cronista.com/economia-politica/transmision-gratuita-de-bienes-quienes-pagan-el-impuesto-y-todo-lo-que-tenes-que-saber/',
    },
    { name: 'Argentina.gob.ar: DNM Disposición 1732/2023 (rentista and pensionado income)', url: 'https://www.argentina.gob.ar/normativa/nacional/norma-384788/texto', edition: '2023' },
    {
      name: 'iProfesional: minimum wage schedule to April 2027',
      url: 'https://www.iprofesional.com/impuestos/463576-se-oficializaron-los-nuevos-montos-del-salario-minimo-vital-y-movil-hasta-abril-de-2027',
      edition: '2026',
    },
    { name: 'IRS: estate and gift tax treaties', url: 'https://www.irs.gov/businesses/small-businesses-self-employed/estate-gift-tax-treaties-international' },
    { name: 'iProfesional: prepagas that accept people over 70', url: 'https://www.iprofesional.com/salud/401754-que-prepagas-aceptan-adultos-mayores-70-anos-precios', edition: '2024' },
    { name: 'Rankia: Argentina\'s best hospitals and clinics', url: 'https://www.rankia.com.ar/blog/mejores-opiniones-argentina/7540198-mejores-hospitales-clinicas-argentina', edition: '2026' },
    {
      name: 'Uruguay XXI: Uruguay most peaceful in Latin America (GPI 2026)',
      url: 'https://www.uruguayxxi.gub.uy/en/news/article/uruguay-ranks-as-the-most-peaceful-country-in-latin-america-and-the-caribbean/',
      edition: '2026',
    },
    { name: 'Argentina.travel: one of the most peaceful destinations on the continent (GPI 2025)', url: 'https://www.argentina.travel/en/news/safe-argentina-one-of-the-most-peaceful-destinations-on-the-continent' },
    { name: 'Travel Advisory: Argentina (mirrors US State Dept levels)', url: 'https://www.traveladvisory.io/advisory/argentina' },
    { name: 'El Cronista: end of the currency controls, how many dollars can be bought', url: 'https://www.cronista.com/finanzas-mercados/fin-del-cepo-cuantos-dolares-se-podran-comprar-libremente-a-partir-de-hoy' },
    { name: 'El Cronista: the cross restriction returns for MEP and CCL dollars', url: 'https://www.cronista.com/finanzas-mercados/nuevo-cepo-que-es-la-restriccion-cruzada-y-como-impacta-en-la-compra-de-dolar-mep-y-ccl', edition: '2025' },
    { name: 'Bloomberg Línea: BCRA Comunicación A 8417 widens the cross restriction', url: 'https://www.bloomberglinea.com/latinoamerica/argentina/bcra-flexibiliza-exigencias-para-ingreso-y-salida-de-dolares-pero-amplia-alcance-de-norma-clave/', edition: '2026' },
    { name: 'iProfesional: income tax on foreign-source financial income', url: 'https://www.iprofesional.com/impuestos/291480-Impuesto-a-las-Ganancias-Renta-financiera-de-fuente-extranjera', edition: '2019' },
    { name: 'YourTaxBase: Charles Schwab for expats (country list, Oct 2026)', url: 'https://yourtaxbase.com/blog/charles-schwab-for-expats' },
    { name: 'Wikipedia: climate of Buenos Aires', url: 'https://en.wikipedia.org/wiki/Climate_of_Buenos_Aires' },
    { name: 'Wikipedia: Ministro Pistarini International Airport', url: 'https://en.wikipedia.org/wiki/Ministro_Pistarini_International_Airport' },
  ],
}

export default profile
