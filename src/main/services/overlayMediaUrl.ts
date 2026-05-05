import { existsSync } from 'fs'
import { join } from 'path'
import { pathToFileURL } from 'url'

/**
 * Converts a local GIF/MP4/WebM path to safe file URL.
 * Returns null when the path is missing, unreadable, or unsupported.
 */
export function overlayMediaUrlFromPath(rawPath: string | null | undefined): string | null {
  if (!rawPath) return null
  const trimmed = rawPath.trim()
  if (!trimmed) return null
  if (!/\.(gif|mp4|webm)$/i.test(trimmed)) return null
  if (!existsSync(trimmed)) return null
  return pathToFileURL(trimmed).toString()
}

export function getDefaultNekoUrls(appPath: string): { intro: string; loop: string } {
  return {
    intro: pathToFileURL(join(appPath, 'assets', 'neko1.webm')).toString(),
    loop: pathToFileURL(join(appPath, 'assets', 'neko2.webm')).toString()
  }
}
