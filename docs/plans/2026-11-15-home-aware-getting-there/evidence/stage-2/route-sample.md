# Ten routes checked by hand against Wikipedia (14 Nov 2026)

Picked with a fixed-seed random draw (seed 20261114) from all 4,803 route listings in `src/data/airports/*.ts`. The pick script ran outside the repo, and its output is below. Each route was checked on the listing airport's English Wikipedia "Airlines and destinations" table through WebFetch.

| # | Listing airport → destination | Our data | Wikipedia table | Match |
|---|---|---|---|---|
| 1 | VIE → SIN | year-round | Scoot: Singapore, no seasonal label | yes |
| 2 | DOH → AYT | seasonal | Qatar Airways: "Seasonal: Antalya", no begin/resume note | yes |
| 3 | DPS → HKT | year-round | Indonesia AirAsia and TransNusa: Phuket, not seasonal | yes |
| 4 | AUH → KIX | seasonal | Etihad: "Seasonal: … Osaka–Kansai" | yes |
| 5 | MUC → IAH | year-round | United: Houston–Intercontinental, no seasonal label | yes |
| 6 | MEL → HKT | year-round | Jetstar: Phuket, not seasonal | yes |
| 7 | AGP → VIE | year-round | Austrian Airlines and Ryanair: Vienna, not seasonal | yes |
| 8 | DFW → WAS | year-round | American: Washington–Dulles and Washington–National, not seasonal | yes |
| 9 | IAH → SRQ | seasonal | United: Sarasota/Bradenton under "Seasonal:" (second part of the page) | yes |
| 10 | LON → IST | year-round | Heathrow, British Airways: Istanbul, not seasonal | yes |

10 of 10 match.

```
$ npx tsx scratchpad/pick.ts
total routes listed: 4803
VIE | SIN | year-round | https://en.wikipedia.org/wiki/Vienna_International_Airport
DOH | AYT | seasonal | https://en.wikipedia.org/wiki/Hamad_International_Airport
DPS | HKT | year-round | https://en.wikipedia.org/wiki/Ngurah_Rai_International_Airport
AUH | KIX | seasonal | https://en.wikipedia.org/wiki/Zayed_International_Airport
MUC | IAH | year-round | https://en.wikipedia.org/wiki/Munich_Airport
MEL | HKT | year-round | https://en.wikipedia.org/wiki/Melbourne_Airport
AGP | VIE | year-round | https://en.wikipedia.org/wiki/M%C3%A1laga_Airport
DFW | WAS | year-round | https://en.wikipedia.org/wiki/Dallas_Fort_Worth_International_Airport
IAH | SRQ | seasonal | https://en.wikipedia.org/wiki/George_Bush_Intercontinental_Airport
LON | IST | year-round | https://en.wikipedia.org/wiki/Heathrow_Airport
```

Limitation: a sample can confirm that listed routes exist, but it can't find routes the research missed. The researchers reported that WebFetch's summarising step had missed some routes, which they then caught by cross-checking.
