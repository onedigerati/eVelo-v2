# Stage 2 · Route data — evidence
Verified 2026-11-14 on 8559234, plus uncommitted changes (stage 2 work)

| Check | Result | Evidence |
|---|---|---|
| Every one of the 133 cities maps to a gateway airport within 250 km; every airport has a city name, coordinates, a source, and nonstops that name only airports in the file (proof: test) | pass | [route-tests.txt](route-tests.txt): `maps every city to a gateway airport in the graph, near the city`, `has exactly one well-formed, sourced entry per node` |
| Every home–destination pair among the 133 cities resolves to a route (ground, nonstop, one, two or three stops); none reads "no route in our data" (proof: test) | pass | [route-tests.txt](route-tests.txt): `gives every home–destination pair a route` (it failed on 8 airport pairs before three-stop routes were added: see History) |
| Known pairs come out right: New York–London and London–Lisbon nonstop, San Diego–Bangkok one stop, Torrevieja–Alicante no flight (proof: test) | pass | [route-tests.txt](route-tests.txt): `gets known pairs right` |
| Ten routes picked at random match the airport's published route list (proof: source check by hand, a test can't read the web) | pass | [route-sample.md](route-sample.md): 10/10 match the Wikipedia tables |

Project checks: type check pass ([typecheck.txt](typecheck.txt)) · no lint script · tests 845/845 ([tests.txt](tests.txt)) · build pass ([build.txt](build.txt))
Audit: `npm audit --omit=dev`: 0 vulnerabilities ([audit.txt](audit.txt))

## History
- 2026-11-14 · Every pair resolves to a route failed: 8 airport pairs (David and Roatán to small Asian airports) had no path of two stops or fewer in the real data. Fixed: three-stop routes as a last resort (logged decision), with tests.
