import { desktopDownloadUrl } from "@workspace/api/public"
import { localePath, type Locale } from "@workspace/i18n"

import { env } from "@/lib/env"
import type { Translate } from "@/lib/seo/page-meta"
import {
  faqSchema,
  type JsonLd,
  ref,
  softwareApplicationSchema,
  webPageSchema,
} from "@/lib/seo/schema"
import { absUrl, SITE } from "@/lib/seo/site"

export function downloadJsonLd({
  lang,
  t,
  path,
}: {
  lang: Locale
  t: Translate
  path: string
}): JsonLd[] {
  const faq = t("faq.items", { returnObjects: true }) as unknown
  return [
    webPageSchema({
      lang,
      path,
      name: t("meta.name"),
      description: t("meta.schemaDescription"),
      about: ref("desktop-app"),
    }),
    // the app is called LetsHyre; meta.name is the page's name, "Download the…"
    softwareApplicationSchema({
      id: "desktop-app",
      name: SITE.name,
      description: t("meta.schemaDescription"),
      os: "Windows",
      url: absUrl(localePath(lang, path)),
      downloadUrl: desktopDownloadUrl(env.VITE_API_BASE_URL, "windows"),
    }),
    ...(Array.isArray(faq) ? [faqSchema(faq)] : []),
  ]
}
