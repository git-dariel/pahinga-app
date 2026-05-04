export class RepositoryError extends Error {
  readonly cause?: unknown

  constructor(message: string, cause?: unknown) {
    super(message)
    this.name = 'RepositoryError'
    this.cause = cause
  }
}

export function wrapRepositoryError(operation: string, cause: unknown): RepositoryError {
  const message = cause instanceof Error ? `${operation}: ${cause.message}` : `${operation} failed`
  return new RepositoryError(message, cause)
}
