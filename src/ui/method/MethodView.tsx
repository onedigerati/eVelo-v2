import { m as motion } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";
import { navigate } from "../../state/router";
import { currency, number, percent } from "../format";
import { rise, stagger } from "../motion";
import { Button, cx } from "../primitives";
import { BlockBootstrap, LtvRatchet, ShrinkCurves } from "./diagrams";
import {
  ABROAD,
  DATA,
  DEF,
  PRIOR,
  SHRINK_CLASSES,
  SHRINK_TABLE,
} from "./params";
import "../views.css";
import "./method.css";

const pct = (x: number, digits = 0) => percent(x, { digits });
const pct1 = (x: number) =>
  percent(x, { digits: Number.isInteger(Math.round(x * 1000) / 10) ? 0 : 1 });

const SECTIONS = [
  { id: "bbd", title: "Buy, borrow, die" },
  { id: "holds", title: "What “holds” means" },
  { id: "data", title: "Where the numbers come from" },
  { id: "futures", title: "How futures are made" },
  { id: "taming", title: "Taming lucky histories" },
  { id: "borrowing", title: "Borrowing mechanics" },
  { id: "abroad", title: "Living abroad" },
  { id: "localtax", title: "Local wealth and inheritance tax" },
  { id: "estate", title: "Borrow vs. sell" },
  { id: "limits", title: "What it leaves out" },
] as const;

/** Section in view, for the table of contents. */
function useActiveSection(): string {
  const [active, setActive] = useState<string>(SECTIONS[0].id);
  useEffect(() => {
    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      (e): e is HTMLElement => !!e,
    );
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) setActive(vis[0].target.id);
      },
      { rootMargin: "-20% 0px -65% 0px" },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, []);
  return active;
}

function jump(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  el.focus({ preventScroll: true });
}

