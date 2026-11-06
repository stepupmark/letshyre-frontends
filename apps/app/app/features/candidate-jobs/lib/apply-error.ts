import { errorKey, normalizeMessage } from "@workspace/api"

const NEEDS_INTERVIEW = "needsInterview"

export type ApplyProblem = typeof NEEDS_INTERVIEW | "other"

/** The backend refuses applications until the candidate has finished an interview. */
export function applyProblem(error: unknown): ApplyProblem {
  const key = errorKey(error, {
    messages: {
      [normalizeMessage(
        "You must complete an interview before applying for a job."
      ) ?? ""]: NEEDS_INTERVIEW,
    },
    heuristics: [
      {
        test: (message) =>
          message.includes("interview") &&
          /\b(complete|attend|take)\b/.test(message),
        key: NEEDS_INTERVIEW,
      },
    ],
    fallback: "other",
  })
  return key === NEEDS_INTERVIEW ? NEEDS_INTERVIEW : "other"
}
