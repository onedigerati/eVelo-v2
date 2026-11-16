# Profile fact check, November 2026: what changed

The final report of the profile fact check (plan: `docs/PLAN.md`; method: `README.md` in this folder). Every city profile in `src/data/profiles/` makes claims in five facts a retiree could act on: tax on holding a portfolio, what heirs pay (estate), which brokers lend to residents (lending), how to get residency, and healthcare. All 133 profiles in 51 countries were checked claim by claim from 15 November 2026 against pages read during the plan, government and tax-authority pages first. The ledger behind every line here is the country's `.json` file in this folder.

**How this file is made.** The prose sections are written by hand. The sections between `<!-- generated:… -->` markers (the counts, the score-change table, the rank flags, the model table, the shared claims and the city-by-city lists) are written from the ledger by `node scripts/fact-check-report.mjs`, which leaves the prose alone; run it again after any ledger change. A test (`src/data/__tests__/factCheckReport.test.ts`) fails if any corrected claim's id is missing from this file.

**How to read a claim.** Each claim ends with one of three verdicts. *Confirmed*: a page read this month says the same. *Corrected*: the profile was wrong or out of date and now says what the page says; the old and new wording are quoted. *Can't confirm*: no readable page settles it, so the profile keeps it only behind a hedge ("reportedly", "check current rules", "an inference") or the claim was taken out. Most can't-confirm claims are about brokers: Interactive Brokers' and Schwab's own sites refused every automated read, so what they accept stays "reportedly".

## In short

- **Most of what the profiles said held up.** About three claims in four were confirmed. 122 were corrected, most of them small (a rate updated for 2026, a renamed hospital, a threshold that moved), and 286 could not be confirmed and now sit behind a hedge or were removed.
- **The biggest change is to borrowing in Europe.** Schwab reportedly bars anyone living in Europe from taking cash out against a margin loan, and the EU entity that holds IBKR accounts for EU residents reportedly lends only to buy securities. That closes, or at least clouds, the "borrow" step of buy-borrow-die for every EU pick, Algarve and Lisbon (picks 1 and 2) included. Their lending scores fell from 3 to 2; their ranks were kept, by the plan's rule, and the question is yours (below).
- **Lending got better in parts of Latin America.** Schwab's reported country list includes Guatemala, Peru, Chile and Paraguay, so those picks rose from 3 to 4.
- **The simulation now charges more of the real taxes.** `src/data/localTaxes.ts`, which the simulation uses for wealth and inheritance taxes, gained entries for the UK, the Netherlands (Box 3), Germany, South Korea, the UAE, Zurich and ten US cities in nine jurisdictions with an estate or inheritance tax (eight states and the District of Columbia), and Turkey's 1% inheritance charge was removed. Taxes the simulation cannot express (tax on gains at death, exit taxes) are named, not modelled.
- **Three scores moved in the final consistency pass** (London's, Portland's and Santiago's estate scores), so that the same situation scores the same everywhere. A test now holds that line.

## Summary

<!-- generated:summary -->
1534 claims in 51 country files, plus 16 claims in `shared.json` that many profiles repeat (US estate exemption and treaties, IBKR, Schwab, the EU PRIIPs rule): 11 confirmed, 1 corrected, 4 can't confirm.

**By verdict** (country files)

| Confirmed | Corrected | Can't confirm | Total |
|---|---|---|---|
| 1131 | 121 | 282 | 1534 |

**By fact**

| Fact | Confirmed | Corrected | Can't confirm | Total |
|---|---|---|---|---|
| Tax | 333 | 32 | 20 | 385 |
| Estate | 254 | 7 | 11 | 272 |
| Lending | 40 | 24 | 183 | 247 |
| Residency | 181 | 21 | 17 | 219 |
| Healthcare | 323 | 37 | 51 | 411 |

**By region** (as `src/data/cities.ts` groups countries)

| Region | Countries | Cities | Confirmed | Corrected | Can't confirm | Total |
|---|---|---|---|---|---|---|
| Europe | 21 | 39 | 426 | 61 | 107 | 594 |
| Middle East | 1 | 1 | 15 | 1 | 6 | 22 |
| Africa | 2 | 2 | 34 | 2 | 15 | 51 |
| Latin America | 14 | 33 | 227 | 27 | 87 | 341 |
| North America | 2 | 36 | 256 | 17 | 8 | 281 |
| Asia | 9 | 19 | 145 | 11 | 51 | 207 |
| Oceania | 2 | 3 | 28 | 2 | 8 | 38 |

**Scores:** 40 of the 133 profiles' tax, estate, lending, residency and healthcare scores changed between the start of the plan (commit `7f833cf`) and now, on 39 profiles; every one is listed under "Every score change". **Model:** 32 claims recorded a difference from `src/data/localTaxes.ts` (`modelMismatch`); 21 are now modelled and 11 are named as not modelled. **Rank flags:** 25.
<!-- /generated:summary -->

**Modelled taxes.** Comparing `src/data/localTaxes.ts` with the last commit: 16 entries are new (country entries for the UK, the Netherlands, Germany, the UAE and South Korea; city entries for Zurich, Seattle, Portland, Honolulu, Minneapolis, Chicago, Boston, New York, Washington DC, Philadelphia and Pittsburgh), one entry's amounts changed (Turkey: the flat 1% inheritance charge removed), and eight entries kept their amounts but had their note corrected (France, Italy, Austria, Argentina, the Philippines, Japan, Barcelona and Tarragona; Catalonia's scale also moved its fifth step by 24 cents, under $1 of effect). The UAE entry carries no tax; it is there so the city reads as checked rather than unknown. In all, 16 entries change what the simulation charges: the 15 new entries that carry a tax, and Turkey's removed charge. Every other entry charges what it did before.

## Every score change

All changes to the five fact scores since the plan began, with the ledger note behind each. Nearly all came from the checks in stages 1–7; the three rows whose note says "stage 8 score audit" came from the consistency pass described after the table.