function Toc({ active }: { active: string }) {
  return (
    <nav className="mtoc" aria-label="On this page">
      <div className="t-eyebrow mtoc__title">Contents</div>
      <ol className="mtoc__list">
        {SECTIONS.map((s, i) => (
          <li key={s.id}>
            <a
              href={`#method`}
              className={cx("mtoc__link", active === s.id && "is-on")}
              aria-current={active === s.id ? "location" : undefined}
              onClick={(e) => {
                e.preventDefault();
                jump(s.id);
              }}
            >
              <span className="mtoc__n num">
                {String(i + 1).padStart(2, "0")}
              </span>
              {s.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

function Sec({
  id,
  children,
  lead,
}: {
  id: (typeof SECTIONS)[number]["id"];
  children: ReactNode;
  lead?: ReactNode;
}) {
  const i = SECTIONS.findIndex((s) => s.id === id);
  return (
    <section id={id} className="msec" tabIndex={-1} aria-labelledby={`${id}-h`}>
      <header className="msec__head">
        <span className="msec__n num" aria-hidden="true">
          {String(i + 1).padStart(2, "0")}
        </span>
        <h2 id={`${id}-h`} className="t-h1 msec__title">
          {SECTIONS[i].title}
        </h2>
        {lead && <p className="msec__lead">{lead}</p>}
      </header>
      <div className="prose">{children}</div>
    </section>
  );
}

function Formula({
  children,
  note,
}: {
  children: ReactNode;
  note?: ReactNode;
}) {
  return (
    <div className="mformula">
      <div className="mformula__expr num">{children}</div>
      {note && <div className="mformula__note">{note}</div>}
    </div>
  );
}

function Outcome({
  tone,
  name,
  children,
}: {
  tone: "holds" | "bruised" | "broken";
  name: string;
  children: ReactNode;
}) {
  return (
    <div className={`mout mout--${tone}`}>
      <div className="mout__head">
        <i className="mout__dot" aria-hidden="true" />
        <b>{name}</b>
      </div>
      <p>{children}</p>
    </div>
  );
}

export function MethodView() {
  const active = useActiveSection();
  const t = DEF.thresholds;

  return (
    <motion.div
      className="page page--method"
      variants={stagger(0.07)}
      initial="hidden"
      animate="show"
    >
      <motion.header className="page__header mhero" variants={rise}>
        <div className="t-eyebrow">Method</div>
        <h1 className="t-display">
          How the <em>futures</em> are made
        </h1>
        <p className="t-lede mhero__lede">
          eVelo replays real market history in thousands of different orders,
          borrows against your portfolio to fund your life, and counts how often
          the lender never has to sell. Here is every step, in plain language,
          with the numbers the model actually uses.
        </p>
        <dl className="mledger">
          <div>
            <dt>Tickers</dt>
            <dd className="num">{DATA.tickers}</dd>
          </div>
          <div>
            <dt>Months of history</dt>
            <dd className="num">{DATA.months}</dd>
          </div>
          <div>
            <dt>Futures per plan</dt>
            <dd className="num">{number(DEF.paths)}</dd>
          </div>
          <div>
            <dt>Cities</dt>
            <dd className="num">{DATA.cities}</dd>
          </div>
        </dl>
      </motion.header>

      <motion.div className="mlayout" variants={rise}>
        <aside className="mlayout__toc">
          <Toc active={active} />
        </aside>

        <article className="mlayout__body">
          <Sec
            id="bbd"
            lead="A way to live off a portfolio without selling it."
          >
            <p>
              <b>Buy</b> assets that grow and hold them. <b>Borrow</b> against
              them for living money, with a securities-backed line of credit,
              instead of selling shares and paying capital-gains tax each time.
              The loan grows with interest; the portfolio, untouched, keeps
              compounding. <b>Die</b> holding them: under US law your heirs
              inherit the shares with a <em>stepped-up cost basis</em>, their
              value on the day you die, so the gains you borrowed against are
              never taxed. The estate repays the loan and passes on the rest.
              If you have already borrowed, eVelo starts from that balance.
            </p>
            <p>
              It works when the portfolio grows faster than the loan. It fails
              in one specific way, and that is what eVelo is built to measure.
            </p>
            <blockquote className="pullquote">
              The failure mode of Buy-Borrow-Die is not a bad year. It is being
              forced to sell in one.
            </blockquote>
          </Sec>

          <Sec
            id="holds"
            lead="Every simulated future ends in one of three ways."
          >
            <div className="mouts">
              <Outcome tone="holds" name="Holds">
                The loan never reaches the lender’s margin-call line and the
                portfolio is still worth more than the loan at the end of your
                horizon. This is the headline number.
              </Outcome>
              <Outcome tone="bruised" name="Bruised">
                At least one margin call forced a sale, usually after a crash,
                but the plan got through. You survived; you also sold at a bad
                time and paid tax to do it.
              </Outcome>
              <Outcome tone="broken" name="Broken">
                The debt caught up with the assets: the loan reached the
                portfolio’s value, or a margin call could not be met even by
                selling everything.
              </Outcome>
            </div>
            <p>
              The verdict reads the share of futures that hold. At{" "}
              {pct(t.holds)} or more the plan <em>holds</em>; from{" "}
              {pct(t.mostly)} it <em>mostly holds</em>; from {pct(t.fragile)} it
              is <em>fragile</em>; below that it <em>breaks in most futures</em>
              . The same scale colors every city on the Atlas, and every color
              comes with its number and label.
            </p>
          </Sec>

          <Sec id="data" lead="Real monthly history, bundled with the app.">
            <p>
              Each of the {DATA.tickers} tickers comes from Yahoo Finance as
              monthly <em>adjusted</em> closes, which fold in dividends and
              splits, so a month’s change is its total return. The common
              calendar runs from {DATA.start} (the first full month of SPY, the
              S&amp;P 500 fund) to {DATA.end}: {DATA.months} months that include
              the dot-com bust, 2008, the 2020 crash and the 2022 bond rout. US
              inflation is the monthly change in the consumer price index
              (CPI-U, series CPIAUCSL) from the St. Louis Fed’s FRED.
            </p>
            <p>
              Market data as of <b>{DATA.marketAsOf}</b>. Exchange rates as of{" "}
              <b>{DATA.fxAsOf}</b> (open.er-api.com), refreshed live in your
              browser when the service is reachable. City cost indices for verified cities were checked against
              Numbeo in <b>{DATA.colAsOf}</b>; the rest are rough estimates. A
              scheduled job refreshes the market data
              weekly.
            </p>
            <p>
              Money is simulated in nominal dollars, the way a lender sees it:
              returns, interest and spending all inflate along each future’s own
              inflation path. Charts then deflate back to{" "}
              <em>today’s dollars</em> using that same path, and the portfolio
              card shows returns <em>after inflation</em> first, with the
              nominal figure beside it.
            </p>
          </Sec>

          <Sec
            id="futures"
            lead="Not one forecast: thousands of plausible orderings of the past."
          >
            <p>
              The default model is a <b>block bootstrap</b>. It cuts history
              into runs of consecutive months and stitches a new future from
              runs drawn at random, with replacement. Runs average{" "}
              {DEF.blockMonths} months, and their length varies at random (a
              “stationary” bootstrap), so no seam falls on a fixed rhythm.
            </p>
            <BlockBootstrap blockMonths={DEF.blockMonths} />
            <p>
              The key is that a whole month is drawn at once. When the future
              borrows October 2008, every holding gets its October 2008 return
              and inflation gets October 2008’s CPI. Crashes stay as deep as
              they were, recoveries as long, and the way your holdings fall
              together (or don’t) is preserved without estimating a single
              correlation. The portfolio is rebalanced to your weights every
              month, and a {pct1(DEF.dividendDrag)} a year drag stands in for
              tax on dividends.
            </p>
            <p>
              The alternative, <b>fat tails</b>, draws each month’s portfolio
              return from a Student-t distribution with {DEF.tDf} degrees of
              freedom, matched to the history’s average and covariance. It
              produces crashes that are not in the record (a t with {DEF.tDf}{" "}
              degrees of freedom has far more extreme months than a bell curve),
              at the cost of losing the real sequence of booms and busts.
              Inflation is then bootstrapped separately.
            </p>
            <p>
              Your plan runs on {number(DEF.paths)} futures. Every city in the
              Atlas runs on those same futures, so differences between cities
              are about the cities, not luck, and a city’s odds in the Atlas
              match the Outlook with that city as your destination; the
              safe-spending search uses {number(DEF.solvePaths)} and finds the
              largest budget that still holds in {pct(DEF.solveTarget)} of them.
            </p>
          </Sec>

          <Sec
            id="taming"
            lead="Short, lucky histories shouldn’t be projected forever."
          >
            <p>
              {DATA.tickers - DATA.backfilled} of the {DATA.tickers} tickers,
              SPY among them, cover the whole calendar; the other{" "}
              {DATA.backfilled} start later, the youngest being{" "}
              {DATA.youngest.join(", ")}. For the months before a ticker
              existed, eVelo <b>backfills</b> it from the market: it fits the
              ticker’s returns to SPY’s by regression (a baseline plus a
              sensitivity, its <em>beta</em>), then fills each missing month
              with that fit applied to SPY’s real return plus a leftover wiggle
              drawn from the ticker’s own history. Young holdings that move
              together draw their wiggles from the same months, so they stay
              related in the backfilled years.
            </p>
            <p>
              Then the average return is <b>shrunk toward a long-run prior</b>.{" "}
              {DATA.nvdaYears} years of NVIDIA’s returns are real, but
              projecting its average forward assumes you picked the winner in
              advance. Each asset’s monthly average is blended:
            </p>
            <Formula note="n = years of real history; k and the ceiling depend on the outlook and asset class.">
              weight on history = min(ceiling, n ÷ (n + k))
            </Formula>
            <p>
              The rest of the weight goes to the prior: a {pct1(PRIOR.rf)}{" "}
              risk-free rate plus, for stocks and stock funds, beta times an
              equity premium of {pct1(PRIOR.erp.balanced)} (balanced) or{" "}
              {pct1(PRIOR.erp.conservative)} (conservative), with beta held
              between {PRIOR.betaMin} and {PRIOR.betaMax}. Bonds and gold get
              the risk-free rate plus {pct1(PRIOR.bond)}; crypto gets it plus{" "}
              {pct1(PRIOR.crypto)}. The whole series is then shifted to the
              blended average, so its volatility and its crashes are untouched.
              The “historical” outlook skips this and uses each asset’s real
              average as is.
            </p>
            <div
              className="mtable-wrap"
              tabIndex={0}
              role="region"
              aria-label="Shrinkage settings by outlook"
            >
              <table className="mtable">
                <caption>
                  Ceiling on the weight given to history, by outlook
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Outlook</th>
                    <th scope="col" className="r">
                      k
                    </th>
                    {SHRINK_CLASSES.map((c) => (
                      <th key={c.cls} scope="col" className="r">
                        {c.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SHRINK_TABLE.map((r) => (
                    <tr key={r.outlook}>
                      <th scope="row">
                        {r.outlook === "balanced" ? "Balanced" : "Conservative"}
                      </th>
                      <td className="num">{r.k} yrs</td>
                      {r.caps.map((c, i) => (
                        <td key={i} className="num">
                          {pct(c)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <ShrinkCurves dataYears={DATA.months / 12} />
          </Sec>

          <Sec
            id="borrowing"
            lead="One month at a time, the way a lender would see it."
          >
            <ol className="msteps">
              <li>
                <b>Markets move.</b> The portfolio earns that month’s return;
                prices rise by that month’s inflation.
              </li>
              <li>
                <b>Interest capitalizes.</b> The loan grows by a twelfth of its
                annual rate ({pct1(DEF.loanRate)} by default). You never pay
                interest out of pocket; it is added to the balance and
                compounds. The loan starts at any balance you have already
                drawn (zero if none), which accrues at the same rate. If that
                balance is already above the margin-call line, the lender forces
                a sale today, before the first month: it brings the loan to the
                target and pays capital-gains tax, like any forced sale below,
                and the odds are judged from there. That opening sale isn’t
                counted as a margin call. A balance the sale can’t cover after
                tax fails at once.
              </li>
              <li>
                <b>You draw what you need.</b> This month’s spending, grown with
                inflation, minus any other income (Social Security, a pension)
                is borrowed. If income exceeds spending, the surplus pays the
                loan down first.
              </li>
              <li>
                <b>The lender checks.</b> If the loan has reached the
                portfolio’s value, the future is <em>broken</em>. If the
                loan-to-value ratio is above the margin-call line (
                {pct(DEF.maxLtv)} by default), there is a forced sale.
              </li>
            </ol>
            <LtvRatchet
              maxLtv={DEF.maxLtv}
              targetLtv={DEF.targetLtv}
              loanRate={DEF.loanRate}
            />
            <p>
              A forced sale sells just enough to bring the ratio back to the
              target ({pct(DEF.targetLtv)} by default). Each dollar sold carries
              some unrealized gain, and the tax on that gain (
              {pct1(DEF.capGains)} by default, the top federal long-term rate
              including the 3.8% investment-income tax) comes out of the
              proceeds before they reach the lender:
            </p>
            <Formula note="L = loan, V = portfolio, target = LTV after the sale, g = share of each dollar that is gain (1 − basis ÷ V), τ = tax rate.">
              shares sold = (L − target × V) ÷ (1 − g × τ − target)
            </Formula>
            <p>
              If even selling everything could not reach the target, the future
              counts as broken, not bruised. The margin-call chart on the
              Outlook shows when, across all futures, the first forced sale
              tends to happen.
            </p>
            <p>
              <b>Retiring later.</b> You can retire{" "}
              {DEF.retireInYears === 0
                ? "today (the default)"
                : `in ${DEF.retireInYears} years (the default)`}{" "}
              or in up to {DEF.maxRetireInYears} whole years. Until then each
              month is a working month: nothing is drawn for spending and other
              income isn’t counted. Instead your <b>savings while working</b>{" "}
              ({currency(DEF.savingsWhileWorking)} a year by default, kept level
              with inflation) go in. They pay down any loan first and the rest
              is invested, raising the cost basis. The loan still accrues
              interest and the lender still checks every month. An opening
              forced sale still happens today, before any savings arrive. From
              retirement on, the months run as above, and other income starts
              then, or at its own start age if that is later. The plan still
              ends at the same age, so retiring later leaves fewer years of
              drawing. The safe-spending search scales retirement spending only,
              never the savings.
            </p>
          </Sec>

          <Sec id="abroad" lead="The same life, priced somewhere else.">
            <p>
              Your budget is written in your home city’s prices. For a
              destination, each category is scaled by the ratio of the two
              cities’ cost indices: housing by rent, groceries by groceries,
              dining out by restaurants, transport, utilities and everything
              else by the general cost of living. Healthcare uses a separate
              factor: estimated private or expat insurance plus typical
              out-of-pocket costs, relative to US coverage before Medicare.
              Travel stays the same anywhere.
            </p>
            <p>
              The indices price the same standard of living in both cities, but
              newcomers rarely pay exactly local prices for it, so the{" "}
              <b>expat price premium</b> claws back part of every saving. Categories
              that are dearer abroad stay dearer:
            </p>
            <Formula note="r = destination index ÷ home index, e = expat price premium (0 pays local prices, 1 pays home prices, for the same lifestyle).">
              ratio used = r + (1 − r) × e, when r is below 1
            </Formula>
            <div
              className="mtable-wrap"
              tabIndex={0}
              role="region"
              aria-label={`Example: ${ABROAD.home} to ${ABROAD.dest}`}
            >
              <table className="mtable">
                <caption>
                  {ABROAD.home} → {ABROAD.dest}, expat price premium {pct(DEF.expat)}{" "}
                  (cost as a share of home)
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Category</th>
                    <th scope="col" className="r">
                      Local prices
                    </th>
                    <th scope="col" className="r">
                      With the premium
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {ABROAD.rows.map((r) => (
                    <tr key={r.c}>
                      <th scope="row">{r.c[0].toUpperCase() + r.c.slice(1)}</th>
                      <td className="num">{pct(r.raw)}</td>
                      <td className="num">{pct(r.eff)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p>
              Then the currency. Prices abroad are set in local money, so
              destination spending is multiplied by a{" "}
              <b>real exchange-rate random walk</b>: each month it takes a small
              random step, sized so that over a year it swings by the city’s
              volatility ({ABROAD.currency} {pct1(ABROAD.fxVol)} a year for{" "}
              {ABROAD.dest}; zero for dollar economies), and centered so it
              neither drifts up nor down on average. Some futures get a strong
              dollar and a cheap life; others the opposite, for decades. The
              move can happen today or years from now, but never before you
              retire.
            </p>
            <p>
              All of this is an <em>estimate</em>. Cost indices are rounded
              approximations of public city indices, healthcare and currency
              figures are planning numbers, and every category can be
              overridden in the plan: a dollar amount for one city, or a
              percentage change that applies to every city.
            </p>
            <p>
              A typed number is read as a real price you found, not as your
              final spend, so the premium still applies on top. It is pinned
              to the premium it was typed at, and when the slider moves it
              scales the way eVelo’s own estimate for that category and city
              moves:
            </p>
            <Formula note="m(e) = r + (1 − r) × e, eVelo’s own ratio for that category and city; e₀ = the premium the value was typed at, e = the premium now.">
              value = typed × m(e) ÷ m(e₀), capped at the larger of the home
              amount (or 100%) and what was typed
            </Formula>
            <p>
              For example, {currency(ABROAD.typed.amount)} a year of housing in{" "}
              {ABROAD.dest}, typed at a {pct(ABROAD.typed.at)} premium, reads{" "}
              {currency(ABROAD.typed.value)} at {pct(ABROAD.typed.now)}: the
              model’s housing ratio rises from {pct(ABROAD.typed.mAt)} to{" "}
              {pct(ABROAD.typed.mNow)} of {ABROAD.home}’s. A typed value reads
              exactly as typed at its own premium and returns to it when the
              slider comes back. Categories the premium doesn’t touch (dearer
              than home, and travel) never move. Changing the home budget
              doesn’t move a typed amount either, unless it sits at the cap:
              then a lower home budget lowers it, never below what was typed.
            </p>
          </Sec>

          <Sec id="localtax" lead="What the destination takes from the portfolio itself.">
            <p>
              Some destinations tax the portfolio itself. When nothing is ever
              sold, these taxes cost more than tax on gains. Each destination
              carries its current-law schedule from sourced research, converted
              to today’s dollars. Spain’s cities use their own region’s rules.
            </p>
            <ul className="mlist">
              <li>
                <b>Wealth tax, every year.</b> At each year-end after the move,
                the marginal bands are applied to your real net worth (portfolio
                minus loan) or, where the law taxes the gross value (Italy’s
                IVAFE), to the portfolio. Because the bands are in today’s
                dollars, the thresholds hold steady in real terms. The borrow
                plan adds the tax to the loan, before that month’s margin check;
                the sell plan sells shares to pay it, with capital-gains tax on
                the sale.
              </li>
              <li>
                <b>Inheritance tax, at the end.</b> At the horizon both estates
                are split equally between two heirs, assumed to be US-resident
                adult children. Each share, less its allowance, runs through the
                bands, and the tax comes off the estate.
              </li>
              <li>
                <b>Who the tax reaches.</b> Where the tax falls on the heir by
                the heir’s residence (Spain, Thailand, Vietnam), US assets
                passing to US-resident children are out of scope, so nothing is
                charged. Where it falls on the estate of a resident (France,
                Greece, Italy, Ecuador, Colombia, the Philippines and others), it
                applies. Where a law exempts a foreigner’s assets abroad
                (Taiwan, Chile), it does not.
              </li>
            </ul>
            <p>
              The simplifications: Spain’s cap on income plus wealth tax (60% of
              the income-tax base) is ignored, so is every treaty credit, and
              there is no US estate tax (the 2026 exemption is $15 million, so it
              rarely applies). Thresholds are per person, as for a single owner.
              Phased-in rate cuts use the rate the law settles on. None of this
              is tax advice.
            </p>
          </Sec>

          <Sec id="estate" lead="What your heirs get, either way.">
            <p>
              Every future also runs a second, simpler plan on the same markets:{" "}
              <b>sell as you go</b>. Each month it sells enough shares to cover
              spending, paying capital-gains tax on the gain in each share sold,
              and carries no loan; while you work, it invests the same savings.
              If you have an existing loan balance, this
              plan starts with the portfolio minus that balance and no debt:
              had you sold instead, those shares would already be spent, and
              both plans start from the same net worth. (It ignores the tax and
              interest already paid, which roughly offset.) If the balance
              forces an opening sale, its tax falls on the borrow plan only,
              so borrowing starts that much behind. At the end of the
              horizon eVelo compares, in today’s dollars:
            </p>
            <ul className="mlist">
              <li>
                <b>Borrow:</b> the portfolio minus the loan. With the step-up in
                basis, no tax is due on the gains at death.
              </li>
              <li>
                <b>Sell:</b> whatever portfolio is left, having paid tax along
                the way.
              </li>
            </ul>
            <p>
              Borrowing wins when the portfolio’s return beats the loan rate:
              the tax you never paid keeps compounding. It loses when rates are
              high, returns are low, or margin calls force sales at the bottom.
              Both estates are after any local inheritance tax. The Outlook
              reports both medians and the share of futures in which borrowing
              comes out ahead.
            </p>
          </Sec>

          <Sec id="limits" lead="A planning instrument, not a promise.">
            <ul className="mlist mlist--limits">
              <li>
                <b>Not financial, tax or legal advice.</b> eVelo is a model of
                one strategy. Talk to a qualified adviser before borrowing
                against your savings.
              </li>
              <li>
                <b>Taxes are simplified.</b> There is no US estate tax: the 2026
                federal exemption is $15 million per person, and estates above
                it can owe up to 40%. No state income or estate taxes. Capital
                gains use one flat rate; dividend tax is a flat drag.
              </li>
              <li>
                <b>Rates are fixed.</b> Real securities-backed lines float with
                short-term rates; here the rate is constant for the whole
                horizon. Lenders can also change their margin-call terms.
              </li>
              <li>
                <b>Lending abroad.</b> Many US brokers restrict accounts or
                credit lines for clients who live overseas. Confirm a lender
                will serve you where you plan to live.
              </li>
              <li>
                <b>Social Security is simplified:</b> one inflation-indexed
                amount from a start age ({DEF.incomeStartAge} by default, or
                retirement if later), untaxed, with no claiming rules or spousal benefits.
              </li>
              <li>
                <b>History is the raw material.</b> {DATA.years} years is a lot
                of data and still only one history. The future can be worse than
                any stretch of the past; the fat-tail model and conservative
                outlook exist for that.
              </li>
            </ul>
            <div className="mcta">
              <p>Ready to test your own terms?</p>
              <Button variant="primary" onClick={() => navigate("plan")}>
                Open the plan
              </Button>
            </div>
          </Sec>
        </article>
      </motion.div>
    </motion.div>
  );
}
