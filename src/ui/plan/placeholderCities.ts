// City options for selects, derived from the real dataset: grouped by region, with country + currency meta.
import { createElement } from 'react'
import type { City } from '../../engine/types'
import type { SelectOption } from '../primitives'
import { CITIES, CITY_BY_ID } from '../../data/cities'

const REGION_ORDER: City['region'][] = ['North America', 'Latin America', 'Europe', 'Asia', 'Oceania', 'Middle East', 'Africa']
const country = (c: City) => (c.country === 'United States' ? 'USA' : c.country)

/** Flat, alphabetical (kept for the styleguide). */
export const PLACEHOLDER_CITIES: SelectOption<string>[] = [...CITIES]
  .sort((a, b) => a.name.localeCompare(b.name))
  .map((c) => ({ value: c.id, label: c.name, meta: `${country(c)} · ${c.currency}` }))

/** Grouped by region, alphabetical within. */
export const CITY_OPTIONS: SelectOption<string>[] = [...CITIES]
  .sort((a, b) => REGION_ORDER.indexOf(a.region) - REGION_ORDER.indexOf(b.region) || a.name.localeCompare(b.name))
  .map((c) => ({
    value: c.id,
    label: c.name,
    meta: `${country(c)} · ${c.currency}`,
    group: c.region,
    keywords: `${c.country} ${c.countryCode}`,
    leading: createElement('span', { className: 'cc num', 'aria-hidden': true }, c.countryCode),
  }))

export const cityLabel = (id: string | null) => (id ? CITY_BY_ID[id]?.name ?? id : '')
