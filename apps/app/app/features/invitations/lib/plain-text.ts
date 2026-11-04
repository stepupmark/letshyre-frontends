const BLOCKS = /<\/(p|div|li|h\d)>|<br\s*\/?>/gi

/** The first readable words of an email body, for a card's excerpt. */
export function excerptOf(html: string, max = 160) {
  const doc = new DOMParser().parseFromString(
    html.replace(BLOCKS, " "),
    "text/html"
  )
  const text = doc.body.textContent.replace(/\s+/g, " ").trim()
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text
}
