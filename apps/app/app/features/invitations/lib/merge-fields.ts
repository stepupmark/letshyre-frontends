export const MERGE_FIELDS = [
  "candidate_name",
  "job_role",
  "employer_company_name",
  "sender_name",
  "invite_link",
] as const

export type MergeField = (typeof MERGE_FIELDS)[number]

export const isMergeField = (key: string): key is MergeField =>
  (MERGE_FIELDS as readonly string[]).includes(key)

export const tokenPattern = () => /\{\{\s*([\w.-]+)\s*\}\}/g

export type Piece = { text: string } | { field: string }

export function piecesOf(text: string): Piece[] {
  const pieces: Piece[] = []
  let last = 0
  for (const match of text.matchAll(tokenPattern())) {
    if (match.index > last) pieces.push({ text: text.slice(last, match.index) })
    pieces.push({ field: match[1] ?? "" })
    last = match.index + match[0].length
  }
  if (last < text.length) pieces.push({ text: text.slice(last) })
  return pieces
}

export const fieldsIn = (text: string) =>
  [...text.matchAll(tokenPattern())].map((match) => match[1] ?? "")

export const unknownFieldsIn = (text: string) => [
  ...new Set(fieldsIn(text).filter((key) => !isMergeField(key))),
]

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")

const MARK =
  '<mark style="background:#dbeafe;color:inherit;border-radius:3px;padding:0 2px;">'

const insideTag = (text: string, at: number) =>
  text.lastIndexOf("<", at) > text.lastIndexOf(">", at)

/**
 * Fills known fields; unknown ones stay as typed so the preview shows the mistake.
 * `mark` highlights filled text, but never inside a tag, where it would break an href.
 */
export const fillFields = (
  text: string,
  values: Partial<Record<string, string>>,
  { html = true, mark = false } = {}
) =>
  text.replace(tokenPattern(), (whole, key: string, at: number) => {
    const value = isMergeField(key) ? values[key] : undefined
    if (value === undefined) return whole
    if (!html) return value
    const safe = escapeHtml(value)
    return mark && !insideTag(text, at) ? `${MARK}${safe}</mark>` : safe
  })
