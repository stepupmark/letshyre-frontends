export type Reason = "sales"

// the backend has no topic field, so support sees it in the subject
const SUBJECT_TAGS: Record<Reason, string> = { sales: "Sales" }

export const tagSubject = (subject: string, reason: Reason | null) =>
  reason ? `[${SUBJECT_TAGS[reason]}] ${subject}` : subject
