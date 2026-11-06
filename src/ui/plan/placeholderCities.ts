// PLACEHOLDER until the city dataset lands (Stage 5). Only ids/labels for the shell's Select.
import type { SelectOption } from '../primitives'

export const PLACEHOLDER_CITIES: SelectOption<string>[] = [
  { value: 'new-york', label: 'New York', meta: 'USD' },
  { value: 'san-francisco', label: 'San Francisco', meta: 'USD' },
  { value: 'austin', label: 'Austin', meta: 'USD' },
  { value: 'miami', label: 'Miami', meta: 'USD' },
  { value: 'lisbon', label: 'Lisbon', meta: 'EUR' },
  { value: 'mexico-city', label: 'Mexico City', meta: 'MXN' },
  { value: 'chiang-mai', label: 'Chiang Mai', meta: 'THB' },
  { value: 'tbilisi', label: 'Tbilisi', meta: 'GEL' },
  { value: 'kuala-lumpur', label: 'Kuala Lumpur', meta: 'MYR' },
  { value: 'medellin', label: 'Medellín', meta: 'COP' },
]

export const cityLabel = (id: string | null) => PLACEHOLDER_CITIES.find((c) => c.value === id)?.label ?? id ?? ''
