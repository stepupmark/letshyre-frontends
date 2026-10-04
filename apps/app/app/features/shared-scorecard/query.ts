import { HttpError } from "@workspace/api"
import { queryOptions } from "@tanstack/react-query"

import { api } from "@/lib/api"
import { dataOf } from "@/lib/response"

import { sharedScorecardSchema, type SharedScorecard } from "./schema"

export const isShareId = (id: string | undefined): id is string =>
  typeof id === "string" && /^[\w-]{8,64}$/.test(id)

const storageKey = (id: string) => `shared-scorecard:${id}`

// Each open of a link spends one of its limited views, so a refresh in the same
// tab replays the copy it already has instead of asking again.
function recall(id: string): SharedScorecard | undefined {
  try {
    const raw = sessionStorage.getItem(storageKey(id))
    if (!raw) return undefined
    const parsed = sharedScorecardSchema.safeParse(JSON.parse(raw))
    return parsed.success ? parsed.data : undefined
  } catch {
    return undefined
  }
}

function remember(id: string, body: unknown) {
  try {
    sessionStorage.setItem(storageKey(id), JSON.stringify(body))
  } catch {
    /* a refresh will just spend another view */
  }
}

export const sharedScorecardQuery = (id: string) =>
  queryOptions({
    queryKey: ["shared-scorecard", id],
    queryFn: async () => {
      const body = dataOf(
        await api.get(`user/v1/public/shared-candidate/${id}`, { auth: false })
      )
      const report = sharedScorecardSchema.parse(body)
      remember(id, body)
      return report
    },
    initialData: () => recall(id),
    enabled: isShareId(id),
    retry: false,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

export type ShareProblem = "invalid" | "expired" | "limit" | "unavailable"

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
