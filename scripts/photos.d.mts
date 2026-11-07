export const ROOT: string
export interface FetchLike {
  json(): Promise<unknown>
  arrayBuffer(): Promise<ArrayBuffer>
}
export function httpGet(url: string | URL): Promise<FetchLike>
export function doCity(
  cityId: string,
  opts?: { root?: string; get?: (url: string | URL) => Promise<FetchLike>; log?: (msg: string) => void },
): Promise<{ downloaded: number; skipped: number }>
export function recredit(cityId: string, opts?: { root?: string; log?: (msg: string) => void }): number
