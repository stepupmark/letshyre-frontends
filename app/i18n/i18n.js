import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import { DEFAULT_LOCALE, LOCALES } from "./config";
import { resources, namespaces } from "./messages";
import { pseudoPostProcessor, PSEUDO_ENABLED } from "./pseudo";

// One i18next instance per locale, cached. Separate instances keep the locale
// fixed per route so concurrent prerender passes never bleed into each other.
// initImmediate:false keeps init synchronous — required by the prerender step
// and entry.client (which awaits loadCatalogs before calling hydrateRoot).
const cache = new Map();

// check-i18n-usage.mjs catches literal keys at build time; this covers the ones
// it can't resolve — computed keys, and any locale that drifts from English at
// runtime. Reported once per key so a re-rendering component can't flood.
const reported = new Set();
const onMissingKey = (lngs, ns, key) => {
  const id = `${ns}:${key}`;
  if (reported.has(id)) return;
  reported.add(id);
  console.error(`i18n: missing key ${id} for ${lngs?.join?.(",") ?? lngs}`);
};

export function getI18n(lang) {
  const lng = LOCALES.includes(lang) ? lang : DEFAULT_LOCALE;
  if (cache.has(lng)) return cache.get(lng);

  const instance = i18next.createInstance();
  instance.use(initReactI18next);
  if (PSEUDO_ENABLED) instance.use(pseudoPostProcessor);
  instance.init({
    lng,
    fallbackLng: DEFAULT_LOCALE,
    resources,
    ns: namespaces.length ? namespaces : ["common"],
    defaultNS: "common",
    interpolation: { escapeValue: false },
    initImmediate: false,
    saveMissing: true,
    missingKeyHandler: onMissingKey,
    postProcess: PSEUDO_ENABLED ? ["pseudo"] : [],
    react: { useSuspense: false },
  });

  cache.set(lng, instance);
  return instance;
}

export const nsT = (lang, ns) => getI18n(lang).getFixedT(lang, ns);
export const seoT = (lang) => nsT(lang, "seo");
