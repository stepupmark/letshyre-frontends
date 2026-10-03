import { useContext } from "react";
import { useParams } from "react-router";
import { DEFAULT_LOCALE, isLocale } from "./config";
import { AppLocaleContext } from "./appLocale";

// Current locale: the /:lang segment when present (every prerendered public
// page), otherwise the ambient AppLocaleProvider's locale — pages like
// /shared-scorecard/:shareId sits under PublicLayout without a
// /:lang prefix, so without this fallback Navbar/Footer would build every
// internal link against DEFAULT_LOCALE regardless of the visitor's actual
// selected language.
export function useLocale() {
  const { lang } = useParams();
  const appLocale = useContext(AppLocaleContext);
  if (isLocale(lang)) return lang;
  return appLocale?.locale ?? DEFAULT_LOCALE;
}

// Remember the visitor's choice so "/" can send them back to it next time.
export function persistLocale(lang) {
  try {
    localStorage.setItem("locale", lang);
    document.cookie = `locale=${lang};path=/;max-age=31536000;samesite=lax`;
  } catch {
    /* storage unavailable — ignore */
  }
}

// Best guess for a first visit to "/": stored choice, then browser language,
// then the default. Client-only (reads localStorage/navigator).
export function preferredLocale() {
  try {
    const stored = localStorage.getItem("locale");
    if (isLocale(stored)) return stored;
    const nav = navigator.language?.slice(0, 2);
    if (isLocale(nav)) return nav;
  } catch {
    /* ignore */
  }
  return DEFAULT_LOCALE;
}
