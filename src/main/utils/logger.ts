type LogLevel = 'info' | 'warn' | 'error'

function serializeError(error: unknown): string {
  if (error instanceof Error) {
    return error.stack ?? `${error.name}: ${error.message}`
  }
  return String(error)
}

function write(level: LogLevel, message: string, error?: unknown): void {
  const prefix = `[pahinga:${level}]`
  const details = error === undefined ? '' : `\n${serializeError(error)}`
  const line = `${prefix} ${message}${details}`

  if (level === 'error') console.error(line)
  else if (level === 'warn') console.warn(line)
  else console.info(line)
}

export const logger = {
  info(message: string): void {
    write('info', message)
  },
  warn(message: string, error?: unknown): void {
    write('warn', message, error)
  },
  error(message: string, error?: unknown): void {
    write('error', message, error)
  }
}
