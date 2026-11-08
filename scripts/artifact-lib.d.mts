export interface PreviewPhoto {
  key: string
  path: string
}
export const UPLOAD_BATCH: number
export function photoKey(cityId: string, distName: string): string
export function planPreviewPhotos(
  sources: { path: string; cityId: string; hash: string }[],
  dist: { name: string; hash: string }[],
): { photos: PreviewPhoto[]; unmatched: string[] }
export function pendingUploads(photos: PreviewPhoto[], cache: Record<string, string>, size?: number): { count: number; batches: string[][] }
export function publishedMap(photos: PreviewPhoto[], cache: Record<string, string>): Record<string, string>
export function mergeUploadResults(
  cache: Record<string, string>,
  photos: PreviewPhoto[],
  results: Record<string, string> | { path?: string; file?: string; key?: string; url?: string }[],
): { cache: Record<string, string>; added: string[]; skipped: string[] }
export function artifactFiles(distAssets: string[], opts: { assetPhotos: boolean }): Record<string, string>
