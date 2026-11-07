import type { ExpatProfile } from '../expatPicks'
import { S } from './_shared'

const profile: ExpatProfile = {
  tagline: 'Adriatic fjord town with residence through a €150k home',
  summary:
    'Montenegro has no wealth tax, taxes investment income at a flat 15% and levies inheritance tax only on real estate, so a US portfolio passes to children untaxed. Buying a €150k property gives temporary residence, and Kotor\'s walled old town sits on one of the Adriatic\'s most striking bays, but healthcare is thin.',
  scores: { cost: 3, healthcare: 2, safety: 4, visa: 3, climate: 3, community: 2, tax: 4, estate: 5, lending: 3 },
  facts: {
    healthcare:
      'Kotor General Hospital covers the bay, with complex cases sent to the Clinical Centre in Podgorica or to Croatia and Serbia; the public system is stretched by newcomers, private clinics are few, and health insurance is a condition of residence.',
    safety:
      'Montenegro is 30th in the 2026 Global Peace Index; UK travel advice warns of pickpockets in tourist spots and of violence between organised crime groups that can affect bystanders.',
    visa: 'Temporary residence by owning real estate with a Tax Authority-assessed value of at least €150,000 (since January 2026; older permits are grandfathered), plus means of subsistence and health insurance; renewed yearly, and the time reportedly does not count toward permanent residence.',
    tax: 'No wealth tax; residents are taxed on worldwide income, with dividends, interest and capital gains at 15% of the gross amount, and Kotor\'s 13% municipal surtax on income tax may raise that to about 17% (whether it applies to capital income is unverified); there is no newcomer regime.',
    estate: 'Inheritance tax of 3–6% applies only to inherited real estate, and close family are reportedly exempt, so a US portfolio passes to US-resident children with no Montenegrin tax; there is no US estate treaty.',
    lending:
      'IBKR reportedly accepts residents of all non-sanctioned countries, including Montenegro, though margin terms per country are unknown; Schwab International most likely does not accept Montenegro, which is off its reported list; as a non-EU country, PRIIPs limits on US ETFs do not apply.',
    climate: 'Hot summers (highs about 31°C in July and August) and mild but very wet winters: about 1,400 mm of rain a year, mostly from November to January, with January lows near 3°C.',
    community: 'A small but growing foreign community along the bay and in nearby Tivat and Budva (remote workers, retirees, property buyers); outside the tourist trade, English is less common.',
    access:
      'Tivat airport is 5 km away, with flights to Belgrade, London and Paris and summer charters, and Podgorica (65 km) is open year-round; for the US, United flies Newark–Dubrovnik seasonally (2026), about 90 minutes\' drive across the Croatian border.',
  },
  drawbacks: [
    'Weak healthcare: serious care means Podgorica or another country',
    'Cruise-ship crowds in summer and heavy winter rain',
    'The property permit renews yearly and builds no path to permanent residence',
  ],
  sources: [
    { name: 'PwC: Montenegro, taxes on personal income', url: 'https://taxsummaries.pwc.com/montenegro/individual/taxes-on-personal-income' },
    { name: 'PwC: Montenegro, income determination', url: 'https://taxsummaries.pwc.com/montenegro/individual/income-determination' },
    { name: 'PwC: inheritance and gift tax rates (quick chart)', url: 'https://taxsummaries.pwc.com/quick-charts/inheritance-and-gift-tax-rates' },
    { name: 'Adriacom: Is Montenegro a tax haven?', url: 'https://adriacom.me/is-montenegro-a-tax-haven' },
    { name: 'BDK Advokati: Montenegro amends the Foreigners Act', url: 'https://bdkadvokati.com/montenegro-adopts-amendments-to-the-foreigners-act' },
    { name: 'NT Realty: Montenegro property residency rules 2026', url: 'https://ntrealty.me/blog/montenegro-property-residency-rules-2026' },
    {
      name: 'Montenegro Business: healthcare and the boom in international residents',
      url: 'https://montenegrobusiness.eu/montenegros-healthcare-crossroads-why-the-boom-in-international-residents-demands-a-private-sector-push/',
    },
    { name: 'GOV.UK: Montenegro travel advice, safety and security', url: 'https://www.gov.uk/foreign-travel-advice/montenegro/safety-and-security' },
    S.gpiTop50,
    { name: 'Climates to Travel: Kotor climate', url: 'https://www.climatestotravel.com/climate/montenegro/kotor' },
    { name: 'Total Croatia News: Dubrovnik–US direct flights continue in 2026', url: 'https://total-croatia-news.com/?p=189734' },
    { name: 'Wikipedia: Kotor (airports)', url: 'https://en.wikipedia.org/wiki/Kotor' },
  ],
}

export default profile
