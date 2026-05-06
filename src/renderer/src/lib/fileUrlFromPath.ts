/** Absolute filesystem path → `file:` URL for `<img>` / `<video>` src in Electron. */
export function fileUrlFromPath(absolutePath: string): string {
  let p = absolutePath.trim()
  if (!p) return ''
  // Some Electron/Vite assets are already valid URLs (e.g. file://, http://, https://, app://).
  // Keep them as-is to avoid producing invalid `file:///file://...` values.
  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(p)) {
    return p
  }
  p = p.replace(/\\/g, '/')
  if (/^[a-zA-Z]:/.test(p)) {
    return `file:///${encodeURI(p)}`
  }
  if (p.startsWith('/')) {
    return `file://${encodeURI(p)}`
  }
  return `file:///${encodeURI(p)}`
}
