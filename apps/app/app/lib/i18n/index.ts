import {
  addMessages,
  createCatalogLoader,
  readLocaleCookie,
  writeLocaleCookie,
  type Locale,
} from "@workspace/i18n"
import type { MiddlewareFunction } from "react-router"
import catalogs from "virtual:app-catalogs"

import { env } from "../env"
import { resolveLocale } from "./resolve"

declare const __APP_LOCALES__: Locale[]

/** Locales whose every app namespace is translated; set at build time. */
export const APP_LOCALES = __APP_LOCALES__

export const locale: Locale =
  typeof document === "undefined"
    ? "en"
    : resolveLocale({
        saved: readLocaleCookie(document.cookie),
        languages: navigator.languages,
        ready: APP_LOCALES,
      })

const load = createCatalogLoader(catalogs)

/** clientMiddleware that loads a route's namespaces before it renders. */
export const namespaces =
  (ns: readonly string[]): MiddlewareFunction<Response> =>
  async (_args, next) => {
    addMessages(await load(locale, ns))
    return next()
  }

const loading = new Map<string, Promise<void>>()

/** For copy a component needs on demand, e.g. a sheet's; read it with `use()`. */
export function loadCopy(ns: string) {
  let promise = loading.get(ns)
  if (!promise) {
    promise = load(locale, [ns]).then(addMessages)
    loading.set(ns, promise)
  }
  return promise
}

/** Saves the choice for both apps. */
export function rememberLocale(next: Locale) {
  writeLocaleCookie(next, { domain: env.VITE_COOKIE_DOMAIN })
}

/** Saves the choice and reloads, so every loaded namespace switches. */
export function changeLocale(next: Locale) {
  rememberLocale(next)
  window.location.reload()
}
