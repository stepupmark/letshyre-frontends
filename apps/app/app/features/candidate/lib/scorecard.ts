import type { Question, Scorecard } from "../schemas/scorecard.schema"

export type Viewer = "employer" | "candidate"

export const MCQ = new Set(["MCQ", "MCQ_PSEUDOCODE", "PSEUDOCODE_MCQ"])
// these arrive as Markdown problem statements, too long for the trigger line
export const RICH = new Set(["CODING", "MCQ_PSEUDOCODE", "PSEUDOCODE_MCQ"])

const TYPES = [
  "mcq",
  "mcq_pseudocode",
  "pseudocode_mcq",
  "coding",
  "typing",
  "audio",
] as const
export const SECTIONS = [
  "mcq",
  "pseudocode_mcq",
  "coding",
  "typing",
  "audio",
] as const

export type QuestionType = (typeof TYPES)[number]

export const typeOf = (q: Question): QuestionType | null => {
  const type = (q.type ?? "").toLowerCase()
  return (TYPES as readonly string[]).includes(type)
    ? (type as QuestionType)
    : null
}

// only multiple choice is marked right or wrong
export const isWrong = (q: Question) =>
  MCQ.has((q.type ?? "").toUpperCase()) && q.is_correct !== true

export const hasItems = <T>(list: T[] | null | undefined): list is T[] =>
  Array.isArray(list) && list.length > 0

// an interview that ended early shouldn't read as a row of zero scores
export function answered(questions: Question[]) {
  const kept: Question[] = []
  for (const q of questions) {
    const type = (q.type ?? "").toUpperCase()
    if (type === "AUDIO" ? q.is_dummy_audio : q.answer_provided === "") break
    kept.push(q)
  }
  return kept
}

export const scoredSections = (report: Scorecard) =>
  SECTIONS.filter(
    (key) => (report.category_scores?.section_summary?.[key]?.count ?? 0) > 0
  )

export const hasInsights = (report: Scorecard, own: boolean) => {
  const scores = report.category_scores
  return (
    hasItems(scores?.strengths) ||
    hasItems(scores?.areas_for_improvement) ||
    (!own && hasItems(scores?.recommendations))
  )
}

export interface Takeaways {
  strength: string | null
  gap: string | null
  match: number | null
}

const first = (list: string[] | null | undefined) =>
  list?.find((item) => item.trim())?.trim() ?? null

export function takeaways(report: Scorecard): Takeaways {
  const scores = report.category_scores
  return {
    strength: first(scores?.strengths),
    gap: first(scores?.areas_for_improvement),
    match: report.ai_match?.ai_matching_score ?? null,
  }
}
