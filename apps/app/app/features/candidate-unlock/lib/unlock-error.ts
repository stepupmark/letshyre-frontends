import { errorKey } from "@workspace/api"

export type UnlockProblem =
  "noCredits" | "alreadyUnlocked" | "network" | "other"

const KEYS: Record<string, UnlockProblem> = {
  "errors.network": "network",
  noCredits: "noCredits",
  alreadyUnlocked: "alreadyUnlocked",
}

/** Why an unlock was refused, read from the backend's wording. */
export function unlockProblem(error: unknown): UnlockProblem {
  const key = errorKey(error, {
    heuristics: [
      {
        test: (message) => /\b(credit|credits|balance)\b/.test(message),
        key: "noCredits",
      },
      {
        test: (message) => message.includes("already"),
        key: "alreadyUnlocked",
      },
    ],
    fallback: "other",
  })
  return KEYS[key] ?? "other"
}
