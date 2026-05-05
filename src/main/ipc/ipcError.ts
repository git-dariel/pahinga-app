import { logger } from '../utils/logger'

export function normalizeIpcError(channel: string, error: unknown): Error {
  logger.error(`IPC handler failed: ${channel}`, error)
  const message = error instanceof Error ? error.message : 'Unexpected main process error.'
  return new Error(message)
}
