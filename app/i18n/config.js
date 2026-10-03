// Locale model for the public, prerendered pages. Dependency-free so
// react-router.config.js and the build scripts can import it too.

export const DEFAULT_LOCALE = "en";

// Every locale the router recognizes as a valid /:lang prefix. "ar" is RTL.
export const LOCALES = [
  "en", "hi", "fr", "ja", "ar", "te", "ta", "es", "nl", "ru",
  "kn", "ml", "ur", "bn", "de", "pt", "it", "ko", "id",
];

// Locales excluded from prerendering. Empty today — every locale is prerendered.
const NOT_PRERENDERED = new Set();
export const PRERENDER_LOCALES = LOCALES.filter((l) => !NOT_PRERENDERED.has(l));

// Kept separate from NOT_PRERENDERED so a locale can be pulled from the legal
// pages alone while its translation is re-reviewed. Empty today.
const LEGAL_NOT_READY = new Set();
export const LEGAL_READY_LOCALES = LOCALES.filter((l) => !LEGAL_NOT_READY.has(l));

export const RTL_LOCALES = ["ar", "ur"];

// Native display names for the language switcher.
export const LOCALE_NAMES = {
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
};

export const LOCALE_ENGLISH_NAMES = {
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
};

export const isLocale = (lang) => LOCALES.includes(lang);
export const dirFor = (lang) => (RTL_LOCALES.includes(lang) ? "rtl" : "ltr");

// Prefix a path suffix with the locale: ("en","/about") -> "/en/about",
// ("en","#home") -> "/en#home", ("en","") -> "/en".
export const localePath = (lang, suffix = "") => `/${lang}${suffix}`;

// BCP-47-ish Open Graph locale per language.
export const OG_LOCALE = {
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
};

// Public page paths under /:lang. "" is the locale index (home).
export const MARKETING_PATHS = [
  "",
  "about",
  "contact",
  "download",
  "how-it-works-interview",
  "pricing",
];
export const LEGAL_PATHS = ["terms", "policy", "refund-policy"];

const LEGAL_SET = new Set(LEGAL_PATHS.map((p) => `/${p}`));

// English-only until the translations land. Deleting an entry here (and adding
// the namespace to every locale) is what ships the page in the other languages.
const PAGE_LOCALES = { "/pricing": [DEFAULT_LOCALE] };
export const NAMESPACE_LOCALES = { pricing: [DEFAULT_LOCALE] };

// Which locales ship a page suffix ("" | "/about" | "/terms"), so hreflang and
// the sitemap only advertise pages that exist.
export const localesForPage = (suffix) =>
  PAGE_LOCALES[suffix] ??
  (LEGAL_SET.has(suffix) ? LEGAL_READY_LOCALES : PRERENDER_LOCALES);

export const namespaceLocales = (ns) => NAMESPACE_LOCALES[ns] ?? LOCALES;

// Concrete paths to prerender: /<lang> plus /<lang>/<page> for each built locale.
export function prerenderPaths() {
  const out = [];
  for (const lang of PRERENDER_LOCALES) {
    for (const p of [...MARKETING_PATHS, ...LEGAL_PATHS]) {
      if (localesForPage(p ? `/${p}` : "").includes(lang)) {
        out.push(p ? `/${lang}/${p}` : `/${lang}`);
      }
    }
  }
  return out;
}
