# Pick profiles: one file per city

Each of the 75 picks in `EXPAT_PICKS` (`src/data/expatPicks.ts`) has one profile file here, `<cityId>.ts`.
`expatPicks.ts` loads every `*.ts` file in this folder with `import.meta.glob`, keyed by file name. So adding or editing a profile needs **no edit anywhere else**.

- Files starting with `_` are skipped by the glob. `_shared.ts` holds source entries (`S`) used by several of the moved profiles.
- **Parallel builders: don't edit `_shared.ts`, `expatPicks.ts` or another builder's files.** You may *use* `S.xxx` entries. Put any new source inline in your own file, even if another city might use it too.
- The file name must be the city's id in `src/data/cities.ts` (e.g. `antigua-guatemala.ts`, `san-jose-cr.ts`, `lake-chapala.ts`). A file whose name is not a pick fails the tests.

## File shape

```ts
import type { ExpatProfile } from '../expatPicks'
import { S } from './_shared' // only if you use a shared source

const profile: ExpatProfile = {
  tagline: 'Short line, sentence case, no final period',
  summary: 'Two or three sentences on why a US BBD retiree would pick it, citing the rankings or facts behind it.',
  scores: { cost: 4, healthcare: 4, safety: 4, visa: 4, climate: 5, community: 4, tax: 5, estate: 5, lending: 3 },
  facts: {
    healthcare: '…',
    safety: '…',
    visa: '…', // shown as "Residency"
    tax: '…', // shown as "Tax on holdings"
    estate: '…', // shown as "Estate & inheritance"
    lending: '…', // shown as "Lending & brokers"
    climate: '…',
    community: '…',
    access: '…', // shown as "Getting there"
  },
  drawbacks: ['…', '…', '…'],
  sources: [{ name: 'Publisher: page title', url: 'https://…' }, S.someShared /* … */],
}

export default profile
```

For the style, read finished profiles such as `algarve.ts`, `paphos.ts`, `panama-city.ts`, `cayo.ts` or `florence.ts` (a pick ranked low for its taxes). Match their voice in every fact, the summary and the drawbacks.

## Score rubric (1–5, 5 = best for a US retiree on buy-borrow-die)

The source of truth is `EXPAT_SCORE_RUBRIC` in `expatPicks.ts`, and the UI shows it. Use integers only.

| Key (label) | Meaning |
|---|---|
| `cost` (Cost) | 5 = very low living costs (well under half a typical US city); 3 = moderately cheaper than the US; 1 = as costly as a high-cost US city or more. |
| `healthcare` (Healthcare) | 5 = excellent hospitals nearby, easy access for foreign residents; 3 = decent private care, serious cases a trip away; 1 = weak local care, evacuation needed for anything serious. |
| `safety` (Safety) | 5 = among the world's safest (GPI top tier, low crime); 3 = average, petty crime or uneven areas; 1 = serious concerns or a high travel advisory. |
| `visa` (Residency) | 5 = straightforward long-term or permanent route on **assets or passive income** at a modest threshold; 3 = workable but a high threshold, a pension requirement or heavy paperwork; 1 = no realistic route for a retiree living on a portfolio. |
| `climate` (Climate) | 5 = mild and pleasant most of the year; 3 = comfortable with a hard season; 1 = hard climate much of the year. |
| `community` (Community) | 5 = large, established English-speaking expat/retiree community; 3 = modest; 1 = few English-speaking foreigners. |
| `tax` (Tax on holdings) | 5 = no wealth tax, and foreign dividends/interest untaxed or ≤5% (territorial, non-dom or exempt regime); 4 = no wealth tax and ≤15% on dividends, or a long exemption window; 3 = no wealth tax and 19–30% on dividends; 2 = a wealth tax above a high threshold (≥ ~$2M), or dividends taxed above 30% with surcharges; 1 = a wealth tax from a low threshold or on the gross portfolio. |
| `estate` (Estate) | 5 = no inheritance tax reaching US assets left to US-resident children; 4 = ≤5%, or an allowance ≥ $1M per child; 3 = top rate ≤10%; 2 = top rate 11–35%; 1 = top rate above 35% on the worldwide estate. A regime whose reach over US assets left to US-resident heirs is only inferred, not confirmed, scores one point lower. |
| `lending` (Lending) | 5 = margin borrowing for residents confirmed by IBKR and Schwab International (none confirmed as of 2026-11); 4 = Schwab International reported to accept residents (outside the EU) plus IBKR, margin terms unconfirmed; 3 = IBKR only, or EU residence where Schwab reportedly restricts cash-out by margin; 2 = IBKR only, and even that uncertain; 1 = no known US broker. |

