# Stage 1 · Route engine — evidence
Verified 2026-11-14 on 9a45f14, plus uncommitted changes (the stage's new files)

| Check | Result | Evidence |
|---|---|---|
| `routeBetween(home, dest)` returns, from a fixed test route table: same or shared airport, nonstop, one stop via the shared hub(s) with the shortest total distance (up to two named), and two stops when no one-stop path exists (proof: test) | pass | [route-tests.txt](route-tests.txt): `routeBetween` › 6 tests; dropping the reverse link fails 5 of 11 |
| The hour estimate is a range from great-circle distance (cruise speed plus time per leg and per connection); SAN–BKK one-stop and JFK–LHR nonstop land within an hour of published typical times (proof: test) | pass | [route-tests.txt](route-tests.txt): `estimateHours` › JFK–LHR within 6–9 h, SAN–BKK via Tokyo within 18–23 h |
| The sentence builder gives "From <home> (<IATA>): …" for every route kind, uses city names for hubs, and never says "US" (proof: test) | pass | [route-tests.txt](route-tests.txt): `routeSentence` › every kind, no "US" |

Project checks: type check pass · lint n/a (no lint script) · tests 835/835 ([tests.txt](tests.txt)) · build pass
Audit: `npm audit --omit=dev`: 0 vulnerabilities ([audit.txt](audit.txt))