<!-- generated:scores -->
| Country | City | Score | Change | Ledger note |
|---|---|---|---|---|
| Austria | Vienna | Lending | 3 → 2 | scores.lending: this alone would not raise it, since Austria is in the EU; see at-lending-ibkr-margin-cash-out for 3→2 (`at-lending-schwab-unavailable`)<br>scores.lending 3→2 (plan decision of 2026-11-15; rubric 2: EU residence, where Schwab and IBKR's EU entity both reportedly bar taking cash out through margin) (`at-lending-ibkr-margin-cash-out`) |
| Bulgaria | Plovdiv | Lending | 3 → 2 | scores.lending 3→2 (plan decision of 2026-11-15; rubric 2: IBKR only and even that uncertain, or EU residence) (`bg-lending-ibkr-margin-cash-out`) |
| Croatia | Split | Lending | 3 → 2 | scores.lending 3→2 (plan decision of 2026-11-15; rubric 2: IBKR only and even that uncertain, or EU residence) (`hr-lending-ibkr-margin-cash-out`) |
| Cyprus | Limassol | Lending | 3 → 2 | scores.lending 3→2 on both (plan decision of 2026-11-15; rubric 2: IBKR only and even that uncertain, or EU residence) (`cy-lending-ibkr-margin-cash-out`) |
| Cyprus | Paphos | Lending | 3 → 2 | scores.lending 3→2 on both (plan decision of 2026-11-15; rubric 2: IBKR only and even that uncertain, or EU residence) (`cy-lending-ibkr-margin-cash-out`) |
| Czech Republic | Prague | Lending | 3 → 2 | scores.lending: this alone would not raise it, since the Czech Republic is in the EU; see cz-lending-ibkr-margin-cash-out for 3→2 (`cz-lending-schwab-unavailable`)<br>scores.lending 3→2 (plan decision of 2026-11-15; rubric 2: EU residence, where Schwab and IBKR's EU entity both reportedly bar taking cash out through margin) (`cz-lending-ibkr-margin-cash-out`) |
| France | Gascony (Auch) | Lending | 3 → 2 | scores.lending 3→2 on all 3 (plan decision of 2026-11-15; rubric 2: IBKR only and even that uncertain, or EU residence) (`fr-lending-ibkr-margin-cash-out`) |
| France | Nice | Lending | 3 → 2 | scores.lending 3→2 on all 3 (plan decision of 2026-11-15; rubric 2: IBKR only and even that uncertain, or EU residence) (`fr-lending-ibkr-margin-cash-out`) |
| France | Paris | Lending | 3 → 2 | scores.lending 3→2 on all 3 (plan decision of 2026-11-15; rubric 2: IBKR only and even that uncertain, or EU residence) (`fr-lending-ibkr-margin-cash-out`) |
| Germany | Berlin | Lending | 3 → 2 | scores.lending 3→2 (plan decision of 2026-11-15; rubric 2: EU residence, where Schwab and IBKR's EU entity both reportedly bar taking cash out through margin) (`de-lending-ibkr-margin-cash-out`) |
| Greece | Athens | Lending | 3 → 2 | scores.lending 3→2 on both (plan decision of 2026-11-15; rubric 2: EU residence, where Schwab and IBKR's EU entity both reportedly bar taking cash out through margin) (`gr-lending-ibkr-margin-cash-out`) |
| Greece | Crete (Chania) | Lending | 3 → 2 | scores.lending 3→2 on both (plan decision of 2026-11-15; rubric 2: EU residence, where Schwab and IBKR's EU entity both reportedly bar taking cash out through margin) (`gr-lending-ibkr-margin-cash-out`) |
| Hungary | Budapest | Lending | 3 → 2 | scores.lending 3→2 (plan decision of 2026-11-15; rubric 2: IBKR only and even that uncertain, or EU residence) (`hu-lending-ibkr-margin-cash-out`) |
| Ireland | Dublin | Lending | 3 → 2 | scores.lending 3→2 (plan decision of 2026-11-15; rubric 2: EU residence, where Schwab and IBKR's EU entity both reportedly bar taking cash out through margin) (`ie-lending-ibkr-margin-cash-out`) |
| Italy | Florence | Lending | 3 → 2 | scores.lending 3→2 on all 2 (plan decision of 2026-11-15; rubric 2: IBKR only and even that uncertain, or EU residence) (`it-lending-ibkr-margin-cash-out`) |
| Italy | Rome | Lending | 3 → 2 | scores.lending 3→2 on all 2 (plan decision of 2026-11-15; rubric 2: IBKR only and even that uncertain, or EU residence) (`it-lending-ibkr-margin-cash-out`) |
| Malta | Sliema | Lending | 3 → 2 | scores.lending 3→2 (plan decision of 2026-11-15; rubric 2: IBKR only and even that uncertain, or EU residence) (`mt-lending-ibkr-margin-cash-out`) |
| Netherlands | Amsterdam | Lending | 3 → 2 | scores.lending 3→2 (plan decision of 2026-11-15; rubric 2: EU residence, where Schwab and IBKR's EU entity both reportedly bar taking cash out through margin) (`nl-lending-ibkr-margin-cash-out`) |
| Portugal | Algarve (Faro) | Lending | 3 → 2 | scores.lending 3→2 on all six (plan decision of 2026-11-15) (`pt-lending-ibkr-margin-cash-out`) |
| Portugal | Cascais | Lending | 3 → 2 | scores.lending 3→2 on all six (plan decision of 2026-11-15) (`pt-lending-ibkr-margin-cash-out`) |
| Portugal | Lisbon | Lending | 3 → 2 | scores.lending 3→2 on all six (plan decision of 2026-11-15) (`pt-lending-ibkr-margin-cash-out`) |
| Portugal | Madeira (Funchal) | Lending | 3 → 2 | scores.lending 3→2 on all six (plan decision of 2026-11-15) (`pt-lending-ibkr-margin-cash-out`) |
| Portugal | Porto | Lending | 3 → 2 | scores.lending 3→2 on all six (plan decision of 2026-11-15) (`pt-lending-ibkr-margin-cash-out`) |
| Portugal | Tavira | Lending | 3 → 2 | scores.lending 3→2 on all six (plan decision of 2026-11-15) (`pt-lending-ibkr-margin-cash-out`) |
| Spain | Alicante | Lending | 3 → 2 | scores.lending 3→2 on all seven (plan decision of 2026-11-15) (`es-lending-ibkr-margin-cash-out`) |
| Spain | Barcelona | Lending | 3 → 2 | scores.lending 3→2 on all seven (plan decision of 2026-11-15) (`es-lending-ibkr-margin-cash-out`) |
| Spain | Madrid | Lending | 3 → 2 | scores.lending 3→2 on all seven (plan decision of 2026-11-15) (`es-lending-ibkr-margin-cash-out`) |
| Spain | Málaga | Lending | 3 → 2 | scores.lending 3→2 on all seven (plan decision of 2026-11-15) (`es-lending-ibkr-margin-cash-out`) |
| Spain | Tarragona | Lending | 3 → 2 | scores.lending 3→2 on all seven (plan decision of 2026-11-15) (`es-lending-ibkr-margin-cash-out`) |
| Spain | Torrevieja | Lending | 3 → 2 | scores.lending 3→2 on all seven (plan decision of 2026-11-15) (`es-lending-ibkr-margin-cash-out`) |
| Spain | Valencia | Lending | 3 → 2 | scores.lending 3→2 on all seven (plan decision of 2026-11-15) (`es-lending-ibkr-margin-cash-out`) |
| Switzerland | Zurich | Lending | 4 → 3 | scores.lending 4→3 (see rankFlag) (`ch-lending-schwab-cash-out-outside-eu`) |
| United Kingdom | London | Estate | 2 → 1 | scores.estate 2→1 (stage 8 score audit): the top rate is 40% and reaches the worldwide estate after 10 of 20 years, the rubric's 1 ("top rate above 35% on the worldwide estate"), as France scores with its own 5-of-7-year window; 2 is for top rates of 11–35% (`uk-estate-iht-rate-band`) |
| Chile | Santiago | Estate | 5 → 4 | scores.estate 5→4 (stage 8 score audit): a 1–25% tax exists and its reach over a domiciled foreigner's US assets is only inferred, so the rubric's "scores one point lower" applies, as for Spain and Vietnam (`cl-estate-domicile-unverified`) |
| Chile | Santiago | Lending | 3 → 4 | scores.lending 3→4 (rubric 4) (`cl-lending-schwab`) |
| Guatemala | Antigua Guatemala | Lending | 3 → 4 | scores.lending 3→4 in both profiles (rubric 4: Schwab International reported to accept residents outside Europe, plus IBKR, margin terms unconfirmed; matches the Mexico profiles) (`gt-lending-schwab`) |
| Guatemala | Lake Atitlán (Panajachel) | Lending | 3 → 4 | scores.lending 3→4 in both profiles (rubric 4: Schwab International reported to accept residents outside Europe, plus IBKR, margin terms unconfirmed; matches the Mexico profiles) (`gt-lending-schwab`) |
| Paraguay | Asunción | Lending | 3 → 4 | scores.lending 3→4 (rubric 4) (`py-lending-schwab`) |
| Peru | Lima | Lending | 3 → 4 | scores.lending 3→4 (rubric 4: Schwab International reported to accept residents outside Europe, plus IBKR, margin terms unconfirmed) (`pe-lending-schwab`) |
| United States | Portland, OR | Estate | 4 → 2 | scores.estate 4→2 (stage 8 score audit): the $1M exemption is for the whole estate, so two children get $500k each, short of the rubric's 4 ("an allowance ≥ $1M per child"), and the 16% top rate is the rubric's 2 (11–35%); Massachusetts' $2M still gives $1M per child for two (`us-estate-or-exemption`) |
<!-- /generated:scores -->

### The stage 8 score audit

Every profile's tax, estate, lending, residency and healthcare score was read against the rubric's words (`EXPAT_SCORE_RUBRIC` in `src/data/expatPicks.ts`) and the checked fact text, looking for the same situation scored differently in two places. Three scores were plainly out of line with the rubric and were changed:

| City | Score | Change | Why, in the rubric's words |
|---|---|---|---|
| London | Estate | 2 → 1 | The UK's inheritance tax is 40% and reaches the worldwide estate once someone has lived there 10 of the last 20 years. The rubric's 1 is "top rate above 35% on the worldwide estate"; its 2 is for top rates of 11–35%, which 40% is not. France, with the same kind of grace period (5 of 7 years under the US treaty) and a 45% top rate, already scores 1. London's own drawback says "40% inheritance tax on the worldwide estate after 10 years". |
| Portland, OR | Estate | 4 → 2 | Oregon's $1M exemption is for the whole estate, so two children get $500k each. The rubric's 4 needs "an allowance ≥ $1M per child" (or a rate of 5% or less); the next rung, 3, needs a top rate of 10% or less, and Oregon's reaches 16%, the rubric's 2. Boston (Massachusetts, $2M, so $1M per child for two) keeps 4, as do the other state estate taxes with thresholds of $3M or more and Pennsylvania's 4.5%. |
| Santiago | Estate | 5 → 4 | Chile has an inheritance tax (1–25%). The statute leaves out a foreigner's assets abroad unless bought with Chilean money, but whether that holds for a foreigner who dies living in Chile is unverified (`cl-estate-domicile-unverified`). The rubric says "a regime whose reach over US assets left to US-resident heirs is only inferred, not confirmed, scores one point lower", and Spain and Vietnam, in the same position, already score 4. |

Each change is also written into the ledger claim it rests on (`also`). None of the three cities' ranks or `why` lines was touched. London and Portland are not ranked. **Santiago is pick 42, and its `why` still says flatly that "foreigners' assets abroad fall outside inheritance tax"**, which the profile hedges: that sits oddly beside the lower score and is for your call.

**Scores looked at and left alone**, because the rubric does not plainly decide them. They are noted so you can judge:

- **Japan, estate 2** (Tokyo, Osaka). The top rate is 55%, which on the rubric's words is a 1. But a retiree on Japan's Long Stay status (the only retiree route, at most a year) is taxed only on assets in Japan, which would be a 5, while a permanent resident or the spouse of a Japanese national is taxed on the worldwide estate from arrival, a 1. The 2 is a middle score for a split case.
- **Australia, estate 3** (Sydney, Melbourne). No inheritance tax, but at death a resident's gains on shares left to heirs abroad are taxed as if sold (up to about 23.5% of the gain today), as in Canada, which scores 2. It reaches mainly permanent residents; a temporary resident's foreign assets appear to be outside it. The 3 is again a middle score.
- **South Korea, residency 2** (Seoul). The one route is a KRW 1.5bn (about $1.1M) interest-free deposit for 5 years, leading to permanent residence. That reads like the rubric's 3 ("a workable route with a high threshold"), but $1.1M locked up without interest is a heavy cost; the stage 6 builder kept 2.
- **Mauritius, tax 5** (Grand Baie). Foreign income is taxed only when brought into Mauritius, at up to 20%, and the retiree permit requires bringing in about $2,000 a month. Thailand, Ireland and Malta, also taxed on what is brought in, score 4. Dividends left in the US are untaxed, which is the rubric's 5 on its words.
- **Seattle, tax 4, and Vietnam, tax 4.** Both tax dividends at 5% or less (Washington not at all; Vietnam 5%), the rubric's 5 on its words, but tax gains (Washington 7–9.9%; Vietnam possibly 20%), and Washington's 9.9% tax on household income over $1M starts in 2028. The builders scored the gains too; the rubric's tax line names only dividends and interest.
- **Colombia, tax 1, and New Zealand, tax 2.** Colombia's wealth tax starts at about $1.2M, between the rubric's "low threshold" (1) and "≥ ~$2M" (2). New Zealand's FIF charge works like a yearly tax of up to about 2% of the portfolio, as the Netherlands' Box 3 (scored 1) does, but comes after a 4-year exemption, and a US citizen can opt for a method that taxes dividends and realised gains instead.

Healthcare was read too. It varies city by city by design (a capital's hospitals against a village's clinic), and no city's score was out of line with its own fact text.

### The consistency rule, now a test

`src/data/__tests__/scoreConsistency.test.ts` holds it: every profiled city in a country scores tax, estate, lending and residency the same, and in the United States, where tax and estate are state rules, every city in a state scores tax and estate the same (all US cities share lending and residency). A city may differ only through a listed exception that names the reason and whose own fact text says it. There are three:

- **Barcelona and Tarragona, tax 1** against the rest of Spain's 2: Catalonia's own wealth tax from €500k, against the Valencian €2M exemption and the Madrid and Andalusia reliefs.
- **Montréal, residency 2** against Toronto's and Vancouver's 1: Quebec's Investor Program (open, but for CAD 2M, French and management experience) is a route only for people who settle in Quebec.
- **Philadelphia, tax 4** against Pittsburgh's 5: Philadelphia's School Income Tax (3.735%) on residents' dividends; Pittsburgh's earned-income tax does not reach investment income.

The test also fails when an exception is no longer needed (the city scores the same as the rest again) and when a profiled US city has no state.

## Rank flags, for your call

Corrections that undercut a pick's rank, its one-line `why`, or the rubric. By the plan's rule the ranked 75 kept their order and their `why` lines; each of these is yours to decide (re-rank, reword the `why`, or keep and warn). The stage 8 audit adds one that is not in the ledger's `rankFlag` fields: **Santiago (pick 42)**, whose `why` says foreigners' assets abroad fall outside inheritance tax, while the profile hedges that and now scores estate 4 (above).

<!-- generated:rank-flags -->
- **Shared** — The 16 EU profiles whose lending fact ends "so plan on IBKR margin" after saying Schwab bars cash-out: Portugal (6), Spain (7), Amsterdam, Berlin and Dublin; London says the same of IB UK (`ibkr-eu-margin-cash-out`): For EU residents this removes the one reported way to draw cash against the portfolio, which is the borrow step of buy-borrow-die. It touches every EU pick, the top two included (Algarve 1, Lisbon 2), and the lending rubric in src/data/expatPicks.ts, whose score 3 reads "IBKR only, or EU residence where Schwab reportedly restricts cash-out by margin": if IBKR restricts it too, EU profiles may belong at 2 ("IBKR only, and even that uncertain") or the rubric needs a line of its own. Neither the scores nor the rubric were changed here: user's call.
- **Austria** — Vienna (`at-tax-oekb-tax-office`): Vienna's `why` in src/data/expatPicks.ts says "yearly tax on the growth of unregistered funds (likely US ETFs)". The substance holds; "unregistered" is loose for "non-reporting" (the fund does not report its tax figures to the OeKB). Not edited: user's call.
- **Austria** — Vienna (`at-tax-non-reporting-lump-sum`): Vienna's `why` ("No inheritance tax and a US treaty, but 27.5% on dividends, yearly tax on the growth of unregistered funds (likely US ETFs) and a quota-limited settlement permit") was checked clause by clause: no inheritance tax (PwC), a US estate and gift tax treaty (IRS list), 27.5% on dividends (PwC), the yearly fund tax (PwC), and the quota (oesterreich.gv.at) all hold. Rank 75 and the `why` are unchanged.
- **Austria** — Vienna (`at-lending-ibkr-margin-cash-out`): Vienna (rank 75, last) now scores lending 2. Its `why` does not mention borrowing, so it is not contradicted; the rank is unchanged. With Schwab reportedly accepting Austria residents, Vienna would have been a 4 by the old reading outside the EU; inside the EU the rubric gives 2. User's call.
- **Bulgaria** — Plovdiv (`bg-lending-ibkr-margin-cash-out`): Plovdiv (pick 44) now scores lending 2. Its `why` does not mention borrowing, so it is not contradicted. Rank and `why` are unchanged: user's call.
- **Croatia** — Split (`hr-lending-ibkr-margin-cash-out`): Split (pick 66) now scores lending 2. Its `why` ("Croatia's taxes suit BBD, but there is no residence route for a retiree") does not mention borrowing, so it is not contradicted, though "suit BBD" now holds for the tax and estate steps only. Rank and `why` are unchanged: user's call.
- **Cyprus** — Paphos, Limassol (`cy-lending-ibkr-margin-cash-out`): Paphos is pick 3 and Limassol pick 18, and both now score lending 2: the one broker reported to serve Cyprus residents reportedly will not pay a margin loan out as cash, so the borrow step of buy-borrow-die is in doubt for the third-ranked pick. Paphos's `why` sells the tax profile, residence and healthcare and does not mention borrowing, so it is not contradicted, but a rank of 3 sits oddly beside a lending score of 2. Ranks and `why` lines are unchanged: user's call.
- **Czech Republic** — Prague (`cz-lending-ibkr-margin-cash-out`): Prague (pick 43) now scores lending 2. Its `why` does not mention borrowing, so it is not contradicted; rank unchanged. With Schwab reportedly accepting Czech residents, Prague would have been a 4 by the old reading outside the EU; inside the EU the rubric gives 2. User's call.
- **France** — Paris, Nice, Gascony (Auch) (`fr-lending-ibkr-margin-cash-out`): The two France picks (Nice 58, Gascony 68) and Paris (profiled, not one of the ranked 75) now score lending 2, and their profiles say the one reported broker reportedly will not pay a margin loan out as cash. Their `why` lines in src/data/expatPicks.ts (Nice, Gascony) do not mention borrowing, so none is contradicted. Ranks and `why` lines are unchanged: user's call.
- **Georgia** — Tbilisi, Batumi (`ge-tax-us-treaty-withholding`): Tbilisi (pick 23): the `why` ends "there is no US tax treaty". The IRS lists Georgia among the countries covered by the 1973 US–USSR income tax treaty (its Georgia treaty page, reviewed August 2026, and Publication 901), so on the IRS's own list that statement is false. There is no US estate treaty, and the old treaty is thin, so the practical point (little treaty relief) survives; the wording does not. The 30% withholding it was tied to in the profile does not apply to a US citizen in any case. User's call; the `why` was not edited.
- **Greece** — Athens, Crete (Chania) (`gr-lending-ibkr-margin-cash-out`): Both Greece picks (Athens 11, Crete 13) now score lending 2, and their profiles say both reported brokers reportedly will not pay a margin loan out as cash. Their `why` lines in src/data/expatPicks.ts do not mention borrowing, so neither is contradicted. Ranks and `why` lines are unchanged: user's call.
- **Hungary** — Budapest (`hu-lending-ibkr-margin-cash-out`): Budapest (pick 47) now scores lending 2. Its `why` does not mention borrowing, so it is not contradicted. Rank and `why` are unchanged: user's call.
- **Hungary** — Budapest (`hu-visa-programme-closing-2027`): Budapest (pick 47): the `why` says "a €250k fund investment gives residence". A draft bill published on 4 November 2026 would close the guest investor programme to new applicants from 1 January 2027 (reported by one trade outlet; not passed when read). If it passes there is no route for a retiree on a portfolio (the 2024 law removed the "other purposes" permit), the visa score would fall to 1 and the `why` would be false. User's call; re-check the bill before deploy.
- **Italy** — Rome, Florence (`it-tax-dividends-26`): The `why` lines of Florence (55) and Rome (69) in src/data/expatPicks.ts say "26% on dividends". For shares that holds. For a portfolio of US-domiciled ETFs or mutual funds, which is what most US retirees hold, distributions and gains reportedly fall outside the 26% regime and are taxed at progressive rates, which is worse than the `why` says; it supports the low rank. Florence's `why` also calls the elective-residence visa "good" while the profile scores visa 3 (a €31,000 passive-income bar). Neither `why` nor the ranks were changed: user's call.
- **Italy** — Rome, Florence (`it-lending-ibkr-margin-cash-out`): Both Italy picks (Florence 55, Rome 69) now score lending 2, and their profiles say the one reported broker reportedly will not pay a margin loan out as cash. Their `why` lines in src/data/expatPicks.ts do not mention borrowing, so neither is contradicted. Ranks and `why` lines are unchanged: user's call.
- **Malta** — Sliema (`mt-lending-ibkr-margin-cash-out`): Sliema (rank 19) now scores lending 2, and its profile says the one reported broker reportedly will not pay a margin loan out as cash. Its `why` says "only IBKR is known to serve residents", which still holds but undersells the problem. Rank and `why` are unchanged: user's call.
- **Portugal** — Lisbon, Porto, Algarve (Faro), Madeira (Funchal), Cascais, Tavira (`pt-lending-ibkr-margin-cash-out`): All six Portugal picks (Algarve 1, Lisbon 2, Porto 7, Cascais 8, Tavira 14, Madeira 16) now score lending 2, and their profiles say the borrow step is reportedly closed to EU residents at both brokers. Their `why` lines in src/data/expatPicks.ts do not mention borrowing, so none is contradicted, but the top two picks of a buy-borrow-die ranking are places where the borrow step reportedly does not work as cash. Ranks and `why` lines are unchanged: user's call.
- **Portugal** — Tavira (`pt-healthcare-tavira-drive-time`): Tavira's `why` in src/data/expatPicks.ts says the CUF Faro hospital is "30 to 40 minutes away"; no page read confirms the drive time, and the hospital is at Gambelas, beyond Faro. Not changed.
- **Spain** — Valencia, Alicante, Torrevieja, Málaga, Madrid, Barcelona, Tarragona (`es-lending-ibkr-margin-cash-out`): All seven Spain picks (Málaga 9, Madrid 10, Valencia 15, Alicante 32, Torrevieja 33, Tarragona 70, Barcelona 71) now score lending 2, and their profiles say the borrow step is reportedly closed to EU residents at both brokers. Their `why` lines in src/data/expatPicks.ts do not mention borrowing, so none is contradicted. Ranks and `why` lines are unchanged: user's call.
- **Switzerland** — Zurich (`ch-lending-schwab-cash-out-outside-eu`): Zurich is not one of the ranked 75, so no rank or `why` is touched. Lending goes 4 → 3, to match London, which is in the same position. On the letter of the rubric Zurich still fits 4 ("Schwab International reported to accept residents (outside the EU) plus IBKR, margin terms unconfirmed"). But the rubric's "(outside the EU)" stands for "outside Schwab's cash-out bar", and the reported clause says "Customers residing within Europe", which on its plain words reaches Switzerland as it reaches the UK. With Schwab's cash-out likely barred, IBKR is the one broker left for the borrow step: the rubric's 3 ("IBKR only"). It is not 2: Switzerland is not EU residence, and for IBKR the reports are, if anything, better than for the EU (Swiss residents reportedly sit with the US or UK entity; 2024 forum posts report margin withdrawals, with one report against). If the user reads the rubric on its letter, both London and Zurich would be 4; the rubric would be truer as "outside Europe". User's call.
- **Turkey** — Antalya, Istanbul (`tr-tax-law-7582-exemption`): Antalya (pick 21) and Istanbul (pick 45): the `why` lines rest on this regime ("exempts foreign income for 20 years"). It is enacted law (Official Gazette 4 June 2026), confirmed by EY, PwC and a law-firm note; the `why` is not false. The regime is five months old, needs a certificate applied for in the year of arrival, and the profiles call it untested. No change proposed.
- **Turkey** — Antalya, Istanbul (`tr-estate-foreign-assets-scope`): Antalya (pick 21): the `why` says "with 1% inheritance tax". By Article 1 of the inheritance tax law, US assets of a US citizen left to US-resident heirs appear to be outside Turkish inheritance tax altogether, so the 1% may overstate the cost; it is not understated. No change proposed.
- **United Kingdom** — London (`uk-lending-ib-uk-margin-cash-out`): London is not one of the ranked 75, so no rank or `why` is touched. The lending score is left at 3, and the rubric as written does not fit the UK cleanly: 4 needs Schwab "outside the EU" plus IBKR, which the UK meets on the letter, but Schwab's reported clause says "Europe", not "EU", and likely bars the cash-out for UK residents, leaving IBKR alone (3). 2 is for "IBKR only and even that uncertain, or EU residence": the EU limb does not apply, and for IB UK the only evidence is one 2024 forum thread with reports both ways, where the EU correction rested on two broker help pages and IBKR Ireland's agreement. If IB UK's bar is confirmed, the score should go to 2, as the EU profiles did. The rubric's "outside the EU" would be truer as "outside Europe"; the same question will come up for Zurich. User's call.
- **Honduras** — Roatán (`hn-healthcare-replacement`): Roatán (pick 59): the why says "the island's public hospital burned in 2024, serious cases fly out". Both halves are still true (Canada still advises evacuation for major procedures), but the island has had a public hospital again since September 2025 by the health minister's account, so the why reads as if the gap were current. No change proposed; the healthcare score stays 1.
- **Paraguay** — Asunción (`py-visa-permanent-407`): Asunción's why in expatPicks.ts says "the residency means test [is] unverified"; it is now verified: since 6 July 2026 a portfolio-only retiree cannot convert to permanent residence without active income, a pension or the US$200k Investor Pass. The profile already says so and scores visa 3; the why line is out of date.
<!-- /generated:rank-flags -->

## The tax model changes

The simulation charges two kinds of local tax: a yearly wealth tax on the portfolio, and an estate or inheritance tax when the plan ends (at death). Each country or city can have one entry in `src/data/localTaxes.ts`. The fact check found 32 places where that file disagreed with a checked fact (`modelMismatch` in the ledger). Every one was either brought into the model or named as left out, with the reason.

**Now modelled** (new or corrected):

- **United Kingdom:** 40% inheritance tax above the £325,000 nil-rate band, starting once the plan's horizon is more than 10 years after the move (the long-term-residence rule). A $5M estate after year 10 pays about $1.83M.
- **Netherlands:** Box 3 as a flat 2.16% a year of the portfolio above €59,357, and inheritance tax of 10% and 20% for children after a €26,230 exemption each.
- **Germany:** inheritance tax for children, 7% to 30% above a €400,000 allowance each, reproducing the law's step relief exactly, from 10 years after the move (the US treaty treats a US citizen who has lived there 10 years or less as US-domiciled).
- **South Korea:** inheritance tax of 10% to 50% on the worldwide estate from the move, after the KRW 500m deduction. A $2M estate pays about $535k.
- **Zurich:** the canton's and city's yearly wealth tax on net wealth, about 0.1% to 0.64% at the margin above CHF 81,000; no inheritance tax for children.
- **US states,** charged where you live at the end: from the move when the US city is your destination, and from the start when it is your home and you stay: Washington's estate tax (Seattle), Oregon's (Portland), Hawaii's (Honolulu), Minnesota's (Minneapolis), Illinois' (Chicago, reproducing the Attorney General's $285,714 on a $5M estate), Massachusetts' (Boston), New York's (New York City), the District's (Washington DC), and Pennsylvania's 4.5% inheritance tax on children (Philadelphia, Pittsburgh). The federal estate tax ($15M exemption in 2026) is not modelled for anyone.
- **Turkey:** the 1% inheritance charge is gone (a $5M estate: $50,000 before, $0 now).
- **Notes corrected, amounts unchanged:** France, Italy, Austria, Argentina, the Philippines, Japan, Barcelona and Tarragona.

**Not modelled, and why.** The simulation does not track what you paid for your holdings, or a move away from a country, so it cannot charge a tax on gains or a tax on leaving. These stay out, named in the file's header and in each country's note:

- **Canada:** at death every holding is taxed as if sold, on gains since arrival (up to about 26.8%), plus provincial probate fees. Canada has no entry: probate alone would make it look covered while leaving out the larger charge.
- **Australia:** at death, gains on shares left to heirs abroad are taxed as if sold. No entry.
- **New Zealand:** the FIF rules work like a yearly tax of up to about 2% of the portfolio after a 4-year exemption, but depend on cost and on a choice between methods, and a US citizen can opt for a method that taxes a never-sell portfolio only on dividends. No entry.
- **Exit taxes** on leaving South Africa, Japan (above JPY 100m) and South Korea (from 2027, above KRW 500m of foreign shares); **South Africa's tax on gains at death**; and **Austria's yearly tax on funds that don't report their tax figures to its reporting agent, the Oesterreichische Kontrollbank (OeKB)** (which reportedly catches US-domiciled ETFs; the OeKB is not the tax office).
- **Argentina's 2026 rates:** the simulation has one rate schedule for all years, so it uses the 0.25% that applies from 2027 on; the first year-end (0.5–0.75%) is understated.
- **The Philippines' family-home deduction** (up to PHP 10m): the modelled estate is the portfolio, with no home in it, so it does not apply.

**The judgment calls in the model.** The places where a reasonable person could have modelled it differently:

- **Turkey is now zero.** Turkey's inheritance tax law (Law 7338, Article 1) reaches property of Turkish nationals and property in Turkey; a US citizen's US securities left to US-resident children are neither. That is the statute's own words; no adviser page applies it to this exact case.
- **Box 3 on the gross portfolio.** The Dutch tax gives relief for debts (the margin loan counts at a deemed 2.70% cost), which would cut the tax by about 0.97% of the loan a year. The model ignores the relief, so it overstates the tax a little rather than understating it.
- **Zurich on the single tariff.** A married couple pays less (0% up to CHF 161,000 rather than 81,000); church tax is also left out.
- **New York's "cliff" as a ~200% band.** Between $7.35M and $7.72M New York's exemption phases out entirely, so the tax jumps from $0 to about $735k over $367,500. The model carries this exactly, as a band with a marginal rate of about 200%.
- **Korea's brackets from a dated secondary page.** Korea's own tax pages could not be read (PwC Korea refused too); the 10–50% brackets rest on a dated 2026 secondary page, with the National Tax Service's page for the worldwide reach.
- **A taxed home city is taxed as if you had always lived there.** When the plan stays home (or the destination is home), the home city's own entry applies from year 0: an estate or inheritance tax at the end, a wealth tax every year (Zurich). So "vs staying home" is taxed on both sides: with Chicago as home, Portland's estate is compared with an estate after Illinois' tax, not before it. A move charges only the destination's tax; the home's wealth tax for the years before a later move is not charged.
- **Whole-estate taxes split between two heirs.** The engine taxes each heir's share; taxes charged on the whole estate (the UK, South Korea, the US states) are expressed by halving the allowance and every threshold, which is exact for two equal heirs and approximate otherwise.
- **Argentina's first year is understated** (above).
- **Japan's permanent residents are understated.** The model brings overseas assets into Japan's inheritance tax after 10 years, which fits the profiles' Long Stay case; a permanent resident or the spouse of a Japanese national is taxed on everything from arrival.
- **Treaty credits are ignored** throughout, which can only overstate the tax.

The table lists each mismatch the ledger recorded and what was done with it.

<!-- generated:model -->
| Country | Claim | Outcome | What was done, or why not |
|---|---|---|---|
| Austria | `at-tax-oekb-tax-office` | Modelled | Note corrected in localTaxes.ts (AT) and cities.ts: funds that do not report their tax figures to Austria's reporting agent, the Oesterreichische Kontrollbank (OeKB); US REITs and BDCs reportedly count. Broker-Test source added. No amounts change (the deemed-distribution tax stays unmodelled). |
| Austria | `at-tax-dividends-interest-rate` | Modelled | Note corrected in localTaxes.ts (AT) and cities.ts: dividends and bond interest 27.5%, bank-deposit interest 25%. No bands affected. |
| Germany | `de-estate-worldwide-reach` | Modelled | New DE entry: per child, €400,000 allowance, then the § 19 class I rates (7/11/15/19/23/27/30% on the whole amount) with the § 19(3) step relief, expressed exactly as marginal bands (50% just above each limit up to the crossover, then the new rate); afterYearsResident 10 (US treaty, 1998 protocol). No wealth tax. E.g. a $5M estate to two children after year 10: about $780k. |
| Italy | `it-estate-worldwide-reach` | Modelled | Hedge removed from the IT note: Testo unico art. 2(1) taxes a resident decedent's assets even if abroad; the credit for foreign inheritance tax (art. 26) and the flat-tax new resident's Italian-assets-only scope are named as ignored. Brocardi and Agenzia sources added. No amounts change. |
| Netherlands | `nl-tax-box3-deemed-return` | Modelled | New NL entry. Wealth: Box 3 as a flat 2.16% a year (36% × 6.00% deemed return) on the gross portfolio above €59,357 (one person); the margin loan's deemed 2.70% relief (about 0.97% of the loan a year) is ignored, overstating the tax slightly rather than understating it as a net base would; the lower-actual-return option is ignored. Inheritance: per child 10% to €158,669, 20% above, after €26,230, from the move (Art. 4(2) carve-out not applied). E.g. $1M portfolio: about $20.2k a year. |
| Spain | `es-tax-catalonia-rates` | Modelled | ES_CATALONIA now uses the Catalan scale's own fifth step, €1,336,999.75 (AEAT manual added as a source); the other steps are the state scale's. Effect under $1. |
| Switzerland | `ch-tax-wealth-worldwide-net` | Modelled | New Zurich city entry: net wealth, 2026 single basic tariff (0% to CHF 81,000; 0.05% from 81,000, 0.10% from 322,000, 0.15% from 726,000, 0.20% from 1,371,000, 0.25% from 2,339,000, 0.30% from 3,304,000) × 2.14 (canton 0.95 + City of Zurich 1.19), yearly from the move; no inheritance tax for children. Married tariff and church tax not modelled. E.g. $1M net: about $1.7k a year; $5M: about $21.5k. |
| Switzerland | `ch-estate-zurich-spouse-descendants-exempt` | Modelled | The Zurich entry has no inheritance component and its note says children and a spouse are exempt. |
| Turkey | `tr-estate-normal-rates` | Modelled | TR note corrected: inheritance 1–10% (1% on the first TRY 3m up to 10% above TRY 55m, 2026; 10–30% is the gift scale) above TRY 2,907,136 per child, 1% under the new-resident regime; KPMG source added. These rates are not applied: see tr-estate-foreign-assets-scope. |
| Turkey | `tr-estate-foreign-assets-scope` | Modelled | Decided 0: the TR inheritance component is removed (was a flat 1% of the estate), on Article 1 of Law 7338 (Turkish nationals' property and property in Turkey only), in line with the other heir-based regimes modelled as zero. A $5M estate: $50,000 before, $0 now. The note keeps the rates in case it applies. |
| United Kingdom | `uk-estate-iht-rate-band` | Modelled | New GB entry: 40% of the estate above the £325,000 nil-rate band (halved per heir, so the total matches), afterYearsResident 10 (long-term residence, 10 of 20 tax years); no wealth tax; treaty credit ignored. E.g. a $5M estate after year 10: about $1.83M. |
| South Africa | `za-tax-exit-tax` | Not modelled | An exit tax on ceasing residence needs a cost basis and a departure event the engine does not have; named in the ZA note (unchanged) and the localTaxes.ts header. |
| South Africa | `za-estate-cgt-at-death` | Not modelled | CGT at death (s9HA) taxes gains accrued while resident, which needs the cost basis at arrival; neither shape carries it. Named in the ZA note (unchanged) and the localTaxes.ts header. |
| Argentina | `ar-tax-bp-rates` | Not modelled | The shape has no time-varying rates, so AR keeps the steady-state flat 0.25% (FY2027 on) above ARS 384.7M from the first year; the FY2026 year-end (0.5–0.75%) is understated, and the note now says so. The FY2026 bracket limits were not read. Note and sources (PwC quick chart, Chambers 2026) updated; gross base confirmed (debts not deductible). |
| Canada | `ca-estate-deemed-disposition` | Not modelled | The deemed disposition taxes gains accrued since arrival, which needs a cost basis neither shape carries; probate alone (Ontario 1.5%, BC about 1.4% above CAD 50k) would make Canada read as taxed while leaving out the larger charge, so Canada keeps no entry, named with the reason in the localTaxes.ts header. |
| Canada | `ca-estate-deemed-disposition-qc` | Not modelled | As ca-estate-deemed-disposition: a tax on gains needs a cost basis; Canada keeps no entry, named with the reason in the localTaxes.ts header. |
| United States | `us-estate-wa-exemption` | Modelled | New seattle entry: $3M exclusion, then the DOR table for deaths from 1 July 2026 (10% on the first $1M of taxable estate, 14%, 15%, 16%, 18%, 19%, 19.5%, 20% above $9M), whole estate halved per heir. E.g. $5M: $240,000. |
| United States | `us-estate-wa-rates` | Modelled | See us-estate-wa-exemption: the 10%–20% table from the DOR page. |
| United States | `us-estate-or-exemption` | Modelled | New portland entry: ORS 118.010, nothing under $1M, then 10% of the excess over $1M rising to 16% above $9.5M, whole estate halved per heir. E.g. $2M: $101,250. |
| United States | `us-estate-or-rates` | Modelled | See us-estate-or-exemption: all ten ORS 118.010 brackets. |
| United States | `us-estate-hi-exclusion` | Modelled | New honolulu entry: $5.49M exclusion, then HRS 236E-8 (10% on the first $1M, 11%, 12%, 13%, 14%, 15.7% from $5M, 20% above $10M), whole estate halved per heir. E.g. $7.5M: $211,200. |
| United States | `us-estate-hi-rates` | Modelled | See us-estate-hi-exclusion: the HRS 236E-8 schedule. |
| United States | `us-estate-il-exclusion-4m` | Modelled | New chicago entry: the interrelated calculation reproduced exactly as bands: 2/7 (28.57%) of the estate above $4M to the crossover at about $5,359,276, then the 26 USC 2011(b) credit table's rates r as r/(1+r) (top 16% → 13.79%), whole estate halved per heir. The AG's $5M all-Illinois example: $285,714 (tested within $1.50). |
| United States | `us-estate-mn-exclusion-3m` | Modelled | New minneapolis entry: $3M subtracted, then Minn. Stat. 291.03 (13% to $7.1M of taxable estate, 13.6%, 14.4%, 15.2%, 16% above $10.1M); § 2058 deduction added back so not interrelated; gift add-back not modelled. E.g. $5M: $260,000. |
| Japan | `jp-tax-exit-tax` | Not modelled | An exit tax on unrealised gains on departure needs a cost basis and a departure event, neither of which the engine has; named in the JP note and the localTaxes.ts header. |
| Japan | `jp-estate-foreign-national-reach` | Not modelled | The shape has one residence wait per country; JP keeps afterYearsResident 10, which fits the profiles' case (Long Stay, a Table I status). The JP note now says a permanent resident or spouse of a Japanese national is taxed on the worldwide estate from arrival, which the model understates in the first 10 years. |
| Philippines | `ph-tax-no-wealth` | Modelled | PH note: "Wealth tax not verified" replaced by "No wealth tax", with PwC's quick charts added as sources. No amounts change. |
| Philippines | `ph-estate-rate` | Not modelled | The family-home deduction (up to PHP 10m) is not applied: the modelled estate is the portfolio, with no home in it, so the 6% after PHP 5m stands. The PH note says so. |
| South Korea | `kr-tax-exit-tax` | Not modelled | An exit tax on foreign shares on emigration (from 2027) needs a cost basis and a departure event; named in the new KR note and the localTaxes.ts header. |
| South Korea | `kr-estate-worldwide` | Modelled | New KR entry: the whole estate after the KRW 500m lump-sum deduction at 10% to KRW 100m, 20% to 500m, 30% to 1bn, 40% to 3bn, 50% above (Article 26, read on a dated secondary page; NTS page for the resident's worldwide reach), split per heir by halving the deduction and limits; applies from the move. E.g. a $2M estate: about $535k. |
| Australia | `au-estate-k3` | Not modelled | A tax on the unrealised gain at death needs the cost basis at arrival, which neither shape carries; no Australia entry, named with the reason in the localTaxes.ts header and Appendix L of the research doc. |
| New Zealand | `nz-tax-fif` | Not modelled | The FIF fair-dividend-rate charge depends on cost (NZD 50,000), the lower of two methods and a 4-year exemption, and qualifying new migrants can use the revenue account method, which taxes a never-sell portfolio only on dividends (outside localTaxes.ts); New Zealand keeps no entry, named with the reason in the localTaxes.ts header. |
<!-- /generated:model -->

## Questions for you

Collected from the plan's open questions marked for the user, plus the stage 8 audit.

1. **The borrow step in Europe.** Every EU pick now scores lending 2: Schwab reportedly bars Europe residents from taking cash out through margin, and IBKR's EU entity reportedly lends only to buy securities. Portugal's six picks (Algarve 1, Lisbon 2, Porto 7, Cascais 8, Tavira 14, Madeira 16), Spain's seven, Paphos 3, Athens 11, Crete 13 and the rest kept their ranks. Re-rank, or keep and warn? IBKR's and Schwab's own pages refused every read, so someone with a browser should confirm IBKR help article 3750 and Schwab's account agreement first.
2. **`why` lines and summaries that no longer match the profile** (the plan keeps `why` lines; each is yours): Nice's summary says it "ranks last of the 50" (it is pick 58 of 75); Florence's `why` calls its visa "good" while it scores 3; Sliema's says "only IBKR is known to serve residents", which undersells that IBKR's EU entity reportedly won't pay a margin loan out as cash; Tavira's says CUF Faro is "30 to 40 minutes away", which no page confirms (the hospital is at Gambelas, beyond Faro); Roatán's (pick 59) reads as if the island still had no public hospital, though a replacement has reportedly run since September 2025; Las Terrenas's says flatly "Schwab International is unavailable", which the profile now hedges; Asunción's calls the residency means test "unverified", which is now verified (since July 2026 permanent residence needs active income, a pension or the $200k Investor Pass); Santiago's (pick 42) says foreigners' assets abroad fall outside inheritance tax, which the profile hedges and now scores estate 4. The other rank flags above (Vienna, Tbilisi, Budapest, Florence and Rome, Antalya and Istanbul, Zurich, London) are in the same position.
3. **Minneapolis's hospital.** *Settled 2026-11-15: added.* HCMC, Minneapolis's Level 1 safety-net hospital, warned in 2026 that it could close; the Legislature gave it $205 million for 2026 and access to a $500 million reserve through 2031. The profile's healthcare fact now says so (`us-health-msp-hcmc-funding`).
4. **Spain and US loans.** Spain's Los Angeles consulate says residency applicants "cannot have/leave loans or mortgages in the United States". Whether a margin loan counts is not established, and no profile mentions it. Add a warning to Spain's seven profiles?
5. **A "checked" date on each profile.** The ledger makes it possible to show "checked 15 November 2026" with links to each claim's sources and read dates. Want it?
6. **Taxes on gains at death and on leaving.** Canada, Australia, South Africa, Japan and South Korea charge tax on unrealised gains at death or on departure, which the simulation cannot express without a new feature that tracks cost basis (a plan decision left this to you). Build it, in a later plan?
7. **Scores left as they are** (see "The stage 8 score audit"): Japan's estate 2, Australia's estate 3, Korea's residency 2, Mauritius's tax 5, Seattle's and Vietnam's tax 4, Colombia's tax 1 and New Zealand's tax 2. Each is a defensible reading of a rubric that does not quite fit the case; say if you read any of them differently.

Two older open questions marked "user's call" sit outside the fact check and are listed only for completeness: whether the Plan page's "%" override should become per-city, and whether Seoul, London, Amsterdam and Berlin should get `localTaxes.ts` entries (done in this stage).

## Claims shared across many profiles

Checked once in stage 1 (`shared.json`) and applied by each country's builder. Only the corrected and can't-confirm ones are listed.

<!-- generated:shared -->
- `ibkr-accepts-residents` (Every non-US profile's lending fact: "IBKR reportedly accepts <country> residents", "IBKR reportedly serves <country> residents", "IBKR reportedly accepts residents of all non-sanctioned countries"): Interactive Brokers opens accounts for residents of the country — kept on “reportedly”.
- `ibkr-eu-entity` (EU and UK profiles' lending facts: "(likely through its EU entity)", "(EU clients through its Irish entity)", "through its Irish entity" (Dublin), "through IB UK" (London)): EU residents are served by IBKR's EU entity, Interactive Brokers Ireland Limited — kept on “likely”.
- `ibkr-eu-margin-cash-out` (The 16 EU profiles whose lending fact ends "so plan on IBKR margin" after saying Schwab bars cash-out: Portugal (6), Spain (7), Amsterdam, Berlin and Dublin; London says the same of IB UK): “so plan on IBKR margin” → “and IBKR's EU entity reportedly lends on margin only to buy securities, not to withdraw as cash, so confirm how you would draw cash before relying on either”. Source: [LYNX: Withdrawal (help page of a broker whose accounts are carried by Interactive Brokers)](https://www.lynxbroker.com/service/payments-and-transfers/withdrawal/), read 2026-11-15 (+3 more).
- `schwab-accepts-residents` (Every non-US profile's lending fact that says whether Schwab International (Schwab One International) accepts the country's residents): Schwab International opens accounts for residents of the country (or does not) — kept on “reportedly”.
- `schwab-europe-margin-cash-out` (European profiles' lending facts: "Schwab reportedly bars Europe residents from taking cash out through margin" (17 profiles), "Schwab reportedly bars Europe-resident customers from withdrawing cash against margin" (Athens, Crete); also the lending rubric in src/data/expatPicks.ts and Portugal's drawback "Schwab margin can't be drawn as cash"): Schwab does not let customers who live in Europe withdraw cash against their margin loan value — kept on “reportedly”.
<!-- /generated:shared -->

## City by city

Grouped by country (Europe, then the Middle East, Africa, Latin America, North America, Asia and Oceania). Under each country, what every city shares is listed once, then each city's own. Each corrected claim gives the ledger id, the old wording → the new wording, and the first source read (the ledger has the rest). Each can't-confirm claim is one line, with the hedge it stands on. Confirmed claims are in the ledger only.

<!-- generated:per-city -->
### Albania

Sarandë · Europe · `albania.json`, 23 claims

#### Sarandë

Corrected:

- `al-tax-us-tax-credit` (Tax): “so whether US tax is credited against the 8% is unconfirmed” → “but Albania credits foreign tax paid on foreign income up to the Albanian tax on it”. Source: [PwC: Albania, foreign tax relief and tax treaties](https://taxsummaries.pwc.com/albania/individual/foreign-tax-relief-and-tax-treaties), read 2026-11-15.
- `al-healthcare-tirana-drive` (Healthcare): “(reportedly 4–5 hours by road)” → “(reportedly about five hours by road)”. Source: [App Savvy Traveller: Tirana to Sarandë and Ksamil](https://appsavvytraveller.com/tirana-to-saranda-and-ksamil/), read 2026-11-15 (+1 more).

Can't confirm:

- `al-lending-ibkr-accepts` (Lending): IBKR accepts residents of the country — kept on “reportedly”.
- `al-lending-margin-terms-unknown` (Lending): IBKR's margin terms for residents of the country are unknown or unreported — kept on “unknown”.
- `al-lending-schwab-unavailable` (Lending): Schwab International is unavailable in Albania, which is not on its reported list — kept on “probably”.
- `al-lending-priips-not-applicable` (Lending): As a non-EU country, the EU PRIIPs limit on buying US ETFs does not apply — kept on “should not apply”.
- `al-visa-property-route-2026` (Residency): A property route changed in 2026, possibly to €300k — kept on “reportedly”.

### Austria

Vienna · Europe · `austria.json`, 30 claims

#### Vienna

Score changes: Lending 3 → 2.

Corrected:

- `at-tax-oekb-tax-office` (Tax): “funds not registered with its tax office” → “Austria taxes funds that do not report their tax figures to its reporting agent (OeKB)”. Source: [Broker-Test.at: Nichtmeldefonds, pauschale Besteuerung](https://www.broker-test.at/news/nichtmeldefonds-pauschale-besteuerung/), read 2026-11-15 (+2 more).
- `at-tax-individual-stocks` (Tax): “individual US stocks are not caught, dividends” → “ordinary individual US stocks are not caught (US REITs and BDCs reportedly are)”. Source: [Broker-Test.at: Steuern auf REITs und anderen Nicht-Meldefonds](https://www.broker-test.at/news/steuern-auf-reits-und-anderen-nicht-meldefonds/), read 2026-11-15 (+2 more).
- `at-tax-dividends-interest-rate` (Tax): “dividends and interest on a foreign account pay 27.5%” → “dividends and bond interest on a foreign account pay 27.5% (bank-deposit interest 25%)”. Source: [PwC: Austria, individual, income determination](https://taxsummaries.pwc.com/austria/individual/income-determination), read 2026-11-15.
- `at-lending-schwab-unavailable` (Lending): “Schwab International is reportedly unavailable (Austria is not on its reported list)” → “Schwab International reportedly accepts them too (Austria is on its reported list, Oct 2026)”. Source: [Your Tax Base: Charles Schwab for expats](https://yourtaxbase.com/blog/charles-schwab-for-expats), read 2026-11-15.
- `at-lending-ibkr-margin-cash-out` (Lending): “with margin terms per country unknown; Schwab International is reportedly unavailable” → “and IBKR's EU entity reportedly lends on margin only to buy securities, not to withdraw as cash, so confirm how you would draw cash before relying on either”. Source: [LYNX: Withdrawal (help page of a broker whose accounts are carried by Interactive Brokers)](https://www.lynxbroker.com/service/payments-and-transfers/withdrawal/), read 2026-11-15 (+3 more).

Can't confirm:

- `at-lending-ibkr-accepts` (Lending): IBKR serves Austria residents — kept on “reportedly”.
- `at-lending-ibkr-eu-entity` (Lending): Austria residents are served through IBKR's EU (Irish) entity — kept on “likely”.
- `at-lending-margin-terms-unknown` (Lending): IBKR's margin terms per country are unknown — kept on “unknown”.
- `at-lending-schwab-cash-out` (Lending): Schwab bars Europe residents from taking cash out through margin — kept on “reportedly”.

### Bulgaria

Plovdiv · Europe · `bulgaria.json`, 25 claims

#### Plovdiv

Score changes: Lending 3 → 2.

Corrected:

- `bg-lending-ibkr-margin-cash-out` (Lending): “with margin terms per country unknown; Schwab International is reportedly unavailable (Bulgaria” → “and IBKR's EU entity reportedly lends on margin only to buy securities, not to withdraw as cash, so confirm how you would draw cash before relying on it”. Source: [LYNX: Withdrawal (help page of a broker whose accounts are carried by Interactive Brokers)](https://www.lynxbroker.com/service/payments-and-transfers/withdrawal/), read 2026-11-15 (+3 more).

Can't confirm:

- `bg-tax-us-treaty-credit` (Tax): The US treaty credit may cancel most of the 5% — kept on “an inference”.
- `bg-lending-ibkr-accepts` (Lending): IBKR serves Bulgaria residents — kept on “reportedly”.
- `bg-lending-ibkr-eu-entity` (Lending): Bulgaria residents are served through IBKR's EU entity — kept on “likely”.
- `bg-lending-schwab-unavailable` (Lending): Schwab International is unavailable: Bulgaria is not on its reported list — kept on “reportedly”.
- `bg-visa-us-social-security` (Residency): US Social Security should count as the pension — kept on “an inference”.

### Croatia

Split · Europe · `croatia.json`, 20 claims

#### Split

Score changes: Lending 3 → 2.

Corrected:

- `hr-lending-ibkr-margin-cash-out` (Lending): “IBKR is reportedly the only option: Schwab International's online form reportedly does not accept Croatia residents;” → “and IBKR's EU entity reportedly lends on margin only to buy securities, not to withdraw as cash, so confirm how you would draw cash before relying on it”. Source: [LYNX: Withdrawal (help page of a broker whose accounts are carried by Interactive Brokers)](https://www.lynxbroker.com/service/payments-and-transfers/withdrawal/), read 2026-11-15 (+3 more).

Can't confirm:

- `hr-lending-ibkr-only-broker` (Lending): IBKR is the only US broker open to Croatia residents — kept on “reportedly”.
- `hr-lending-schwab-not-accepting` (Lending): Schwab International's online form does not accept Croatia residents — kept on “reportedly”.
- `hr-healthcare-hzzo-contribution` (Healthcare): The HZZO contribution for a non-EU retiree — kept on “unverified”.

### Cyprus

Paphos, Limassol · Europe · `cyprus.json`, 25 claims

#### All 2 cities

Score changes: Lending 3 → 2.

Corrected:

- `cy-lending-ibkr-margin-cash-out` (Lending): “with margin terms per country unknown; Schwab International is reportedly unavailable, and” → “and IBKR's EU entity reportedly lends on margin only to buy securities, not to withdraw as cash, so confirm how you would draw cash before relying on it”. Source: [LYNX: Withdrawal (help page of a broker whose accounts are carried by Interactive Brokers)](https://www.lynxbroker.com/service/payments-and-transfers/withdrawal/), read 2026-11-15 (+3 more).
- `cy-lending-drawback-borrowing-rests-on-ibkr` (Lending): “so borrowing rests on IBKR” → “Schwab International is reportedly unavailable, and IBKR reportedly will not pay a margin loan out as cash in the EU”. Source: [LYNX: Withdrawal (help page of a broker whose accounts are carried by Interactive Brokers)](https://www.lynxbroker.com/service/payments-and-transfers/withdrawal/), read 2026-11-15 (+3 more).

Can't confirm:

- `cy-tax-gesy-applies-to-non-doms` (Tax): A non-dom still pays the GeSY contribution on dividends and interest — kept on “assume it applies”.
- `cy-lending-ibkr-accepts` (Lending): IBKR serves Cyprus residents — kept on “reportedly”.
- `cy-lending-ibkr-eu-entity` (Lending): Cyprus residents are served through IBKR's EU entity — kept on “likely”.
- `cy-lending-schwab-unavailable` (Lending): Schwab International is unavailable to Cyprus residents — kept on “reportedly”.

#### Paphos

Can't confirm:

- `cy-healthcare-paphos-nicosia` (Healthcare): The national reference centres are in Nicosia, about 90 minutes away — kept on “about”.

#### Limassol

Can't confirm:

- `cy-healthcare-limassol-nicosia` (Healthcare): Nicosia's reference centres are about an hour away — kept on “about”.

### Czech Republic

Prague · Europe · `czech-republic.json`, 23 claims

#### Prague

Score changes: Lending 3 → 2.

Corrected:

- `cz-lending-schwab-unavailable` (Lending): “Schwab International is reportedly unavailable, as the Czech Republic is off its reported list” → “Schwab International reportedly accepts them too (the Czech Republic is on its reported list, Oct 2026)”. Source: [Your Tax Base: Charles Schwab for expats](https://yourtaxbase.com/blog/charles-schwab-for-expats), read 2026-11-15.
- `cz-lending-ibkr-margin-cash-out` (Lending): “with margin terms per country unknown; Schwab International is reportedly unavailable” → “and IBKR's EU entity reportedly lends on margin only to buy securities, not to withdraw as cash, so confirm how you would draw cash before relying on either”. Source: [LYNX: Withdrawal (help page of a broker whose accounts are carried by Interactive Brokers)](https://www.lynxbroker.com/service/payments-and-transfers/withdrawal/), read 2026-11-15 (+3 more).
- `cz-visa-no-investor-visa` (Residency): “There is no retirement or investor visa” → “There is no retirement visa, and the investment permit needs CZK 75m in a business plus 20 new jobs”. Source: [Ministry of the Interior (ipc.gov.cz): long-term residence permit for the purpose of investment](https://ipc.gov.cz/en/visa-and-residence-permit-types/third-country-nationals/long-term-residence-permits/long-term-residence-permit-for-the-purpose-of-investment/), read 2026-11-15 (+1 more).

Can't confirm:

- `cz-tax-us-treaty-credit` (Tax): A credit for US withholding is presumably available under the US–Czech treaty — kept on “unverified”.
- `cz-lending-ibkr-accepts` (Lending): IBKR serves Czech residents — kept on “reportedly”.
- `cz-lending-ibkr-eu-entity` (Lending): Czech residents are served through IBKR's EU entity — kept on “likely”.
- `cz-lending-margin-terms-unknown` (Lending): IBKR's margin terms per country are unknown — kept on “unknown”.
- `cz-lending-schwab-cash-out` (Lending): Schwab bars Europe residents from taking cash out through margin — kept on “reportedly”.
- `cz-visa-renewal-discretionary` (Residency): Renewal into a long-term residence permit is discretionary — kept on “reportedly”.
- `cz-healthcare-prague-hospitals` (Healthcare): Prague has the country's best hospitals and expat medical services — kept on “generally regarded”.
- `cz-healthcare-senior-premiums` (Healthcare): Senior premiums can be high — kept on “can be”.

### France

Paris, Nice, Gascony (Auch) · Europe · `france.json`, 34 claims

#### All 3 cities

Score changes: Lending 3 → 2.

Corrected:

- `fr-lending-ibkr-margin-cash-out` (Lending): “IBKR is reportedly the only option: Schwab International's online form reportedly does not accept France residents;” → “and IBKR's EU entity reportedly lends on margin only to buy securities, not to withdraw as cash, so confirm how you would draw cash before relying on it”. Source: [LYNX: Withdrawal (help page of a broker whose accounts are carried by Interactive Brokers)](https://www.lynxbroker.com/service/payments-and-transfers/withdrawal/), read 2026-11-15 (+3 more).

Can't confirm:

- `fr-lending-ibkr-only-broker` (Lending): IBKR is the only US broker open to France residents — kept on “reportedly”.
- `fr-lending-schwab-not-accepting` (Lending): Schwab International's online form does not accept France residents — kept on “reportedly”.

#### Paris

Corrected:

- `fr-tax-paris-ifi-flat-size` (Tax): “so a buyer of about 135 m² or more is in scope” → “so a flat of about 135 m² or more is in scope, or about 190 m² as a main home, which gets a 30% allowance”. Source: [Ateis Patrimoine: Impôt sur la fortune improductive, ce que la LF 2026 a retenu](https://ateispatrimoine.com/?p=13124), read 2026-11-15 (+2 more).

Can't confirm:

- `fr-healthcare-paris-american-hospital-bilingual` (Healthcare): The American Hospital of Paris is bilingual — removed (was “the private, bilingual American Hospital of Paris”).

### Georgia

Tbilisi, Batumi · Europe · `georgia.json`, 19 claims

#### All 2 cities

Corrected:

- `ge-tax-us-treaty-withholding` (Tax): “with no US–Georgia income tax treaty, US withholding on dividends may be 30% (unverified)” → “the IRS treats Georgia as covered by the 1973 US–USSR income tax treaty, and the 30% US withholding on dividends applies to foreign persons, so a US citizen instead pays US tax on them by return”. Source: [IRS: Georgia tax treaty documents](https://www.irs.gov/businesses/international-businesses/georgia-tax-treaty-documents), read 2026-11-15 (+3 more).

Can't confirm:

- `ge-lending-ibkr-accepts` (Lending): IBKR accepts residents of all non-sanctioned countries, including Georgia — kept on “reportedly”.
- `ge-lending-margin-terms-unknown` (Lending): IBKR's margin terms per country are unknown — kept on “unknown”.
- `ge-lending-schwab-unavailable` (Lending): Schwab International is unavailable: Georgia is off its reported list — kept on “reportedly”.

#### Tbilisi

Corrected:

- `ge-visa-investment-300k` (Residency): “a US$300k investment track reportedly leads to permanent residence” → “a US$300k investment permit can lead to a residence permit for indefinite stay after 5 years”. Source: [Public Service Development Agency of Georgia: residence permits](https://sda.gov.ge/en/products/migration-residence-permits/), read 2026-11-15.

Can't confirm:

- `ge-healthcare-over-70s-abroad` (Healthcare): Complex care for over-70s may mean going abroad — kept on “may”.

#### Batumi

Can't confirm:

- `ge-visa-batumi-oversupply` (Residency): Batumi's new-build market is oversupplied, so check resale value — kept on “reportedly”.

### Germany

Berlin · Europe · `germany.json`, 29 claims

#### Berlin

Score changes: Lending 3 → 2.

Corrected:

- `de-lending-ibkr-margin-cash-out` (Lending): “so plan on IBKR margin” → “and IBKR's EU entity reportedly lends on margin only to buy securities, not to withdraw as cash, so confirm how you would draw cash before relying on either”. Source: [LYNX: Withdrawal (help page of a broker whose accounts are carried by Interactive Brokers)](https://www.lynxbroker.com/service/payments-and-transfers/withdrawal/), read 2026-11-15 (+3 more).
- `de-visa-settlement` (Residency): “waivable from age 60 in hardship cases” → “waivable in hardship cases) and 60 months of pension contributions or comparable provision, which a retiree may lack”. Source: [Residence Act (AufenthG) § 9, gesetze-im-internet.de](https://www.gesetze-im-internet.de/aufenthg_2004/__9.html), read 2026-11-15 (+1 more).
- `de-healthcare-charite` (Healthcare): “Europe's largest university hospital” → “Germany's largest university hospital”. Source: [Charité: facts and figures](https://www.charite.de/en/charite/about_us/facts_figures/), read 2026-11-15.
- `de-healthcare-private-cost` (Healthcare): “and it is underwritten and costly at 65+” → “and it is costly at 65+: normal tariffs are underwritten, and the basic tariff that insurers must sell without a health surcharge is capped at about €1,018/month (2026)”. Source: [Federal Ministry of Health: Basistarif in der privaten Krankenversicherung](https://www.bundesgesundheitsministerium.de/service/begriffe-von-a-z/b/basistarif-in-der-privaten-krankenversicherung), read 2026-11-15 (+1 more).

Can't confirm:

- `de-lending-ibkr-accepts` (Lending): IBKR serves residents of Germany — kept on “reportedly”.
- `de-lending-ibkr-eu-entity` (Lending): EU clients are served through IBKR's Irish entity, Interactive Brokers Ireland Limited — kept on “reportedly”.
- `de-lending-schwab-accepts` (Lending): Schwab International accepts residents of Germany — kept on “reportedly”.
- `de-lending-schwab-cash-out` (Lending): Schwab bars Europe residents from taking cash out through margin — kept on “reportedly”.

### Greece

Athens, Crete (Chania) · Europe · `greece.json`, 30 claims

#### All 2 cities

Score changes: Lending 3 → 2.

Corrected:

- `gr-tax-5b-covers-investment-income` (Tax): “(whether it covers investment income is unverified)” → “and then taxes all foreign-source income, dividends included, at 7% for up to 15 years”. Source: [PwC: Greece, individual, other tax credits and incentives](https://taxsummaries.pwc.com/greece/individual/other-tax-credits-and-incentives), read 2026-11-15 (+2 more).
- `gr-lending-ibkr-margin-cash-out` (Lending): “withdrawing cash against margin; EU PRIIPs” → “and IBKR's EU entity reportedly lends on margin only to buy securities, not to withdraw as cash, so confirm how you would draw cash before relying on either”. Source: [LYNX: Withdrawal (help page of a broker whose accounts are carried by Interactive Brokers)](https://www.lynxbroker.com/service/payments-and-transfers/withdrawal/), read 2026-11-15 (+3 more).

Can't confirm:

- `gr-lending-ibkr-accepts` (Lending): IBKR serves Greek residents — kept on “reportedly”.
- `gr-lending-ibkr-eu-entity` (Lending): Greek residents are served through IBKR's EU entity — kept on “likely”.
- `gr-lending-schwab-accepts` (Lending): Schwab International accepts Greece residents — kept on “reportedly”.
- `gr-lending-schwab-cash-out` (Lending): Schwab bars Europe-resident customers from withdrawing cash against margin — kept on “reportedly”.

#### Athens

Corrected:

- `gr-estate-treaty-one-of-three` (Estate): “one of only three US estate tax treaties among the candidates” → “a 5% final tax on dividends and a US estate tax treaty. Athens”. Source: [IRS: Estate & gift tax treaties (international)](https://www.irs.gov/businesses/small-businesses-self-employed/estate-gift-tax-treaties-international), read 2026-11-15.

### Hungary

Budapest · Europe · `hungary.json`, 21 claims

#### Budapest

Score changes: Lending 3 → 2.

Corrected:

- `hu-tax-szocho-interest-cap` (Tax): “and interest and non-EEA dividends (including US-listed ones) also carry the 13% social contribution tax until a yearly cap” → “while interest on holdings bought since July 2023 carries the 13% with no cap, so 28% throughout”. Source: [Act LII of 2018 on social contribution tax (net.jogtar.hu consolidated text)](https://net.jogtar.hu/szocho-tv), read 2026-11-15 (+2 more).
- `hu-lending-ibkr-margin-cash-out` (Lending): “with margin terms per country unknown; Schwab International is reportedly unavailable, as Hungary” → “and IBKR's EU entity reportedly lends on margin only to buy securities, not to withdraw as cash, so confirm how you would draw cash before relying on it”. Source: [LYNX: Withdrawal (help page of a broker whose accounts are carried by Interactive Brokers)](https://www.lynxbroker.com/service/payments-and-transfers/withdrawal/), read 2026-11-15 (+3 more).
- `hu-visa-programme-closing-2027` (Residency): “buying property directly is not a listed route.” → “a draft bill of November 2026 would reportedly close the programme to new applications from 2027”. Source: [IMI Daily: Hungary proposes to abolish its golden visa program from 2027](https://www.imidaily.com/europe/hungary-proposes-to-abolish-its-golden-visa-program-from-2027/), read 2026-11-15 (+1 more).

Can't confirm:

- `hu-lending-ibkr-accepts` (Lending): IBKR serves Hungarian residents — kept on “reportedly”.
- `hu-lending-ibkr-eu-entity` (Lending): Hungarian residents are served through IBKR's EU entity — kept on “likely”.
- `hu-lending-schwab-unavailable` (Lending): Schwab International is unavailable: Hungary is off its reported list — kept on “reportedly”.
- `hu-healthcare-taj-card` (Healthcare): Public cover needs a TAJ card, which non-EU residents without a job report struggling to get — kept on “report”.

### Ireland

Dublin · Europe · `ireland.json`, 29 claims

#### Dublin

Score changes: Lending 3 → 2.

Corrected:

- `ie-tax-income-rate-usc` (Tax): “at up to 40% plus USC on income” → “at up to 40% plus USC and generally PRSI on income”. Source: [PwC: Ireland, taxes on personal income](https://taxsummaries.pwc.com/ireland/individual/taxes-on-personal-income), read 2026-11-15 (+2 more).
- `ie-tax-cgt-rate` (Tax): “33% on gains” → “31% on gains (from 7 Oct 2026)”. Source: [Revenue: how to calculate CGT](https://www.revenue.ie/en/gains-gifts-and-inheritance/transfering-an-asset/how-to-calculate-cgt.aspx), read 2026-11-15 (+1 more).
- `ie-lending-ibkr-margin-cash-out` (Lending): “so plan on IBKR margin” → “and IBKR's EU entity reportedly lends on margin only to buy securities, not to withdraw as cash, so confirm how you would draw cash before relying on either”. Source: [LYNX: Withdrawal (help page of a broker whose accounts are carried by Interactive Brokers)](https://www.lynxbroker.com/service/payments-and-transfers/withdrawal/), read 2026-11-15 (+3 more).
- `ie-healthcare-lcr-loading` (Healthcare): “with a late-entry loading of 2% of the premium per year over 34 (up to 70%) for first-time joiners” → “and the late-entry loading (2% of the premium per year of age over 34, up to 70%, for at most 10 years) does not apply to anyone who buys within nine months of becoming resident”. Source: [Health Insurance Authority: lifetime community rating (LCR)](https://www.hia.ie/information/lifetime-community-rating-lcr), read 2026-11-15.

Can't confirm:

- `ie-tax-clean-capital-loan` (Tax): Whether loan money brought into Ireland counts as a remittance of the securing assets is unsettled — kept on “needs advice”.
- `ie-lending-ibkr-accepts` (Lending): IBKR serves residents of Ireland — kept on “reportedly”.
- `ie-lending-ibkr-eu-entity` (Lending): EU clients are served through IBKR's Irish entity, Interactive Brokers Ireland Limited — kept on “reportedly”.
- `ie-lending-schwab-accepts` (Lending): Schwab International accepts residents of Ireland — kept on “reportedly”.
- `ie-lending-schwab-cash-out` (Lending): Schwab bars Europe residents from taking cash out through margin — kept on “reportedly”.

### Italy

Rome, Florence · Europe · `italy.json`, 31 claims

#### All 2 cities

Score changes: Lending 3 → 2.

Corrected:

- `it-tax-dividends-26` (Tax): “foreign dividends and interest pay a 26% substitute tax (the US credit is contested” → “foreign dividends pay a 26% substitute tax, as interest generally does (12.5% on government bonds of white-list states), though non-UCITS funds, which reportedly include US-domiciled ETFs, pay progressive income tax instead”. Source: [We Wealth: tax on foreign dividends in Italy](https://www.we-wealth.com/en?p=131082), read 2026-11-15 (+2 more).
- `it-estate-worldwide-reach` (Estate): “(believed to reach a resident's worldwide assets, unverified)” → “4% above a €1M allowance per child, on a resident's worldwide assets, and”. Source: [Brocardi: Testo unico successioni e donazioni (D.Lgs. 346/1990), art. 2, Territorialità dell'imposta](https://www.brocardi.it/testo-unico-successioni-donazioni/titolo-i/art2.html), read 2026-11-15 (+1 more).
- `it-estate-summary-treaty-wording` (Estate): “each under a US estate treaty” → “each, and Italy has a US estate treaty”. Source: [Agenzia delle Entrate: imposta di successione, aliquote e franchigie](https://www.agenziaentrate.gov.it/portale/schede/pagamenti/imposta-di-successione/aliquote-e-franchigie), read 2026-11-15 (+1 more).
- `it-lending-ibkr-margin-cash-out` (Lending): “IBKR is reportedly the only option: Schwab International's online form reportedly does not accept Italy residents;” → “and IBKR's EU entity reportedly lends on margin only to buy securities, not to withdraw as cash, so confirm how you would draw cash before relying on it”. Source: [LYNX: Withdrawal (help page of a broker whose accounts are carried by Interactive Brokers)](https://www.lynxbroker.com/service/payments-and-transfers/withdrawal/), read 2026-11-15 (+3 more).

Can't confirm:

- `it-tax-interest-26` (Tax): Foreign interest pays the 26% substitute tax — kept on “generally”.
- `it-lending-ibkr-only-broker` (Lending): IBKR is the only US broker open to Italy residents — kept on “reportedly”.
- `it-lending-schwab-not-accepting` (Lending): Schwab International's online form does not accept Italy residents — kept on “reportedly”.
- `it-visa-savings-alone` (Residency): Savings alone do not count — kept on “reportedly”.

#### Rome

Corrected:

- `it-healthcare-rome-campus-bio-medico` (Healthcare): “received JCI accreditation in 2014 (current status unverified)” → “received JCI accreditation in 2014 and its site still calls it JCI-accredited”. Source: [Fondazione Policlinico Universitario Campus Bio-Medico: quality and accreditation](https://www.policlinicocampusbiomedico.it/en/about-us/quality-and-accreditation), read 2026-11-15 (+1 more).

Can't confirm:

- `it-healthcare-rome-embassy-doctor-list` (Healthcare): The US Embassy keeps a list of English-speaking doctors — kept on “(secondary source)”.

### Malta

Sliema · Europe · `malta.json`, 20 claims

#### Sliema

Score changes: Lending 3 → 2.

Corrected:

- `mt-lending-ibkr-margin-cash-out` (Lending): “with margin terms per country unknown; Schwab International reportedly does not accept Malta, and” → “and IBKR's EU entity reportedly lends on margin only to buy securities, not to withdraw as cash, so confirm how you would draw cash before relying on it”. Source: [LYNX: Withdrawal (help page of a broker whose accounts are carried by Interactive Brokers)](https://www.lynxbroker.com/service/payments-and-transfers/withdrawal/), read 2026-11-15 (+3 more).

Can't confirm:

- `mt-tax-loan-proceeds-remittance` (Tax): Whether margin-loan proceeds brought into Malta count as a remittance — kept on “unverified”.
- `mt-lending-ibkr-accepts` (Lending): IBKR serves Malta residents — kept on “reportedly”.
- `mt-lending-ibkr-eu-entity` (Lending): Malta residents are served through IBKR's EU (Irish) entity — kept on “likely”.
- `mt-lending-schwab-not-accepting` (Lending): Schwab International does not accept Malta residents — kept on “reportedly”.

### Montenegro

Kotor · Europe · `montenegro.json`, 23 claims

#### Kotor

Corrected:

- `me-tax-capital-gains-base` (Tax): “with dividends, interest and capital gains at 15% of the gross amount,” → “with dividends and interest at 15% of the gross amount and capital gains at 15% of the gain,”. Source: [PwC: Montenegro, income determination](https://taxsummaries.pwc.com/montenegro/individual/income-determination), read 2026-11-15.

Can't confirm:

- `me-tax-surtax-capital-income` (Tax): Whether the surtax applies to capital income — kept on “unverified”.
- `me-lending-ibkr-accepts` (Lending): IBKR accepts residents of the country — kept on “reportedly”.
- `me-lending-margin-terms-unknown` (Lending): IBKR's margin terms for residents of the country are unknown or unreported — kept on “unknown”.
- `me-lending-schwab-not-accepting` (Lending): Schwab International does not accept Montenegro, which is off its reported list — kept on “most likely”.
- `me-lending-priips-not-applicable` (Lending): As a non-EU country, PRIIPs limits on US ETFs do not apply — kept on “should not apply”.
- `me-healthcare-hospital-name` (Healthcare): The bay's hospital is Kotor General Hospital — removed (was “Kotor General Hospital covers the bay”).

### Netherlands

Amsterdam · Europe · `netherlands.json`, 30 claims

#### Amsterdam

Score changes: Lending 3 → 2.

Corrected:

- `nl-tax-box3-reform-status` (Tax): “in September 2026 the cabinet asked it to pause the bill, so a 2028 start is in doubt” → “in November 2026 the cabinet sent parliament an amendment that would tax gains on shares and funds only when sold, aiming to start in 2029”. Source: [Tweede Kamer: Novelle uitbreiding vermogenswinstbelasting box 3](https://www.tweedekamer.nl/kamerstukken/plenaire_verslagen/kamer_in_het_kort/novelle-uitbreiding-vermogenswinstbelasting-box-3), read 2026-11-15 (+2 more).
- `nl-estate-treaty-art-4-2` (Estate): “has lived there under 7 of the last 10 years and had no clear intention to stay may be treated” → “has lived there under 7 of the last 10 years, was there for business, study, tourism or a similar purpose and had no clear intention to stay may be treated as US-domiciled (a retiree who settles may not fit; check with an adviser)”. Source: [Inview (Wolters Kluwer): US–Netherlands estate tax convention, Article 4](https://www.inview.nl/openCitation/id21560f434c95e312c1de2b7d8cd88e26/convention-between-the-kingdom-of-the-netherlands-and-the-united-states-of-america-for-the-avoidance-of-double-taxation-and-the-prevention-of-fiscal-evasion-with-respect-to-taxes-on-estates-and-inheritances-artikel-4), read 2026-11-15.
- `nl-lending-ibkr-margin-cash-out` (Lending): “so plan on IBKR margin” → “and IBKR's EU entity reportedly lends on margin only to buy securities, not to withdraw as cash, so confirm how you would draw cash before relying on either”. Source: [LYNX: Withdrawal (help page of a broker whose accounts are carried by Interactive Brokers)](https://www.lynxbroker.com/service/payments-and-transfers/withdrawal/), read 2026-11-15 (+3 more).
- `nl-healthcare-premium` (Healthcare): “at about €159/month (2026 average)” → “at about €157/month (2026 average)”. Source: [Rijksoverheid: premie zorgverzekering](https://www.rijksoverheid.nl/onderwerpen/zorgverzekering/vraag-en-antwoord/premie-zorgverzekering), read 2026-11-15.

Can't confirm:

- `nl-lending-ibkr-accepts` (Lending): IBKR serves residents of the Netherlands — kept on “reportedly”.
- `nl-lending-ibkr-eu-entity` (Lending): EU clients are served through IBKR's Irish entity, Interactive Brokers Ireland Limited — kept on “reportedly”.
- `nl-lending-schwab-accepts` (Lending): Schwab International accepts residents of the Netherlands — kept on “reportedly”.
- `nl-lending-schwab-cash-out` (Lending): Schwab bars Europe residents from taking cash out through margin — kept on “reportedly”.
- `nl-visa-daft-older-applicants` (Residency): Older DAFT applicants are scrutinised more closely — kept on “reportedly”.

### Portugal

Lisbon, Porto, Algarve (Faro), Madeira (Funchal), Cascais, Tavira · Europe · `portugal.json`, 54 claims

#### All 6 cities

Score changes: Lending 3 → 2.

Corrected:

- `pt-tax-us-treaty-credit` (Tax): “with the 15% US withholding creditable under the treaty” → “with US tax on them creditable up to the treaty caps (15% on dividends, 10% on interest)”. Source: [IRS: Convention between the United States and the Portuguese Republic on taxes on income, with protocol (signed 6 September 1994)](https://www.irs.gov/pub/irs-trty/portugal.pdf), read 2026-11-15 (+2 more).
- `pt-lending-ibkr-margin-cash-out` (Lending): “so plan on IBKR margin” → “and IBKR's EU entity reportedly lends on margin only to buy securities, not to withdraw as cash, so confirm how you would draw cash before relying on either”. Source: [LYNX: Withdrawal (help page of a broker whose accounts are carried by Interactive Brokers)](https://www.lynxbroker.com/service/payments-and-transfers/withdrawal/), read 2026-11-15 (+3 more).

Can't confirm:

- `pt-visa-d7-loan-draws` (Residency): Draws on a loan do not count as income for the D7 — kept on “believed”.
- `pt-lending-ibkr-accepts` (Lending): IBKR accepts Portugal residents — kept on “reportedly”.
- `pt-lending-ibkr-eu-entity` (Lending): Portugal residents are served through IBKR's EU (Irish) entity — kept on “likely”.
- `pt-lending-schwab-accepts` (Lending): Schwab International accepts Portugal residents — kept on “reportedly”.
- `pt-lending-schwab-cash-out` (Lending): Schwab bars Europe residents from taking cash out through margin — kept on “reportedly”.

#### Porto

Corrected:

- `pt-healthcare-porto-cuf-jci` (Healthcare): “CUF Porto is the CUF hospital that cites JCI accreditation” → “CUF Porto cites JCI accreditation”. Source: [CUF: where to find us (international patients)](https://cuf.pt/en/cuf-services/internacional-cuf/where-find-us), read 2026-11-15 (+1 more).

#### Algarve (Faro)

Corrected:

- `pt-healthcare-algarve-private-groups` (Healthcare): “(HPA, Lusíadas, CUF)” → “(CUF, which took over the HPA hospitals in 2026, and Lusíadas)”. Source: [HPA Saúde: HPA Group is now CUF](https://www.grupohpa.com/en/blog/hpa-group-is-now-cuf/), read 2026-11-15 (+2 more).

Can't confirm:

- `pt-healthcare-algarve-lisbon-complex` (Healthcare): Expats go to Lisbon for complex care — kept on “generally”.

#### Madeira (Funchal)

Corrected:

- `pt-tax-madeira-regional-cut` (Tax): “(up to 30% below mainland rates)” → “(30% below mainland rates in 2026)”. Source: [AT-RAM (Madeira regional tax authority): Agenda Fiscal, Janeiro 2026 (PDF)](https://at.madeira.gov.pt/Ficheiros/NL/AFJaneiro2026.pdf), read 2026-11-15 (+1 more).
- `pt-tax-madeira-flat-rate` (Tax): “reportedly not to the 28% flat rate” → “to the flat rate withheld on Portuguese-paid interest and dividends, but whether they reach the 28% on dividends from a US broker is unverified”. Source: [AT-RAM (Madeira regional tax authority): Agenda Fiscal, Janeiro 2026 (PDF)](https://at.madeira.gov.pt/Ficheiros/NL/AFJaneiro2026.pdf), read 2026-11-15 (+1 more).
- `pt-healthcare-madeira-private` (Healthcare): “the private Hospital Particular da Madeira and” → “the private Hospital CUF Madeira (the former Hospital Particular da Madeira) and”. Source: [CUF: Hospital CUF Madeira (the page's Markdown copy)](https://www.cuf.pt/hospitais-e-clinicas/hospital-cuf-madeira.md), read 2026-11-15 (+2 more).

#### Cascais

Can't confirm:

- `pt-healthcare-cascais-jci` (Healthcare): Hospital de Cascais holds JCI accreditation — kept on “unverified”.

#### Tavira

Can't confirm:

- `pt-healthcare-tavira-drive-time` (Healthcare): The Faro hospitals are 30–40 minutes from Tavira — kept on “about”.
- `pt-healthcare-tavira-lisbon-complex` (Healthcare): Complex cases go to Lisbon — kept on “generally”.

### Spain

Valencia, Alicante, Torrevieja, Málaga, Madrid, Barcelona, Tarragona · Europe · `spain.json`, 52 claims

#### All 7 cities

Score changes: Lending 3 → 2.

Corrected:

- `es-lending-ibkr-margin-cash-out` (Lending): “so plan on IBKR margin” → “and IBKR's EU entity reportedly lends on margin only to buy securities, not to withdraw as cash, so confirm how you would draw cash before relying on either”. Source: [LYNX: Withdrawal (help page of a broker whose accounts are carried by Interactive Brokers)](https://www.lynxbroker.com/service/payments-and-transfers/withdrawal/), read 2026-11-15 (+3 more).

Can't confirm:

- `es-lending-ibkr-accepts` (Lending): IBKR accepts Spain residents — kept on “reportedly”.
- `es-lending-ibkr-eu-entity` (Lending): Spain residents are served through IBKR's EU (Irish) entity — kept on “likely”.
- `es-lending-schwab-accepts` (Lending): Schwab International accepts Spain residents — kept on “reportedly”.
- `es-lending-schwab-cash-out` (Lending): Schwab bars Europe residents from taking cash out through margin — kept on “reportedly”.

#### Valencia

Corrected:

- `es-healthcare-entry-caps-valencia` (Healthcare): “private plans commonly cap entry at 70–75” → “private plans commonly cap entry at 65–75”. Source: [Póliza Médica: ¿Hasta qué edad puedo contratar un seguro de salud?](https://www.polizamedica.es/seguros/salud/hasta-que-edad-puedo-contratar-un-seguro-de-salud), read 2026-11-15.

#### Málaga

Corrected:

- `es-estate-andalusia-child-relief` (Estate): “a resident heir gets a €1M reduction plus 99% relief in Andalusia” → “a resident child gets a €1M reduction plus 99% relief in Andalusia”. Source: [Junta de Andalucía (Agencia Tributaria de Andalucía): beneficios fiscales en el impuesto sobre sucesiones](https://www.juntadeandalucia.es/organismos/atrian/areas/informacion-tributaria/impuestos/preguntas-frecuentes/impuestos-sucesiones/beneficios.html), read 2026-11-15 (+1 more).
- `es-healthcare-malaga-private-price-caps` (Healthcare): “private plans run about €240/month at 65–70, with entry caps commonly 70–75” → “private plans without co-pay were quoted at about €120–210/month at ages 65–67 (Madrid quotes, October 2026), with entry caps commonly 65–75”. Source: [Póliza Médica: ¿Hasta qué edad puedo contratar un seguro de salud?](https://www.polizamedica.es/seguros/salud/hasta-que-edad-puedo-contratar-un-seguro-de-salud), read 2026-11-15.

#### Madrid

Corrected:

- `es-healthcare-madrid-quironsalud` (Healthcare): “Hospital Universitario Quirónsalud Madrid (JCI since 2022)” → “Hospital Universitario Quirónsalud Pozuelo (named Quirónsalud Madrid until June 2026; JCI-accredited since 2021)”. Source: [El Independiente: El Hospital Quirónsalud Madrid consigue el sello dorado de la Joint Commission Internacional](https://www.elindependiente.com/vida-sana/salud/2021/03/30/el-hospital-quironsalud-madrid-consigue-el-sello-dorado-de-la-joint-commission-internacional/amp/), read 2026-11-15 (+3 more).

### Switzerland

Zurich · Europe · `switzerland.json`, 27 claims

#### Zurich

Score changes: Lending 4 → 3.

Corrected:

- `ch-tax-lump-sum-summary-year` (Tax): “Zurich abolished lump-sum taxation in 2009” → “Zurich abolished lump-sum taxation from 2010”. Source: [Canton of Zurich, Finanzdirektion: media release of 7 January 2011](https://www.zh.ch/de/news-uebersicht/medienmitteilungen/2011/01/004.html), read 2026-11-15 (+1 more).
- `ch-lending-schwab-cash-out-outside-eu` (Lending): “(Switzerland is outside the EU); margin by country of residence is unreported” → “but Schwab reportedly bars Europe residents from taking cash out through margin, which likely covers Switzerland although it is outside the EU”. Source: [Your Tax Base: Charles Schwab for expats](https://yourtaxbase.com/blog/charles-schwab-for-expats), read 2026-11-15.

Can't confirm:

- `ch-lending-ibkr-accepts` (Lending): IBKR serves Swiss residents — kept on “reportedly”.
- `ch-lending-ibkr-entity` (Lending): Swiss residents are served by IBKR's US entity (Interactive Brokers LLC) or its UK entity, not the Irish one — kept on “reportedly”.
- `ch-lending-schwab-accepts` (Lending): Schwab One International's online form accepted Switzerland in Oct 2026 — kept on “reportedly”.
- `ch-lending-ibkr-margin-cash-out` (Lending): Whether a Swiss resident can withdraw an IBKR margin loan as cash — kept on “unconfirmed”.
- `ch-lending-fidelity-vanguard` (Lending): Fidelity and Vanguard open no accounts for residents abroad — kept on “reportedly”.

### Turkey

Antalya, Istanbul · Europe · `turkey.json`, 20 claims

#### All 2 cities

Corrected:

- `tr-tax-certificate-deadline` (Tax): “if they get the exemption certificate in the first year” → “if they apply for the exemption certificate by the end of the calendar year they become resident”. Source: [Legal 500: Türkiye's new foreign income exemption, a regime for relocating individuals](https://www.legal500.com/intelligence/turkey/tax/turkiyes-new-foreign-income-exemption-a-regime-for-relocating-individuals), read 2026-11-15 (+1 more).
- `tr-estate-normal-rates` (Estate): “Inheritance tax is normally 1–30%, cut to 1%” → “Inheritance tax is normally 1–10% (gifts 10–30%) above an exemption of about TRY 2.9m per child or spouse (2026), cut to 1%”. Source: [KPMG Türkiye: 2026 inheritance and gift tax exemption amounts and brackets](https://kpmgvergi.com/yayinlar/mali-bultenler/vergi/2026-yilinda-uygulanacak-veraset-ve-intikal-vergisi-maktu-istisna-tutarlari-ile-matrah-dilim-tutarlari-yayimlandi/3355), read 2026-11-15 (+3 more).

Can't confirm:

- `tr-tax-capital-gains-unclear` (Tax): Whether foreign capital gains are covered is not explicit — kept on “not explicit”.
- `tr-estate-decedent-or-heir` (Estate): Sources differ on whether the 1% keys off the decedent or the heir — kept on “sources differ”.
- `tr-estate-foreign-assets-scope` (Estate): A foreign resident's US securities left to US heirs may be out of scope entirely — kept on “may be”.
- `tr-lending-ibkr-accepts` (Lending): IBKR accepts residents of all non-sanctioned countries, including Turkey — kept on “reportedly”.
- `tr-lending-margin-terms-unknown` (Lending): IBKR's margin terms per country are unknown — kept on “unknown”.
- `tr-lending-schwab-not-accepting` (Lending): Schwab International does not accept Turkey — kept on “reportedly”.
- `tr-lending-priips-not-applicable` (Lending): As a non-EU country, PRIIPs limits on US ETFs do not apply — kept on “should not apply”.

#### Antalya

Corrected:

- `tr-visa-closed-neighbourhoods-antalya` (Residency): “first applications are barred in 1,169 closed neighbourhoods in 15 provinces, including parts of Antalya, so check the DGMM list before buying” → “first applications were barred from 2022 in 1,169 closed neighbourhoods, including parts of Antalya, and most reportedly reopened in June 2026 without a published list, so check the address with the migration office before buying”. Source: [Turk.Estate: residence permits in Turkey's "restricted" areas, which locations reopened in 2026](https://turk.estate/en/question-answer/residence-permits-in-turkey-restricted-areas-2026/), read 2026-11-15 (+3 more).

#### Istanbul

Corrected:

- `tr-visa-closed-neighbourhoods-istanbul` (Residency): “many Istanbul neighbourhoods are among the 1,169 closed to first applications, so check the DGMM list before buying” → “many Istanbul neighbourhoods were among the 1,169 closed to first applications from 2022, and most reportedly reopened in June 2026 without a published list (Fatih and Esenyurt reportedly not), so check the address with the migration office before buying”. Source: [Turk.Estate: residence permits in Turkey's "restricted" areas, which locations reopened in 2026](https://turk.estate/en/question-answer/residence-permits-in-turkey-restricted-areas-2026/), read 2026-11-15 (+3 more).

### United Kingdom

London · Europe · `united-kingdom.json`, 29 claims

#### London

Score changes: Estate 2 → 1.

Can't confirm:

- `uk-lending-ibkr-accepts` (Lending): IBKR serves UK residents — kept on “reportedly”.
- `uk-lending-ib-uk-entity` (Lending): UK residents are served through Interactive Brokers (U.K.) Limited — kept on “reportedly”.
- `uk-lending-schwab-accepts` (Lending): Schwab International accepts UK residents — kept on “reportedly”.
- `uk-lending-schwab-cash-out-europe` (Lending): Schwab bars Europe residents from taking cash out through margin, which likely covers the UK — kept on “likely”.
- `uk-lending-ib-uk-margin-cash-out` (Lending): A UK resident can draw cash on margin at IB UK ("so plan on IBKR margin") — kept on “unconfirmed”.
- `uk-lending-uk-priips-us-etfs` (Lending): UK PRIIPs rules limited new buys of US-listed ETFs — kept on “reportedly”.

### United Arab Emirates

Dubai · Middle East · `united-arab-emirates.json`, 22 claims

#### Dubai

Corrected:

- `ae-healthcare-premiums` (Healthcare): “from about AED 5,000/year for basic narrow-network cover to AED 25,000–30,000+ for broader plans” → “basic narrow-network plans start at about AED 5,000/year, a 67-year-old retiree paid just over AED 25,000/year for a basic policy”. Source: [The National: are high insurance costs pricing retirees out of the UAE?](https://thenationalnews.com/business/money/2024/07/11/are-high-insurance-costs-pricing-retirees-out-of-living-in-the-uae-long-term), read 2026-11-15.

Can't confirm:

- `ae-lending-ibkr-serves` (Lending): IBKR accepts residents of the country — kept on “reportedly”.
- `ae-lending-schwab-accepted` (Lending): Schwab One International's online form accepted the UAE in Oct 2026 — kept on “reportedly”.
- `ae-lending-margin-unreported` (Lending): IBKR's margin terms for residents of the country are unknown or unreported — kept on “unreported”.
- `ae-lending-fidelity-vanguard` (Lending): Fidelity and Vanguard open no accounts for residents abroad — kept on “reportedly”.
- `ae-healthcare-western-trained` (Healthcare): Private hospitals have Western-trained doctors — removed (was “Good private hospitals with Western-trained doctors”).
- `ae-healthcare-ahd-jci-beds` (Healthcare): American Hospital Dubai is JCI-accredited, with 254 beds — kept on “reportedly”.

### Mauritius

Grand Baie · Africa · `mauritius.json`, 23 claims

#### Grand Baie

Can't confirm:

- `mu-tax-declaration-exemption` (Tax): The permit's required transfers can be documented as loan proceeds or US-taxed income to use a declaration exemption — removed (was “should be documented as loan proceeds or US-taxed income to use the declaration exemption”).
- `mu-tax-margin-draws-summary` (Tax): Spending funded by margin draws is close to untaxed locally (summary) — kept on “believed”.
- `mu-lending-ibkr-serves` (Lending): IBKR accepts residents of the country — kept on “reportedly”.
- `mu-lending-schwab-not-listed` (Lending): Mauritius is not on Schwab One International's reported list of accepted countries (Oct 2026) — kept on “reported”.
- `mu-lending-margin-unreported` (Lending): IBKR's margin terms for residents of the country are unknown or unreported — kept on “unreported”.
- `mu-lending-fidelity-vanguard` (Lending): Fidelity and Vanguard open no accounts for residents abroad — kept on “reportedly”.
- `mu-healthcare-drive-time` (Healthcare): Wellkin and Darné are 45–60 minutes from Grand Baie — kept on “reportedly”.
- `mu-healthcare-evacuation` (Healthcare): Complex cases are often sent to South Africa or France — kept on “unverified”.
- `mu-healthcare-public-access` (Healthcare): Public care is free, but whether non-citizen residents get it is unverified — kept on “unverified”.

### South Africa

Cape Town · Africa · `south-africa.json`, 28 claims

#### Cape Town

Corrected:

- `za-visa-dollar-figure` (Residency): “at least R37,000/month (about $2,100)” → “at least R37,000/month (about $2,200)”. Source: [South African Embassy (Washington): requirements for a retired person's visa, updated 2 Apr 2026](https://www.saembassy.org/wp-content/uploads/2026/04/Retired-Persons-Visa-updated-as-of-2-Apr-2026-1.pdf), read 2026-11-15.
- `za-healthcare-cost-at-70` (Healthcare): “roughly R17,500/month (about $1,000)” → “roughly R16,000–17,000/month (about $1,000)”. Source: [Medicalaid.com: Discovery Classic Comprehensive 2026](https://medicalaid.com/medical-aid/discovery-health/comprehensive-series/classic-comprehensive/), read 2026-11-15 (+1 more).

Can't confirm:

- `za-estate-rebalanced-portfolio` (Estate): How s4(e) holds for a portfolio rebalanced over decades — kept on “unclear”.
- `za-estate-treaty-credits-only` (Estate): The US–South Africa estate treaty gives credits only — kept on “reportedly”.
- `za-lending-ibkr-accepts` (Lending): IBKR accepts residents of the country — kept on “reportedly”.
- `za-lending-schwab-not-accepting` (Lending): Schwab One International does not accept South Africa — kept on “reportedly”.
- `za-lending-margin-unreported` (Lending): IBKR's margin terms for residents of the country are unknown or unreported — kept on “unreported”.
- `za-lending-fidelity-vanguard` (Lending): Fidelity and Vanguard open no accounts for residents abroad — kept on “reportedly”.

### Argentina

Buenos Aires · Latin America · `argentina.json`, 24 claims

#### Buenos Aires

Can't confirm:

- `ar-tax-foreign-gains-15` (Tax): Gains on foreign shares and ETFs are taxed at a flat 15% — kept on “reportedly”.
- `ar-lending-ibkr` (Lending): Interactive Brokers accepts Argentina residents — kept on “reportedly”.
- `ar-lending-schwab` (Lending): Schwab One International's application lists Argentina (October 2026) — kept on “reportedly”.
- `ar-lending-no-margin-restriction` (Lending): There is no known Schwab margin restriction for residents outside Europe — kept on “no known”.
- `ar-lending-ibkr-margin` (Lending): IBKR margin terms for residents are unconfirmed — kept on “unconfirmed”.

### Belize

Cayo (San Ignacio), Ambergris Caye (San Pedro), Placencia, Hopkins, Corozal · Latin America · `belize.json`, 35 claims

#### All 5 cities

Can't confirm:

- `bz-tax-non-qrp-rules` (Tax): The tax rules for residents outside the QRP are unverified — kept on “unverified”.
- `bz-lending-ibkr` (Lending): Interactive Brokers serves all non-sanctioned countries, so Belize residents should be accepted — kept on “reportedly”.
- `bz-lending-margin-unconfirmed` (Lending): IBKR margin terms for Belize residents are unconfirmed — kept on “unconfirmed”.
- `bz-lending-schwab` (Lending): Schwab One International probably does not accept Belize (missing from the October 2026 accepted list) — kept on “probably”.

#### Ambergris Caye (San Pedro)

Can't confirm:

- `bz-healthcare-ambergris-chambers` (Healthcare): There are two dive decompression chambers — kept on “reportedly”.

#### Placencia

Can't confirm:

- `bz-healthcare-placencia-daytime-flight` (Healthcare): The flight to Belize City is daytime only — removed (was “(3½ hours by road or a daytime flight)”).

#### Hopkins

Corrected:

- `bz-healthcare-hopkins-clinic` (Healthcare): “Only a small public clinic in the village;” → “Only a community health post in the village, whose nurse is not on site full time;”. Source: [Global Brigades: Hopkins Village](https://www.globalbrigades.org/communities/hopkins-village/), read 2026-11-15.
- `bz-healthcare-hopkins-private-care` (Healthcare): “private care is in Belize City about 2.5 hours away (secondary source)” → “private care is in Belize City about 2 hours away by road (secondary source)”. Source: [Rome2rio: Hopkins to Belize City](https://www.rome2rio.com/s/Hopkins-Belize/Belize-City), read 2026-11-15.

#### Corozal

Can't confirm:

- `bz-healthcare-corozal-chetumal` (Healthcare): Many retirees cross to Chetumal, Mexico, about 15.7 miles (26 minutes), for a wider range of services — kept on “reportedly”.
- `bz-healthcare-corozal-no-jci` (Healthcare): No JCI hospital was found — kept on “no JCI hospital was found”.
- `bz-healthcare-corozal-passport` (Healthcare): Cross-border care needs a passport — kept on “generally”.
- `bz-healthcare-corozal-insurer` (Healthcare): Insurer cover in Mexico is unverified — kept on “unverified”.

### Chile

Santiago · Latin America · `chile.json`, 19 claims

#### Santiago

Score changes: Estate 5 → 4; Lending 3 → 4.

Corrected:

- `cl-lending-schwab` (Lending): “whether Schwab One International accepts Chile was not checked” → “Schwab One International's application reportedly lists Chile (October 2026), with no known margin restriction outside Europe”. Source: [Your Tax Base: Charles Schwab for expats](https://yourtaxbase.com/blog/charles-schwab-for-expats), read 2026-11-15 (+1 more).
- `cl-visa-permanent` (Residency): “the first permit is about 1 year and renewable, and permanent residence is possible after 2 years with no more than 180 days abroad (law firm, 2024)” → “the permit is renewable, and permanent residence needs 24 months of temporary residence (12 in some cases, such as pension income), longer if absences total more than 2 months (Migration Service, 2026)”. Source: [Servicio Nacional de Migraciones: permanent residence](https://serviciomigraciones.cl/residencia-definitiva/), read 2026-11-15 (+2 more).
- `cl-health-clinics` (Healthcare): “Clínica Alemana, Clínica Las Condes, Clínica Indisa and Clínica Santa María are among Latin America's best” → “Clínica Alemana (1st in Chile and 121st in the world in Newsweek's 2026 ranking), Clínica Las Condes (5th in Chile), Clínica Santa María (9th) and Clínica Indisa (12th) lead private care”. Source: [Emol: Newsweek World's Best Hospitals 2026, Chile](https://www.emol.com/noticias/Internacional/2026/02/26/1192686/ranking-hospitales-clinicas-centros-salud.html), read 2026-11-15.

Can't confirm:

- `cl-tax-wealth-bill` (Tax): A 2026 wealth tax bill is pending — removed (was “No wealth tax (a 2026 bill is pending);”).
- `cl-estate-domicile-unverified` (Estate): Whether this holds for a foreigner who dies domiciled in Chile is unverified — kept on “unverified”.
- `cl-lending-ibkr` (Lending): Interactive Brokers serves all non-sanctioned countries, so Chile residents should be accepted — kept on “reportedly”.
- `cl-lending-ibkr-margin` (Lending): IBKR margin terms for Chile residents are unconfirmed — kept on “unconfirmed”.
- `cl-visa-1000` (Residency): In practice applicants show more than about $1,000/month — kept on “reportedly”.

### Colombia

Medellín, Cartagena, Bogotá · Latin America · `colombia.json`, 30 claims

#### All 3 cities

Can't confirm:

- `co-estate-us-heirs-unverified` (Estate): How the 15% applies to US-resident heirs inheriting US assets is unverified — kept on “unverified”.
- `co-lending-ibkr` (Lending): Interactive Brokers accepts Colombia residents — kept on “reportedly”.
- `co-lending-schwab` (Lending): Schwab One International's application lists Colombia (October 2026) — kept on “reportedly”.
- `co-lending-no-margin-restriction` (Lending): There is no known Schwab margin restriction for residents outside Europe — kept on “no known”.
- `co-lending-ibkr-margin` (Lending): IBKR margin terms for residents are unconfirmed — kept on “unconfirmed”.

#### Medellín

Corrected:

- `co-visa-m-investor-amount` (Residency): “the M-Investor route needs about $145k in Colombian real estate” → “the M-Investor route needs 350× the minimum wage, about COP 613M (~$190k), in Colombian real estate”. Source: [Cancillería: tipos de visa (second part, read from offset 100,000)](https://cancilleria.gov.co/atencion-y-servicio-al-ciudadano/tramites-y-servicios/visa/tipos-de-visa), read 2026-11-15 (+1 more). (also Cartagena)

Can't confirm:

- `co-health-eps-visa` (Healthcare): EPS access depends on visa type — kept on “reportedly”. (also Bogotá)

#### Cartagena

Corrected:

- `co-visa-m-investor-amount` (Residency): “the M-Investor route needs about $145k in Colombian real estate” → “the M-Investor route needs 350× the minimum wage, about COP 613M (~$190k), in Colombian real estate”. Source: [Cancillería: tipos de visa (second part, read from offset 100,000)](https://cancilleria.gov.co/atencion-y-servicio-al-ciudadano/tramites-y-servicios/visa/tipos-de-visa), read 2026-11-15 (+1 more). (also Medellín)
- `co-health-serena-only` (Healthcare): “calls itself the only high-complexity hospital in Cartagena (its JCI claim may refer to the Bogotá parent; unverified)” → “is a high-complexity hospital, the highest-ranked in Cartagena in Newsweek's 2026 list, and says it is JCI-certified”. Source: [Hospital Serena del Mar: about us](https://www.hospitalserenadelmar.com/en/about-us), read 2026-11-15 (+2 more).

Can't confirm:

- `co-health-serena-location` (Healthcare): Serena del Mar is run by Fundación Santa Fe de Bogotá, about 15 minutes from the old city — kept on “about”.

#### Bogotá

Can't confirm:

- `co-health-eps-visa` (Healthcare): EPS access depends on visa type — kept on “reportedly”. (also Medellín)

### Costa Rica

San José, Atenas · Latin America · `costa-rica.json`, 24 claims

#### All 2 cities

Corrected:

- `cr-visa-inversionista` (Residency): “Inversionista needs about $150k” → “Inversionista needs $150k, or reportedly $200k since Law 9996's window closed in July 2026”. Source: [CRIE: Law 9996 expiration, consequences for Costa Rica residency](https://crie.cr/law-9996-expiration-consequences-costa-rica-residency/), read 2026-11-15 (+1 more).

Can't confirm:

- `cr-lending-ibkr` (Lending): Interactive Brokers accepts Costa Rica residents — kept on “reportedly”.
- `cr-lending-schwab` (Lending): Schwab One International's application lists Costa Rica (October 2026) — kept on “reportedly”.
- `cr-lending-no-margin-restriction` (Lending): There is no known margin restriction outside Europe — kept on “no known”.
- `cr-lending-ibkr-margin` (Lending): IBKR margin terms by country are unconfirmed — kept on “unconfirmed”.
- `cr-visa-rentista-dividends` (Residency): Whether brokerage dividends count as "stable" income is unaddressed — kept on “unaddressed”.

#### San José

Can't confirm:

- `cr-healthcare-ccss-2022-amounts` (Healthcare): Contributions were reported at $200–400/month on $1,500–2,500 in 2022 — kept on “reported”.

#### Atenas

Can't confirm:

- `cr-healthcare-atenas-clinic` (Healthcare): Atenas has a 24-hour clinic — kept on “reportedly”.

### Dominican Republic

Las Terrenas · Latin America · `dominican-republic.json`, 18 claims

#### Las Terrenas

Corrected:

- `do-healthcare-insurance-cost` (Healthcare): “and local private cover reportedly costs $80–150/month” → “and local private plans are priced per applicant, from a published floor of about $28–70/month that rises with age (secondary source)”. Source: [Rio Times: Healthcare in the Dominican Republic for expats 2026](https://www.riotimesonline.com/healthcare-dominican-republic-expats-2026/), read 2026-11-15.

Can't confirm:

- `do-tax-171-07-reach` (Tax): Whether the exemption covers dividends above the qualifying amount is unclear — kept on “unclear”.
- `do-estate-reach` (Estate): Whether it reaches a resident's US assets is unverified — kept on “unverified”.
- `do-lending-ibkr` (Lending): Interactive Brokers accepts Dominican residents — kept on “reportedly”.
- `do-lending-margin` (Lending): Margin terms are unconfirmed — kept on “unconfirmed”.
- `do-lending-schwab` (Lending): Schwab One International's application does not accept the Dominican Republic (October 2026), so IBKR is the only known route — kept on “reportedly”.
- `do-lending-schwab-summary` (Lending): Schwab International does not accept DR residents (summary and drawback, unhedged) — kept on “reportedly”.
- `do-visa-investor` (Residency): An investor route needs about $200k — kept on “(secondary sources)”.

### Ecuador

Cuenca · Latin America · `ecuador.json`, 17 claims

#### Cuenca

Corrected:

- `ec-visa-investor` (Residency): “100× the basic wage, unverified on the official page” → “100× the basic wage of $482, 2026”. Source: [Gob.ec: temporary investor residence visa](https://www.gob.ec/mremh/tramites/concesion-visa-residencia-temporal-inversionista), read 2026-11-15 (+1 more).

Can't confirm:

- `ec-lending-ibkr` (Lending): Interactive Brokers accepts Ecuador residents — kept on “reportedly”.
- `ec-lending-schwab` (Lending): Schwab One International's application lists Ecuador (October 2026) — kept on “reportedly”.
- `ec-lending-no-margin-restriction` (Lending): There is no known Schwab margin restriction for residents outside Europe — kept on “no known”.
- `ec-lending-ibkr-margin` (Lending): IBKR margin terms for residents are unconfirmed — kept on “unconfirmed”.
- `ec-health-referrals` (Healthcare): Complex cases may go to Quito or Guayaquil — kept on “reportedly”.

### Guatemala

Lake Atitlán (Panajachel), Antigua Guatemala · Latin America · `guatemala.json`, 22 claims

#### All 2 cities

Score changes: Lending 3 → 4.

Corrected:

- `gt-tax-iusi` (Tax): “about 0.2–0.9%);” → “about 0.2–0.9%, which Decreto 18-2026 cuts to zero on homes 90 days after its 28 August 2026 publication);”. Source: [PwC: Guatemala, other taxes](https://taxsummaries.pwc.com/guatemala/individual/other-taxes), read 2026-11-15 (+3 more).
- `gt-lending-schwab` (Lending): “whether Schwab One International accepts Guatemala is unknown” → “Schwab One International's online form reportedly accepted Guatemala in Oct 2026”. Source: [Your Tax Base: Charles Schwab for expats](https://yourtaxbase.com/blog/charles-schwab-for-expats), read 2026-11-15 (+1 more).

Can't confirm:

- `gt-lending-ibkr` (Lending): Interactive Brokers serves all non-sanctioned countries, so Guatemala residents should be accepted — kept on “reportedly”.
- `gt-lending-margin-unconfirmed` (Lending): IBKR margin terms for Guatemala residents are unconfirmed — kept on “unconfirmed”.
- `gt-lending-fidelity-vanguard` (Lending): Fidelity and Vanguard open no new accounts for residents abroad — kept on “reportedly”.

#### Lake Atitlán (Panajachel)

Can't confirm:

- `gt-healthcare-pana-solola` (Healthcare): The public Hospital Nacional de Sololá is about 20 minutes uphill — kept on “about”.

#### Antigua Guatemala

Can't confirm:

- `gt-healthcare-antigua-hour` (Healthcare): Guatemala City is about an hour from Antigua — kept on “about”.

### Honduras

Roatán · Latin America · `honduras.json`, 20 claims

#### Roatán

Corrected:

- `hn-lending-schwab` (Lending): “whether Schwab One International accepts Honduras is unknown” → “Schwab One International reportedly does not accept Honduras residents (Oct 2026)”. Source: [Your Tax Base: Charles Schwab for expats](https://yourtaxbase.com/blog/charles-schwab-for-expats), read 2026-11-15 (+2 more).
- `hn-healthcare-replacement` (Healthcare): “(rebuilding was expected to take about 18 months), leaving private hospitals and clinics” → “its replacement, Hospital Satuyé, has reportedly operated since September 2025 alongside private hospitals and clinics”. Source: [La Prensa: hospital modernisation and primary care](https://www.laprensa.hn/teinteresa/avances-en-modernizacion-de-hospitales-atencion-primaria-DP28639318), read 2026-11-15 (+3 more).

Can't confirm:

- `hn-tax-ljt-could-return` (Tax): The worldwide-income bill could return — kept on “could return”.
- `hn-estate-no-statute` (Estate): No Honduran statute was found — kept on “no Honduran statute was found”.
- `hn-lending-ibkr` (Lending): Interactive Brokers lists Honduras among admitted countries — kept on “reportedly”.
- `hn-lending-margin-rules` (Lending): Margin is subject to product rules — kept on “(secondary source)”.
- `hn-lending-fidelity-vanguard` (Lending): Fidelity and Vanguard open no new accounts for residents abroad — kept on “reportedly”.
- `hn-visa-bank-renewal` (Residency): A Honduran bank account and yearly renewal are required — kept on “reported but unverified”.

### Mexico

Mexico City, Mérida, Puerto Vallarta, San Miguel de Allende, Playa del Carmen, Lake Chapala / Ajijic, Oaxaca, La Paz (Baja California Sur), Mazatlán · Latin America · `mexico.json`, 47 claims

#### All 9 cities

Corrected:

- `mx-tax-loan-proceeds` (Tax): “margin-loan proceeds are not income, so” → “margin-loan proceeds are not income (loans above MXN 600,000 a year must be reported in the annual return, or they are taxed as income), so”. Source: [mley.mx: LISR article 90 (copy of the Cámara de Diputados text)](https://mley.mx/LISR/articulo/90/), read 2026-11-15 (+1 more).

Can't confirm:

- `mx-estate-us-heirs-inference` (Estate): US-resident heirs receiving US assets fall outside Mexican tax — kept on “an inference”.
- `mx-lending-ibkr-accepts` (Lending): IBKR accepts Mexico residents (IBKR Pro) — kept on “reportedly”.
- `mx-lending-schwab-accepts` (Lending): Schwab One International's online form accepted Mexico in Oct 2026 — kept on “reportedly”.
- `mx-lending-margin-unreported` (Lending): Margin terms by country of residence are unreported — kept on “unreported”.
- `mx-lending-fidelity-vanguard` (Lending): Fidelity and Vanguard open no accounts for residents abroad — kept on “reportedly”.

#### Puerto Vallarta

Can't confirm:

- `mx-healthcare-pv-guadalajara` (Healthcare): The most complex care is in Guadalajara — kept on “reportedly”.

#### San Miguel de Allende

Corrected:

- `mx-healthcare-sma-hospitals` (Healthcare): “(including H+ and MAC)” → “(Hospital Joya and MAC; the H+ hospital closed in 2020)”. Source: [San Miguel Times: H+ hospital closes its San Miguel de Allende branch](https://sanmigueltimes.com/?p=27119), read 2026-11-15 (+2 more).

#### Playa del Carmen

Can't confirm:

- `mx-healthcare-playa-galenia-jci` (Healthcare): Galenia (Cancún) is JCI-accredited — kept on “unverified”.

#### Lake Chapala / Ajijic

Can't confirm:

- `mx-healthcare-chapala-jci` (Healthcare): Puerta de Hierro's JCI status — kept on “unverified”.

#### Oaxaca

Can't confirm:

- `mx-healthcare-oaxaca-jci` (Healthcare): None is JCI-accredited, and the nearest JCI care is in Puebla or Mexico City, hours away by road — kept on “reportedly”.

#### La Paz (Baja California Sur)

Can't confirm:

- `mx-healthcare-lapaz-jci` (Healthcare): No hospital is JCI-accredited — kept on “reportedly”.

#### Mazatlán

Can't confirm:

- `mx-healthcare-mazatlan-jci` (Healthcare): None is known to be JCI-accredited — kept on “known”.

### Panama

Panama City, Boquete, Coronado, Volcán · Latin America · `panama.json`, 32 claims

#### All 4 cities

Can't confirm:

- `pa-lending-ibkr` (Lending): Interactive Brokers accepts Panama residents — kept on “reportedly”.
- `pa-lending-schwab` (Lending): Schwab One International's application lists Panama (October 2026) — kept on “reportedly”.
- `pa-lending-no-margin-restriction` (Lending): There is no known margin restriction outside Europe — kept on “no known”.
- `pa-lending-ibkr-margin` (Lending): IBKR margin terms by country are unconfirmed — kept on “unconfirmed”.

#### Panama City

Corrected:

- `pa-visa-us-on-list` (Residency): “that the US is on the list is unverified” → “permanent; the US is on the list)”. Source: [Gaceta Oficial 30601: Executive Decree 16 of 2026 (copy hosted by NDM)](https://www.ndm.com.pa/wp-content/uploads/2026/09/Decreto-Ejecutivo-N°-16.-Incluye-a-Ecuador-en-lista-de-paises-amigos.pdf), read 2026-11-15 (+1 more).
- `pa-visa-qualified-investor-pc` (Residency): “and Qualified Investor needs $300k+ in local property, $500k in local securities or $750k on deposit (one source reports the minimum rose to $500k in September 2026)” → “and Qualified Investor needs $300k in new local property or $500k in resale property, $500k in local securities, or $500k–750k on a five-year deposit (Decree 17, September 2026)”. Source: [Kraemer & Kraemer: Panama Qualified Investor visa](https://kraemerlaw.com/en/immigration/panama-qualified-investor-visa), read 2026-11-15 (+2 more).
- `pa-healthcare-pc-us-trained` (Healthcare): “often with US-trained doctors” → “often with internationally trained, English-speaking doctors”. Source: [Reside Panama: Healthcare in Panama, hospitals, insurance and costs 2026](https://www.residepanama.com/en/reside-panama-blog/healthcare-in-panama-an-expat-guide-to-hospitals-insurance-costs-2026), read 2026-11-15.

Can't confirm:

- `pa-lending-fidelity-vanguard` (Lending): Fidelity and Vanguard open no new accounts for residents abroad — kept on “reportedly”.

#### Boquete

Corrected:

- `pa-visa-us-on-list-variant` (Residency): “the US being on the list is unverified” → “the US is on the list)”. Source: [Gaceta Oficial 30601: Executive Decree 16 of 2026 (copy hosted by NDM)](https://www.ndm.com.pa/wp-content/uploads/2026/09/Decreto-Ejecutivo-N°-16.-Incluye-a-Ecuador-en-lista-de-paises-amigos.pdf), read 2026-11-15 (+1 more). (also Coronado, Volcán)
- `pa-visa-qualified-investor-boquete` (Residency): “and Qualified Investor starts at $300k in local property (one source reports a rise to $500k in September 2026)” → “Qualified Investor starts at $300k in new local property ($500k for resale, Decree 17 of September 2026)”. Source: [Kraemer & Kraemer: Panama Qualified Investor visa](https://kraemerlaw.com/en/immigration/panama-qualified-investor-visa), read 2026-11-15 (+1 more).

Can't confirm:

- `pa-healthcare-boquete-clinics` (Healthcare): Town clinics handle routine care, with visits often $20–40 — removed (was “Town clinics handle routine care (visits often $20–40);”).

#### Coronado

Corrected:

- `pa-visa-us-on-list-variant` (Residency): “the US being on the list is unverified” → “the US is on the list)”. Source: [Gaceta Oficial 30601: Executive Decree 16 of 2026 (copy hosted by NDM)](https://www.ndm.com.pa/wp-content/uploads/2026/09/Decreto-Ejecutivo-N°-16.-Incluye-a-Ecuador-en-lista-de-paises-amigos.pdf), read 2026-11-15 (+1 more). (also Boquete, Volcán)
- `pa-visa-qualified-investor-other` (Residency): “Qualified Investor starts at $300k in local property;” → “Qualified Investor starts at $300k in new local property ($500k for resale, Decree 17 of September 2026)”. Source: [Kraemer & Kraemer: Panama Qualified Investor visa](https://kraemerlaw.com/en/immigration/panama-qualified-investor-visa), read 2026-11-15 (+1 more). (also Volcán)

#### Volcán

Corrected:

- `pa-visa-us-on-list-variant` (Residency): “the US being on the list is unverified” → “the US is on the list)”. Source: [Gaceta Oficial 30601: Executive Decree 16 of 2026 (copy hosted by NDM)](https://www.ndm.com.pa/wp-content/uploads/2026/09/Decreto-Ejecutivo-N°-16.-Incluye-a-Ecuador-en-lista-de-paises-amigos.pdf), read 2026-11-15 (+1 more). (also Boquete, Coronado)
- `pa-visa-qualified-investor-other` (Residency): “Qualified Investor starts at $300k in local property;” → “Qualified Investor starts at $300k in new local property ($500k for resale, Decree 17 of September 2026)”. Source: [Kraemer & Kraemer: Panama Qualified Investor visa](https://kraemerlaw.com/en/immigration/panama-qualified-investor-visa), read 2026-11-15 (+1 more). (also Coronado)

### Paraguay

Asunción · Latin America · `paraguay.json`, 16 claims

#### Asunción

Score changes: Lending 3 → 4.

Corrected:

- `py-lending-schwab` (Lending): “whether Schwab One International accepts Paraguay was not checked” → “Schwab One International's application reportedly lists Paraguay (October 2026), with no known margin restriction outside Europe”. Source: [Your Tax Base: Charles Schwab for expats](https://yourtaxbase.com/blog/charles-schwab-for-expats), read 2026-11-15 (+1 more).

Can't confirm:

- `py-lending-ibkr` (Lending): Interactive Brokers serves all non-sanctioned countries, so Paraguay residents should be accepted — kept on “reportedly”.
- `py-lending-ibkr-margin` (Lending): IBKR margin terms for Paraguay residents are unconfirmed — kept on “unconfirmed”.

### Peru

Lima · Latin America · `peru.json`, 19 claims

#### Lima

Score changes: Lending 3 → 4.

Corrected:

- `pe-lending-schwab` (Lending): “whether Schwab One International accepts Peru was not checked” → “Schwab One International's application reportedly lists Peru (October 2026), with no known margin restriction outside Europe”. Source: [Your Tax Base: Charles Schwab for expats](https://yourtaxbase.com/blog/charles-schwab-for-expats), read 2026-11-15 (+1 more).
- `pe-health-essalud` (Healthcare): “public EsSalud's voluntary "+Salud" costs PEN 215/month at 60+ but has long waits” → “public EsSalud's voluntary "+Salud" plan (PEN 215/month at 60+) is closed to new members until the end of 2027”. Source: [El Popular: EsSalud suspends new +Salud affiliations until 2027](https://elpopular.pe/actualidad/2026/09/19/ya-no-podras-afiliarte-a-essalud-atencion-suspenden-nuevas-afiliaciones-al-salud-hasta-2027-revisa-hasta-cuando-1013099), read 2026-11-15 (+2 more).

Can't confirm:

- `pe-lending-ibkr` (Lending): Interactive Brokers serves all non-sanctioned countries, so Peru residents should be accepted — kept on “reportedly”.
- `pe-lending-ibkr-margin` (Lending): IBKR margin terms for Peru residents are unconfirmed — kept on “unconfirmed”.
- `pe-visa-rentista-no-work` (Residency): Rentista residence gives no right to work (2023 news source) — kept on “reportedly”.
- `pe-visa-investor` (Residency): An investor route exists, but its amount is unverified — kept on “unverified”.
- `pe-health-private-65` (Healthcare): New private plans get harder to buy after 65 (one forum report says Pacífico takes new members to 65) — kept on “one forum report says”.

### Uruguay

Montevideo · Latin America · `uruguay.json`, 18 claims

#### Montevideo

Corrected:

- `uy-tax-seven-percent` (Tax): “one source says 7%)” → “the older 7% option is reportedly closed to new residents)”. Source: [IMI Daily: Uruguay raises tax holiday threshold to US$2 million, taxes foreign income at 12%](https://www.imidaily.com/latin-america/uruguay-raises-tax-holiday-threshold-to-us2-million-taxes-foreign-income-at-12/), read 2026-11-15.
- `uy-tax-holiday-183` (Tax): “the holiday needs 183 or more days a year there.” → “the holiday needs 183 or more days a year there unless you make a large qualifying investment.”. Source: [IMI Daily: Uruguay raises tax holiday threshold to US$2 million, taxes foreign income at 12%](https://www.imidaily.com/latin-america/uruguay-raises-tax-holiday-threshold-to-us2-million-taxes-foreign-income-at-12/), read 2026-11-15 (+1 more).

Can't confirm:

- `uy-tax-holiday-dividends` (Tax): That the holiday covers dividends and interest is inferred from "capital income" — kept on “inferred”.
- `uy-lending-ibkr` (Lending): Interactive Brokers accepts Uruguay residents — kept on “reportedly”.
- `uy-lending-schwab` (Lending): Schwab One International's application lists Uruguay (October 2026) — kept on “reportedly”.
- `uy-lending-no-margin-restriction` (Lending): There is no known Schwab margin restriction for residents outside Europe — kept on “no known”.
- `uy-lending-ibkr-margin` (Lending): IBKR margin terms for residents are unconfirmed — kept on “unconfirmed”.
- `uy-visa-1500` (Residency): Officials expect about $1,500/month, and dividends qualify as passive income — kept on “reportedly”.

### Canada

Toronto, Vancouver, Montréal · North America · `canada.json`, 40 claims

#### All 3 cities

Can't confirm:

- `ca-lending-ibkr-canada` (Lending): IBKR serves Canadian residents through Interactive Brokers Canada (margin under CIRO rules) — kept on “reportedly”.
- `ca-lending-schwab-no` (Lending): Schwab One International does not accept Canada residents (October 2026) — kept on “reportedly”.
- `ca-lending-us-brokers-restrict` (Lending): US brokers often restrict accounts once the holder lives in Canada — kept on “reportedly”.

#### Toronto

Can't confirm:

- `ca-health-sunnybrook` (Healthcare): Sunnybrook is in the top 30 of Newsweek's 2026 world list — kept on “reportedly”.

### United States

San Francisco, Los Angeles, San Diego, Seattle, Portland, OR, Denver, Phoenix, Scottsdale, Las Vegas, Honolulu, Boise, Salt Lake City, Austin, Dallas, Houston, Chicago, Minneapolis, Kansas City, St. Louis, Nashville, Atlanta, Charlotte, Raleigh, Asheville, New York City, Boston, Washington, DC, Philadelphia, Pittsburgh, Tampa, Miami, Orlando, Sarasota · North America · `united-states.json`, 241 claims

#### San Francisco

Corrected:

- `us-tax-sf-prop40` (Tax): “was trailing well behind in the count of the 3 November 2026 vote” → “was rejected by voters on 3 November 2026”. Source: [FOX 10 Phoenix (AP): California Prop. 40 fails, voters reject billionaire wealth tax](https://www.fox10phoenix.com/news/prop-40-fails-california-voters-reject-billionaire-wealth-tax), read 2026-11-15.

#### Los Angeles

Corrected:

- `us-tax-la-measure-ula` (Tax): “adds about 4–5.5% transfer tax on property sales above about $5M” → “adds a 4% transfer tax on property sales above $5.4M and 5.5% above $10.9M (from July 2026)”. Source: [Hanson Bridgett: Measure ULA ordinance update](https://www.hansonbridgett.com/publication/260701_7087_ula_ordinance_update_june), read 2026-11-15.
- `us-health-la-honor-roll` (Healthcare): “Cedars-Sinai, UCLA's Ronald Reagan Medical Center and USC's Keck Medicine are among the top US hospitals, and City of Hope is an NCI-designated comprehensive cancer centre” → “Cedars-Sinai and UCLA's Ronald Reagan Medical Center are on US News's 2026–27 Honor Roll of the 20 best US hospitals, USC's Keck Medicine has the NCI-designated Norris comprehensive cancer centre, and City of Hope is another”. Source: [Healio: US News announces 2026-2027 Best Hospitals](https://www.healio.com/news/primary-care/20260804/us-news-announces-20262027-best-hospitals), read 2026-11-15 (+1 more).

#### Seattle

Corrected:

- `us-health-seattle-harborview` (Healthcare): “the only Level 1 adult trauma centre for Washington, Alaska, Montana and Idaho” → “the only Level 1 adult trauma centre for Washington, Wyoming, Alaska, Montana and Idaho”. Source: [UW Medicine: Harborview Medical Center, Department of Surgery](https://www.washington.edu/hmcsurged), read 2026-11-15.

#### Portland, OR

Score changes: Estate 4 → 2.

Corrected:

- `us-tax-or-arts-tax` (Tax): “plus a $35 arts tax” → “plus an arts tax of $50 a person (2026)”. Source: [City of Portland Revenue Division: Arts Tax](https://www.portland.gov/revenue/arts-tax), read 2026-11-15.

#### Denver

Corrected:

- `us-tax-co-amendment-87-status` (Tax): “narrowly ahead but not yet certified after the November 2026 vote” → “which passed on the AP's call (about 51.4% yes) in the November 2026 vote but is not yet certified”. Source: [HPPR (Colorado Sun): Colorado voters approve Amendment 87, imposing higher income taxes on top earners](https://www.hppr.org/hppr-news/2026-11-09/colorado-voters-approve-amendment-87-imposing-higher-income-taxes-on-top-earners), read 2026-11-15 (+2 more).
- `us-tax-co-amendment-87-summary` (Tax): “is narrowly ahead in the uncertified November 2026 count” → “passed on the AP's call in November 2026 but is not yet certified”. Source: [HPPR (Colorado Sun): Colorado voters approve Amendment 87, imposing higher income taxes on top earners](https://www.hppr.org/hppr-news/2026-11-09/colorado-voters-approve-amendment-87-imposing-higher-income-taxes-on-top-earners), read 2026-11-15 (+1 more).
- `us-health-den-summary-level1` (Healthcare): “Denver adds two Level 1 trauma centres” → “Denver adds several Level 1 trauma centres”. Source: [CDPHE: trauma center designation (open data layer)](https://www.cohealthmaps.dphe.state.co.us/arcgis/rest/services/OPEN_DATA/cdphe_trauma_center_designation/MapServer/0), read 2026-11-15.

#### Phoenix

Corrected:

- `us-tax-az-ltcg-subtraction` (Tax): “at a flat 2.5% (since 2023), and exempts Social Security” → “at a flat 2.5% (since 2023), after subtracting 25% of net long-term gains on assets bought after 2011, and exempts Social Security”. Source: [Arizona Revised Statutes §43-1022: subtractions from Arizona gross income](https://www.azleg.gov/ars/43/01022.htm), read 2026-11-15. (also Scottsdale)

#### Scottsdale

Corrected:

- `us-tax-az-ltcg-subtraction` (Tax): “at a flat 2.5% (since 2023), and exempts Social Security” → “at a flat 2.5% (since 2023), after subtracting 25% of net long-term gains on assets bought after 2011, and exempts Social Security”. Source: [Arizona Revised Statutes §43-1022: subtractions from Arizona gross income](https://www.azleg.gov/ars/43/01022.htm), read 2026-11-15. (also Phoenix)
- `us-health-scot-mayo-campus` (Healthcare): “about 20 minutes north in Phoenix” → “in north Phoenix, 14 miles from the Scottsdale campus”. Source: [Mayo Clinic College of Medicine: Arizona campus locations](https://college.mayo.edu/campus-and-community/arizona/locations), read 2026-11-15 (+1 more).

#### Las Vegas

Corrected:

- `us-health-lv-two-level1` (Healthcare): “University Medical Center is Nevada's only Level 1 trauma centre, alongside the Sunrise,” → “University Medical Center and Sunrise Hospital (since April 2026) are Nevada's two Level 1 trauma centres”. Source: [Nevada DPBH: NVTrauma, designated trauma centers](https://dpbh.nv.gov/Programs/NVTrauma/NVTrauma_-_Home/), read 2026-11-15 (+1 more).

Can't confirm:

- `us-health-lv-kff-primary` (Healthcare): Nevada had the fewest primary-care doctors per capita of any state in 2025 KFF data — kept on “reportedly”.
- `us-health-lv-travel` (Healthcare): Many residents travel to Los Angeles, Salt Lake City or Phoenix for complex care — kept on “reportedly”.

#### Boise

Can't confirm:

- `us-health-boi-kff-specialists` (Healthcare): Idaho had the fewest specialists per capita of any state in 2025 KFF data — kept on “reportedly”.

#### Salt Lake City

Corrected:

- `us-tax-ut-no-local` (Tax): “Utah allows no city or county income tax” → “there is no city or county income tax in Utah”. Source: [Tax Foundation: state individual income tax rates and brackets, 2026](https://taxfoundation.org/data/all/state/state-income-tax-rates-2026/), read 2026-11-15.

#### Austin

Corrected:

- `us-health-aus-cancer-centre` (Healthcare): “and the nearest top-tier cancer centre (MD Anderson) is in Houston, about 2.5 hours away” → “and the nearest NCI comprehensive cancer centre (MD Anderson) is in Houston, about 2.5–3 hours away (UT Health San Antonio's NCI-designated Mays Cancer Center is closer)”. Source: [National Cancer Institute: find an NCI-designated cancer center](https://www.cancer.gov/research/infrastructure/cancer-centers/find), read 2026-11-15 (+2 more).

#### Dallas

Corrected:

- `us-health-dal-parkland` (Healthcare): “Parkland Memorial (the county's Level 1 trauma centre)” → “Parkland Memorial (one of five Level 1 trauma centres in Dallas)”. Source: [Texas DSHS: Texas trauma facilities](https://dshs.texas.gov/dshs-ems-trauma-systems/trauma-system-development/texas-trauma-facilities), read 2026-11-15.

#### Minneapolis

Corrected:

- `us-estate-mn-reach` (Estate): “it reaches Minnesota residents' estates wherever the US assets are held” → “it reaches a Minnesota resident's securities wherever they are held (real estate and tangible property located outside Minnesota are excluded)”. Source: [Minnesota Statutes §291.005 (2026)](https://www.revisor.mn.gov/statutes/cite/291.005), read 2026-11-15.

#### Nashville

Can't confirm:

- `us-tax-tn-never-wages` (Tax): Tennessee has never taxed wages — removed (was “and Tennessee has never taxed wages”).

#### Asheville

Corrected:

- `us-health-avl-immediate-jeopardy` (Healthcare): “three times since 2019 (most recently lifted in November 2025, with Medicare compliance issues still open)” → “four times since 2019 (the latest in January 2026, lifted in March), and CMS found it back in substantial compliance in August 2026”. Source: [North Carolina Health News: Mission Hospital, immediate jeopardy and the HCA sale contract](https://www.northcarolinahealthnews.org/2026/07/28/mission-hospital-immediate-jeopardy-hca-sale-contract/), read 2026-11-15 (+2 more).

#### Tampa

Corrected:

- `us-tax-fl-amendment-3-result` (Tax): “voters approved Amendment 3 on 3 November 2026 (about 61%, unofficial results)” → “voters approved Amendment 3 on 3 November 2026 (about 62%, unofficial results; the state certifies on 17 November)”. Source: [NBC 6 South Florida: voters approve property tax cut, reject other ballot measures](https://www.nbcmiami.com/news/local/voters-approve-property-tax-cut-reject-other-ballot-measures/3883289/?amp=1), read 2026-11-15 (+3 more). (also Miami, Orlando, Sarasota)

#### Miami

Corrected:

- `us-tax-fl-amendment-3-result` (Tax): “voters approved Amendment 3 on 3 November 2026 (about 61%, unofficial results)” → “voters approved Amendment 3 on 3 November 2026 (about 62%, unofficial results; the state certifies on 17 November)”. Source: [NBC 6 South Florida: voters approve property tax cut, reject other ballot measures](https://www.nbcmiami.com/news/local/voters-approve-property-tax-cut-reject-other-ballot-measures/3883289/?amp=1), read 2026-11-15 (+3 more). (also Tampa, Orlando, Sarasota)

#### Orlando

Corrected:

- `us-tax-fl-amendment-3-result` (Tax): “voters approved Amendment 3 on 3 November 2026 (about 61%, unofficial results)” → “voters approved Amendment 3 on 3 November 2026 (about 62%, unofficial results; the state certifies on 17 November)”. Source: [NBC 6 South Florida: voters approve property tax cut, reject other ballot measures](https://www.nbcmiami.com/news/local/voters-approve-property-tax-cut-reject-other-ballot-measures/3883289/?amp=1), read 2026-11-15 (+3 more). (also Tampa, Miami, Sarasota)

#### Sarasota

Corrected:

- `us-tax-fl-amendment-3-result` (Tax): “voters approved Amendment 3 on 3 November 2026 (about 61%, unofficial results)” → “voters approved Amendment 3 on 3 November 2026 (about 62%, unofficial results; the state certifies on 17 November)”. Source: [NBC 6 South Florida: voters approve property tax cut, reject other ballot measures](https://www.nbcmiami.com/news/local/voters-approve-property-tax-cut-reject-other-ballot-measures/3883289/?amp=1), read 2026-11-15 (+3 more). (also Tampa, Miami, Orlando)

### Indonesia

Bali (Denpasar / Canggu) · Asia · `indonesia.json`, 25 claims

#### Bali (Denpasar / Canggu)

Corrected:

- `id-visa-e33` (Residency): “about USD 130,000 (IDR 2bn) on deposit at a state-owned bank, or a USD 1m apartment, for 5 or 10 years” → “USD 130,000 on deposit at a state-owned bank, or a USD 1m apartment, for up to 5 years and 10 in all”. Source: [Directorate General of Immigration: E33 second home visa](https://www.imigrasi.go.id/wna/daftar-visa-indonesia/E33), read 2026-11-15 (+1 more).
- `id-visa-e33e` (Residency): “Silver Hair (E33E): 5 years on a USD 50,000 deposit” → “Silver Hair (E33E): 5 years (10 in all) from age 55 on a USD 50,000 deposit plus USD 3,000/month of income, with no sponsor”. Source: [Directorate General of Immigration: E33E second home visa for the elderly (5 years)](https://www.imigrasi.go.id/wna/daftar-visa-indonesia/E33E), read 2026-11-15 (+1 more).
- `id-visa-e33f-income` (Residency): “and sources disagree on its income bar (USD 1,500 or 3,000/month)” → “needs a sponsor and USD 3,000/month of income”. Source: [Directorate General of Immigration: E33F second home visa for the elderly (1 year)](https://www.imigrasi.go.id/wna/daftar-visa-indonesia/E33F), read 2026-11-15 (+2 more).
- `id-health-evacuation` (Healthcare): “complex cases are usually evacuated to Jakarta or Singapore” → “complex cases are usually evacuated to Singapore or Bangkok”. Source: [APRIL International: healthcare options for digital nomads in Bali](https://www.april-international.com/en/long-term-international-health-insurance/guide/healthcare-options-for-digital-nomads-in-bali), read 2026-11-15 (+1 more).

Can't confirm:

- `id-tax-residence-kitas` (Tax): A KITAS is read as intent to reside, making its holder resident — removed (was “or a KITAS read as intent to reside”).
- `id-lending-ibkr` (Lending): Interactive Brokers accepts Indonesia residents — kept on “reportedly”.
- `id-lending-schwab` (Lending): Schwab One International accepted Indonesia residents in Oct 2026 — kept on “reportedly”.
- `id-lending-margin-unreported` (Lending): Margin terms for Indonesia residents are not reported — kept on “unreported”.
- `id-lending-fidelity-vanguard` (Lending): Fidelity and Vanguard open no accounts for residents abroad — kept on “reportedly”.
- `id-visa-e33f-household-worker` (Residency): The E33F needs a hired Indonesian household worker — kept on “reportedly”.

### Japan

Tokyo, Osaka · Asia · `japan.json`, 23 claims

#### All 2 cities

Corrected:

- `jp-health-insurer-ages` (Healthcare): “and international plans often stop taking new members around 65–70” → “and some international plans take new members only up to about 75 (Allianz Care, secondary source), while Cigna Global sets no upper age limit”. Source: [Cigna Global: international health plans](https://cignaglobal.com/international-health-plans), read 2026-11-15 (+1 more).

Can't confirm:

- `jp-lending-ibkr` (Lending): Interactive Brokers serves Japan residents, and Japan-resident clients may be moved to IB Securities Japan — kept on “reportedly”.
- `jp-lending-schwab` (Lending): Schwab One International does not accept Japan residents — kept on “reportedly”.
- `jp-lending-margin-unknown` (Lending): Margin terms for residents of this country are not reported — kept on “unconfirmed”.
- `jp-lending-fidelity-vanguard` (Lending): Fidelity and Vanguard open no accounts for residents abroad — kept on “reportedly”.

#### Osaka

Can't confirm:

- `jp-health-osaka-fewer-english` (Healthcare): Osaka has fewer English-speaking doctors than Tokyo — kept on “generally”.

### Malaysia

Kuala Lumpur, Penang (George Town), Langkawi · Asia · `malaysia.json`, 26 claims

#### All 3 cities

Can't confirm:

- `my-lending-ibkr` (Lending): Interactive Brokers accepts Malaysia residents — kept on “reportedly”.
- `my-lending-schwab` (Lending): Schwab One International accepted Malaysia residents in Oct 2026 — kept on “reportedly”.
- `my-lending-margin-unreported` (Lending): Margin terms for Malaysia residents are not reported — kept on “unreported”.
- `my-lending-fidelity-vanguard` (Lending): Fidelity and Vanguard open no accounts for residents abroad — kept on “reportedly”.

#### Kuala Lumpur

Can't confirm:

- `my-health-sst-mm2h` (Healthcare): Whether MM2H holders are carved out of the 6% tax is unconfirmed — kept on “unconfirmed”. (also Penang (George Town))

#### Penang (George Town)

Can't confirm:

- `my-visa-penang-floor` (Residency): Penang's own foreign-buyer floor may be higher than RM600k — kept on “unverified”.
- `my-health-sst-mm2h` (Healthcare): Whether MM2H holders are carved out of the 6% tax is unconfirmed — kept on “unconfirmed”. (also Kuala Lumpur)

#### Langkawi

Can't confirm:

- `my-visa-kedah-floor` (Residency): Kedah's foreign-buyer floor may be higher than RM600k — kept on “unverified”.

### Philippines

Manila, Cebu · Asia · `philippines.json`, 20 claims

#### All 2 cities

Can't confirm:

- `ph-estate-srrv-resident` (Estate): An SRRV holder living in the Philippines would be a resident alien — kept on “likely”.
- `ph-lending-ibkr` (Lending): Interactive Brokers accepts Philippine residents — kept on “reportedly”.
- `ph-lending-schwab` (Lending): Schwab One International does not accept Philippine residents (Oct 2026) — kept on “reportedly”.
- `ph-lending-margin-unreported` (Lending): Margin terms for Philippine residents are not reported — kept on “unreported”.
- `ph-lending-fidelity-vanguard` (Lending): Fidelity and Vanguard open no accounts for residents abroad — kept on “reportedly”.

### Singapore

Singapore · Asia · `singapore.json`, 17 claims

#### Singapore

Can't confirm:

- `sg-lending-ibkr` (Lending): Interactive Brokers serves Singapore residents through its MAS-licensed Singapore entity (margin accounts from age 21) — kept on “reportedly”.
- `sg-lending-schwab` (Lending): Schwab One International's online form accepted Singapore residents in Oct 2026 — kept on “reportedly”.
- `sg-lending-schwab-accredited` (Lending): Schwab Singapore serves only accredited investors (net financial assets above S$1M, net personal assets above S$2M or income above S$300k) — kept on “reportedly”.
- `sg-lending-margin-unknown` (Lending): Margin terms for residents of this country are not reported — kept on “unreported”.

### South Korea

Seoul · Asia · `south-korea.json`, 19 claims

#### Seoul

Corrected:

- `kr-tax-financial-income` (Tax): “(dividends above KRW 20m at up to about 49.5%)” → “and foreign dividends and interest not withheld in Korea can be taxed this way below KRW 20m too”. Source: [PwC: Korea, income determination](https://taxsummaries.pwc.com/republic-of-korea/individual/income-determination), read 2026-11-15 (+2 more).
- `kr-visa-property-route` (Residency): “such as those in Jeju and Incheon” → “such as Incheon's free economic zone (to the end of 2027)”. Source: [Incheon Free Economic Zone: investment immigration](https://www.ifez.go.kr/world/content/view.do?sn=561), read 2026-11-15 (+1 more).

Can't confirm:

- `kr-lending-ibkr` (Lending): Interactive Brokers accepts Korea residents — kept on “reportedly”.
- `kr-lending-schwab` (Lending): Schwab One International's online form accepted South Korea residents in Oct 2026 — kept on “reportedly”.
- `kr-lending-margin-unknown` (Lending): Margin terms for residents of this country are not reported — kept on “unreported”.
- `kr-lending-fidelity-vanguard` (Lending): Fidelity and Vanguard open no accounts for residents abroad — kept on “reportedly”.

### Taiwan

Taipei · Asia · `taiwan.json`, 18 claims

#### Taipei

Corrected:

- `tw-health-nhi-rate` (Healthcare): “paying about 4.69% of the insured-salary basis” → “paying 5.17% of the insured-salary basis”. Source: [Taipei Times: NHI premium rate](https://www.taipeitimes.com/News/taiwan/archives/2025/11/20/2003847537), read 2026-11-15 (+2 more).
- `tw-health-nhi-abroad` (Healthcare): “and keep paying while abroad (secondary source)” → “and keep paying through trips abroad of under 6 months (secondary source)”. Source: [FAQs.tw: Taiwan NHI for foreigners, how much it costs](https://faqs.tw/en/health-insurance), read 2026-11-15 (+1 more).

Can't confirm:

- `tw-lending-ibkr` (Lending): Interactive Brokers serves Taiwan residents (IBKR Pro) — kept on “reportedly”.
- `tw-lending-schwab` (Lending): Schwab One International's online form accepted Taiwan residents in Oct 2026 — kept on “reportedly”.
- `tw-lending-margin-unknown` (Lending): Margin terms for residents of this country are not reported — kept on “unreported”.
- `tw-lending-fidelity-vanguard` (Lending): Fidelity and Vanguard open no accounts for residents abroad — kept on “reportedly”.

### Thailand

Bangkok, Chiang Mai, Phuket, Hua Hin, Chiang Rai · Asia · `thailand.json`, 33 claims

#### All 5 cities

Corrected:

- `th-visa-oa-insurance` (Residency): “O-A needs USD 100k health cover (or a USD 100k deposit)” → “O-A needs USD 100k health cover (or, if insurers refuse you, a USD 100k deposit)”. Source: [Royal Thai Embassy, Oslo: Non-Immigrant O-A (long stay)](https://oslo.thaiembassy.org/en/page/non-immigrant-o-a-long-stay), read 2026-11-15 (+1 more).

Can't confirm:

- `th-tax-loan-proceeds` (Tax): Whether remitted margin-loan proceeds are assessable income is unverified (probably not) — kept on “unverified”.
- `th-lending-ibkr` (Lending): Interactive Brokers accepts Thailand residents — kept on “reportedly”.
- `th-lending-schwab` (Lending): Schwab One International accepted Thailand residents in Oct 2026 — kept on “reportedly”.
- `th-lending-margin-unreported` (Lending): Margin terms for Thailand residents are not reported — kept on “unreported”.
- `th-lending-fidelity-vanguard` (Lending): Fidelity and Vanguard open no accounts for residents abroad — kept on “reportedly”.

#### Chiang Mai

Can't confirm:

- `th-health-chiang-mai-referral` (Healthcare): Complex care is often referred to Bangkok — kept on “reportedly”.

#### Chiang Rai

Corrected:

- `th-health-chiangrai-chiang-mai` (Healthcare): “specialist care is often in Chiang Mai, about 3.5 hours away” → “the most specialised care may mean Chiang Mai, about 2–3 hours away (secondary source)”. Source: [Chiang Rai Times: best hospitals in Chiang Rai](https://www.chiangraitimes.com/health/best-hospitals-in-chiang-rai/), read 2026-11-15.

Can't confirm:

- `th-health-chiangrai-inter` (Healthcare): Chiang Rai Inter is among the private hospitals in town — removed (was “Kasemrad Sriburin, Chiang Rai Inter)”).
- `th-health-chiangrai-overbrook-jci` (Healthcare): Overbrook claims JCI accreditation — kept on “reportedly”.

### Vietnam

Ho Chi Minh City, Da Nang, Hanoi · Asia · `vietnam.json`, 26 claims

#### All 3 cities

Can't confirm:

- `vn-tax-us-shares-capital` (Tax): Gains on US-listed shares might instead be taxed as other capital transfers, at 20% of the gain (Art. 13(1)) — kept on “might”.
- `vn-estate-us-heirs` (Estate): US-resident heirs receiving US assets are likely outside it — kept on “inferred, not confirmed”.
- `vn-lending-ibkr` (Lending): Interactive Brokers accepts Vietnam residents — kept on “reportedly”.
- `vn-lending-schwab` (Lending): Schwab One International does not accept Vietnam residents (Oct 2026) — kept on “reportedly”.
- `vn-lending-margin-unreported` (Lending): Margin terms for Vietnam residents are not reported — kept on “unreported”.
- `vn-lending-fidelity-vanguard` (Lending): Fidelity and Vanguard open no accounts for residents abroad — kept on “reportedly”.
- `vn-health-public-insurance` (Healthcare): Public-insurance access for foreigners was not confirmed — kept on “not confirmed”.

#### Da Nang

Can't confirm:

- `vn-health-danang-referral` (Healthcare): Complex cases often go to Ho Chi Minh City, Hanoi or Bangkok — kept on “(secondary source)”.

### Australia

Sydney, Melbourne · Oceania · `australia.json`, 21 claims

#### All 2 cities

Corrected:

- `au-tax-cgt-discount-2027` (Tax): “(as proposed in the 2026 budget)” → “(under a law passed in June 2026)”. Source: [KPMG TaxNewsFlash: Australia, CGT legislation passes Parliament with amendments](https://kpmg.com/us/en/taxnewsflash/news/2026/06/tnf-australia-legislation-amending-capital-gains-tax-and-introduce-new-tax-reform-measures-passes-parliament-with-amendments.html), read 2026-11-15 (+1 more).

Can't confirm:

- `au-lending-ibkr` (Lending): Interactive Brokers serves Australia residents through Interactive Brokers Australia — kept on “reportedly”.
- `au-lending-schwab` (Lending): Schwab International's online application accepted Australia residents in Oct 2026 — kept on “reportedly”.
- `au-lending-margin-unknown` (Lending): Margin terms for residents of this country are not reported — kept on “unconfirmed”.
- `au-lending-fidelity-vanguard` (Lending): Fidelity and Vanguard open no accounts for residents abroad — kept on “reportedly”.

### New Zealand

Auckland · Oceania · `new-zealand.json`, 17 claims

#### Auckland

Corrected:

- `nz-health-insurer-ages` (Healthcare): “and international plans often stop taking new members around 65–70” → “and some international plans take new members only up to about 75 (Allianz Care, secondary source), while Cigna Global sets no upper age limit”. Source: [Cigna Global: international health plans](https://cignaglobal.com/international-health-plans), read 2026-11-15 (+1 more).

Can't confirm:

- `nz-lending-ibkr` (Lending): Interactive Brokers accepts New Zealand residents on IBKR Pro, margin included — kept on “reportedly”.
- `nz-lending-schwab` (Lending): Schwab International's online application does not accept New Zealand residents — kept on “reportedly”.
- `nz-lending-margin-unknown` (Lending): Margin terms for residents of this country are not reported — kept on “unconfirmed”.
- `nz-lending-fidelity-vanguard` (Lending): Fidelity and Vanguard open no accounts for residents abroad — kept on “reportedly”.
<!-- /generated:per-city -->
