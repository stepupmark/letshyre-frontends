import { CandidateGuidePage } from "@/features/candidate-guide"
import { pageData } from "@/lib/page-data.server"
import { pageMeta } from "@/lib/seo/page-meta"
import { faqSchema, webPageSchema } from "@/lib/seo/schema"
import { SITE } from "@/lib/seo/site"

import type { Route } from "./+types/_site.$lang.candidate-guide"

export const loader = ({ params }: Route.LoaderArgs) =>
  pageData(params.lang, "candidateGuide")

export const meta = pageMeta("candidateGuide", ({ lang, t, path }) => [
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
  faqSchema(
    Object.values(
      t("faq.items", { returnObjects: true }) as unknown as Record<
        string,
        { q: string; a: string }
      >
    )
  ),
])

export default CandidateGuidePage
