# Stage 1 evidence: BBD research (2026-11-06)

## Check 1: every candidate has a sourced row per country
Doc: [bbd-ranking-2026-11.md](../../research/bbd-ranking-2026-11.md) (1074 lines).

Candidate coverage (city → where it appears):
```
Algarve            top25=1   dropped=0
Lisbon             top25=2   dropped=0
Porto              top25=7   dropped=0
Madeira            top25=13  dropped=0
Valencia           top25=12  dropped=0
Málaga            top25=8   dropped=0
Tarragona          top25=-   dropped=1
Nice               top25=-   dropped=1
Gascony            top25=-   dropped=1
Athens             top25=9   dropped=0
Crete              top25=11  dropped=0
Florence           top25=-   dropped=1
Split              top25=-   dropped=1
Kotor              top25=24  dropped=0
Paphos             top25=3   dropped=0
Limassol           top25=15  dropped=0
Sliema             top25=16  dropped=0
Boquete            top25=5   dropped=0
Panama City        top25=4   dropped=0
San José          top25=17  dropped=0
Puerto Vallarta    top25=22  dropped=0
Mérida            top25=20  dropped=0
San Miguel         top25=23  dropped=0
Medellín          top25=-   dropped=1
Cuenca             top25=-   dropped=1
Montevideo         top25=14  dropped=0
Cayo               top25=25  dropped=0
Ambergris Caye     top25=-   dropped=1
Las Terrenas       top25=-   dropped=1
Asunción          top25=-   dropped=1
Kuala Lumpur       top25=6   dropped=0
Penang             top25=10  dropped=0
Chiang Mai         top25=18  dropped=0
Bangkok            top25=19  dropped=0
Hua Hin            top25=21  dropped=0
Da Nang            top25=-   dropped=1
Bali               top25=-   dropped=1
Philippines        top25=-   dropped=1
```

Country rows in the summary table: 24 (incl. header). Columns: wealth tax, inheritance & US treaty, dividends/interest/foreign income, asset-based residency, broker/margin, healthcare & insurance age.

Every URL in the summary sections also appears in the sourced appendices (what the researchers fetched):
```
24 summary URLs, 0 missing
```

Coordinator re-read 4 key claims against cited pages (Deloitte Malta ITP 2026, PwC Cyprus income determination, Cuatrecasas Valencia 2026, IMI Daily Uruguay); 3 confirmed, 2 wording corrections applied (Malta 'closes' → 'apply by 31 Dec 2026 for old terms'; Cyprus 17/20 rests on other sources) — noted in the doc header.

Known limitation: IBKR and Schwab International pages refused automated fetch (403), so broker/margin rows rest on secondary pages that were read and are marked as such.

## Check 2: each candidate dropped from the top 25 has a written reason
Dropped rows: 13 (Medellín, Cuenca, Da Nang, Nice, Florence, Split, Bali, Gascony, Tarragona, Ambergris Caye, Las Terrenas, Asunción, Philippines), each with a reason column. See the table above: every city has top25 rank or dropped=1.
