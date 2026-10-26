import type { Locale } from "@workspace/i18n"

import type { Translate } from "@/lib/seo/page-meta"
import { faqSchema, type JsonLd, webPageSchema } from "@/lib/seo/schema"
import { SITE } from "@/lib/seo/site"

/** The breadcrumb comes from meta.crumb in pageMeta. */
export function pricingJsonLd({
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
    ...(Array.isArray(faq) ? [faqSchema(faq)] : []),
    {
      ...webPageSchema({
        lang,
        path,
        name: t("meta.name"),
        description: t("meta.schemaDescription"),
      }),
      about: { "@id": `${SITE.url}/#organization` },
    },
  ]
}
