/** Absolute filesystem path → `file:` URL for `<img>` / `<video>` src in Electron. */
export function fileUrlFromPath(absolutePath: string): string {
  let p = absolutePath.trim()
  if (!p) return ''
  p = p.replace(/\\/g, '/')
  if (/^[a-zA-Z]:/.test(p)) {
    return `file:///${encodeURI(p)}`
  }
  if (p.startsWith('/')) {
    return `file://${encodeURI(p)}`
  }
  return `file:///${encodeURI(p)}`
}
