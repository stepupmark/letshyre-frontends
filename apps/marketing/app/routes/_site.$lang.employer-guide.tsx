import { EmployerGuidePage } from "@/features/employer-guide"
import { pageData } from "@/lib/page-data.server"
import { readingFontPreload } from "@/lib/reading-font"
import { pageMeta } from "@/lib/seo/page-meta"
import { faqSchema, webPageSchema } from "@/lib/seo/schema"
import { SITE } from "@/lib/seo/site"

import type { Route } from "./+types/_site.$lang.employer-guide"

export const loader = ({ params }: Route.LoaderArgs) =>
  pageData(params.lang, "employerGuide")

export const links: Route.LinksFunction = () => [readingFontPreload]

export const meta = pageMeta("employerGuide", ({ lang, t, path }) => [
  {
    ...webPageSchema({
      lang,
      path,
      name: t("meta.name"),
      description: t("meta.schemaDescription"),
    }),
    about: { "@id": `${SITE.url}/#organization` },
    audience: { "@type": "Audience", audienceType: t("meta.audience") },
  },
  faqSchema(t("faq.items", { returnObjects: true })),
])

export default EmployerGuidePage
