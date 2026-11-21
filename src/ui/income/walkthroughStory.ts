// The per-plan paragraph for each walkthrough chapter (docs/PLAN.md stage 2). Pure: no DOM, no React.
//
// Every number comes from the rows (the engines' per-year medians) or the inputs. Totals over several
// years add the per-year medians, which isn't the median of the totals, so those say "about". Values
// at a year's end are labelled with the next age ("reaches $X by 67" for the year lived at 66), as the
// mockup does. The words follow the numbers: nothing sold reads "sells nothing", a plan behind reads
// "behind", and a plan with no years in the chapter says so.

import { currencyCompact as k, percent as pct } from '../format'
import type { Chapter, ChapterStoryFn, EveloYear, IncomeYear, StoryPart, WalkYear } from './walkthrough'

const sum = <T>(list: readonly T[], f: (x: T) => number) => list.reduce((s, x) => s + f(x), 0)
const yearsWord = (n: number) => (n === 1 ? '1 year' : `${n} years`)
const agesText = (rows: readonly WalkYear[]) => {
  const a = rows[0]?.age
  const b = rows[rows.length - 1]?.age
  return a === b ? `age ${a}` : `ages ${a}–${b}`
}

type Lived<T> = { row: WalkYear; y: T }
const livedIncome = (rows: readonly WalkYear[]): Lived<IncomeYear>[] =>
  rows.flatMap((row) => (row.income ? [{ row, y: row.income }] : []))
const livedEvelo = (rows: readonly WalkYear[]): Lived<EveloYear>[] =>
  rows.flatMap((row) => (row.evelo ? [{ row, y: row.evelo }] : []))

const absent = (rows: readonly WalkYear[]): StoryPart => ({
  title: 'Not in these years',
  figure: '—',
  text: `This plan’s years don’t reach ${agesText(rows)}.`,
})

/** One clause on a bad-market year a chapter kept (the plan's own fall that year). */
function dropIncome(row: WalkYear | undefined): string {
  const y = row?.income
  if (!row || !y || !(y.portfolioStart > 0)) return ''
  const f = y.portfolio / y.portfolioStart - 1
  return f < 0
    ? ` In the drop at ${row.age} the portfolio falls ${pct(-f)}.`
    : ` The portfolio holds up through the dip at ${row.age}.`
}
function dropEvelo(row: WalkYear | undefined): string {
  const y = row?.evelo
  if (!row || !y || !(y.portfolioStart > 0)) return ''
  const f = y.portfolio / y.portfolioStart - 1
  return f < 0
    ? ` In the drop at ${row.age} the portfolio falls ${pct(-f)}, taking loan-to-value to ${pct(y.ltv)}.`
    : ` The portfolio holds up through the dip at ${row.age}.`
}

/** A margin-call sentence when any forced sale shows in the medians, else ''. */
const forcedText = (forced: number) => (forced > 0 ? ` A margin call sells about ${k(forced)} of shares.` : '')

// ---------- Chapters ----------

function before(inc: Lived<IncomeYear>[], ev: Lived<EveloYear>[]) {
  let income: StoryPart | null = null
  if (inc.length) {
    const sold = sum(inc, (x) => x.y.sold)
    const first = inc[0].y
    const share =
      first.spending > 0
        ? `Dividends and interest cover about ${pct(Math.min(1, first.dividendsInterest / first.spending))} of spending in the first year. `
        : ''
    income =
      sold > 0
        ? {
            title: 'Sells to fill the gap',
            figure: `${k(sold)} sold over ${yearsWord(inc.length)}`,
            text: `${share}The rest comes from selling shares until Social Security starts.`,
          }
        : {
            title: 'Income covers it',
            figure: `${k(sum(inc, (x) => x.y.dividendsInterest))} of dividends and interest`,
            text: 'Dividends and interest pay for the spending, so no shares are sold before Social Security.',
          }
  }
  let evelo: StoryPart | null = null
  if (ev.length) {
    const borrowed = sum(ev, (x) => x.y.borrowed)
    const forced = sum(ev, (x) => x.y.forcedSaleSold)
    const last = ev[ev.length - 1]
    const by = last.row.age + 1
    evelo =
      borrowed > 0
        ? {
            title: forced > 0 ? 'Borrows, then a margin call' : 'Borrows all of it',
            figure: `${k(borrowed)} borrowed`,
            text:
              (forced > 0 ? forcedText(forced).trim() + ' ' : 'Nothing is sold. ') +
              `The spending comes from the loan, which reaches ${k(last.y.loan)} by ${by}.`,
          }
        : {
            title: 'Nothing borrowed yet',
            figure: `${k(last.y.loan)} loan by ${by}`,
            text: 'The plan doesn’t borrow in these years.' + forcedText(forced),
          }
  }
  return { income, evelo }
}

