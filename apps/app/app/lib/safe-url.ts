/** API-sourced links and media: only http(s) reaches an href or src. */
export function safeUrl(value: string | null | undefined): string | null {
  if (!value) return null
  try {
    const url = new URL(value)
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.href
      : null
  } catch {
    return null
  }
}
