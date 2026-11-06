import { motion } from 'framer-motion'
import { CITY_BY_ID, FX_FALLBACK } from '../../data/cities'
import { BUDGET_CATEGORIES, budgetTotal } from '../../engine/cost'
import type { Budget, BudgetCategory, SimulationResult, SolveResult } from '../../engine/types'
import { useStore } from '../../state/store'
import { currency, currencyCompact, localCurrency, percent } from '../format'
import { ease } from '../motion'
import { AnimatedNumber, Button, Skeleton, cx, toast } from '../primitives'

export const cityName = (id: string | null | undefined) => (id ? (CITY_BY_ID[id]?.name ?? id) : '')

const CATEGORY_LABEL: Record<BudgetCategory, string> = {
  housing: 'Housing',
  groceries: 'Groceries',
  dining: 'Dining out',
  transport: 'Transport',
  utilities: 'Utilities',
  healthcare: 'Healthcare',
  travel: 'Travel',
  other: 'Other',
}

/* ---------------------------------------------------------------- Safe spending */

export function safeSpendCaption(r: SimulationResult, s: SolveResult): string {
  const cur = r.spendHome
  const diff = s.maxSpendHome - cur
  if (s.maxSpendHome <= 0) return 'No level of spending reaches 90% confidence with these terms; the loan cost alone sinks too many futures.'
  if (Math.abs(diff) < cur * 0.02) return 'Your budget sits right at the 90% line: this is about as much as the plan can carry.'
  if (diff > 0)
    return `You have ${currencyCompact(diff)} a year of headroom: spend up to ${percent(diff / cur)} more and 9 in 10 futures still hold.`
  return `To reach 90% confidence, trim ${currencyCompact(-diff)} a year (${percent(-diff / cur)}) from your lifestyle.`
}

export function scaleBudget(b: Budget, factor: number): Budget {
  const out = { ...b }
  for (const c of BUDGET_CATEGORIES) out[c] = Math.max(0, Math.round((b[c] * factor) / 100) * 100)
  return out
}

