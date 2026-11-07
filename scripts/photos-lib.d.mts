export const PHOTOS_PER_CITY: number
export const MAX_BYTES: number
export const TARGET_WIDTH: number
export const FILLED_KEYS: string[]
export const KEY_ORDER: string[]
export function allowedLicense(name: unknown): string | null
export function checkLicense(name: unknown, title: string): string
export function licenseUrlFor(license: string, url: unknown): string
export function cleanAuthor(html: unknown): string
export function commonsPageUrl(title: string): string
export function validateHandFields(entries: unknown): string[]
export function validateEntry(e: Record<string, unknown>, n: number): string[]
export function isFilled(e: Record<string, unknown>, n: number): boolean
export function orderKeys<T extends Record<string, unknown>>(e: T): T
export const MIN_ORIGINAL_SIDE: number
export function isPlaceholderAuthor(name: unknown): boolean
export function authorFrom(meta: Record<string, { value?: unknown } | undefined> | undefined, title: string): string
export function checkOriginalSize(width: unknown, height: unknown, title: string): void
export function checkImageUrl(url: unknown, title: string): string
export function normalizeTitle(title: unknown): string
