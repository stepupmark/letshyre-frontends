export interface Recipient {
  email: string
  name: string
}

export const RECIPIENT_LIMIT = 100

const EMAIL = /^[^\s@<>,;"']+@[^\s@<>,;"']+\.[^\s@<>,;"']{2,}$/
const ANGLED = /^\s*"?([^"<]*?)"?\s*<([^>]+)>\s*$/

const isEmail = (value: string) => EMAIL.test(value.trim())

/** "jane.doe-smith@x.com" → "Jane Doe Smith", for rows that came without a name. */
const nameFromEmail = (email: string) =>
  (email.split("@")[0] ?? "")
    .split(/[._+-]+/)
    .filter((part) => part && !/^\d+$/.test(part))
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ")

function fromRow(row: string): { found: Recipient[]; invalid: string[] } {
  const angled = ANGLED.exec(row)
  if (angled) {
    const email = (angled[2] ?? "").trim()
    const name = (angled[1] ?? "").trim()
    return isEmail(email)
      ? { found: [{ email, name: name || nameFromEmail(email) }], invalid: [] }
      : { found: [], invalid: [row.trim()] }
  }
  const cells = row
    .split(/[,;\t]/)
    .map((cell) =>
      cell
        .trim()
        .replace(/^"(.*)"$/, "$1")
        .trim()
    )
    .filter(Boolean)
  const emails = cells.filter(isEmail)
  const words = cells.filter((cell) => !isEmail(cell))
  if (emails.length === 0) {
    // a CSV header like "name,email" isn't a mistake worth reporting
    const header = words.some((word) => /^e-?mail/i.test(word))
    return { found: [], invalid: header ? [] : [row.trim()] }
  }
  if (emails.length > 1)
    return {
      found: emails.map((email) => ({ email, name: nameFromEmail(email) })),
      invalid: words,
    }
  const email = emails[0] ?? ""
  return {
    found: [{ email, name: words.join(" ") || nameFromEmail(email) }],
    invalid: [],
  }
}

/** Reads pasted lists and CSV text: one person per line, or several emails on one line. */
export function parseRecipients(input: string) {
  const found: Recipient[] = []
  const invalid: string[] = []
  for (const row of input.split(/\r?\n/)) {
    if (!row.trim()) continue
    const result = fromRow(row)
    found.push(...result.found)
    invalid.push(...result.invalid)
  }
  return { found, invalid }
}

/** Adds new people after the current ones; the same address twice is kept once. */
export function addRecipients(
  current: readonly Recipient[],
  incoming: readonly Recipient[]
) {
  const seen = new Set(current.map((r) => r.email.toLowerCase()))
  const added: Recipient[] = []
  let duplicates = 0
  for (const recipient of incoming) {
    const key = recipient.email.toLowerCase()
    if (seen.has(key)) {
      duplicates++
      continue
    }
    seen.add(key)
    added.push(recipient)
  }
  return { list: [...current, ...added], added: added.length, duplicates }
}

/** Addresses the API didn't queue, matched without regard to case. */
export const notQueued = (
  sent: readonly Recipient[],
  queued: readonly string[]
) => {
  const ok = new Set(queued.map((email) => email.toLowerCase()))
  return sent.filter((recipient) => !ok.has(recipient.email.toLowerCase()))
}
