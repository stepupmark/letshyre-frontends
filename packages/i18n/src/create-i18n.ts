import i18next, { type i18n } from "i18next"

import { DEFAULT_LOCALE, type Locale, toLocale } from "./config.ts"
import { pseudoPostProcessor } from "./pseudo.ts"

export interface Catalog {
  [key: string]: string | Catalog | (string | Catalog)[]
}

/** Catalogs by locale, then namespace. Same shape as i18next resources. */
export type Messages = Partial<Record<Locale, Record<string, Catalog>>>

const instances = new Map<Locale, i18n>()
// every instance falls back to English, so it gets the English catalogs too
const english: Record<string, Catalog> = {}
const reported = new Set<string>()
let pseudo = false

/** Call before the first `getI18n`, e.g. `configureI18n({ pseudo: import.meta.env.VITE_PSEUDO === "1" })`. */
export function configureI18n(options: { pseudo?: boolean }) {
  pseudo = options.pseudo ?? false
  instances.clear()
}

function reportMissing(lngs: readonly string[], ns: string, key: string) {
  const id = `${ns}:${key}`
  if (reported.has(id)) return
  reported.add(id)
  console.error(`i18n: missing key ${id} for ${lngs.join(",")}`)
}

/** One instance per locale, so concurrent prerenders never share a language. */
export function getI18n(lang: unknown): i18n {
  const lng = toLocale(lang)
  const cached = instances.get(lng)
  if (cached) return cached

  const instance = i18next.createInstance()
  if (pseudo) instance.use(pseudoPostProcessor)
  void instance.init({
    lng,
    fallbackLng: DEFAULT_LOCALE,
    resources: {},
    ns: [],
    defaultNS: false,
    interpolation: { escapeValue: false },
    initAsync: false,
    saveMissing: true,
    missingKeyHandler: reportMissing,
    postProcess: pseudo ? ["pseudo"] : false,
    react: { useSuspense: false },
  })

  for (const [ns, catalog] of Object.entries(english)) {
    addBundle(instance, DEFAULT_LOCALE, ns, catalog)
  }
  instances.set(lng, instance)
  return instance
}

/** Adds catalogs to the matching instances. Safe to call again with the same data. */
export function addMessages(messages: Messages) {
  for (const [lang, namespaces] of Object.entries(messages)) {
    const target = getI18n(lang)
    for (const [ns, catalog] of Object.entries(namespaces)) {
      addBundle(target, lang, ns, catalog)
    }
    if (lang !== DEFAULT_LOCALE) continue

    Object.assign(english, namespaces)
    for (const instance of instances.values()) {
      for (const [ns, catalog] of Object.entries(namespaces)) {
        addBundle(instance, lang, ns, catalog)
      }
    }
  }
}

function addBundle(instance: i18n, lang: string, ns: string, catalog: Catalog) {
  if (!instance.hasResourceBundle(lang, ns)) {
    instance.addResourceBundle(lang, ns, catalog, true, false)
  }
}
