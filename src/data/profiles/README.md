# Pick profiles: one file per city

Each of the 50 picks in `EXPAT_PICKS` (`src/data/expatPicks.ts`) has one profile file here, `<cityId>.ts`.
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

For the style, read a moved profile such as `algarve.ts` or `panama-city.ts`. Their healthcare, safety, climate, community, access, drawbacks and summary show the voice to match. Their tax and visa facts are pre-BBD and are being rewritten, so don't copy those.

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
| `estate` (Estate) | 5 = no inheritance tax reaching US assets left to US-resident children; 4 = ≤5%, or an allowance ≥ $1M per child; 3 = top rate ≤10%; 2 = top rate 11–35%; 1 = top rate above 35% on the worldwide estate. |
| `lending` (Lending) | 5 = IBKR and Schwab International both reported to accept residents, no known margin restriction; 4 = Schwab International reported to accept (outside the EU) plus IBKR; 3 = IBKR only, or EU residence where Schwab reportedly restricts cash-out by margin; 2 = IBKR only, and even that uncertain; 1 = no known US broker. |

Notes on applying it:
- Score the **city**, not just the country. Regional rules count: Spanish wealth and inheritance tax differ by region (Andalusia, Madrid, Valencian Community).
- Where a rule is pending or unverified (Costa Rica's Bill 25.796, Thailand's loan-proceeds question, Malta's 2027 rules), score today's rule and say what's pending in the fact or a drawback.
- The scores should use the whole range across the 50. Don't default to 3.

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
- **Country summary table:** wealth tax, inheritance and treaty, dividends, residency route, broker access and healthcare for each of the 34 countries, with lead URLs.
- **Draft top 50 table:** the "Why" behind each rank. Your profile should agree with it.
- **Appendix A** (Portugal, Spain, France), **B** (Greece, Italy, Croatia, Montenegro, Cyprus, Malta), **C** (Panama, Costa Rica, Mexico, Colombia, Ecuador, Uruguay, Belize, Dominican Republic, Paraguay), **D** (Malaysia, Thailand, Vietnam, Indonesia, Philippines), **F** (Argentina, Chile, Peru, Guatemala) and **G** (Georgia, Hungary, Czech Republic, Turkey, Ireland, Taiwan, Japan): sourced country notes with URLs.
- **Appendix E:** broker and lending access (§1 and its per-country table), US estate tax (§2) and international health insurance at 65–75 (§3).
- **Appendix H:** city-level notes (hospitals, safety, climate, flights, expat numbers) for the newer cities, such as Lake Chapala, Oaxaca, Playa del Carmen, Mexico City, Madrid, Alicante, Cascais, Phuket, Coronado and Atenas.
- **Unverified items to carry as caveats:** hedge these in the facts.

## Refreshing a returning pick

The 22 returning picks were moved here unchanged, with placeholders marked `// TODO(stage5)`. To refresh one:
1. Rewrite `tax` for BBD: wealth tax, dividends and interest, any newcomer regime (the old text was about pensions and NHR).
2. Rewrite `visa` as residency on assets or passive income, and re-check every amount against the research doc (e.g. Panama's Friendly Nations and Qualified Investor amounts, Mexico's 2026 thresholds, the D7, Spain's €28,800/yr, MM2H).
3. Write `estate` and `lending`, replacing the `'TODO'` strings.
4. Set `tax`, `estate` and `lending` from the rubric (they are placeholder 3s), and re-check `visa` against the Residency rubric.
5. Re-read the summary, tagline and drawbacks so that they don't contradict the BBD facts (e.g. "easy passive-income visa" or "foreign income untaxed"). Add sources for the new facts; keep ≥3.
6. Remove the `// TODO(stage5)` comments.

## Newcomers

Newcomers get a new file named after the city id. They are: paphos, cascais, madrid, crete, limassol, sliema, antalya, antigua-guatemala, tbilisi, lake-chapala, hua-hin, coronado, atenas, alicante, phuket, kotor, cayo, santiago, prague, istanbul, mexico-city, budapest, taipei, asuncion, lima, oaxaca, las-terrenas and playa-del-carmen.

## Suggested split for four builders

By research appendix, so that each builder reads the fewest sections (R = returning, N = new):

| Builder | Cities |
|---|---|
| 1 Iberia, France, Italy, Czechia (12) | algarve R, lisbon R, porto R, madeira R, cascais N, malaga R, madrid N, valencia R, alicante N, florence R, nice R, prague N |
| 2 East Med, Balkans, Turkey, Caucasus, Taiwan (11) | paphos N, limassol N, sliema N, athens R, crete N, kotor N, antalya N, istanbul N, tbilisi N, budapest N, taipei N |
| 3 Central and South America (14) | panama-city R, boquete R, coronado N, san-jose-cr R, atenas N, antigua-guatemala N, cayo N, las-terrenas N, montevideo R, asuncion N, santiago N, lima N, medellin R, cuenca R |
| 4 Mexico and Southeast Asia (13) | lake-chapala N, merida R, puerto-vallarta R, san-miguel-de-allende R, mexico-city N, oaxaca N, playa-del-carmen N, kuala-lumpur R, penang R, chiang-mai R, bangkok R, hua-hin N, phuket N |

Check your work with `npx vitest run src/data/__tests__/expatPicks.test.ts`. Until every builder has finished, the completeness tests fail only for the other builders' cities.
