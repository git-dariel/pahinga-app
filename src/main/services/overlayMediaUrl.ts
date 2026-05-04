import { existsSync } from 'fs'
import { pathToFileURL } from 'url'

/**
 * Converts a local GIF/MP4 path to safe file URL.
 * Returns null when the path is missing, unreadable, or unsupported.
 */
export function overlayMediaUrlFromPath(rawPath: string | null | undefined): string | null {
  if (!rawPath) return null
  const trimmed = rawPath.trim()
  if (!trimmed) return null
  if (!/\.(gif|mp4)$/i.test(trimmed)) return null
  if (!existsSync(trimmed)) return null
  return pathToFileURL(trimmed).toString()
}
