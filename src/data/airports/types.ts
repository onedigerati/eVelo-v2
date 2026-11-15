export interface Airport {
  /** IATA airport code, or metro code for a multi-airport city (NYC, LON…). */
  code: string
  /** City name used in sentences ("via Tokyo"). */
  city: string
  lat: number
  lon: number
  /** Year-round nonstop destinations (codes in NODES). */
  nonstops: string[]
  /** Nonstops flown only part of the year (codes in NODES). */
  seasonal?: string[]
  /** Where the route list was checked. */
  source?: { name: string; url: string }
}
