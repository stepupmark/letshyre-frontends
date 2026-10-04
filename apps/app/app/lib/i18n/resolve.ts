import { DEFAULT_LOCALE, isLocale, type Locale } from "@workspace/i18n"

/** Saved choice, then the browser's languages, then English; only locales the app ships. */
export function resolveLocale({
  saved,
  languages,
  ready,
}: {
  saved: Locale | null
  languages: readonly string[]
  ready: readonly Locale[]
}): Locale {
  const candidates = [saved, ...languages.map((tag) => tag.split("-")[0])]
  return (
    candidates.find(
      (tag): tag is Locale => isLocale(tag) && ready.includes(tag)
    ) ?? DEFAULT_LOCALE
  )
}
