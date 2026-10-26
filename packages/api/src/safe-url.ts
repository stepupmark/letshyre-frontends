/**
 * Only http(s) URLs reach an href or src; anything else (javascript:, data:, garbage) is null.
 * `bareDomains` reads a typed-in "acme.com" as https://acme.com.
 */
export function safeUrl(
  value: string | null | undefined,
  { bareDomains = false }: { bareDomains?: boolean } = {}
): string | null {
  const text = value?.trim()
  if (!text) return null
  const withScheme =
    bareDomains && !/^[a-z][a-z\d+.-]*:/i.test(text) ? `https://${text}` : text
  try {
    const url = new URL(withScheme)
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.href
      : null
  } catch {
    return null
  }
}
