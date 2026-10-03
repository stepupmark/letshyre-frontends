import { isLocale, type Locale } from "./config.ts"

export const LOCALE_COOKIE = "lh_locale"
const ONE_YEAR = 60 * 60 * 24 * 365

export function readLocaleCookie(cookie: string): Locale | null {
  for (const part of cookie.split(";")) {
    const [name, value] = part.trim().split("=")
    if (name === LOCALE_COOKIE && isLocale(value)) return value
  }
  return null
}

/** `domain` is shared by both apps, e.g. `.letshyre.ai`. Omit it on localhost. */
export function serializeLocaleCookie(
  locale: Locale,
  { domain, secure = true }: { domain?: string; secure?: boolean } = {}
): string {
  return [
    `${LOCALE_COOKIE}=${locale}`,
    "Path=/",
    `Max-Age=${ONE_YEAR}`,
    "SameSite=Lax",
    domain && `Domain=${domain}`,
    secure && "Secure",
  ]
    .filter(Boolean)
    .join("; ")
}

export function writeLocaleCookie(
  locale: Locale,
  options?: { domain?: string }
) {
  document.cookie = serializeLocaleCookie(locale, {
    ...options,
    secure: location.protocol === "https:",
  })
}
