import {
  DEFAULT_LOCALE,
  type Locale,
  localePath,
  OG_LOCALE,
} from "@workspace/i18n"
import type { MetaDescriptor } from "react-router"

import { type JsonLd, organizationSchema, websiteSchema } from "./schema"
import { absUrl, SITE } from "./site"

interface MetaInput {
  lang: Locale
  /** Relative to the locale: "" or "/pricing". */
  path: string
  title: string
  description: string
  /** Locales the page is published in. Drives hreflang. */
  locales: readonly Locale[]
  og?: string
  jsonLd?: JsonLd[]
  robots?: string
}

export function buildMeta({
  lang,
  path,
  title,
  description,
  locales,
  og = "default",
  jsonLd = [],
  robots = "index, follow",
}: MetaInput): MetaDescriptor[] {
  const url = absUrl(localePath(lang, path))
  const image = absUrl(`/og/${og}.jpg`)
  const alt = `${SITE.name}: ${title}`

  return [
    { title },
    { name: "description", content: description },
    {
      name: "robots",
      content: `${robots}, max-image-preview:large, max-snippet:-1, max-video-preview:-1`,
    },
    { tagName: "link", rel: "canonical", href: url },
    ...locales.map((l) => ({
      tagName: "link",
      rel: "alternate",
      hrefLang: l,
      href: absUrl(localePath(l, path)),
    })),
    {
      tagName: "link",
      rel: "alternate",
      hrefLang: "x-default",
      href: absUrl(localePath(DEFAULT_LOCALE, path)),
    },

    { property: "og:type", content: "website" },
    { property: "og:site_name", content: SITE.name },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:url", content: url },
    { property: "og:image", content: image },
    { property: "og:image:width", content: "1024" },
    { property: "og:image:height", content: "535" },
    { property: "og:image:alt", content: alt },
    { property: "og:locale", content: OG_LOCALE[lang] },
    ...locales
      .filter((l) => l !== lang)
      .map((l) => ({ property: "og:locale:alternate", content: OG_LOCALE[l] })),

    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:site", content: SITE.twitter },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: image },
    { name: "twitter:image:alt", content: alt },

    // webPageSchema points at these by @id, which only resolves on the same page
    ...[organizationSchema(), websiteSchema(), ...jsonLd].map((schema) => ({
      "script:ld+json": schema,
    })),
  ]
}
