// Number formatting. All formatters are cached Intl.NumberFormat instances.
// Minus signs use U+2212 for typographic correctness in tabular figures.

const cache = new Map<string, Intl.NumberFormat>()
function nf(locale: string | undefined, opts: Intl.NumberFormatOptions): Intl.NumberFormat {
  const key = `${locale ?? ''}|${JSON.stringify(opts)}`
  let f = cache.get(key)
  if (!f) {
    f = new Intl.NumberFormat(locale, opts)
    cache.set(key, f)
  }
  return f
}

const MINUS = '−'
const fixMinus = (s: string) => s.replace(/-/g, MINUS)
const bad = (v: number) => !Number.isFinite(v)
const DASH = '—'

export interface CurrencyOpts {
  currency?: string
  locale?: string
  /** Fraction digits; default 0 (full) / smart (compact). */
  digits?: number
  /** Prefix + for positive values. */
  signed?: boolean
}

/** $1,234,567 */
export function currency(v: number, o: CurrencyOpts = {}): string {
  if (bad(v)) return DASH
  return fixMinus(
    nf(o.locale ?? 'en-US', {
      style: 'currency',
      currency: o.currency ?? 'USD',
      maximumFractionDigits: o.digits ?? 0,
      minimumFractionDigits: o.digits ?? 0,
      signDisplay: o.signed ? 'exceptZero' : 'auto',
    }).format(v),
  )
}

/** $3.2M, $840K, $12. One decimal below 10 units of the suffix, none above. */
export function currencyCompact(v: number, o: CurrencyOpts = {}): string {
  if (bad(v)) return DASH
  const abs = Math.abs(v)
  if (abs < 1000) return currency(v, { ...o, digits: o.digits ?? 0 })
  const scaled = abs >= 1e9 ? abs / 1e9 : abs >= 1e6 ? abs / 1e6 : abs / 1e3
  const digits = o.digits ?? (scaled < 10 ? 1 : 0)
  return fixMinus(
    nf(o.locale ?? 'en-US', {
      style: 'currency',
      currency: o.currency ?? 'USD',
      notation: 'compact',
      compactDisplay: 'short',
      maximumFractionDigits: digits,
      minimumFractionDigits: digits,
      signDisplay: o.signed ? 'exceptZero' : 'auto',
    }).format(v),
  )
}

/** Local-currency amount, e.g. 4.200.000 ₫ or €3,100. Compact optional. */
export function localCurrency(v: number, code: string, o: { compact?: boolean; locale?: string } = {}): string {
  if (bad(v)) return DASH
  return fixMinus(
    nf(o.locale, {
      style: 'currency',
      currency: code,
      notation: o.compact ? 'compact' : 'standard',
      maximumFractionDigits: o.compact ? 1 : 0,
      currencyDisplay: 'narrowSymbol',
    }).format(v),
  )
}

export interface PercentOpts {
  digits?: number
  signed?: boolean
  locale?: string
}
/** Decimal -> percent string. percent(0.873) = "87%"; percent(0.065, {digits:1}) = "6.5%" */
export function percent(v: number, o: PercentOpts = {}): string {
  if (bad(v)) return DASH
  const d = o.digits ?? 0
  return fixMinus(
    nf(o.locale ?? 'en-US', {
      style: 'percent',
      maximumFractionDigits: d,
      minimumFractionDigits: d,
      signDisplay: o.signed ? 'exceptZero' : 'auto',
    }).format(v),
  )
}

/** Percentage points delta: "+3.2 pts" */
export function points(v: number, digits = 1): string {
  if (bad(v)) return DASH
  const s = (v * 100).toFixed(digits)
  return `${v > 0 ? '+' : ''}${fixMinus(s)} pts`
}

export function number(v: number, digits = 0, locale = 'en-US'): string {
  if (bad(v)) return DASH
  return fixMinus(nf(locale, { maximumFractionDigits: digits, minimumFractionDigits: digits }).format(v))
}

export function years(n: number): string {
  if (bad(n)) return DASH
  const r = Math.round(n * 10) / 10
  return `${number(r, Number.isInteger(r) ? 0 : 1)} ${r === 1 ? 'yr' : 'yrs'}`
}
export function yearsLong(n: number): string {
  const r = Math.round(n)
  return `${r} ${r === 1 ? 'year' : 'years'}`
}
export function age(n: number): string {
  return bad(n) ? DASH : `age ${Math.round(n)}`
}
/** "55 → 85" */
export function ageSpan(start: number, horizon: number): string {
  return `${Math.round(start)} → ${Math.round(start + horizon)}`
}

export type FormatKind =
  | 'currency'
  | 'currency-compact'
  | 'percent'
  | 'percent1'
  | 'percent2'
  | 'number'
  | 'years'
  | ((v: number) => string)

export function formatValue(v: number, kind: FormatKind): string {
  if (typeof kind === 'function') return kind(v)
  switch (kind) {
    case 'currency':
      return currency(v)
    case 'currency-compact':
      return currencyCompact(v)
    case 'percent':
      return percent(v)
    case 'percent1':
      return percent(v, { digits: 1 })
    case 'percent2':
      return percent(v, { digits: 2 })
    case 'years':
      return years(v)
    default:
      return number(v)
  }
}

/** Parse loosely formatted user input: "$1.2m", "5,000,000", "6.5%", "850k". */
export function parseLoose(raw: string, kind: 'currency' | 'percent' | 'number'): number | null {
  const s = raw.trim().toLowerCase().replace(/[\s,$€£¥_]/g, '').replace(/−/g, '-')
  if (!s) return null
  const m = s.match(/^(-?\d*\.?\d+)(k|m|b|%)?$/)
  if (!m) return null
  let v = parseFloat(m[1])
  const suf = m[2]
  if (suf === 'k') v *= 1e3
  else if (suf === 'm') v *= 1e6
  else if (suf === 'b') v *= 1e9
  if (kind === 'percent') v /= 100
  return Number.isFinite(v) ? v : null
}
