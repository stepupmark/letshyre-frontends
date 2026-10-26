import { type Locale, localePath } from "@workspace/i18n"

import type { Translate } from "@/lib/seo/page-meta"
import {
  faqSchema,
  type JsonLd,
  softwareApplicationSchema,
  webPageSchema,
} from "@/lib/seo/schema"
import { absUrl } from "@/lib/seo/site"

export function homeJsonLd({
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
    softwareApplicationSchema({
      name: t("meta.name"),
      description: t("meta.schemaDescription"),
      os: "Web",
      url: absUrl(localePath(lang, path)),
    }),
    ...(Array.isArray(faq) ? [faqSchema(faq)] : []),
    webPageSchema({
      lang,
      path,
      name: t("meta.title"),
      description: t("meta.description"),
    }),
  ]
}
