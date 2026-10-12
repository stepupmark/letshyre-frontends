import type { Interview } from "../schemas/candidate-unlock.schema"

export interface Choice {
  id: string | number
  role: string
  score: number | null
  unlocked: boolean
  /** the interview for the role this match is about */
  primary: boolean
}

/** One credit per interview; the interview for the matched role comes first. */
export function unlockChoices(
  interviews: Interview[],
  matchedRole: string | null | undefined
): Choice[] {
  const seen = new Set<string>()
  const choices: Choice[] = []
  for (const interview of interviews) {
    const key = String(interview.interview_id)
    if (seen.has(key)) continue
    seen.add(key)
    choices.push({
      id: interview.interview_id,
      role: interview.role ?? "",
      score: interview.score,
      unlocked: Boolean(interview.unlocked),
      primary: false,
    })
  }
  const primary = choices.findIndex(
    (choice) =>
      Boolean(matchedRole) &&
      choice.role.toLowerCase() === matchedRole?.toLowerCase()
  )
  if (primary > 0) choices.unshift(...choices.splice(primary, 1))
  if (primary >= 0 && choices[0]) choices[0].primary = true
  return choices
}

/** Unlocked interviews are never selectable, so never paid for twice. */
export function toggle(selected: ReadonlySet<string>, choice: Choice) {
  const next = new Set(selected)
  const key = String(choice.id)
  if (choice.unlocked) next.delete(key)
  else if (next.has(key)) next.delete(key)
  else next.add(key)
  return next
}

export const costOf = (selected: ReadonlySet<string>, choices: Choice[]) =>
  choices.filter((c) => !c.unlocked && selected.has(String(c.id))).length
