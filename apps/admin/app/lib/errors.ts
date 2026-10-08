import { HttpError, NetworkError, TimeoutError } from "@workspace/api"
import { ZodError } from "zod"

const FALLBACK_MESSAGE = "Something went wrong. Please try again."
const NETWORK_MESSAGE =
  "Can't reach the server. Check your connection and try again."

/** Copy for an error: the server's own message where it sent one. */
export function getErrorMessage(
  error: unknown,
  fallback = FALLBACK_MESSAGE
): string {
  if (error instanceof HttpError) return error.backendMessage ?? fallback
  if (error instanceof NetworkError || error instanceof TimeoutError)
    return NETWORK_MESSAGE
  // a schema mismatch is our bug, its message means nothing to the user
  if (error instanceof ZodError) return fallback
  return error instanceof Error && error.message ? error.message : fallback
}
