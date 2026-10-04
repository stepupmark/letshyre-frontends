import { HttpError, NetworkError, TimeoutError } from "./errors.ts"

export interface ErrorKeyRules {
  /** exact matches, keyed by normalised backend message */
  messages?: Record<string, string>
  /** for when the backend rewords a message the exact table misses */
  heuristics?: { test: (message: string) => boolean; key: string }[]
  fallback: string
}

export const normalizeMessage = (message: string | undefined) =>
  message
    ?.toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim()

/** Maps an API error to an i18n key in the `errors` namespace. */
export function errorKey(
  error: unknown,
  { messages = {}, heuristics = [], fallback }: ErrorKeyRules
): string {
  if (error instanceof NetworkError || error instanceof TimeoutError)
    return "errors.network"
  if (!(error instanceof HttpError)) return fallback
  if (error.status === 429) return "errors.tooManyAttempts"
  if (error.status >= 500) return "errors.server"

  const message = normalizeMessage(error.backendMessage)
  if (!message) return fallback
  return (
    messages[message] ??
    heuristics.find((rule) => rule.test(message))?.key ??
    fallback
  )
}