export function SafeSpendBody({ result, solve, solving }: { result: SimulationResult; solve: SolveResult | null; solving: boolean }) {
  const budget = useStore((s) => s.inputs.budget)
  const setInput = useStore((s) => s.setInput)
  const home = cityName(result.inputs.homeCityId)
  const dest = result.inputs.destCityId ? cityName(result.inputs.destCityId) : null

  if (!solve) {
    return (
      <div className="safe" aria-busy="true">
        <Skeleton width="70%" height={56} radius={12} />
        <Skeleton width="45%" height={14} />
        <Skeleton height={10} radius={99} style={{ marginTop: 24 }} />
        <Skeleton width={160} height={40} radius={12} style={{ marginTop: 20 }} />
      </div>
    )
  }

  const cur = budgetTotal(budget)
  const max = solve.maxSpendHome
  const scaleMax = Math.max(max, cur) * 1.18 || 1
  const pctMax = (max / scaleMax) * 100
  const pctCur = (cur / scaleMax) * 100
  const headroom = max >= cur
  const same = Math.abs(max - cur) < cur * 0.01

  const apply = () => {
    if (cur <= 0) return
    setInput('budget', scaleBudget(budget, max / cur))
    toast(`Budget set to ${currencyCompact(max)} a year`, { tone: 'holds', detail: 'Each category scaled by the same factor.' })
  }

  return (
    <div className={cx('safe', solving && 'is-stale')}>
      <p className="safe__lead">
        At <b>90%</b> confidence you can spend up to
      </p>
      <div className={cx('safe__figure', !headroom && !same && 'is-short')}>
        <AnimatedNumber value={max} format="currency" className="safe__num" />
        <span className="safe__unit">/yr</span>
      </div>
      <p className="safe__sub">
        in {home} dollars
        {dest && solve.maxSpendDest != null && (
          <>
            {' '}
            · <AnimatedNumber value={solve.maxSpendDest} format="currency-compact" className="num" /> once in {dest}
          </>
        )}
      </p>

      <div className="gauge" role="img" aria-label={`Safe maximum ${currency(max)} a year versus your current budget of ${currency(cur)}.`}>
        <div className="gauge__track">
          <motion.div
            className={cx('gauge__fill', headroom ? 'is-holds' : 'is-bruised')}
            initial={false}
            animate={{ width: `${pctMax}%` }}
            transition={{ duration: 0.7, ease }}
          />
          <motion.div className="gauge__mark" initial={false} animate={{ left: `${pctCur}%` }} transition={{ duration: 0.7, ease }} />
        </div>
        <div className="gauge__labels">
          <motion.span className={cx('gauge__cur', pctCur > 72 && 'is-end', pctCur < 22 && 'is-start')} initial={false} animate={{ left: `${pctCur}%` }} transition={{ duration: 0.7, ease }}>
            Your budget <b className="num">{currencyCompact(cur)}</b>
          </motion.span>
        </div>
      </div>

      <div className="safe__actions">
        <Button variant={same ? 'secondary' : 'primary'} size="sm" onClick={apply} disabled={same || solving || max <= 0}>
          Use this budget
        </Button>
        <span className="t-small ink-3">Scales every category by {same ? '0%' : percent(max / cur - 1, { signed: true })}.</span>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- Estate */

export function estateCaption(r: SimulationResult): string {
  const { bbdMedian, sellMedian, bbdWins } = r.estate
  const d = bbdMedian - sellMedian
  if (d >= 0)
    return `Borrowing leaves heirs ${currencyCompact(d)} more in the median future, and comes out ahead in ${percent(bbdWins)} of all futures.`
  return `Selling as you go leaves ${currencyCompact(-d)} more in the median future here: the loan interest outruns the tax it avoids.`
}

export function EstateBody({ result }: { result: SimulationResult }) {
  const { bbdMedian, sellMedian, bbdWins, sellTaxMedian } = result.estate
  const top = Math.max(bbdMedian, sellMedian, 1)
  const endAge = result.inputs.age + result.inputs.horizonYears
  return (
    <div className="estate">
      <div className="estate__pair">
        <div className="estate__col">
          <div className="t-eyebrow">Borrow, never sell</div>
          <AnimatedNumber value={bbdMedian} format="currency-compact" className="estate__num estate__num--bbd" />
          <div className="estate__bar">
            <motion.i className="is-bbd" initial={false} animate={{ width: `${(Math.max(0, bbdMedian) / top) * 100}%` }} transition={{ duration: 0.8, ease }} />
          </div>
        </div>
        <div className="estate__col">
          <div className="t-eyebrow">Sell as you go</div>
          <AnimatedNumber value={sellMedian} format="currency-compact" className="estate__num" />
          <div className="estate__bar">
            <motion.i className="is-sell" initial={false} animate={{ width: `${(Math.max(0, sellMedian) / top) * 100}%` }} transition={{ duration: 0.8, ease }} />
          </div>
        </div>
      </div>
      <dl className="estate__facts">
        <div>
          <dt>Borrowing wins in</dt>
          <dd>
            <AnimatedNumber value={bbdWins} format="percent" /> <span>of futures</span>
          </dd>
        </div>
        <div>
          <dt>Tax the seller pays</dt>
          <dd>
            <AnimatedNumber value={sellTaxMedian} format="currency-compact" /> <span>median, capital gains</span>
          </dd>
        </div>
      </dl>
      <p className="estate__note">
        Median estate at {endAge}, today’s dollars. At death your heirs inherit at a <em>stepped-up basis</em>: the gains you borrowed
        against are never taxed, and the loan is repaid from the estate.
      </p>
    </div>
  )
}

/* ---------------------------------------------------------------- Portfolio lens */

export function lensCaption(r: SimulationResult): string {
  const hs = r.inputs.holdings
  const c = r.correlation
  if (hs.length < 2) return `A single holding: ${percent(r.stats.volatility)} volatility with nothing to offset it.`
  let best = { i: 0, j: 1, v: -2 }
  for (let i = 0; i < hs.length; i++) for (let j = i + 1; j < hs.length; j++) if (c[i][j] > best.v) best = { i, j, v: c[i][j] }
  let div = { i: 0, v: 2 }
  for (let i = 0; i < hs.length; i++) {
    const avg = c[i].reduce((a, v, j) => (j === i ? a : a + v), 0) / (hs.length - 1)
    if (avg < div.v) div = { i, v: avg }
  }
  const pair = `${hs[best.i].symbol} and ${hs[best.j].symbol} move almost as one (${best.v.toFixed(2)})`
  if (div.v < 0.5) return `${pair}; ${hs[div.i].symbol} is the real diversifier, averaging ${div.v.toFixed(2)} against the rest.`
  return `${pair}, and nothing here averages below ${div.v.toFixed(2)}: the holdings tend to fall together.`
}

function corrColor(v: number): string {
  const a = Math.round(Math.min(1, Math.abs(v)) * 78)
  return v >= 0 ? `color-mix(in oklab, var(--holds) ${a}%, transparent)` : `color-mix(in oklab, var(--bruised) ${a}%, transparent)`
}

export function LensBody({ result }: { result: SimulationResult }) {
  const hs = result.inputs.holdings
  const c = result.correlation
  const n = hs.length
  const desc = hs
    .flatMap((h, i) => hs.slice(i + 1).map((g, j) => `${h.symbol}–${g.symbol} ${c[i][i + 1 + j].toFixed(2)}`))
    .slice(0, 20)
    .join(', ')
  return (
    <div className="lens">
      <div className="lens__stats">
        <div>
          <div className="t-eyebrow">Exp. return</div>
          <AnimatedNumber value={result.stats.expReturn} format="percent1" className="lens__num" />
        </div>
        <div>
          <div className="t-eyebrow">Volatility</div>
          <AnimatedNumber value={result.stats.volatility} format="percent1" className="lens__num" />
        </div>
        <div>
          <div className="t-eyebrow">Median CAGR</div>
          <AnimatedNumber value={result.stats.cagrMedian} format="percent1" className="lens__num" />
        </div>
      </div>
      {n > 1 && (
        <figure className="heat" style={{ ['--n' as string]: n }} role="img" aria-label={`Correlation of monthly returns: ${desc}.`}>
          <div className="heat__grid" aria-hidden="true">
            <span />
            {hs.map((h) => (
              <span key={h.symbol} className="heat__col">
                {h.symbol}
              </span>
            ))}
            {hs.map((h, i) => (
              <div key={h.symbol} className="heat__row">
                <span className="heat__rowlabel">{h.symbol}</span>
                {hs.map((g, j) => {
                  const v = c[i]?.[j] ?? 0
                  return (
                    <span
                      key={g.symbol}
                      className={cx('heat__cell', i === j && 'is-diag', Math.abs(v) > 0.55 && i !== j && 'is-strong')}
                      style={{ background: i === j ? undefined : corrColor(v) }}
                      title={`${h.symbol} / ${g.symbol}: ${v.toFixed(2)}`}
                    >
                      {i === j ? '' : v.toFixed(2).replace('-', '−').replace(/^(−?)0\./, '$1.')}
                    </span>
                  )
                })}
              </div>
            ))}
          </div>
          <figcaption className="heat__legend">
            <span>−1</span>
            <i />
            <span>+1</span>
            <span className="heat__legend-note">correlation of monthly returns</span>
          </figcaption>
        </figure>
      )}
    </div>
  )
}

/* ---------------------------------------------------------------- Cost of living */

export function costRows(r: SimulationResult, budget: Budget) {
  const ratios = r.categoryRatios
  if (!ratios) return []
  return BUDGET_CATEGORIES.map((c) => ({ c, label: CATEGORY_LABEL[c], home: budget[c] || 0, dest: (budget[c] || 0) * ratios[c], ratio: ratios[c] }))
}

export function costCaption(r: SimulationResult, budget: Budget): string {
  const rows = costRows(r, budget)
  const dest = cityName(r.inputs.destCityId)
  const home = rows.reduce((a, x) => a + x.home, 0)
  const d = rows.reduce((a, x) => a + x.dest, 0)
  const ch = d / home - 1
  const sorted = [...rows].sort((a, b) => a.dest - a.home - (b.dest - b.home))
  if (ch < -0.01) {
    const [a, b] = sorted
    return `${dest} cuts your annual spend by ${percent(-ch)}; ${a.label.toLowerCase()} and ${b.label.toLowerCase()} save the most.`
  }
  if (ch > 0.01) {
    const a = sorted[sorted.length - 1]
    return `${dest} costs ${percent(ch)} more than home for the same life, mostly ${a.label.toLowerCase()}.`
  }
  return `${dest} costs about the same as home for the same life.`
}

export function CostBody({ result }: { result: SimulationResult }) {
  const budget = result.inputs.budget
  const rows = costRows(result, budget)
  const destCity = result.inputs.destCityId ? CITY_BY_ID[result.inputs.destCityId] : null
  if (!destCity || rows.length === 0) return null
  const homeTotal = rows.reduce((a, x) => a + x.home, 0)
  const destTotal = rows.reduce((a, x) => a + x.dest, 0)
  const fx = FX_FALLBACK[destCity.currency]
  const top = Math.max(...rows.map((x) => Math.max(x.home, x.dest)), 1)
  const home = cityName(result.inputs.homeCityId)

  return (
    <div className="col">
      <div className="col__totals">
        <div>
          <div className="t-eyebrow">{home}</div>
          <AnimatedNumber value={homeTotal} format="currency" className="col__num col__num--home" />
          <div className="t-small ink-3">a year</div>
        </div>
        <div className="col__arrow" aria-hidden="true">
          →
        </div>
        <div>
          <div className="t-eyebrow">{destCity.name}</div>
          <AnimatedNumber value={destTotal} format="currency" className="col__num" />
          <div className="t-small ink-3">
            {fx && destCity.currency !== 'USD' ? (
              <>
                ≈ <span className="num">{localCurrency(destTotal * fx, destCity.currency)}</span> a year
              </>
            ) : (
              'a year'
            )}
          </div>
        </div>
      </div>

      <p className="col__save">
        {destTotal <= homeTotal ? (
          <>
            <b className="num">{currency(homeTotal - destTotal)}</b> less to borrow every year, before inflation and currency swings.
          </>
        ) : (
          <>
            <b className="num">{currency(destTotal - homeTotal)}</b> more to borrow every year for the same life.
          </>
        )}
      </p>

      <div className="col__rows" role="img" aria-label={rows.map((x) => `${x.label}: ${currency(x.home)} at home, ${currency(x.dest)} in ${destCity.name}`).join('; ')}>
        <div className="col__legend" aria-hidden="true">
          <span>
            <i className="col__key col__key--home" /> {home}
          </span>
          <span>
            <i className="col__key col__key--dest" /> {destCity.name}
          </span>
        </div>
        {rows.map((x) => {
          const d = x.ratio - 1
          return (
            <div key={x.c} className="col__row" aria-hidden="true">
              <span className="col__label">{x.label}</span>
              <span className="col__bars">
                <motion.i className="col__bar col__bar--home" initial={false} animate={{ width: `${(x.home / top) * 100}%` }} transition={{ duration: 0.7, ease }} />
                <motion.i className="col__bar col__bar--dest" initial={false} animate={{ width: `${(x.dest / top) * 100}%` }} transition={{ duration: 0.7, ease }} />
              </span>
              <span className="col__vals num">
                {currencyCompact(x.dest)}
                <span className={cx('col__delta', d < -0.005 && 'is-down', d > 0.005 && 'is-up')}>{Math.abs(d) < 0.005 ? '±0%' : percent(d, { signed: true })}</span>
              </span>
            </div>
          )
        })}
      </div>
      <p className="t-small ink-3 col__note">
        First-year spend after the move, today’s dollars, with your expat factor applied. Local currency at an approximate rate of{' '}
        {fx ? `${fx.toLocaleString('en-US')} ${destCity.currency}` : '—'} per dollar.
      </p>
    </div>
  )
}