function arrives(chapter: Chapter, years: readonly WalkYear[], inc: Lived<IncomeYear>[], ev: Lived<EveloYear>[]) {
  const one = inc.length <= 1 && ev.length <= 1
  const when = one ? 'this year' : `over ${yearsWord(Math.max(inc.length, ev.length))}`
  const prev = years[chapter.from - 1]

  let income: StoryPart | null = null
  if (inc.length) {
    const sold = sum(inc, (x) => x.y.sold)
    const ss = inc[0].y.socialSecurity
    const was = prev?.income?.sold
    const ssText = ss > 0 ? `${k(ss)} of Social Security` : 'Social Security'
    if (sold <= 0) {
      income = {
        title: 'Selling stops',
        figure: `Nothing sold ${when}`,
        text: `${ssText} and the portfolio’s income cover the spending, so no shares are sold.`,
      }
    } else if (was != null && was > 0 && sold < was) {
      income = {
        title: 'Selling slows',
        figure: `${k(sold)} sold ${when}`,
        text: `${ssText} closes part of the gap: sales fall from ${k(was)} the year before.`,
      }
    } else {
      income = {
        title: 'Still selling',
        figure: `${k(sold)} sold ${when}`,
        text: `${ssText} arrives, but selling still fills the rest of the gap.`,
      }
    }
  }

  let evelo: StoryPart | null = null
  if (ev.length) {
    const borrowed = sum(ev, (x) => x.y.borrowed)
    const interest = sum(ev, (x) => x.y.interest)
    const forced = sum(ev, (x) => x.y.forcedSaleSold)
    const was = prev?.evelo?.borrowed
    const ss = ev[0].y.socialSecurity
    const ssText = ss > 0 ? `With ${k(ss)} of Social Security it borrows less.` : 'Its own Social Security hasn’t started, so it borrows as before.'
    const share =
      borrowed + interest > 0 ? ` Interest is ${pct(interest / (borrowed + interest))} of what the loan added ${when}.` : ''
    if (borrowed <= 0) {
      evelo = {
        title: 'Borrowing stops',
        figure: `Nothing borrowed ${when}`,
        text: `${ss > 0 ? 'Social Security covers the spending, so the loan only grows by its interest.' : 'Nothing is borrowed.'}${share}${forcedText(forced)}`,
      }
    } else {
      evelo = {
        title: was != null && was > 0 && borrowed < was ? 'Borrowing slows' : 'Still borrowing',
        figure: `${k(borrowed)} borrowed ${when}`,
        text: `${ssText}${share}${forcedText(forced)}`,
      }
    }
  }
  return { income, evelo }
}

function bad(inc: Lived<IncomeYear>[], ev: Lived<EveloYear>[], maxLtv: number) {
  let income: StoryPart | null = null
  if (inc.length) {
    const sold = sum(inc, (x) => x.y.sold)
    const start = inc[0].y.portfolioStart
    const end = inc[inc.length - 1].y.portfolio
    const f = start > 0 ? end / start - 1 : 0
    const move = f < 0 ? `The portfolio falls ${pct(-f)}` : `The portfolio ends these years up ${pct(f)}`
    income =
      sold > 0
        ? {
            title: 'Sells into the drop',
            figure: `${k(sold)} sold in the drop`,
            text: `${move}, and the shares it sells to cover spending go cheap.`,
          }
        : {
            title: 'Rides out the drop',
            figure: f < 0 ? `Portfolio down ${pct(-f)}` : `Portfolio up ${pct(f)}`,
            text: `${move}, but income covers spending, so nothing is sold.`,
          }
  }

  let evelo: StoryPart | null = null
  if (ev.length) {
    const peak = Math.max(...ev.map((x) => x.y.ltv))
    const forced = sum(ev, (x) => x.y.forcedSaleSold)
    const line = pct(maxLtv)
    if (forced > 0) {
      evelo = {
        title: 'A margin call',
        figure: `${k(forced)} of shares sold`,
        text: `Loan-to-value peaks at ${pct(peak)} against the ${line} margin-call line, and a margin call sells shares to pay the loan down.`,
      }
    } else if (!(peak > 0)) {
      evelo = {
        title: 'No loan to worry about',
        figure: 'No loan yet',
        text: 'Nothing is borrowed yet, so the drop can’t force a sale.',
      }
    } else if (peak >= maxLtv) {
      evelo = {
        title: 'At the line',
        figure: `Loan-to-value peaks at ${pct(peak)}`,
        text: `That reaches the ${line} margin-call line, though in the typical future no shares are sold.`,
      }
    } else {
      evelo = {
        title: 'A scare, not a call',
        figure: `Loan-to-value peaks at ${pct(peak)}`,
        text: `Nothing is sold. The loan stays ${peak >= maxLtv * 0.8 ? 'just' : 'well'} under the ${line} margin-call line.`,
      }
    }
  }
  return { income, evelo }
}

