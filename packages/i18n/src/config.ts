export const LOCALES = [
  "en",
  "hi",
  "fr",
  "ja",
  "ar",
  "te",
  "ta",
  "es",
  "nl",
  "ru",
  "kn",
  "ml",
  "ur",
  "bn",
  "de",
  "pt",
  "it",
  "ko",
  "id",
] as const

export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = "en"

export const RTL_LOCALES: readonly Locale[] = ["ar", "ur"]

export const LOCALE_NAMES: Record<Locale, string> = {
  en: "English",
  hi: "हिन्दी",
  fr: "Français",
  ja: "日本語",
  ar: "العربية",
  te: "తెలుగు",
  ta: "தமிழ்",
  es: "Español",
  nl: "Nederlands",
  ru: "Русский",
  kn: "ಕನ್ನಡ",
  ml: "മലയാളം",
  ur: "اردو",
  bn: "বাংলা",
  de: "Deutsch",
  pt: "Português",
  it: "Italiano",
  ko: "한국어",
  id: "Bahasa Indonesia",
}

export const LOCALE_ENGLISH_NAMES: Record<Locale, string> = {
  en: "English",
  hi: "Hindi",
  fr: "French",
  ja: "Japanese",
  ar: "Arabic",
  te: "Telugu",
  ta: "Tamil",
  es: "Spanish",
  nl: "Dutch",
  ru: "Russian",
  kn: "Kannada",
  ml: "Malayalam",
  ur: "Urdu",
  bn: "Bengali",
  de: "German",
  pt: "Portuguese",
  it: "Italian",
  ko: "Korean",
  id: "Indonesian",
}

export const OG_LOCALE: Record<Locale, string> = {
  en: "en_US",
  hi: "hi_IN",
  fr: "fr_FR",
  ja: "ja_JP",
  ar: "ar_AR",
  te: "te_IN",
  ta: "ta_IN",
  es: "es_ES",
  nl: "nl_NL",
  ru: "ru_RU",
  kn: "kn_IN",
  ml: "ml_IN",
  ur: "ur_PK",
  bn: "bn_BD",
  de: "de_DE",
  pt: "pt_PT",
  it: "it_IT",
  ko: "ko_KR",
  id: "id_ID",
}

export function isLocale(value: unknown): value is Locale {
  return (
    typeof value === "string" && (LOCALES as readonly string[]).includes(value)
  )
}

export function toLocale(value: unknown): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE
}

export function dirFor(locale: Locale): "ltr" | "rtl" {
  return RTL_LOCALES.includes(locale) ? "rtl" : "ltr"
}

/** `("en", "/about")` → `/en/about`, `("en")` → `/en` */
export function localePath(locale: Locale, path = ""): string {
  if (path === "" || path === "/") return `/${locale}`
  return `/${locale}${path.startsWith("/") || path.startsWith("#") ? "" : "/"}${path}`
}