Notes on applying it:
- Score the **city**, not just the country. Regional rules count: Spanish wealth and inheritance tax differ by region (Andalusia, Madrid, Valencian Community).
- Where a rule is pending or unverified (Costa Rica's Bill 25.796, Thailand's loan-proceeds question, Malta's 2027 rules), score today's rule and say what's pending in the fact or a drawback.
- The scores should use the whole range across the 75. Don't default to 3.
- Score a new pick consistently with existing picks in the same country (e.g. Tavira with `algarve.ts`, Torrevieja with `alicante.ts`, Volcán with `boquete.ts`, Langkawi with `penang.ts`, Batumi with `tbilisi.ts`, Rome with `florence.ts`, Gascony with `nice.ts`, Cartagena with `medellin.ts`, the Belize towns with `cayo.ts`); differ only where the city differs (healthcare, cost, climate, community, access).

## Fact-writing rules

- **One line per fact:** a single string, no newlines (the tests check). Usually one or two sentences, with clauses joined by semicolons.
- **Plain, hedged claims.** State the rule and the number, then the hedge where it applies: "reportedly", "generally", "check current rules", "(secondary source)". Write "reported" for every broker or margin claim; they rest on secondary pages.
- **Numbers with units and dates:** "€920/month (2026)", "$15M US exemption (2026)", "THB 800k", "about $200k".
- **BBD framing.** `tax` covers wealth tax, then dividends and interest, then any newcomer regime. `estate` covers what the heirs of US assets pay locally, and whether there is a US estate treaty (only France, Greece and Italy have one). `lending` covers IBKR, Schwab International and any EU margin cash-out restriction. `visa` covers routes that accept assets or passive income first, and pension-only routes second.
- **Drawbacks:** 2–3 short phrases with no final period, the real costs of living there.
- **Sources:** at least 3, each a page you (or the research) actually read, with an `https://` URL. No duplicate URLs within a profile. Prefer the PwC tax summaries, government pages and the pages cited in the research doc. Add `edition` when a source is dated (e.g. `'2026'`).
- **No placeholders.** The tests fail on any `TODO` left in a profile. Remove the `// TODO(stage5)` comments when you finish a file.
- The tests also reject the words "paradise" and "(unconfirmed)", and any all-caps "NOT".
- These are not tax or legal advice; the UI says so. Don't add disclaimers to each fact.

## Where the facts come from

All in `docs/research/bbd-ranking-2026-11.md`:
- **Facts that apply everywhere:** US estate tax, treaties, the broker landscape and insurance age caps.
- **Country summary table:** wealth tax, inheritance and treaty, dividends, residency route, broker access and healthcare for each of the 41 countries, with lead URLs.
- **Draft top 75 table:** the "Why" behind each rank. Your profile should agree with it, and with the pick's `why` in `expatPicks.ts`.
- **Appendix A** (Portugal, Spain incl. Tarragona, France incl. Gascony), **B** (Greece, Italy, Croatia incl. Split, Montenegro, Cyprus, Malta), **C** (Panama, Costa Rica, Mexico, Colombia, Ecuador, Uruguay, Belize incl. Ambergris Caye, and a Placencia section, Dominican Republic, Paraguay), **D** (Malaysia, Thailand, Vietnam, Indonesia incl. Bali, Philippines), **F** (Argentina, Chile, Peru, Guatemala incl. Lake Atitlán) and **G** (Georgia incl. Batumi, Hungary, Czech Republic, Turkey, Ireland, Taiwan, Japan): sourced country notes with URLs.
- **Appendix E:** broker and lending access (§1 and its per-country table), US estate tax (§2) and international health insurance at 65–75 (§3).
- **Appendix H:** city-level notes (hospitals, safety, climate, flights, expat numbers), including Cartagena, Barcelona and Rome.
- **Appendix I:** Albania (Sarandë), Bulgaria (Plovdiv), Austria (Vienna) and Mauritius (Grand Baie), plus their placement in the broker table.
- **Appendix J:** Honduras (Roatán), Singapore and South Africa (the last two are not picks).
- **Appendix K:** the 13 retiree towns: Hopkins, Corozal, Mazatlán, La Paz, Tavira, Torrevieja, Hoi An, Chiang Rai, Langkawi, Pedasí, Volcán, Cotacachi and Panajachel (Hoi An, Pedasí and Cotacachi are not picks).
- **Unverified items to carry as caveats:** hedge these in the facts.
- The Atlas also shows each city's modelled local wealth and inheritance tax from `src/data/localTaxes.ts` (its `note` fields summarise the rules). Your `tax` and `estate` facts must not contradict it.

## Stage 8: the 25 new profiles (picks 51–75 and the five inserted above them)

Every new pick gets a new file named after its city id. These were all researched in Stage 7 (or earlier) and have verified costs in `src/data/cities.ts`.

**Picks ranked low for stated reasons.** Split, Bali, Rome, Gascony, Tarragona, Barcelona, Cartagena and Ambergris Caye are in the top 75 but near its foot on purpose. Their profiles must say why plainly, in the summary, the relevant fact and a drawback, and their scores must show it:
- **Split:** good Croatian taxes, but no residence route for a retiree (`visa` 1).
- **Bali:** Indonesia's worldwide tax up to 35% (exemption not for retirees), limited healthcare, retirement KITAS 55+.
- **Rome:** Italy's 0.2% yearly IVAFE on foreign financial assets and 26% on dividends (match `florence.ts`).
- **Gascony:** France's 5–45% worldwide inheritance tax and long distances to rural healthcare (match `nice.ts` on tax and estate).
- **Tarragona and Barcelona:** Catalonia's wealth tax from €500k.
- **Cartagena:** Colombia's wealth, dividend and inheritance taxes, with weaker hospitals than Medellín (match `medellin.ts` on tax and estate).
- **Ambergris Caye:** Belize's QRP, but no hospital on the island.

Split and Bali had pre-BBD profiles before commit `176adc2`. See them with `git show 176adc2^:src/data/expatPicks.ts` (search for `cityId: 'split'` and `cityId: 'bali'`). Use them as a starting point for healthcare, safety, climate, community and access, re-check them, and rewrite tax, visa, estate, lending, scores, summary and drawbacks for BBD.

## Suggested split for three builders

| Builder | Cities | Read |
|---|---|---|
| 1 Europe (11) | tavira, torrevieja, plovdiv, sarande, split, batumi, gascony, rome, tarragona, barcelona, vienna | App. A (Portugal, Spain, France), B (Italy, Croatia), G (Georgia), H (Barcelona, Rome), I (Albania, Bulgaria, Austria), K (Tavira, Torrevieja) |
| 2 Americas (9) | la-paz, mazatlan, hopkins, corozal, roatan, volcan, panajachel, placencia, ambergris-caye | App. C (Mexico, Panama, Belize, Placencia section), F (Guatemala), J (Honduras), K (La Paz, Mazatlán, Hopkins, Corozal, Volcán, Panajachel) |
| 3 Asia/Africa and Cartagena (5) | grand-baie, chiang-rai, langkawi, bali, cartagena | App. C (Colombia), D (Malaysia, Thailand, Indonesia), H (Cartagena), I (Mauritius), K (Chiang Rai, Langkawi) |

Every builder also reads the "Facts that apply everywhere" section, the country summary rows and Appendix E for their countries.

Check your work with `npx vitest run src/data/__tests__/expatPicks.test.ts src/ui/atlas/__tests__/picks.test.ts`. Until every builder has finished, the completeness tests fail only for the other builders' cities (and the card-grid test fails until `tavira.ts`, rank 14, exists).
