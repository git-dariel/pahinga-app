/**
 * ISO-8601 timestamp for storing alongside SQLite datetime defaults.
 */
export function nowIso(): string {
  return new Date().toISOString()
}
