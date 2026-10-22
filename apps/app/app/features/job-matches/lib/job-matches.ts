import type { Match } from "../schemas/job-matches.schema"

export const matchScore = (match: Match) =>
  Math.round(match.ai_match?.ai_matching_score ?? match.score ?? 0)

export const bestInterview = (match: Match) => {
  const scores = (match.interview_attempts ?? [])
    .map((attempt) => attempt.overall_score)
    .filter((score): score is number => score != null)
  return scores.length ? Math.max(...scores) : null
}

export const BANDS = ["all", "strong", "partial", "low"] as const
export type BandFilter = (typeof BANDS)[number]
