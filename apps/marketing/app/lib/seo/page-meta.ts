import {
  addMessages,
  getI18n,
  type Locale,
  type Messages,
  toLocale,
} from "@workspace/i18n"
import type { MetaArgs, MetaDescriptor } from "react-router"

import { PAGES, type PageId, PREVIEW_PAGES } from "../pages"
import { buildMeta } from "./meta"
import { breadcrumbSchema, type JsonLd } from "./schema"

interface PageData {
  messages?: Messages
  locales?: Locale[]
}

/** Untyped lookup into the page namespace, for keys every page shares. */
export type Translate = (
  key: string,
  options?: Record<string, unknown>
) => string

export function collectMessages(
  matches: readonly { loaderData?: unknown }[]
): Messages {
  const messages: Messages = {}
  for (const match of matches) {
    const data = match.loaderData as PageData | undefined
    for (const [lang, namespaces] of Object.entries(data?.messages ?? {})) {
      Object.assign((messages[lang as Locale] ??= {}), namespaces)
    }
  }
  return messages
}

/** The page's locale and a translator over every catalog its route matches loaded. */
export function metaContext({
  matches,
  params,
}: Pick<MetaArgs, "matches" | "params">) {
  const lang = toLocale(params.lang)
  addMessages(collectMessages(matches))
  const i18n = getI18n(lang)
  return { lang, i18n, t: i18n.t.bind(i18n) as unknown as Translate }
}

/**
 * `meta` for a page route. Title, description and crumb come from `<ns>:meta`, so the
 * tags always match the copy on the page.
 */
export function pageMeta(
  id: PageId,
  jsonLd?: (ctx: { lang: Locale; t: Translate; path: string }) => JsonLd[]
) {
  return ({ matches, params }: MetaArgs): MetaDescriptor[] => {
    const { lang, i18n, t: tr } = metaContext({ matches, params })
    const page = PAGES[id]
    const ns = page.namespaces[0]
    const t: Translate = (key, options) => tr(`${ns}:${key}`, options)
    const locales = (matches.at(-1)?.loaderData as PageData | undefined)
      ?.locales ?? [lang]

    const crumbs = i18n.exists(`${ns}:meta.crumb`)
      ? [
          breadcrumbSchema(lang, tr("seo:homeCrumb"), [
            { name: t("meta.crumb"), path: page.path },
          ]),
        ]
      : []

    return buildMeta({
      lang,
      path: page.path,
      title: t("meta.title"),
      description: t("meta.description"),
      locales,
      og: page.og,
      robots: PREVIEW_PAGES.includes(id) ? "noindex, nofollow" : undefined,
      jsonLd: [...crumbs, ...(jsonLd?.({ lang, t, path: page.path }) ?? [])],
    })
  }
}
