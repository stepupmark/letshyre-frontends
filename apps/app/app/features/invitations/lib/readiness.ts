import { fieldsIn, unknownFieldsIn } from "./merge-fields"

export type Issue =
  | { kind: "subject" }
  | { kind: "invite" }
  | { kind: "unknown"; fields: string[] }

/** What stops a template from being sent. */
export function issuesOf(subject: string, body: string): Issue[] {
  const issues: Issue[] = []
  if (!subject.trim()) issues.push({ kind: "subject" })
  if (!fieldsIn(body).includes("invite_link")) issues.push({ kind: "invite" })
  const unknown = unknownFieldsIn(`${subject} ${body}`)
  if (unknown.length > 0) issues.push({ kind: "unknown", fields: unknown })
  return issues
}
