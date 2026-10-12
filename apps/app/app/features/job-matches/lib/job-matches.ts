import type { Match } from "../schemas/job-matches.schema"

export const matchScore = (match: Match) =>
  Math.round(match.ai_match?.ai_matching_score ?? match.score ?? 0)
