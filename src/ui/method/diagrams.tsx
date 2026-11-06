// Explanatory diagrams for the Method page. Inline SVG on the app's chart tokens, so they
// re-theme with everything else. Each figure has a text alternative (role="img" + label).

import { curveMonotoneX, line } from "d3-shape";
import { scaleLinear } from "d3-scale";
import { useId } from "react";
import type { AssetClass, Outlook } from "../../engine/types";
import { percent } from "../format";
import { useMediaQuery } from "../hooks";
import { weightCurve } from "./params";

/** Phones get narrower viewBoxes (so 11px text stays 11px), with layout adapted per figure. */
const useNarrow = () => useMediaQuery("(max-width: 699px)");

const pct = (x: number) => percent(x);

/* ---------------------------------------------------------------- LTV ratchet */

/**
 * An illustrative 15-year LTV path: the loan compounds through calm years, a crash pushes LTV
 * through the call line, a forced sale resets it to the target, and recovery pulls it back.
 */
export function LtvRatchet({
  maxLtv,
  targetLtv,
  loanRate,
}: {
  maxLtv: number;
  targetLtv: number;
  loanRate: number;
}) {
  const id = useId().replace(/:/g, "");
  const narrow = useNarrow();
  const W = narrow ? 360 : 640;
  const H = narrow ? 260 : 300;
  const m = { l: 40, r: 12, t: 22, b: 34 };
  const x = scaleLinear()
    .domain([0, 15])
    .range([m.l, W - m.r]);
  const y = scaleLinear()
    .domain([0, 0.8])
    .range([H - m.b, m.t]);
  const callYear = 7.7;
  // Before the call: slow convex creep, then the crash.
  const before: [number, number][] = [
    [0, 0.04],
    [1.5, 0.08],
    [3, 0.13],
    [4.5, 0.18],
    [6, 0.24],
    [6.9, 0.28],
    [7.3, 0.4],
    [callYear, maxLtv + 0.005],
  ];
  // The counterfactual: no sale, the crash keeps going.
  const ghost: [number, number][] = [
    [callYear, maxLtv + 0.005],
    [8.1, 0.7],
    [8.6, 0.76],
  ];
  const after: [number, number][] = [
    [callYear, targetLtv],
    [8.4, targetLtv + 0.07],
    [9.2, targetLtv + 0.03],
    [10.4, targetLtv - 0.06],
    [11.6, targetLtv - 0.07],
    [13, targetLtv - 0.03],
    [15, targetLtv + 0.04],
  ];
  const path = line<[number, number]>()
    .x((d) => x(d[0]))
    .y((d) => y(d[1]))
    .curve(curveMonotoneX);
  const cx = x(callYear);
  const label = `Illustration: loan-to-value rises from 4% as interest at ${pct(loanRate)} capitalizes, a market crash in year 7 pushes it through the ${pct(maxLtv)} margin-call line, a forced sale brings it back to ${pct(targetLtv)}, and the recovery pulls it lower before it creeps up again.`;

  return (
    <figure className="mfig">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mfig__svg"
        role="img"
        aria-label={label}
      >
        <defs>
          <linearGradient id={`${id}-danger`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="var(--broken)" stopOpacity="0.16" />
            <stop offset="1" stopColor="var(--broken)" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        {/* Danger zone above the call line. */}
        <rect
          x={m.l}
          y={y(0.8)}
          width={W - m.l - m.r}
          height={y(maxLtv) - y(0.8)}
          fill={`url(#${id}-danger)`}
        />
        {[0, 0.2, 0.4, 0.6, 0.8].map((v) => (
          <g key={v}>
            <line
              x1={m.l}
              x2={W - m.r}
              y1={y(v)}
              y2={y(v)}
              className="mfig__grid"
            />
            <text
              x={m.l - 8}
              y={y(v)}
              className="mfig__tick"
              textAnchor="end"
              dominantBaseline="middle"
            >
              {Math.round(v * 100)}%
            </text>
          </g>
        ))}
        {[0, 5, 10, 15].map((v) => (
          <text
            key={v}
            x={x(v)}
            y={H - m.b + 20}
            className="mfig__tick"
            textAnchor="middle"
          >
            {v === 0 ? "year 0" : v}
          </text>
        ))}
        <line
          x1={m.l}
          x2={W - m.r}
          y1={y(maxLtv)}
          y2={y(maxLtv)}
          className="mfig__threshold"
        />
        <text
          x={W - m.r}
          y={y(maxLtv) - 8}
          className="mfig__note mfig__note--broken"
          textAnchor="end"
        >
          Margin call at {pct(maxLtv)}
        </text>
        <line
          x1={m.l}
          x2={W - m.r}
          y1={y(targetLtv)}
          y2={y(targetLtv)}
          className="mfig__target"
        />
        <text x={m.l + 8} y={y(targetLtv) - 8} className="mfig__note">
          {narrow
            ? `Sale restores ${pct(targetLtv)}`
            : `A forced sale restores ${pct(targetLtv)}`}
        </text>

        <path d={path(ghost)!} className="mfig__ghost" />
        {!narrow && (
          <text
            x={x(8.65) + 6}
            y={y(0.76)}
            className="mfig__note mfig__note--faint"
            dominantBaseline="middle"
          >
            without a sale
          </text>
        )}
        <path d={path(before)!} className="mfig__line" />
        <path d={path(after)!} className="mfig__line" />
        {/* The forced sale: a vertical drop. */}
        <line
          x1={cx}
          x2={cx}
          y1={y(maxLtv)}
          y2={y(targetLtv)}
          className="mfig__drop"
        />
        <circle cx={cx} cy={y(maxLtv)} r={5} className="mfig__call" />
        <circle cx={cx} cy={y(targetLtv)} r={3.5} className="mfig__dot" />

        {!narrow && (
          <>
            <text x={x(0.4)} y={y(0.3)} className="mfig__note">
              <tspan x={x(0.4)}>Calm years: interest capitalizes,</tspan>
              <tspan x={x(0.4)} dy="1.3em">
                so the loan outgrows what you draw
              </tspan>
            </text>
            <text
              x={cx - 10}
              y={y(0.69)}
              className="mfig__note"
              textAnchor="end"
            >
              <tspan x={cx - 10}>A crash: the portfolio falls,</tspan>
              <tspan x={cx - 10} dy="1.3em">
                the loan doesn’t
              </tspan>
            </text>
            <text x={x(10.2)} y={y(0.22)} className="mfig__note">
              <tspan x={x(10.2)}>Recovery: growth outpaces</tspan>
              <tspan x={x(10.2)} dy="1.3em">
                interest again
              </tspan>
            </text>
          </>
        )}
      </svg>
      <figcaption className="mfig__cap">
        <b>The ratchet.</b> An illustration, not a forecast.{" "}
        {narrow &&
          "In calm years capitalized interest pushes the loan up; a crash shoves it through the call line; the recovery pulls it back. "}
        A forced sale happens at the worst moment, after prices have fallen, and
        every share sold pays capital-gains tax first, so more must be sold to
        get back to {pct(targetLtv)}.
      </figcaption>
    </figure>
  );
}

/* ---------------------------------------------------------------- Block bootstrap */

const FIRST_YEAR = 1993;
const LAST_YEAR = 2026;
/** Blocks of history reused in the illustrated future: [start year, length in years]. */
const PICKS: { from: number; len: number; tone: "a" | "b" | "c" | "d" }[] = [
  { from: 2013, len: 2, tone: "a" },
  { from: 2008, len: 2, tone: "b" },
  { from: 1999, len: 3, tone: "c" },
  { from: 2020, len: 1, tone: "d" },
  { from: 2008, len: 2, tone: "b" },
  { from: 2016, len: 3, tone: "a" },
];

export function BlockBootstrap({ blockMonths }: { blockMonths: number }) {
  const narrow = useNarrow();
  const W = narrow ? 360 : 640;
  const H = narrow ? 290 : 268;
  const m = { l: narrow ? 6 : 18, r: narrow ? 6 : 18 };
  const years = LAST_YEAR - FIRST_YEAR + 1;
  const cw = (W - m.l - m.r) / years;
  const hy = narrow ? 72 : 52;
  const fy = narrow ? 212 : 190;
  const ch = 30;
  const xYear = (yr: number) => m.l + (yr - FIRST_YEAR) * cw;
  const futureYears = PICKS.reduce((a, p) => a + p.len, 0);
  const fw = (W - m.l - m.r) / Math.max(futureYears, 1);
  let cursor = 0;
  const placed = PICKS.map((p) => {
    const x0 = m.l + cursor * fw;
    cursor += p.len;
    return { ...p, x0, w: p.len * fw };
  });
  const used = new Set(
    PICKS.flatMap((p) => Array.from({ length: p.len }, (_, i) => p.from + i)),
  );
  const label = `Illustration of a block bootstrap: history from ${FIRST_YEAR} to ${LAST_YEAR} is cut into runs of consecutive months, about ${blockMonths} months long on average, and a future is stitched together from randomly chosen runs such as ${PICKS.slice(
    0,
    3,
  )
    .map((p) => `${p.from}–${p.from + p.len - 1}`)
    .join(
      ", ",
    )}. Each run carries the same months for every asset and for inflation.`;

  return (
    <figure className="mfig">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mfig__svg"
        role="img"
        aria-label={label}
      >
        <text x={m.l} y={hy - 14} className="mfig__eyebrow">
          History · one cell per year
        </text>
        {(["Stocks", "Bonds", "Inflation"] as const).map((k, i) => (
          <g
            key={k}
            transform={
              narrow
                ? `translate(${m.l + i * 84},${hy - 58})`
                : `translate(${W - m.r - 214 + i * 74},${hy - 22})`
            }
          >
            <rect
              width={14}
              height={6}
              y={1}
              rx={2}
              className={`mbb__s${i + 1}`}
            />
            <text x={20} y={7} className="mfig__note" style={{ fontSize: 11 }}>
              {k}
            </text>
          </g>
        ))}
        {Array.from({ length: years }, (_, i) => {
          const yr = FIRST_YEAR + i;
          const on = used.has(yr);
          return (
            <g
              key={yr}
              className={on ? "mbb__cell is-on" : "mbb__cell"}
              transform={`translate(${xYear(yr) + 1},${hy})`}
            >
              <rect
                width={cw - 2}
                height={ch / 3 - 1}
                y={0}
                rx={1.5}
                className="mbb__s1"
              />
              <rect
                width={cw - 2}
                height={ch / 3 - 1}
                y={ch / 3}
                rx={1.5}
                className="mbb__s2"
              />
              <rect
                width={cw - 2}
                height={ch / 3 - 1}
                y={(2 * ch) / 3}
                rx={1.5}
                className="mbb__s3"
              />
            </g>
          );
        })}
        {/* Outline each source run in its future block's color (a run can be drawn twice). */}
        {[...new Map(PICKS.map((p) => [`${p.from}-${p.len}`, p])).values()].map(
          (p) => (
            <rect
              key={`${p.from}-${p.len}`}
              x={xYear(p.from) - 1}
              y={hy - 3}
              width={p.len * cw}
              height={ch + 4}
              rx={4}
              className={`mbb__block mbb__block--${p.tone}`}
              fill="none"
              style={{ fill: "none" }}
            />
          ),
        )}
        {(narrow ? [1993, 2008, 2026] : [1993, 2000, 2008, 2020, 2026]).map(
          (yr) => (
            <text
              key={yr}
              x={xYear(yr) + cw / 2}
              y={hy + ch + 16}
              className="mfig__tick"
              textAnchor="middle"
            >
              {yr}
            </text>
          ),
        )}

        {placed.map((p, i) => {
          const sx = xYear(p.from) + (p.len * cw) / 2;
          const dx = p.x0 + p.w / 2;
          const y0 = hy + ch + 24;
          const y1 = fy - 6;
          return (
            <path
              key={i}
              d={`M${sx},${y0} C${sx},${(y0 + y1) / 2} ${dx},${(y0 + y1) / 2} ${dx},${y1}`}
              className={`mbb__link mbb__link--${p.tone}`}
            />
          );
        })}

        {placed.map((p, i) => (
          <g key={i} transform={`translate(${p.x0 + 1.5},${fy})`}>
            <rect
              width={p.w - 3}
              height={ch}
              rx={5}
              className={`mbb__block mbb__block--${p.tone}`}
            />
            {[0, 1, 2].map((k) => (
              <rect
                key={k}
                x={5}
                y={5 + k * 7}
                width={p.w - 13}
                height={4}
                rx={2}
                className={`mbb__s${k + 1} mbb__strip`}
              />
            ))}
            <text
              x={(p.w - 3) / 2}
              y={ch + 16}
              className="mfig__tick"
              textAnchor="middle"
            >
              ’{String(p.from).slice(2)}
              {p.len > 1 && !(narrow && p.w < 56)
                ? `–’${String(p.from + p.len - 1).slice(2)}`
                : ""}
            </text>
          </g>
        ))}
        <text x={m.l} y={H - 4} className="mfig__eyebrow">
          One simulated future · {futureYears} years
        </text>
      </svg>
      <figcaption className="mfig__cap">
        <b>Stitching whole months.</b> Runs of real history, {blockMonths}{" "}
        months long on average (the length varies at random), are drawn with
        replacement and laid end to end. A run from 2008 brings 2008’s stocks,
        bonds <em>and</em> inflation with it, so crashes stay crashes and the
        way your holdings move together survives.
      </figcaption>
    </figure>
  );
}

/* ---------------------------------------------------------------- Shrinkage curves */

const CURVES: {
  cls: AssetClass;
  o: Outlook;
  label: string;
  tone: string;
  dash?: boolean;
}[] = [
  {
    cls: "etf-equity",
    o: "balanced",
    label: "Stock fund · balanced",
    tone: "var(--cat-1)",
  },
  {
    cls: "stock",
    o: "balanced",
    label: "Single stock · balanced",
    tone: "var(--cat-3)",
  },
  {
    cls: "etf-equity",
    o: "conservative",
    label: "Stock fund · conservative",
    tone: "var(--cat-1)",
    dash: true,
  },
  {
    cls: "stock",
    o: "conservative",
    label: "Single stock · conservative",
    tone: "var(--cat-3)",
    dash: true,
  },
];

export function ShrinkCurves({ dataYears }: { dataYears: number }) {
  const narrow = useNarrow();
  const W = narrow ? 360 : 640;
  const H = narrow ? 300 : 260;
  const m = narrow
    ? { l: 40, r: 12, t: 18, b: 96 }
    : { l: 46, r: 172, t: 18, b: 36 };
  const maxY = 40;
  const x = scaleLinear()
    .domain([0, maxY])
    .range([m.l, W - m.r]);
  const y = scaleLinear()
    .domain([0, 0.6])
    .range([H - m.b, m.t]);
  const path = line<[number, number]>()
    .x((d) => x(d[0]))
    .y((d) => y(d[1]));
  const series = CURVES.map((c) => ({
    ...c,
    pts: weightCurve(c.cls, c.o, maxY),
  }));
  // Label positions: end of each curve, nudged apart.
  const ends = series
    .map((s) => ({ s, yv: y(s.pts[s.pts.length - 1][1]) }))
    .sort((a, b) => a.yv - b.yv);
  for (let i = 1; i < ends.length; i++)
    if (ends[i].yv - ends[i - 1].yv < 15) ends[i].yv = ends[i - 1].yv + 15;
  const label = `Weight on an asset's own history versus years of history. ${series
    .map(
      (s) => `${s.label}: ${pct(s.pts[s.pts.length - 1][1])} at ${maxY} years`,
    )
    .join("; ")}. The rest of the weight goes to the long-run prior.`;

  return (
    <figure className="mfig">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mfig__svg"
        role="img"
        aria-label={label}
      >
        {[0, 0.2, 0.4, 0.6].map((v) => (
          <g key={v}>
            <line
              x1={m.l}
              x2={W - m.r}
              y1={y(v)}
              y2={y(v)}
              className="mfig__grid"
            />
            <text
              x={m.l - 8}
              y={y(v)}
              className="mfig__tick"
              textAnchor="end"
              dominantBaseline="middle"
            >
              {Math.round(v * 100)}%
            </text>
          </g>
        ))}
        {[0, 10, 20, 30, 40].map((v) => (
          <text
            key={v}
            x={x(v)}
            y={H - m.b + 20}
            className="mfig__tick"
            textAnchor="middle"
          >
            {v === 0 ? "0 yrs" : v}
          </text>
        ))}
        <line
          x1={x(dataYears)}
          x2={x(dataYears)}
          y1={m.t}
          y2={H - m.b}
          className="mfig__target"
        />
        <text
          x={x(dataYears) - 6}
          y={m.t + 10}
          className="mfig__note mfig__note--faint"
          textAnchor="end"
        >
          longest history in the data
        </text>
        {series.map((s) => (
          <path
            key={s.label}
            d={path(s.pts)!}
            fill="none"
            stroke={s.tone}
            strokeWidth={2}
            strokeDasharray={s.dash ? "5 4" : undefined}
            strokeLinecap="round"
          />
        ))}
        {narrow
          ? series.map((s, i) => (
              <g
                key={s.label}
                transform={`translate(${m.l + (i % 2) * 160},${H - m.b + 44 + Math.floor(i / 2) * 22})`}
              >
                <line
                  x1={0}
                  x2={16}
                  y1={0}
                  y2={0}
                  stroke={s.tone}
                  strokeWidth={2}
                  strokeDasharray={s.dash ? "4 3" : undefined}
                />
                <text
                  x={22}
                  y={0}
                  className="mfig__note"
                  dominantBaseline="middle"
                  style={{ fontSize: 11 }}
                >
                  {s.label}
                </text>
              </g>
            ))
          : ends.map(({ s, yv }) => (
              <g key={s.label}>
                <line
                  x1={W - m.r + 6}
                  x2={W - m.r + 20}
                  y1={yv}
                  y2={yv}
                  stroke={s.tone}
                  strokeWidth={2}
                  strokeDasharray={s.dash ? "4 3" : undefined}
                />
                <text
                  x={W - m.r + 26}
                  y={yv}
                  className="mfig__note"
                  dominantBaseline="middle"
                >
                  {s.label}
                </text>
              </g>
            ))}
      </svg>
      <figcaption className="mfig__cap">
        <b>How much history is trusted.</b> The weight on an asset’s own average
        return rises with years of data, then hits a ceiling; the rest goes to
        the long-run prior. Computed from the model’s own settings.
      </figcaption>
    </figure>
  );
}
