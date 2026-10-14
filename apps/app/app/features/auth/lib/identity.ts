const FREE_MAIL =
  /^(gmail|googlemail|yahoo|ymail|outlook|hotmail|live|msn|icloud|me|mac|aol|proton|protonmail|rediffmail|zoho)$/
const SUFFIX = /^(com|co|in|org|net|io|ai|uk|us|edu|gov|biz|info)$/

const INBOXES: [RegExp, string, string][] = [
  [/^(gmail|googlemail)\.com$/, "Gmail", "https://mail.google.com/"],
  [
    /^(outlook|hotmail|live|msn)\.(com|in|co\.uk)$/,
    "Outlook",
    "https://outlook.live.com/mail/",
  ],
  [/^(yahoo|ymail)\.(com|in|co\.in)$/, "Yahoo Mail", "https://mail.yahoo.com/"],
  [/^(icloud|me|mac)\.com$/, "iCloud Mail", "https://www.icloud.com/mail"],
]

const domainOf = (email: string) => email.split("@")[1]?.toLowerCase() ?? ""

/** The webmail to open for a code, when the address is a known provider. */
export function inboxFor(email: string) {
  const domain = domainOf(email)
  const match = INBOXES.find(([re]) => re.test(domain))
  return match ? { provider: match[1], url: match[2] } : null
}

/** acme.co.in → Acme. A guess for show only; free mail gives nothing. */
export function companyFromEmail(email: string) {
  const labels = domainOf(email).split(".").filter(Boolean)
  while (labels.length > 1 && SUFFIX.test(labels.at(-1) ?? "")) labels.pop()
  const name = labels.at(-1)
  if (!name || FREE_MAIL.test(name)) return null
  return name.charAt(0).toUpperCase() + name.slice(1)
}
