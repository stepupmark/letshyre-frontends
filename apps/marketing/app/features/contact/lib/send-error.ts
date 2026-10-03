import { HttpError, NetworkError, TimeoutError } from "@workspace/api"

export type SendErrorKind = "network" | "rateLimited" | "generic"

/** What went wrong, plus the backend's own wording when it rejected the input. */
export function describeSendError(error: unknown): {
  kind: SendErrorKind
  detail?: string
} {
  if (error instanceof NetworkError || error instanceof TimeoutError)
    return { kind: "network" }
  if (error instanceof HttpError) {
    if (error.status === 429) return { kind: "rateLimited" }
    // 4xx messages describe the input ("Enter a valid email"); 5xx ones are internals
    if (error.status < 500 && error.backendMessage)
      return { kind: "generic", detail: error.backendMessage }
  }
  return { kind: "generic" }
}
