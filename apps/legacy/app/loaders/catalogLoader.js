import { loadCatalogs } from "@/i18n/loadCatalogs";
import { preferredLocale } from "@/i18n/hooks";
import { isLocale } from "@/i18n/config";

// Loads a route's namespaces in the :lang locale, or the visitor's stored one
// on routes without a locale prefix.
export function catalogLoader(namespaces, loader) {
  return async (args) => {
    const result = loader ? await loader(args) : null;
    const lang = isLocale(args.params?.lang) ? args.params.lang : preferredLocale();
    await loadCatalogs(lang, namespaces);
    return result;
  };
}
