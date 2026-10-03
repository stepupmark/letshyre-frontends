import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { I18nextProvider } from "react-i18next";
import { dirFor, isLocale } from "./config";
import { getI18n } from "./i18n";
import { persistLocale, preferredLocale } from "./hooks";
import { AppLocaleContext } from "./appLocale";
import { loadCatalogs, loadedNamespaces } from "./loadCatalogs";

// Locale for the client-rendered app shell (auth, dashboards). Public pages
// nest their own /:lang provider inside this one.
export function AppLocaleProvider({ children }) {
  const urlLang = useLocation().pathname.split("/")[1];
  const [locale, setLocaleState] = useState(() =>
    isLocale(urlLang) ? urlLang : preferredLocale(),
  );

  // root.jsx only knows the locale from a /:lang segment, so routes without
  // one would otherwise keep the default lang/dir.
  useEffect(() => {
    const lang = isLocale(urlLang) ? urlLang : locale;
    document.documentElement.lang = lang;
    document.documentElement.dir = dirFor(lang);
  }, [urlLang, locale]);

  // Everything on screen was loaded in the current locale, so fetching the
  // same namespaces in the new one covers dialogs and lazy panels too.
  const setLocale = (lang) =>
    loadCatalogs(lang, loadedNamespaces(locale)).then(() => {
      persistLocale(lang);
      setLocaleState(lang);
    });

  // A /:lang route's loaders already fetched its catalogs; adopt its locale so
  // unprefixed routes visited next render in it too.
  if (isLocale(urlLang) && urlLang !== locale) setLocaleState(urlLang);
  useEffect(() => {
    if (isLocale(urlLang)) persistLocale(urlLang);
  }, [urlLang]);

  return (
    <AppLocaleContext.Provider value={{ locale, setLocale }}>
      <I18nextProvider i18n={getI18n(locale)}>{children}</I18nextProvider>
    </AppLocaleContext.Provider>
  );
}
