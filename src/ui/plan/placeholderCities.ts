// City options for selects, derived from the real dataset.
import type { SelectOption } from '../primitives'
import { CITIES, CITY_BY_ID } from '../../data/cities'

export const PLACEHOLDER_CITIES: SelectOption<string>[] = [...CITIES]
  .sort((a, b) => a.name.localeCompare(b.name))
  .map((c) => ({ value: c.id, label: c.name, meta: `${c.country === 'United States' ? 'USA' : c.country} · ${c.currency}` }))

export const cityLabel = (id: string | null) => (id ? CITY_BY_ID[id]?.name ?? id : '')
