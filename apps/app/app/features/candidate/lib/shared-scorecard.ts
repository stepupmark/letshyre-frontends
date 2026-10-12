import { HttpError } from "@workspace/api"

import type { ShareProblem } from "../types"

export const isShareId = (id: string | undefined): id is string =>
  typeof id === "string" && /^[\w-]{8,64}$/.test(id)

/** The backend answers every dead link with a 404; only the message tells them apart. */
export function shareProblem(error: unknown): ShareProblem {
  if (!(error instanceof HttpError)) return "unavailable"
  const message = error.backendMessage ?? ""
  if (/view limit|maximum view/i.test(message)) return "limit"
  if (/expired/i.test(message)) return "expired"
  if (/not found|invalid/i.test(message) || error.status === 404)
    return "invalid"
  return "unavailable"
}
