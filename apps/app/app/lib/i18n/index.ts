import {
  addMessages,
  createCatalogLoader,
  readLocaleCookie,
  writeLocaleCookie,
  type Catalog,
  type Locale,
} from "@workspace/i18n"
import type { MiddlewareFunction } from "react-router"

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

const load = createCatalogLoader(
  import.meta.glob<Catalog>("../../locales/*/*.json", { import: "default" })
)

/** clientMiddleware that loads a route's namespaces before it renders. */
export const namespaces =
  (ns: readonly string[]): MiddlewareFunction<Response> =>
  async (_args, next) => {
    addMessages(await load(locale, ns))
    return next()
  }

/** Saves the choice for both apps and reloads, so every loaded namespace switches. */
export function changeLocale(next: Locale) {
  writeLocaleCookie(next, { domain: env.VITE_COOKIE_DOMAIN })
  window.location.reload()
}
