const MAX_LENGTH = 200

/** Normalises unknown thrown values (Supabase errors, DOM errors, strings) into a short message. */
export function getErrorMessage(error: unknown, fallback = 'Something went wrong.'): string {
  const raw = extractMessage(error)
  if (!raw) return fallback
  const single = raw.replace(/\s+/g, ' ').trim()
  // A payload that is clearly not a message (HTML, JSON blobs) is not useful to a reader.
  if (single.startsWith('<') || single.startsWith('{')) return fallback
  return single.length > MAX_LENGTH ? `${single.slice(0, MAX_LENGTH - 1)}…` : single
}

function extractMessage(error: unknown): string | null {
  if (!error) return null
  if (typeof error === 'string') return error
  if (error instanceof Error && error.message) return error.message
  if (typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === 'string' && message.length > 0) return message
  }
  return null
}

export class NotFoundError extends Error {
  constructor(message = 'Not found') {
    super(message)
    this.name = 'NotFoundError'
  }
}

export function isNotFoundError(error: unknown): error is NotFoundError {
  return error instanceof NotFoundError
}