function between(inc: Lived<IncomeYear>[], ev: Lived<EveloYear>[], rows: readonly WalkYear[]) {
  let income: StoryPart | null = null
  if (inc.length) {
    const start = inc[0].y.portfolioStart
    const end = inc[inc.length - 1].y.portfolio
    const sold = sum(inc, (x) => x.y.sold)
    const reinv = sum(inc, (x) => x.y.reinvested)
    const grows = end >= start
    const title =
      reinv > 0 ? (sold > 0 ? 'Top-ups and a surplus' : 'A surplus to reinvest') : grows ? 'Steady growth' : 'Drawing down'
    const first =
      sold > 0
        ? `It sells about ${k(sold)} of shares to top up income, and the portfolio ${grows ? 'still grows' : 'shrinks'}.`
        : `It sells nothing in these years, and the portfolio ${grows ? 'grows' : 'shrinks'}.`
    const second = reinv > 0 ? ` When income beats spending, about ${k(reinv)} goes back in.` : ''
    income = { title, figure: `${k(start)} → ${k(end)}`, text: first + second }
  }

  let evelo: StoryPart | null = null
  if (ev.length) {
    const last = ev[ev.length - 1]
    const forced = sum(ev, (x) => x.y.forcedSaleSold)
    const by = last.row.age + 1
    const both = rows.filter((r) => r.income && r.evelo)
    const tail = `The portfolio ends at ${k(last.y.portfolio)} and the loan at ${k(last.y.loan)}.${forcedText(forced)}`
    if (both.length) {
      const a = both[0]
      const b = both[both.length - 1]
      const gap0 = a.evelo!.netWorthStart - a.income!.netWorthStart
      const gap = b.evelo!.netWorth - b.income!.netWorth
      const title =
        gap > 0
          ? gap > gap0
            ? gap0 > 0
              ? 'The gap widens'
              : 'Pulls ahead'
            : 'Ahead, by less'
          : gap < 0
            ? gap < gap0
              ? gap0 < 0
                ? 'Falls further behind'
                : 'Falls behind'
              : 'Behind, but catching up'
            : 'Level'
      const figure =
        gap > 0 ? `${k(gap)} ahead by ${b.age + 1}` : gap < 0 ? `${k(-gap)} behind by ${b.age + 1}` : `Level at ${b.age + 1}`
      evelo = { title, figure, text: tail }
    } else {
      evelo = { title: 'On its own', figure: `${k(last.y.netWorth)} net worth by ${by}`, text: tail }
    }
  }
  return { income, evelo }
}

function estate(inc: Lived<IncomeYear>[], ev: Lived<EveloYear>[], years: readonly WalkYear[]) {
  let income: StoryPart | null = null
  if (inc.length) {
    const last = inc[inc.length - 1]
    const all = livedIncome(years)
    const tax = sum(all, (x) => x.y.tax)
    const sold = sum(all, (x) => x.y.sold)
    const taxText = tax > 0 ? `paid about ${k(tax)} in tax` : 'paid no tax'
    const soldText = sold > 0 ? `sold about ${k(sold)} of shares` : 'sold no shares'
    const left = last.y.netWorth > 0
    income = {
      title: left ? 'What heirs get' : 'Nothing left for heirs',
      figure: `${k(Math.max(0, last.y.netWorth))} at ${last.row.age + 1}`,
      text: `Along the way it ${taxText} and ${soldText}.`,
    }
  }

  let evelo: StoryPart | null = null
  if (ev.length) {
    const last = ev[ev.length - 1]
    const interest = sum(livedEvelo(years), (x) => x.y.interest)
    const left = last.y.netWorth > 0
    const loanText = last.y.loan > 0 ? `The estate repays the ${k(last.y.loan)} loan.` : 'There’s no loan left to repay.'
    const intText = interest > 0 ? ` Interest added about ${k(interest)} to it over the years.` : ''
    evelo = {
      title: left ? 'What heirs get' : 'Nothing left for heirs',
      figure: `${k(Math.max(0, last.y.netWorth))} at ${last.row.age + 1}, after the loan`,
      text: loanText + intText,
    }
  }
  return { income, evelo }
}

export const chapterStory: ChapterStoryFn = (chapter, years, inputs) => {
  const rows = years.slice(chapter.from, chapter.to + 1)
  const inc = livedIncome(rows)
  const ev = livedEvelo(rows)
  let parts: { income: StoryPart | null; evelo: StoryPart | null }
  switch (chapter.key) {
    case 'before':
      parts = before(inc, ev)
      break
    case 'arrives':
      parts = arrives(chapter, years, inc, ev)
      break
    case 'bad':
      parts = bad(inc, ev, inputs.evelo.maxLtv)
      break
    case 'estate':
      parts = estate(inc, ev, years)
      break
    default:
      parts = between(inc, ev, rows)
  }
  const income = parts.income ?? absent(rows)
  const evelo = parts.evelo ?? absent(rows)
  if (chapter.badYear != null && chapter.key !== 'bad') {
    const row = years[chapter.badYear]
    if (parts.income) income.text += dropIncome(row)
    if (parts.evelo) evelo.text += dropEvelo(row)
  }
  return { income, evelo }
}
