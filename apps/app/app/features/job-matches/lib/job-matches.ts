import { bandOf } from "@/lib/score-band"

import type { Match } from "../schemas/job-matches.schema"

export const matchScore = (match: Match) =>
  Math.round(match.ai_match?.ai_matching_score ?? match.score ?? 0)

export const bestInterview = (match: Match) => {
  const scores = (match.interview_attempts ?? [])
    .map((attempt) => attempt.overall_score)
    .filter((score): score is number => score != null)
  return scores.length ? Math.max(...scores) : null
}

export const unlockProgress = (match: Match) => {
  const attempts = match.interview_attempts ?? []
  return {
    unlocked: attempts.filter((a) => a.unlocked === true).length,
    total: attempts.length,
  }
}

export const BANDS = ["all", "strong", "partial", "low"] as const
export type BandFilter = (typeof BANDS)[number]

export function bandCounts(matches: Match[]) {
  const counts: Record<BandFilter, number> = {
    all: 0,
    strong: 0,
    partial: 0,
    low: 0,
  }
  for (const match of matches) {
    counts.all += 1
    counts[bandOf(matchScore(match))] += 1
  }
  return counts
}
